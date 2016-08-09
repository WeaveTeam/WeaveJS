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
	import DynamicState = weavejs.api.core.DynamicState;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;
	
	export class CircleGlyphPlotter extends AbstractGlyphPlotter
	{
		public constructor()
		{
			super();
			this.fill.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
		}

		public minScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(3, isFinite));
		public maxScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(12, isFinite));
		public defaultScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5, isFinite));
		public enabledSizeBy:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		public absoluteValueColorEnabled:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public absoluteValueColorMin:LinkableNumber = Weave.linkableChild(this, new LinkableNumber());
		public absoluteValueColorMax:LinkableNumber = Weave.linkableChild(this, new LinkableNumber());
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public screenRadius:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		// delare dependency on statistics (for norm values)
		private _screenRadiusStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.screenRadius));
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		// backwards compatibility
		/*[Deprecated] public set fillStyle(value:Object):void
		{
			try
			{
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}*/
		
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
//			var hasPrevPoint:boolean = (isFinite(tempPoint.x) && isFinite(tempPoint.y));

			// project data coordinates to screen coordinates and draw graphics
			this.getCoordsFromRecordKey(recordKey, this.tempPoint);
			
			dataBounds.projectPointTo(this.tempPoint, screenBounds);
			
			this.line.beginLineStyle(recordKey, graphics);
			this.fill.beginFillStyle(recordKey, graphics);
			
			var radius:number;
			if (this.absoluteValueColorEnabled.value)
			{
				var sizeData:number = this.screenRadius.getValueFromKey(recordKey, Number);
				var alpha:number = this.fill.alpha.getValueFromKey(recordKey, Number);
				if ( sizeData < 0 )
					graphics.beginFill(this.absoluteValueColorMin.value, alpha);
				else if ( sizeData > 0 )
					graphics.beginFill(this.absoluteValueColorMax.value, alpha);
				var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(this.screenRadius);
				var min:number = stats.getMin();
				var max:number = stats.getMax();
				var absMax:number = Math.max(Math.abs(min), Math.abs(max));
				var normRadius:number = StandardLib.normalize(Math.abs(sizeData), 0, absMax);
				radius = normRadius * this.maxScreenRadius.value;
			}
			else if (this.enabledSizeBy.value)
			{
				radius = this.minScreenRadius.value + (this._screenRadiusStats.getNorm(recordKey) *(this.maxScreenRadius.value - this.minScreenRadius.value));
			}
			else
			{
				radius = this.defaultScreenRadius.value;
			}
			
//			if (hasPrevPoint)
//				graphics.lineTo(tempPoint.x, tempPoint.y);
			if (!isFinite(radius))
			{
				// handle undefined radius
				if (this.absoluteValueColorEnabled.value)
				{
					// draw nothing
				}
				else if (this.enabledSizeBy.value)
				{
					// draw square
					radius = this.defaultScreenRadius.value;
					graphics.drawRect(this.tempPoint.x - radius, this.tempPoint.y - radius, radius * 2, radius * 2);
				}
				else
				{
					// draw default circle
					graphics.drawCircle(this.tempPoint.x, this.tempPoint.y, this.defaultScreenRadius.value );
				}
			}
			else
			{
				if (this.absoluteValueColorEnabled.value && radius == 0)
				{
					// draw nothing
				}
				else
				{
					graphics.drawCircle(this.tempPoint.x, this.tempPoint.y, radius);
				}
			}
			graphics.endFill();
//			graphics.moveTo(tempPoint.x, tempPoint.y);
		}
		
		/*[Deprecated(replacement="line")] public set lineStyle(value:Object):void
		{
			try
			{
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}*/
	}
}

