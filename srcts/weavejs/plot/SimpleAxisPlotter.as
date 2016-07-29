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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import StandardLib = weavejs.util.StandardLib;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import KeySet = weavejs.data.key.KeySet;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableBounds2D = weavejs.geom.LinkableBounds2D;
	import LinkableNumberFormatter = weavejs.primitives.LinkableNumberFormatter;
	import LooseAxisDescription = weavejs.geom.LooseAxisDescription;
	import BitmapText = weavejs.util.BitmapText;
	import DrawUtils = weavejs.util.DrawUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	export class SimpleAxisPlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();

			//TODO: this list of properties should be contained in a separate object so we don't have to list them all here
			this.spatialCallbacks.addImmediateCallback(this, this.updateLabels);

			this.titleTextFormatWatcher.target = LinkableTextFormat.defaultTextFormat;
			this.labelTextFormatWatcher.target = LinkableTextFormat.defaultTextFormat;

			this.setSingleKeySource(this._keySet);
			
			this.addSpatialDependencies(
				this.axisLineDataBounds,
				this.axisLineMinValue,
				this.axisLineMaxValue,
				this.tickMinValue,
				this.tickMaxValue,
				this.tickCountRequested,
				this.forceTickCount,
				this._keySet
			);
		}
		
		public setupTextFormats(titleTextFormat:LinkableTextFormat, labelTextFormat:LinkableTextFormat):void
		{
			this.titleTextFormatWatcher.target = titleTextFormat;
			this.labelTextFormatWatcher.target = labelTextFormat;
		}
		private titleTextFormatWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		private labelTextFormatWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		
		public axisLabelHorizontalDistance:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-10, isFinite));
		public axisLabelVerticalDistance:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, isFinite));
		public axisLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-45, isFinite));
		public axisGridLineThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1, isFinite));
		public axisGridLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xDDDDDD));
		public axisGridLineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1, isFinite));
		public axesThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10, isFinite));
		public axesColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xB0B0B0, isFinite));
		public axesAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1, isFinite));
		
		// the axis line beginning and end data coordinates
		public axisLineDataBounds:LinkableBounds2D = Weave.linkableChild(this, LinkableBounds2D);
		// the value corresponding to the beginning of the axis line
		public axisLineMinValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the end of the axis line
		public axisLineMaxValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the beginning of the axis line.  If not specified, axisLineMinValue will be used.
		public tickMinValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the end of the axis line.  If not specified, axisLineMaxValue will be used.
		public tickMaxValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public overrideAxisName:LinkableString = Weave.linkableChild(this, LinkableString);
		// show or hide the axis name
		public showAxisName:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		// number of requested tick marks
		public tickCountRequested:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10));
		// This option forces the axis to generate the exact number of requested tick marks between tick min and max values (inclusive)
		public forceTickCount:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public showLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public labelNumberFormatter:LinkableNumberFormatter = Weave.linkableChild(this, LinkableNumberFormatter); // formatter to use when generating tick mark labels
		public labelTextAlignment:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT));
		public labelHorizontalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_RIGHT));
		public labelVerticalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public labelWordWrapSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(80));
		public labelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(SimpleAxisPlotter.DEFAULT_LABEL_FUNCTION, true, ['number', 'string', 'column']));
		private static DEFAULT_LABEL_FUNCTION:string = `
			function (number, string, column) {
				return string;
			}
		`;
		
		private _keySet:KeySet = Weave.linkableChild(this, KeySet); // stores tick mark keys
		private _axisDescription:LooseAxisDescription = new LooseAxisDescription(); // calculates tick marks
		private _bitmapText:BitmapText = new BitmapText(); // for drawing text
		private _xDataTickDelta:number; // x distance between ticks
		private _yDataTickDelta:number; // y distance between ticks
		private KEY_TYPE:string = Weave.className(SimpleAxisPlotter);
		private MIN_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(this.KEY_TYPE, 'minLabel');
		private MAX_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(this.KEY_TYPE, 'maxLabel');
		private _numberFormatter:NumberFormatter = new NumberFormatter();
		
		public showRealMinAndMax:boolean = false;
		// validates tick mark variables
		public updateLabels():void
		{
			var callbackCollections = [Weave.getCallbacks(this), this.spatialCallbacks];

			// make sure callbacks only run once
			for (let cc of callbackCollections)
				cc.delayCallbacks();
			
			var minValue = this.tickMinValue.value;
			var maxValue = this.tickMaxValue.value;
			if (isNaN(minValue))
				minValue = this.axisLineMinValue.value;
			if (isNaN(maxValue))
				maxValue = this.axisLineMaxValue.value;
				
			this._axisDescription.setup(minValue, maxValue, this.tickCountRequested.value, this.forceTickCount.value);
			
			
			this.labelNumberFormatter.precision.value = this._axisDescription.numberOfDigits;
			
			var newKeys = this.showRealMinAndMax ? [this.MIN_LABEL_KEY] : [];
			for (var i = 0; i < this._axisDescription.numberOfTicks; i++)
			{
				// only include tick marks that are between min,max values
				var tickValue:number = StandardLib.roundSignificant(this._axisDescription.tickMin + i * this._axisDescription.tickDelta);
				if (this.axisLineMinValue.value <= tickValue && tickValue <= this.axisLineMaxValue.value)
					newKeys.push(WeaveAPI.QKeyManager.getQKey(this.KEY_TYPE, String(i)));
			}
			if (this.showRealMinAndMax)
				newKeys.push(this.MAX_LABEL_KEY);
			
			var keysChanged:boolean = this._keySet.replaceKeys(newKeys);
			
			// allow callbacks to run now
			for (let cc of callbackCollections)
				cc.resumeCallbacks();
		}
		
		/**
		 * @param recordKey The key associated with a tick mark
		 * @param outputPoint A place to store the data coordinates of the tick mark
		 * @return The value associated with the tick mark
		 */
		private getTickValueAndDataCoords(recordKey:IQualifiedKey, outputPoint:Point):number
		{
			var _axisLineMinValue:number = this.axisLineMinValue.value;
			var _axisLineMaxValue:number = this.axisLineMaxValue.value;
			this.axisLineDataBounds.copyTo(this._tempBounds);

			var tickValue:number;
			// special case for min,max labels
			if (recordKey == this.MIN_LABEL_KEY)
			{
				tickValue = _axisLineMinValue;
				outputPoint.x = this._tempBounds.xMin;
				outputPoint.y = this._tempBounds.yMin;
			}
			else if (recordKey == this.MAX_LABEL_KEY)
			{
				tickValue = _axisLineMaxValue;
				outputPoint.x = this._tempBounds.xMax;
				outputPoint.y = this._tempBounds.yMax;
			}
			else
			{
				var tickIndex = parseInt(recordKey.localName);
				tickValue = StandardLib.roundSignificant(this._axisDescription.tickMin + tickIndex * this._axisDescription.tickDelta);
				outputPoint.x = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, this._tempBounds.xMin, this._tempBounds.xMax);
				outputPoint.y = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, this._tempBounds.yMin, this._tempBounds.yMax);
			}
			
			return tickValue;
		}
		
		/**
		 * gets the bounds of a tick mark 
		 */		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.getTickValueAndDataCoords(recordKey, this.tempPoint);
			this.initBoundsArray(output).setCenteredRectangle(this.tempPoint.x, this.tempPoint.y, 0, 0);
		}
		
		/**
		 * draws the grid lines (tick marks) 
		 */		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (!(typeof task.asyncState == 'function'))
			{
				// these variables are used to save state between function calls
				var axisAngle:number;
				var tickAngle:number;
				var labelAngle:number;
				var xTickOffset:number;
				var yTickOffset:number;
				var xLabelOffset:number;
				var yLabelOffset:number;
				var lineLength:number;
				var tickScreenDelta:number;
				
				task.asyncState = function():number
				{
					if (task.iteration == 0)
					{
						this.initPrivateAxisLineBoundsVariables(task.dataBounds, task.screenBounds);
						// everything below is in screen coordinates
			
						// get the angle of the axis line (relative to real screen coordinates, positive Y in downward direction)
						axisAngle = Math.atan2(this._axisLineScreenBounds.getHeight(), this._axisLineScreenBounds.getWidth());
						// ticks are perpendicular to axis line
						tickAngle = axisAngle + Math.PI / 2;
						// label angle is relative to axis angle
						labelAngle = axisAngle + this.axisLabelRelativeAngle.value * Math.PI / 180; // convert from degrees to radians
			
						// calculate tick line offset from angle
						xTickOffset = Math.cos(tickAngle) * 10 / 2;
						yTickOffset = Math.sin(tickAngle) * 10 / 2;
						
						// calculate label offset from angle
						xLabelOffset
							= this.axisLabelHorizontalDistance.value * Math.cos(labelAngle)
							+ this.axisLabelVerticalDistance.value * Math.cos(labelAngle + Math.PI / 2);
						yLabelOffset
							= this.axisLabelHorizontalDistance.value * Math.sin(labelAngle)
							+ this.axisLabelVerticalDistance.value * Math.sin(labelAngle + Math.PI / 2);
						
						this.setupBitmapText(this.labelTextFormatWatcher);
						this._bitmapText.maxWidth = this.labelWordWrapSize.value;
						
						// calculate the distance between tick marks to use as _bitmapText.maxHeight
						lineLength = Math.sqrt(Math.pow(this._axisLineScreenBounds.getWidth(), 2) + Math.pow(this._axisLineScreenBounds.getHeight(), 2));
						tickScreenDelta = lineLength / (this._axisDescription.numberOfTicks - 1);
						tickScreenDelta /= Math.SQRT2; // TEMPORARY SOLUTION -- assumes text is always at 45 degree angle
						this._bitmapText.maxHeight = tickScreenDelta;
			
						this._bitmapText.angle = labelAngle * 180 / Math.PI; // convert from radians to degrees
						
						// init number formatter for beginning & end tick marks
						this.labelNumberFormatter.copyTo(this._numberFormatter);
					}
					
					if (task.iteration < task.recordKeys.length)
					{
						var graphics:Graphics = this.tempShape.graphics;
						var key:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
		
						// get screen coordinates of tick mark
						var tickValue:number = this.getTickValueAndDataCoords(key, this.tempPoint);
						
						this._axisLineDataBounds.projectPointTo(this.tempPoint, this._axisLineScreenBounds);
						var xTick:number = this.tempPoint.x;
						var yTick:number = this.tempPoint.y;
						
						// draw tick mark line and grid lines
						graphics.clear();
						graphics.lineStyle(this.axisGridLineThickness.value, this.axisGridLineColor.value, this.axisGridLineAlpha.value);
						
						if (key == this.MIN_LABEL_KEY || key == this.MAX_LABEL_KEY)
						{
							graphics.moveTo(xTick - xTickOffset*2, yTick - yTickOffset*2);
							graphics.lineTo(xTick + xTickOffset*2, yTick + yTickOffset*2);
						}
						else if (axisAngle != 0)
						{
							graphics.moveTo(xTick-this.axesThickness.value, yTick);
							graphics.lineTo(xTick, yTick);
							graphics.moveTo(xTick, yTick);
							graphics.lineTo(task.screenBounds.getXMax(), yTick);
							
						}
						else if (axisAngle == 0)
						{
							var offset:number = 1;
							graphics.moveTo(xTick, yTick + offset);
							graphics.lineTo(xTick, yTick+this.axesThickness.value + offset);
							graphics.moveTo(xTick, yTick);
							graphics.lineTo(xTick, task.screenBounds.getYMax());
							
						}
						task.buffer.draw(this.tempShape);
						
						// draw tick mark label
						if (this.showLabels.value)
						{
							this._bitmapText.text = this.getLabel(tickValue);
							this._bitmapText.x = xTick + xLabelOffset;
							this._bitmapText.y = yTick + yLabelOffset;
							this._bitmapText.draw(task.buffer);
						}
						return task.iteration / task.recordKeys.length;
					}
					
					return 1; // avoids divide-by-zero when there are no record keys
				}; // end task function
			} // end if
			
			return (task.asyncState as Function).apply(this, arguments);
		}
		
		private _titleBounds:Bounds2D = null;
		public getTitleLabelBounds():Bounds2D
		{
			return this._titleBounds;
		}
		
		public static LABEL_POSITION_AT_AXIS_MIN:string = "AxisPlotter.LABEL_POSITION_AT_AXIS_MIN";
		public static LABEL_POSITION_AT_AXIS_CENTER:string = "AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER";
		public static LABEL_POSITION_AT_AXIS_MAX:string = "AxisPlotter.LABEL_POSITION_AT_AXIS_MAX";
		
		public static LABEL_LEFT_JUSTIFIED:string = BitmapText.HORIZONTAL_ALIGN_LEFT;
		public static LABEL_CENTERED:string = BitmapText.HORIZONTAL_ALIGN_CENTER;
		public static LABEL_RIGHT_JUSTIFIED:string = BitmapText.HORIZONTAL_ALIGN_RIGHT;
		
		// BEGIN TEMPORARY SOLUTION
		public setSideAxisName(
			name:string,
			angle:number,
			xDistance:number,
			yDistance:number,
			verticalAlign:string,
			labelPosition:string = SimpleAxisPlotter.LABEL_POSITION_AT_AXIS_CENTER,
			labelAlignment:string = null,
			maxLabelWidth:number = -1
		):void
		{
			this._axisName = name;
			this._axisNameAngle = angle;
			this._axisNameXDistance = xDistance;
			this._axisNameYDistance = yDistance;
			this._axisNameVerticalAlign = verticalAlign;
			this._labelPosition = labelPosition;
			this._labelAlignment = labelAlignment;
			this._maxLabelWidth = maxLabelWidth;
			
			Weave.getCallbacks(this).triggerCallbacks();
		}
		private get axisName():string
		{
			return this.overrideAxisName.value || this._axisName;
		}

		private _axisName:string;
		private _axisNameAngle:number;
		private _axisNameXDistance:number;
		private _axisNameYDistance:number;
		private _axisNameVerticalAlign:string;
		private _labelPosition:string;
		private _labelAlignment:string;
		private _maxLabelWidth:number;
		// END TEMPORARY SOLUTION
		
		/**
		 * draws the main axis line as a rectangle 
		 * @param dataBounds
		 * @param screenBounds
		 * @param destination
		 * 
		 */		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			// draw the axis border
			if (this.axesThickness.value != 0)
			{
				this.initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);
				var axisAngle:number = Math.atan2(this._axisLineScreenBounds.getHeight(), this._axisLineScreenBounds.getWidth());
				var thickness:number = this.axesThickness.value;
				var graphics:Graphics = this.tempShape.graphics;
				graphics.clear();
				DrawUtils.clearLineStyle(graphics);
				graphics.beginFill(this.axesColor.value, this.axesAlpha.value);
				var xMin:number = this._axisLineScreenBounds.getXNumericMin();
				var yMin:number = this._axisLineScreenBounds.getYNumericMin();
				var yOffset:number = 1;
				if (this._axisLineScreenBounds.getXCoverage() == 0) // draw vertical rectangle to the left of the axis
				{
					graphics.drawRect(
						xMin - thickness,
						yMin,
						thickness,
						this._axisLineScreenBounds.getYCoverage() + yOffset
					);
				}
				if (this._axisLineScreenBounds.getYCoverage() == 0) // draw horizontal rectangle below axis
				{
					graphics.drawRect(
						xMin - thickness,
						yMin + yOffset,
						this._axisLineScreenBounds.getXCoverage() + thickness,
						thickness
					);
				}
				graphics.endFill();
				destination.draw(this.tempShape);
			}
			if (this.showAxisName.value && this.axisName != null)
			{
				this.setupAxisNameBitmapText(dataBounds,screenBounds);
//				getAxisNameScreenBounds(dataBounds,screenBounds,_tempBounds);
//				destination.fillRect(new Rectangle(_tempBounds.xMin,_tempBounds.yMin,_tempBounds.width,_tempBounds.height),0x80FF0000);
				this._bitmapText.draw(destination);
			}
		}
		
		private _tempBounds:Bounds2D = new Bounds2D();
		
		protected setupBitmapText(whichTextFormat:LinkableWatcher):void
		{
			var ltf:LinkableTextFormat = whichTextFormat.target as LinkableTextFormat || LinkableTextFormat.defaultTextFormat;
			ltf.copyTo(this._bitmapText.textFormat);
			try {
				this._bitmapText.textFormat.align = this.labelTextAlignment.value;
			} catch (e) { }
			
			this._bitmapText.horizontalAlign = this.labelHorizontalAlign.value;
			this._bitmapText.verticalAlign = this.labelVerticalAlign.value;
		}
		
		protected setupAxisNameBitmapText(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			this.initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);

			//trace(dataBounds, screenBounds);

			// BEGIN TEMPORARY SOLUTION -- setup BitmapText for axis name
			if (this.axisName != null)
			{
				this.setupBitmapText(this.titleTextFormatWatcher);
				this._bitmapText.text = this.axisName;
				this._bitmapText.angle = this._axisNameAngle;
				this._bitmapText.textFormat.align = this.TextFormatAlign.LEFT;
				this._bitmapText.verticalAlign = this._axisNameAngle == 0 ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP;
				this._bitmapText.maxWidth = this._axisNameAngle == 0 ? screenBounds.getXCoverage() : screenBounds.getYCoverage();
				this._bitmapText.maxHeight = 40; // temporary solution
				
				if (this._maxLabelWidth != -1)
					this._bitmapText.maxWidth = this._maxLabelWidth;
				
				if (this._labelPosition == this.LABEL_POSITION_AT_AXIS_MIN)
				{
					this._bitmapText.x = this._axisLineScreenBounds.xMin + this._axisNameXDistance;
					this._bitmapText.y = this._axisLineScreenBounds.yMin + this._axisNameYDistance;
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				}
				if (this._labelPosition == this.LABEL_POSITION_AT_AXIS_MAX)
				{
					this._bitmapText.x = this._axisLineScreenBounds.xMax + this._axisNameXDistance;
					this._bitmapText.y = this._axisLineScreenBounds.yMax + this._axisNameYDistance;
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
				}
				if (this._labelPosition == this.LABEL_POSITION_AT_AXIS_CENTER)
				{
					this._bitmapText.x = this._axisLineScreenBounds.getXCenter() + this._axisNameXDistance;
					this._bitmapText.y = this._axisLineScreenBounds.getYCenter() + this._axisNameYDistance;
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
				}
				
				if (this._labelAlignment)
					this._bitmapText.horizontalAlign = this._labelAlignment;

				//_titleBounds = new Bounds2D(_bitmapText.x, _bitmapText.y, _bitmapText.width + _bitmapText.x, _bitmapText.height + _bitmapText.y)

			}
			// END TEMPORARY SOLUTION
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			this.axisLineDataBounds.copyTo(output);
		}
		
		private initPrivateAxisLineBoundsVariables(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			// store data and screen coordinates of axis line into private Bounds2D variables
			this.axisLineDataBounds.copyTo(this._axisLineDataBounds);
			this._axisLineScreenBounds.copyFrom(this._axisLineDataBounds);
			dataBounds.projectCoordsTo(this._axisLineScreenBounds, screenBounds);
		}

		private _axisLineDataBounds:Bounds2D = new Bounds2D();
		private _axisLineScreenBounds:Bounds2D = new Bounds2D();
		private tempPoint:Point = new Point();
		private tempPoint2:Point = new Point();

		public getLabel(tickValue:number):string
		{
			var minValue:number = this.tickMinValue.value;
			var maxValue:number = this.tickMaxValue.value;
			if (isNaN(minValue))
				minValue = this.axisLineMinValue.value;
			if (isNaN(maxValue))
				maxValue = this.axisLineMaxValue.value;
			
			var result:string = null;
			// attempt to use label function
			if (this._labelFunction != null)
			{
				result = this._labelFunction(tickValue);
			}
			else if (tickValue == minValue || tickValue == maxValue)
			{
				if (tickValue == (tickValue)|0)
					this._numberFormatter.precision = -1;
				else
					this._numberFormatter.precision = 2;
				
				result = this._numberFormatter.format(tickValue);
			}
			else
			{
				result = this.labelNumberFormatter.format(tickValue);
			}
			
			try
			{
				if (this.labelFunction.value)
					result = this.labelFunction.apply(null, [tickValue, result, this.columnWatcher.target]);
			}
			catch (e)
			{
				result = '';
			}
			
			return result;
		}
		// TEMPORARY SOLUTION
		public setLabelFunction(func:Function, column:IAttributeColumn):void
		{
			this._labelFunction = func;
			this.columnWatcher.target = this.column;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		private _labelFunction:Function = null;
		private columnWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		// END TEMPORARY SOLUTION
		
		//////////////////////////////////////////////////////////////////////////////////////////////
		// backwards compatibility
		
		/*[Deprecated] public set axisLabelDistance(value:number):void { handleDeprecated('distance', value); }
		[Deprecated] public set labelDistanceIsVertical(value:boolean):void { handleDeprecated('isVertical', value); }
		private _deprecated:Object;
		private handleDeprecated(name:string, value:any):void
		{
			if (!_deprecated)
				_deprecated = {};
			_deprecated[name] = value;
			
			for each (name in ['distance', 'isVertical'])
				if (!_deprecated.hasOwnProperty(name))
					return;
			
			if (_deprecated['isVertical'])
				axisLabelVerticalDistance.value = _deprecated['distance'];
			else
				axisLabelHorizontalDistance.value = _deprecated['distance'];
			
			_deprecated = null;
		}*/
	}
}
