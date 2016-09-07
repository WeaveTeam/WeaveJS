/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.data.hierarchy
{
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ColumnMetadata = weavejs.api.data.ColumnMetadata;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import Entity = weavejs.api.net.beans.Entity;
	import EntityCache = weavejs.net.EntityCache;
    import JS = weavejs.util.JS;
    import StandardLib = weavejs.util.StandardLib;

	@Weave.classInfo({id: 'weavejs.data.hierarchy.EntityNodeSearch'})
    export class EntityNodeSearch implements ILinkableObject
    {
		private _includeAllDescendants:boolean = true;
		private _searchField:string = ColumnMetadata.TITLE; // the field to search
		private _searchString:string = ''; // the search string containing ?* wildcards
		private _searchRegExp:RegExp = null; // used for local comparisons
		
		private _entityCacheSearchResults:WeakMap<EntityCache, SearchResults> = new WeakMap<EntityCache, SearchResults>(); // EntityCache -> SearchResults
		
		/**
		 * Set this to true to include all descendants of matching nodes
		 * whether or not the descendants also matched the search.
		 */
		public get includeAllDescendants():boolean
		{
			return this._includeAllDescendants;
		}
		public set includeAllDescendants(value:boolean)
		{
			if (this._includeAllDescendants != value)
			{
				this._includeAllDescendants = value;
				Weave.getCallbacks(this).triggerCallbacks();
			}
		}
		
		/**
		 * The public metadata field used for searching.
		 * @default "title"
		 */
		public get searchField():string
		{
			return this._searchField;
		}
		public set searchField(value:string)
		{
			value = value || '';
			if (this._searchField != value)
			{
				this._searchField = value;
				Weave.getCallbacks(this).triggerCallbacks();
			}
		}
		
		/**
		 * The search string, which may contain '*' and '?' wildcards.
		 */
		public get searchString():string
		{
			return this._searchString;
		}
		public set searchString(value:string)
		{
			if (!value || StandardLib.replace(value, '?', '', '*', '') == '')
				value = '';
			if (this._searchString != value)
			{
				this._searchString = value;
				this._searchRegExp = EntityNodeSearch.strToRegExp(value);
				Weave.getCallbacks(this).triggerCallbacks();
			}
		}
		
		/**
		 * Use this as the nodeFilter in a WeaveTree.
		 * @param node The node to test.
		 * @see weave.ui.WeaveTree#nodeFilter
		 */
		public nodeFilter(node:IWeaveTreeNode):boolean
		{
			if (!this._searchField || !this._searchString)
				return true;
			
			var lookup:uint;
			
			var en:EntityNode = Weave.AS(node, EntityNode);
			if (en)
			{
				var cache:EntityCache = en.getEntityCache();
				var results:SearchResults = this._entityCacheSearchResults.get(cache);
				if (!results)
					this._entityCacheSearchResults.set(cache, results = new SearchResults());
				
				// invoke remote search if params changed
				if (results.searchField != this._searchField || results.searchString != this._searchString)
					results.remoteSearch(this, cache);
				
				// if cache updated, rebuild idLookup
				if (Weave.detectChange(results, cache))
					results.rebuildLookup(cache);
				
				// The idLookup determines whether or not we want to include this EntityNode.
				lookup = results.idLookup[en.id];
				return !!(lookup & SearchResults.LOOKUP_MATCH_OR_ANCESTOR)
					|| !!(this._includeAllDescendants && (lookup & SearchResults.LOOKUP_DESCENDANT));
			}
			
			// see if the title matches
			if (this._searchField == ColumnMetadata.TITLE && this._searchRegExp.test(node.getLabel()))
				return true;

			// see if there are any matching descendants
			if (!node.isBranch())
				return false;
			var children = node.getChildren();
			if (children && children.filter(this.arrayFilter).length)
				return true;
			return false;
		}
		
		private arrayFilter(node:IWeaveTreeNode, i:int, a:IWeaveTreeNode[]):boolean
		{
			return this.nodeFilter(node);
		}
		
		/**
		 * Surrounds a string with '*' and replaces ' ' with '*'
		 */
		public static replaceSpacesWithWildcards(searchString:string):string
		{
			return StandardLib.replace('*' + searchString + '*', ' ', '*');
		}
		
		/**
		 * Generates a RegExp that matches a search string using '?' and '*' wildcards.
		 */
		public static strToRegExp(searchString:string, flags:string = "i"):RegExp
		{
			var resultStr:string;
			//excape metacharacters other than "*" and "?"
			resultStr = searchString.replace(/[\^\$\\\.\+\(\)\[\]\{\}\|]/g, "\\$&");
			//replace strToSrch "?" with reg exp equivalent "."
			resultStr = resultStr.replace(/[\?]/g, ".");
			//replace strToSrch "*" with reg exp equivalent ".*?"
			resultStr = resultStr.replace(/[\*]/g, ".*?");
			return new RegExp("^" + resultStr + "$", flags);
		}
    }

    @Weave.classInfo({id: 'weavejs.data.hierarchy.SearchResults'})
	class SearchResults
	{
		/**
		 * Usage: if (idLookup[id] & LOOKUP_MATCH_OR_ANCESTOR) ...
		 */
		public static /* readonly */ LOOKUP_MATCH_OR_ANCESTOR:uint = 1;
		/**
		 * Usage: if (idLookup[id] & LOOKUP_DESCENDANT) ...
		 */
		public static /* readonly */ LOOKUP_DESCENDANT:uint = 2;
		/**
		 * Usage: if (idLookup[id] & LOOKUP_VISITED) ...
		 */
		public static /* readonly */ LOOKUP_VISITED:uint = 4;

		/**
		 * The value of searchField from the last time remoteSearch() was called
		 */
		public searchField:string;
		/**
		 * The value of searchString from the last time remoteSearch() was called
		 */
		public searchString:string;
		/**
		 * Entity IDs which matched the search.
		 */
		public ids:number[] = [];
		/**
		 * entity id -> nonzero if it should be included in the tree
		 */
		public idLookup:{[id:number]:any} = {};

		/**
		 * Invokes RPC for search.
		 */
		public remoteSearch(ens:EntityNodeSearch, cache:EntityCache):void
		{
			this.searchField = ens.searchField;
			this.searchString = ens.searchString;
			this.ids = [];
			this.idLookup = {};
			var query:{[key:string]:string} = {};
			query[this.searchField] = this.searchString;
			cache.getService().findEntityIds(query, [this.searchField]).then(this.handleSearchResults.bind(this, ens, cache));
		}

		private handleSearchResults(ens:EntityNodeSearch, cache:EntityCache, newIds:number[]):void
		{
			// ignore outdated results
			if (this.searchField != ens.searchField || this.searchString != ens.searchString)
				return;

			if (Weave.wasDisposed(ens) || Weave.wasDisposed(cache))
				return;

			if (StandardLib.compare(this.ids, newIds))
			{
				this.ids = newIds;
				this.rebuildLookup(cache);
				Weave.getCallbacks(ens).triggerCallbacks();
			}
		}

		/**
		 * Rebuilds the idLookup object.
		 */
		public rebuildLookup(cache:EntityCache):void
		{
			this.idLookup = {};
			this._tempCache = cache;
			this.ids.forEach(this.includeAncestors.bind(this));
			this.ids.forEach(this.includeDescendants.bind(this));
			this._tempCache = null;

			// as long as there is at least one id in the lookup, include the root node.
			for (var id in this.idLookup)
			{
				this.idLookup[EntityCache.ROOT_ID] = SearchResults.LOOKUP_MATCH_OR_ANCESTOR;
				break;
			}
		}
		private _tempCache:EntityCache; // temporary variable used by includeAncestors() and includeDescendants()
		private includeAncestors(id:int):void
		{
			if (this.idLookup[id] & SearchResults.LOOKUP_MATCH_OR_ANCESTOR)
				return;
			this.idLookup[id] |= SearchResults.LOOKUP_MATCH_OR_ANCESTOR;
			var entity:Entity = this._tempCache.getEntity(id);
			if (entity.parentIds)
				entity.parentIds.forEach(this.includeAncestors);
		}
		private includeDescendants(id:int):void
		{
			if (this.idLookup[id] & SearchResults.LOOKUP_DESCENDANT)
				return;
			this.idLookup[id] |= SearchResults.LOOKUP_DESCENDANT;
			var entity:Entity = this._tempCache.getEntity(id);
			if (entity.childIds)
				entity.childIds.forEach(this.includeDescendants);
		}
	}
}

