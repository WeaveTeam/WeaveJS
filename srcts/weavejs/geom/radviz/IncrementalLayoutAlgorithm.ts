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

	/**
	 * An implementation of the incremental dimensional ordering algorithm.
	 * This algorithm successively adds dimensions to the best position in a search to define a suitable order. 
	 */
	export class IncrementalLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		/*override*/ public performLayout(columns:IAttributeColumn[]):void
		{
			var temp:IAttributeColumn[];
			var stored:IAttributeColumn[];
			var sim:number ;
			var min:number ;
			var column:IAttributeColumn;			
			
			var ssm = RadVizUtils.getSortedSimilarityMatrix(columns, this.keyNumberMap);
			this.orderedLayout.push(ssm[0].dimension1, ssm[0].dimension2);
			
			for(var i = 0; i < columns.length; i++)
			{
				if( (columns[i] == this.orderedLayout[0]) || (columns[i] == this.orderedLayout[1]) )
					columns.splice(i,1);
			}
			
			while(columns.length)
			{
				column = columns.pop();
				
				for( i = 1; i < this.orderedLayout.length; i++ )
				{
					// store minimum ordering into stored array
					temp = [];
					for (var col of this.orderedLayout)
					{
						temp.push(col);
					}
					// insert dimension into new order
					temp.splice(i,0,column);
					
					var gsm = RadVizUtils.getGlobalSimilarityMatrix(temp, this.keyNumberMap);
					var nm = RadVizUtils.getNeighborhoodMatrix(temp);
					sim = RadVizUtils.getSimilarityMeasure(gsm, nm);
					
					if( i == 1) min = sim;
					if( sim <= min ) //store current arrangement
					{		
						min = sim;
						stored = [];
						for ( var column1 of temp)
						{
							stored.push(column1);							
						}
					} 
					temp.splice(i,1); // remove inserted dimension in each iteration
				}
				this.orderedLayout = stored || []; //save best so far
			}
						
			console.log( "incremental ", min);
		}
				
	}
}
