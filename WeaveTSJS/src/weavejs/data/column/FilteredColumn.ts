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

namespace weavejs.data.column
{
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import EquationColumnLib = weavejs.data.EquationColumnLib;
	import FilteredKeySet = weavejs.data.key.FilteredKeySet;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	
	/**
	 * FilteredColumn
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.FilteredColumn", interfaces: [IColumnWrapper, IAttributeColumn, ICallbackCollection]})
	export class FilteredColumn extends ExtendedDynamicColumn
	{
		constructor()
		{
			super();
			this._filteredKeySet.setSingleKeySource(this.internalDynamicColumn);
		}
		
		/**
		 * This is private because it doesn't need to appear in the session state -- keys are returned by the "get keys()" accessor function
		 */		
		private _filteredKeySet:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);
		
		/**
		 * This is the dynamically created filter that filters the keys in the column.
		 */		
		public /* readonly */ filter:IDynamicKeyFilter = Weave.linkableChild(this, this._filteredKeySet.keyFilter);
		
		/**
		 * This stores the filtered keys
		 */		
		private _keys:IQualifiedKey[];
		
		/* override */ public get keys():IQualifiedKey[]
		{
			// also make internal column request because it may trigger callbacks
			if (this.internalDynamicColumn.keys)
				return this._filteredKeySet.keys;
			return [];
		}
		
		/**
		 * The filter removes certain records from the column.  This function will return false if the key is not contained in the filter.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			// also make internal column request because it may trigger callbacks
			this.internalDynamicColumn.containsKey(key);
			return this._filteredKeySet.containsKey(key);
		}

		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			var column:IAttributeColumn = this.internalDynamicColumn.getInternalColumn();
			var keyFilter:IKeyFilter = this.filter.getInternalKeyFilter();
			if (column)
			{
				// always make internal column request because it may trigger callbacks
				var value:any = column.getValueFromKey(key, dataType);
				if (!keyFilter || keyFilter.containsKey(key))
					return value;
			}
			
			if (dataType)
				return EquationColumnLib.cast(undefined, dataType);
			
			return undefined;
		}
	}
}
