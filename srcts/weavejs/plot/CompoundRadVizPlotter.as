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
		import Point = weavejs.geom.Point;
		import Dictionary = flash.utils.Dictionary;
		
		import IAttributeColumn = weavejs.api.data.IAttributeColumn;
		import IColumnStatistics = weavejs.api.data.IColumnStatistics;
		import IQualifiedKey = weavejs.api.data.IQualifiedKey;
		import Bounds2D = weavejs.geom.Bounds2D;
		import ILayoutAlgorithm = weavejs.api.radviz.ILayoutAlgorithm;
		import IPlotTask = weavejs.api.ui.IPlotTask;
		import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
		import StandardLib = weavejs.util.StandardLib;
		import LinkableBoolean = weavejs.core.LinkableBoolean;
		import LinkableHashMap = weavejs.core.LinkableHashMap;
		import LinkableNumber = weavejs.core.LinkableNumber;
		import LinkableString = weavejs.core.LinkableString;
		import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
		import DynamicColumn = weavejs.data.column.DynamicColumn;
		import Bounds2D = weavejs.geom.Bounds2D;
		import ColorRamp = weavejs.util.ColorRamp;
		import BruteForceLayoutAlgorithm = weavejs.radviz.BruteForceLayoutAlgorithm;
		import GreedyLayoutAlgorithm = weavejs.radviz.GreedyLayoutAlgorithm;
		import IncrementalLayoutAlgorithm = weavejs.radviz.IncrementalLayoutAlgorithm;
		import NearestNeighborLayoutAlgorithm = weavejs.radviz.NearestNeighborLayoutAlgorithm;
		import RandomLayoutAlgorithm = weavejs.radviz.RandomLayoutAlgorithm;
		import ColumnUtils = weavejs.data.ColumnUtils;
		import DrawUtils = weavejs.util.DrawUtils;
		import RadVizUtils = weavejs.util.RadVizUtils;
		import SolidFillStyle = weavejs.geom.SolidFillStyle;
		import SolidLineStyle = weavejs.geom.SolidLineStyle;
		
		public class CompoundRadVizPlotter extends AbstractPlotter implements ISelectableAttributes
		{
			public function CompoundRadVizPlotter()
			{
				fillStyle.color.internalDynamicColumn.globalName = Weave.DEFAULT_COLOR_COLUMN;
				setNewRandomJitterColumn();		
				iterations.value = 50;
				
				algorithms[RANDOM_LAYOUT] = RandomLayoutAlgorithm;
				algorithms[GREEDY_LAYOUT] = GreedyLayoutAlgorithm;
				algorithms[NEAREST_NEIGHBOR] = NearestNeighborLayoutAlgorithm;
				algorithms[INCREMENTAL_LAYOUT] = IncrementalLayoutAlgorithm;
				algorithms[BRUTE_FORCE] = BruteForceLayoutAlgorithm;
				
				columns.childListCallbacks.addImmediateCallback(this, handleColumnsListChange);
				Weave.getCallbacks(filteredKeySet).addImmediateCallback(this, handleColumnsChange, true);
				Weave.getCallbacks(this).addImmediateCallback(this, clearCoordCache);
				this.addSpatialDependencies(this.columns, this.localNormalization, this.anchors, this.jitterLevel, this.enableJitter);
			}
			private function handleColumnsListChange():void
			{
				// When a new column is created, register the stats to trigger callbacks and affect busy status.
				// This will be cleaned up automatically when the column is disposed.
				var newColumn:IAttributeColumn = columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
				if (newColumn)
				{
					var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(newColumn);
					this.addSpatialDependencies(stats);
					Weave.getCallbacks(stats).addImmediateCallback(this, handleColumnsChange);
				}
			}
			
			public function getSelectableAttributeNames():Array
			{
				return ["Size", "Color", "Anchor Dimensions"];
			}
			
			public function getSelectableAttributes():Array
			{
				return [radiusColumn, fillStyle.color, columns];
			}
			
			public const columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), handleColumnsChange);
			public const localNormalization:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
			
			/**
			 * LinkableHashMap of RadViz dimension locations: 
			 * <br/>contains the location of each column as an AnchorPoint object
			 */		
			public const anchors:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(AnchorPoint));
			private var coordinate:Point = new Point();//reusable object
			private const tempPoint:Point = new Point();//reusable object
					
			public const jitterLevel:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-19));
			public const enableWedgeColoring:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			public const enableJitter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			public const iterations:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
			
			public const lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
			public const fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
			public function get alphaColumn():AlwaysDefinedColumn { return fillStyle.alpha; }
			public const colorMap:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampXMLByName("Paired")),fillColorMap);
			public var anchorColorMap:Dictionary;
			
			/**
			 * This is the radius of the circle, in screen coordinates.
			 */
			public const radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
			private const radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(radiusColumn));
			public const radiusConstant:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
			
			private static var randomValueArray:Array = new Array();		
			private static var randomArrayIndexMap:Dictionary;
			private var keyNumberMap:Dictionary;
			private var keyNormMap:Dictionary;
			private var keyGlobalNormMap:Dictionary;
			private var keyMaxMap:Dictionary;
			private var keyMinMap:Dictionary;
			private var columnTitleMap:Dictionary;
			
			private const _currentScreenBounds:Bounds2D = new Bounds2D();
			
			private function handleColumnsChange():void
			{
				if (Weave.isBusy(columns) || Weave.isBusy(spatialCallbacks))
					return;
				
				var i:int = 0;
				var keyNormArray:Array;
				var columnNormArray:Array;
				var columnNumberMap:Dictionary;
				var columnNumberArray:Array;
				_columns = columns.getObjects(IAttributeColumn);
				var sum:Number = 0;
				
				randomArrayIndexMap = 	new Dictionary(true);				
				keyMaxMap = 			new Dictionary(true);
				keyMinMap = 			new Dictionary(true);
				keyNormMap = 			new Dictionary(true);
				keyGlobalNormMap = 		new Dictionary(true);
				keyNumberMap = 			new Dictionary(true);
				columnTitleMap = 		new Dictionary(true);
				
				if (_columns.length > 0) 
				{
					var keySources:Array = _columns.concat();
					keySources.unshift(radiusColumn);
					var sortDirections:Array = keySources.map(function(c:*, i:int, a:*):int { return i == 0 ? -1 : 1; });
					setColumnKeySources(keySources, sortDirections);
				
					for each( var key:IQualifiedKey in filteredKeySet.keys)
					{					
						randomArrayIndexMap[key] = i ;										
						var magnitude:Number = 0;
						columnNormArray = [];
						columnNumberArray = [];
						columnNumberMap = new Dictionary(true);
						sum = 0;
						for each( var column:IAttributeColumn in _columns)
						{
							var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
							if(i == 0)
								columnTitleMap[column] = columns.getName(column);
							columnNormArray.push(stats.getNorm(key));
							columnNumberMap[column] = column.getValueFromKey(key, Number);
							columnNumberArray.push(columnNumberMap[column]);
						}
						for each(var x:Number in columnNumberMap)
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
						for each( var col:IAttributeColumn in _columns)
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
				fillColorMap();
			}
			
			public function setAnchorLocations():void
			{			
				_columns = columns.getObjects(IAttributeColumn);
				var theta:Number = (2*Math.PI)/_columns.length;
				var anchor:AnchorPoint;
				anchors.delayCallbacks();
				anchors.removeAllObjects();
				for( var i:int = 0; i < _columns.length; i++ )
				{
					anchor = anchors.requestObject(columns.getName(_columns[i]), AnchorPoint, false) as AnchorPoint ;								
					anchor.x.value = Math.cos(theta*i);
					anchor.y.value = Math.sin(theta*i);		
					anchor.title.value = ColumnUtils.getTitle(_columns[i]);
				}
				anchors.resumeCallbacks();
			}			
					
			private function fillColorMap():void
			{
				var i:int = 0;
				anchorColorMap = new Dictionary(true);
				var _anchors:Array = anchors.getObjects(AnchorPoint);
				
				for each( var anchor:AnchorPoint in anchors.getObjects())
				{
					anchorColorMap[anchors.getName(anchor)] = colorMap.getColorFromNorm(i / (_anchors.length - 1)); 
					i++;
				}
			}
			
			private var coordCache:Dictionary = new Dictionary(true);
			private function clearCoordCache():void
			{
				coordCache = new Dictionary(true);
			}
			
			/**
			 * Applies the RadViz algorithm to a record specified by a recordKey
			 */
			private function getXYcoordinates(recordKey:IQualifiedKey):Number
			{
				var cached:Array = coordCache[recordKey] as Array;
				if (cached)
				{
					coordinate.x = cached[0];
					coordinate.y = cached[1];
					return cached[2];
				}
				
				//implements RadViz algorithm for x and y coordinates of a record
				var numeratorX:Number = 0;
				var numeratorY:Number = 0;
				var denominator:Number = 0;
				
				var anchorArray:Array = anchors.getObjects();			
				
				var sum:Number = 0;			
				var value:Number = 0;			
				var name:String;
				var keyMapExists:Boolean = true;
				var anchor:AnchorPoint;
				var array:Array = (localNormalization.value) ? keyNormMap[recordKey] : keyGlobalNormMap[recordKey];
				if(!array) keyMapExists = false;
				var array2:Dictionary = keyNumberMap[recordKey];
				var i:int = 0;
				for each( var column:IAttributeColumn in _columns)
				{				
					var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
					value = (keyMapExists) ? array[i] : stats.getNorm(recordKey);
					name = (keyMapExists) ? columnTitleMap[column] : columns.getName(column);	
					sum += (keyMapExists) ? array2[column] : column.getValueFromKey(recordKey, Number);
					anchor = anchors.getObject(name) as AnchorPoint;
					numeratorX += value * anchor.x.value;
					numeratorY += value * anchor.y.value;						
					denominator += value;
					i++ ;
				}
				if(denominator==0) 
				{
					denominator = .00001;
				}
				coordinate.x = (numeratorX/denominator);
				coordinate.y = (numeratorY/denominator);
				if( enableJitter.value )
					jitterRecords(recordKey);			
				
				coordCache[recordKey] = [coordinate.x, coordinate.y, sum];
				
				return sum;
			}
			
			private function jitterRecords(recordKey:IQualifiedKey):void
			{
				var index:Number = randomArrayIndexMap[recordKey];
				var jitter:Number = Math.abs(StandardLib.asNumber(jitterLevel.value));
				var xJitter:Number = (randomValueArray[index])/(jitter);
				if(randomValueArray[index+1] % 2) xJitter *= -1;
				var yJitter:Number = (randomValueArray[index+2])/(jitter);
				if(randomValueArray[index+3])yJitter *= -1;
				if(!isNaN(xJitter))coordinate.x += xJitter ;
				if(!isNaN(yJitter))coordinate.y += yJitter ;
			}
			
			public function drawWedge(destination:Graphics, beginRadians:Number, spanRadians:Number, projectedPoint:Point, radius:Number = 1):void
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
			public function setNewRandomJitterColumn():void
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
			
			override public function drawPlotAsyncIteration(task:IPlotTask):Number
			{
				if (task.iteration == 0)
				{
					if (!keyNumberMap || keyNumberMap[task.recordKeys[0]] == null)
						return 1;
				}
				return super.drawPlotAsyncIteration(task);
			}
			/**
			 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
			 */
			override protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
			{						
				var graphics:Graphics = tempShape.graphics;
				var radius:Number = (radiusColumn.getInternalColumn()) ? radiusColumnStats.getNorm(recordKey) : radiusConstant.value;
				
				// Get coordinates of record and add jitter (if specified)
				var sum:Number= getXYcoordinates(recordKey);

				// missing values skipped
				if(isNaN(coordinate.x) || isNaN(coordinate.y)) return;
					
				if(isNaN(radius) && (radiusColumn.getInternalColumn() != null))
				{			
					radius = radiusConstant.value;
					
					lineStyle.beginLineStyle(recordKey, graphics);
					fillStyle.beginFillStyle(recordKey, graphics);
					dataBounds.projectPointTo(coordinate, screenBounds);
					
					// draw a square of fixed size for missing size values				
					graphics.drawRect(coordinate.x - radius/2, coordinate.y - radius/2, radius, radius);		
					graphics.endFill();
					return ;
				}
				if(radius <= Infinity) radius = 2 + (radius *(10-2));
							
				sum = (1/sum) *2 * Math.PI ;
				
				// Plot pie charts of each record
				var beginRadians:Number = 0;
				var spanRadians:Number = 0;
				var value:Number = 0;
				var numberMap:Dictionary = keyNumberMap[recordKey];
				
				var defaultAlpha:Number = StandardLib.asNumber(alphaColumn.defaultValue.value);
				
				dataBounds.projectPointTo(coordinate,screenBounds);						
				
				for each(var column:IAttributeColumn in _columns)
				{
					value = numberMap[column];
					beginRadians += spanRadians;
					spanRadians = value * sum;
					
					lineStyle.beginLineStyle(recordKey, graphics);
					if(enableWedgeColoring.value && anchorColorMap)
						graphics.beginFill(anchorColorMap[columnTitleMap[column]], alphaColumn.defaultValue.value as Number);
					else
						fillStyle.beginFillStyle(recordKey, graphics);

					if (radiusColumn.getInternalColumn())
					{
						drawWedge(graphics, beginRadians, spanRadians, coordinate, radius*radiusConstant.value/3);
					}
					else
					{					
						drawWedge(graphics, beginRadians, spanRadians, coordinate,radiusConstant.value);
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
			override public function drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
			{
				var g:Graphics = tempShape.graphics;
				g.clear();

				coordinate.x = -1;
				coordinate.y = -1;
				dataBounds.projectPointTo(coordinate, screenBounds);
				var x:Number = coordinate.x;
				var y:Number = coordinate.y;
				coordinate.x = 1;
				coordinate.y = 1;
				dataBounds.projectPointTo(coordinate, screenBounds);
				
				// draw RadViz circle
				try {
					g.lineStyle(2, 0, .2);
					g.drawEllipse(x, y, coordinate.x - x, coordinate.y - y);
				} catch (e:Error) { }
				
				destination.draw(tempShape);
				_destination = destination;
				
				_currentScreenBounds.copyFrom(screenBounds);
			}
				
			/**
			 * This function must be implemented by classes that extend AbstractPlotter.
			 * 
			 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
			 * @param key The key of a data record.
			 * @param output An Array of Bounds2D objects to store the result in.
			 */
			override public function getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Array):void
			{
				initBoundsArray(output);
				_columns = columns.getObjects(IAttributeColumn);
				//if(!unorderedColumns.length) handleColumnsChange();
				getXYcoordinates(recordKey);
				
				(output[0] as Bounds2D).includePoint(coordinate);
			}
			
			/**
			 * This function returns a Bounds2D object set to the data bounds associated with the background.
			 * @return A Bounds2D object specifying the background data bounds.
			 */
			override public function getBackgroundDataBounds(output:Bounds2D):void
			{
				return output.setBounds(-1, -1.1, 1, 1.1);
			}		
			
			public var drawProbe:Boolean = false;
			public var probedKeys:Array = null;
			private var _destination:BitmapData = null;
			
			public function drawProbeLines(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
			{						
				if(!drawProbe) return;
				if(!probedKeys) return;
				try {
					//PlotterUtils.clear(destination);
				} catch(e:Error) {return;}
				var graphics:Graphics = destination;
				graphics.clear();
				if(probedKeys.length)
					if(probedKeys[0].keyType != filteredKeySet.keys[0].keyType) return;
				
				for each( var key:IQualifiedKey in probedKeys)
				{
					getXYcoordinates(key);
					dataBounds.projectPointTo(coordinate, screenBounds);
					
					for each( var anchor:AnchorPoint in anchors.getObjects(AnchorPoint))
					{
						tempPoint.x = anchor.x.value;
						tempPoint.y = anchor.y.value;
						dataBounds.projectPointTo(tempPoint, screenBounds);
						graphics.lineStyle(.5, 0xff0000);
						graphics.moveTo(coordinate.x, coordinate.y);
						graphics.lineTo(tempPoint.x, tempPoint.y);					
					}
				}
			}
							
			private var _columns:Array = null;		
		
			private function changeAlgorithm():void
			{
				if(_currentScreenBounds.isEmpty()) return;
				
				var newAlgorithm:Class = algorithms[currentAlgorithm.value];
				if (newAlgorithm == null) 
					return;
				
				_algorithm = Weave.linkableChild(this, newAlgorithm);
				var array:Array = _algorithm.run(columns.getObjects(IAttributeColumn), keyNumberMap);
				
				RadVizUtils.reorderColumns(columns, array);
			}
			
			private var _algorithm:ILayoutAlgorithm = Weave.linkableChild(this, GreedyLayoutAlgorithm);
			
			// algorithms
			[Bindable] public var algorithms:Array = [RANDOM_LAYOUT, GREEDY_LAYOUT, NEAREST_NEIGHBOR, INCREMENTAL_LAYOUT, BRUTE_FORCE];
			public const currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString(GREEDY_LAYOUT), changeAlgorithm);
			public static const RANDOM_LAYOUT:String = "Random layout";
			public static const GREEDY_LAYOUT:String = "Greedy layout";
			public static const NEAREST_NEIGHBOR:String = "Nearest neighbor";
			public static const INCREMENTAL_LAYOUT:String = "Incremental layout";
			public static const BRUTE_FORCE:String = "Brute force";
		}
	}
