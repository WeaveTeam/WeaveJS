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
import ShpPointZ = org.vanrijkom.shp.ShpPointZ;
import ShpError = org.vanrijkom.shp.ShpError;
import ShpPoint = org.vanrijkom.shp.ShpPoint;
import ShpPolygon = org.vanrijkom.shp.ShpPolygon;
import ShpType = org.vanrijkom.shp.ShpType;
import ShpPolyline = org.vanrijkom.shp.ShpPolyline;

	/**
 * The ShpPoint class parses an ESRI Shapefile Record Header from a ByteArray
 * as well as its associated Shape Object. The parsed object is stored as a 
 * ShpObject that can be cast to a specialized ShpObject deriving class using 
 * the found shapeType value.
 * @author Edwin van Rijkom
 * 
 */
export class ShpRecord
{
	/**
	 * Record number 
	 */	
	public number: number;
	/**
	 * Content length in 16-bit words 
	 */
	public contentLength: number;
	/**
	 * Content length in bytes 
	 */
	public contentLengthBytes: number;
	/**
	 * Type of the Shape Object associated with this Record Header.
	 * Should match one of the constant values defined in the ShpType class.
	 * @see org.vanrijkom.shp.ShpType
	 */	
	public shapeType: number;
	/**
	 * Parsed Shape Object. Cast to the specialized ShpObject deriving class
	 * indicated by the shapeType property to obtain Shape type specific
	 * data. 
	 */	
	public shape: ShpObject;
	
	/**
	 * Constructor.
	 * @param src
	 * @return 
	 * @throws org.vanrijkom.shp.ShpError Not a valid header
	 * @throws Shape type is currently unsupported by this library
	 * @throws Encountered unknown shape type
	 * 
	 */	
	constructor(src: JSByteArray) {
		var availableBytes:number = src.length - src.position;
		
		if (availableBytes == 0) 
			throw(new ShpError("",ShpError.ERROR_NODATA));
			
		if (src.length - src.position < 8)
			throw(new ShpError("Not a valid record header (too small)"));
	
		src.littleEndian = false;

		this.number = src.readInt();
		this.contentLength = src.readInt();
		this.contentLengthBytes = this.contentLength*2 - 4;
		src.littleEndian = true;
		var shapeOffset:number = src.position;
		this.shapeType = src.readInt();
				
		switch(this.shapeType) {
			
			// Added for Weave
			case ShpType.SHAPE_NULL:
				break;
			
			case ShpType.SHAPE_POINT:
				this.shape = new ShpPoint(src,this.contentLengthBytes);
				break;
			case ShpType.SHAPE_POINTZ:
				this.shape = new ShpPointZ(src,this.contentLengthBytes);
				break;
			case ShpType.SHAPE_POLYGON:
				this.shape = new ShpPolygon(src, this.contentLengthBytes);
				break;
			case ShpType.SHAPE_POLYLINE:
				this.shape = new ShpPolyline(src, this.contentLengthBytes);
				break;
			case ShpType.SHAPE_MULTIPATCH:
			case ShpType.SHAPE_MULTIPOINT:
			case ShpType.SHAPE_MULTIPOINTM:
			case ShpType.SHAPE_MULTIPOINTZ:
			case ShpType.SHAPE_POINTM:
			case ShpType.SHAPE_POLYGONM:
			case ShpType.SHAPE_POLYGONZ:
			case ShpType.SHAPE_POLYLINEZ:
			case ShpType.SHAPE_POLYLINEM:
				throw(new ShpError(this.shapeType+" Shape type is currently unsupported by this library"));
			default:
				throw(new ShpError("Encountered unknown shape type ("+this.shapeType+")"));
		}
					
	}
}

} // package