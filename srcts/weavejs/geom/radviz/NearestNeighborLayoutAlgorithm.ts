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
	 * An implementation of the NEAREST_NEIGHBOR dimensional ordering algorithm.
	 * This algorithm finds nearest neighbors of a dimension successfully until all dimensions have been added.
	 */
	export class NearestNeighborLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		private ssm:MatrixEntry[];

		/*override*/ public performLayout(columns:IAttributeColumn[]):void
		{
			this.ssm = RadVizUtils.getSortedSimilarityMatrix(columns, this.keyNumberMap);
			
			// push the two columns that are least similar into new column order
			this.orderedLayout.push(this.ssm[0].dimension1, this.ssm[0].dimension2);
			
			while( this.orderedLayout.length < columns.length)
			{
				var column:IAttributeColumn = this.searchForAnchorMatch( this.orderedLayout[this.orderedLayout.length-1], 
					this.orderedLayout[this.orderedLayout.length-2], this.orderedLayout);				
				this.orderedLayout.push(column);
			}
			
			// debugging
			var gsm = RadVizUtils.getGlobalSimilarityMatrix(this.orderedLayout, this.keyNumberMap);
			var nm = RadVizUtils.getNeighborhoodMatrix(this.orderedLayout);
			console.log( "nearest neighbor ", RadVizUtils.getSimilarityMeasure(gsm, nm));
		}
			
		
		private searchForAnchorMatch(matchTo:IAttributeColumn, ignore:IAttributeColumn, orderedColumns:IAttributeColumn[]):IAttributeColumn
		{
			loop:for( var i:int = 0; i < this.ssm.length; i++ )
			{
				if(this.ssm[i].dimension1 == matchTo || this.ssm[i].dimension2 == matchTo)
					if(this.ssm[i].dimension1 != ignore && this.ssm[i].dimension2 != ignore)
					{
						var matched:IAttributeColumn = (this.ssm[i].dimension1 == matchTo) ? this.ssm[i].dimension2 : this.ssm[i].dimension1;
						for (var column of orderedColumns)
						{
							if( column == matched ) continue loop; 
						}
						return matched;
					}
			}
			return null;
		}
	}
}
