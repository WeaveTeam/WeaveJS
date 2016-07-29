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
	import Shape = flash.display.Shape;
	import Point = weavejs.geom.Point;
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableString = weavejs.core.LinkableString;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;

	/**
	 * Plots squares or circles.
	 */
	export class SimpleGlyphPlotter extends AbstractGlyphPlotter
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, SimpleGlyphPlotter, "Simple glyphs");
		
		public constructor()
		{
			fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			setColumnKeySources([screenSize, dataX, dataY], [-1, 1, -1]);
		}
		
		private static LEFT:string = 'left', CENTER:string = 'center', RIGHT:string = 'right';
		private static TOP:string = 'top', MIDDLE:string = 'middle', BOTTOM:string = 'bottom';
		private static HORIZONTAL_MODES:Array = [LEFT,CENTER,RIGHT];
		private static VERTICAL_MODES:Array = [TOP,MIDDLE,BOTTOM];
		private static verifyHorizontal(value:string):boolean { return HORIZONTAL_MODES.indexOf(value) >= 0; }
		private static verifyVertical(value:string):boolean { return VERTICAL_MODES.indexOf(value) >= 0; }
		
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
		public horizontalPosition:LinkableString = Weave.linkableChild(this, new LinkableString(CENTER, verifyHorizontal));
		/**
		 * This determines how the glyphs are aligned vertically to the data coordinates.
		 */		
		public verticalPosition:LinkableString = Weave.linkableChild(this, new LinkableString(MIDDLE, verifyVertical));
		
		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
		{
			getCoordsFromRecordKey(recordKey, tempPoint);
			var size:number = screenSize.getValueFromKey(recordKey, Number);
			
			if (isNaN(tempPoint.x) || isNaN(tempPoint.y) || isNaN(size))
				return;
			
			// project x,y data coordinates to screen coordinates
			dataBounds.projectPointTo(tempPoint, screenBounds);
			
			// add screen offsets
			tempPoint.x += size * (HORIZONTAL_MODES.indexOf(horizontalPosition.value) / 2 - 1);
			tempPoint.y += size * (VERTICAL_MODES.indexOf(verticalPosition.value) / 2 - 1);
			
			// draw graphics
			var graphics:Graphics = tempShape.graphics;
			lineStyle.beginLineStyle(recordKey, graphics);
			fillStyle.beginFillStyle(recordKey, graphics);
			
			if (drawEllipse.value)
				graphics.drawEllipse(tempPoint.x, tempPoint.y, size, size);
			else
				graphics.drawRect(tempPoint.x, tempPoint.y, size, size);
			
			graphics.endFill();
		}
		
		private static tempPoint:Point = new Point(); // reusable object
	}
}
