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
	import Point = weavejs.geom.Point;
	import Rectangle = weavejs.geom.Rectangle;

	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import Matrix = PIXI.Matrix;
	import WeaveProperties = weavejs.app.WeaveProperties;

	export class TextGlyphPlotter extends AbstractGlyphPlotter implements ITextPlotter
	{
		public constructor()
		{
			super();
			this.hideOverlappingText.value = false;
			this.xScreenOffset.value = 0;
			this.yScreenOffset.value = 0;
			this.setColumnKeySources([this.sortColumn, this.text]);
		}
		
		private bitmapText:BitmapText = new BitmapText();
		private matrix:Matrix = new Matrix();

		public sortColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

		public text:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		public setDefaultTextFormat(ltf:LinkableTextFormat):void
		{
			this.font.defaultValue.state = ltf.font.value;
			this.size.defaultValue.state = ltf.size.value;
			this.color.defaultValue.state = ltf.color.value;
			this.bold.defaultValue.state = ltf.bold.value;
			this.italic.defaultValue.state = ltf.italic.value;
			this.underline.defaultValue.state = ltf.underline.value;
		}
		public font:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(LinkableTextFormat.DEFAULT_FONT));
		public size:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(LinkableTextFormat.DEFAULT_SIZE));
		public color:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0x000000));
		public bold:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(false));
		public italic:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(false));
		public underline:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(false));
		
		public hAlign:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(BitmapText.HORIZONTAL_ALIGN_CENTER));
		public vAlign:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public angle:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		public hideOverlappingText:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		public xScreenOffset:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public yScreenOffset:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public maxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(100));

		/**
		 * Draws the graphics onto BitmapData.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (typeof task.asyncState != 'function')
			{
				// these variables are used to save state between function calls
				const textWasDrawn:boolean[] = [];
				const reusableBoundsObjects:Bounds2D[] = [];
				
				task.asyncState = function():number
				{
					var bounds:Bounds2D;
					
					if (task.iteration == 0)
					{
						// cleanup
						for (bounds of reusableBoundsObjects)
							ObjectPool.returnObject(bounds);
						reusableBoundsObjects.length = 0; // important so we don't return the same bounds later
					}
					
					if (task.iteration < task.recordKeys.length)
					{
						var recordKey:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
						
						// project data coordinates to screen coordinates and draw graphics onto tempShape
						this.getCoordsFromRecordKey(recordKey, TextGlyphPlotter.tempPoint);
						task.dataBounds.projectPointTo(TextGlyphPlotter.tempPoint, task.screenBounds);
		
						// round to nearest pixel to get clearer text
						this.bitmapText.x = Math.round(TextGlyphPlotter.tempPoint.x + this.xScreenOffset.value);
						this.bitmapText.y = Math.round(TextGlyphPlotter.tempPoint.y + this.yScreenOffset.value);
						this.bitmapText.text = this.text.getValueFromKey(recordKey, String) as String;
						this.bitmapText.verticalAlign = this.vAlign.getValueFromKey(recordKey, String) as String;
						this.bitmapText.horizontalAlign = this.hAlign.getValueFromKey(recordKey, String) as String;
						this.bitmapText.angle = this.angle.getValueFromKey(recordKey, Number);
						this.bitmapText.maxWidth = this.maxWidth.value - this.xScreenOffset.value;
						
						// init text format			
						var f:TextFormat = this.bitmapText.textFormat;
						f.font = this.font.getValueFromKey(recordKey, String) as String;
						f.size = this.size.getValueFromKey(recordKey, Number);
						f.color = this.color.getValueFromKey(recordKey, Number);
						f.bold = StandardLib.asBoolean(this.bold.getValueFromKey(recordKey, Number));
						f.italic = StandardLib.asBoolean(this.italic.getValueFromKey(recordKey, Number));
						f.underline = StandardLib.asBoolean(this.underline.getValueFromKey(recordKey, Number));
		
						var shouldRender:boolean = true;
						
						if (this.hideOverlappingText.value)
						{
							// grab a bounds object to store the screen size of the bitmap text
							bounds = reusableBoundsObjects[task.iteration] = ObjectPool.borrowObject(Bounds2D);
							this.bitmapText.getUnrotatedBounds(bounds);
							
							// brute force check to see if this bounds overlaps with any previous bounds
							for (var j:int = 0; j < task.iteration; j++)
							{
								if (textWasDrawn[j] && bounds.overlaps(reusableBoundsObjects[j] as Bounds2D))
								{
									shouldRender = false;
									break;
								}
							}
						}
							
						textWasDrawn[task.iteration] = shouldRender;
						
						if (shouldRender)
						{
							TextGlyphPlotter.drawInvisibleHalo(this.bitmapText, task);

							this.bitmapText.draw(task.buffer);
						}
						
						return task.iteration / task.recordKeys.length;
					}

					for (bounds of reusableBoundsObjects)
						ObjectPool.returnObject(bounds);
					reusableBoundsObjects.length = 0; // important so we don't return the same bounds later
					
					return 1; // avoids divide-by-zero when there are no record keys
				}; // end task function
			} // end if
			
			return (task.asyncState as Function).apply(this, arguments);
		}

		// reusable temporary objects
		private static tempRectangle:Rectangle = new Rectangle();
		private static tempBounds:Bounds2D = new Bounds2D();
		private static tempMatrix:Matrix = new Matrix();
		private static tempPoint:Point = new Point();
		
		/**
		 * Draws an invisible background for text that will be illuminated with bitmap filters,
		 * but only if bitmapText.angle is divisible by 90 and the task is for probing.
		 */
		public static drawInvisibleHalo(bitmapText:BitmapText, task:IPlotTask):void
		{
			if (!(task instanceof PlotTask) || (task as PlotTask).taskType != PlotTask.TASK_TYPE_PROBE)
				return;
			
			if (!WeaveProperties.getProperties(this).enableBitmapFilters.value)
				return;
			
			if (bitmapText.angle % 90)
				return;
			
			bitmapText.getUnrotatedBounds(TextGlyphPlotter.tempBounds);
			if (bitmapText.angle % 360)
			{
				TextGlyphPlotter.tempMatrix.identity();
				TextGlyphPlotter.tempMatrix.translate(-bitmapText.x, -bitmapText.y);
				TextGlyphPlotter.tempMatrix.rotate(bitmapText.angle * Math.PI / 180);
				TextGlyphPlotter.tempMatrix.translate(bitmapText.x, bitmapText.y);
				TextGlyphPlotter.tempBounds.getMinPoint(TextGlyphPlotter.tempPoint);
				TextGlyphPlotter.tempBounds.setMinPoint(TextGlyphPlotter.tempMatrix.transformPoint(TextGlyphPlotter.tempPoint));
				TextGlyphPlotter.tempBounds.getMaxPoint(TextGlyphPlotter.tempPoint);
				TextGlyphPlotter.tempBounds.setMaxPoint(TextGlyphPlotter.tempMatrix.transformPoint(TextGlyphPlotter.tempPoint));
			}
			
			TextGlyphPlotter.tempBounds.getRectangle(TextGlyphPlotter.tempRectangle);
			// HACK -- check a pixel to decide how to draw the rectangular halo
			TextGlyphPlotter.tempBounds.getCenterPoint(TextGlyphPlotter.tempPoint);
			var pixel:uint = task.buffer.getPixel(TextGlyphPlotter.tempPoint.x, TextGlyphPlotter.tempPoint.y);
			var haloColor:uint = 0x20000000 | WeaveProperties.getProperties(this).probeInnerGlow.color.value;
			// Check all the pixels and only set the ones that aren't set yet.
			var pixels:uint[] = task.buffer.getVector(TextGlyphPlotter.tempRectangle);
			for (var p:int = 0; p < pixels.length; p++)
			{
				pixel = pixels[p] as uint;
				if (!pixel)
					pixels[p] = haloColor;
			}
			task.buffer.setVector(TextGlyphPlotter.tempRectangle, pixels);
			
			//buffer.fillRect(tempRectangle, 0x02808080); // alpha 0.008, invisible
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, TextGlyphPlotter, "Labels");
}

