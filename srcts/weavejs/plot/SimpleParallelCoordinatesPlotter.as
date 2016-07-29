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
	import IPlotter = weavejs.api.ui.IPlotter;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import GeometryType = weavejs.geom.GeometryType;
	import SimpleGeometry = weavejs.geom.SimpleGeometry;
	import DrawUtils = weavejs.util.DrawUtils;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;

	export class SimpleParallelCoordinatesPlotter extends AbstractPlotter implements IPlotterWithGeometries, ISelectableAttributes
	{
		private static tempBoundsArray:Array = []; // Array of reusable Bounds2D objects
		private static tempPoint:Point = new Point(); // reusable Point object
		
		public columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public normalize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public selectableLines:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public curvedLines:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		private _columns:Array = [];
		private _stats:Map = new WeakMap();
		private extendPointBounds:number = 0.25; // extends point bounds when selectableLines is false
		private drawStubs:boolean = true; // draws stubbed line segments eminating from points with missing neighboring values
		
		public constructor()
		{
			this.lineStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.lineStyle.weight.defaultValue.value = 1;
			this.lineStyle.alpha.defaultValue.value = 1.0;

			clipDrawing = false;
			
			this.columns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			// bounds need to be re-indexed when this option changes
			this.addSpatialDependencies(Weave.properties.enableGeometryProbing);
			this.addSpatialDependencies(this.columns, this.normalize, this.selectableLines);
		}
		private handleColumnsListChange():void
		{
			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = this.columns.childListCallbacks.lastObjectAdded as IAttributeColumn;
			if (newColumn)
			{
				this._stats[newColumn] = WeaveAPI.StatisticsCache.getColumnStatistics(newColumn);
				Weave.linkableChild(this.spatialCallbacks, this._stats[newColumn]);
			}
			
			this._columns = this.columns.getObjects();
			
			this.setColumnKeySources([this.lineStyle.color].concat(this._columns));
		}
		
		public getSelectableAttributeNames()
		{
			return ["Color", "Columns"];
		}
		public getSelectableAttributes()
		{
			return [this.lineStyle.color, this.columns];
		}

		/**
		 * Gets an Array of numeric values from the columns.
		 * @param recordKey A key.
		 * @return An Array Numbers.
		 */
		private getValues(recordKey:IQualifiedKey):Array
		{
			var output:Array = new Array(this._columns.length);
			for (var i:int = 0; i < this._columns.length; i++)
			{
				var column:IAttributeColumn = this._columns[i];
				if (this.normalize.value)
					output[i] = (this._stats[column] as IColumnStatistics).getNorm(recordKey);
				else
					output[i] = column.getValueFromKey(recordKey, Number);
			}
			return output;
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var enableGeomProbing:boolean = Weave.properties.enableGeometryProbing.value;
			
			var values:Array = this.getValues(recordKey);
			
			// when geom probing is enabled, report a single data bounds
			this.initBoundsArray(output, enableGeomProbing ? 1 : values.length);
			
			var stubSize:number = this.selectableLines.value ? 0.5 : this.extendPointBounds;
			var outputIndex:int = 0;
			for (var x:int = 0; x < values.length; x++)
			{
				var y:number = values[x];
				if (isFinite(y))
				{
					var bounds:Bounds2D = output[outputIndex] as Bounds2D;
					bounds.includeCoords(x, y);
					if (this.drawStubs)
					{
						bounds.includeCoords(x - stubSize, y);
						bounds.includeCoords(x + stubSize, y);
					}
					if (!enableGeomProbing)
						outputIndex++;
				}
			}
		}
		
		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, dataBounds:Bounds2D = null):(GeneralizedGeometry | ISimpleGeometry)[]
		{
			var x:int;
			var y:number;
			var results:Array = [];
			var values:Array = this.getValues(recordKey);
			if (this.selectableLines.value)
			{
				var continueLine:boolean = false;
				for (x = 0; x < values.length; x++)
				{
					y = values[x];
					if (isFinite(y))
					{
						if (continueLine)
						{
							// finite -> finite
							results.push(new SimpleGeometry(GeometryType.LINE, [
								new Point(x - 1, values[x - 1]),
								new Point(x, y)
							]));
						}
						else
						{
							// NaN -> finite
							if (this.drawStubs && x > 0)
							{
								results.push(new SimpleGeometry(GeometryType.LINE, [
									new Point(x - 0.5, y),
									new Point(x, y)
								]));
							}
							else if (x == values.length - 1)
							{
								results.push(new SimpleGeometry(GeometryType.POINT, [
									new Point(x, y)
								]));
							}
						}
						continueLine = true;
					}
					else
					{
						if (continueLine)
						{
							// finite -> NaN
							y = values[x - 1];
							if (this.drawStubs)
							{
								results.push(new SimpleGeometry(GeometryType.LINE, [
									new Point(x - 1, y),
									new Point(x - 0.5, y)
								]));
							}
							else
							{
								results.push(new SimpleGeometry(GeometryType.POINT, [
									new Point(x - 1, y)
								]));
							}
						}
						continueLine = false;
					}
				}
			}
			else
			{
				for (x = 0; x < values.length; x++)
				{
					y = values[x];
					if (isFinite(y))
					{
						if (this.extendPointBounds)
							results.push(new SimpleGeometry(GeometryType.LINE, [
								new Point(x - this.extendPointBounds, y),
								new Point(x + this.extendPointBounds, y)
							]));
						else
							results.push(new SimpleGeometry(GeometryType.POINT, [
								new Point(x, y)
							]));
					}
				}
			}
			
			return results;
		}
		
		public getBackgroundGeometries():Array
		{
			return [];
		}
		
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:Graphics):void
		{
			var graphics:Graphics = tempShape.graphics;
			var prevScreenX:number = NaN;
			var prevScreenY:number = NaN;
			var continueLine:boolean = false;
			
			this.lineStyle.beginLineStyle(recordKey, graphics);
			
			var values:Array = this.getValues(recordKey);
			for (var x:int = 0; x < values.length; x++)
			{
				var y:number = values[x];
				if (!isFinite(y))
				{
					// missing value
					if (this.drawStubs && continueLine)
					{
						// previous value was not missing, so half a horizontal line eminating from the previous point
						SimpleParallelCoordinatesPlotter.tempPoint.x = x - 0.5;
						SimpleParallelCoordinatesPlotter.tempPoint.y = values[x - 1];
						dataBounds.projectPointTo(SimpleParallelCoordinatesPlotter.tempPoint, screenBounds);
						graphics.lineTo(SimpleParallelCoordinatesPlotter.tempPoint.x, SimpleParallelCoordinatesPlotter.tempPoint.y);
					}
					
					continueLine = false;
					continue;
				}
				
				// value is not missing
				
				if (x > 0 && this.drawStubs && !continueLine)
				{
					// previous value was missing, so draw half a horizontal line going into the current point
					SimpleParallelCoordinatesPlotter.tempPoint.x = x - 0.5;
					SimpleParallelCoordinatesPlotter.tempPoint.y = y;
					dataBounds.projectPointTo(SimpleParallelCoordinatesPlotter.tempPoint, screenBounds);
					prevScreenX = SimpleParallelCoordinatesPlotter.tempPoint.x
					prevScreenY = SimpleParallelCoordinatesPlotter.tempPoint.y;
					graphics.moveTo(prevScreenX, prevScreenY);
					continueLine = true;
				}
				
				SimpleParallelCoordinatesPlotter.tempPoint.x = x;
				SimpleParallelCoordinatesPlotter.tempPoint.y = y;
				dataBounds.projectPointTo(SimpleParallelCoordinatesPlotter.tempPoint, screenBounds);
				if (continueLine)
				{
					if (this.curvedLines.value)
						DrawUtils.drawDoubleCurve(graphics, prevScreenX, prevScreenY, SimpleParallelCoordinatesPlotter.tempPoint.x, SimpleParallelCoordinatesPlotter.tempPoint.y, true, 1, continueLine);
					else
						graphics.lineTo(SimpleParallelCoordinatesPlotter.tempPoint.x, SimpleParallelCoordinatesPlotter.tempPoint.y);
				}
				else
					graphics.moveTo(SimpleParallelCoordinatesPlotter.tempPoint.x, SimpleParallelCoordinatesPlotter.tempPoint.y);
				
				continueLine = true;
				prevScreenX = SimpleParallelCoordinatesPlotter.tempPoint.x;
				prevScreenY = SimpleParallelCoordinatesPlotter.tempPoint.y;
			}
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setXRange(0, this._columns.length - 1);
			if (this.normalize.value)
			{
				output.setYRange(0, 1);
			}
			else
			{
				output.setYRange(NaN, NaN);
				for (var i:int = 0; i < this._columns.length; i++)
				{
					var stats:IColumnStatistics = this._stats[this._columns[i]];
					output.includeCoords(i, stats.getMin());
					output.includeCoords(i, stats.getMax());
				}
			}
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, SimpleParallelCoordinatesPlotter, "Parallel Coordinates");
}

