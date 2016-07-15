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
	import Point = weavejs.geom.Point;
	import TextFormat = flash.text.TextFormat;
	
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ReprojectedGeometryColumn = weavejs.data.column.ReprojectedGeometryColumn;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import BitmapText = weavejs.util.BitmapText;
	import EquationColumnLib = weavejs.util.EquationColumnLib;

	export class GeometryRelationPlotter extends AbstractPlotter implements IObjectWithDescription
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryRelationPlotter, "Geometry relations");

		public constructor()
		{
			valueStats = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(valueColumn));
			
			setColumnKeySources([geometryColumn]);
			this.addSpatialDependencies(this.geometryColumn, this.sourceKeyColumn, this.destinationKeyColumn);
		}
		
		public getDescription():string
		{
			return geometryColumn.getDescription();
		}
		
		public geometryColumn:ReprojectedGeometryColumn = Weave.linkableChild(this, ReprojectedGeometryColumn);
		public sourceKeyColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public destinationKeyColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public valueColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public lineWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		public posLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xFF0000));
		public negLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x0000FF));
		public showValue:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public fontSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(11));
		public fontColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		private valueStats:IColumnStatistics;
		
		private bitmapText:BitmapText = new BitmapText();
		protected tempPoint:Point = new Point();
		protected tempSourcePoint:Point = new Point();
		
		/**
		 * @param geomKey
		 * @param output
		 * @return true on success 
		 */
		protected function getGeomCoords(geomKey:IQualifiedKey, output:Point):Boolean
		{
			var geoms:Array = geometryColumn.getValueFromKey(geomKey, Array) as Array;
			var geom:GeneralizedGeometry;
			if (geoms && geoms.length)
				geom = geoms[0] as GeneralizedGeometry;
			if (geom)
			{
				geom.bounds.getCenterPoint(output);
				return true;
			}
			else
			{
				output.x = output.y = NaN;
				return false;
			}
		}
		
		public includeDestPointsInDataBounds:Boolean = false; // for testing
		
		/*override*/ public getDataBoundsFromRecordKey(geomKey:IQualifiedKey, output:Array):void
		{
			getGeomCoords(geomKey, tempPoint);
			
			if (includeDestPointsInDataBounds)
			{
				var rowKeys:Array = EquationColumnLib.getAssociatedKeys(sourceKeyColumn, geomKey);
				var n:int = rowKeys ? rowKeys.length : 0;
				initBoundsArray(output, n + 1).includePoint(tempPoint);
				for (var i:int = 0; i < n; i++)
				{
					getGeomCoords(destinationKeyColumn.getValueFromKey(rowKeys[i], IQualifiedKey), tempPoint);
					(output[i + 1] as Bounds2D).includePoint(tempPoint);
				}
			}
			else
			{
				initBoundsArray(output).includePoint(tempPoint);
			}
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			// Make sure all four column are populated
			if (task.iteration == 0 && (
					sourceKeyColumn.keys.length == 0
					|| destinationKeyColumn.keys.length == 0
					|| valueColumn.keys.length == 0
					|| geometryColumn.keys.length == 0))
				return 1;
			
			// this template from AbstractPlotter will draw one record per iteration
			if (task.iteration < task.recordKeys.length)
			{
				
				//------------------------
				// draw one record
				var geoKey:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
				tempShape.graphics.clear();

				if (!getGeomCoords(geoKey, tempSourcePoint))
					return task.iteration / task.recordKeys.length;
				
				task.dataBounds.projectPointTo(tempSourcePoint, task.screenBounds);

				var rowKeys:Array = EquationColumnLib.getAssociatedKeys(sourceKeyColumn, geoKey);
				var rowKey:IQualifiedKey;
				var destKey:IQualifiedKey;
				var value:number;
				
				// Draw lines from source to destinations
				var absMax:number = Math.max(Math.abs(valueStats.getMin()), Math.abs(valueStats.getMax()));
				
				// Value normalization
				for each (rowKey in rowKeys)
				{
					destKey = destinationKeyColumn.getValueFromKey(rowKey, IQualifiedKey);
					value = valueColumn.getValueFromKey(rowKey, Number);
					
					if (geoKey == destKey)
						continue;
					
					var color:uint = value < 0 ? negLineColor.value : posLineColor.value;
					var thickness:number = Math.abs(value / absMax) * lineWidth.value;
					var ceil:number = Math.ceil(thickness);
					var floor:number = Math.floor(thickness);
					var fractional:number = thickness - floor;
					var alpha:number = floor/ceil + (1.0 - floor/ceil) * fractional; // between floor/ceil and 1
					tempShape.graphics.lineStyle(thickness, color, alpha);
					tempShape.graphics.moveTo(tempSourcePoint.x, tempSourcePoint.y);
					if (!getGeomCoords(destKey, tempPoint))
						continue;
					task.dataBounds.projectPointTo(tempPoint, task.screenBounds);
					tempShape.graphics.lineTo(tempPoint.x, tempPoint.y);
				}
								
				task.buffer.draw(tempShape);
				
				if (showValue.value)
				{
					for each (rowKey in rowKeys)
					{
						destKey = destinationKeyColumn.getValueFromKey(rowKey, IQualifiedKey);
						if (!getGeomCoords(destKey, tempPoint))
							continue;
						task.dataBounds.projectPointTo(tempPoint, task.screenBounds);
						
						bitmapText.x = Math.round((tempSourcePoint.x + tempPoint.x) / 2);
						bitmapText.y = Math.round((tempSourcePoint.y + tempPoint.y) / 2);
						bitmapText.text = valueColumn.getValueFromKey(rowKey, String);
						bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
						bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
						
						var f:TextFormat = bitmapText.textFormat;
						f.size = fontSize.value;
						f.color = fontColor.value;
						
						bitmapText.draw(task.buffer);
					}
				}
				
				// report progress
				return task.iteration / task.recordKeys.length;
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}
	}
}