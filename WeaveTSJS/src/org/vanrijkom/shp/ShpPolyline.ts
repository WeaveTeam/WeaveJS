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

import JSByteArray = weavejs.util.JSByteArray;
import ShpPolygon = org.vanrijkom.shp.ShpPolygon;
/**
 * The ShpPoint class parses an ESRI Shapefile Polyline record from a ByteArray.
 * @author Edwin van Rijkom
 * 
 */	
export class ShpPolyline extends ShpPolygon
{
	/**
	 * Constructor.
	 * @param src
	 * @param size
	 * @return 
	 * 
	 */	
	constructor(src: JSByteArray = null, size: number = 0) {
		super(src, size);
		this.type = ShpType.SHAPE_POLYLINE;
	}
}

} // package;