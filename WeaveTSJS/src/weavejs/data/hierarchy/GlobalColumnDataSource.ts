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
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import CSVColumn = weavejs.data.column.CSVColumn;
	import EquationColumn = weavejs.data.column.EquationColumn;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IColumnReference = weavejs.api.data.IColumnReference;

	export  interface IGlobalDataSourceColumnMetadata extends IColumnMetadata
	{
		name?:string;
	}

	@Weave.classInfo({id: "weavejs.data.hierarchy", interfaces: [IDataSource]})
	export class GlobalColumnDataSource implements IDataSource
	{
		public static getInstance(root:ILinkableHashMap):IDataSource
		{
			var instance:IDataSource = GlobalColumnDataSource.map_root_instance.get(root);
			if (!instance)
				GlobalColumnDataSource.map_root_instance.set(root, instance = new GlobalColumnDataSource(root));
			return instance;
		}

		public get isLocal():boolean
		{
			return true;
		}
		
		private static /* readonly */ map_root_instance:Map<ILinkableHashMap, GlobalColumnDataSource> = new Map<ILinkableHashMap, GlobalColumnDataSource>();
		
		constructor(root:ILinkableHashMap)
		{
			this._root = root;
			Weave.linkableChild(this, root.childListCallbacks);
			
			var source:IDataSource = this;
			this._rootNode = new ColumnTreeNode({
				dataSource: source,
				label: () => this.getLabel,
				hasChildBranches: false,
				children: ():ColumnTreeNode[] => {
					return this.getGlobalColumns().map((column:IAttributeColumn):ColumnTreeNode => {
						Weave.linkableChild(source, column);
						return this.createColumnNode(root.getName(column));
					});
				}
			});
		}
		
		
		public getLabel():string
		{
			return this._root.getObjects(CSVColumn).length
				?	Weave.lang('Generated columns')
				:	Weave.lang('Equations');
		}
		
		/**
		 * The metadata property name used to identify a column appearing in root.
		 */
		public static /* readonly */ NAME:string = 'name';
		
		private _root:ILinkableHashMap;
		
		private _rootNode:ColumnTreeNode;
		
		private getGlobalColumns():(CSVColumn|EquationColumn)[]
		{
			var csvColumns:CSVColumn[] = this._root.getObjects(CSVColumn);
			var equationColumns:EquationColumn[] = this._root.getObjects(EquationColumn);
			return (equationColumns as (CSVColumn|EquationColumn)[]).concat(csvColumns);
		}
		
		private createColumnNode(name:string):ColumnTreeNode
		{
			var column:IAttributeColumn = this.generateNewAttributeColumn(name);
			if (!column)
				return null;
			
			var meta:IGlobalDataSourceColumnMetadata = {};
			meta.name = name;
			return new ColumnTreeNode({
				dataSource: this,
				dependency: column,
				label: ():string => {
					return column.getMetadata(ColumnMetadata.TITLE);
				},
				data: meta,
				idFields: [GlobalColumnDataSource.NAME]
			});
		}
		
		public get hierarchyRefresh():ICallbackCollection
		{
			return Weave.getCallbacks(this);
		}
		
		public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			return this._rootNode;
		}
		
		public findHierarchyNode(metadata:IGlobalDataSourceColumnMetadata):IWeaveTreeNode&IColumnReference
		{
			var column:IAttributeColumn = this.generateNewAttributeColumn(metadata);
			if (!column)
				return null;
			var name:string = this._root.getName(column);
			var node:ColumnTreeNode = this.createColumnNode(name);
			var path = this._rootNode.findPathToNode(node);
			if (path)
				return path[path.length - 1];
			return null;
		}
		
		public generateNewAttributeColumn(metadata:IGlobalDataSourceColumnMetadata|string):IAttributeColumn
		{
			if (!metadata)
				return null;
			var name:string;
			if (typeof metadata == 'object')
				name = (metadata as IGlobalDataSourceColumnMetadata).name;
			else
				name = Weave.AS(metadata as string, String) as string;
			return Weave.AS(this._root.getObject(name), IAttributeColumn);
		}
	}
}
