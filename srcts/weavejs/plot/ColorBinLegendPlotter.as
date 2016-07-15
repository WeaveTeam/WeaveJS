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
	import Rectangle = weavejs.geom.Rectangle;
	import Dictionary = flash.utils.Dictionary;
	
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LegendUtils = weavejs.util.LegendUtils;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	/**
	 * This plotter displays a legend for a ColorColumn.  If the ColorColumn contains a BinnedColumn, a list of bins
	 * with their corresponding colors will be displayed.  If not a continuous color scale will be displayed.  By
	 * default this plotter links to the static color column, but it can be linked to another by changing or removing
	 * the dynamicColorColumn.staticName value.
	 */
	export class ColorBinLegendPlotter extends AbstractPlotter implements ITextPlotter, ISelectableAttributes
	{
		public constructor()
		{
			dynamicColorColumn.globalName = WeaveProperties.DEFAULT_COLOR_COLUMN;
			
			setSingleKeySource(dynamicColorColumn);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.dynamicColorColumn, this.maxColumns, this.reverseOrder, this.itemLabelFunction);
		}
		
		public getSelectableAttributeNames():Array
		{
			return ["Color data"];
		}
		public getSelectableAttributes():Array
		{
			return [dynamicColorColumn];
		}
		
		/**
		 * This plotter is specifically implemented for visualizing a ColorColumn.
		 * This DynamicColumn only allows internal columns of type ColorColumn.
		 */
		public dynamicColorColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(ColorColumn), createHashMaps);
		
		/**
		 * This accessor function provides convenient access to the internal ColorColumn, which may be null.
		 * The public session state is defined by dynamicColorColumn.
		 */
		public getInternalColorColumn():ColorColumn
		{
			return dynamicColorColumn.getInternalColumn() as ColorColumn;
		}
		
		/**
		 * This is the type of shape to be drawn for each legend item.
		 */		
		public shapeType:LinkableString = Weave.linkableChild(this, new LinkableString(SHAPE_TYPE_CIRCLE, verifyShapeType));
		public static SHAPE_TYPE_CIRCLE:string = 'circle';
		public static SHAPE_TYPE_SQUARE:string = 'square';
		public static SHAPE_TYPE_LINE:string = 'line';
		public static ENUM_SHAPE_TYPE:Array = [SHAPE_TYPE_CIRCLE, SHAPE_TYPE_SQUARE, SHAPE_TYPE_LINE];
		private verifyShapeType(value:string):boolean { return ENUM_SHAPE_TYPE.indexOf(value) >= 0; }
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(25));
		/**
		 * This is the line style used to draw the outline of the shape.
		 */
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		/**
		 * This is the maximum number of items to draw in a single row.
		 * @default 1 
		 */		
		public maxColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1), createHashMaps);
		
		/**
		 * This is an option to reverse the item order.
		 */
		public reverseOrder:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), createHashMaps);
		
		/**
		 * This is the compiled function to apply to the item labels.
		 */		
		public itemLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, false, ['number', 'string']), createHashMaps);
		
		// TODO This should go somewhere else...
		/**
		 * This is the compiled function to apply to the title of the tool.
		 */		
		public legendTitleFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('column.getMetadata("title")', true, false, ['string', 'column']));
		
		private statsWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		
		private _binToBounds:Array = [];
		private _binToString:Array = [];
		public numBins:int = 0;
		private createHashMaps():void
		{
			_binToString = [];
			_binToBounds = [];
			
			var keys:Array = filteredKeySet.keys;
			var internalColorColumn:ColorColumn = getInternalColorColumn();
			if (!internalColorColumn)
				return;
			
			var binnedColumn:BinnedColumn = internalColorColumn.getInternalColumn() as BinnedColumn;
			if (binnedColumn == null)
			{
				numBins = 0;
				return;
			}
			
			numBins = binnedColumn.numberOfBins;
			var maxCols:int = maxColumns.value;
			if (maxCols <= 0)
				maxCols = 1;
			if (maxCols > numBins)
				maxCols = numBins;
			var blankBins:int = numBins % maxCols;
			var fakeNumBins:int = (blankBins > 0) ? maxCols - blankBins : 0; // invisible bins which should be put in the lower right 
			var maxNumBins:int = numBins + fakeNumBins;
			for (var iBin:int = 0; iBin < numBins; ++iBin)
			{
				// get the adjusted position and transpose inside the row
				var adjustedIBin:int = (reverseOrder.value) ? (fakeNumBins + iBin) : (maxNumBins - 1 - iBin);
				var row:int = adjustedIBin / maxCols;
				var col:int = adjustedIBin % maxCols;
				var b:Bounds2D = new Bounds2D();
				
				getBackgroundDataBounds(tempBounds);
				LegendUtils.getBoundsFromItemID(tempBounds, adjustedIBin, b, maxNumBins, maxCols, true);
				
				_binToBounds[iBin] = b;
				var binString:string = binnedColumn.deriveStringFromNumber(iBin);
				try
				{
					_binToString[iBin] = itemLabelFunction.apply(null, [iBin, binString]);
				}
				catch (e:Error)
				{
					_binToString[iBin] = binString;
				}
			}
		}
		
		private _drawBackground:boolean = false; // this is used to check if we should draw the bins with no records.
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			// draw the bins that have no records in them in the background
			_drawBackground = true;
			drawAll(filteredKeySet.keys, dataBounds, screenBounds, destination);
			_drawBackground = false;
		}

		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			var internalColorColumn:ColorColumn = getInternalColorColumn();
			if (internalColorColumn == null)
				return; // draw nothing
			var binnedColumn:BinnedColumn = internalColorColumn.getInternalColumn() as BinnedColumn;
			if (binnedColumn && binnedColumn.numberOfBins)
				drawBinnedPlot(recordKeys, dataBounds, screenBounds, destination);
			else
				drawContinuousPlot(recordKeys, dataBounds, screenBounds, destination);
		}
			
		protected function drawContinuousPlot(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			if (!_drawBackground)
				return;
			
			var _shapeSize:number = shapeSize.value;
			var colorColumn:ColorColumn = getInternalColorColumn();
			var dataColumn:DynamicColumn = colorColumn.internalDynamicColumn;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(dataColumn);
			statsWatcher.target = stats;
			
			tempBounds.copyFrom(screenBounds);
			tempBounds.makeSizePositive();
			tempBounds.setXMax(_shapeSize + labelGap);
			
			tempShape.graphics.clear();
			colorColumn.ramp.draw(tempShape, 0, reverseOrder.value ? -1 : 1, tempBounds);
			lineStyle.beginLineStyle(null, tempShape.graphics);
			tempShape.graphics.drawRect(tempBounds.getXNumericMin(), tempBounds.getYNumericMin(), tempBounds.getXCoverage() - 1, tempBounds.getYCoverage() - 1);
			
			var minLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, colorColumn.getDataMin());
			LegendUtils.renderLegendItemText(destination, minLabel, screenBounds, _shapeSize + labelGap, null, reverseOrder.value ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP);
			
			if (colorColumn.rampCenterAtZero.value)
			{
				var midLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, 0);
				LegendUtils.renderLegendItemText(destination, midLabel, screenBounds, _shapeSize + labelGap, null, BitmapText.VERTICAL_ALIGN_MIDDLE);
			}
			
			var maxLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, colorColumn.getDataMax());
			LegendUtils.renderLegendItemText(destination, maxLabel, screenBounds, _shapeSize + labelGap, null, reverseOrder.value ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM);
			
			destination.draw(tempShape);
		}
		
		protected function drawBinnedPlot(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			var colorColumn:ColorColumn = getInternalColorColumn();
			var binnedColumn:BinnedColumn = colorColumn.getInternalColumn() as BinnedColumn;
			
			var g:Graphics = tempShape.graphics;
			g.clear();
			lineStyle.beginLineStyle(null, g);
			
			// convert record keys to bin keys
			// save a mapping of each bin key found to a value of true
			var binIndexMap:Dictionary = new Dictionary();
			for (var i:int = 0; i < recordKeys.length; i++)
				binIndexMap[ binnedColumn.getValueFromKey(recordKeys[i], Number) ] = 1;
			
			var _shapeSize:number = shapeSize.value;
			if (shapeType.value != SHAPE_TYPE_LINE)
				_shapeSize = Math.max(1, Math.min(_shapeSize, screenBounds.getYCoverage() / numBins));
			var xShapeOffset:number = _shapeSize / 2; 
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(colorColumn.internalDynamicColumn);
			statsWatcher.target = stats;
			var binCount:int = binnedColumn.numberOfBins;
			for (var iBin:int = 0; iBin < binCount; ++iBin)
			{
				// we only render empty bins when _drawBackground is true
				if (binIndexMap[iBin] ? _drawBackground : !_drawBackground)
					continue;
				
				tempBounds.copyFrom(_binToBounds[iBin]);
				dataBounds.projectCoordsTo(tempBounds, screenBounds);
				
				// draw almost invisible rectangle for probe filter
				tempBounds.getRectangle(tempRectangle);
				destination.fillRect(tempRectangle, 0x02808080);
				
				// draw the text
				LegendUtils.renderLegendItemText(destination, _binToString[iBin], tempBounds, _shapeSize + labelGap);
				
				// draw circle
				var iColorIndex:int = reverseOrder.value ? (binCount - 1 - iBin) : iBin;
				var color:number = colorColumn.getColorFromDataValue(iBin);
				var xMin:number = tempBounds.getXNumericMin(); 
				var yMin:number = tempBounds.getYNumericMin();
				var xMax:number = tempBounds.getXNumericMax(); 
				var yMax:number = tempBounds.getYNumericMax();
				if (isFinite(color))
					g.beginFill(color, 1.0);
				switch (shapeType.value)
				{
					case SHAPE_TYPE_CIRCLE:
						g.drawCircle(xMin + xShapeOffset, (yMin + yMax) / 2, _shapeSize / 2);
						break;
					case SHAPE_TYPE_SQUARE:
						g.drawRect(
							xMin + xShapeOffset - _shapeSize / 2,
							(yMin + yMax - _shapeSize) / 2,
							_shapeSize,
							_shapeSize
						);
						break;
					case SHAPE_TYPE_LINE:
						if (!isFinite(color))
							break;
						g.endFill();
						g.lineStyle(lineShapeThickness, color, 1);
						g.moveTo(xMin + xShapeOffset - _shapeSize / 2, (yMin + yMax) / 2);
						g.lineTo(xMin + xShapeOffset + _shapeSize / 2, (yMin + yMax) / 2);
						break;
				}
				g.endFill();
			}
			destination.draw(tempShape);
		}
		
		public labelGap:number = 5;
		public lineShapeThickness:number = 4;
		
		// reusable temporary objects
		private tempPoint:Point = new Point();
		private tempBounds:Bounds2D = new Bounds2D();
		private tempRectangle:Rectangle = new Rectangle();
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			initBoundsArray(output);
			var internalColorColumn:ColorColumn = getInternalColorColumn();
			if (!internalColorColumn)
				return;
			
			var binnedColumn:BinnedColumn = internalColorColumn.getInternalColumn() as BinnedColumn;
			if (binnedColumn)
			{
				var index:number = binnedColumn.getValueFromKey(recordKey, Number);
				var b:Bounds2D = _binToBounds[index];
				if (b)
					(output[0] as Bounds2D).copyFrom(b);
			}
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			return output.setBounds(0, 1, 1, 0);
		}
		
		// backwards compatibility
		//[Deprecated(replacement="reverseOrder")] public set ascendingOrder(value:boolean):void { reverseOrder.value = !value; }
	}
}
