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
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableString = weavejs.core.LinkableString;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	/**
	 * Plots squares or circles.
	 */
	export class SimpleGlyphPlotter extends AbstractGlyphPlotter
	{
		public constructor()
		{
			this.fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.setColumnKeySources([this.screenSize, this.dataX, this.dataY], [-1, 1, -1]);
		}
		
		private static LEFT:string = 'left';
		private static CENTER:string = 'center';
		private static RIGHT:string = 'right';
		private static TOP:string = 'top';
		private static MIDDLE:string = 'middle';
		private static BOTTOM:string = 'bottom';
		private static HORIZONTAL_MODES = [SimpleGlyphPlotter.LEFT,SimpleGlyphPlotter.CENTER,SimpleGlyphPlotter.RIGHT];
		private static VERTICAL_MODES = [SimpleGlyphPlotter.TOP,SimpleGlyphPlotter.MIDDLE,SimpleGlyphPlotter.BOTTOM];
		private static verifyHorizontal(value:string):boolean { return SimpleGlyphPlotter.HORIZONTAL_MODES.indexOf(value) >= 0; }
		private static verifyVertical(value:string):boolean { return SimpleGlyphPlotter.VERTICAL_MODES.indexOf(value) >= 0; }
		
		/**
		 * This is the line style used to draw the outline of the rectangle.
		 */
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, new SolidLineStyle());
		/**
		 * This is the fill style used to fill the rectangle.
		 */
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, new SolidFillStyle());
		/**
		 * This determines the screen size of the glyphs.
		 */
		public screenSize:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn());
		/**
		 * If this is true, ellipses will be drawn instead of rectangles.
		 */
		public drawEllipse:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		/**
		 * This determines how the glyphs are aligned horizontally to the data coordinates.
		 */		
		public horizontalPosition:LinkableString = Weave.linkableChild(this, new LinkableString(SimpleGlyphPlotter.CENTER, SimpleGlyphPlotter.verifyHorizontal));
		/**
		 * This determines how the glyphs are aligned vertically to the data coordinates.
		 */		
		public verticalPosition:LinkableString = Weave.linkableChild(this, new LinkableString(SimpleGlyphPlotter.MIDDLE, SimpleGlyphPlotter.verifyVertical));
		
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:Graphics):void
		{
			this.getCoordsFromRecordKey(recordKey, SimpleGlyphPlotter.tempPoint);
			var size:number = this.screenSize.getValueFromKey(recordKey, Number);
			
			if (isNaN(SimpleGlyphPlotter.tempPoint.x) || isNaN(SimpleGlyphPlotter.tempPoint.y) || isNaN(size))
				return;
			
			// project x,y data coordinates to screen coordinates
			dataBounds.projectPointTo(SimpleGlyphPlotter.tempPoint, screenBounds);
			
			// add screen offsets
			SimpleGlyphPlotter.tempPoint.x += size * (SimpleGlyphPlotter.HORIZONTAL_MODES.indexOf(this.horizontalPosition.value) / 2 - 1);
			SimpleGlyphPlotter.tempPoint.y += size * (SimpleGlyphPlotter.VERTICAL_MODES.indexOf(this.verticalPosition.value) / 2 - 1);
			
			// draw graphics
			var graphics:Graphics = tempShape.graphics;
			this.lineStyle.beginLineStyle(recordKey, graphics);
			this.fillStyle.beginFillStyle(recordKey, graphics);
			
			if (this.drawEllipse.value)
				graphics.drawEllipse(SimpleGlyphPlotter.tempPoint.x, SimpleGlyphPlotter.tempPoint.y, size, size);
			else
				graphics.drawRect(SimpleGlyphPlotter.tempPoint.x, SimpleGlyphPlotter.tempPoint.y, size, size);
			
			graphics.endFill();
		}
		
		private static tempPoint:Point = new Point(); // reusable object
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, SimpleGlyphPlotter, "Simple glyphs");
}

