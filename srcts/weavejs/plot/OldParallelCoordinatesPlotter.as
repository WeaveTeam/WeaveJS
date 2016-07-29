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
	import Shape = flash.display.Shape;
	import Point = weavejs.geom.Point;
	import Dictionary = flash.utils.Dictionary;
	
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import EquationColumn = weavejs.data.column.EquationColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import KeySet = weavejs.data.key.KeySet;
	import GeometryType = weavejs.geom.GeometryType;
	import SimpleGeometry = weavejs.geom.SimpleGeometry;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DrawUtils = weavejs.util.DrawUtils;
	import ObjectPool = weavejs.util.ObjectPool;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import ExtendedLineStyle = weavejs.geom.ExtendedLineStyle;
	
	export class OldParallelCoordinatesPlotter extends AbstractPlotter implements IPlotterWithGeometries, ISelectableAttributes
	{
		public constructor()
		{
			lineStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			lineStyle.weight.defaultValue.value = 1;
			lineStyle.alpha.defaultValue.value = 1.0;
			
			zoomToSubset.value = true;
			clipDrawing = false;
			
			// bounds need to be re-indexed when this option changes
			this.addSpatialDependencies(Weave.properties.enableGeometryProbing);
			columns.childListCallbacks.addImmediateCallback(this, handleColumnsListChange);
			xColumns.childListCallbacks.addImmediateCallback(this, handleColumnsListChange);
			
			Weave.linkState(_filteredXData.filter, filteredKeySet.keyFilter);
			Weave.linkState(_filteredYData.filter, filteredKeySet.keyFilter);
			Weave.linkableChild(this, xData, updateFilterEquationColumns);
			Weave.linkableChild(this, yData, updateFilterEquationColumns);
			
			lineStyle.color.internalDynamicColumn.addImmediateCallback(this, handleColor, true);
			Weave.getCallbacks(colorDataWatcher).addImmediateCallback(this, updateFilterEquationColumns, true);
			
			// updateFilterEquationColumns sets key source
			this.addSpatialDependencies(
				this.columns,
				this.xColumns,
				this.enableGroupBy,
				this.groupBy,
				this.groupKeyType,
				this.xValues,
				this._filteredXData,
				this._filteredYData,
				this.normalize,
				this.zoomToSubset
			);
		}
		private handleColumnsListChange():void
		{
			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			if (newColumn)
				Weave.linkableChild(spatialCallbacks, WeaveAPI.StatisticsCache.getColumnStatistics(newColumn));
			
			var newXColumn:IAttributeColumn = xColumns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			if (newXColumn)
				Weave.linkableChild(spatialCallbacks, WeaveAPI.StatisticsCache.getColumnStatistics(newXColumn));
			
			_yColumns = columns.getObjects();
			_xColumns = xColumns.getObjects();
            if(_yColumns.length != _xColumns.length)
			{
				_xColumns.length = 0;
				// if there is only one column, push a copy of it so lines will be drawn
				if (_yColumns.length == 1)
					_yColumns.push(_yColumns[0]);
			}
			
			updateFilterEquationColumns();
		}
		
		
		public getSelectableAttributeNames():Array
		{
			if (enableGroupBy.value)
				return ["X values", "Y values", "Group by", "Color"];
			else
				return ["Color", "Y Columns"];
		}
		public getSelectableAttributes():Array
		{
			if (enableGroupBy.value)
				return [xData, yData, groupBy, lineStyle.color];
			else
				return [lineStyle.color, columns];
		}

		/*
		 * This is the line style used to draw the lines.
		 */
		public lineStyle:ExtendedLineStyle = Weave.linkableChild(this, ExtendedLineStyle);
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public xColumns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		
		public enableGroupBy:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), updateFilterEquationColumns);
		public groupBy:DynamicColumn = Weave.linkableChild(this, DynamicColumn, updateFilterEquationColumns);
		public groupKeyType:LinkableString = Weave.linkableChild(this, LinkableString, updateFilterEquationColumns);
		public get xData():DynamicColumn { return _filteredXData.internalDynamicColumn; }
		public get yData():DynamicColumn { return _filteredYData.internalDynamicColumn; }
		public xValues:LinkableString = Weave.linkableChild(this, LinkableString, updateFilterEquationColumns);
		
		private _filteredXData:FilteredColumn = Weave.linkableChild(this, FilteredColumn);
		private _filteredYData:FilteredColumn = Weave.linkableChild(this, FilteredColumn);
		private _keySet_groupBy:KeySet = Weave.disposableChild(this, KeySet);
		
		private _yColumns:Array = [];
		private _xColumns:Array = [];
		
		private colorDataWatcher:LinkableWatcher = Weave.disposableChild(this, LinkableWatcher);
		private handleColor():void
		{
			var cc:ColorColumn = lineStyle.color.getInternalColumn() as ColorColumn;
			var bc:BinnedColumn = cc ? cc.getInternalColumn() as BinnedColumn : null;
			var fc:FilteredColumn = bc ? bc.getInternalColumn() as FilteredColumn : null;
			var dc:DynamicColumn = fc ? fc.internalDynamicColumn : null;
			colorDataWatcher.target = dc || fc || bc || cc;
		}
		
		private _xValues:Array;
		public getXValues():Array
		{
			if (!Weave.detectChange(getXValues, xValues, xData))
				return _xValues;
			
			var values:Array;
			// if session state is defined, use that. otherwise, get the values from xData
			if (xValues.value)
			{
				values = WeaveAPI.CSVParser.parseCSVRow(xValues.value) || [];
			}
			else
			{
				// calculate from column
				values = [];
				for each (var key:IQualifiedKey in xData.keys)
					values.push(xData.getValueFromKey(key, String));
				StandardLib.sort(values);
				ArrayUtils.removeDuplicatesFromSortedArray(values);
			}
			return _xValues = values.filter(function(value:string, ..._):boolean { return value ? true : false; });
		}
		
		public getForeignKeyType():string
		{
			var foreignKeyType:string = groupKeyType.value;
			if (foreignKeyType)
				return foreignKeyType;
			foreignKeyType = groupBy.getMetadata(ColumnMetadata.DATA_TYPE);
			var groupByKeyType:string = groupBy.getMetadata(ColumnMetadata.KEY_TYPE);
			var lineColorKeyType:string = lineStyle.color.getMetadata(ColumnMetadata.KEY_TYPE);
			if ((!foreignKeyType || foreignKeyType == DataType.STRING) && groupByKeyType != lineColorKeyType)
				foreignKeyType = lineColorKeyType;
			return foreignKeyType;
		}
		
		private _in_updateFilterEquationColumns:boolean = false;
		private updateFilterEquationColumns():void
		{
			if (_in_updateFilterEquationColumns)
				return;
			_in_updateFilterEquationColumns = true;
			
			if (enableGroupBy.value)
			{
				setColumnKeySources([_keySet_groupBy, groupBy]);
			}
			else
			{
				var list:Array = _yColumns.concat();
				if (colorDataWatcher.target)
					list.unshift(colorDataWatcher.target);
				setColumnKeySources(list);
				
				_in_updateFilterEquationColumns = false;
				return;
			}
			
			// update keys
			_keySet_groupBy.delayCallbacks();
			var reverseKeys:Array = []; // a list of the keys returned as values from keyColumn
			var lookup:Dictionary = new Dictionary(); // keeps track of what keys were already seen
			var foreignKeyType:string = getForeignKeyType();
			for each (var key:IQualifiedKey in groupBy.keys)
			{
				var localName:string = groupBy.getValueFromKey(key, String) as String;
				var filterKey:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(foreignKeyType, localName);
				if (filterKey && !lookup[filterKey])
				{
					lookup[filterKey] = true;
					reverseKeys.push(filterKey);
				}
			}
			_keySet_groupBy.replaceKeys(reverseKeys);
			_keySet_groupBy.resumeCallbacks();

			// check for missing columns
			if (!(xData.getInternalColumn() && yData.getInternalColumn() && groupBy.getInternalColumn()))
			{
				if (groupBy.getInternalColumn())
					columns.removeAllObjects();
				
				if(_xColumns.length > 0)
					xColumns.removeAllObjects();
				_in_updateFilterEquationColumns = false;
				return;
			}
			
			// check that column keytypes are the same
			var keyType:string = ColumnUtils.getKeyType(groupBy);
			if (keyType != ColumnUtils.getKeyType(xData) || keyType != ColumnUtils.getKeyType(yData))
			{
				_in_updateFilterEquationColumns = false;
				return;
			}
			
			columns.delayCallbacks();

			var values:Array = getXValues();
			
			// remove columns with names not appearing in values list
			for each (var name:string in columns.getNames())
				if (values.indexOf(name) < 0)
					columns.removeObject(name);
			
			// create an equation column for each filter value
			for (var i:int = 0; i < values.length; i++)
			{
				var value:string = values[i];
				var col:EquationColumn = columns.requestObject(value, EquationColumn, false);
				col.delayCallbacks();
				col.variables.requestObjectCopy("keyCol", groupBy);
				col.variables.requestObjectCopy("filterCol", _filteredXData);
				col.variables.requestObjectCopy("dataCol", _filteredYData);
				var filterValue:LinkableString = col.variables.requestObject('filterValue', LinkableString, false);
				filterValue.value = value;
				
				col.setMetadataProperty(ColumnMetadata.TITLE, value);
				col.setMetadataProperty(ColumnMetadata.MIN, '{ getMin(dataCol) }');
				col.setMetadataProperty(ColumnMetadata.MAX, '{ getMax(dataCol) }');
				
				col.equation.value = 'getValueFromFilterColumn(keyCol, filterCol, dataCol, filterValue.value, dataType)';
				col.resumeCallbacks();
			}
			columns.setNameOrder(values);
			
			columns.resumeCallbacks();
			
			_in_updateFilterEquationColumns = false;
		}
		
		public normalize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public curveType:LinkableString = Weave.linkableChild(this, new LinkableString(CURVE_NONE, curveTypeVerifier));
		public zoomToSubset:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		public shapeToDraw:LinkableString = Weave.linkableChild(this, new LinkableString(SOLID_CIRCLE, shapeTypeVerifier));
		public shapeBorderThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public shapeBorderColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public shapeBorderAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0.5));
		
		public static CURVE_NONE:string = 'none';
		public static CURVE_TOWARDS:string = 'towards';
		public static CURVE_AWAY:string = 'away';
		public static CURVE_DOUBLE:string = 'double';
		private curveTypeVerifier(type:string):boolean
		{
			//BACKWARDS COMPATIBILITY 0.9.6
			// technically, the verifier function is not supposed to do this.
			if (type == "ParallelCoordinatesPlotter.LINE_STRAIGHT")
				curveType.value = CURVE_NONE;
			if (type == "ParallelCoordinatesPlotter.LINE_CURVE_TOWARDS")
				curveType.value = CURVE_TOWARDS;
			if (type == "ParallelCoordinatesPlotter.LINE_CURVE_AWAY")
				curveType.value = CURVE_AWAY;
			if (type == "ParallelCoordinatesPlotter.LINE_DOUBLE_CURVE")
				curveType.value = CURVE_DOUBLE;
			
			var types:Array = [CURVE_NONE, CURVE_TOWARDS, CURVE_AWAY, CURVE_DOUBLE];
			return types.indexOf(type) >= 0;
		}

		public static shapesAvailable:Array = [NO_SHAPE, SOLID_CIRCLE, SOLID_SQUARE, EMPTY_CIRCLE, EMPTY_SQUARE];
		
		public static NO_SHAPE:string 	  = "No Shape";
		public static SOLID_CIRCLE:string   = "Solid Circle";
		public static EMPTY_CIRCLE:string   = "Empty Circle";
		public static SOLID_SQUARE:string   = "Solid Square";
		public static EMPTY_SQUARE:string   = "Empty Square";
		private shapeTypeVerifier(type:string):boolean
		{
			return shapesAvailable.indexOf(type) >= 0;
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			getBoundsCoords(recordKey, output, false);
		}
		
		/**
		 * Gets an Array of Bounds2D objects for a given key in data coordinates.
		 * @parma recordKey The key
		 * @param output Used to store the Bounds2D objects.
		 * @param includeUndefinedBounds If this is set to true, the output is guaranteed to have the same length as _yColumns.
		 */
		protected function getBoundsCoords(recordKey:IQualifiedKey, output:Array, includeUndefinedBounds:boolean):void
		{
			var enableGeomProbing:boolean = Weave.properties.enableGeometryProbing.value;
			
			initBoundsArray(output, _yColumns.length);
			
			var outIndex:int = 0;
			for (var i:int = 0; i < _yColumns.length; ++i)
			{
				getCoords(recordKey, i, tempPoint);
				if (includeUndefinedBounds || isFinite(tempPoint.x) && isFinite(tempPoint.y))
					(output[outIndex] as Bounds2D).includePoint(tempPoint);
				// when geom probing is enabled, report a single data bounds
				if (includeUndefinedBounds || !enableGeomProbing)
					outIndex++;
			}
			while (output.length > outIndex + 1)
				ObjectPool.returnObject(output.pop());
		}
		
		private tempBoundsArray:Array = [];
		
		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, dataBounds:Bounds2D = null):Array
		{
			getBoundsCoords(recordKey, tempBoundsArray, true);
			
			var results:Array = [];
			var geometry:ISimpleGeometry;
			
			for (var i:int = 0; i < _yColumns.length; ++i)
			{
				var current:Bounds2D = tempBoundsArray[i] as Bounds2D;
				var next:Bounds2D = tempBoundsArray[i + 1] as Bounds2D;
				
				if (next && !next.isUndefined())
				{
					if (current.isUndefined())
					{
						// current undefined, next defined
						geometry = new SimpleGeometry(GeometryType.POINT);
						geometry.setVertices([
							new Point(next.getXMin(), next.getYMin())
						]);
						results.push(geometry);
					}
					else
					{
						// both current and next are defined
						geometry = new SimpleGeometry(GeometryType.LINE);
						geometry.setVertices([
							new Point(current.getXMin(), current.getYMin()),
							new Point(next.getXMin(), next.getYMin())
						]);
						results.push(geometry);
					}
				}
				else if (i == 0 && !current.isUndefined())
				{
					// special case: i == 0, current defined, next undefined
					geometry = new SimpleGeometry(GeometryType.POINT);
					geometry.setVertices([
						new Point(current.getXMin(), current.getYMin())
					]);
					results.push(geometry);
				}
			}

			return results;
		}
		
		public getBackgroundGeometries():Array
		{
			return [];
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			// this template will draw one record per iteration
			if (task.iteration < task.recordKeys.length)
			{
				//------------------------
				// draw one record
				var key:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
				if (enableGroupBy.value)
				{
					// reset lookup on first iteration
					if (task.iteration == 0)
						task.asyncState = new Dictionary();
						
					// replace groupBy keys with foreign keys so we only render lines for foreign keys
					var foreignKeyType:string = getForeignKeyType();
					if (key.keyType != foreignKeyType)
						key = WeaveAPI.QKeyManager.getQKey(foreignKeyType, groupBy.getValueFromKey(key, String));
					
					// avoid rendering duplicate lines
					if (task.asyncState[key])
						return task.iteration / task.recordKeys.length;
					task.asyncState[key] = true;
				}
				
				tempShape.graphics.clear();
				addRecordGraphicsToTempShape(key, task.dataBounds, task.screenBounds, tempShape);
				if (clipDrawing)
				{
					// get clipRectangle
					task.screenBounds.getRectangle(clipRectangle);
					// increase width and height by 1 to avoid clipping rectangle borders drawn with vector graphics.
					clipRectangle.width++;
					clipRectangle.height++;
				}
				task.buffer.draw(tempShape, null, null, null, clipDrawing ? clipRectangle : null);
				//------------------------
				
				// report progress
				return task.iteration / task.recordKeys.length;
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}
		
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
		{
			var graphics:Graphics = tempShape.graphics;

			// project data coordinates to screen coordinates and draw graphics onto tempShape
			var i:int;
			var _shapeSize:number = this.shapeSize.value;
			var _prevX:number = 0;
			var _prevY:number = 0;
			var continueLine:boolean = false;
			var skipLines:boolean = enableGroupBy.value && groupBy.containsKey(recordKey);
			
			for (i = 0; i < _yColumns.length; i++)
			{
				// project data coordinates to screen coordinates and draw graphics
				
				getCoords(recordKey, i, tempPoint);
				
				if (!isFinite(tempPoint.x) || !isFinite(tempPoint.y))
				{
					continueLine = false;
					continue;
				}
				
				dataBounds.projectPointTo(tempPoint, screenBounds);				
				var x:number = tempPoint.x;
				var y:number = tempPoint.y;
				
				var recordColor:number = lineStyle.color.getValueFromKey(recordKey, Number);
				
				// thickness of the line around each shape
				var shapeLineThickness:int = shapeBorderThickness.value;
				// use a border around each shape
				graphics.lineStyle(shapeLineThickness, shapeBorderColor.value, shapeLineThickness == 0 ? 0 : shapeBorderAlpha.value);
				if (_shapeSize > 0)
				{
					var shapeSize:number = _shapeSize;
					
					var shapeColor:number = recordColor;
					if (isNaN(shapeColor) && enableGroupBy.value)
					{
						var shapeKey:IQualifiedKey = (_yColumns[i] as IAttributeColumn).getValueFromKey(recordKey, IQualifiedKey);
						shapeColor = lineStyle.color.getValueFromKey(shapeKey, Number);
					}
					// draw a different shape for each option
					switch (shapeToDraw.value)
					{
						// solid circle
						case SOLID_CIRCLE:
							if (isFinite(shapeColor))
								graphics.beginFill(shapeColor);
							else
								graphics.endFill();
							// circle uses radius, so size/2
							graphics.drawCircle(x, y, shapeSize/2);
							break;
						// empty circle
						case EMPTY_CIRCLE:
							graphics.lineStyle(shapeLineThickness, shapeColor, shapeLineThickness == 0 ? 0 : 1);
							graphics.drawCircle(x, y, shapeSize/2);
							break;
						// solid square
						case SOLID_SQUARE:
							if (isFinite(shapeColor))
								graphics.beginFill(shapeColor);
							else
								graphics.endFill();
							graphics.drawRect(x-_shapeSize/2, y-_shapeSize/2, _shapeSize, _shapeSize);
							break;
						// empty square
						case EMPTY_SQUARE:
							graphics.lineStyle(shapeLineThickness, shapeColor, shapeLineThickness == 0 ? 0 : 1);
							graphics.drawRect(x-_shapeSize/2, y-_shapeSize/2, _shapeSize, _shapeSize);
							break;
					}
					
					graphics.endFill();
				}
				
				if (skipLines)
					continue;
				
				if (isFinite(recordColor))
				{
					// begin the line style for the parallel coordinates line
					// we want to use the missing data line style since the line is the shape we are showing 
					// (rather than just a border of another shape)
					lineStyle.beginLineStyle(recordKey, graphics);
				}
				else
				{
					graphics.lineStyle(shapeLineThickness, shapeBorderColor.value, shapeLineThickness == 0 ? 0 : shapeBorderAlpha.value);
				}
				
				// if we aren't continuing a new line (it is a new line segment)	
				if (!continueLine)
				{
					// set the previous X and Y locations to be this new coordinate
					_prevX = x;
					_prevY = y;
				}
				
				if (curveType.value == CURVE_NONE)
				{
					graphics.moveTo(_prevX, _prevY);
					graphics.lineTo(x, y);
					//DrawUtils.drawDashedLine(tempShape.graphics, _prevX, _prevY, x, y, 3, 2); 
				}
				else if (curveType.value == CURVE_DOUBLE)
					DrawUtils.drawDoubleCurve(graphics, _prevX, _prevY, x, y, true, 1);
				else if (curveType.value == CURVE_TOWARDS)
					DrawUtils.drawCurvedLine(graphics, _prevX,  _prevY, x, y, -1);
				else if (curveType.value == CURVE_AWAY)
					DrawUtils.drawCurvedLine(graphics, _prevX,  _prevY, x, y,  1);
				
				continueLine = true;

				_prevX = x;
				_prevY = y;
			}
		}
		
		public yAxisLabelFunction(value:number):string
		{
			var _yColumns:Array = columns.getObjects();
			if (_yColumns.length > 0)
				return ColumnUtils.deriveStringFromNumber(_yColumns[0], value); // always use the first column to format the axis labels
			return null;
		}
		
		public xAxisLabelFunction(value:number):string
		{
			try
			{
				if (usingXAttributes)
					return ColumnUtils.deriveStringFromNumber(_xColumns[0], value);
				else
					return ColumnUtils.getTitle(_yColumns[value]);
			}
			catch(e:Error) { };
			
			return "";
		}
		
		public get usingXAttributes():boolean
		{
			if (_xColumns.length == _yColumns.length)
				return true;
			else
				return false;
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			// normalized data coordinates
			if (zoomToSubset.value)
			{
				output.reset();
			}
			else
			{
				output.setBounds(0, 0, Math.max(1, columns.getNames().length - 1), 1);
				
				if (!normalize.value)
				{
					// reset y coords
					output.setYRange(NaN, NaN);
					for each (var column:IAttributeColumn in columns.getObjects())
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
						// expand y range to include all data coordinates
						output.includeCoords(0, stats.getMin());
						output.includeCoords(0, stats.getMax());
					}
					
					if(_xColumns.length > 0)
					{
						output.setXRange(NaN,NaN);
						for each (var col:IAttributeColumn in _xColumns)
						{
							var colStats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(col);
							// expand x range to include all data coordinates
							output.includeCoords(colStats.getMin(),NaN);
							output.includeCoords(colStats.getMax(),NaN);
						}
					}
					
					
				}
			}
		}
		
		/**
		 * Gets the coordinates for a record and column index and stores them in a Point object.
		 * @param recordKey
		 * @param columnIndex
		 * @param output
		 */
		public getCoords(recordKey:IQualifiedKey, columnIndex:int, output:Point):void
		{
			output.x = NaN;
			output.y = NaN;
			
			if (enableGroupBy.value && groupBy.containsKey(recordKey))
			{
				if (xData.getValueFromKey(recordKey, String) != getXValues()[columnIndex])
					return;
				recordKey = WeaveAPI.QKeyManager.getQKey(getForeignKeyType(), groupBy.getValueFromKey(recordKey, String));
			}
			
			// X
			var xCol:IAttributeColumn = _xColumns[columnIndex] as IAttributeColumn;
			if (xCol)
				output.x = xCol.getValueFromKey(recordKey, Number);
			else if (_xColumns.length == 0)
				output.x = columnIndex;
			
			// Y
			var yCol:IAttributeColumn = _yColumns[columnIndex] as IAttributeColumn;
			if (yCol && normalize.value)
				output.y = WeaveAPI.StatisticsCache.getColumnStatistics(yCol).getNorm(recordKey);
			else if (yCol)
				output.y = yCol.getValueFromKey(recordKey, Number);
		}
		
		private static tempPoint:Point = new Point(); // reusable object
		
		
		// backwards compatibility
		/*[Deprecated(replacement="enableGroupBy")] public set displayFilterColumn(value:Object):void { Weave.setState(enableGroupBy, value); }
		[Deprecated(replacement="groupBy")] public set keyColumn(value:Object):void { Weave.setState(groupBy, value); }
		[Deprecated(replacement="xData")] public set filterColumn(value:Object):void { Weave.setState(xData, value); }
		[Deprecated(replacement="xValues")] public set filterValues(value:Object):void { Weave.setState(xValues, value); }
		[Deprecated(replacement="xValues")] public set groupByValues(value:Object):void { Weave.setState(xValues, value); }
		[Deprecated(replacement="xColumns")] public set xAttributeColumns(value:Object):void { Weave.setState(xColumns, value, true); }*/
	}
}
