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
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DynamicColumn = weavejs.data.column.DynamicColumn;

	/**
	 * An implementation of the Class Discrimination Layout dimensional ordering algorithm.
	 * This algorithm groups dimensions according to the Classes found in the initial Column selected for class determination
	 */
	export class ClassDiscriminationLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm
	{
		//  String -> Array of LinkableHashMap object names
		public tAndpMapping:Map<string, string[]>;//stores the column names belonging to a particular class{key = classname value = array of column names belonging to this class}
		public tandpValuesMapping:Map<string, number[]>;//stores the column values belonging to a particular class{key = classname value = array of column values belonging to this class}
		public ClassToColumnMap:Map<string, ClassInfoObject>;
		/** structure of ClassToColumnMap (Bins)
		 for example :    type                        				Array
		 ClassToColumnMap[japanese]      			   			 Object 1
																 ColumnName1     values in Column1
		 														 ColumnName2		       Column2
		 														 ColumnName3		       Column3
		 
		 ClassToColumnMap[american]          					 Object 2
		 														 ColumnName1     values in Column1
																 ColumnName2		       Column2
																 ColumnName3		       Column3  
		 */
		
		
		
		/** This function determines the classes and  populates the Dictionary called ClassToColumnMap which is used for the Class Discrimination Layout Algorithm
		 can be used when the discriminator class is of a categorical nature  */
		public fillingClassToColumnMap(selectedColumn:DynamicColumn,colObjects:IAttributeColumn[], columnNames:string[], normalizedColumns:IAttributeColumn[]):void
		{
			this.ClassToColumnMap = new Map();//create a new one for every different column selected
			
			var attrType:string = ColumnUtils.getDataType(selectedColumn);// check if column has numercial or categorical values
				//Step 2 Looping thru the keys in the found column and populating the type dictionary
			for(var g:int = 0; g < selectedColumn.keys.length; g++)
			{
				var mkey:IQualifiedKey = selectedColumn.keys[g] as IQualifiedKey;
				
				var type:string = selectedColumn.getValueFromKey(mkey,String);//"japanese", "american" etc
				
				
				if(!this.ClassToColumnMap.has(type))// && !tAndpMapping.has(type))
				{
					this.ClassToColumnMap.set(type, new ClassInfoObject());
					//tAndpMapping[type] = [];
					
				}
				
				var infoObject:ClassInfoObject = this.ClassToColumnMap.get(type);
				for (var f:int = 0; f < colObjects.length; f ++)//filling in the type columnMapping with arrays
				{
					if(!infoObject.columnMapping.hasOwnProperty(columnNames[f]))							 
						
						infoObject.columnMapping.set(columnNames[f], []);
				}
				
				for(var b:int = 0; b < normalizedColumns.length; b++)
				{
					var tempEntry:number = (normalizedColumns[b] as IAttributeColumn).getValueFromKey(mkey,Number) as number;
					var zz = infoObject.columnMapping.get(columnNames[b]);
					zz.push(tempEntry);
				}
				
			}//ClassToColumnMap gets filled 
		}
		
		
		/**This function segregates the columns into classes using the statistical measure (t-statistic in this case) */
		public performClassDiscrimination(columnNames:string[], ClassToColumnMap:Map<string, ClassInfoObject>, layoutMeasure:string, thresholdValue:number, columnNumPerClass:number):Map<string, string[]>
		{
			this.tAndpMapping = new Map();//maps column names
			this.tandpValuesMapping = new Map();//maps column values
			for (var r:int = 0 ; r < columnNames.length; r++)//for each column loop through the classes
			{
				
				var firstLoop:boolean = true;
				var tempType:string;
				var compareNum:number;
				
				for (var type of ClassToColumnMap.keys())
				{ 
					
					if(!this.tAndpMapping.hasOwnProperty(type))
					{
						this.tAndpMapping.set(type, []);
						this.tandpValuesMapping.set(type+"metricvalues", []);
					}
					
					if(layoutMeasure == "PVal")//only if pvalue is selected
					{
						var tempPValue:number = ClassToColumnMap.get(type).pValuesArray[r];
						if(isNaN(thresholdValue))// if threshold has not been specified
						{
							
							if(firstLoop)
							{
								firstLoop = false;
								compareNum = ClassToColumnMap.get(type).pValuesArray[r];
								tempType = type;
								
							}
								
							else
							{
								if(compareNum < tempPValue)
								{
									tempType = type;
									compareNum = tempPValue;
									
								}
							}
							
						}
						
						if(isNaN(thresholdValue) == false)//if threshold is specified
						{
							if (tempPValue > thresholdValue)
							{
								if(firstLoop)
								{
									firstLoop = false;
									compareNum = ClassToColumnMap.get(type).pValuesArray[r];
									tempType = type;
								}
								else
								{
									if(compareNum < tempPValue)
									{
										compareNum = tempPValue;
										tempType = type;
									}
									
								}
							}
						}
					}
					
					else// as default and if tstatistic is chosen as a measure 
					{
						var tempTValue:number = ClassToColumnMap.get(type).tStatisticArray[r];
													
						if(firstLoop)
							 {
								 firstLoop = false;
								 compareNum = ClassToColumnMap.get(type).tStatisticArray[r];
								 tempType = type;
								 
							 }
						 
						 else
						 {
								 if(compareNum < tempTValue)
								 {
									 tempType = type;
									 compareNum = tempTValue;
									 
								 }
						 }
						
					}//using Tstat loop ends here
					
					
				}//for every type loops ends here
				
				if(tempType != null)
				{
					if(isNaN(thresholdValue) == false)//if threshold is specified
					{
						if(compareNum >= thresholdValue)
						{
							this.tAndpMapping.get(tempType).push(columnNames[r]);
							this.tandpValuesMapping.get(tempType+"metricvalues").push(compareNum);
						}
					}
					
					else
					{
						this.tAndpMapping.get(tempType).push(columnNames[r]);
						this.tandpValuesMapping.get(tempType+"metricvalues").push(compareNum);
					}
					
					/*tAndpMapping[tempType].push(columnNames[r]);
					tandpValuesMapping[tempType+"metricvalues"].push(compareNum);*/
				}
				
			}//for every column loop ends here
			
			return this.tAndpMapping;
		}		
	}
}



/*if(columnNumberperType > 0)//allows only definite number of columns to be included in every class
{
	if(r < columnNumPerClass)
	{
		tAndpMapping[tempType].push(columnNames[r]);
		tandpValuesMapping[tempType+"metricvalues"].push(compareNum);
	}
	columnNumberperType--;
}

if(isNaN(columnNumberperType))
{
	tAndpMapping[tempType].push(columnNames[r]);
	tandpValuesMapping[tempType+"metricvalues"].push(compareNum);
}*/


