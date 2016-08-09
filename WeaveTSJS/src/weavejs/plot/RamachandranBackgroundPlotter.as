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
	
	import Bounds2D = weavejs.geom.Bounds2D;
	import Bounds2D = weavejs.geom.Bounds2D;
	
	export class RamachandranBackgroundPlotter extends AbstractPlotter
	{
		public constructor()
		{
		}
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(-180,-180,180,180);
		}
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var g:Graphics = tempShape.graphics;
			g.clear();
			g.lineStyle(2, 0, 1);
			
			// project to screen bounds
			this.tempBounds.setBounds(-180,180,180,-180);
			dataBounds.projectCoordsTo(this.tempBounds, screenBounds);
			
			var matrix:Matrix = new Matrix();
			matrix.scale(this.tempBounds.getWidth() / RamachandranBackgroundPlotter._missingImage.width, this.tempBounds.getHeight() / RamachandranBackgroundPlotter._missingImage.height);
			matrix.translate(this.tempBounds.getXMin(), this.tempBounds.getYMin());
			destination.draw(RamachandranBackgroundPlotter._missingImage, matrix, null, null, null, true);
			
			// draw vertical line through x=0
			g.moveTo(this.tempBounds.getXCenter(), this.tempBounds.getYMin());
			g.lineTo(this.tempBounds.getXCenter(), this.tempBounds.getYMax());
				
			// draw horizontal line through y=0
			g.moveTo(this.tempBounds.getXMin(), this.tempBounds.getYCenter());
			g.lineTo(this.tempBounds.getXMax(), this.tempBounds.getYCenter());
			
			destination.draw(tempShape);
		}
		
		private tempBounds:Bounds2D = new Bounds2D();
		private tempPoint:Point = new Point();

		// background image
		[Embed(source="/weave/resources/images/RamaPlot.png")]
		private static _missingImageClass:Class;
		private static _missingImage:BitmapData = Bitmap(new RamachandranBackgroundPlotter._missingImageClass()).bitmapData;
	}
}
