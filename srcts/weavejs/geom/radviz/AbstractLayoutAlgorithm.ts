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

namespace weavejs.geom.radviz
{
	import CallbackCollection = weavejs.core.CallbackCollection;
	import DebugTimer = weavejs.util.DebugTimer;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;

	/**
	 * An abstract class with a callback collection which implements ILayoutAlgorithm
	 */
	export class AbstractLayoutAlgorithm extends CallbackCollection implements ILayoutAlgorithm
	{
		public unorderedLayout:IAttributeColumn[] = [];
		
		public orderedLayout:IAttributeColumn[] = [];
		
		/**
		 * @param keyNumberMap recordKey->column->value mapping to speed up computation 
		 */		
		public keyNumberMap:D2D_KeyColumnNumber;

		/**
		 * Runs the layout algorithm and calls performLayout() 
		 * @param array An array of IAttributeColumns to reorder
		 * @param keyNumberHashMap recordKey->column->value mapping to speed up computation
		 * @return An ordered array of IAttributeColumns
		 */	
		public run(array:IAttributeColumn[], keyNumberHashMap:D2D_KeyColumnNumber):IAttributeColumn[]
		{
			if (!array.length) 
				return null;
			
			if (!keyNumberHashMap)
				return null;
			
			DebugTimer.begin();
			
			this.keyNumberMap = keyNumberHashMap;
			this.orderedLayout = [];			
			this.performLayout(array);	
			
			DebugTimer.end('layout algorithm');
			
			return this.orderedLayout;
		}
		
		/**
		 * Classes that extend LayoutAlgorithm must implement this function 
		 * @param columns An array of IAttributeColumns
		 */		
		public performLayout(columns:IAttributeColumn[]):void
		{
			// empty
		}
	}
}
