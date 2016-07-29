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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;

	/**
	 * An implementation of the RANDOM_LAYOUT dimensional ordering algorithm.
	 * This algorithm randomly swaps dimensions for a certain number of iterations using a similarity measure.
	 */
	export class RandomLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		public iterations:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(100));
		
		private similarityMatrix:number[][] ;
		private neighborhoodMatrix:number[][];
		
		/*override*/ public performLayout(columns:IAttributeColumn[]):void
		{
			this.similarityMatrix = RadVizUtils.getGlobalSimilarityMatrix(columns, this.keyNumberMap);				
			this.neighborhoodMatrix = RadVizUtils.getNeighborhoodMatrix(columns);
			
			var r1:number;
			var r2:number;
			var prev:number ;
			var sim:number = 0 ;

			var min:number = prev = RadVizUtils.getSimilarityMeasure(this.similarityMatrix, this.neighborhoodMatrix);
			this.orderedLayout = columns; //store original layout for comparison
			
			for( var i = 0; i < this.iterations.value; i++ )
			{
				// get 2 random column numbers
				do{
					r1=Math.floor(Math.random()*100) % columns.length;	
					r2=Math.floor(Math.random()*100) % columns.length;	
				} while(r1 == r2);
				
				// swap columns r2 and r1
				var temp1:IAttributeColumn = new DynamicColumn() ; 
				var temp2:IAttributeColumn = new DynamicColumn() ;
				temp1 = columns[r1];
				columns.splice(r1, 1, columns[r2] );
				columns.splice(r2, 1, temp1);
				
				this.similarityMatrix = RadVizUtils.getGlobalSimilarityMatrix(columns, this.keyNumberMap);
				this.neighborhoodMatrix = RadVizUtils.getNeighborhoodMatrix(columns);
				if((sim = RadVizUtils.getSimilarityMeasure(this.similarityMatrix, this.neighborhoodMatrix)) <= min) 
				{	
					min = sim ;
					this.orderedLayout = columns;
				}
			}
			console.log( "random swap", prev, min );
		}
	}
}
