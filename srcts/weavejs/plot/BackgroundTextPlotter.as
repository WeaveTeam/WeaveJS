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
	
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	
	export class BackgroundTextPlotter extends AbstractPlotter
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, BackgroundTextPlotter, "Background text");
		
		public textFormat:LinkableTextFormat = Weave.linkableChild(this, LinkableTextFormat);
		public textFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('target && target.getSessionState()', true, false, ['target']));
		public dependency:LinkableDynamicObject = Weave.linkableChild(this, LinkableDynamicObject);
		private bitmapText:BitmapText = new BitmapText();
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			bitmapText.x = screenBounds.getXCenter();
			bitmapText.y = screenBounds.getYCenter();
			bitmapText.maxWidth = screenBounds.getXCoverage();
			bitmapText.maxHeight = screenBounds.getYCoverage();
			bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
			bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
			textFormat.copyTo(bitmapText.textFormat);
			try
			{
				bitmapText.text = textFunction.apply(this, [dependency.target]);
				bitmapText.draw(destination);
			}
			catch (e:Error)
			{
				JS.error(e);
			}
		}
	}
}
