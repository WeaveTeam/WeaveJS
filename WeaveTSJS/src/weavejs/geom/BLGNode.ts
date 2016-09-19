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
	 * BLGNode
	 * Binary Line Generalization Tree Node
	 * This class defines a structure to represent a streamed polygon vertex.
	 * 
	 * Reference: van Oosterom, P. 1990. Reactive data structures
	 *  for geographic information systems. PhD thesis, Department
	 *  of Computer Science, Leiden University, The Netherlands.
	 * 
	 * 
	 * @author adufilie
	 */
	export class BLGNode
	{
		constructor(index:int, importance:number, x:number, y:number)
		{
			this.index = index;
			this.importance = importance;
			this.x = x;
			this.y = y;
			this.left = null;
			this.right = null;
		}

		/**
		 * These properties are made public for speed concerns, though they should not be modified.
		 */
		public index:int;
		public importance:number;
		public x:number;
		public y:number;

		// left child node
		public left:BLGNode = null;

		// right child node
		public right:BLGNode = null;
	}
}
