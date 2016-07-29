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
	import Shape = flash.display.Shape;
	import Point = weavejs.geom.Point;
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import EquationColumn = weavejs.data.column.EquationColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import SortedColumn = weavejs.data.column.SortedColumn;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class PieChartPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			fill.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			
			_beginRadians = Weave.linkableChild(this, EquationColumn);
			_beginRadians.equation.value = "0.5 * PI + getRunningTotal(spanRadians) - getNumber(spanRadians)";
			_spanRadians = _beginRadians.requestVariable("spanRadians", EquationColumn, true);
			_spanRadians.equation.value = "getNumber(sortedData) / getSum(sortedData) * 2 * PI";
			var sortedData:SortedColumn = _spanRadians.requestVariable("sortedData", SortedColumn, true);
			_filteredData = sortedData.internalDynamicColumn.requestLocalObject(FilteredColumn, true);
			Weave.linkState(filteredKeySet.keyFilter, _filteredData.filter);
			
			setColumnKeySources([_filteredData]);
			
			Weave.linkableChild(this, this.data);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			
			this.addSpatialDependencies(this._beginRadians, this.data); 
		}
		
		public getSelectableAttributeNames():Array
		{
			return ["Wedge Size","Wedge Color","Label"];
		}
		public getSelectableAttributes():Array
		{
			return [data, fill.color, label];
		}

		private _beginRadians:EquationColumn;
		private _spanRadians:EquationColumn;
		private _filteredData:FilteredColumn;
		
		public get data():DynamicColumn { return _filteredData.internalDynamicColumn; }
		public label:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		
		public labelAngleRatio:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, verifyLabelAngleRatio));
		public innerRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, verifyInnerRadius));
		
		private verifyLabelAngleRatio(value:number):boolean
		{
			return 0 <= value && value <= 1;
		}
		private verifyInnerRadius(value:number):boolean
		{
			return 0 <= value && value <= 1;
		}
		
		private _destination:BitmapData;
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			_destination = task.buffer;
			return super.drawPlotAsyncIteration(task);
		}
		
		/*override*/ protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
		{
			// project data coordinates to screen coordinates and draw graphics
			var beginRadians:number = _beginRadians.getValueFromKey(recordKey, Number);
			var spanRadians:number = _spanRadians.getValueFromKey(recordKey, Number);
			
			var graphics:Graphics = tempShape.graphics;
			// begin line & fill
			line.beginLineStyle(recordKey, graphics);				
			fill.beginFillStyle(recordKey, graphics);
			// move to center point
			WedgePlotter.drawProjectedWedge(graphics, dataBounds, screenBounds, beginRadians, spanRadians, 0, 0, 1, innerRadius.value);
			// end fill
			graphics.endFill();
			
			//----------------------
			
			// draw label
			var midRadians:number;
			if (!label.containsKey(recordKey as IQualifiedKey))
				return;
			beginRadians = _beginRadians.getValueFromKey(recordKey, Number) as Number;
			spanRadians = _spanRadians.getValueFromKey(recordKey, Number) as Number;
			midRadians = beginRadians + (spanRadians / 2);
			
			var cos:number = Math.cos(midRadians);
			var sin:number = Math.sin(midRadians);
			
			_tempPoint.x = cos;
			_tempPoint.y = sin;
			dataBounds.projectPointTo(_tempPoint, screenBounds);
			_tempPoint.x += cos * 10 * screenBounds.getXDirection();
			_tempPoint.y += sin * 10 * screenBounds.getYDirection();
			
			_bitmapText.text = label.getValueFromKey(recordKey, String);
			
			_bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
			
			_bitmapText.angle = screenBounds.getYDirection() * (midRadians * 180 / Math.PI);
			_bitmapText.angle = (_bitmapText.angle % 360 + 360) % 360;
			if (cos > -0.000001) // the label exactly at the bottom will have left align
			{
				_bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				// first get values between -90 and 90, then multiply by the ratio
				_bitmapText.angle = ((_bitmapText.angle + 90) % 360 - 90) * labelAngleRatio.value;
			}
			else
			{
				_bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
				// first get values between -90 and 90, then multiply by the ratio
				_bitmapText.angle = (_bitmapText.angle - 180) * labelAngleRatio.value;
			}
			LinkableTextFormat.defaultTextFormat.copyTo(_bitmapText.textFormat);
			_bitmapText.x = _tempPoint.x;
			_bitmapText.y = _tempPoint.y;
			_bitmapText.draw(_destination);
		}
		
		private _tempPoint:Point = new Point();
		private _bitmapText:BitmapText = new BitmapText();
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var beginRadians:number = _beginRadians.getValueFromKey(recordKey, Number);
			var spanRadians:number = _spanRadians.getValueFromKey(recordKey, Number);
			var bounds:Bounds2D = initBoundsArray(output, 1);
			WedgePlotter.getWedgeBounds(bounds, beginRadians, spanRadians);
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param outputDataBounds A Bounds2D object to store the result in.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(-1, -1, 1, 1);
		}
		
		// backwards compatibility
		//[Deprecated(replacement="line")] public set lineStyle(value:Object):void { try { Weave.setState(line, value[0].sessionState); } catch (e:Error) { } }
		//[Deprecated(replacement="fill")] public set fillStyle(value:Object):void { try { Weave.setState(fill, value[0].sessionState); } catch (e:Error) { } }
	}
}
