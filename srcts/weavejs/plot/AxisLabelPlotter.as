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
	import Matrix = flash.geom.Matrix;
	import Point = weavejs.geom.Point;
	import TextFormatAlign = flash.text.TextFormatAlign;
	
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	
	export class AxisLabelPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, AxisLabelPlotter, "Axis labels");
		
		public constructor()
		{
			setSingleKeySource(text);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.alongXAxis, this.begin, this.end);
		}
		
		public getSelectableAttributes():Array
		{
			return [text];
		}
		
		public getSelectableAttributeNames():Array
		{
			return ['Label text'];
		}
				
		private bitmapText:BitmapText = new BitmapText();
		private matrix:Matrix = new Matrix();

		private static tempPoint:Point = new Point(); // reusable object

		public alongXAxis:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public begin:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public end:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public interval:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public offset:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public color:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public text:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public textFormatAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT, verifyTextFormatAlign));
		public hAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_CENTER));
		public vAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public angle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public hideOverlappingText:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public xScreenOffset:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public yScreenOffset:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public maxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(80));
		public alignToDataMax:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public labelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, false, ['number', 'string', 'column']));
		
		private verifyTextFormatAlign(value:string):Boolean
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
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			var textWasDrawn:Array = [];
			var reusableBoundsObjects:Array = [];
			var bounds:Bounds2D;
			
			LinkableTextFormat.defaultTextFormat.copyTo(bitmapText.textFormat);
			bitmapText.textFormat.color = color.value;
			bitmapText.angle = angle.value;
			bitmapText.verticalAlign = vAlign.value;
			bitmapText.horizontalAlign = hAlign.value;
			bitmapText.maxWidth = maxWidth.value;
			bitmapText.textFormat.align = textFormatAlign.value;
			
			var _begin:number = numericMax(begin.value, alongXAxis.value ? dataBounds.getXMin() : dataBounds.getYMin());
			var _end:number = numericMin(end.value, alongXAxis.value ? dataBounds.getXMax() : dataBounds.getYMax());
			var _interval:number = Math.abs(interval.value);
			var _offset:number = offset.value || 0;
			
			var scale:number = alongXAxis.value
				? dataBounds.getXCoverage() / screenBounds.getXCoverage()
				: dataBounds.getYCoverage() / screenBounds.getYCoverage();
			
			if (_begin < _end && ((_begin - _offset) % _interval == 0 || _interval == 0))
				drawLabel(_begin, dataBounds, screenBounds, destination);
			
			if (_interval > scale)
			{
				var first:number = _begin - (_begin - _offset) % _interval;
				if (first <= _begin)
					first += _interval;
				for (var i:int = 0, number:number = first; number < _end; number = first + _interval * ++i)
					drawLabel(number, dataBounds, screenBounds, destination);
			}
			else if (isFinite(offset.value) && _begin < _offset && _offset < _end)
				drawLabel(_offset, dataBounds, screenBounds, destination);

			if (_begin <= _end && ((_end - _offset) % _interval == 0 || _interval == 0))
				drawLabel(_end, dataBounds, screenBounds, destination);
		}
		
		private drawLabel(number:number, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			bitmapText.text = ColumnUtils.deriveStringFromNumber(text, number) || StandardLib.formatNumber(number);
			try
			{
				if (labelFunction.value)
					bitmapText.text = labelFunction.apply(null, [number, bitmapText.text, text]);
			}
			catch (e:Error)
			{
				return;
			}
			
			if (alongXAxis.value)
			{
				tempPoint.x = number;
				tempPoint.y = alignToDataMax.value ? dataBounds.getYMax() : dataBounds.getYMin();
			}
			else
			{
				tempPoint.x = alignToDataMax.value ? dataBounds.getXMax() : dataBounds.getXMin();
				tempPoint.y = number;
			}
			dataBounds.projectPointTo(tempPoint, screenBounds);
			bitmapText.x = tempPoint.x + xScreenOffset.value;
			bitmapText.y = tempPoint.y + yScreenOffset.value;
								
			bitmapText.draw(destination);
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
			if (alongXAxis.value)
				output.setXRange(begin.value, end.value);
			else
				output.setYRange(begin.value, end.value);
		}
		
		private numericMin(userValue:number, systemValue:number):number
		{
			return userValue < systemValue ? userValue : systemValue; // if userValue is NaN, returns systemValue
		}
		
		private numericMax(userValue:number, systemValue:number):number
		{
			return userValue > systemValue ? userValue : systemValue; // if userValue is NaN, returns systemValue
		}
		
		// backwards compatibility
		/*[Deprecated] public set start(value:number):void { begin.value = offset.value = value; }
		[Deprecated] public set horizontal(value:Boolean):void { alongXAxis.value = value; }*/
	}
}
