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
	export class GeometryType
	{
		public static /* readonly */ POINT:string = "Point";
		public static /* readonly */ LINE:string = "Arc";
		public static /* readonly */ POLYGON:string = "Polygon";
		
		public static fromGeoJsonType(type:string):string
		{
			switch (type)
			{
				case GeoJSON.T_MULTI_POINT:
				case GeoJSON.T_POINT:
					return GeometryType.POINT;
				
				case GeoJSON.T_MULTI_LINE_STRING:
				case GeoJSON.T_LINE_STRING:
					return GeometryType.LINE;
				
				case GeoJSON.T_MULTI_POLYGON:
				case GeoJSON.T_POLYGON:
					return GeometryType.POLYGON;
				
				default:
					return null;
			}
		}
		
		public static toGeoJsonType(type:string, multi:boolean):string
		{
			if (type == GeometryType.POINT)
				return multi ? GeoJSON.T_MULTI_POINT : GeoJSON.T_POINT;
			if (type == GeometryType.LINE)
				return multi ? GeoJSON.T_MULTI_LINE_STRING : GeoJSON.T_LINE_STRING;
			if (type == GeometryType.POLYGON)
				return multi ? GeoJSON.T_MULTI_POLYGON : GeoJSON.T_POLYGON;
			return null;
		}
		
		public static fromPostGISType(postGISType:int):string
		{
			/*
			PostGIS Specific geometry types. 
			*/

			switch (postGISType) // read shapeType
			{
				case 1: //POINT
				case 4: //MULTIPOINT
					return GeometryType.POINT;
				case 2: //LINESTRING
				case 5: //MULTILINESTRING
					return GeometryType.LINE;
				case 3: //POLYGON
				case 6: //MULTIPOLYGON
					return GeometryType.POLYGON;
				default:
					return null;
			}
			
		}
	}
}