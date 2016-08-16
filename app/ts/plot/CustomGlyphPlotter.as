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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableHashMap = weavejs.core.LinkableHashMap;

	export class CustomGlyphPlotter extends AbstractGlyphPlotter implements ITextPlotter
	{
		public constructor()
		{
			super();
			this.setColumnKeySources([this.dataX, this.dataY]);
			this.vars.childListCallbacks.addImmediateCallback(this, this.handleVarList);
			this.addSpatialDependencies(this.vars, this.function_getDataBoundsFromRecordKey, this.function_getBackgroundDataBounds);
		}
		private handleVarList():void
		{
			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = Weave.AS(this.vars.childListCallbacks.lastObjectAdded, IAttributeColumn);
			if (newColumn)
				Weave.linkableChild(this.vars, WeaveAPI.StatisticsCache.getColumnStatistics(newColumn));
		}
		
		/**
		 * This can hold any objects that should be stored in the session state.
		 */
		public vars:ILinkableHashMap = Weave.linkableChild(this, LinkableHashMap);
		public locals:Object = {};
		
		public function_drawPlot:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(CustomGlyphPlotter.script_drawPlot, false, ['keys','dataBounds','screenBounds','destination']));
		public static script_drawPlot:string = `
			// Parameter types: Array, Bounds2D, Bounds2D, BitmapData
			function(keys, dataBounds, screenBounds, destination)
			{
				import 'weave.data.AttributeColumns.DynamicColumn';
				import 'weave.utils.GraphicsBuffer';
			
				var getStats = WeaveAPI.StatisticsCache.getColumnStatistics;
				var colorColumn = vars.requestObject('color', DynamicColumn, false);
				var sizeColumn = vars.requestObject('size', DynamicColumn, false);
				var sizeStats = getStats(sizeColumn);
				var buffer = locals.buffer || (locals.buffer = new GraphicsBuffer());
				var key;
			
				colorColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
				buffer.destination(destination)
					.lineStyle(1, 0x000000, 0.5); // weight, color, alpha
			
				for (key of keys)
				{
					getCoordsFromRecordKey(key, tempPoint); // uses dataX,dataY
					// project x,y data coordinates to screen coordinates
					dataBounds.projectPointTo(tempPoint, screenBounds);
			
					if (isNaN(tempPoint.x) || isNaN(tempPoint.y))
						continue;
					
					var x = tempPoint.x, y = tempPoint.y;
					var size = 20 * sizeStats.getNorm(key);
					var color = colorColumn.getValueFromKey(key, Number);
					
					// draw graphics
					if (isFinite(color))
						buffer.beginFill(color, 1.0); // color, alpha
					if (isNaN(size))
					{
						size = 10;
						buffer.drawRect(x - size/2, y - size/2, size, size);
					}
					else
					{
						buffer.drawCircle(tempPoint.x, tempPoint.y, size);
					}
					buffer.endFill();
				}
				buffer.flush();
			}
		`;
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			try
			{
				// BIG HACK to work properly as a symbolPlotter in GeometryPlotter
				if (task.iteration <= task.recordKeys.length)
					return 0;
				
				this.function_drawPlot.call(this, task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			}
			catch (e)
			{
				console.error(e);
			}
			return 1;
		}
		
		public function_drawBackground:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(CustomGlyphPlotter.script_drawBackground, false, true, ['dataBounds', 'screenBounds', 'destination']));
		public static script_drawBackground:string = `
			// Parameter types: Bounds2D, Bounds2D, BitmapData
			function(dataBounds, screenBounds, destination)
			{
				/*
				import 'weave.utils.GraphicsBuffer';
			
				var graphicBuffer = new GraphicsBuffer(destination);
			
				// draw background graphics here
			
				graphicsBuffer.flush();
				*/
			}
		`;
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			try
			{
				this.function_drawBackground.apply(this, arguments);
			}
			catch (e)
			{
				console.error(e);
			}
		}
		
		public function_getDataBoundsFromRecordKey:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(CustomGlyphPlotter.script_getDataBoundsFromRecordKey, false, ['key', 'output']));
		public static script_getDataBoundsFromRecordKey:string = `
			// Parameter types: IQualifiedKey, Array
			function(key, output)
			{
				getCoordsFromRecordKey(key, tempPoint); // uses dataX,dataY
				
				var bounds = initBoundsArray(output);
				bounds.includePoint(tempPoint);
				if (isNaN(tempPoint.x))
					bounds.setXRange(-Infinity, Infinity);
				if (isNaN(tempPoint.y))
					bounds.setYRange(-Infinity, Infinity);
			}
		`;
		/*override*/ public getDataBoundsFromRecordKey(key:IQualifiedKey, output:Bounds2D[]):void
		{
			try
			{
				this.function_getDataBoundsFromRecordKey.apply(this, arguments);
			}
			catch (e)
			{
				console.error(e);
			}
		}
		
		public function_getBackgroundDataBounds:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(CustomGlyphPlotter.script_getBackgroundDataBounds, false, ['output']));
		public static script_getBackgroundDataBounds:string = `
			// Parameter type: Bounds2D
			function (output)
			{
				if (zoomToSubset.value)
				{
					output.reset();
				}
				else
				{
					var getStats = WeaveAPI.StatisticsCache.getColumnStatistics;
					var statsX = getStats(dataX);
					var statsY = getStats(dataY);
					
					output.setBounds(
						statsX.getMin(),
						statsY.getMin(),
						statsX.getMax(),
						statsY.getMax()
					);
				}
			}
		`;
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			try
			{
				this.function_getBackgroundDataBounds.apply(this, arguments);
			}
			catch (e)
			{
				console.error(e);
			}
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, CustomGlyphPlotter, "ActionScript glyphs");
}

