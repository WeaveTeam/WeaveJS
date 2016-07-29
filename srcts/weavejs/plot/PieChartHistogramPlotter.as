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

	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import EquationColumn = weavejs.data.column.EquationColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import StringLookupColumn = weavejs.data.column.StringLookupColumn;
	import ColorRamp = weavejs.util.ColorRamp;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	export class PieChartHistogramPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			this._beginRadians = Weave.linkableChild(this, EquationColumn);
			this._beginRadians.equation.value = "0.5 * PI + getRunningTotal(spanRadians) - getNumber(spanRadians)";
			this._spanRadians = this._beginRadians.requestVariable("spanRadians", EquationColumn, true);
			this._spanRadians.equation.value = "getNumber(binSize) / getSum(binSize) * 2 * PI";
			var binSize:EquationColumn = this._spanRadians.requestVariable("binSize", EquationColumn, true);
			binSize.equation.value = "getValue(binLookup).length";
			this._binLookup = binSize.requestVariable("binLookup", StringLookupColumn, true);
			this._binLookupStats = WeaveAPI.StatisticsCache.getColumnStatistics(this._binLookup);
			this._binnedData = this._binLookup.requestLocalObject(BinnedColumn, true);
			this._filteredData = this.binnedData.internalDynamicColumn.requestLocalObject(FilteredColumn, true);
			Weave.linkState(this.filteredKeySet.keyFilter, this._filteredData.filter);
			Weave.linkableChild(this, this._binnedData);
			this.setSingleKeySource(this._filteredData);
			
			var ecArray:Array = [this._beginRadians, this._spanRadians, binSize];
			var nameArray:Array = ["beginRadians", "spanRadians", "binSize"];
			while (ecArray.length)
			{
				var metadata:Object = {};
				metadata[ColumnMetadata.TITLE] = nameArray.pop();
				(ecArray.pop() as EquationColumn).metadata.value = metadata;
			}
			
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			
			this.addSpatialDependencies(this._beginRadians);
		}
		
		public getSelectableAttributeNames()
		{
			return ["Data"];
		}
		public getSelectableAttributes()
		{
			return [this.unfilteredData];
		}
		
		public _beginRadians:EquationColumn;
		public _spanRadians:EquationColumn;
		public _binLookup:StringLookupColumn;
		public _binLookupStats:IColumnStatistics;
		public _binnedData:BinnedColumn;
		public _filteredData:FilteredColumn;
		
		public chartColors:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired"))); // bars get their color from here
		
		public get binnedData():BinnedColumn { return this._binnedData; }
		
		public get unfilteredData():DynamicColumn { return this._filteredData.internalDynamicColumn; }
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public labelAngleRatio:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, this.verifyLabelAngleRatio));
		public innerRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, this.verifyInnerRadius));
		
		private verifyLabelAngleRatio(value:number):boolean
		{
			return 0 <= value && value <= 1;
		}
		private verifyInnerRadius(value:number):boolean
		{
			return 0 <= value && value <= 1;
		}
		
		/**
		 * This draws the histogram bins that a list of record keys fall into.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			var binKeys:Array;
			var binKeyMap:Map;
			if (task.iteration == 0)
			{
				// convert record keys to bin keys
				// save a mapping of each bin key found to a record key in that bin
				binKeyMap = new Map();
				for (var recordKey:IQualifiedKey of task.recordKeys)
					binKeyMap[ this._binLookup.getStringLookupKeyFromInternalColumnKey(recordKey) ] = recordKey;
				
				binKeys = [];
				for (var binQKey of binKeyMap.keys())
					binKeys.push(binQKey);
				
				task.asyncState.binKeys = binKeys;
				task.asyncState.binKeyMap = binKeyMap;
			}
			
			binKeyMap = task.asyncState.binKeyMap;
			binKeys = task.asyncState.binKeys;
			
			if (task.iteration < binKeys.length)
			{
				//------------------------
				// draw one record
				var binKey:IQualifiedKey = binKeys[task.iteration] as IQualifiedKey;
				tempShape.graphics.clear();
				
				this.drawBin(task, binKey);
				
				if (clipDrawing)
				{
					// get clipRectangle
					task.screenBounds.getRectangle(this.clipRectangle);
					// increase width and height by 1 to avoid clipping rectangle borders drawn with vector graphics.
					this.clipRectangle.width++;
					this.clipRectangle.height++;
				}
				task.buffer.draw(tempShape, null, null, null, clipDrawing ? this.clipRectangle : null);
				//------------------------
				
				// report progress
				return task.iteration / binKeys.length;
			}
			
			// report progress
			return 1;
		}
		
		protected drawBin(task:IPlotTask, binKey:IQualifiedKey):void
		{
			// project data coordinates to screen coordinates and draw graphics
			var beginRadians:number = this._beginRadians.getValueFromKey(binKey, Number);
			var spanRadians:number = this._spanRadians.getValueFromKey(binKey, Number);
			
			var graphics:Graphics = tempShape.graphics;
			// begin line & fill
			this.line.beginLineStyle(binKey, graphics);
			//fill.beginFillStyle(recordKey, graphics);
			
			// draw graphics
			var color:number = this.chartColors.getColorFromNorm( this._binLookupStats.getNorm(binKey) );
			graphics.beginFill(color, 1);
			
			// move to center point
			WedgePlotter.drawProjectedWedge(graphics, task.dataBounds, task.screenBounds, beginRadians, spanRadians, 0, 0, 1, this.innerRadius.value);
			// end fill
			graphics.endFill();
		}
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (this._filteredData.keys.length == 0)
				return;
			
			var binKey:IQualifiedKey;
			var beginRadians:number;
			var spanRadians:number;
			var midRadians:number;
			var xScreenRadius:number;
			var yScreenRadius:number;
			
			var binKeyMap:Map = new Map();
			for (var j:int = 0; j < this._filteredData.keys.length; j++)
				binKeyMap[ this._binLookup.getStringLookupKeyFromInternalColumnKey(this._filteredData.keys[j] as IQualifiedKey)] = true;
			
			var binKeys:Array = [];
			for (var binQKey of binKeyMap.keys())
				binKeys.push(binQKey);
			
			for (var i:int; i < binKeys.length; i++)
			{
				binKey = binKeys[i] as IQualifiedKey;
				beginRadians = this._beginRadians.getValueFromKey(binKey, Number) as Number;
				spanRadians = this._spanRadians.getValueFromKey(binKey, Number) as Number;
				midRadians = beginRadians + (spanRadians / 2);
				
				var cos:number = Math.cos(midRadians);
				var sin:number = Math.sin(midRadians);
				
				this._tempPoint.x = cos;
				this._tempPoint.y = sin;
				dataBounds.projectPointTo(this._tempPoint, screenBounds);
				this._tempPoint.x += cos * 10 * screenBounds.getXDirection();
				this._tempPoint.y += sin * 10 * screenBounds.getYDirection();
				
				this._bitmapText.text = binKey.localName;
				
				this._bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
				
				this._bitmapText.angle = screenBounds.getYDirection() * (midRadians * 180 / Math.PI);
				this._bitmapText.angle = (this._bitmapText.angle % 360 + 360) % 360;
				if (cos > -0.000001) // the label exactly at the bottom will have left align
				{
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
					// first get values between -90 and 90, then multiply by the ratio
					this._bitmapText.angle = ((this._bitmapText.angle + 90) % 360 - 90) * this.labelAngleRatio.value;
				}
				else
				{
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
					// first get values between -90 and 90, then multiply by the ratio
					this._bitmapText.angle = (this._bitmapText.angle - 180) * this.labelAngleRatio.value;
				}
				LinkableTextFormat.defaultTextFormat.copyTo(this._bitmapText.textFormat);
				this._bitmapText.x = this._tempPoint.x;
				this._bitmapText.y = this._tempPoint.y;
				this._bitmapText.draw(destination);
			}
		}
		
		private _tempPoint:Point = new Point();
		private _bitmapText:BitmapText = new BitmapText();
		
		/**
		 * This gets the data bounds of the bin that a record key falls into.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var binKey:IQualifiedKey = this._binLookup.getStringLookupKeyFromInternalColumnKey(recordKey);
			var beginRadians:number = this._beginRadians.getValueFromKey(binKey, Number);
			var spanRadians:number = this._spanRadians.getValueFromKey(binKey, Number);
			WedgePlotter.getWedgeBounds(this.initBoundsArray(output), beginRadians, spanRadians);
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
		//[Deprecated(replacement="line")] public set lineStyle(value:Object):void { try { Weave.setState(line, value[0].sessionState); } catch (e) { } }
	}
}

