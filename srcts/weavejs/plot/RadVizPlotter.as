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

namespace weavejs.plot
{
	import BitmapData = flash.display.BitmapData;
	import Graphics = PIXI.Graphics;
	import Shape = flash.display.Shape;
	import Matrix = flash.geom.Matrix;
	import Point = weavejs.geom.Point;
	import TextFieldAutoSize = flash.text.TextFieldAutoSize;
	import Dictionary = flash.utils.Dictionary;
	import getTimer = flash.utils.getTimer;
	
	import UITextField = mx.core.UITextField;
	import ImageSnapshot = mx.graphics.ImageSnapshot;
	
	import disposeObject = weavejs.api.disposeObject;
	import registerDisposableChild = weavejs.api.registerDisposableChild;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ILayoutAlgorithm = weavejs.api.radviz.ILayoutAlgorithm;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import Compiler = weavejs.compiler.Compiler;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import CSVDataSource = weavejs.data.DataSources.CSVDataSource;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ColorRamp = weavejs.util.ColorRamp;
	import BruteForceLayoutAlgorithm = weavejs.radviz.BruteForceLayoutAlgorithm;
	import GreedyLayoutAlgorithm = weavejs.radviz.GreedyLayoutAlgorithm;
	import IncrementalLayoutAlgorithm = weavejs.radviz.IncrementalLayoutAlgorithm;
	import NearestNeighborLayoutAlgorithm = weavejs.radviz.NearestNeighborLayoutAlgorithm;
	import RandomLayoutAlgorithm = weavejs.radviz.RandomLayoutAlgorithm;
	import CachedBitmap = weavejs.util.CachedBitmap;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DrawUtils = weavejs.util.DrawUtils;
	import RadVizUtils = weavejs.util.RadVizUtils;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	/**
	 * RadVizPlotter
	 * 
	 * @author kmanohar
	 * @author fkamayou
	 */
	export class RadVizPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			setNewRandomJitterColumn();		
			iterations.value = 50;
			algorithms[RANDOM_LAYOUT] = RandomLayoutAlgorithm;
			algorithms[GREEDY_LAYOUT] = GreedyLayoutAlgorithm;
			algorithms[NEAREST_NEIGHBOR] = NearestNeighborLayoutAlgorithm;
			algorithms[INCREMENTAL_LAYOUT] = IncrementalLayoutAlgorithm;
			algorithms[BRUTE_FORCE] = BruteForceLayoutAlgorithm;
			columns.childListCallbacks.addImmediateCallback(this, handleColumnsListChange);
			Weave.getCallbacks(filteredKeySet).addGroupedCallback(this, handleColumnsChange, true);
			Weave.getCallbacks(this).addImmediateCallback(this, clearCoordCache);
			columns.addGroupedCallback(this, handleColumnsChange);
			absNorm.addGroupedCallback(this, handleColumnsChange);
			normMin.addGroupedCallback(this, handleColumnsChange);
			normMax.addGroupedCallback(this, handleColumnsChange);
			
			this.addSpatialDependencies(
				this.columns,
				this.localNormalization,
				this.absNorm,
				this.normMin,
				this.normMax,
				this.anchors,
				this.jitterLevel,
				this.enableJitter
			);
		}
		private handleColumnsListChange():void
		{
			var newColumn:IAttributeColumn = columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			var newColumnName:string = columns.childListCallbacks.lastNameAdded;
			if(newColumn != null)
			{
				// invariant: same number of anchors and columns
				anchors.requestObject(newColumnName, AnchorPoint, false);
				// When a new column is created, register the stats to trigger callbacks and affect busy status.
				// This will be cleaned up automatically when the column is disposed.
				var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(newColumn);
				this.addSpatialDependencies(stats);
				Weave.getCallbacks(stats).addGroupedCallback(this, handleColumnsChange);
			}
			var oldColumnName:string = columns.childListCallbacks.lastNameRemoved;
			if(oldColumnName != null)
			{
				// invariant: same number of anchors and columns
				anchors.removeObject(oldColumnName);
			}
		}
		
		public getSelectableAttributeNames():Array
		{
			return ["Size", "Color", "Anchor Dimensions"];
		}
		
		public getSelectableAttributes():Array
		{
			return [radiusColumn, fillStyle.color, columns];
		}
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		
		public pointSensitivitySelection:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array), updatePointSensitivityColumns);
				
		public localNormalization:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public probeLineNormalizedThreshold:LinkableNumber = Weave.linkableChild(this,new LinkableNumber(0, verifyThresholdValue));
		public showValuesForAnchorProbeLines:LinkableBoolean= Weave.linkableChild(this,new LinkableBoolean(false));
		
		public showAnchorProbeLines:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		private pointSensitivityColumns:Array = [];
		private annCenterColumns:Array = [];
		public showAnnulusCenter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public absNorm:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public normMin:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public normMax:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		
		private verifyThresholdValue(value:*):boolean
		{
			if(0<=Number(value) && Number(value)<=1)
				return true;
			else
				return false;
		}
		
		private updatePointSensitivityColumns():void
		{
			pointSensitivityColumns = [];
			annCenterColumns = [];
			var tempArray:Array = pointSensitivitySelection.getSessionState() as Array || [];
			var cols:Array = columns.getObjects();
			for( var i:int = 0; i < tempArray.length; i++)
			{
				if (tempArray[i])
				{
					pointSensitivityColumns.push(cols[i]);
				} else
				{
					annCenterColumns.push(cols[i]);
				}
			}
		}
		/**
		 * LinkableHashMap of RadViz dimension locations: 
		 * <br/>contains the location of each column as an AnchorPoint object
		 */		
		public anchors:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(AnchorPoint));
		private coordinate:Point = new Point();//reusable object
		private tempPoint:Point = new Point();//reusable object
		
		//public drawAnnuliCenter:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean(true));
		
		public jitterLevel:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-19));
		public enableJitter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public iterations:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this,SolidFillStyle);
		public get alphaColumn():AlwaysDefinedColumn { return fillStyle.alpha; }
		public colorMap:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampXMLByName("Paired"))) ;
		
		public LayoutClasses:Dictionary = null;//(Set via the editor) needed for setting the Cd layout dimensional anchor  locations
		
		private minRadius:number = 2;
		private maxRadius:number = 10;
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		private radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(radiusColumn));
		public radiusConstant:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		
		private randomValueArray:Array = new Array();
		private randomArrayIndexMap:Dictionary = new Dictionary(true);
		private keyNumberMap:Dictionary = new Dictionary(true);
		private keyNormMap:Dictionary = new Dictionary(true);
		private keyGlobalNormMap:Dictionary = new Dictionary(true);
		
		private _currentScreenBounds:Bounds2D = new Bounds2D();
		
		public doCDLayoutFlag:boolean = false; // ToDo yenfu temporary flag to fix the code
		
		private handleColumnsChange():void
		{
			if (Weave.isBusy(columns) || Weave.isBusy(spatialCallbacks))
				return;
			
			var i:int = 0;
			var keyNormArray:Array;
			var columnNormArray:Array;
			var columnNumberMap:Dictionary;
			var columnNumberArray:Array;
			var sum:number = 0;
			
			randomArrayIndexMap = 	new Dictionary(true);
			var keyMaxMap:Dictionary = new Dictionary(true);
			var keyMinMap:Dictionary = new Dictionary(true);
			keyNormMap = 			new Dictionary(true);
			keyGlobalNormMap = 		new Dictionary(true);
			keyNumberMap = 			new Dictionary(true);
			
			
			setAnchorLocations();//normal layout
			
			var keySources:Array = columns.getObjects();
			if (keySources.length > 0) 
			{
				keySources.unshift(radiusColumn);
				var sortDirections:Array = keySources.map(function(c:*, i:int, a:*):int { return i == 0 ? -1 : 1; });
				setColumnKeySources(keySources, sortDirections);
				
				for each( var key:IQualifiedKey in filteredKeySet.keys)
				{					
					randomArrayIndexMap[key] = i ;										
					var magnitude:number = 0;
					columnNormArray = [];
					columnNumberArray = [];
					columnNumberMap = new Dictionary(true);
					sum = 0;
					for each( var column:IAttributeColumn in columns.getObjects())
					{
						columnNormArray.push(getNorm(column, key));
						columnNumberMap[column] = column.getValueFromKey(key, Number);
						columnNumberArray.push(columnNumberMap[column]);
					}
					for each(var x:number in columnNumberMap)
					{
						magnitude += (x*x);
					}					
					keyMaxMap[key] = Math.sqrt(magnitude);
					keyMinMap[key] = Math.min.apply(null, columnNumberArray);
					
					keyNumberMap[key] = columnNumberMap ;	
					keyNormMap[key] = columnNormArray ;
					i++
				}
				
				for each( var k:IQualifiedKey in filteredKeySet.keys)
				{
					keyNormArray = [];
					i = 0;
					for each( var col:IAttributeColumn in columns.getObjects())
					{
						keyNormArray.push((keyNumberMap[k][col] - keyMinMap[k])/(keyMaxMap[k] - keyMinMap[k]));
						i++;
					}					
					keyGlobalNormMap[k] = keyNormArray;
					
				}
			}
			else
			{
				setSingleKeySource(null);
			}
			
			setAnchorLocations();
			
			if (doCDLayoutFlag)
				setClassDiscriminationAnchorsLocations();
			
			clearCoordCache();
		}
		
		private getNorm(column:IAttributeColumn, key:IQualifiedKey):number
		{
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var _absNorm:boolean = absNorm.value;
			var _normMin:number = normMin.value;
			var _normMax:number = normMax.value;
			
			if (!_absNorm && _normMin == 0 && _normMax == 1)
				return stats.getNorm(key);
			
			var value:number = column.getValueFromKey(key, Number);
			var statsMin:number = stats.getMin();
			var statsMax:number = stats.getMax();
			var absMax:number = Math.max(Math.abs(statsMin), Math.abs(statsMax));
			var min:number = _absNorm ? -absMax : statsMin;
			var max:number = _absNorm ? absMax : statsMax;
			
			return StandardLib.scale(value, min, max, _normMin, _normMax);
		}
		
		public setclassDiscriminationMetric(tandpMapping:Dictionary,tandpValuesMapping:Dictionary):void
		{
			var anchorObjects:Array = anchors.getObjects(AnchorPoint);
			var anchorNames:Array = anchors.getNames(AnchorPoint);
			for(var type:Object in tandpMapping)
			{
				var colNamesArray:Array = tandpMapping[type];
				var colValuesArray:Array = tandpValuesMapping[type+"metricvalues"];
				for(var n:int = 0; n < anchorNames.length; n++)//looping through all columns
				{
					var tempAnchorName:string = anchorNames[n];
					for(var c:int =0; c < colNamesArray.length; c++)
					{
						if(tempAnchorName == colNamesArray[c])
						{
							var tempAnchor:AnchorPoint = (anchors.getObject(tempAnchorName)) as AnchorPoint;
							tempAnchor.classDiscriminationMetric.value = colValuesArray[c];
							tempAnchor.classType.value = String(type);
						}
						
					}
				}
				
			}
			
		}
		public setAnchorLocations( ):void
		{	
			var _columns:Array = columns.getObjects();
			
			var theta:number = (2*Math.PI)/_columns.length;
			var anchor:AnchorPoint;
			anchors.delayCallbacks();
			//anchors.removeAllObjects();
			for( var i:int = 0; i < _columns.length; i++ )
			{
				anchor = anchors.getObject(columns.getName(_columns[i])) as AnchorPoint ;								
				anchor.x.value = Math.cos(theta*i);
				//trace(anchor.x.value);
				anchor.y.value = Math.sin(theta*i);	
				//trace(anchor.y.value);
				anchor.title.value = ColumnUtils.getTitle(_columns[i]);
			}
			anchors.resumeCallbacks();
		}
		
		public anchorLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction("Class('weave.utils.ColumnUtils').getTitle(column)", true, false, ['column']), setClassDiscriminationAnchorsLocations);
		
		//this function sets the anchor locations for the Class Discrimination Layout algorithm and marks the Class locations
		public setClassDiscriminationAnchorsLocations():void
		{
			var numOfClasses:int = 0;
			for ( var type:Object in LayoutClasses)
			{
				numOfClasses++;
			}
			anchors.delayCallbacks();
			//anchors.removeAllObjects();
			var classTheta:number = (2*Math.PI)/(numOfClasses);
			
			var classIncrementor:number = 0;
			for( var cdtype:Object in LayoutClasses)
			{
				var cdAnchor:AnchorPoint;
				var colNames:Array = (LayoutClasses[cdtype] as Array);
				var numOfDivs:int = colNames.length + 1;
				var columnTheta:number = classTheta /numOfDivs;//needed for equidistant spacing of columns
				var currentClassPos:number = classTheta * classIncrementor;
				var columnIncrementor:int = 1;//change
				
				for( var g :int = 0; g < colNames.length; g++)//change
				{
					cdAnchor = anchors.getObject(colNames[g]) as AnchorPoint;
					cdAnchor.x.value  = Math.cos(currentClassPos + (columnTheta * columnIncrementor));
					cdAnchor.y.value = Math.sin(currentClassPos + (columnTheta * columnIncrementor));
					cdAnchor.title.value = anchorLabelFunction.apply(null, [columns.getObject(colNames[g]) as IAttributeColumn]);
					columnIncrementor++;//change
				}
				
				classIncrementor++;
			}
			
			anchors.resumeCallbacks();
			
		}
		
		
		private coordCache:Dictionary = new Dictionary(true);
		private clearCoordCache():void
		{
			coordCache = new Dictionary(true);
		}
		
		/**
		 * Applies the RadViz algorithm to a record specified by a recordKey
		 */
		private getXYcoordinates(recordKey:IQualifiedKey):void
		{
			var cached:Array = coordCache[recordKey] as Array;
			if (cached)
			{
				coordinate.x = cached[0];
				coordinate.y = cached[1];
				return;
			}
			
			//implements RadViz algorithm for x and y coordinates of a record
			var numeratorX:number = 0;
			var numeratorY:number = 0;
			var denominator:number = 0;
			
			var anchorArray:Array = anchors.getObjects();			
			
			var value:number = 0;
			var anchor:AnchorPoint;
			var normArray:Array = localNormalization.value ? keyNormMap[recordKey] : keyGlobalNormMap[recordKey];
			var _cols:Array = columns.getObjects();
			for (var i:int = 0; i < _cols.length; i++)
			{
				var column:IAttributeColumn = _cols[i];
				value = normArray ? normArray[i] : getNorm(column, recordKey);
				if (isNaN(value))
					continue;
				
				anchor = anchors.getObject(columns.getName(column)) as AnchorPoint;
				numeratorX += value * anchor.x.value;
				numeratorY += value * anchor.y.value;						
				denominator += value;
			}
			if(denominator==0) 
			{
				denominator = 1;
			}
			coordinate.x = (numeratorX/denominator);
			coordinate.y = (numeratorY/denominator);
			//trace(recordKey.localName,coordinate);
			if( enableJitter.value )
				jitterRecords(recordKey);
			
			coordCache[recordKey] = [coordinate.x, coordinate.y];
		}
		
		private jitterRecords(recordKey:IQualifiedKey):void
		{
			var index:number = randomArrayIndexMap[recordKey];
			var jitter:number = Math.abs(StandardLib.asNumber(jitterLevel.value));
			var xJitter:number = (randomValueArray[index])/(jitter);
			if(randomValueArray[index+1] % 2) xJitter *= -1;
			var yJitter:number = (randomValueArray[index+2])/(jitter);
			if(randomValueArray[index+3])yJitter *= -1;
			if(!isNaN(xJitter))coordinate.x += xJitter ;
			if(!isNaN(yJitter))coordinate.y += yJitter ;
		}
		
		/**
		 * Repopulates the static randomValueArray with new random values to be used for jittering
		 */
		public setNewRandomJitterColumn():void
		{
			randomValueArray = [] ;
			if( randomValueArray.length == 0 )
				for( var i:int = 0; i < 5000 ;i++ )
				{
					randomValueArray.push( Math.random() % 10) ;
					randomValueArray.push( -(Math.random() % 10)) ;
				}
			spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (task.iteration == 0)
			{
				if (columns.getObjects().length != anchors.getObjects().length)
					return 1;
				if (Weave.detectChange(drawPlotAsyncIteration, lineStyle, fillStyle, radiusConstant, radiusColumn))
					keyToGlyph = new Dictionary(true);
				task.asyncState = 0;
			}
			for (var recordIndex:int = int(task.asyncState); recordIndex < task.recordKeys.length; task.asyncState = ++recordIndex)
			{
				// if time is up, report progress
				if (getTimer() > task.iterationStopTime)
					return recordIndex / task.recordKeys.length;
				
				var key:IQualifiedKey = task.recordKeys[recordIndex] as IQualifiedKey;
				
				getXYcoordinates(key);
				// skip if excluded from subset or missing x,y
				if (filteredKeySet.containsKey(key) && isFinite(coordinate.x) && isFinite(coordinate.y))
				{
					task.dataBounds.projectPointTo(coordinate, task.screenBounds);
					var radius:number;
					if (useGlyphCache)
					{
						var glyph:CachedBitmap = keyToGlyph[key];
						if (!glyph)
						{
							if (radiusColumn.getInternalColumn())
								radius = minRadius + radiusColumnStats.getNorm(key) * (maxRadius - minRadius);
							else
								radius = radiusConstant.value;
							
							keyToGlyph[key] = glyph = getCachedGlyph(
								lineStyle.getLineStyleParams(key),
								fillStyle.getBeginFillParams(key),
								StandardLib.roundSignificant(radius, 3),
								radiusConstant.value
							);
						}
						glyph.drawTo(task.buffer, Math.round(coordinate.x), Math.round(coordinate.y));
					}
					else
					{
						if (radiusColumn.getInternalColumn())
							radius = minRadius + radiusColumnStats.getNorm(key) * (maxRadius - minRadius);
						else
							radius = radiusConstant.value;
						var shape:Shape = drawGlyph(
							lineStyle.getLineStyleParams(key),
							fillStyle.getBeginFillParams(key),
							StandardLib.roundSignificant(radius, 3),
							radiusConstant.value
						);
						tempMatrix.identity();
						tempMatrix.translate(coordinate.x, coordinate.y);
						task.buffer.draw(shape, tempMatrix);
					}
				}
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}
		
		private keyToGlyph:Dictionary = new Dictionary(true);
		private tempMatrix:Matrix = new Matrix();
		public useGlyphCache:boolean = true;
		
		/**
		 * A memoized version of drawGlyph() which returns a CachedBitmap object.
		 */
		private getCachedGlyph:Function = Compiler.memoize(function(...args):* {
			return registerDisposableChild(this, new CachedBitmap(this.drawGlyph.apply(this, args)));
		}, this);
		
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		private drawGlyph(lineParams:Array, fillParams:Array, radius:number, radiusConstant:number):Shape
		{
			var graphics:Graphics = tempShape.graphics;
			graphics.clear();
			
			if (fillParams)
				graphics.beginFill(fillParams[0], fillParams[1]);
			else
				graphics.endFill();
			
			graphics.lineStyle.apply(graphics, lineParams);
			if (isFinite(radius))
				graphics.drawCircle(0, 0, radius);
			else // draw a square of fixed size for missing size values
				graphics.drawRect(0 - radiusConstant/2, 0 - radiusConstant/2, radiusConstant, radiusConstant);
			
			if (fillParams)
				graphics.endFill();
			
			return tempShape;
		}
		
		
		/**
		 * This function must be implemented by classes that extend AbstractPlotter.
		 * 
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param key The key of a data record.
		 * @param output An Array of Bounds2D objects to store the result in.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			//_columns = columns.getObjects(IAttributeColumn);
			//if(!unorderedColumns.length) handleColumnsChange();
			getXYcoordinates(recordKey);
			
			initBoundsArray(output).includePoint(coordinate);
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param An Bounds2D object used to store the background data bounds.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(-1, -1, 1, 1);
		}		
		
		public drawProbe:boolean = false;
		public probedKeys:Array = null;
		
		public drawProbeLines(keys:Array,dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{						
			if(!drawProbe) return;
			if(!keys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if(filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = filteredKeySet.keys[0].keyType;
			var _cols:Array = columns.getObjects();
			
			for each( var key:IQualifiedKey in keys)
			{
				/*if the keytype is different from the keytype of points visualized on Rad Vis than ignore*/
				if(key.keyType != requiredKeyType)
				{
					continue;
				}
				getXYcoordinates(key);
				dataBounds.projectPointTo(coordinate, screenBounds);
				var normArray:Array = (localNormalization.value) ? keyNormMap[key] : keyGlobalNormMap[key];
				var value:number;
				var anchor:AnchorPoint;
				for (var i:int = 0; i < _cols.length; i++)
				{
					var column:IAttributeColumn = _cols[i];
					value = normArray ? normArray[i] : getNorm(column, key);
					
					/*only draw probe line if higher than threshold value*/
					if (isNaN(value) || value <= probeLineNormalizedThreshold.value)
						continue;
					
					/*draw the line from point to anchor*/
					anchor = anchors.getObject(columns.getName(column)) as AnchorPoint;
					tempPoint.x = anchor.x.value;
					tempPoint.y = anchor.y.value;
					dataBounds.projectPointTo(tempPoint, screenBounds);
					graphics.lineStyle(.5, 0xff0000);
					graphics.moveTo(coordinate.x, coordinate.y);
					graphics.lineTo(tempPoint.x, tempPoint.y);
					
					/*We  draw the value (upto to 1 decimal place) in the middle of the probe line. We use the solution as described here:
					http://cookbooks.adobe.com/post_Adding_text_to_flash_display_Graphics_instance-14246.html
					*/
					DrawUtils.clearLineStyle(graphics);
					var uit:UITextField = new UITextField();
					var numberValue:string = ColumnUtils.getNumber(column,key).toString();
					numberValue = numberValue.substring(0,numberValue.indexOf('.')+2);
					uit.text = numberValue;
					uit.autoSize = TextFieldAutoSize.LEFT;
					var textBitmapData:BitmapData = ImageSnapshot.captureBitmapData(uit);
					
					var sizeMatrix:Matrix = new Matrix();
					var coef:number =Math.min(uit.measuredWidth/textBitmapData.width,uit.measuredHeight/textBitmapData.height);
					sizeMatrix.a = coef;
					sizeMatrix.d = coef;
					textBitmapData = ImageSnapshot.captureBitmapData(uit,sizeMatrix);
					
					var sm:Matrix = new Matrix();
					sm.tx = (coordinate.x+tempPoint.x)/2;
					sm.ty = (coordinate.y+tempPoint.y)/2;
					
					graphics.beginBitmapFill(textBitmapData, sm, false);
					graphics.drawRect((coordinate.x+tempPoint.x)/2,(coordinate.y+tempPoint.y)/2,uit.measuredWidth,uit.measuredHeight);
					graphics.endFill();
					
				}
				
				//				for each( var anchor:AnchorPoint in anchors.getObjects(AnchorPoint))
				//				{
				//					tempPoint.x = anchor.x.value;
				//					tempPoint.y = anchor.y.value;
				//					dataBounds.projectPointTo(tempPoint, screenBounds);
				//					graphics.lineStyle(.5, 0xff0000);
				//					graphics.moveTo(coordinate.x, coordinate.y);
				//					graphics.lineTo(tempPoint.x, tempPoint.y);					
				//				}
			}
		}
		
		public drawProbeLinesForSelectedAnchors(anchorKeys:Array,dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if(!drawProbe) return;
			if(!anchorKeys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if(filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = filteredKeySet.keys[0].keyType;
			var keys:Array = filteredKeySet.keys;
			var _cols:Array = columns.getObjects();
			
			for each( var anchorKey :IQualifiedKey in anchorKeys)
			{
				for each(var key:IQualifiedKey in keys)
				{
					
					getXYcoordinates(key);
					dataBounds.projectPointTo(coordinate, screenBounds);
					var value:number;
					var anchor:AnchorPoint;
					var column:IAttributeColumn = columns.getObject(anchorKey.localName) as IAttributeColumn;
					value = getNorm(column, key);
					
					/*only draw probe line if higher than threshold value*/
					if (isNaN(value) || value <= probeLineNormalizedThreshold.value)
						continue;
					
					/*draw the line from point to anchor*/
					if(showAnchorProbeLines.value) {
						anchor = anchors.getObject(columns.getName(column)) as AnchorPoint;
						tempPoint.x = anchor.x.value;
						tempPoint.y = anchor.y.value;
						dataBounds.projectPointTo(tempPoint, screenBounds);
						graphics.lineStyle(.5, 0xff0000);
						graphics.moveTo(coordinate.x, coordinate.y);
						graphics.lineTo(tempPoint.x, tempPoint.y);
					}
					
					
					/*We  draw the value (upto to 1 decimal place) in the middle of the probe line. We use the solution as described here:
					http://cookbooks.adobe.com/post_Adding_text_to_flash_display_Graphics_instance-14246.html
					*/
					if(showValuesForAnchorProbeLines.value)
					{
						DrawUtils.clearLineStyle(graphics);
						var uit:UITextField = new UITextField();
						var numberValue:string = ColumnUtils.getNumber(column,key).toString();
						numberValue = numberValue.substring(0,numberValue.indexOf('.')+2);
						uit.text = numberValue;
						uit.autoSize = TextFieldAutoSize.LEFT;
						var textBitmapData:BitmapData = ImageSnapshot.captureBitmapData(uit);
						
						var sizeMatrix:Matrix = new Matrix();
						var coef:number =Math.min(uit.measuredWidth/textBitmapData.width,uit.measuredHeight/textBitmapData.height);
						sizeMatrix.a = coef;
						sizeMatrix.d = coef;
						textBitmapData = ImageSnapshot.captureBitmapData(uit,sizeMatrix);
						
						var sm:Matrix = new Matrix();
						sm.tx = (coordinate.x+tempPoint.x)/2;
						sm.ty = (coordinate.y+tempPoint.y)/2;
						
						graphics.beginBitmapFill(textBitmapData, sm, false);
						graphics.drawRect((coordinate.x+tempPoint.x)/2,(coordinate.y+tempPoint.y)/2,uit.measuredWidth,uit.measuredHeight);
						graphics.endFill();
					}
					
				}
			}
		}
		
		public drawAnnuli:boolean = false;
		
		public drawAnnuliCircles(keys:Array,dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if(!drawAnnuli) return;
			if(!keys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if(filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = filteredKeySet.keys[0].keyType;
						var psCols:Array = pointSensitivityColumns;
			var cols:Array = columns.getObjects();
			var annCols:Array = annCenterColumns;
			var normArray:Array = (localNormalization.value) ? keyNormMap[key] : keyGlobalNormMap[key];
			var linkLengths:Array = [];
			var innerRadius:number = 0;
			var outerRadius:number = 0;
			var temp:number = 0;
			var eta:number = 0;
			var annCenterX:number = 0;
			var annCenterY:number = 0;
			var anchor:AnchorPoint;
			var i:int = 0;
			var colorIncrementor:number = 0x00f0f0;
			var color:number = 0xff0000;
			
			for each( var key:IQualifiedKey in keys)
			{
				
				linkLengths = [];
				eta = 0;
				innerRadius = 0;
				outerRadius = 0;
				annCenterX = 0;
				annCenterY = 0;

				/*if the keytype is different from the keytype of points visualized on Rad Vis than ignore*/
				if(key.keyType != requiredKeyType)
				{
					return;
				}
				getXYcoordinates(key);
				dataBounds.projectPointTo(coordinate, screenBounds);
				// compute the etta term for a record
				for (i = 0; i < cols.length; i++)
				{
					var column:IAttributeColumn = cols[i];
					var value:number = normArray ? normArray[i] : getNorm(column, key);
					if (isNaN(value))
					{
						value = 0;
					}
					eta += value;
				}
				
				// compute the link lengths for a record
				for (i = 0; i < psCols.length; i++)
				{
					column = psCols[i];
					value = normArray ? normArray[i] : getNorm(column, key);
					if(isNaN(value))
					{
						value = 0;	
					}
					linkLengths.push(value/eta);
				}
				
				//trace(linkLengths);
				// compute the annulus center for a record
				for (i = 0; i < annCols.length; i++)
				{
					column = annCols[i];
					value = normArray ? normArray[i] : getNorm(column, key);
					if(isNaN(value))
					{
						value = 0
					}
					anchor = anchors.getObject(columns.getName(column)) as AnchorPoint;
					annCenterX += (value * anchor.x.value)/eta;
					annCenterY += (value * anchor.y.value)/eta;
				}
				
				var maxLength:number = Math.max.apply(null, linkLengths);

				// the outer Radius is the sum of all the linkLengths
				// the inner Radius is the difference between the longest arm
				// and the remaining arms, and 0 if the difference is negative
				for (i = 0; i < linkLengths.length; i++)
				{
					outerRadius += linkLengths[i];
					if (linkLengths[i] != maxLength){
						temp += linkLengths[i];
					}
				}
			
				innerRadius = maxLength - temp;
				
				if (innerRadius < 0) {
					innerRadius = 0;
				}
				
				var annCenter:Point = new Point(annCenterX, annCenterY);
				dataBounds.projectPointTo(annCenter, screenBounds);
				
				// calculates the radViz radius in screenBounds
				var center:Point = new Point(-1, -1);
				dataBounds.projectPointTo(center, screenBounds);
				var x:number = center.x;
				var y:number = center.y;
				center.x = 1;
				center.y = 1;
				dataBounds.projectPointTo(center, screenBounds);
				var circleRadius:number = (center.x - x) / 2;

				dataBounds.projectPointTo(tempPoint, screenBounds);
				graphics.lineStyle(1, color);
				color += colorIncrementor;
				//graphics.drawCircle(coordinate.x, coordinate.y, 30);
				//trace(outerRadius, innerRadius);
				graphics.drawCircle(annCenter.x, annCenter.y, outerRadius*circleRadius);
				graphics.drawCircle(annCenter.x, annCenter.y, innerRadius*circleRadius);
				
				if(showAnnulusCenter.value) {
					graphics.lineStyle(1, 0);
					graphics.beginFill(0);
					graphics.drawCircle(annCenter.x, annCenter.y, 3);
				}
				graphics.endFill();
			}
		}
		
		private changeAlgorithm():void
		{
			if(_currentScreenBounds.isEmpty()) return;
			
			var newAlgorithm:Class = algorithms[currentAlgorithm.value];
			if (newAlgorithm == null) 
				return;
			
			disposeObject(_algorithm); // clean up previous algorithm
			
			_algorithm = Weave.linkableChild(this, newAlgorithm);
			this.addSpatialDependencies(_algorithm);
			var array:Array = _algorithm.run(columns.getObjects(IAttributeColumn), keyNumberMap);
			
			RadVizUtils.reorderColumns(columns, array);
		}
		
		public sampleTitle:LinkableString = Weave.linkableChild(this, new LinkableString(""));
		public dataSetName:LinkableString = Weave.linkableChild(this, new LinkableString());
		public regularSampling:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public RSampling:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public sampleSizeRows:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(300));
		public sampleSizeColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(20));
		public sampleDataSet():void
		{
			// we use the CSVDataSource so we can get the rows.
			var originalCSVDataSource:CSVDataSource = WeaveAPI.globalHashMap.getObject(dataSetName.value) as CSVDataSource;
			var randomIndex:int = 0; // random index to randomly pick a row.
			var i:int; // used to iterate over the data.
			var originalArray:Array = [];
			var sampledArray:Array = [];
			var transposedSampledArray:Array = [];
			var col:int;
			var row:int;
			
			if (regularSampling.value && !RSampling.value) // sampling done in actionscript
			{
				// rows first
				if (originalCSVDataSource)
				{
					originalArray = originalCSVDataSource.getCSVData().concat(); // get a copy. otherwise we modify the original array.
				} 
				else
				{
					trace(this, "No data found.");
					return;
				}
				if (originalArray.length < sampleSizeRows.value)
				{
					sampledArray = originalArray; // sample size is bigger than the data set.
					trace(this, "Data sampled successfully.");
				}
				else // sampling begins here
				{
					var titleRow:Array = originalArray.shift(); // throwing the column names first row.
					i = sampleSizeRows.value; // we need to reduce this number by one because the title row already accounts for a row
					var length:int = originalArray.length;
					while( i != 0 )
					{
						randomIndex = int(Math.random() * (length));
						sampledArray.push(originalArray[randomIndex]);
						originalArray.splice(randomIndex, 1);
						length--;
						i--;
					}
					sampledArray.unshift(titleRow); // we put the title row back here..
					originalArray.length = 0; // we clear this array since we don't need it anymore.
					// Sampling is done. we wrap it back into a CSVDataSource
					
					
					transposedSampledArray = transposeDataArray(sampledArray);
					var firstColumn:Array = transposedSampledArray.shift(); // assumed to be the Id column
					var secondColumn:Array = transposedSampledArray.shift(); // assumed to be the class column
					
					// proceed as above with a transposed csv... not sure if there is a better way to do this.
					if (transposedSampledArray.length < sampleSizeColumns.value - 2)
					{
						sampledArray = transposeDataArray(transposedSampledArray); // sample size is bigger than the data set.
					}
					else // column sampling begins here
					{
						i = sampleSizeColumns.value - 2; // we need to reduce this number by one because the title row already accounts for a row
						length = transposedSampledArray.length; // accounted for the first two columns removed.
						sampledArray = []; // making this sampled array reusable
						while( i != 0 )
						{
							randomIndex = int(Math.random() * (length));
							sampledArray.push(transposedSampledArray[randomIndex]);
							transposedSampledArray.splice(randomIndex, 1);
							length--;
							i--;
						}
						transposedSampledArray.splice(0);
						sampledArray.unshift(secondColumn);
						sampledArray.unshift(firstColumn);
						var temp:Array = sampledArray; // quick older for the sample array to be transposed again
						sampledArray = transposeDataArray(temp); // at this stage we should have a complete row and column sample
					}
					
					// begin saving the CSVDataSource.
					if (sampleTitle.value == "" || sampleTitle.value == "optional")
					{
						sampleTitle.value = WeaveAPI.globalHashMap.generateUniqueName("Sampled " + WeaveAPI.globalHashMap.getName(originalCSVDataSource));
					}
					var sampledCSVDataSource:CSVDataSource = WeaveAPI.globalHashMap.requestObject(sampleTitle.value, CSVDataSource, false);
					sampledCSVDataSource.setCSVData(sampledArray);
					sampledCSVDataSource.keyType.value = originalCSVDataSource.keyType.value;
					trace(this, "Data sampled successfully");
					sampleTitle.value = "";
				} 
			}
				
			else // Rsampling
			{
				// TODO
				// R documentation says to pass it a vector (2 dimensional?)
				// sample(x, size, replace = FALSE, prob = NULL)
				//
				// arguments
				// x       Vector of one or more elements
				// size    The sample size
				// replace Should sampling be done with replacement
				// prob    vector of probability weights (should be null for random sampling)
			}
			return;			
		}
		
		/**
		 * @param array must be two dimensional array
		 * 
		 * @return transposed array
		 **/
		
		private transposeDataArray (array:Array):Array
		{
			var i:int = 0;
			var j:int = 0;
			if(array)
				var rowLength:int = array.length;
			if (array[0])
				var colLength:int = array[0].length;	
			
			var transposed:Array = new Array(colLength);
			
			for (i = 0; i < colLength; i++)
			{
				transposed[i] = new Array(rowLength);
				for (j = 0; j < rowLength; j++)
					transposed[i][j] = array[j][i];
			}
			return transposed;
		}
		
		private _algorithm:ILayoutAlgorithm = Weave.linkableChild(this, GreedyLayoutAlgorithm);
		
		// algorithms
		[Bindable] public algorithms:Array = [RANDOM_LAYOUT, GREEDY_LAYOUT, NEAREST_NEIGHBOR, INCREMENTAL_LAYOUT, BRUTE_FORCE];
		public currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString(GREEDY_LAYOUT), changeAlgorithm);
		public static RANDOM_LAYOUT:string = "Random layout";
		public static GREEDY_LAYOUT:string = "Greedy layout";
		public static NEAREST_NEIGHBOR:string = "Nearest neighbor";
		public static INCREMENTAL_LAYOUT:string = "Incremental layout";
		public static BRUTE_FORCE:string = "Brute force";
	}
}
