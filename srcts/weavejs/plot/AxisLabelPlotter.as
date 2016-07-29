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

	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import Graphics = PIXI.Graphics;

	export class AxisLabelPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			super();
			this.setSingleKeySource(this.text);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.alongXAxis, this.begin, this.end);
		}
		
		public getSelectableAttributes()
		{
			return [this.text];
		}
		
		public getSelectableAttributeNames()
		{
			return ['Label text'];
		}
				
		private bitmapText:BitmapText = new BitmapText();

		private static tempPoint:Point = new Point(); // reusable object

		public alongXAxis:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public begin:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public end:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public interval:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public offset:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public color:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public text:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public textFormatAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT, this.verifyTextFormatAlign));
		public hAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_CENTER));
		public vAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public angle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public xScreenOffset:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public yScreenOffset:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public maxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(80));
		public alignToDataMax:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public labelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, ['number', 'string', 'column']));
		
		private verifyTextFormatAlign(value:string):boolean
		{
			return [
				TextFormatAlign.CENTER,
				TextFormatAlign.JUSTIFY,
				TextFormatAlign.LEFT,
				TextFormatAlign.RIGHT
			].indexOf(value) >= 0;
		}

		/**
		 * Draws the graphics onto BitmapData.
		 */
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			LinkableTextFormat.defaultTextFormat.copyTo(this.bitmapText.textFormat);
			this.bitmapText.textFormat.color = this.color.value;
			this.bitmapText.angle = this.angle.value;
			this.bitmapText.verticalAlign = this.vAlign.value;
			this.bitmapText.horizontalAlign = this.hAlign.value;
			this.bitmapText.maxWidth = this.maxWidth.value;
			this.bitmapText.textFormat.align = this.textFormatAlign.value;
			
			var _begin:number = Math.max(this.begin.value || -Infinity, this.alongXAxis.value ? dataBounds.getXMin() : dataBounds.getYMin());
			var _end:number = Math.min(this.end.value || Infinity, this.alongXAxis.value ? dataBounds.getXMax() : dataBounds.getYMax());
			var _interval:number = Math.abs(this.interval.value);
			var _offset:number = this.offset.value || 0;
			
			var scale:number = this.alongXAxis.value
				? dataBounds.getXCoverage() / screenBounds.getXCoverage()
				: dataBounds.getYCoverage() / screenBounds.getYCoverage();
			
			if (_begin < _end && ((_begin - _offset) % _interval == 0 || _interval == 0))
				this.drawLabel(_begin, dataBounds, screenBounds, destination);
			
			if (_interval > scale)
			{
				var first:number = _begin - (_begin - _offset) % _interval;
				if (first <= _begin)
					first += _interval;
				for (var i:int = 0, number:number = first; number < _end; number = first + _interval * ++i)
					this.drawLabel(number, dataBounds, screenBounds, destination);
			}
			else if (isFinite(this.offset.value) && _begin < _offset && _offset < _end)
				this.drawLabel(_offset, dataBounds, screenBounds, destination);

			if (_begin <= _end && ((_end - _offset) % _interval == 0 || _interval == 0))
				this.drawLabel(_end, dataBounds, screenBounds, destination);
		}
		
		private drawLabel(number:number, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			this.bitmapText.text = ColumnUtils.deriveStringFromNumber(this.text, number) || StandardLib.formatNumber(number);
			try
			{
				if (this.labelFunction.value)
					this.bitmapText.text = this.labelFunction.apply(null, [number, this.bitmapText.text, this.text]);
			}
			catch (e)
			{
				return;
			}
			
			if (this.alongXAxis.value)
			{
				AxisLabelPlotter.tempPoint.x = number;
				AxisLabelPlotter.tempPoint.y = this.alignToDataMax.value ? dataBounds.getYMax() : dataBounds.getYMin();
			}
			else
			{
				AxisLabelPlotter.tempPoint.x = this.alignToDataMax.value ? dataBounds.getXMax() : dataBounds.getXMin();
				AxisLabelPlotter.tempPoint.y = number;
			}
			dataBounds.projectPointTo(AxisLabelPlotter.tempPoint, screenBounds);
			this.bitmapText.x = AxisLabelPlotter.tempPoint.x + this.xScreenOffset.value;
			this.bitmapText.y = AxisLabelPlotter.tempPoint.y + this.yScreenOffset.value;
								
			this.bitmapText.draw(destination);
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
			if (this.alongXAxis.value)
				output.setXRange(this.begin.value, this.end.value);
			else
				output.setYRange(this.begin.value, this.end.value);
		}
		
		// backwards compatibility
		/*[Deprecated] public set start(value:number):void { begin.value = offset.value = value; }
		[Deprecated] public set horizontal(value:boolean):void { alongXAxis.value = value; }*/
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, AxisLabelPlotter, "Axis labels");
}

