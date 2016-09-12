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
import Rectangle = weavejs.geom.Rectangle;
import ShpPoint = org.vanrijkom.shp.ShpPoint;
import ShpObject = org.vanrijkom.shp.ShpObject;
import ShpType = org.vanrijkom.shp.ShpType;
import ShpError = org.vanrijkom.shp.ShpError;
/**
 * The ShpPoint class parses an ESRI Shapefile Polygon record from a ByteArray.
 * @author Edwin van Rijkom
 * 
 */	
export class ShpPolygon extends ShpObject
{
	/**
	 * Cartesian bounding box of all the rings found in this Polygon record.
	 */	
	public box: Rectangle;
	/**
	 * Array containing zero or more Arrays containing zero or more ShpPoint
	 * typed values, constituting the rings found in this Polygon record.
	 * @see org.vanrijkom.shp.ShpPoint
	 */	
	public rings: ShpPoint[][];
	
	/**
	 * Constructor.
	 * @param src
	 * @param size
	 * @return 
	 * @throws org.vanrijkom.shp.ShpError Not a Polygon record
	 */	
	constructor(src: JSByteArray = null, size: number = 0) {
		super();
		this.type = ShpType.SHAPE_POLYGON;
		this.rings = [];
		if (src) {			
			if (src.length - src.position < size)
				throw(new ShpError("Not a Polygon record (to small)"));
			
			src.littleEndian = true;
			
			this.box = new Rectangle
				( src.readDouble(), src.readDouble()
				, src.readDouble(), src.readDouble()
				);
				
			var rc: number = src.readInt();
			var pc: number = src.readInt();
			var ringOffsets: number[] = [];
			while(rc--) {
				ringOffsets.push(src.readInt());
			}
			
			var points: ShpPoint[] = [];
			while(pc--) {
				points.push(new ShpPoint(src,16));
			}
			
			// convert points, and ringOffsets arrays to an array of rings:
			var removed: number = 0;
			var split: number;
			ringOffsets.shift();			
			while(ringOffsets.length) {
				split = ringOffsets.shift();
				this.rings.push(points.splice(0,split-removed));
				removed = split;
			}	
			this.rings.push(points);
		}		
	}
}

} // package;