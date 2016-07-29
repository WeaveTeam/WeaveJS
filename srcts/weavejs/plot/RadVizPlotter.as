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
	import Graphics = PIXI.Graphics;
	import Point = weavejs.geom.Point;

	import UITextField = mx.core.UITextField;
	import ImageSnapshot = mx.graphics.ImageSnapshot;
	
	import disposeObject = weavejs.api.disposeObject;
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
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import Dictionary2D = weavejs.util.Dictionary2D;

	/**
	 * RadVizPlotter
	 */
	export class RadVizPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			this.fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.setNewRandomJitterColumn();		
			this.iterations.value = 50;
			this.algorithms[RadVizPlotter.RANDOM_LAYOUT] = RandomLayoutAlgorithm;
			this.algorithms[RadVizPlotter.GREEDY_LAYOUT] = GreedyLayoutAlgorithm;
			this.algorithms[RadVizPlotter.NEAREST_NEIGHBOR] = NearestNeighborLayoutAlgorithm;
			this.algorithms[RadVizPlotter.INCREMENTAL_LAYOUT] = IncrementalLayoutAlgorithm;
			this.algorithms[RadVizPlotter.BRUTE_FORCE] = BruteForceLayoutAlgorithm;
			this.columns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			Weave.getCallbacks(this.filteredKeySet).addGroupedCallback(this, this.handleColumnsChange, true);
			Weave.getCallbacks(this).addImmediateCallback(this, this.clearCoordCache);
			this.columns.addGroupedCallback(this, this.handleColumnsChange);
			this.absNorm.addGroupedCallback(this, this.handleColumnsChange);
			this.normMin.addGroupedCallback(this, this.handleColumnsChange);
			this.normMax.addGroupedCallback(this, this.handleColumnsChange);

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
			var newColumn:IAttributeColumn = this.columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			var newColumnName:string = this.columns.childListCallbacks.lastNameAdded;
			if (newColumn != null)
			{
				// invariant: same number of anchors and columns
				this.anchors.requestObject(newColumnName, AnchorPoint, false);
				// When a new column is created, register the stats to trigger callbacks and affect busy status.
				// This will be cleaned up automatically when the column is disposed.
				var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(newColumn);
				this.addSpatialDependencies(stats);
				Weave.getCallbacks(stats).addGroupedCallback(this, this.handleColumnsChange);
			}
			var oldColumnName:string = this.columns.childListCallbacks.lastNameRemoved;
			if (oldColumnName != null)
			{
				// invariant: same number of anchors and columns
				this.anchors.removeObject(oldColumnName);
			}
		}
		
		public getSelectableAttributeNames()
		{
			return ["Size", "Color", "Anchor Dimensions"];
		}
		
		public getSelectableAttributes()
		{
			return [this.radiusColumn, this.fillStyle.color, this.columns];
		}
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		
		public pointSensitivitySelection:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array), this.updatePointSensitivityColumns);
				
		public localNormalization:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public probeLineNormalizedThreshold:LinkableNumber = Weave.linkableChild(this,new LinkableNumber(0, this.verifyThresholdValue));
		public showValuesForAnchorProbeLines:LinkableBoolean= Weave.linkableChild(this,new LinkableBoolean(false));
		
		public showAnchorProbeLines:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		private pointSensitivityColumns:Array = [];
		private annCenterColumns:Array = [];
		public showAnnulusCenter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public absNorm:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public normMin:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public normMax:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		
		private verifyThresholdValue(value:any):boolean
		{
			if (0<=Number(value) && Number(value)<=1)
				return true;
			else
				return false;
		}
		
		private updatePointSensitivityColumns():void
		{
			this.pointSensitivityColumns = [];
			this.annCenterColumns = [];
			var tempArray:Array = this.pointSensitivitySelection.getSessionState() as Array || [];
			var cols:Array = this.columns.getObjects();
			for ( var i:int = 0; i < tempArray.length; i++)
			{
				if (tempArray[i])
				{
					this.pointSensitivityColumns.push(cols[i]);
				} else
				{
					this.annCenterColumns.push(cols[i]);
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
		public get alphaColumn():AlwaysDefinedColumn { return this.fillStyle.alpha; }
		public colorMap:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired"))) ;
		
		public LayoutClasses:Map = null;//(Set via the editor) needed for setting the Cd layout dimensional anchor  locations
		
		private minRadius:number = 2;
		private maxRadius:number = 10;
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		private radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.radiusColumn));
		public radiusConstant:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		
		private randomValueArray:number[] = [];
		private randomArrayIndexMap:WeakMap<IQualifiedKey, number> = new WeakMap();
		private keyNumberMap:Dictionary2D<IQualifiedKey, IAttributeColumn, Number> = new Dictionary2D<IQualifiedKey, IAttributeColumn, Number>(true, true);
		private keyNormMap:WeakMap<IQualifiedKey, number> = new WeakMap();
		private keyGlobalNormMap:WeakMap<IQualifiedKey, number> = new WeakMap();
		
		private _currentScreenBounds:Bounds2D = new Bounds2D();
		
		public doCDLayoutFlag:boolean = false; // ToDo yenfu temporary flag to fix the code
		
		private handleColumnsChange():void
		{
			if (Weave.isBusy(this.columns) || Weave.isBusy(this.spatialCallbacks))
				return;
			
			var i:int = 0;
			var keyNormArray:Array;
			var columnNormArray:Array;
			var columnNumberMap:Map<IAttributeColumn, number>;
			var columnNumberArray:Array;
			var sum:number = 0;
			
			this.randomArrayIndexMap = 	new WeakMap();
			var keyMaxMap:WeakMap<IQualifiedKey, number> = new WeakMap();
			var keyMinMap:WeakMap<IQualifiedKey, number> = new WeakMap();
			this.keyNormMap = 			new WeakMap();
			this.keyGlobalNormMap = 		new WeakMap();
			this.keyNumberMap = 			new Dictionary2D<IQualifiedKey, IAttributeColumn, Number>();
			
			
			this.setAnchorLocations();//normal layout
			
			var keySources = this.columns.getObjects(IAttributeColumn);
			if (keySources.length > 0) 
			{
				keySources.unshift(this.radiusColumn);
				var sortDirections = keySources.map(function(c:any, i:int, a:any):int { return i == 0 ? -1 : 1; });
				this.setColumnKeySources(keySources, sortDirections);
				
				for ( var key of this.filteredKeySet.keys)
				{					
					this.randomArrayIndexMap[key] = i ;										
					var magnitude:number = 0;
					columnNormArray = [];
					columnNumberArray = [];
					columnNumberMap = new WeakMap();
					sum = 0;
					for ( var column of this.columns.getObjects(IAttributeColumn))
					{
						columnNormArray.push(this.getNorm(column, key));
						columnNumberMap.set(column, column.getValueFromKey(key, Number) as number);
						columnNumberArray.push(columnNumberMap.get(column));
					}
					for (var x of columnNumberMap.values())
					{
						magnitude += (x*x);
					}					
					keyMaxMap[key] = Math.sqrt(magnitude);
					keyMinMap[key] = Math.min.apply(null, columnNumberArray);
					
					this.keyNumberMap[key] = columnNumberMap ;	
					this.keyNormMap[key] = columnNormArray ;
					i++
				}
				
				for ( var k:IQualifiedKey of this.filteredKeySet.keys)
				{
					keyNormArray = [];
					i = 0;
					for ( var col:IAttributeColumn of this.columns.getObjects())
					{
						keyNormArray.push((this.keyNumberMap.get(k, col) - keyMinMap.get(k))/(keyMaxMap[k] - keyMinMap[k]));
						i++;
					}					
					this.keyGlobalNormMap[k] = keyNormArray;
					
				}
			}
			else
			{
				this.setSingleKeySource(null);
			}
			
			this.setAnchorLocations();
			
			if (this.doCDLayoutFlag)
				this.setClassDiscriminationAnchorsLocations();
			
			this.clearCoordCache();
		}
		
		private getNorm(column:IAttributeColumn, key:IQualifiedKey):number
		{
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var _absNorm:boolean = this.absNorm.value;
			var _normMin:number = this.normMin.value;
			var _normMax:number = this.normMax.value;
			
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
		
		public setclassDiscriminationMetric(tandpMapping:Map,tandpValuesMapping:Map):void
		{
			var anchorObjects:Array = this.anchors.getObjects(AnchorPoint);
			var anchorNames:Array = this.anchors.getNames(AnchorPoint);
			for (var type:Object in tandpMapping)
			{
				var colNamesArray:Array = tandpMapping[type];
				var colValuesArray:Array = tandpValuesMapping[type+"metricvalues"];
				for (var n:int = 0; n < anchorNames.length; n++)//looping through all columns
				{
					var tempAnchorName:string = anchorNames[n];
					for (var c:int =0; c < colNamesArray.length; c++)
					{
						if (tempAnchorName == colNamesArray[c])
						{
							var tempAnchor:AnchorPoint = (this.anchors.getObject(tempAnchorName)) as AnchorPoint;
							tempAnchor.classDiscriminationMetric.value = colValuesArray[c];
							tempAnchor.classType.value = String(type);
						}
						
					}
				}
				
			}
			
		}
		public setAnchorLocations( ):void
		{	
			var _columns:Array = this.columns.getObjects();
			
			var theta:number = (2*Math.PI)/_columns.length;
			var anchor:AnchorPoint;
			this.anchors.delayCallbacks();
			//anchors.removeAllObjects();
			for ( var i:int = 0; i < _columns.length; i++ )
			{
				anchor = this.anchors.getObject(this.columns.getName(_columns[i])) as AnchorPoint ;								
				anchor.x.value = Math.cos(theta*i);
				//trace(anchor.x.value);
				anchor.y.value = Math.sin(theta*i);	
				//trace(anchor.y.value);
				anchor.title.value = ColumnUtils.getTitle(_columns[i]);
			}
			this.anchors.resumeCallbacks();
		}
		
		public anchorLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction("Class('weave.utils.ColumnUtils').getTitle(column)", true, ['column']), this.setClassDiscriminationAnchorsLocations);
		
		//this function sets the anchor locations for the Class Discrimination Layout algorithm and marks the Class locations
		public setClassDiscriminationAnchorsLocations():void
		{
			var numOfClasses:int = 0;
			for ( var type:Object in this.LayoutClasses)
			{
				numOfClasses++;
			}
			this.anchors.delayCallbacks();
			//anchors.removeAllObjects();
			var classTheta:number = (2*Math.PI)/(numOfClasses);
			
			var classIncrementor:number = 0;
			for ( var cdtype:Object in this.LayoutClasses)
			{
				var cdAnchor:AnchorPoint;
				var colNames:Array = (this.LayoutClasses[cdtype] as Array);
				var numOfDivs:int = colNames.length + 1;
				var columnTheta:number = classTheta /numOfDivs;//needed for equidistant spacing of columns
				var currentClassPos:number = classTheta * classIncrementor;
				var columnIncrementor:int = 1;//change
				
				for ( var g :int = 0; g < colNames.length; g++)//change
				{
					cdAnchor = this.anchors.getObject(colNames[g]) as AnchorPoint;
					cdAnchor.x.value  = Math.cos(currentClassPos + (columnTheta * columnIncrementor));
					cdAnchor.y.value = Math.sin(currentClassPos + (columnTheta * columnIncrementor));
					cdAnchor.title.value = this.anchorLabelFunction.apply(null, [this.columns.getObject(colNames[g]) as IAttributeColumn]);
					columnIncrementor++;//change
				}
				
				classIncrementor++;
			}
			
			this.anchors.resumeCallbacks();
			
		}
		
		
		private coordCache:Map = new WeakMap();
		private clearCoordCache():void
		{
			this.coordCache = new WeakMap();
		}
		
		/**
		 * Applies the RadViz algorithm to a record specified by a recordKey
		 */
		private getXYcoordinates(recordKey:IQualifiedKey):void
		{
			var cached:Array = this.coordCache[recordKey] as Array;
			if (cached)
			{
				this.coordinate.x = cached[0];
				this.coordinate.y = cached[1];
				return;
			}
			
			//implements RadViz algorithm for x and y coordinates of a record
			var numeratorX:number = 0;
			var numeratorY:number = 0;
			var denominator:number = 0;
			
			var anchorArray:Array = this.anchors.getObjects();			
			
			var value:number = 0;
			var anchor:AnchorPoint;
			var normArray:Array = this.localNormalization.value ? this.keyNormMap[recordKey] : this.keyGlobalNormMap[recordKey];
			var _cols:Array = this.columns.getObjects();
			for (var i:int = 0; i < _cols.length; i++)
			{
				var column:IAttributeColumn = _cols[i];
				value = normArray ? normArray[i] : this.getNorm(column, recordKey);
				if (isNaN(value))
					continue;
				
				anchor = this.anchors.getObject(this.columns.getName(column)) as AnchorPoint;
				numeratorX += value * anchor.x.value;
				numeratorY += value * anchor.y.value;						
				denominator += value;
			}
			if (denominator==0)
			{
				denominator = 1;
			}
			this.coordinate.x = (numeratorX/denominator);
			this.coordinate.y = (numeratorY/denominator);
			//trace(recordKey.localName,coordinate);
			if ( this.enableJitter.value )
				this.jitterRecords(recordKey);
			
			this.coordCache[recordKey] = [this.coordinate.x, this.coordinate.y];
		}
		
		private jitterRecords(recordKey:IQualifiedKey):void
		{
			var index:number = this.randomArrayIndexMap[recordKey];
			var jitter:number = Math.abs(StandardLib.asNumber(this.jitterLevel.value));
			var xJitter:number = (this.randomValueArray[index])/(jitter);
			if (this.randomValueArray[index+1] % 2) xJitter *= -1;
			var yJitter:number = (this.randomValueArray[index+2])/(jitter);
			if (this.randomValueArray[index+3])yJitter *= -1;
			if (!isNaN(xJitter))this.coordinate.x += xJitter ;
			if (!isNaN(yJitter))this.coordinate.y += yJitter ;
		}
		
		/**
		 * Repopulates the static randomValueArray with new random values to be used for jittering
		 */
		public setNewRandomJitterColumn():void
		{
			this.randomValueArray = [] ;
			if ( this.randomValueArray.length == 0 )
				for ( var i:int = 0; i < 5000 ;i++ )
				{
					this.randomValueArray.push( Math.random() % 10) ;
					this.randomValueArray.push( -(Math.random() % 10)) ;
				}
			this.spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (task.iteration == 0)
			{
				if (this.columns.getObjects().length != this.anchors.getObjects().length)
					return 1;
				if (Weave.detectChange(this.drawPlotAsyncIteration, this.lineStyle, this.fillStyle, this.radiusConstant, this.radiusColumn))
					this.keyToGlyph = new WeakMap();
				task.asyncState = 0;
			}
			for (var recordIndex:int = int(task.asyncState); recordIndex < task.recordKeys.length; task.asyncState = ++recordIndex)
			{
				// if time is up, report progress
				if (Date.now() > task.iterationStopTime)
					return recordIndex / task.recordKeys.length;
				
				var key:IQualifiedKey = task.recordKeys[recordIndex] as IQualifiedKey;
				
				this.getXYcoordinates(key);
				// skip if excluded from subset or missing x,y
				if (this.filteredKeySet.containsKey(key) && isFinite(this.coordinate.x) && isFinite(this.coordinate.y))
				{
					task.dataBounds.projectPointTo(this.coordinate, task.screenBounds);
					var radius:number;
					if (this.useGlyphCache)
					{
						var glyph:CachedBitmap = this.keyToGlyph[key];
						if (!glyph)
						{
							if (this.radiusColumn.getInternalColumn())
								radius = this.minRadius + this.radiusColumnStats.getNorm(key) * (this.maxRadius - this.minRadius);
							else
								radius = this.radiusConstant.value;
							
							this.keyToGlyph[key] = glyph = this.getCachedGlyph(
								this.lineStyle.getLineStyleParams(key),
								this.fillStyle.getBeginFillParams(key),
								StandardLib.roundSignificant(radius, 3),
								this.radiusConstant.value
							);
						}
						glyph.drawTo(task.buffer, Math.round(this.coordinate.x), Math.round(this.coordinate.y));
					}
					else
					{
						if (this.radiusColumn.getInternalColumn())
							radius = this.minRadius + this.radiusColumnStats.getNorm(key) * (this.maxRadius - this.minRadius);
						else
							radius = this.radiusConstant.value;
						var shape:Shape = this.drawGlyph(
							this.lineStyle.getLineStyleParams(key),
							this.fillStyle.getBeginFillParams(key),
							StandardLib.roundSignificant(radius, 3),
							this.radiusConstant.value
						);
						this.tempMatrix.identity();
						this.tempMatrix.translate(this.coordinate.x, this.coordinate.y);
						task.buffer.draw(shape, this.tempMatrix);
					}
				}
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}
		
		private keyToGlyph:Map = new WeakMap();
		private tempMatrix:Matrix = new Matrix();
		public useGlyphCache:boolean = true;
		
		/**
		 * A memoized version of drawGlyph() which returns a CachedBitmap object.
		 */
		private getCachedGlyph:Function = Compiler.memoize(function() {
			return Weave.disposableChild(this, new CachedBitmap(this.drawGlyph.apply(this, args)));
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
			//if (!unorderedColumns.length) handleColumnsChange();
			this.getXYcoordinates(recordKey);
			
			this.initBoundsArray(output).includePoint(this.coordinate);
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
			if (!this.drawProbe) return;
			if (!keys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if (this.filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = this.filteredKeySet.keys[0].keyType;
			var _cols:Array = this.columns.getObjects();
			
			for ( var key:IQualifiedKey of keys || [])
			{
				/*if the keytype is different from the keytype of points visualized on Rad Vis than ignore*/
				if (key.keyType != requiredKeyType)
				{
					continue;
				}
				this.getXYcoordinates(key);
				dataBounds.projectPointTo(this.coordinate, screenBounds);
				var normArray:Array = (this.localNormalization.value) ? this.keyNormMap[key] : this.keyGlobalNormMap[key];
				var value:number;
				var anchor:AnchorPoint;
				for (var i:int = 0; i < _cols.length; i++)
				{
					var column:IAttributeColumn = _cols[i];
					value = normArray ? normArray[i] : this.getNorm(column, key);
					
					/*only draw probe line if higher than threshold value*/
					if (isNaN(value) || value <= this.probeLineNormalizedThreshold.value)
						continue;
					
					/*draw the line from point to anchor*/
					anchor = this.anchors.getObject(this.columns.getName(column)) as AnchorPoint;
					this.tempPoint.x = anchor.x.value;
					this.tempPoint.y = anchor.y.value;
					dataBounds.projectPointTo(this.tempPoint, screenBounds);
					graphics.lineStyle(.5, 0xff0000);
					graphics.moveTo(this.coordinate.x, this.coordinate.y);
					graphics.lineTo(this.tempPoint.x, this.tempPoint.y);
					
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
					sm.tx = (this.coordinate.x+this.tempPoint.x)/2;
					sm.ty = (this.coordinate.y+this.tempPoint.y)/2;
					
					graphics.beginBitmapFill(textBitmapData, sm, false);
					graphics.drawRect((this.coordinate.x+this.tempPoint.x)/2,(this.coordinate.y+this.tempPoint.y)/2,uit.measuredWidth,uit.measuredHeight);
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
		
		public drawProbeLinesForSelectedAnchors(anchorKeys:IQualifiedKey,dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (!this.drawProbe) return;
			if (!anchorKeys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if (this.filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = this.filteredKeySet.keys[0].keyType;
			var keys:Array = this.filteredKeySet.keys;
			var _cols:Array = this.columns.getObjects();
			
			for ( var anchorKey :IQualifiedKey of anchorKeys || [])
			{
				for (var key:IQualifiedKey of keys)
				{
					
					this.getXYcoordinates(key);
					dataBounds.projectPointTo(this.coordinate, screenBounds);
					var value:number;
					var anchor:AnchorPoint;
					var column:IAttributeColumn = this.columns.getObject(anchorKey.localName) as IAttributeColumn;
					value = this.getNorm(column, key);
					
					/*only draw probe line if higher than threshold value*/
					if (isNaN(value) || value <= this.probeLineNormalizedThreshold.value)
						continue;
					
					/*draw the line from point to anchor*/
					if (this.showAnchorProbeLines.value) {
						anchor = this.anchors.getObject(this.columns.getName(column)) as AnchorPoint;
						this.tempPoint.x = anchor.x.value;
						this.tempPoint.y = anchor.y.value;
						dataBounds.projectPointTo(this.tempPoint, screenBounds);
						graphics.lineStyle(.5, 0xff0000);
						graphics.moveTo(this.coordinate.x, this.coordinate.y);
						graphics.lineTo(this.tempPoint.x, this.tempPoint.y);
					}
					
					
					/*We  draw the value (upto to 1 decimal place) in the middle of the probe line. We use the solution as described here:
					http://cookbooks.adobe.com/post_Adding_text_to_flash_display_Graphics_instance-14246.html
					*/
					if (this.showValuesForAnchorProbeLines.value)
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
						sm.tx = (this.coordinate.x+this.tempPoint.x)/2;
						sm.ty = (this.coordinate.y+this.tempPoint.y)/2;
						
						graphics.beginBitmapFill(textBitmapData, sm, false);
						graphics.drawRect((this.coordinate.x+this.tempPoint.x)/2,(this.coordinate.y+this.tempPoint.y)/2,uit.measuredWidth,uit.measuredHeight);
						graphics.endFill();
					}
					
				}
			}
		}
		
		public drawAnnuli:boolean = false;
		
		public drawAnnuliCircles(keys:Array,dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (!this.drawAnnuli) return;
			if (!keys) return;
			
			var graphics:Graphics = destination;
			graphics.clear();
			
			if (this.filteredKeySet.keys.length == 0)
				return;
			var requiredKeyType:string = this.filteredKeySet.keys[0].keyType;
						var psCols:Array = this.pointSensitivityColumns;
			var cols = this.columns.getObjects(IAttributeColumn);
			var annCols:Array = this.annCenterColumns;
			var normArray:Array = (this.localNormalization.value) ? this.keyNormMap[key] : this.keyGlobalNormMap[key];
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
			
			for ( var key:IQualifiedKey of keys)
			{
				
				linkLengths = [];
				eta = 0;
				innerRadius = 0;
				outerRadius = 0;
				annCenterX = 0;
				annCenterY = 0;

				/*if the keytype is different from the keytype of points visualized on Rad Vis than ignore*/
				if (key.keyType != requiredKeyType)
				{
					return;
				}
				this.getXYcoordinates(key);
				dataBounds.projectPointTo(this.coordinate, screenBounds);
				// compute the etta term for a record
				for (i = 0; i < cols.length; i++)
				{
					var column:IAttributeColumn = cols[i];
					var value:number = normArray ? normArray[i] : this.getNorm(column, key);
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
					value = normArray ? normArray[i] : this.getNorm(column, key);
					if (isNaN(value))
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
					value = normArray ? normArray[i] : this.getNorm(column, key);
					if (isNaN(value))
					{
						value = 0
					}
					anchor = this.anchors.getObject(this.columns.getName(column)) as AnchorPoint;
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

				dataBounds.projectPointTo(this.tempPoint, screenBounds);
				graphics.lineStyle(1, color);
				color += colorIncrementor;
				//graphics.drawCircle(coordinate.x, coordinate.y, 30);
				//trace(outerRadius, innerRadius);
				graphics.drawCircle(annCenter.x, annCenter.y, outerRadius*circleRadius);
				graphics.drawCircle(annCenter.x, annCenter.y, innerRadius*circleRadius);
				
				if (this.showAnnulusCenter.value) {
					graphics.lineStyle(1, 0);
					graphics.beginFill(0);
					graphics.drawCircle(annCenter.x, annCenter.y, 3);
				}
				graphics.endFill();
			}
		}
		
		private changeAlgorithm():void
		{
			if (this._currentScreenBounds.isEmpty()) return;
			
			var newAlgorithm:Class = this.algorithms[this.currentAlgorithm.value];
			if (newAlgorithm == null) 
				return;
			
			disposeObject(this._algorithm); // clean up previous algorithm
			
			this._algorithm = Weave.linkableChild(this, newAlgorithm);
			this.addSpatialDependencies(this._algorithm);
			var array:Array = this._algorithm.run(this.columns.getObjects(IAttributeColumn), this.keyNumberMap);
			
			RadVizUtils.reorderColumns(this.columns, array);
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
			var originalCSVDataSource:CSVDataSource = WeaveAPI.globalHashMap.getObject(this.dataSetName.value) as CSVDataSource;
			var randomIndex:int = 0; // random index to randomly pick a row.
			var i:int; // used to iterate over the data.
			var originalArray:Array = [];
			var sampledArray:Array = [];
			var transposedSampledArray:Array = [];
			var col:int;
			var row:int;
			
			if (this.regularSampling.value && !this.RSampling.value) // sampling done in actionscript
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
				if (originalArray.length < this.sampleSizeRows.value)
				{
					sampledArray = originalArray; // sample size is bigger than the data set.
					trace(this, "Data sampled successfully.");
				}
				else // sampling begins here
				{
					var titleRow:Array = originalArray.shift(); // throwing the column names first row.
					i = this.sampleSizeRows.value; // we need to reduce this number by one because the title row already accounts for a row
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
					
					
					transposedSampledArray = this.transposeDataArray(sampledArray);
					var firstColumn:Array = transposedSampledArray.shift(); // assumed to be the Id column
					var secondColumn:Array = transposedSampledArray.shift(); // assumed to be the class column
					
					// proceed as above with a transposed csv... not sure if there is a better way to do this.
					if (transposedSampledArray.length < this.sampleSizeColumns.value - 2)
					{
						sampledArray = this.transposeDataArray(transposedSampledArray); // sample size is bigger than the data set.
					}
					else // column sampling begins here
					{
						i = this.sampleSizeColumns.value - 2; // we need to reduce this number by one because the title row already accounts for a row
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
						sampledArray = this.transposeDataArray(temp); // at this stage we should have a complete row and column sample
					}
					
					// begin saving the CSVDataSource.
					if (this.sampleTitle.value == "" || this.sampleTitle.value == "optional")
					{
						this.sampleTitle.value = WeaveAPI.globalHashMap.generateUniqueName("Sampled " + WeaveAPI.globalHashMap.getName(originalCSVDataSource));
					}
					var sampledCSVDataSource:CSVDataSource = WeaveAPI.globalHashMap.requestObject(this.sampleTitle.value, CSVDataSource, false);
					sampledCSVDataSource.setCSVData(sampledArray);
					sampledCSVDataSource.keyType.value = originalCSVDataSource.keyType.value;
					trace(this, "Data sampled successfully");
					this.sampleTitle.value = "";
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
			if (array)
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
		public algorithms:Array = [RadVizPlotter.RANDOM_LAYOUT, RadVizPlotter.GREEDY_LAYOUT, RadVizPlotter.NEAREST_NEIGHBOR, RadVizPlotter.INCREMENTAL_LAYOUT, RadVizPlotter.BRUTE_FORCE];
		public currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString(RadVizPlotter.GREEDY_LAYOUT), this.changeAlgorithm);
		public static RANDOM_LAYOUT:string = "Random layout";
		public static GREEDY_LAYOUT:string = "Greedy layout";
		public static NEAREST_NEIGHBOR:string = "Nearest neighbor";
		public static INCREMENTAL_LAYOUT:string = "Incremental layout";
		public static BRUTE_FORCE:string = "Brute force";
	}
}

