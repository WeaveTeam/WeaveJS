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

namespace weavejs.geom
{
	import StandardLib = weavejs.util.StandardLib;
	import GeoJsonObject = GeoJSON.GeoJsonObject;
	import Feature = GeoJSON.Feature;
	import FeatureCollection = GeoJSON.FeatureCollection;
	import GeometryObject = GeoJSON.GeometryObject;
	import GeometryCollection = GeoJSON.GeometryCollection;
	import Position = GeoJSON.Position;
	import LineString = GeoJSON.LineString;
	import CoordinateReferenceSystem = GeoJSON.CoordinateReferenceSystem;
	import NamedCoordinateReferenceSystem = GeoJSON.NamedCoordinateReferenceSystem;
	import LinkedCoordinateReferenceSystem = GeoJSON.LinkedCoordinateReferenceSystem;

	export class GeoJSON
	{

		public static /* readonly */ CRS_T_NAME:'name' = 'name';
		public static /* readonly */ CRS_T_LINK:'link' = 'link';
		// GeoJSON object types
		public static /* readonly */ T_POINT:'Point' = 'Point';
		public static /* readonly */ T_MULTI_POINT:'MultiPoint' = 'MultiPoint';
		public static /* readonly */ T_LINE_STRING:'LineString' = 'LineString';
		public static /* readonly */ T_MULTI_LINE_STRING:'MultiLineString' = 'MultiLineString';
		public static /* readonly */ T_POLYGON:'Polygon' = 'Polygon';
		public static /* readonly */ T_MULTI_POLYGON:'MultiPolygon' = 'MultiPolygon';
		public static /* readonly */ T_GEOMETRY_COLLECTION:'GeometryCollection' = 'GeometryCollection';
		public static /* readonly */ T_FEATURE:'Feature' = 'Feature';
		public static /* readonly */ T_FEATURE_COLLECTION:'FeatureCollection' = 'FeatureCollection';

		//-------------------------------------------------------------------------------------------

		public static isGeoJSONObject(obj:GeoJsonObject):boolean
		{
			return GeoJSON.isFeatureObject(obj as Feature<any>)
				|| GeoJSON.isFeatureCollectionObject(obj as FeatureCollection<any>)
				|| GeoJSON.isGeometryObject(obj as GeometryObject);
		}
		private static couldBeGeoJSONObject(obj:GeoJsonObject):boolean
		{
			return obj
				&& obj.type
				&& (!obj.crs || GeoJSON.isCRSObject(obj.crs))
				&& (!obj.bbox || GeoJSON.isBBOXObject(obj.bbox));
		}
		public static isFeatureObject(obj:Feature<any>):boolean
		{
			return GeoJSON.couldBeGeoJSONObject(obj)
				&& obj.type == GeoJSON.T_FEATURE
				&& obj.geometry
				&& (obj.geometry === null || GeoJSON.isGeometryObject(obj.geometry))
				&& obj.properties
				&& typeof obj.properties == 'object';
		}
		public static isFeatureCollectionObject(obj:FeatureCollection<any>):boolean
		{
			return GeoJSON.couldBeGeoJSONObject(obj)
				&& obj.type == GeoJSON.T_FEATURE_COLLECTION
				&& obj.features
				&& Weave.IS(obj.features, Array)
				&& obj.features.every(GeoJSON.isFeatureObject);
		}
		public static isGeometryObject(obj:GeometryObject|GeometryCollection):boolean
		{
			if (!GeoJSON.couldBeGeoJSONObject(obj))
				return false;

			var coords = (obj as GeometryObject).coordinates || null;

			switch (obj.type)
			{
				case GeoJSON.T_POINT:
					return GeoJSON.isPositionCoords(coords);
				case GeoJSON.T_MULTI_POINT:
					return coords && coords.every(GeoJSON.isPositionCoords);
				case GeoJSON.T_LINE_STRING:
					return GeoJSON.isLineStringCoords(coords);
				case GeoJSON.T_MULTI_LINE_STRING:
					return coords && coords.every(GeoJSON.isLineStringCoords);
				case GeoJSON.T_POLYGON:
					return GeoJSON.isPolygonCoords(coords);
				case GeoJSON.T_MULTI_POLYGON:
					return coords && coords.every(GeoJSON.isPolygonCoords);
				case GeoJSON.T_GEOMETRY_COLLECTION:
					return GeoJSON.isGeometryCollectionObject(obj as GeometryCollection);
				default:
					return false;
			}
		}
		private static isGeometryCollectionObject(obj:GeometryCollection):boolean
		{
			return GeoJSON.couldBeGeoJSONObject(obj)
				&& obj.geometries
				&& Weave.IS(obj, Array)
				&& obj.geometries.every(GeoJSON.isGeometryObject);
		}
		private static isPositionCoords(coords:Position):boolean
		{
			return coords
				&& coords.length >= 2
				&& StandardLib.getArrayType(coords) == Number;
		}
		private static isLineStringCoords(coords:Position[]):boolean
		{
			return coords
				&& coords.length >= 2
				&& coords.every(GeoJSON.isPositionCoords);
		}
		private static isLinearRingCoords(coords:Position[]):boolean
		{
			return coords
				&& coords.length >= 4
				&& coords.every(GeoJSON.isPositionCoords)
				&& StandardLib.compare(coords[0], coords[coords.length - 1]) == 0;
		}
		private static isPolygonCoords(coords:Position[][]):boolean
		{
			return coords
				&& coords.every(GeoJSON.isLinearRingCoords);
		}
		private static isCRSObject(obj:CoordinateReferenceSystem):boolean
		{
			// null CRS is valid
			if (obj == null)
				return true;

			// check for required properties
			if (!obj.type || !obj.properties)
				return false;

			var props:{name:string}|{href:string, type:string};
			switch (obj.type)
			{
				case GeoJSON.CRS_T_NAME:
					props  = (obj as NamedCoordinateReferenceSystem).properties;
					return props
						&& (props as {name:string}).name
						&& Weave.IS((props as {name:string}).name, String);
				case GeoJSON.CRS_T_LINK:
					props = (obj as LinkedCoordinateReferenceSystem).properties;
					return props
						&& (props as {href:string, type:string}).href
						&& Weave.IS((props as {href:string, type:string}).href, String)
						&& !(props as {href:string, type:string}).type || Weave.IS((props as {href:string, type:string}).type, String);
				default:
					return false;
			}
		}
		private static isBBOXObject(obj:number[]):boolean
		{
			return StandardLib.getArrayType(obj) == Number
				&& obj.length >= 4
				&& obj.length % 2 == 0;
		}

		//-------------------------------------------------------------------------------------------

		/**
		 * Wraps a GeoJSON object in a GeoJSON FeatureCollection object if it isn't one already.
		 * @param obj A GeoJSON object.
		 * @return A GeoJSON FeatureCollection object.
		 */
		public static asFeatureCollection(obj:GeoJsonObject|GeometryCollection):FeatureCollection<any>
		{
			// feature collection
			if (GeoJSON.isFeatureCollectionObject(obj as FeatureCollection<any>))
				return obj as FeatureCollection<any>;

			var features:Feature<any>[] = null;

			// single feature
			if (GeoJSON.isFeatureObject(obj as Feature<any>))
				features = [obj as Feature<any>];

			// geometry collection
			if (GeoJSON.isGeometryCollectionObject(obj as GeometryCollection))
				features = (obj as GeometryCollection).geometries.map(GeoJSON.geometryAsFeature);

			// single geometry
			if (GeoJSON.isGeometryObject(obj as GeometryObject))
				features = [GeoJSON.geometryAsFeature(obj as GeometryObject)];

			var featureCollection:FeatureCollection<any> = {
				type: GeoJSON.T_FEATURE_COLLECTION,
				features: features || [] as Feature<any>[]
			};
			return featureCollection;
		}
		private static geometryAsFeature(obj:GeometryObject, id:any = undefined):Feature<any>
		{
			return {
				type: "Feature",
				id: id || "id",
				geometry: obj,
				properties: null
			};
		}

		/**
		 * Combines an Array of GeoJson Geometry objects into a single "Multi" Geometry object.
		 * This assumes all geometry objects are of the same type.
		 * @param geoms An Array of GeoJson Geometry objects sharing a common type.
		 * @return A single GeoJson Geometry object with type MultiPoint/MultiLineString/MultiPolygon
		 */
		public static getMultiGeomObject(geoms:GeometryObject[]):GeometryObject
		{
			var first:GeometryObject = geoms[0];
			var type:string = first ? first.type : GeoJSON.T_MULTI_POINT;
			var multiType:string = GeoJSON.typeToMultiType(type);

			var allCoords:number[][] = geoms.map((geom:GeometryObject):number[]=> {
				return geom.coordinates;
			});

			var multiCoords:number[];
			if (type == multiType)
			{
				multiCoords = [];
				multiCoords = multiCoords.concat.apply(multiCoords, allCoords);
			}
			else
			{
				multiCoords = allCoords as any;
			}

			return {
				type: multiType,
				coordinates: multiCoords
			};
		}

		private static typeToMultiType(type:string):string
		{
			if (type == GeoJSON.T_POINT || type == GeoJSON.T_MULTI_POINT)
				return GeoJSON.T_MULTI_POINT;
			if (type == GeoJSON.T_LINE_STRING || type == GeoJSON.T_MULTI_LINE_STRING)
				return GeoJSON.T_MULTI_LINE_STRING;
			if (type == GeoJSON.T_POLYGON || type == GeoJSON.T_MULTI_POLYGON)
				return GeoJSON.T_MULTI_POLYGON;
			return null;
		}

		public static getProjectionFromURN(ogc_crs_urn:string):string
		{
			var array:any[] = ogc_crs_urn.split(':');
			if (array.length > 2)
				return array[array.length - 3] + ':' + array[array.length - 1];
			return ogc_crs_urn;
		}
	}
}
