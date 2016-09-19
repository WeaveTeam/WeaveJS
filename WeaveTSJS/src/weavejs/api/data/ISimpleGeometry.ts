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

namespace weavejs.api.data
{
	/**
	 * This is an interface to a geometry object defined by an array of vertices
	 * and a type.
	 * 
	 * @author kmonico
	 */
	@Weave.classInfo({id: "weavejs.api.data.ISimpleGeometry"})
	export class ISimpleGeometry
	{
		/**
		 * This function will return a boolean indicating if this
		 * geometry is a line.
		 * 
		 * @return <code>True</code> if this is a line.
		 */
		isLine:()=>boolean;

		/**
		 * This function will return a boolean indicating if this
		 * geometry is a point.
		 * 
		 * @return <code>True</code> if this is a point.
		 */
		isPoint:()=>boolean;
		
		/**
		 * This function will return a boolean indicating if this
		 * geometry is a polygon.
		 * 
		 * @return <code>True</code> if this is a polygon.
		 */
		isPolygon:()=>boolean;
		
		/**
		 * Get the vertices.
		 */
		getVertices:()=>{x:number, y:number}[];
		
		/**
		 * Set the vertices.
		 * 
		 * @param An array of objects with x and y properties. 
		 */		
		setVertices:(o:{x:number, y:number}[])=>void;
	}
}