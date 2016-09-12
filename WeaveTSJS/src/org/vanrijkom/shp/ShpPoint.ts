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
import ShpObject = org.vanrijkom.shp.ShpObject;
import ShpError = org.vanrijkom.shp.ShpError;
import ShpType = org.vanrijkom.shp.ShpType;
/**
 * The ShpPoint class parses an ESRI Shapefile Point record from a ByteArray.
 * @author Edwin van Rijkom
 * 
 */	
export class ShpPoint extends ShpObject
{
	/**
	 * Constructor
	 * @throws org.vanrijkom.shp.ShpError Not a Point record
	 */	
	public x: number;
	public y: number;
	
	constructor(src: JSByteArray = null, size: number = 0) {
		super();
		this.type = ShpType.SHAPE_POINTZ;
		if (src) {			
			if (src.length - src.position < size)
				throw(new ShpError("Not a Point record (to small)"));
			
			this.x = (size > 0)	? src.readDouble() : NaN;
			this.y = (size > 8) 	? src.readDouble() : NaN;
		}
		//trace("Point", x,y);		
	}
}

} // package