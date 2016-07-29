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
	 * An implementation of the GREEDY_LAYOUT dimensional ordering algorithm.
	 * This algorithm keeps adding nearest possible pairs of dimensions until all dimensions have been added.
	 */
	export class GreedyLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		/*override*/ public performLayout(columns:IAttributeColumn[]):void
		{
			var sortedSimilarityMatrix = RadVizUtils.getSortedSimilarityMatrix(columns, this.keyNumberMap);
			
			this.orderedLayout.push(sortedSimilarityMatrix[0].dimension1, sortedSimilarityMatrix[0].dimension2);
			var columnBegin:IAttributeColumn = this.orderedLayout[0];
			var columnEnd:IAttributeColumn = this.orderedLayout[1];
			var column1:IAttributeColumn; 
			var column2:IAttributeColumn ;
			var i = 0;
			
			while( this.orderedLayout.length < columns.length )
			{
				column1 = RadVizUtils.searchForColumn( sortedSimilarityMatrix[i].dimension1, this.orderedLayout );
				column2 = RadVizUtils.searchForColumn( sortedSimilarityMatrix[i].dimension2, this.orderedLayout );
				
				if(column1 && column2) 
				{
					i++; 
					continue;
				} 
				else if( column1 ) 
				{					
					column2 = sortedSimilarityMatrix[i].dimension2;
					if( columnEnd == column1 ) 
					{
						this.orderedLayout.push(column2);
						columnEnd = column2;
					} 
					else if( columnBegin == column1 )
					{
						this.orderedLayout.unshift(column2);
						columnBegin = column2;
					} 
					else 
					{
						i++; 
						continue;
					}
				} 
				else if( column2 ) 
				{
					column1 = sortedSimilarityMatrix[i].dimension1;
					if( columnEnd == column2 ) 
					{
						this.orderedLayout.push(column1);
						columnEnd = column1 ;
					} 
					else if (columnBegin == column2 ) 
					{
						this.orderedLayout.unshift(column1);
						columnBegin = column1 ;
					} 
					else 
					{
						i++; 
						continue ;
					}
				}
				else 
				{
					this.orderedLayout.push(sortedSimilarityMatrix[i].dimension1, sortedSimilarityMatrix[i].dimension2 );
					columnEnd = sortedSimilarityMatrix[i].dimension2 ;
				}
				i++;
			}
			
			// debugging
			var similarityMatrix = RadVizUtils.getGlobalSimilarityMatrix(this.orderedLayout, this.keyNumberMap);
			var neighborhoodMatrix = RadVizUtils.getNeighborhoodMatrix(this.orderedLayout);
			console.log( "greedy ", RadVizUtils.getSimilarityMeasure(similarityMatrix, neighborhoodMatrix));
		}
				
	}
}
