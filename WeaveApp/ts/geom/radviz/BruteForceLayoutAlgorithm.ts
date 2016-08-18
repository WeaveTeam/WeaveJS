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
	 * An implementation of the optimal layout algorithm that generates all permutations of the original anchor layout
	 * and returns the best one, if one exists
	 */
	export class BruteForceLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		private similarityMatrix:number[][] ;
		private neighborhoodMatrix:number[][];
		
		/*override*/ public performLayout(columns:IAttributeColumn[]):void
		{
			var temp:IAttributeColumn[] ;
			var stored:IAttributeColumn[] ;
			var sim:number ;
			var min:number ;
						
			var fact:number = this.factorial(columns.length);
			
			for( var i:int = 0; i < fact; i++)
			{
				var columnsCopy = columns.slice();
				
				temp = this.getNthPermutation(columnsCopy, i);
				
				this.similarityMatrix = RadVizUtils.getGlobalSimilarityMatrix(temp, this.keyNumberMap);				
				this.neighborhoodMatrix = RadVizUtils.getNeighborhoodMatrix(temp);
				sim = RadVizUtils.getSimilarityMeasure(this.similarityMatrix, this.neighborhoodMatrix);
				
				if( i == 1) min = sim;
				if( sim <= min ) //store current arrangement
				{		
					min = sim;
					stored = temp;
				} 
			}
			this.orderedLayout = stored; //save best so far
			console.log("optimal", min);
		}
		
		// get nth permutation of a set of symbols
		private getNthPermutation<T>(symbols:T[], n:uint):T[] {
			return this.permutation(symbols, this.n_to_factoradic(n));
		}
		
		// convert n to factoradic notation
		private n_to_factoradic(n:uint, p:uint=2):uint[] {
			if(n < p) return [n];
			var ret:uint[] = this.n_to_factoradic(n/p, p+1);
			ret.push(n % p);
			return ret;
		}
		
		// return nth permutation of set of symbols via factoradic
		private permutation<T>(symbols:T[], factoradic:uint[]):T[] {
			factoradic.push(0);
			while(factoradic.length < symbols.length) factoradic.unshift(0);
			var ret:T[] = [];
			while(factoradic.length) {
				var f:uint = factoradic.shift();
				ret.push(symbols[f]);
				symbols.splice(f, 1);
			}
			return ret;
		}
		
		private factorial(n:number):number
		{
			var fact:number = 1;
			if(!n) return fact;
			for(var i:number = n; i > 1; i--)
			{
				fact *= i;
			}	
			return fact;
		}
				
	}
}
