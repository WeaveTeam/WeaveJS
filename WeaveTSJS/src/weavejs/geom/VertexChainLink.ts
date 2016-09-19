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
	/**
	 * VertexChainLink
	 * @author adufilie
	 */	
	export class VertexChainLink
	{
		constructor(vertexID:int, x:number, y:number)
		{
			this.initialize(vertexID, x, y);
		}
		
		public initialize(vertexID:int, x:number, y:number):void
		{
			this.vertexID = vertexID;
			this.x = x;
			this.y = y;
			this.importance = -1;
			this.importanceIsValid = false;
			// make this vertex adjacent to itself
			this.prev = this;
			this.next = this;
		}

		public vertexID:int;
		public x:number;
		public y:number;
		public importance:number;
		public prev:VertexChainLink;
		public next:VertexChainLink;
		public importanceIsValid:boolean;

		/**
		 * insert
		 * Adds a new vertex to the end of the chain.
		 */		
		public insert(newVertex:VertexChainLink):void
		{
			this.prev.next = newVertex; // add new vertex to end of chain
			newVertex.prev = this.prev; // the current last vertex appears before the new one
			newVertex.next = this; // the new vertex wraps around to this one
			this.prev = newVertex; // this vertex wraps backwards around to the new one
		}

		/**
		 * equals2D
		 * Returns true if x and y are equal between two VertexChainLink objects.
		 */
		public equals2D(other:VertexChainLink):boolean
		{
			return this.x == other.x && this.y == other.y;
		}
		
		/**
		 * removeFromChain
		 * Updates prev and next pointers on adjacent VertexChainLinks so this link is removed.
		 */
		public removeFromChain():void
		{
			// promote adjacent vertices and invalidate their importance
			this.prev.promoteAndInvalidateImportance(this.importance);
			this.next.promoteAndInvalidateImportance(this.importance);
			// make next and prev adjacent to each other
			this.prev.next = this.next;
			this.next.prev = this.prev;
			// make this vertex adjacent to itself
			this.prev = this;
			this.next = this;
			VertexChainLink.saveUnusedInstance(this);
		}

		/**
		 * promoteAndInvalidateImportance
		 * @param minImportance If the importance value of this vertex is less than minImportance, it will be set to minImportance.
		 */
		private promoteAndInvalidateImportance(minImportance:number):void
		{
			this.importance = Math.max(this.importance, minImportance);
			this.importanceIsValid = false;
		}

		/**
		 * updateImportance
		 * This function re-calculates the importance of the current point.
		 * It may only increase the importance, not decrease it.
		 */
		public validateImportance():void
		{
			this.importanceIsValid = true;
			
			// stop if already marked required
			if (this.importance == Infinity)
				return;
	
			// the importance of a point is the area formed by it and its two neighboring points
			// update importance
			
			//TODO: use distance as well as area in determining importance?
			
			var area:number = this.areaOfTriangle(this.prev, this, this.next);
			this.importance = Math.max(this.importance, area);
		}

		/**
		 * areaOfTriangle
		 * @param a First point in a triangle.
		 * @param b Second point in a triangle.
		 * @param c Third point in a triangle.
		 * @return The area of the triangle ABC.
		 */
		private areaOfTriangle(a:VertexChainLink, b:VertexChainLink, c:VertexChainLink):number
		{
			// http://www.softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm
			// get signed area of the triangle formed by three points
			var signedArea:number = ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
			// return absolute value
			if (signedArea < 0)
				return -signedArea;
			return signedArea;
		}

		private static /* readonly */ unusedInstances:VertexChainLink[] = [];
		public static getUnusedInstance(vertexID:int, x:number, y:number):VertexChainLink
		{
			if (VertexChainLink.unusedInstances.length > 0)
			{
				var link:VertexChainLink = VertexChainLink.unusedInstances.pop();
				link.initialize(vertexID, x, y);
			}
			return new VertexChainLink(vertexID, x, y);
		}
		public static saveUnusedInstance(vertex:VertexChainLink):void
		{
			vertex.prev = vertex.next = null;
			VertexChainLink.unusedInstances.push(vertex);
		}
		public static clearUnusedInstances():void
		{
			VertexChainLink.unusedInstances.length = 0;
		}
		
		/**
		 * The importance property name.
		 */
		public static /* readonly */ IMPORTANCE:string = 'importance';
	}
}
