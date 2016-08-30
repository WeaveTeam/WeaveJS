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
	import GeoJSON = weavejs.geom.GeoJSON;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import AsyncSort = weavejs.util.AsyncSort;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;

	export class GeoJSONDataSourceData
	{
		constructor(obj:any, keyType:string, keyPropertyName:string)
		{
			// get projection
			var crs:any = obj[GeoJSON.P_CRS];
			if (crs && crs[GeoJSON.P_TYPE] == GeoJSON.CRS_T_NAME)
				this.projection = GeoJSON.getProjectionFromURN(crs[GeoJSON.CRS_P_PROPERTIES][GeoJSON.CRS_N_P_NAME]);
			
			// get features
			var featureCollection:{[key:string]:any} = GeoJSON.asFeatureCollection(obj);
			var features:Object[] = featureCollection[GeoJSON.FC_P_FEATURES];
			
			// save data from features
			this.ids = ArrayUtils.pluck(features, GeoJSON.F_P_ID);
			this.geometries = ArrayUtils.pluck(features, GeoJSON.F_P_GEOMETRY);
			this.properties = ArrayUtils.pluck(features, GeoJSON.F_P_PROPERTIES);
			
			// if there are no ids, use index values
			if (this.ids.every((item, i, a) => { return item === undefined; }))
				this.ids = features.map(function(o:any, i:any, a:any):any { return i; });
			
			// get property names and determine types
			this.propertyNames = [];
			this.propertyTypes = {};
			this.properties.forEach(function(props:{[key:string]:any}, i:any, a:any):void {
				for (var key in props)
				{
					var value:Object = props[key];
					// don't let null affect type
					if (value == null)
						continue;
					
					var oldType:String = this.propertyTypes[key];
					var newType:String = typeof value;
					if (!this.propertyTypes.hasOwnProperty(key))
					{
						this.propertyTypes[key] = newType;
						this.propertyNames.push(key);
					}
					else if (oldType != newType)
					{
						// adjust type
						this.propertyTypes[key] = 'object';
					}
				}
			}, this);
			AsyncSort.sortImmediately(this.propertyNames);
			
			this.resetQKeys(keyType, keyPropertyName);
		}
		
		/**
		 * The projection specified in the GeoJSON object.
		 */
		public projection:string = null;
		
		/**
		 * An Array of "id" values corresponding to the GeoJSON features.
		 */
		public ids:string[] = null;
		
		/**
		 * An Array of "geometry" objects corresponding to the GeoJSON features.
		 */
		public geometries:any[] = null;
		
		/**
		 * An Array of "properties" objects corresponding to the GeoJSON features.
		 */
		public properties:{[key:string]: string}[] = null;
		
		/**
		 * A list of property names found in the jsonProperties objects.
		 */
		public propertyNames:string[] = null;
		
		/**
		 * propertyName -> typeof
		 */
		public propertyTypes:{[key:string]: string} = null;
		
		/**
		 * An Array of IQualifiedKey objects corresponding to the GeoJSON features.
		 * This can be reinitialized via resetQKeys().
		 */
		public qkeys:IQualifiedKey[] = null;
		
		/**
		 * Updates the qkeys Vector using the given keyType and property values under the given property name.
		 * If the property name is not found, index values will be used.
		 * @param keyType The keyType of each IQualifiedKey.
		 * @param propertyName The name of a property in the propertyNames Array.
		 */
		public resetQKeys(keyType:string, propertyName:string):void
		{
			var values:any[] = this.ids;
			if (propertyName && this.propertyNames.indexOf(propertyName) >= 0)
				values = ArrayUtils.pluck(this.properties, propertyName);
			
			this.qkeys = WeaveAPI.QKeyManager.getQKeys(keyType, values);
		}
	}
}
