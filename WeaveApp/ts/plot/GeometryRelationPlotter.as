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
		public constructor()
		{
			this.valueStats = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.valueColumn));
			
			this.setColumnKeySources([this.geometryColumn]);
			this.addSpatialDependencies(this.geometryColumn, this.sourceKeyColumn, this.destinationKeyColumn);
		}
		
		public getDescription():string
		{
			return this.geometryColumn.getDescription();
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
		protected getGeomCoords(geomKey:IQualifiedKey, output:Point):boolean
		{
			var geoms:GeneralizedGeometry[] = this.geometryColumn.getValueFromKey(geomKey, Array);
			var geom:GeneralizedGeometry;
			if (geoms && geoms.length)
				geom = Weave.AS(geoms[0], GeneralizedGeometry);
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
		
		public includeDestPointsInDataBounds:boolean = false; // for testing
		
		/*override*/ public getDataBoundsFromRecordKey(geomKey:IQualifiedKey, output:Array):void
		{
			this.getGeomCoords(geomKey, this.tempPoint);
			
			if (this.includeDestPointsInDataBounds)
			{
				var rowKeys:Array = EquationColumnLib.getAssociatedKeys(this.sourceKeyColumn, geomKey);
				var n:int = rowKeys ? rowKeys.length : 0;
				this.initBoundsArray(output, n + 1).includePoint(this.tempPoint);
				for (var i:int = 0; i < n; i++)
				{
					this.getGeomCoords(this.destinationKeyColumn.getValueFromKey(rowKeys[i], IQualifiedKey), this.tempPoint);
					output[i + 1].includePoint(this.tempPoint);
				}
			}
			else
			{
				this.initBoundsArray(output).includePoint(this.tempPoint);
			}
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			// Make sure all four column are populated
			if (task.iteration == 0 && (
					this.sourceKeyColumn.keys.length == 0
					|| this.destinationKeyColumn.keys.length == 0
					|| this.valueColumn.keys.length == 0
					|| this.geometryColumn.keys.length == 0))
				return 1;
			
			// this template from AbstractPlotter will draw one record per iteration
			if (task.iteration < task.recordKeys.length)
			{
				
				//------------------------
				// draw one record
				var geoKey:IQualifiedKey = task.recordKeys[task.iteration];
				tempShape.graphics.clear();

				if (!this.getGeomCoords(geoKey, this.tempSourcePoint))
					return task.iteration / task.recordKeys.length;
				
				task.dataBounds.projectPointTo(this.tempSourcePoint, task.screenBounds);

				var rowKeys = EquationColumnLib.getAssociatedKeys(this.sourceKeyColumn, geoKey);
				var rowKey:IQualifiedKey;
				var destKey:IQualifiedKey;
				var value:number;
				
				// Draw lines from source to destinations
				var absMax:number = Math.max(Math.abs(this.valueStats.getMin()), Math.abs(this.valueStats.getMax()));
				
				// Value normalization
				for (rowKey of rowKeys)
				{
					destKey = this.destinationKeyColumn.getValueFromKey(rowKey, IQualifiedKey);
					value = this.valueColumn.getValueFromKey(rowKey, Number);
					
					if (geoKey == destKey)
						continue;
					
					var color:uint = value < 0 ? this.negLineColor.value : this.posLineColor.value;
					var thickness:number = Math.abs(value / absMax) * this.lineWidth.value;
					var ceil:number = Math.ceil(thickness);
					var floor:number = Math.floor(thickness);
					var fractional:number = thickness - floor;
					var alpha:number = floor/ceil + (1.0 - floor/ceil) * fractional; // between floor/ceil and 1
					tempShape.graphics.lineStyle(thickness, color, alpha);
					tempShape.graphics.moveTo(this.tempSourcePoint.x, this.tempSourcePoint.y);
					if (!this.getGeomCoords(destKey, this.tempPoint))
						continue;
					task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
					tempShape.graphics.lineTo(this.tempPoint.x, this.tempPoint.y);
				}
								
				task.buffer.draw(tempShape);
				
				if (this.showValue.value)
				{
					for (rowKey of rowKeys)
					{
						destKey = this.destinationKeyColumn.getValueFromKey(rowKey, IQualifiedKey);
						if (!this.getGeomCoords(destKey, this.tempPoint))
							continue;
						task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
						
						this.bitmapText.x = Math.round((this.tempSourcePoint.x + this.tempPoint.x) / 2);
						this.bitmapText.y = Math.round((this.tempSourcePoint.y + this.tempPoint.y) / 2);
						this.bitmapText.text = this.valueColumn.getValueFromKey(rowKey, String);
						this.bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
						this.bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
						
						var f:TextFormat = this.bitmapText.textFormat;
						f.size = this.fontSize.value;
						f.color = this.fontColor.value;
						
						this.bitmapText.draw(task.buffer);
					}
				}
				
				// report progress
				return task.iteration / task.recordKeys.length;
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryRelationPlotter, "Geometry relations");
}
