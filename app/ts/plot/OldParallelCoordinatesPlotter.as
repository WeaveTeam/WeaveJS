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
	import ArrayUtils = weavejs.util.ArrayUtils;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import AsyncSort = weavejs.util.AsyncSort;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	
	export class OldParallelCoordinatesPlotter extends AbstractPlotter implements IPlotterWithGeometries, ISelectableAttributes
	{
		public constructor()
		{
			super();
			this.lineStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.lineStyle.weight.defaultValue.state = 1;
			this.lineStyle.alpha.defaultValue.state = 1.0;

			this.zoomToSubset.value = true;

			// bounds need to be re-indexed when this option changes
			this.columns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			this.xColumns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			
			Weave.linkState(this._filteredXData.filter, this.filteredKeySet.keyFilter);
			Weave.linkState(this._filteredYData.filter, this.filteredKeySet.keyFilter);
			Weave.linkableChild(this, this.xData, this.updateFilterEquationColumns);
			Weave.linkableChild(this, this.yData, this.updateFilterEquationColumns);
			
			this.lineStyle.color.internalDynamicColumn.addImmediateCallback(this, this.handleColor, true);
			Weave.getCallbacks(this.colorDataWatcher).addImmediateCallback(this, this.updateFilterEquationColumns, true);
			
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
			// hacky location for doing this
			this.addSpatialDependencies(WeaveProperties.getProperties(this).enableGeometryProbing);

			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = this.columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			if (newColumn)
				Weave.linkableChild(this.spatialCallbacks, WeaveAPI.StatisticsCache.getColumnStatistics(newColumn));
			
			var newXColumn:IAttributeColumn = this.xColumns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			if (newXColumn)
				Weave.linkableChild(this.spatialCallbacks, WeaveAPI.StatisticsCache.getColumnStatistics(newXColumn));
			
			this._yColumns = this.columns.getObjects();
			this._xColumns = this.xColumns.getObjects();
            if (this._yColumns.length != this._xColumns.length)
			{
				this._xColumns.length = 0;
				// if there is only one column, push a copy of it so lines will be drawn
				if (this._yColumns.length == 1)
					this._yColumns.push(this._yColumns[0]);
			}
			
			this.updateFilterEquationColumns();
		}
		
		
		public getSelectableAttributeNames()
		{
			if (this.enableGroupBy.value)
				return ["X values", "Y values", "Group by", "Color"];
			else
				return ["Color", "Y Columns"];
		}
		public getSelectableAttributes():(IColumnWrapper|ILinkableHashMap)[]
		{
			if (this.enableGroupBy.value)
				return [this.xData, this.yData, this.groupBy, this.lineStyle.color];
			else
				return [this.lineStyle.color, this.columns];
		}

		/*
		 * This is the line style used to draw the lines.
		 */
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public xColumns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		
		public enableGroupBy:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.updateFilterEquationColumns);
		public groupBy:DynamicColumn = Weave.linkableChild(this, DynamicColumn, this.updateFilterEquationColumns);
		public groupKeyType:LinkableString = Weave.linkableChild(this, LinkableString, this.updateFilterEquationColumns);
		public get xData():DynamicColumn { return this._filteredXData.internalDynamicColumn; }
		public get yData():DynamicColumn { return this._filteredYData.internalDynamicColumn; }
		public xValues:LinkableString = Weave.linkableChild(this, LinkableString, this.updateFilterEquationColumns);
		
		private _filteredXData:FilteredColumn = Weave.linkableChild(this, FilteredColumn);
		private _filteredYData:FilteredColumn = Weave.linkableChild(this, FilteredColumn);
		private _keySet_groupBy:KeySet = Weave.disposableChild(this, KeySet);
		
		private _yColumns:IAttributeColumn[] = [];
		private _xColumns:IAttributeColumn[] = [];
		
		private colorDataWatcher:LinkableWatcher = Weave.disposableChild(this, LinkableWatcher);
		private handleColor():void
		{
			var cc:ColorColumn = Weave.AS(this.lineStyle.color.getInternalColumn(), ColorColumn);
			var bc:BinnedColumn = cc ? Weave.AS(cc.getInternalColumn(), BinnedColumn) : null;
			var fc:FilteredColumn = bc ? Weave.AS(bc.getInternalColumn(), FilteredColumn) : null;
			var dc:DynamicColumn = fc ? fc.internalDynamicColumn : null;
			this.colorDataWatcher.target = dc || fc || bc || cc;
		}
		
		private _xValues:string[];
		public getXValues():string[]
		{
			if (!Weave.detectChange(this.getXValues, this.xValues, this.xData))
				return this._xValues;
			
			var values:string[];
			// if session state is defined, use that. otherwise, get the values from xData
			if (this.xValues.value)
			{
				values = WeaveAPI.CSVParser.parseCSVRow(this.xValues.value) || [];
			}
			else
			{
				// calculate from column
				values = [];
				for (var key of this.xData.keys)
					values.push(this.xData.getValueFromKey(key, String));
				AsyncSort.sortImmediately(values);
				ArrayUtils.removeDuplicatesFromSortedArray(values);
			}
			return this._xValues = values.filter(value => !!value);
		}
		
		public getForeignKeyType():string
		{
			var foreignKeyType:string = this.groupKeyType.value;
			if (foreignKeyType)
				return foreignKeyType;
			foreignKeyType = this.groupBy.getMetadata(ColumnMetadata.DATA_TYPE);
			var groupByKeyType:string = this.groupBy.getMetadata(ColumnMetadata.KEY_TYPE);
			var lineColorKeyType:string = this.lineStyle.color.getMetadata(ColumnMetadata.KEY_TYPE);
			if ((!foreignKeyType || foreignKeyType == DataType.STRING) && groupByKeyType != lineColorKeyType)
				foreignKeyType = lineColorKeyType;
			return foreignKeyType;
		}
		
		private _in_updateFilterEquationColumns:boolean = false;
		private updateFilterEquationColumns():void
		{
			if (this._in_updateFilterEquationColumns)
				return;
			this._in_updateFilterEquationColumns = true;
			
			if (this.enableGroupBy.value)
			{
				this.setColumnKeySources([this._keySet_groupBy, this.groupBy]);
			}
			else
			{
				var list = this._yColumns.concat();
				if (this.colorDataWatcher.target)
					list.unshift(this.colorDataWatcher.target as IAttributeColumn);
				this.setColumnKeySources(list);
				
				this._in_updateFilterEquationColumns = false;
				return;
			}
			
			// update keys
			this._keySet_groupBy.delayCallbacks();
			var reverseKeys:IQualifiedKey[] = []; // a list of the keys returned as values from keyColumn
			var lookup:Set<IQualifiedKey> = new Set(); // keeps track of what keys were already seen
			var foreignKeyType:string = this.getForeignKeyType();
			for (var key of this.groupBy.keys)
			{
				var localName:string = this.groupBy.getValueFromKey(key, String) as string;
				var filterKey:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(foreignKeyType, localName);
				if (filterKey && !lookup.has(filterKey))
				{
					lookup.add(filterKey);
					reverseKeys.push(filterKey);
				}
			}
			this._keySet_groupBy.replaceKeys(reverseKeys);
			this._keySet_groupBy.resumeCallbacks();

			// check for missing columns
			if (!(this.xData.getInternalColumn() && this.yData.getInternalColumn() && this.groupBy.getInternalColumn()))
			{
				if (this.groupBy.getInternalColumn())
					this.columns.removeAllObjects();
				
				if (this._xColumns.length > 0)
					this.xColumns.removeAllObjects();
				this._in_updateFilterEquationColumns = false;
				return;
			}
			
			// check that column keytypes are the same
			var keyType:string = ColumnUtils.getKeyType(this.groupBy);
			if (keyType != ColumnUtils.getKeyType(this.xData) || keyType != ColumnUtils.getKeyType(this.yData))
			{
				this._in_updateFilterEquationColumns = false;
				return;
			}
			
			this.columns.delayCallbacks();

			var values = this.getXValues();
			
			// remove columns with names not appearing in values list
			for (var name of this.columns.getNames())
				if (values.indexOf(name) < 0)
					this.columns.removeObject(name);
			
			// create an equation column for each filter value
			for (var i = 0; i < values.length; i++)
			{
				var value = values[i];
				var col:EquationColumn = this.columns.requestObject(value, EquationColumn, false);
				col.delayCallbacks();
				col.variables.requestObjectCopy("keyCol", this.groupBy);
				col.variables.requestObjectCopy("filterCol", this._filteredXData);
				col.variables.requestObjectCopy("dataCol", this._filteredYData);
				var filterValue:LinkableString = col.variables.requestObject('filterValue', LinkableString, false);
				filterValue.state = value;
				
				col.setMetadataProperty(ColumnMetadata.TITLE, value);
				col.setMetadataProperty(ColumnMetadata.MIN, '{ getMin(dataCol) }');
				col.setMetadataProperty(ColumnMetadata.MAX, '{ getMax(dataCol) }');
				
				col.equation.value = 'getValueFromFilterColumn(keyCol, filterCol, dataCol, filterValue.value, dataType)';
				col.resumeCallbacks();
			}
			this.columns.setNameOrder(values);
			
			this.columns.resumeCallbacks();
			
			this._in_updateFilterEquationColumns = false;
		}
		
		public normalize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public curveType:LinkableString = Weave.linkableChild(this, new LinkableString(OldParallelCoordinatesPlotter.CURVE_NONE, this.curveTypeVerifier));
		public zoomToSubset:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		public shapeToDraw:LinkableString = Weave.linkableChild(this, new LinkableString(OldParallelCoordinatesPlotter.SOLID_CIRCLE, this.shapeTypeVerifier));
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
				this.curveType.value = OldParallelCoordinatesPlotter.CURVE_NONE;
			if (type == "ParallelCoordinatesPlotter.LINE_CURVE_TOWARDS")
				this.curveType.value = OldParallelCoordinatesPlotter.CURVE_TOWARDS;
			if (type == "ParallelCoordinatesPlotter.LINE_CURVE_AWAY")
				this.curveType.value = OldParallelCoordinatesPlotter.CURVE_AWAY;
			if (type == "ParallelCoordinatesPlotter.LINE_DOUBLE_CURVE")
				this.curveType.value = OldParallelCoordinatesPlotter.CURVE_DOUBLE;
			
			var types = [OldParallelCoordinatesPlotter.CURVE_NONE, OldParallelCoordinatesPlotter.CURVE_TOWARDS, OldParallelCoordinatesPlotter.CURVE_AWAY, OldParallelCoordinatesPlotter.CURVE_DOUBLE];
			return types.indexOf(type) >= 0;
		}

		public static shapesAvailable = [OldParallelCoordinatesPlotter.NO_SHAPE, OldParallelCoordinatesPlotter.SOLID_CIRCLE, OldParallelCoordinatesPlotter.SOLID_SQUARE, OldParallelCoordinatesPlotter.EMPTY_CIRCLE, OldParallelCoordinatesPlotter.EMPTY_SQUARE];
		
		public static NO_SHAPE:string 	  = "No Shape";
		public static SOLID_CIRCLE:string   = "Solid Circle";
		public static EMPTY_CIRCLE:string   = "Empty Circle";
		public static SOLID_SQUARE:string   = "Solid Square";
		public static EMPTY_SQUARE:string   = "Empty Square";
		private shapeTypeVerifier(type:string):boolean
		{
			return OldParallelCoordinatesPlotter.shapesAvailable.indexOf(type) >= 0;
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.getBoundsCoords(recordKey, output, false);
		}
		
		/**
		 * Gets an Array of Bounds2D objects for a given key in data coordinates.
		 * @parma recordKey The key
		 * @param output Used to store the Bounds2D objects.
		 * @param includeUndefinedBounds If this is set to true, the output is guaranteed to have the same length as _yColumns.
		 */
		protected getBoundsCoords(recordKey:IQualifiedKey, output:Bounds2D[], includeUndefinedBounds:boolean):void
		{
			var enableGeomProbing:boolean = WeaveProperties.getProperties(this).enableGeometryProbing.value;
			
			this.initBoundsArray(output, this._yColumns.length);
			
			var outIndex:int = 0;
			for (var i:int = 0; i < this._yColumns.length; ++i)
			{
				this.getCoords(recordKey, i, OldParallelCoordinatesPlotter.tempPoint);
				if (includeUndefinedBounds || isFinite(OldParallelCoordinatesPlotter.tempPoint.x) && isFinite(OldParallelCoordinatesPlotter.tempPoint.y))
					output[outIndex].includePoint(OldParallelCoordinatesPlotter.tempPoint);
				// when geom probing is enabled, report a single data bounds
				if (includeUndefinedBounds || !enableGeomProbing)
					outIndex++;
			}
			output.length = outIndex + 1;
		}
		
		private tempBoundsArray:Bounds2D[] = [];
		
		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, dataBounds:Bounds2D = null):(GeneralizedGeometry | ISimpleGeometry)[]
		{
			this.getBoundsCoords(recordKey, this.tempBoundsArray, true);
			
			var results:ISimpleGeometry[] = [];
			var geometry:ISimpleGeometry;
			
			for (var i:int = 0; i < this._yColumns.length; ++i)
			{
				var current = this.tempBoundsArray[i];
				var next = this.tempBoundsArray[i + 1];
				
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
		
		public getBackgroundGeometries():ISimpleGeometry[]
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
				if (this.enableGroupBy.value)
				{
					// reset lookup on first iteration
					if (task.iteration == 0)
						task.asyncState = new Set();
						
					// replace groupBy keys with foreign keys so we only render lines for foreign keys
					var foreignKeyType:string = this.getForeignKeyType();
					if (key.keyType != foreignKeyType)
						key = WeaveAPI.QKeyManager.getQKey(foreignKeyType, this.groupBy.getValueFromKey(key, String));
					
					// avoid rendering duplicate lines
					if ((task.asyncState as Set<IQualifiedKey>).has(key))
						return task.iteration / task.recordKeys.length;
					(task.asyncState as Set<IQualifiedKey>).add(key);
				}
				
				this.addRecordGraphics(key, task.dataBounds, task.screenBounds, task.buffer);
				/*
				if (clipDrawing)
				{
					// get clipRectangle
					task.screenBounds.getRectangle(this.clipRectangle);
					// increase width and height by 1 to avoid clipping rectangle borders drawn with vector graphics.
					this.clipRectangle.width++;
					this.clipRectangle.height++;
				}
				task.buffer.draw(tempShape, null, null, null, clipDrawing ? this.clipRectangle : null);
				*/
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
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			// project data coordinates to screen coordinates and draw graphics onto tempShape
			var i:int;
			var _shapeSize:number = this.shapeSize.value;
			var _prevX:number = 0;
			var _prevY:number = 0;
			var continueLine:boolean = false;
			var skipLines:boolean = this.enableGroupBy.value && this.groupBy.containsKey(recordKey);
			
			for (i = 0; i < this._yColumns.length; i++)
			{
				// project data coordinates to screen coordinates and draw graphics
				
				this.getCoords(recordKey, i, OldParallelCoordinatesPlotter.tempPoint);
				
				if (!isFinite(OldParallelCoordinatesPlotter.tempPoint.x) || !isFinite(OldParallelCoordinatesPlotter.tempPoint.y))
				{
					continueLine = false;
					continue;
				}
				
				dataBounds.projectPointTo(OldParallelCoordinatesPlotter.tempPoint, screenBounds);				
				var x:number = OldParallelCoordinatesPlotter.tempPoint.x;
				var y:number = OldParallelCoordinatesPlotter.tempPoint.y;
				
				var recordColor:number = this.lineStyle.color.getValueFromKey(recordKey, Number);
				
				// thickness of the line around each shape
				var shapeLineThickness:int = this.shapeBorderThickness.value;
				// use a border around each shape
				graphics.lineStyle(shapeLineThickness, this.shapeBorderColor.value, shapeLineThickness == 0 ? 0 : this.shapeBorderAlpha.value);
				if (_shapeSize > 0)
				{
					var shapeSize:number = _shapeSize;
					
					var shapeColor:number = recordColor;
					if (isNaN(shapeColor) && this.enableGroupBy.value)
					{
						var shapeKey:IQualifiedKey = this._yColumns[i].getValueFromKey(recordKey, IQualifiedKey);
						shapeColor = this.lineStyle.color.getValueFromKey(shapeKey, Number);
					}
					// draw a different shape for each option
					switch (this.shapeToDraw.value)
					{
						// solid circle
						case OldParallelCoordinatesPlotter.SOLID_CIRCLE:
							if (isFinite(shapeColor))
								graphics.beginFill(shapeColor);
							else
								graphics.endFill();
							// circle uses radius, so size/2
							graphics.drawCircle(x, y, shapeSize/2);
							break;
						// empty circle
						case OldParallelCoordinatesPlotter.EMPTY_CIRCLE:
							graphics.lineStyle(shapeLineThickness, shapeColor, shapeLineThickness == 0 ? 0 : 1);
							graphics.drawCircle(x, y, shapeSize/2);
							break;
						// solid square
						case OldParallelCoordinatesPlotter.SOLID_SQUARE:
							if (isFinite(shapeColor))
								graphics.beginFill(shapeColor);
							else
								graphics.endFill();
							graphics.drawRect(x-_shapeSize/2, y-_shapeSize/2, _shapeSize, _shapeSize);
							break;
						// empty square
						case OldParallelCoordinatesPlotter.EMPTY_SQUARE:
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
					this.lineStyle.beginLineStyle(recordKey, graphics);
				}
				else
				{
					graphics.lineStyle(shapeLineThickness, this.shapeBorderColor.value, shapeLineThickness == 0 ? 0 : this.shapeBorderAlpha.value);
				}
				
				// if we aren't continuing a new line (it is a new line segment)	
				if (!continueLine)
				{
					// set the previous X and Y locations to be this new coordinate
					_prevX = x;
					_prevY = y;
				}
				
				if (this.curveType.value == OldParallelCoordinatesPlotter.CURVE_NONE)
				{
					graphics.moveTo(_prevX, _prevY);
					graphics.lineTo(x, y);
					//DrawUtils.drawDashedLine(tempShape.graphics, _prevX, _prevY, x, y, 3, 2); 
				}
				else if (this.curveType.value == OldParallelCoordinatesPlotter.CURVE_DOUBLE)
					DrawUtils.drawDoubleCurve(graphics, _prevX, _prevY, x, y, true, 1);
				else if (this.curveType.value == OldParallelCoordinatesPlotter.CURVE_TOWARDS)
					DrawUtils.drawCurvedLine(graphics, _prevX,  _prevY, x, y, -1);
				else if (this.curveType.value == OldParallelCoordinatesPlotter.CURVE_AWAY)
					DrawUtils.drawCurvedLine(graphics, _prevX,  _prevY, x, y,  1);
				
				continueLine = true;

				_prevX = x;
				_prevY = y;
			}
		}
		
		public yAxisLabelFunction(value:number):string
		{
			var _yColumns:IAttributeColumn[] = this.columns.getObjects(IAttributeColumn);
			if (_yColumns.length > 0)
				return ColumnUtils.deriveStringFromNumber(_yColumns[0], value); // always use the first column to format the axis labels
			return null;
		}
		
		public xAxisLabelFunction(value:number):string
		{
			try
			{
				if (this.usingXAttributes)
					return ColumnUtils.deriveStringFromNumber(this._xColumns[0], value);
				else
					return ColumnUtils.getTitle(this._yColumns[value]);
			}
			catch(e) { };
			
			return "";
		}
		
		public get usingXAttributes():boolean
		{
			if (this._xColumns.length == this._yColumns.length)
				return true;
			else
				return false;
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			// normalized data coordinates
			if (this.zoomToSubset.value)
			{
				output.reset();
			}
			else
			{
				output.setBounds(0, 0, Math.max(1, this.columns.getNames().length - 1), 1);
				
				if (!this.normalize.value)
				{
					// reset y coords
					output.setYRange(NaN, NaN);
					for (var column of this.columns.getObjects(IAttributeColumn))
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
						// expand y range to include all data coordinates
						output.includeCoords(0, stats.getMin());
						output.includeCoords(0, stats.getMax());
					}
					
					if (this._xColumns.length > 0)
					{
						output.setXRange(NaN,NaN);
						for (var col of this._xColumns)
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
			
			if (this.enableGroupBy.value && this.groupBy.containsKey(recordKey))
			{
				if (this.xData.getValueFromKey(recordKey, String) != this.getXValues()[columnIndex])
					return;
				recordKey = WeaveAPI.QKeyManager.getQKey(this.getForeignKeyType(), this.groupBy.getValueFromKey(recordKey, String));
			}
			
			// X
			var xCol = this._xColumns[columnIndex];
			if (xCol)
				output.x = xCol.getValueFromKey(recordKey, Number);
			else if (this._xColumns.length == 0)
				output.x = columnIndex;
			
			// Y
			var yCol = this._yColumns[columnIndex];
			if (yCol && this.normalize.value)
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

