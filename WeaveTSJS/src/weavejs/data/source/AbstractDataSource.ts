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

namespace weavejs.data.source
{
	import WeaveAPI = weavejs.WeaveAPI;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableString = weavejs.core.LinkableString;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	
	/**
	 * This is a base class to make it easier to develope a new class that implements IDataSource.
	 * Classes that extend AbstractDataSource should implement the following methods:
	 * getHierarchyRoot, generateHierarchyNode, requestColumnFromSource 
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.source.AbstractDataSource", interfaces: [IDataSource, IDisposableObject]})
	export class AbstractDataSource implements IDataSource, IDisposableObject
	{
		public constructor()
		{
			var cc:ICallbackCollection = Weave.getCallbacks(this);
			cc.addImmediateCallback(this, this.uninitialize);
			cc.addGroupedCallback(this, this.initialize, true, false);
		}
		
		/**
		 * Overrides root hierarchy label.
		 */
		public /* readonly */ label:LinkableString = Weave.linkableChild(this, LinkableString);
		
		public getLabel():string
		{
			if (this.label.value)
				return this.label.value;
			var root:ILinkableHashMap = Weave.getRoot(this);
			if (root)
				return root.getName(this);
			return null;
		}

		public get isLocal():boolean
		{
			return false;
		}

		/**
		 * This variable is set to false when the session state changes and true when initialize() is called.
		 */
		protected _initializeCalled:boolean = false;
		
		/**
		 * This should be used to keep a pointer to the hierarchy root node.
		 */
		protected _rootNode:IWeaveTreeNode & IColumnReference;
		
		/**
		 * ProxyColumn -> (true if pending, false if not pending)
		 */
		protected map_proxyColumn_pending = new Map<ProxyColumn, boolean>()
		
		private _hierarchyRefresh:ICallbackCollection = Weave.linkableChild(this, CallbackCollection, this.refreshHierarchy);
		
		public get hierarchyRefresh():ICallbackCollection
		{
			return this._hierarchyRefresh;
		}
		
		/**
		 * Sets _rootNode to null and triggers callbacks.
		 * @inheritDoc
		 */
		protected refreshHierarchy():void
		{
			this._rootNode = null;
		}
		
		/**
		 * This function must be implemented by classes that extend AbstractDataSource.
		 * This function should set _rootNode if it is null, which may happen from calling refreshHierarchy().
		 * @inheritDoc
		 */
		/* abstract */ public getHierarchyRoot():IWeaveTreeNode & IColumnReference
		{
			return this._rootNode;
		}

		/**
		 * This function must be implemented by classes that extend AbstractDataSource.
		 * This function should make a request to the source to fill in the proxy column.
		 * @param proxyColumn Contains metadata for the column request and will be used to store column data when it is ready.
		 */
		/* abstract */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void { }

		/**
		 * This function must be implemented by classes that extend AbstractDataSource.
		 * @param metadata A set of metadata that may identify a column in this IDataSource.
		 * @return A node that contains the metadata.
		 */
		/* abstract */ protected generateHierarchyNode(metadata:IColumnMetadata):IWeaveTreeNode&IColumnReference { return null; }
		
		/**
		 * Classes that extend AbstractDataSource can define their own replacement for this function.
		 * All column requests will be delayed as long as this accessor function returns false.
		 * The default behavior is to return false during the time between a change in the session state and when initialize() is called.
		 */		
		protected get initializationComplete():boolean
		{
			return this._initializeCalled;
		}

		/**
		 * This function is called as an immediate callback and sets initialized to false.
		 */
		protected uninitialize():void
		{
			this._initializeCalled = false;
		}
		
		/**
		 * This function will be called as a grouped callback the frame after the session state for the data source changes.
		 * When overriding this function, super.initialize() should be called.
		 */
		protected initialize(forceRefresh:boolean = false):void
		{
			// set initialized to true so other parts of the code know if this function has been called.
			this._initializeCalled = true;
			if (forceRefresh)
				this.refreshAllProxyColumns(this.initializationComplete);
			else
				this.handleAllPendingColumnRequests(this.initializationComplete);
		}
		
		/**
		 * The default implementation of this function calls generateHierarchyNode(metadata) and
		 * then traverses the _rootNode to find a matching node.
		 * This function should be overridden if the hierachy is not known completely, since this
		 * may result in traversing the entire hierarchy, causing many remote procedure calls if
		 * the hierarchy is stored remotely.
		 */
		public findHierarchyNode(metadata:Object):IWeaveTreeNode & IColumnReference
		{
			var path = HierarchyUtils.findPathToNode(this.getHierarchyRoot(), this.generateHierarchyNode(metadata));
			if (path)
				return path[path.length - 1] as IWeaveTreeNode & IColumnReference;
			return null;
		}
		
		/**
		 * This function creates a new ProxyColumn object corresponding to the metadata and queues up the request for the column.
		 * @param metadata An object that contains all the information required to request the column from this IDataSource. 
		 * @return A ProxyColumn object that will be updated when the column data is ready.
		 */
		public generateNewAttributeColumn(metadata:IColumnMetadata):IAttributeColumn
		{
			var proxyColumn:ProxyColumn = Weave.disposableChild(this, ProxyColumn);
			proxyColumn.setMetadata(metadata);
			var name:string = this.getLabel() || Weave.className(this).split('.').pop();
			var description:string = name + " pending column request";
			WeaveAPI.ProgressIndicator.addTask(proxyColumn, this, description);
			WeaveAPI.ProgressIndicator.addTask(proxyColumn, proxyColumn, description);
			this.handlePendingColumnRequest(proxyColumn);
			return proxyColumn;
		}
		
		/**
		 * This function will call requestColumnFromSource() if initializationComplete==true.
		 * Otherwise, it will delay the column request again.
		 * This function may be overridden by classes that extend AbstractDataSource.
		 * However, if the extending class decides it wants to call requestColumnFromSource()
		 * for the pending column, it is recommended to call super.handlePendingColumnRequest() instead.
		 * @param request The request that needs to be handled.
		 */
		protected handlePendingColumnRequest(column:ProxyColumn, forced:boolean = false):void
		{
			// If data source is already initialized (session state is stable, not currently changing), we can request the column now.
			// Otherwise, we have to wait.
			if (this.initializationComplete || forced)
			{
				this.map_proxyColumn_pending.set(column, false); // no longer pending
				WeaveAPI.ProgressIndicator.removeTask(column);
				this.requestColumnFromSource(column);
			}
			else
			{
				this.map_proxyColumn_pending.set(column, true); // pending
			}
		}
		
		/**
		 * This function will call handlePendingColumnRequest() on each pending column request.
		 */
		protected handleAllPendingColumnRequests(forced:boolean = false):void
		{
			var cols = JS.mapKeys(this.map_proxyColumn_pending);
			for (var proxyColumn of cols)
				if (this.map_proxyColumn_pending.get(proxyColumn)) // pending?
					this.handlePendingColumnRequest(proxyColumn, forced);
		}
		
		/**
		 * Calls requestColumnFromSource() on all ProxyColumn objects created previously via generateNewAttributeColumn().
		 */
		protected refreshAllProxyColumns(forced:boolean = false):void
		{
			var cols = JS.mapKeys(this.map_proxyColumn_pending);
			for (var proxyColumn of cols)
				this.handlePendingColumnRequest(proxyColumn, forced);
		}
		
		/**
		 * This function should be called when the IDataSource is no longer in use.
		 * All existing pointers to objects should be set to null so they can be garbage collected.
		 */
		public dispose():void
		{
			var cols = JS.mapKeys(this.map_proxyColumn_pending);
			for (var column of cols)
				WeaveAPI.ProgressIndicator.removeTask(column);
			this._initializeCalled = false;
			this.map_proxyColumn_pending = null;
		}
	}
}
