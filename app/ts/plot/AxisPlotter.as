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

	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import StandardLib = weavejs.util.StandardLib;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import KeySet = weavejs.data.key.KeySet;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableBounds2D = weavejs.geom.LinkableBounds2D;
	import LooseAxisDescription = weavejs.plot.LooseAxisDescription;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	export class AxisPlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.spatialCallbacks.addImmediateCallback(this, this.updateLabels);

			// set defaults so something will show if these values are not set
			this.axisLineDataBounds.setBounds(-1, -1, 1, 1);
			this.axisLineMinValue.value = -1;
			this.axisLineMaxValue.value = 1;
			
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
		
		//TODO: put this huge list of properties into a separate object instead
		public axisLabelDistance:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-10));
		public axisLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-45));
		public axisGridLineThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public axisGridLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xDDDDDD));
		public axisGridLineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));

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
		
		// show or hide the axis name
		public showAxisName:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		// number of requested tick marks
		public tickCountRequested:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10));
		// This option forces the axis to generate the exact number of requested tick marks between tick min and max values (inclusive)
		public forceTickCount:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		public axisTickLength:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10));
		public axisTickThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		public axisLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public axisLineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public axisTickColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public axisTickAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public axisLineThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		// formatter to use when generating tick mark labels
		public labelNumberFormatter:LinkableNumberFormatter = Weave.linkableChild(this, LinkableNumberFormatter);
		public labelTextAlignment:LinkableString = Weave.linkableChild(this, LinkableString);
		public labelHorizontalAlign:LinkableString = Weave.linkableChild(this, LinkableString);
		public labelVerticalAlign:LinkableString = Weave.linkableChild(this, LinkableString);
		public labelDistanceIsVertical:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

		private _keySet:KeySet = Weave.linkableChild(this, KeySet); // stores tick mark keys
		private _axisDescription:LooseAxisDescription = new LooseAxisDescription(); // calculates tick marks
		private _bitmapText:BitmapText = new BitmapText(); // for drawing text
		private _xDataTickDelta:number; // x distance between ticks
		private _yDataTickDelta:number; // y distance between ticks
		private KEY_TYPE:string = Weave.className(AxisPlotter);
		private MIN_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(this.KEY_TYPE, 'minLabel');
		private MAX_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(this.KEY_TYPE, 'maxLabel');
		private _numberFormatter:NumberFormatter = new NumberFormatter();
		
		public showRealMinAndMax:boolean = false;

		// validates tick mark variables		
		public updateLabels():void
		{
			var callbackCollections:ICallbackCollection[] = [Weave.getCallbacks(this), this.spatialCallbacks];

			// make sure callbacks only run once
			for (let cc of callbackCollections)
				cc.delayCallbacks();
			
			var minValue:number = this.tickMinValue.value;
			var maxValue:number = this.tickMaxValue.value;
			if (isNaN(minValue))
				minValue = this.axisLineMinValue.value;
			if (isNaN(maxValue))
				maxValue = this.axisLineMaxValue.value;
				
			this._axisDescription.setup(minValue, maxValue, this.tickCountRequested.value, this.forceTickCount.value);
			
			
			this.labelNumberFormatter.precision.value = this._axisDescription.numberOfDigits;
			
			var newKeys:IQualifiedKey[] = this.showRealMinAndMax ? [this.MIN_LABEL_KEY] : [];
			for (var i:int = 0; i < this._axisDescription.numberOfTicks; i++)
			{
				// only include tick marks that are between min,max values
				var tickValue:number = this._axisDescription.tickMin + i * this._axisDescription.tickDelta;
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
				var tickIndex:int = parseInt(recordKey.localName);
				tickValue = this._axisDescription.tickMin + tickIndex * this._axisDescription.tickDelta;
				outputPoint.x = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, this._tempBounds.xMin, this._tempBounds.xMax);
				outputPoint.y = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, this._tempBounds.yMin, this._tempBounds.yMax);
			}
			
			return tickValue;
		}
		
		// gets the bounds of a tick mark
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			this.getTickValueAndDataCoords(recordKey, this.tempPoint);
			output[0].includePoint(this.tempPoint);
		}
		
		// draws the tick marks
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			this.drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
//			if (recordKeys.length == 0)
//				trace(this,'drawPlot',arguments);
			
			this.initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);
			// everything below is in screen coordinates

			// get the angle of the axis line (relative to real screen coordinates, positive Y in downward direction)
			var axisAngle:number = Math.atan2(this._axisLineScreenBounds.getHeight(), this._axisLineScreenBounds.getWidth());
			// ticks are perpendicular to axis line
			var tickAngle:number = axisAngle + Math.PI / 2;
			// label angle is relative to axis angle
			var labelAngle:number = axisAngle + this.axisLabelRelativeAngle.value * Math.PI / 180; // convert from degrees to radians

			// calculate tick line offset from angle
			var xTickOffset:number = Math.cos(tickAngle) * this.axisTickLength.value / 2;
			var yTickOffset:number = Math.sin(tickAngle) * this.axisTickLength.value / 2;
			
			// calculate label offset from angle
			var _labelDistance:number = this.axisLabelDistance.value;
			var labelAngleOffset:number = this.labelDistanceIsVertical.value ? Math.PI / 2: 0;
			var xLabelOffset:number = Math.cos(labelAngle + labelAngleOffset) * this.axisLabelDistance.value;
			var yLabelOffset:number = Math.sin(labelAngle + labelAngleOffset) * this.axisLabelDistance.value;
			
			this.setupBitmapText();
			this._bitmapText.maxWidth = 80; // TEMPORARY SOLUTION (for word wrap)
			
			// calculate the distance between tick marks to use as _bitmapText.maxHeight
			var lineLength:number = Math.sqrt(Math.pow(this._axisLineScreenBounds.getWidth(), 2) + Math.pow(this._axisLineScreenBounds.getHeight(), 2));
			var tickScreenDelta:number = lineLength / (this._axisDescription.numberOfTicks - 1);
			tickScreenDelta /= Math.SQRT2; // TEMPORARY SOLUTION -- assumes text is always at 45 degree angle
			this._bitmapText.maxHeight = tickScreenDelta;

			this._bitmapText.angle = labelAngle * 180 / Math.PI; // convert from radians to degrees
			
			// init number formatter for beginning & end tick marks
			this.labelNumberFormatter.copyTo(this._numberFormatter);
			
			for (var i:int = 0; i < recordKeys.length; i++)
			{
				var key:IQualifiedKey = recordKeys[i];

				// get screen coordinates of tick mark
				var tickValue:number = this.getTickValueAndDataCoords(key, this.tempPoint);
								
				this._axisLineDataBounds.projectPointTo(this.tempPoint, this._axisLineScreenBounds);
				var xTick:number = this.tempPoint.x;
				var yTick:number = this.tempPoint.y;
				
				// draw tick mark line
				graphics.lineStyle(this.axisTickThickness.value, this.axisTickColor.value, this.axisTickAlpha.value);
				
				if ( key == this.MIN_LABEL_KEY || key == this.MAX_LABEL_KEY )
				{
					graphics.moveTo(xTick - xTickOffset*2, yTick - yTickOffset*2);
					graphics.lineTo(xTick + xTickOffset*2, yTick + yTickOffset*2);
				}
				else
				{
					graphics.moveTo(xTick - xTickOffset, yTick - yTickOffset);
					graphics.lineTo(xTick + xTickOffset, yTick + yTickOffset);
				}

				// draw tick mark label
				this._bitmapText.text = null;
				// attempt to use label function
				var labelFunctionResult:string = this._labelFunction == null ? null : this._labelFunction(tickValue);
				if (this._labelFunction != null && labelFunctionResult != null)
				{
					this._bitmapText.text = labelFunctionResult;
				}
				else if (key == this.MIN_LABEL_KEY || key == this.MAX_LABEL_KEY )
				{
					if (tickValue == (tickValue | 0))
						this._numberFormatter.precision = -1;
					else
						this._numberFormatter.precision = 2;
					
					this._bitmapText.text = this._numberFormatter.format(tickValue);
				}
				else
				{
					this._bitmapText.text = this.labelNumberFormatter.format(tickValue);
				}
				

				this._bitmapText.x = xTick + xLabelOffset;
				this._bitmapText.y = yTick + yLabelOffset;
				this._bitmapText.draw(graphics);
			}
		}
		
		private _titleBounds:Bounds2D = null;
		public getTitleLabelBounds():Bounds2D
		{
			return this._titleBounds;
		}
		
		public static LABEL_POSITION_AT_AXIS_MIN:string  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MIN";
		public static LABEL_POSITION_AT_AXIS_CENTER:string    = "AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER";
		public static LABEL_POSITION_AT_AXIS_MAX:string  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MAX";
		
		public static LABEL_LEFT_JUSTIFIED:string 	= BitmapText.HORIZONTAL_ALIGN_LEFT;
		public static LABEL_CENTERED:string 			= BitmapText.HORIZONTAL_ALIGN_CENTER;
		public static LABEL_RIGHT_JUSTIFIED:string 	= BitmapText.HORIZONTAL_ALIGN_RIGHT;
		
		// BEGIN TEMPORARY SOLUTION
		public setSideAxisName(name:string, angle:number, xDistance:number, yDistance:number, verticalAlign:string,
									    labelPosition:string = AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER, labelAlignment:string = null,
									    maxLabelWidth:int = -1):void
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
		private _axisName:string;
		private _axisNameAngle:number;
		private _axisNameXDistance:number;
		private _axisNameYDistance:number;
		private _axisNameVerticalAlign:string;
		private _labelPosition:string;
		private _labelAlignment:string;
		private _maxLabelWidth:int;
		// END TEMPORARY SOLUTION
		
		// draws the axis line
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			this.setupAxisNameBitmapText(dataBounds,screenBounds);
			
			// draw the axis line
			graphics.lineStyle(this.axisLineThickness.value, this.axisLineColor.value, this.axisLineAlpha.value);
			graphics.moveTo(this._axisLineScreenBounds.xMin, this._axisLineScreenBounds.yMin);
			graphics.lineTo(this._axisLineScreenBounds.xMax, this._axisLineScreenBounds.yMax);
			if (this.showAxisName.value && this._axisName != null)
			{
//				getAxisNameScreenBounds(dataBounds,screenBounds,_tempBounds);
//				destination.fillRect(new Rectangle(_tempBounds.xMin,_tempBounds.yMin,_tempBounds.width,_tempBounds.height),0x80FF0000);
				this._bitmapText.draw(graphics);
			}
		}
		
		private _tempBounds:Bounds2D = new Bounds2D();
		
		protected setupBitmapText():void
		{
			LinkableTextFormat.defaultTextFormat.copyTo(this._bitmapText.textFormat);
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
			if (this._axisName != null)
			{
				this.setupBitmapText();
				this._bitmapText.text = this._axisName;
				this._bitmapText.angle = this._axisNameAngle;
				this._bitmapText.textFormat.align = TextFormatAlign.LEFT;
				this._bitmapText.verticalAlign = this._axisNameAngle == 0 ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP;
				this._bitmapText.maxWidth = this._axisNameAngle == 0 ? screenBounds.getXCoverage() : screenBounds.getYCoverage();
				this._bitmapText.maxHeight = 40; // temporary solution
				
				if (this._maxLabelWidth != -1)
					this._bitmapText.maxWidth = this._maxLabelWidth;
				
				if (this._labelPosition == AxisPlotter.LABEL_POSITION_AT_AXIS_MIN)
				{
					this._bitmapText.x = this._axisLineScreenBounds.xMin + this._axisNameXDistance;
					this._bitmapText.y = this._axisLineScreenBounds.yMin + this._axisNameYDistance;
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				}
				if (this._labelPosition == AxisPlotter.LABEL_POSITION_AT_AXIS_MAX)
				{
					this._bitmapText.x = this._axisLineScreenBounds.xMax + this._axisNameXDistance;
					this._bitmapText.y = this._axisLineScreenBounds.yMax + this._axisNameYDistance;
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
				}
				if (this._labelPosition == AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER)
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
		
//		public getAxisNameScreenBounds(dataBounds:Bounds2D, screenBounds:Bounds2D,outputScreenBounds:Bounds2D):void
//		{
//			setupAxisNameBitmapText(dataBounds,screenBounds);
//			// this does not work when text is vertical
//			_bitmapText.getUnrotatedBounds(outputScreenBounds);
//		}
		
		// gets the bounds of the axis line
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			this.axisLineDataBounds.copyTo(output);
		}
		
		private initPrivateAxisLineBoundsVariables(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			// get axis line data bounds and project to screen coordinates
			this.axisLineDataBounds.copyTo(this._axisLineDataBounds);
			// project to screen coords
			this._axisLineScreenBounds.copyFrom(this._axisLineDataBounds);
			dataBounds.projectCoordsTo(this._axisLineScreenBounds, screenBounds);
		}

		private _axisLineDataBounds:Bounds2D = new Bounds2D();
		private _axisLineScreenBounds:Bounds2D = new Bounds2D();
		private tempPoint:Point = new Point();
		private tempPoint2:Point = new Point();

		// TEMPORARY SOLUTION
		public setLabelFunction(func:Function):void
		{
			this._labelFunction = func;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		private _labelFunction:Function = null;
		// END TEMPORARY SOLUTION
	}
}

