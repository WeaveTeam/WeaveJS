/* ************************************************************************ */
/*																			*/
/*  SHP (ESRI ShapeFile Reader)												*/
/*  Copyright (c)2007 Edwin van Rijkom										*/
/*  http://www.vanrijkom.org												*/
/*																			*/
/* This library is free software; you can redistribute it and/or			*/
/* modify it under the terms of the GNU Lesser General Public				*/
/* License as published by the Free Software Foundation; either				*/
/* version 2.1 of the License, or (at your option) any later version.		*/
/*																			*/
/* This library is distributed in the hope that it will be useful,			*/
/* but WITHOUT ANY WARRANTY; without even the implied warranty of			*/
/* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU		*/
/* Lesser General Public License or the LICENSE file for more details.		*/
/*																			*/
/* ************************************************************************ */

namespace org.vanrijkom.shp
{

/**
 * The ShpType class is a place holder for the ESRI Shapefile defined
 * shape types.
 * @author Edwin van Rijkom
 * 
 */	
export class ShpType
{	
	/**
	 * Unknow Shape Type (for internal use) 
	 */
	public static /* readonly */ SHAPE_UNKNOWN		: number = -1;
	/**
	 * ESRI Shapefile Null Shape shape type.
	 */	
	public static /* readonly */ SHAPE_NULL			: number = 0;
	/**
	 * ESRI Shapefile Point Shape shape type.
	 */
	public static /* readonly */ SHAPE_POINT			: number = 1;
	/**
	 * ESRI Shapefile PolyLine Shape shape type.
	 */
	public static /* readonly */ SHAPE_POLYLINE		: number = 3;
	/**
	 * ESRI Shapefile Polygon Shape shape type.
	 */
	public static /* readonly */ SHAPE_POLYGON		: number = 5;
	/**
	 * ESRI Shapefile Multipoint Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_MULTIPOINT	: number = 8;
	/**
	 * ESRI Shapefile PointZ Shape shape type.
	 */
	public static /* readonly */ SHAPE_POINTZ		: number = 11;
	/**
	 * ESRI Shapefile PolylineZ Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_POLYLINEZ 	: number = 13;
	/**
	 * ESRI Shapefile PolygonZ Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_POLYGONZ		: number = 15;
	/**
	 * ESRI Shapefile MultipointZ Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_MULTIPOINTZ	: number = 18;
	/**
	 * ESRI Shapefile PointM Shape shape type
	 */
	public static /* readonly */ SHAPE_POINTM		: number = 21;
	/**
	 * ESRI Shapefile PolyLineM Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_POLYLINEM		: number = 23;
	/**
	 * ESRI Shapefile PolygonM Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_POLYGONM		: number = 25;
	/**
	 * ESRI Shapefile MultiPointM Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_MULTIPOINTM	: number = 28;
	/**
	 * ESRI Shapefile MultiPatch Shape shape type
	 * (currently unsupported).
	 */
	public static /* readonly */ SHAPE_MULTIPATCH	: number = 31;
}

} // package