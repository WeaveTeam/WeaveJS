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
	import Matrix = flash.geom.Matrix;
	import Point = weavejs.geom.Point;
	import Rectangle = weavejs.geom.Rectangle;
	import TextFormat = flash.text.TextFormat;
	
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
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	import ObjectPool = weavejs.util.ObjectPool;
	import PlotTask = weavejs.visualization.layers.PlotTask;
	
	export class TextGlyphPlotter extends AbstractGlyphPlotter implements ITextPlotter
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, TextGlyphPlotter, "Labels");
		
		public constructor()
		{
			hideOverlappingText.value = false;
			xScreenOffset.value = 0;
			yScreenOffset.value = 0;
			setColumnKeySources([sortColumn, text]);
		}
		
		private bitmapText:BitmapText = new BitmapText();
		private matrix:Matrix = new Matrix();

		public sortColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

		public text:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		public setDefaultTextFormat(ltf:LinkableTextFormat):void
		{
			font.defaultValue.value = ltf.font.value;
			size.defaultValue.value = ltf.size.value;
			color.defaultValue.value = ltf.color.value;
			bold.defaultValue.value = ltf.bold.value;
			italic.defaultValue.value = ltf.italic.value;
			underline.defaultValue.value = ltf.underline.value;
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
			if (!(task.asyncState is Function))
			{
				// these variables are used to save state between function calls
				const textWasDrawn:Array = [];
				const reusableBoundsObjects:Array = [];
				
				task.asyncState = function():number
				{
					var bounds:Bounds2D;
					
					if (task.iteration == 0)
					{
						// cleanup
						for each (bounds in reusableBoundsObjects)
							ObjectPool.returnObject(bounds);
						reusableBoundsObjects.length = 0; // important so we don't return the same bounds later
					}
					
					if (task.iteration < task.recordKeys.length)
					{
						var recordKey:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
						
						// project data coordinates to screen coordinates and draw graphics onto tempShape
						getCoordsFromRecordKey(recordKey, tempPoint);
						task.dataBounds.projectPointTo(tempPoint, task.screenBounds);
		
						// round to nearest pixel to get clearer text
						bitmapText.x = Math.round(tempPoint.x + xScreenOffset.value);
						bitmapText.y = Math.round(tempPoint.y + yScreenOffset.value);
						bitmapText.text = text.getValueFromKey(recordKey, String) as String;
						bitmapText.verticalAlign = vAlign.getValueFromKey(recordKey, String) as String;
						bitmapText.horizontalAlign = hAlign.getValueFromKey(recordKey, String) as String;
						bitmapText.angle = angle.getValueFromKey(recordKey, Number);
						bitmapText.maxWidth = maxWidth.value - xScreenOffset.value;
						
						// init text format			
						var f:TextFormat = bitmapText.textFormat;
						f.font = font.getValueFromKey(recordKey, String) as String;
						f.size = size.getValueFromKey(recordKey, Number);
						f.color = color.getValueFromKey(recordKey, Number);
						f.bold = StandardLib.asBoolean(bold.getValueFromKey(recordKey, Number));
						f.italic = StandardLib.asBoolean(italic.getValueFromKey(recordKey, Number));
						f.underline = StandardLib.asBoolean(underline.getValueFromKey(recordKey, Number));
		
						var shouldRender:Boolean = true;
						
						if (hideOverlappingText.value)
						{
							// grab a bounds object to store the screen size of the bitmap text
							bounds = reusableBoundsObjects[task.iteration] = ObjectPool.borrowObject(Bounds2D);
							bitmapText.getUnrotatedBounds(bounds);
							
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
							drawInvisibleHalo(bitmapText, task);
							
							bitmapText.draw(task.buffer);
						}
						
						return task.iteration / task.recordKeys.length;
					}

					for each (bounds in reusableBoundsObjects)
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
			if (!(task is PlotTask) || (task as PlotTask).taskType != PlotTask.TASK_TYPE_PROBE)
				return;
			
			if (!Weave.properties.enableBitmapFilters.value)
				return;
			
			if (bitmapText.angle % 90)
				return;
			
			bitmapText.getUnrotatedBounds(tempBounds);
			if (bitmapText.angle % 360)
			{
				tempMatrix.identity();
				tempMatrix.translate(-bitmapText.x, -bitmapText.y);
				tempMatrix.rotate(bitmapText.angle * Math.PI / 180);
				tempMatrix.translate(bitmapText.x, bitmapText.y);
				tempBounds.getMinPoint(tempPoint);
				tempBounds.setMinPoint(tempMatrix.transformPoint(tempPoint));
				tempBounds.getMaxPoint(tempPoint);
				tempBounds.setMaxPoint(tempMatrix.transformPoint(tempPoint));
			}
			
			tempBounds.getRectangle(tempRectangle);
			// HACK -- check a pixel to decide how to draw the rectangular halo
			tempBounds.getCenterPoint(tempPoint);
			var pixel:uint = task.buffer.getPixel(tempPoint.x, tempPoint.y);
			var haloColor:uint = 0x20000000 | Weave.properties.probeInnerGlow.color.value;
			// Check all the pixels and only set the ones that aren't set yet.
			var pixels:Vector.<uint> = task.buffer.getVector(tempRectangle);
			for (var p:int = 0; p < pixels.length; p++)
			{
				pixel = pixels[p] as uint;
				if (!pixel)
					pixels[p] = haloColor;
			}
			task.buffer.setVector(tempRectangle, pixels);
			
			//buffer.fillRect(tempRectangle, 0x02808080); // alpha 0.008, invisible
		}
	}
}
