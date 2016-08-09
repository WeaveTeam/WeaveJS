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

	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ColorRamp = weavejs.util.ColorRamp;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LegendUtils = weavejs.plot.LegendUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	export class BarChartLegendPlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.columns, this.chartColors, this.colorIndicatesDirection, this.maxColumns, this.reverseOrder, this.itemLabelFunction);
		}
		
		public columns:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.createColumnHashes);
		public chartColors:ColorRamp = Weave.linkableChild(this, ColorRamp);
		public colorIndicatesDirection:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.createColumnHashes);
		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(12));
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		private numColumns:int = 0;
		private _itemOrdering:(int | IAttributeColumn)[] = [];
		private map_item_title:Map<int|IAttributeColumn, string> = new Map();
		private _maxBoxSize:number = 8;
		
		/**
		 * This is the maximum number of items to draw in a single row.
		 * @default 1
		 */
		public maxColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1), this.createColumnHashes);
		
		/**
		 * This is an option to reverse the item order.
		 */
		public reverseOrder:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.createColumnHashes);
		
		/**
		 * This is the compiled function to apply to the item labels.
		 */
		public itemLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, ['number','string','column']), this.createColumnHashes);

		// TODO This should go somewhere else...
		/**
		 * This is the compiled function to apply to the title of the tool.
		 * 
		 * @default string  
		 */		
		public legendTitleFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, ['string']));
		
		private static NEGATIVE_POSITIVE_ITEMS = [Weave.lang('Negative'), Weave.lang('Positive')];
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(0, 0, 1, 1);
		}
		
		private createColumnHashes():void
		{
			this._itemOrdering = [];
			this.map_item_title = new Map();
			var columnObjects = this.columns.getObjects(IAttributeColumn);
			var item:int | IAttributeColumn;
			var colTitle:string;
			this.numColumns = this.colorIndicatesDirection.value ? 2 : columnObjects.length;
			for (var i:int = 0; i < this.numColumns; ++i)
			{
				if (this.colorIndicatesDirection.value)
				{
					item = i;
					colTitle = BarChartLegendPlotter.NEGATIVE_POSITIVE_ITEMS[i];
				}
				else
				{
					item = columnObjects[i];
					colTitle = ColumnUtils.getTitle(columnObjects[i]);
				}
				
				this._itemOrdering.push(item);
				try
				{
					this.map_item_title.set(item, this.itemLabelFunction.apply(null, [i, colTitle, item]));
				}
				catch (e)
				{
					this.map_item_title.set(item, colTitle);
				}
			}
			
			if (this.reverseOrder.value)
				this._itemOrdering = this._itemOrdering.reverse(); 
		}

		private _itemBounds:Bounds2D = new Bounds2D();
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			this.lineStyle.beginLineStyle(null, graphics);
			var maxCols:int = this.maxColumns.value;
			var margin:int = 4;
			var actualShapeSize:int = Math.max(this._maxBoxSize, this.shapeSize.value);
			for (var iColumn:int = 0; iColumn < this.numColumns; ++iColumn)
			{
				var item = this._itemOrdering[iColumn];
				var title = this.map_item_title.get(item);
				LegendUtils.getBoundsFromItemID(screenBounds, iColumn, this._itemBounds, this.numColumns, maxCols);
				LegendUtils.renderLegendItemText(graphics, title, this._itemBounds, actualShapeSize + margin);

				// draw the rectangle
				// if we have reversed the order of the columns, iColumn should match the colors (this has always been backwards?)
				// otherwise, we reverse the iColorIndex
				var iColorIndex:int = this.reverseOrder.value ? (this.numColumns - 1 - iColumn) : iColumn;
				var color:number = this.chartColors.getColorFromNorm(iColorIndex / (this.numColumns - 1));
				if (isFinite(color))
					graphics.beginFill(color, 1.0);
				var xMin:number = this._itemBounds.getXNumericMin();
				var xMax:number = this._itemBounds.getXNumericMax();
				var yMin:number = this._itemBounds.getYNumericMin();
				var yMax:number = this._itemBounds.getYNumericMax();
				var yCoverage:number = this._itemBounds.getYCoverage();
				// we don't want the rectangles touching
				yMin += 0.1 * yCoverage;
				yMax -= 0.1 * yCoverage;
				graphics.drawRect(
					xMin,
					yMin,
					actualShapeSize,
					yMax - yMin
				);
			}
		}
		
		// backwards compatibility
		//[Deprecated(replacement="reverseOrder")] public set ascendingOrder(value:boolean):void { reverseOrder.value = value; }
	}
}

