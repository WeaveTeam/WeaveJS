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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import EquationColumnLib = weavejs.data.EquationColumnLib;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import StandardLib = weavejs.util.StandardLib;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;

	/**
	 * AlwaysDefinedColumn
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column", interfaces: [IAttributeColumn, IColumnWrapper, ICallbackCollection]})
	export class AlwaysDefinedColumn extends ExtendedDynamicColumn
	{
		constructor(defaultValue:any = undefined, defaultValueVerifier:(value:any)=>boolean = null)
		{
			super();
			this._defaultValue = new LinkableVariable(null, defaultValueVerifier, defaultValue);
			Weave.linkableChild(this, this._defaultValue, this.handleDefaultValueChange);
		}

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return true;
		}
		
		/**
		 * This sessioned property contains the default value to be returned
		 * when the referenced column does not define a value for a given key.
		 */
		private _defaultValue:LinkableVariable;
		public get defaultValue():LinkableVariable
		{
			return this._defaultValue;
		}

		private handleDefaultValueChange():void
		{
			this._cachedDefaultValue = this.defaultValue.state;
		}
		private _cachedDefaultValue:any;
		
		private d2d_type_key:Dictionary2D<GenericClass, IQualifiedKey, any>  = new Dictionary2D<GenericClass, IQualifiedKey, any>(true, true);
		private _cacheCounter:int = 0;
		private static /*readonly*/ UNDEFINED:Object = {};
		
		/**
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (!dataType)
				dataType = Array;
			if (!DynamicColumn.cache)
			{
				var value:any = this.internalDynamicColumn.getValueFromKey(key, dataType);
				
				if (StandardLib.isUndefined(value, true))
					value = EquationColumnLib.cast(this._cachedDefaultValue, dataType);
				
				return value;
			}
			
			if (this.triggerCounter != this._cacheCounter)
			{
				this._cacheCounter = this.triggerCounter;
				this.d2d_type_key = new Dictionary2D<GenericClass, IQualifiedKey, any>(true, true);
			}
			
			value = this.d2d_type_key.get(dataType, key);
			if (value === undefined)
			{
				value = this.internalDynamicColumn.getValueFromKey(key, dataType);
				
				if (StandardLib.isUndefined(value, true))
					value = EquationColumnLib.cast(this._cachedDefaultValue, dataType);
				
				this.d2d_type_key.set(dataType, key, value === undefined ? AlwaysDefinedColumn.UNDEFINED : value);
			}
			return value === AlwaysDefinedColumn.UNDEFINED ? undefined : value;
		}
	}
}
