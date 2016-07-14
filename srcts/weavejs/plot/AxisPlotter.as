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
	import NumberFormatter = flash.text.TextFormatAlign;
	import flash.utils.getQualifiedClassName;
	
	import mx.formatters.NumberFormatter;
	
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
	
	public class AxisPlotter extends AbstractPlotter
	{
		public function AxisPlotter()
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
		public const axisLabelDistance:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-10));
		public const axisLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(-45));
		public const axisGridLineThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public const axisGridLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xDDDDDD));
		public const axisGridLineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));

		// the axis line beginning and end data coordinates
		public const axisLineDataBounds:LinkableBounds2D = Weave.linkableChild(this, LinkableBounds2D);
		// the value corresponding to the beginning of the axis line
		public const axisLineMinValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the end of the axis line
		public const axisLineMaxValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the beginning of the axis line.  If not specified, axisLineMinValue will be used.
		public const tickMinValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		// the value corresponding to the end of the axis line.  If not specified, axisLineMaxValue will be used.
		public const tickMaxValue:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		// show or hide the axis name
		public const showAxisName:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		// number of requested tick marks
		public const tickCountRequested:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10));
		// This option forces the axis to generate the exact number of requested tick marks between tick min and max values (inclusive)
		public const forceTickCount:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		public const axisTickLength:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10));
		public const axisTickThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		public const axisLineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public const axisLineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public const axisTickColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public const axisTickAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		public const axisLineThickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		// formatter to use when generating tick mark labels
		public const labelNumberFormatter:LinkableNumberFormatter = Weave.linkableChild(this, LinkableNumberFormatter);
		public const labelTextAlignment:LinkableString = Weave.linkableChild(this, LinkableString);
		public const labelHorizontalAlign:LinkableString = Weave.linkableChild(this, LinkableString);
		public const labelVerticalAlign:LinkableString = Weave.linkableChild(this, LinkableString);
		public const labelDistanceIsVertical:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

		private const _keySet:KeySet = Weave.linkableChild(this, KeySet); // stores tick mark keys
		private const _axisDescription:LooseAxisDescription = new LooseAxisDescription(); // calculates tick marks
		private const _bitmapText:BitmapText = new BitmapText(); // for drawing text
		private var _xDataTickDelta:Number; // x distance between ticks
		private var _yDataTickDelta:Number; // y distance between ticks
		private const KEY_TYPE:String = getQualifiedClassName(AxisPlotter);
		private const MIN_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(KEY_TYPE, 'minLabel');
		private const MAX_LABEL_KEY:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(KEY_TYPE, 'maxLabel');
		private const _numberFormatter:NumberFormatter = new NumberFormatter();
		
		public var showRealMinAndMax:Boolean = false;

		// validates tick mark variables		
		public function updateLabels():void
		{
			var cc:CallbackCollection;
			var callbackCollections:Array = [Weave.getCallbacks(this), spatialCallbacks];

			// make sure callbacks only run once
			for each (cc in callbackCollections)
				cc.delayCallbacks();
			
			var minValue:Number = tickMinValue.value;
			var maxValue:Number = tickMaxValue.value;
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
				var tickValue:Number = _axisDescription.tickMin + i * _axisDescription.tickDelta;
				if (axisLineMinValue.value <= tickValue && tickValue <= axisLineMaxValue.value)
					newKeys.push(WeaveAPI.QKeyManager.getQKey(KEY_TYPE, String(i)));
			}
			if(showRealMinAndMax)
				newKeys.push(MAX_LABEL_KEY);
			
			var keysChanged:Boolean = _keySet.replaceKeys(newKeys);
			
			// allow callbacks to run now
			for each (cc in callbackCollections)
				cc.resumeCallbacks();
		}
		
		/**
		 * @param recordKey The key associated with a tick mark
		 * @param outputPoint A place to store the data coordinates of the tick mark
		 * @return The value associated with the tick mark
		 */
		private function getTickValueAndDataCoords(recordKey:IQualifiedKey, outputPoint:Point):Number
		{
			var _axisLineMinValue:Number = axisLineMinValue.value;
			var _axisLineMaxValue:Number = axisLineMaxValue.value;
			axisLineDataBounds.copyTo(_tempBounds);

			var tickValue:Number;
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
		override public function getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Array):void
		{
			initBoundsArray(output);
			getTickValueAndDataCoords(recordKey, tempPoint);
			(output[0] as Bounds2D).includePoint(tempPoint);
		}
		
		// draws the tick marks
		override public function drawPlotAsyncIteration(task:IPlotTask):Number
		{
			drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private function drawAll(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
//			if (recordKeys.length == 0)
//				trace(this,'drawPlot',arguments);
			
			initPrivateAxisLineBoundsVariables(dataBounds, screenBounds);
			// everything below is in screen coordinates

			// get the angle of the axis line (relative to real screen coordinates, positive Y in downward direction)
			var axisAngle:Number = Math.atan2(_axisLineScreenBounds.getHeight(), _axisLineScreenBounds.getWidth());
			// ticks are perpendicular to axis line
			var tickAngle:Number = axisAngle + Math.PI / 2;
			// label angle is relative to axis angle
			var labelAngle:Number = axisAngle + axisLabelRelativeAngle.value * Math.PI / 180; // convert from degrees to radians

			// calculate tick line offset from angle
			var xTickOffset:Number = Math.cos(tickAngle) * axisTickLength.value / 2;
			var yTickOffset:Number = Math.sin(tickAngle) * axisTickLength.value / 2;
			
			// calculate label offset from angle
			var _labelDistance:Number = axisLabelDistance.value;
			var labelAngleOffset:Number = labelDistanceIsVertical.value ? Math.PI / 2: 0;
			var xLabelOffset:Number = Math.cos(labelAngle + labelAngleOffset) * axisLabelDistance.value;
			var yLabelOffset:Number = Math.sin(labelAngle + labelAngleOffset) * axisLabelDistance.value;
			
			setupBitmapText();
			_bitmapText.maxWidth = 80; // TEMPORARY SOLUTION (for word wrap)
			
			// calculate the distance between tick marks to use as _bitmapText.maxHeight
			var lineLength:Number = Math.sqrt(Math.pow(_axisLineScreenBounds.getWidth(), 2) + Math.pow(_axisLineScreenBounds.getHeight(), 2));
			var tickScreenDelta:Number = lineLength / (_axisDescription.numberOfTicks - 1);
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
				var tickValue:Number = getTickValueAndDataCoords(key, tempPoint);
								
				_axisLineDataBounds.projectPointTo(tempPoint, _axisLineScreenBounds);
				var xTick:Number = tempPoint.x;
				var yTick:Number = tempPoint.y;
				
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
				var labelFunctionResult:String = _labelFunction == null ? null : _labelFunction(tickValue);
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
		
		private var _titleBounds:Bounds2D = null;
		public function getTitleLabelBounds():Bounds2D
		{
			return _titleBounds;
		}
		
		public static const LABEL_POSITION_AT_AXIS_MIN:String  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MIN";
		public static const LABEL_POSITION_AT_AXIS_CENTER:String    = "AxisPlotter.LABEL_POSITION_AT_AXIS_CENTER";
		public static const LABEL_POSITION_AT_AXIS_MAX:String  		= "AxisPlotter.LABEL_POSITION_AT_AXIS_MAX";
		
		public static const LABEL_LEFT_JUSTIFIED:String 	= BitmapText.HORIZONTAL_ALIGN_LEFT;
		public static const LABEL_CENTERED:String 			= BitmapText.HORIZONTAL_ALIGN_CENTER;
		public static const LABEL_RIGHT_JUSTIFIED:String 	= BitmapText.HORIZONTAL_ALIGN_RIGHT;
		
		// BEGIN TEMPORARY SOLUTION
		public function setSideAxisName(name:String, angle:Number, xDistance:Number, yDistance:Number, verticalAlign:String, 
									    labelPosition:String = LABEL_POSITION_AT_AXIS_CENTER, labelAlignment:String = null,
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
		private var _axisName:String;
		private var _axisNameAngle:Number;
		private var _axisNameXDistance:Number;
		private var _axisNameYDistance:Number;
		private var _axisNameVerticalAlign:String;
		private var _labelPosition:String;
		private var _labelAlignment:String;
		private var _maxLabelWidth:int;
		// END TEMPORARY SOLUTION
		
		// draws the axis line
		override public function drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
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
		
		private const _tempBounds:Bounds2D = new Bounds2D();
		
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
		
//		public function getAxisNameScreenBounds(dataBounds:Bounds2D, screenBounds:Bounds2D,outputScreenBounds:Bounds2D):void
//		{
//			setupAxisNameBitmapText(dataBounds,screenBounds);
//			// this does not work when text is vertical
//			_bitmapText.getUnrotatedBounds(outputScreenBounds);
//		}
		
		// gets the bounds of the axis line
		override public function getBackgroundDataBounds(output:Bounds2D):void
		{
			axisLineDataBounds.copyTo(output);
		}
		
		private function initPrivateAxisLineBoundsVariables(dataBounds:Bounds2D, screenBounds:Bounds2D):void
		{
			// get axis line data bounds and project to screen coordinates
			axisLineDataBounds.copyTo(_axisLineDataBounds);
			// project to screen coords
			_axisLineScreenBounds.copyFrom(_axisLineDataBounds);
			dataBounds.projectCoordsTo(_axisLineScreenBounds, screenBounds);
		}

		private const _axisLineDataBounds:Bounds2D = new Bounds2D();
		private const _axisLineScreenBounds:Bounds2D = new Bounds2D();
		private const tempPoint:Point = new Point();
		private const tempPoint2:Point = new Point();

		// TEMPORARY SOLUTION
		public function setLabelFunction(func:Function):void
		{
			_labelFunction = func;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		private var _labelFunction:Function = null;
		// END TEMPORARY SOLUTION
	}
}
