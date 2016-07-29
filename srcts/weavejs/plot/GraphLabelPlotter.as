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
	
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IGraphAlgorithm = weavejs.api.graphs.IGraphAlgorithm;
	import IGraphNode = weavejs.api.graphs.IGraphNode;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import ObjectPool = weavejs.util.ObjectPool;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	/**
	 * A plotter for placing and rendering labels on the graph plotter.
	 * This is a separate plotter for probing.
	 */
	export class GraphLabelPlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			this.setSingleKeySource(this.nodesColumn);
			//nodesColumn.addImmediateCallback(this, setKeySource, [nodesColumn], true);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.labelColumn, this.nodesColumn, this.edgeSourceColumn, this.edgeTargetColumn, this.radius);
			//this.addSpatialDependencies(this.layoutAlgorithm);
		}

		public runCallbacks():void
		{
			this.spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			// TODO Figure out why fillRect alpha isn't working
			// don't let labels overlap nodes (might need a separate KDTree to handle this)
			// dynamically place labels
			
			if (typeof task.asyncState != 'function')
			{
				// these variables are used to save state between function calls
				var i:int;
				var textWasDrawn:Array = [];
				var reusableBoundsObjects:Bounds2D[] = [];
				var bounds:Bounds2D;
				var nodes:Array = [];
				
				task.asyncState = function():number
				{
					if (task.iteration < task.recordKeys.length)
					{
						var recordKey:IQualifiedKey = task.recordKeys[task.iteration];
						var node:IGraphNode = layoutAlgorithm.getNodeFromKey(recordKey);
						
						// project data coordinates to screen coordinates and draw graphics onto tempShape
						tempDataPoint.x = node.position.x;
						tempDataPoint.y = node.position.y;
						task.dataBounds.projectPointTo(tempDataPoint, task.screenBounds);
		
						// round to nearest pixel to get clearer text
						bitmapText.x = Math.round(tempDataPoint.x);
						bitmapText.y = Math.round(tempDataPoint.y);
						bitmapText.text = labelColumn.getValueFromKey(recordKey, String) as string;
		
						LinkableTextFormat.defaultTextFormat.copyTo(bitmapText.textFormat);
						bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
						
						// grab a bounds object to store the screen size of the bitmap text
						bounds = reusableBoundsObjects[i] = ObjectPool.borrowObject(Bounds2D);
						bitmapText.getUnrotatedBounds(bounds);
						bounds.offset(radius.value, 0);
						bitmapText.x = bounds.getXMin();
						//					bitmapText.y = bounds.getYMin();
						
						// brute force check to see if this bounds overlaps with any previous bounds
						var overlaps:boolean = false;
						var j:int;
						for (j = 0; j < i; j++)
						{
							if (textWasDrawn[j] && bounds.overlaps(reusableBoundsObjects[j]))
							{
								overlaps = true;
								break;
							}
						}
		
						// The code below is _TOO_ _SLOW_ to be used. With 500 nodes, this function takes 250ms+
//						for (j = 0; j < nodes.length; ++j)
//						{
//							if (bounds.overlaps((nodes[j] as IGraphNode).bounds))
//							{
//								overlaps = true;
//								break;
//							}
//						}
						
						if (overlaps)
						{
							textWasDrawn[task.iteration] = false;
						}
						else
						{
							textWasDrawn[task.iteration] = true;
							
							if (bitmapText.angle == 0)
							{
								// draw almost-invisible rectangle behind text
								bitmapText.getUnrotatedBounds(tempBounds);
								tempBounds.getRectangle(tempRectangle);
								task.buffer.fillRect(tempRectangle, 0x02808080);
							}
							
							bitmapText.draw(task.buffer);
						}
						
						return task.iteration / task.recordKeys.length;
					}
					return 1; // avoids divide-by-zero when there are no record keys
				}; // end task function
			} // end if
			
			return (task.asyncState as Function).apply(this, arguments);
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			var bounds:Bounds2D = output[0];
			
			if (!this.layoutAlgorithm)
				return;
			
			var node:IGraphNode = this.layoutAlgorithm.getNodeFromKey(recordKey);
			if (node)
				bounds.includePoint(node.position);
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			if (this.layoutAlgorithm)
				this.layoutAlgorithm.getOutputBounds(this.filteredKeySet.keys, output);
			else
				output.reset();
		}				
		
		private handleColumnsChange():void
		{
//			(layoutAlgorithm as IGraphAlgorithm).setupData(nodesColumn, edgeSourceColumn, edgeTargetColumn);
		}
		
		// the styles
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);

//		public sizeColumn:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn());
		public labelColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public nodesColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public edgeSourceColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public edgeTargetColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public radius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2)); // radius of the circles

		public layoutAlgorithm:IGraphAlgorithm = null;
		//public layoutAlgorithm:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(IGraphAlgorithm), handleColumnsChange);
		public currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString());

		private tempRectangle:Rectangle = new Rectangle();
		private tempDataPoint:Point = new Point(); // reusable object
		private bitmapText:BitmapText = new BitmapText();
		private tempBounds:Bounds2D = new Bounds2D(); // reusable object
	}
}
