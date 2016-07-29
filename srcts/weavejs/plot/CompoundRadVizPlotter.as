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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ILayoutAlgorithm = weavejs.geom.radviz.ILayoutAlgorithm;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ColorRamp = weavejs.util.ColorRamp;
	import BruteForceLayoutAlgorithm = weavejs.geom.radviz.BruteForceLayoutAlgorithm;
	import GreedyLayoutAlgorithm = weavejs.geom.radviz.GreedyLayoutAlgorithm;
	import IncrementalLayoutAlgorithm = weavejs.geom.radviz.IncrementalLayoutAlgorithm;
	import NearestNeighborLayoutAlgorithm = weavejs.geom.radviz.NearestNeighborLayoutAlgorithm;
	import RandomLayoutAlgorithm = weavejs.geom.radviz.RandomLayoutAlgorithm;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DrawUtils = weavejs.util.DrawUtils;
	import RadVizUtils = weavejs.geom.radviz.RadVizUtils;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import D2D_KeyColumnNumber = weavejs.geom.radviz.D2D_KeyColumnNumber;
	import Dictionary2D = weavejs.util.Dictionary2D;

	export class CompoundRadVizPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			super();
			this.fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.setNewRandomJitterColumn();
			this.iterations.value = 50;

			this.columns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			Weave.getCallbacks(this.filteredKeySet).addImmediateCallback(this, this.handleColumnsChange, true);
			Weave.getCallbacks(this).addImmediateCallback(this, this.clearCoordCache);
			this.addSpatialDependencies(this.columns, this.localNormalization, this.anchors, this.jitterLevel, this.enableJitter);
		}
		private handleColumnsListChange():void
		{
			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = Weave.AS(this.columns.childListCallbacks.lastObjectAdded, IAttributeColumn);
			if (newColumn)
			{
				var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(newColumn);
				this.addSpatialDependencies(stats);
				Weave.getCallbacks(stats).addImmediateCallback(this, this.handleColumnsChange);
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
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.handleColumnsChange);
		public localNormalization:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		
		/**
		 * LinkableHashMap of RadViz dimension locations: 
		 * <br/>contains the location of each column as an AnchorPoint object
		 */		
		public anchors:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(AnchorPoint));
		private coordinate:Point = new Point();//reusable object
		private tempPoint:Point = new Point();//reusable object
				
		public jitterLevel:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-19));
		public enableWedgeColoring:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public enableJitter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public iterations:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		public get alphaColumn():AlwaysDefinedColumn { return this.fillStyle.alpha; }
		public colorMap:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired")),this.fillColorMap);
		public anchorColorMap:Map<string, number>;
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		private radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.radiusColumn));
		public radiusConstant:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		
		private static randomValueArray:number[] = [];
		private static randomArrayIndexMap:WeakMap<IQualifiedKey, number>;
		private keyNumberMap:D2D_KeyColumnNumber;
		private keyNormMap:WeakMap<IQualifiedKey, number[]>;
		private keyGlobalNormMap:WeakMap<IQualifiedKey, number[]>;
		private keyMaxMap:WeakMap<IQualifiedKey, number>;
		private keyMinMap:WeakMap<IQualifiedKey, number>;
		private columnTitleMap:WeakMap<IAttributeColumn, string>;
		
		private _currentScreenBounds:Bounds2D = new Bounds2D();
		
		private handleColumnsChange():void
		{
			if (Weave.isBusy(this.columns) || Weave.isBusy(this.spatialCallbacks))
				return;
			
			var i:int = 0;
			var keyNormArray:number[];
			var columnNormArray:number[];
			var columnNumberMap:Map<IAttributeColumn, number>;
			var columnNumberArray:number[];
			this._columns = this.columns.getObjects(IAttributeColumn);
			var sum:number = 0;
			
			CompoundRadVizPlotter.randomArrayIndexMap = 	new WeakMap();
			this.keyMaxMap = 			new WeakMap();
			this.keyMinMap = 			new WeakMap();
			this.keyNormMap = 			new WeakMap();
			this.keyGlobalNormMap = 		new WeakMap();
			this.keyNumberMap = 			new Dictionary2D<IQualifiedKey, IAttributeColumn, number>(true);
			this.columnTitleMap = 		new WeakMap();
			
			if (this._columns.length > 0) 
			{
				var keySources = this._columns.concat();
				keySources.unshift(this.radiusColumn);
				var sortDirections = keySources.map(function(c:any, i:int, a:any):int { return i == 0 ? -1 : 1; });
				this.setColumnKeySources(keySources, sortDirections);
			
				for (var key of this.filteredKeySet.keys)
				{					
					CompoundRadVizPlotter.randomArrayIndexMap.set(key, i);
					var magnitude:number = 0;
					columnNormArray = [];
					columnNumberArray = [];
					columnNumberMap = new Map();
					sum = 0;
					for (var column of this._columns)
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
						if (i == 0)
							this.columnTitleMap.set(column, this.columns.getName(column));
						columnNormArray.push(stats.getNorm(key));
						columnNumberMap.set(column, column.getValueFromKey(key, Number));
						columnNumberArray.push(columnNumberMap.get(column));
					}
					for (var x of columnNumberMap.values())
					{
						magnitude += (x*x);
					}					
					this.keyMaxMap.set(key, Math.sqrt(magnitude));
					this.keyMinMap.set(key, Math.min.apply(null, columnNumberArray));
					
					this.keyNumberMap.map.set(key, columnNumberMap);
					this.keyNormMap.set(key, columnNormArray);
					i++
				}
				
				for (var k of this.filteredKeySet.keys)
				{
					keyNormArray = [];
					i = 0;
					for (var col of this._columns)
					{
						keyNormArray.push((this.keyNumberMap.get(k,col) - this.keyMinMap.get(k))/(this.keyMaxMap.get(k) - this.keyMinMap.get(k)));
						i++;
					}					
					this.keyGlobalNormMap.set(k, keyNormArray);
				}
			}
			else
			{
				this.setSingleKeySource(null);
			}
			
			this.setAnchorLocations();
			this.fillColorMap();
		}
		
		public setAnchorLocations():void
		{
			this._columns = this.columns.getObjects(IAttributeColumn);
			var theta:number = (2*Math.PI)/this._columns.length;
			var anchor:AnchorPoint;
			this.anchors.delayCallbacks();
			this.anchors.removeAllObjects();
			for ( var i:int = 0; i < this._columns.length; i++ )
			{
				anchor = this.anchors.requestObject(this.columns.getName(this._columns[i]), AnchorPoint, false);
				anchor.x.value = Math.cos(theta*i);
				anchor.y.value = Math.sin(theta*i);		
				anchor.title.value = ColumnUtils.getTitle(this._columns[i]);
			}
			this.anchors.resumeCallbacks();
		}			
				
		private fillColorMap():void
		{
			var i:int = 0;
			this.anchorColorMap = new Map();
			var _anchors = this.anchors.getObjects(AnchorPoint);
			
			for (var anchor of this.anchors.getObjects())
			{
				this.anchorColorMap.set(this.anchors.getName(anchor), this.colorMap.getColorFromNorm(i / (_anchors.length - 1)));
				i++;
			}
		}
		
		private coordCache:WeakMap<IQualifiedKey, number[]> = new WeakMap();
		private clearCoordCache():void
		{
			this.coordCache = new WeakMap();
		}
		
		/**
		 * Applies the RadViz algorithm to a record specified by a recordKey
		 */
		private getXYcoordinates(recordKey:IQualifiedKey):number
		{
			var cached = this.coordCache.get(recordKey);
			if (cached)
			{
				this.coordinate.x = cached[0];
				this.coordinate.y = cached[1];
				return cached[2];
			}
			
			//implements RadViz algorithm for x and y coordinates of a record
			var numeratorX:number = 0;
			var numeratorY:number = 0;
			var denominator:number = 0;
			
			var anchorArray = this.anchors.getObjects(AnchorPoint);
			
			var sum:number = 0;			
			var value:number = 0;			
			var name:string;
			var keyMapExists:boolean = true;
			var anchor:AnchorPoint;
			var array = (this.localNormalization.value) ? this.keyNormMap.get(recordKey) : this.keyGlobalNormMap.get(recordKey);
			if (!array)
				keyMapExists = false;
			var map_column_number = this.keyNumberMap.map.get(recordKey);
			var i:int = 0;
			for (var column of this._columns)
			{
				var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
				value = (keyMapExists) ? array[i] : stats.getNorm(recordKey);
				name = (keyMapExists) ? this.columnTitleMap.get(column) : this.columns.getName(column);
				sum += (keyMapExists) ? map_column_number.get(column) : column.getValueFromKey(recordKey, Number);
				anchor = this.anchors.getObject(name) as AnchorPoint;
				numeratorX += value * anchor.x.value;
				numeratorY += value * anchor.y.value;						
				denominator += value;
				i++ ;
			}
			if (denominator==0)
			{
				denominator = .00001;
			}
			this.coordinate.x = (numeratorX/denominator);
			this.coordinate.y = (numeratorY/denominator);
			if ( this.enableJitter.value )
				this.jitterRecords(recordKey);			
			
			this.coordCache.set(recordKey, [this.coordinate.x, this.coordinate.y, sum]);
			
			return sum;
		}
		
		private jitterRecords(recordKey:IQualifiedKey):void
		{
			var index:number = CompoundRadVizPlotter.randomArrayIndexMap.get(recordKey);
			var jitter:number = Math.abs(StandardLib.asNumber(this.jitterLevel.value));
			var xJitter:number = (CompoundRadVizPlotter.randomValueArray[index])/(jitter);
			if (CompoundRadVizPlotter.randomValueArray[index+1] % 2) xJitter *= -1;
			var yJitter:number = (CompoundRadVizPlotter.randomValueArray[index+2])/(jitter);
			if (CompoundRadVizPlotter.randomValueArray[index+3])yJitter *= -1;
			if (!isNaN(xJitter))this.coordinate.x += xJitter ;
			if (!isNaN(yJitter))this.coordinate.y += yJitter ;
		}
		
		public drawWedge(destination:Graphics, beginRadians:number, spanRadians:number, projectedPoint:Point, radius:number = 1):void
		{
			// move to center point
			destination.moveTo(projectedPoint.x, projectedPoint.y);
			// line to beginning of arc, draw arc
			DrawUtils.arcTo(destination, true, projectedPoint.x, projectedPoint.y, beginRadians, beginRadians + spanRadians, radius);
			// line back to center point
			destination.lineTo(projectedPoint.x, projectedPoint.y);
		}
		
		/**
		 * Repopulates the static randomValueArray with new random values to be used for jittering
		 */
		public setNewRandomJitterColumn():void
		{
			CompoundRadVizPlotter.randomValueArray = [] ;
			if ( CompoundRadVizPlotter.randomValueArray.length == 0 )
				for ( var i:int = 0; i < 5000 ;i++ )
				{
					CompoundRadVizPlotter.randomValueArray.push( Math.random() % 10) ;
					CompoundRadVizPlotter.randomValueArray.push( -(Math.random() % 10)) ;
				}
			this.spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (task.iteration == 0)
			{
				if (!this.keyNumberMap || !this.keyNumberMap.map.has(task.recordKeys[0]))
					return 1;
			}
			return super.drawPlotAsyncIteration(task);
		}
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{						
			var radius:number = (this.radiusColumn.getInternalColumn()) ? this.radiusColumnStats.getNorm(recordKey) : this.radiusConstant.value;
			
			// Get coordinates of record and add jitter (if specified)
			var sum:number= this.getXYcoordinates(recordKey);

			// missing values skipped
			if (isNaN(this.coordinate.x) || isNaN(this.coordinate.y)) return;
				
			if (isNaN(radius) && (this.radiusColumn.getInternalColumn() != null))
			{			
				radius = this.radiusConstant.value;
				
				this.lineStyle.beginLineStyle(recordKey, graphics);
				this.fillStyle.beginFillStyle(recordKey, graphics);
				dataBounds.projectPointTo(this.coordinate, screenBounds);
				
				// draw a square of fixed size for missing size values				
				graphics.drawRect(this.coordinate.x - radius/2, this.coordinate.y - radius/2, radius, radius);		
				graphics.endFill();
				return ;
			}
			if (radius <= Infinity) radius = 2 + (radius *(10-2));
						
			sum = (1/sum) *2 * Math.PI ;
			
			// Plot pie charts of each record
			var beginRadians:number = 0;
			var spanRadians:number = 0;
			var value:number = 0;
			var numberMap = this.keyNumberMap.map.get(recordKey);
			
			var defaultAlpha:number = StandardLib.asNumber(this.alphaColumn.defaultValue.state);
			
			dataBounds.projectPointTo(this.coordinate,screenBounds);						
			
			for (var column of this._columns)
			{
				value = numberMap.get(column);
				beginRadians += spanRadians;
				spanRadians = value * sum;
				
				this.lineStyle.beginLineStyle(recordKey, graphics);
				if (this.enableWedgeColoring.value && this.anchorColorMap)
					graphics.beginFill(this.anchorColorMap.get(this.columnTitleMap.get(column)), this.alphaColumn.defaultValue.state as number);
				else
					this.fillStyle.beginFillStyle(recordKey, graphics);

				if (this.radiusColumn.getInternalColumn())
				{
					this.drawWedge(graphics, beginRadians, spanRadians, this.coordinate, radius*this.radiusConstant.value/3);
				}
				else
				{					
					this.drawWedge(graphics, beginRadians, spanRadians, this.coordinate,this.radiusConstant.value);
				}
				graphics.endFill();
			}
		}
		
		/**
		 * This function draws the background graphics for this plotter, if applicable.
		 * An example background would be the origin lines of an axis.
		 * @param dataBounds The data coordinates that correspond to the given screenBounds.
		 * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
		 * @param destination The sprite to draw the graphics onto.
		 */
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			this.coordinate.x = -1;
			this.coordinate.y = -1;
			dataBounds.projectPointTo(this.coordinate, screenBounds);
			var x:number = this.coordinate.x;
			var y:number = this.coordinate.y;
			this.coordinate.x = 1;
			this.coordinate.y = 1;
			dataBounds.projectPointTo(this.coordinate, screenBounds);
			
			// draw RadViz circle
			try {
				graphics.lineStyle(2, 0, .2);
				graphics.drawEllipse(x, y, this.coordinate.x - x, this.coordinate.y - y);
			} catch (e) { }
			
			this._destination = graphics;
			
			this._currentScreenBounds.copyFrom(screenBounds);
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
			this.initBoundsArray(output);
			this._columns = this.columns.getObjects(IAttributeColumn);
			//if (!unorderedColumns.length) handleColumnsChange();
			this.getXYcoordinates(recordKey);
			
			output[0].includePoint(this.coordinate);
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @return A Bounds2D object specifying the background data bounds.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			return output.setBounds(-1, -1.1, 1, 1.1);
		}		
		
		public drawProbe:boolean = false;
		public probedKeys:IQualifiedKey[] = null;
		private _destination:Graphics = null;
		
		public drawProbeLines(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{						
			if (!this.drawProbe)
				return;
			if (!this.probedKeys)
				return;
			try
			{
				//PlotterUtils.clear(destination);
			}
			catch(e)
			{
				return;
			}
			var graphics:Graphics = destination;
			graphics.clear();
			if (this.probedKeys.length)
				if (this.probedKeys[0].keyType != this.filteredKeySet.keys[0].keyType)
					return;
			
			for ( var key of this.probedKeys)
			{
				this.getXYcoordinates(key);
				dataBounds.projectPointTo(this.coordinate, screenBounds);
				
				for ( var anchor of this.anchors.getObjects(AnchorPoint))
				{
					this.tempPoint.x = anchor.x.value;
					this.tempPoint.y = anchor.y.value;
					dataBounds.projectPointTo(this.tempPoint, screenBounds);
					graphics.lineStyle(.5, 0xff0000);
					graphics.moveTo(this.coordinate.x, this.coordinate.y);
					graphics.lineTo(this.tempPoint.x, this.tempPoint.y);					
				}
			}
		}
						
		private _columns:IAttributeColumn[] = null;
	
		private changeAlgorithm():void
		{
			if (this._currentScreenBounds.isEmpty())
				return;
			
			var newAlgorithm = this.algorithms.get(this.currentAlgorithm.value);
			if (newAlgorithm == null) 
				return;
			
			this._algorithm = Weave.linkableChild(this, newAlgorithm);
			var array = this._algorithm.run(this.columns.getObjects(IAttributeColumn), this.keyNumberMap);
			
			RadVizUtils.reorderColumns(this.columns, array);
		}
		
		private _algorithm:ILayoutAlgorithm = Weave.linkableChild(this, GreedyLayoutAlgorithm);
		
		public currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString("Greedy layout"), this.changeAlgorithm);

		public algorithms:Map<string, typeof ILayoutAlgorithm> = new Map()
			.set("Random layout", RandomLayoutAlgorithm)
			.set("Greedy layout", GreedyLayoutAlgorithm)
			.set("Nearest neighbor", NearestNeighborLayoutAlgorithm)
			.set("Incremental layout", IncrementalLayoutAlgorithm)
			.set("Brute force", BruteForceLayoutAlgorithm);
	}
}

