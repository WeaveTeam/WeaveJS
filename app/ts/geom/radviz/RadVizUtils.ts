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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableHashMap = weavejs.core.LinkableHashMap;

	export class RadVizUtils
	{
		/**
		 * Reorders columns in a LinkableHashMap using the ordered layout 
		 * @param columns A LinkableHashMap containing IAttributeColumns
		 * @param newColumnOrder An array of IAttributeColumns that are contained in columns
		 */		
		public static reorderColumns(columns:LinkableHashMap, newColumnOrder:IAttributeColumn[]):void
		{
			var columnNames:string[] = [];
			for (var column of newColumnOrder)
			{
				columnNames.push(columns.getName(column));
			}
			columns.setNameOrder(columnNames);
		}
				
		/**
		 * Checks for adjacency, assuming the columns in the array are placed in order around a circle
		 * @param column1 An IAttributeColumn in the circle
		 * @param column2 An IAttributeColumn in the circle
		 * @param columns An array of IAttributeColumns
		 * @return true if the column parameters are adjacent in the circle 
		 */		
		public static isAdjacent(column1:IAttributeColumn, column2:IAttributeColumn, columns:IAttributeColumn[]):boolean
		{
			if(columns[0] == column1 && columns[columns.length-1] == column2) return true;
			if(columns[0] == column2 && columns[columns.length-1] == column1) return true;
			
			for( var i = 0; i < columns.length-1; i++ )
			{
				if(columns[i] == column1 && columns[i+1] == column2) return true ;
				if(columns[i] == column2 && columns[i+1] == column1) return true ;
			}
			
			return false ;
		}
		
		/**
		 * Calculates circular distance, assuming the indices in the array are placed in order around a circle
		 * @param index1 An array index
		 * @param index2 An array index
		 * @param length the length of the array
		 * @return Number of indices between two indices in an array
		 */		
		public static getCircularDistance( index1:int, index2:int, length:int):number
		{			
			var upper = Math.max(index1, index2);
			var lower = Math.min(index1, index2);
			var forward = upper - lower;
			var backward = length - upper + lower ;
			return Math.min(forward, backward);
		}
		
		/** 
		 * @param recordKeys an array of IQualifiedKeys
		 * @param column1 first IAttributeColumn
		 * @param column2 second IAttributeColumn
		 * @param keyNumberMap key->column->value mapping to speed up computation
		 * @return The euclidean distance between the two column parameters 
		 */		
		public static getEuclideanDistance( recordKeys:IQualifiedKey[], column1:IAttributeColumn, column2:IAttributeColumn, keyNumberMap:D2D_KeyColumnNumber):number
		{						
			var sum:number = 0;
			var temp:number = 0;
			for (var key of recordKeys)
			{
				if(!keyNumberMap.map.has(key))
					continue;
				temp = keyNumberMap.get(key, column1) - keyNumberMap.get(key, column2);
				if(temp <= Infinity)
					sum += temp * temp;				 
			}
			return Math.sqrt(sum); 
		}
		
		/** 
		 * @param recordKeys an array of IQualifiedKeys
		 * @param column1 first IAttributeColumn
		 * @param column2 second IAttributeColumn
		 * @param keyNumberMap recordKey->column->value mapping to speed up computation
		 * @return The cosine similarity between two parameter columns
		 */		
		public static getCosineSimilarity( recordKeys:IQualifiedKey[], column1:IAttributeColumn, column2:IAttributeColumn, keyNumberMap:D2D_KeyColumnNumber):number
		{
			var dist:number = 0 ;
			var sum:number = 0;
			var recordKeyslength = recordKeys.length ;
			var dist1:number = 0; var dist2:number = 0;
			for (var key of recordKeys)
			{		
				//this key is not in the column's keys but it exists in the plotter's keySet
				if(!keyNumberMap.map.has(key))
					continue;
				var value1:number = keyNumberMap.get(key, column1);
				var value2:number = keyNumberMap.get(key, column2);
				
				if( (value1 <= Infinity) && (value2 <= Infinity)) // alternative to !isNaN()
				{
					sum += Math.abs(value1 * value2);
					dist1 += (value1 * value1);
					dist2 += (value2 * value2);
				}
			}
			dist = 1 - sum/Math.sqrt(dist1*dist2);			
			return dist;
		}		
		
		/**
		 * Creates a dxd similarity matrix (where d is the length of the parameter array)
		 * @param array An array of IAttributeColumns
		 * @param keyNumberMap recordKey->column->value mapping to speed up computation
		 * @return A 2D Array representing a similarity matrix 		
		 */		
		public static getGlobalSimilarityMatrix(array:IAttributeColumn[], keyNumberMap:D2D_KeyColumnNumber):number[][]
		{			
			var similarityMatrix:number[][] = [];
			var length = array.length ;
			
			if(!length) 
				return similarityMatrix;
			
			var keys = (array[0] as IAttributeColumn).keys;
			
			for( var i = 0; i < length; i++ )
			{
				var tempRowArray:number[] = [];
				for( var j = 0; j < length; j++ )
				{
					// augmented similarity measure
					tempRowArray.push(RadVizUtils.getCosineSimilarity(keys, array[i], array[j], keyNumberMap));
				}
				similarityMatrix.push(tempRowArray) ;
				tempRowArray = null ;
			}				
			return similarityMatrix;
		}
		
		/**
		 * Creates a neighborhood matrix (where d is the length of the parameter array)
		 * @param array An array of IAttributeColumns
		 * @return A 2D Array representing a neighborhood matrix 		
		 */		
		public static getNeighborhoodMatrix(array:IAttributeColumn[]):number[][]
		{			
			var length = array.length ;
			var neighborhoodMatrix:number[][] = [];
			
			for( var i = 0; i < length; i++ )
			{
				var tempArray:number[] = [] ;
				
				for( var j = 0; j < length; j++)
				{
					tempArray.push(1-(RadVizUtils.getCircularDistance(i,j,length)/(length/2)));
				}
				neighborhoodMatrix.push( tempArray );
				tempArray = null;			
			}
			return neighborhoodMatrix;
		}		
		
		/**
		 * Creates a sorted similarity matrix consisting of MatrixEntry objects,
		 * with the columns with the highest similarity first 
		 * @param array An array of IAttributeColumns
		 * @param keyNumberMap recordKey->column->value mapping to speed up computation
		 * @return A 1D array consisting of MatrixEntry objects
		 */
		public static getSortedSimilarityMatrix(array:IAttributeColumn[], keyNumberMap:D2D_KeyColumnNumber):MatrixEntry[]
		{
			var column:IAttributeColumn = array[0];
			var length = array.length ;
			var similarityMatrix:MatrixEntry[] = [];
			
			for( var i = 0; i < length ;i++ )
			{				
				for( var j = 0; j < i; j++ )
				{					
					var entry:MatrixEntry = new MatrixEntry();
					entry.similarity = RadVizUtils.getCosineSimilarity( column.keys, array[i], array[j], keyNumberMap );
					entry.dimension1 = array[i];
					entry.dimension2 = array[j];
					similarityMatrix.push(entry);
				}
			}	
			// sort by increasing similarity values 
			// we want the least similar dimensions at index 0
			StandardLib.sortOn(similarityMatrix, 'similarity');
			
			return similarityMatrix;
		}
		
		/** 
		 * Calculates and returns the similarity measure
		 * @param similarityMatrix A 2D Array representing a similarity matrix
		 * @param neighborhoodMatrix A 2D Array representing a neighborhood matrix
		 * @return similarity measure for the parameter matrices
		 */		
		public static getSimilarityMeasure(similarityMatrix:number[][], neighborhoodMatrix:number[][]):number
		{
			var sim:number = 0 ;
			var Nlength = neighborhoodMatrix.length ;
			for( var i = 0; i < Nlength; i++ )
				for( var j = 0; j < Nlength; j++ )
					sim+=(similarityMatrix[i][j] * neighborhoodMatrix[i][j]);
			return sim; 
		}
		
		/**
		 * Searches for parameter IAttributeColumn inside the array parameter 
		 * @param column column to search for
		 * @param orderedColumns array of IAttributeColumns to search for column parameter
		 * @return the column if it is found, null if not
		 */		
		public static searchForColumn(column:IAttributeColumn, orderedColumns:IAttributeColumn[] ):IAttributeColumn
		{
			return orderedColumns.indexOf(column) >= 0 ? column : null;
		}
	}
}
