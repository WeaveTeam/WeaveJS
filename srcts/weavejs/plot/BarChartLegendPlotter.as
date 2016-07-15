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
	import Dictionary = flash.utils.Dictionary;
	
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ColorRamp = weavejs.util.ColorRamp;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LegendUtils = weavejs.util.LegendUtils;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class BarChartLegendPlotter extends AbstractPlotter
	{
		public constructor()
		{
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.columns, this.chartColors, this.colorIndicatesDirection, this.maxColumns, this.reverseOrder, this.itemLabelFunction);
		}
		
		public columns:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), createColumnHashes);
		public chartColors:ColorRamp = Weave.linkableChild(this, ColorRamp);
		public colorIndicatesDirection:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), createColumnHashes);
		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(12));
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		private numColumns:int = 0;
		private _itemOrdering:Array = [];
		private _itemToTitle:Dictionary = new Dictionary();
		private _maxBoxSize:number = 8;
		
		/**
		 * This is the maximum number of items to draw in a single row.
		 * @default 1
		 */
		public maxColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1), createColumnHashes);
		
		/**
		 * This is an option to reverse the item order.
		 */
		public reverseOrder:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), createColumnHashes);
		
		/**
		 * This is the compiled function to apply to the item labels.
		 */
		public itemLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, false, ['number','string','column']), createColumnHashes);

		// TODO This should go somewhere else...
		/**
		 * This is the compiled function to apply to the title of the tool.
		 * 
		 * @default string  
		 */		
		public legendTitleFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, false, ['string']));
		
		private static NEGATIVE_POSITIVE_ITEMS:Array = [lang('Negative'), lang('Positive')];
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(0, 0, 1, 1);
		}
		
		private createColumnHashes():void
		{
			_itemOrdering = [];
			_itemToTitle = new Dictionary();
			var columnObjects:Array = columns.getObjects();
			var item:Object;
			var colTitle:string;
			numColumns = colorIndicatesDirection.value ? 2 : columnObjects.length;
			for (var i:int = 0; i < numColumns; ++i)
			{
				if (colorIndicatesDirection.value)
				{
					item = i;
					colTitle = NEGATIVE_POSITIVE_ITEMS[i];
				}
				else
				{
					item = columnObjects[i];
					colTitle = ColumnUtils.getTitle(item as IAttributeColumn);
				}
				
				_itemOrdering.push(item);
				try
				{
					_itemToTitle[item] = itemLabelFunction.apply(null, [i, colTitle, item]);
				}
				catch (e:Error)
				{
					_itemToTitle[item] = colTitle;
				}
			}
			
			if (reverseOrder.value)
				_itemOrdering = _itemOrdering.reverse(); 
		}

		private _itemBounds:Bounds2D = new Bounds2D();
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			var g:Graphics = tempShape.graphics;
			g.clear();
			lineStyle.beginLineStyle(null, g);
			var maxCols:int = maxColumns.value;
			var margin:int = 4;
			var actualShapeSize:int = Math.max(_maxBoxSize, shapeSize.value);
			for (var iColumn:int = 0; iColumn < numColumns; ++iColumn)
			{
				var item:Object = _itemOrdering[iColumn];
				var title:string = _itemToTitle[item];
				LegendUtils.getBoundsFromItemID(screenBounds, iColumn, _itemBounds, numColumns, maxCols);
				LegendUtils.renderLegendItemText(destination, title, _itemBounds, actualShapeSize + margin);

				// draw the rectangle
				// if we have reversed the order of the columns, iColumn should match the colors (this has always been backwards?)
				// otherwise, we reverse the iColorIndex
				var iColorIndex:int = reverseOrder.value ? (numColumns - 1 - iColumn) : iColumn;
				var color:number = chartColors.getColorFromNorm(iColorIndex / (numColumns - 1));
				if (isFinite(color))
					g.beginFill(color, 1.0);
				var xMin:number = _itemBounds.getXNumericMin();
				var xMax:number = _itemBounds.getXNumericMax();
				var yMin:number = _itemBounds.getYNumericMin();
				var yMax:number = _itemBounds.getYNumericMax();
				var yCoverage:number = _itemBounds.getYCoverage();
				// we don't want the rectangles touching
				yMin += 0.1 * yCoverage;
				yMax -= 0.1 * yCoverage;
				tempShape.graphics.drawRect(
					xMin,
					yMin,
					actualShapeSize,
					yMax - yMin
				);
			}
			destination.draw(tempShape);
		}
		
		// backwards compatibility
		//[Deprecated(replacement="reverseOrder")] public set ascendingOrder(value:boolean):void { reverseOrder.value = value; }
	}
}
