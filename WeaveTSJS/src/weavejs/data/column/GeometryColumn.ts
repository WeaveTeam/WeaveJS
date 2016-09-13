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
	import IBaseColumn = weavejs.api.data.IBaseColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;

	/**
	 * The values in this column are Arrays of GeneralizedGeometry objects.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.GeometryColumn", interfaces: [IAttributeColumn, ICallbackCollection, IBaseColumn]})
	export class GeometryColumn extends AbstractAttributeColumn implements IBaseColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
		}
		
		/**
		 * This object maps a key to an array of geometry objects that have that key.
		 */
		private map_key_geomArray:WeakMap<IQualifiedKey, GeneralizedGeometry[]> = new WeakMap<IQualifiedKey, GeneralizedGeometry[]>();
		
		/**
		 * This vector maps an index value to a GeneralizedGeometry object.
		 */
		private _geometryVector:GeneralizedGeometry[] = [];
		
		/**
		 * This maps a GeneralizedGeometry object to its index in _geometryVector.
		 */
		private _geometryToIndexMapping:WeakMap<GeneralizedGeometry, int> = new WeakMap<GeneralizedGeometry, int>();
		
		protected _uniqueKeys:IQualifiedKey[] = [];
		
		/**
		 * This is a list of unique keys this column defines values for.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			return this._uniqueKeys;
		}

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return this.map_key_geomArray.has(key);
		}

		public setRecords(keys:IQualifiedKey[], geometries:GeneralizedGeometry[]):void
		{
			if (this._geometryVector.length > 0)
			{
				// clear existing mappings
				this.map_key_geomArray = new WeakMap<IQualifiedKey, GeneralizedGeometry[]>();
				this._geometryToIndexMapping = new WeakMap<GeneralizedGeometry, int>();
			}
			
			if (keys.length != geometries.length)
			{
				console.error("number of keys does not match number of geometires in GeometryColumn.setGeometries()");
				return;
			}
			
			// make a copy of the geometry vector and 
			// create key->geom and geom->index mappings
			var geom:GeneralizedGeometry;
			var key:IQualifiedKey;
			var uniqueKeyIndex:int = 0;
			for (var geomIndex:int = 0; geomIndex < geometries.length; geomIndex++)
			{
				geom = Weave.AS(geometries[geomIndex], GeneralizedGeometry) ;
				key = Weave.AS(keys[geomIndex], IQualifiedKey);
				this._geometryVector[geomIndex] = geom;
				if (!this.map_key_geomArray.has(key))
				{
					this.map_key_geomArray.set(key, [geom]);
					this._uniqueKeys[uniqueKeyIndex] = key; // remember unique keys
					uniqueKeyIndex++;
				}
				else
					(Weave.AS(this.map_key_geomArray.get(key), Array) as GeneralizedGeometry[]).push(geom);
				this._geometryToIndexMapping.set(geom, geomIndex);
			}
			// trim vectors to new sizes
			this._geometryVector.length = geometries.length;
			this._uniqueKeys.length = uniqueKeyIndex;
			
			this.triggerCallbacks();
		}
		
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass=null):any
		{
			var value:any = this.map_key_geomArray.get(key);
			
			// cast to different types
			if (dataType == Boolean)
				value = Weave.IS(value, Array);
			else if (dataType == Number)
			{
				var sum:number = Weave.IS(value, Array) ? 0 : NaN;
				for (var geom of value || [])
					sum += geom.bounds.getArea();
				value = sum;
			}
			else if (dataType == String)
				value = value ? 'Geometry(' + key.keyType + '#' + key.localName + ')' : undefined;
			
			return value;
		}
	}
}
