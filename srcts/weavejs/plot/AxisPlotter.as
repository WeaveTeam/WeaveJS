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
	import Graphics = PIXI.Graphics;
	import Point = weavejs.geom.Point;
	import TextFormatAlign = flash.text.TextFormatAlign;

	import NumberFormatter = mx.formatters.NumberFormatter;
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import StandardLib = weavejs.util.StandardLib;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import KeySet = weavejs.data.key.KeySet;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableBounds2D = weavejs.primitives.LinkableBounds2D;
	import LinkableNumberFormatter = weavejs.primitives.LinkableNumberFormatter;
	import LooseAxisDescription = weavejs.primitives.LooseAxisDescription;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	
	export class AxisPlotter extends AbstractPlotter
	{
		public constructor()
		{
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			spatialCallbacks.addImmediateCallback(this, updateLabels);

			// set defaults so something will show if these values are not set
			axisLineDataBounds.setBounds(-1, -1, 1, 1);
			axisLineMinValue.value = -1;
			axisLineMaxValue.value = 1;
			
			setSingleKeySource(_keySet);
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
		private MIN_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(KEY_TYPE, 'minLabel');
		private MAX_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(KEY_TYPE, 'maxLabel');
		private _numberFormatter:NumberFormatter = new NumberFormatter();
		
		public showRealMinAndMax:boolean = false;

		// validates tick mark variables		
		public updateLabels():void
		{
			var cc:CallbackCollection;
			var callbackCollections:Array = [Weave.getCallbacks(this), spatialCallbacks];

			// make sure callbacks only run once
			for each (cc in callbackCollections)
				cc.delayCallbacks();
			
			var minValue:number = tickMinValue.value;
			var maxValue:number = tickMaxValue.value;
			if (isNaN(minValue))
				minValue = axisLineMinValue.value;
			if (isNaN(maxValue))
				maxValue = axisLineMaxValue.value;
				
			_axisDescription.setup(minValue, maxValue, tickCountRequested.value, forceTickCount.value);
			
			
			labelNumberFormatter.precision.value = _axisDescription.numberOfDigits;
			
			var newKeys:Array = showRealMinAndMax ? [MIN_LABEL_KEY] : [];
			for (var i:int = 0; i < _axisDescription.numberOfTicks; i++)
			{
				// only include tick marks that are between min,max values
				var tickValue:number = _axisDescription.tickMin + i * _axisDescription.tickDelta;
				if (axisLineMinValue.value <= tickValue && tickValue <= axisLineMaxValue.value)
					newKeys.push(WeaveAPI.QKeyManager.getQKey(KEY_TYPE, String(i)));
			}
			if(showRealMinAndMax)
				newKeys.push(MAX_LABEL_KEY);
			
			var keysChanged:boolean = _keySet.replaceKeys(newKeys);
			
			// allow callbacks to run now
			for each (cc in callbackCollections)
				cc.resumeCallbacks();
		}
		
		/**
		 * @param recordKey The key associated with a tick mark
		 * @param outputPoint A place to store the data coordinates of the tick mark
		 * @return The value associated with the tick mark
		 */
		private getTickValueAndDataCoords(recordKey:IQualifiedKey, outputPoint:Point):number
		{
			var _axisLineMinValue:number = axisLineMinValue.value;
			var _axisLineMaxValue:number = axisLineMaxValue.value;
			axisLineDataBounds.copyTo(_tempBounds);

			var tickValue:number;
			// special case for min,max labels
			if (recordKey == MIN_LABEL_KEY)
			{
				tickValue = _axisLineMinValue;
				outputPoint.x = _tempBounds.xMin;
				outputPoint.y = _tempBounds.yMin;
			}
			else if (recordKey == MAX_LABEL_KEY)
			{
				tickValue = _axisLineMaxValue;
				outputPoint.x = _tempBounds.xMax;
				outputPoint.y = _tempBounds.yMax;
			}
			else
			{
				var tickIndex:int = parseInt(recordKey.localName);
				tickValue = _axisDescription.tickMin + tickIndex * _axisDescription.tickDelta;
				outputPoint.x = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, _tempBounds.xMin, _tempBounds.xMax);
				outputPoint.y = StandardLib.scale(tickValue, _axisLineMinValue, _axisLineMaxValue, _tempBounds.yMin, _tempBounds.yMax);
			}
			
			return tickValue;
		}
		
		// gets the bounds of a tick mark
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			initBoundsArray(output);
			getTickValueAndDataCoords(recordKey, tempPoint);
			(output[0] as Bounds2D).includePoint(tempPoint);
		}
		
		// draws the tick marks
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
//			if (recordKeys.length == 0)
//				trace(this,'drawPlot',arguments);
			
			initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);
			// everything below is in screen coordinates

			// get the angle of the axis line (relative to real screen coordinates, positive Y in downward direction)
			var axisAngle:number = Math.atan2(_axisLineScreenBounds.getHeight(), _axisLineScreenBounds.getWidth());
			// ticks are perpendicular to axis line
			var tickAngle:number = axisAngle + Math.PI / 2;
			// label angle is relative to axis angle
			var labelAngle:number = axisAngle + axisLabelRelativeAngle.value * Math.PI / 180; // convert from degrees to radians

			// calculate tick line offset from angle
			var xTickOffset:number = Math.cos(tickAngle) * axisTickLength.value / 2;
			var yTickOffset:number = Math.sin(tickAngle) * axisTickLength.value / 2;
			
			// calculate label offset from angle
			var _labelDistance:number = axisLabelDistance.value;
			var labelAngleOffset:number = labelDistanceIsVertical.value ? Math.PI / 2: 0;
			var xLabelOffset:number = Math.cos(labelAngle + labelAngleOffset) * axisLabelDistance.value;
			var yLabelOffset:number = Math.sin(labelAngle + labelAngleOffset) * axisLabelDistance.value;
			
			setupBitmapText();
			_bitmapText.maxWidth = 80; // TEMPORARY SOLUTION (for word wrap)
			
			// calculate the distance between tick marks to use as _bitmapText.maxHeight
			var lineLength:number = Math.sqrt(Math.pow(_axisLineScreenBounds.getWidth(), 2) + Math.pow(_axisLineScreenBounds.getHeight(), 2));
			var tickScreenDelta:number = lineLength / (_axisDescription.numberOfTicks - 1);
			tickScreenDelta /= Math.SQRT2; // TEMPORARY SOLUTION -- assumes text is always at 45 degree angle
			_bitmapText.maxHeight = tickScreenDelta;

			_bitmapText.angle = labelAngle * 180 / Math.PI; // convert from radians to degrees
			
			// init number formatter for beginning & end tick marks
			labelNumberFormatter.copyTo(_numberFormatter);
			
			var graphics:Graphics = tempShape.graphics;
			for (var i:int = 0; i < recordKeys.length; i++)
			{
				var key:IQualifiedKey = recordKeys[i] as IQualifiedKey;

				// get screen coordinates of tick mark
				var tickValue:number = getTickValueAndDataCoords(key, tempPoint);
								
				_axisLineDataBounds.projectPointTo(tempPoint, _axisLineScreenBounds);
				var xTick:number = tempPoint.x;
				var yTick:number = tempPoint.y;
				
				// draw tick mark line
				graphics.clear();
				graphics.lineStyle(axisTickThickness.value, axisTickColor.value, axisTickAlpha.value);
				
				if ( key == MIN_LABEL_KEY || key == MAX_LABEL_KEY )
				{
					graphics.moveTo(xTick - xTickOffset*2, yTick - yTickOffset*2);
					graphics.lineTo(xTick + xTickOffset*2, yTick + yTickOffset*2);
				}
				else
				{
					graphics.moveTo(xTick - xTickOffset, yTick - yTickOffset);
					graphics.lineTo(xTick + xTickOffset, yTick + yTickOffset);
				}
				destination.draw(tempShape);
				
				// draw tick mark label
				_bitmapText.text = null;
				// attempt to use label function
				var labelFunctionResult:string = _labelFunction == null ? null : _labelFunction(tickValue);
				if (_labelFunction != null && labelFunctionResult != null)
				{
					_bitmapText.text = labelFunctionResult;
				}
				else if (key == MIN_LABEL_KEY || key == MAX_LABEL_KEY )
				{
					if (tickValue == int(tickValue))
						_numberFormatter.precision = -1;
					else
						_numberFormatter.precision = 2;
					
					_bitmapText.text = _numberFormatter.format(tickValue);
				}
				else
				{
					_bitmapText.text = labelNumberFormatter.format(tickValue);
				}
				

				_bitmapText.x = xTick + xLabelOffset;
				_bitmapText.y = yTick + yLabelOffset;
				_bitmapText.draw(destination);
			}
		}
		
		private _titleBounds:Bounds2D = null;
		public getTitleLabelBounds():Bounds2D
		{
			return _titleBounds;
		}
		
		public static LABEL_POSITION_AT_AXIS_MIN:string  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MIN";
		public static LABEL_POSITION_AT_AXIS_CENTER:string    = "AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER";
		public static LABEL_POSITION_AT_AXIS_MAX:string  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MAX";
		
		public static LABEL_LEFT_JUSTIFIED:string 	= BitmapText.HORIZONTAL_ALIGN_LEFT;
		public static LABEL_CENTERED:string 			= BitmapText.HORIZONTAL_ALIGN_CENTER;
		public static LABEL_RIGHT_JUSTIFIED:string 	= BitmapText.HORIZONTAL_ALIGN_RIGHT;
		
		// BEGIN TEMPORARY SOLUTION
		public setSideAxisName(name:string, angle:number, xDistance:number, yDistance:number, verticalAlign:string,
									    labelPosition:string = LABEL_POSITION_AT_AXIS_CENTER, labelAlignment:string = null,
									    maxLabelWidth:int = -1):void
		{
			_axisName = name;
			_axisNameAngle = angle;
			_axisNameXDistance = xDistance;
			_axisNameYDistance = yDistance;
			_axisNameVerticalAlign = verticalAlign;
			_labelPosition = labelPosition;
			_labelAlignment = labelAlignment;
			_maxLabelWidth = maxLabelWidth;
			
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
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			setupAxisNameBitmapText(dataBounds,screenBounds);
			
			// draw the axis line
			var graphics:Graphics = tempShape.graphics;
			graphics.clear();
			graphics.lineStyle(axisLineThickness.value, axisLineColor.value, axisLineAlpha.value);
			graphics.moveTo(_axisLineScreenBounds.xMin, _axisLineScreenBounds.yMin);
			graphics.lineTo(_axisLineScreenBounds.xMax, _axisLineScreenBounds.yMax);
			destination.draw(tempShape);
			if (showAxisName.value && _axisName != null)
			{
//				getAxisNameScreenBounds(dataBounds,screenBounds,_tempBounds);
//				destination.fillRect(new Rectangle(_tempBounds.xMin,_tempBounds.yMin,_tempBounds.width,_tempBounds.height),0x80FF0000);
				_bitmapText.draw(destination);
			}
		}
		
		private _tempBounds:Bounds2D = new Bounds2D();
		
		protected function setupBitmapText():void
		{
			LinkableTextFormat.defaultTextFormat.copyTo(_bitmapText.textFormat);
			try {
				_bitmapText.textFormat.align = labelTextAlignment.value;
			} catch (e:Error) { }
			
			_bitmapText.horizontalAlign = labelHorizontalAlign.value;
			_bitmapText.verticalAlign = labelVerticalAlign.value;
		}
		
		protected function setupAxisNameBitmapText(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);

			//trace(dataBounds, screenBounds);

			// BEGIN TEMPORARY SOLUTION -- setup BitmapText for axis name
			if (_axisName != null)
			{
				setupBitmapText();
				_bitmapText.text = _axisName;
				_bitmapText.angle = _axisNameAngle;
				_bitmapText.textFormat.align = TextFormatAlign.LEFT;
				_bitmapText.verticalAlign = _axisNameAngle == 0 ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP;
				_bitmapText.maxWidth = _axisNameAngle == 0 ? screenBounds.getXCoverage() : screenBounds.getYCoverage();
				_bitmapText.maxHeight = 40; // temporary solution
				
				if(_maxLabelWidth != -1)
					_bitmapText.maxWidth = _maxLabelWidth;
				
				if(_labelPosition == LABEL_POSITION_AT_AXIS_MIN)
				{
					_bitmapText.x = _axisLineScreenBounds.xMin + _axisNameXDistance;
					_bitmapText.y = _axisLineScreenBounds.yMin + _axisNameYDistance;
					_bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				}
				if(_labelPosition == LABEL_POSITION_AT_AXIS_MAX)
				{
					_bitmapText.x = _axisLineScreenBounds.xMax + _axisNameXDistance;
					_bitmapText.y = _axisLineScreenBounds.yMax + _axisNameYDistance;
					_bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
				}
				if(_labelPosition == LABEL_POSITION_AT_AXIS_CENTER)
				{
					_bitmapText.x = _axisLineScreenBounds.getXCenter() + _axisNameXDistance;
					_bitmapText.y = _axisLineScreenBounds.getYCenter() + _axisNameYDistance;
					_bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
				}
				
				if(_labelAlignment)
					_bitmapText.horizontalAlign = _labelAlignment;

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
			axisLineDataBounds.copyTo(output);
		}
		
		private initPrivateAxisLineBoundsVariables(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			// get axis line data bounds and project to screen coordinates
			axisLineDataBounds.copyTo(_axisLineDataBounds);
			// project to screen coords
			_axisLineScreenBounds.copyFrom(_axisLineDataBounds);
			dataBounds.projectCoordsTo(_axisLineScreenBounds, screenBounds);
		}

		private _axisLineDataBounds:Bounds2D = new Bounds2D();
		private _axisLineScreenBounds:Bounds2D = new Bounds2D();
		private tempPoint:Point = new Point();
		private tempPoint2:Point = new Point();

		// TEMPORARY SOLUTION
		public setLabelFunction(func:Function):void
		{
			_labelFunction = func;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		private _labelFunction:Function = null;
		// END TEMPORARY SOLUTION
	}
}
