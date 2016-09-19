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
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;

	/**
	 * This class acts as a wrapper for a general polygon.
	 * 
	 * @author kmonico
	 */
	export class SimpleGeometry implements ISimpleGeometry
	{
		/**
		 * @param type One of the constants defined in GeometryType.
		 * @param points An optional Array of Objects to pass to setVertices().
		 * @see weave.primitives.GeometryType
		 * @see #setVertices()
		 */
		constructor(type:string = "Polygon", points:{x: number, y: number}[] = null)
		{
			this._type = type;
			if (points)
				this.setVertices(points);
		}
		
		/**
		 * Gets the points of the geometry.
		 * @return An Array of objects, each having "x" and "y" properties.
		 */
		public getVertices():{x: number, y: number}[]
		{
			return this._vertices;
		}
		
		/**
		 * Initializes the geometry.
		 * @param points An Array of objects, each having "x" and "y" properties.
		 */
		public setVertices(points:{x: number, y: number}[]):void
		{	
			this._vertices = points.concat();
			
			this.bounds.reset();
			for (var obj of this._vertices || [])
				this.bounds.includeCoords(obj.x, obj.y);
		}

		public isPolygon():boolean { return this._type == GeometryType.POLYGON; }
		public isLine():boolean { return this._type == GeometryType.LINE; }
		public isPoint():boolean { return this._type == GeometryType.POINT; }
		
		public bounds:Bounds2D = new Bounds2D();
		
		/**
		 * An Array of objects, each having "x" and "y" properties.
		 */
		private _vertices:{x: number, y: number}[] = null;
		private _type:string = '';
		
		
		/**
		 * A static helper function to convert a bounds object into an ISimpleGeometry object.
		 *  
		 * @param bounds The bounds to transform.
		 * @return A new ISimpleGeometry object.
		 */		
		public static getNewGeometryFromBounds(bounds:Bounds2D):ISimpleGeometry
		{
			var xMin:number = bounds.getXMin();
			var xMax:number = bounds.getXMax();
			var yMin:number = bounds.getYMin();
			var yMax:number = bounds.getYMax();
			
			var geom:SimpleGeometry = new SimpleGeometry(GeometryType.POLYGON);
			geom.setVertices([
				new Point(xMin, yMin),
				new Point(xMax, yMin),
				new Point(xMax, yMax),
				new Point(xMin, yMax)
			]);
			
			return geom;
		}
	}
}