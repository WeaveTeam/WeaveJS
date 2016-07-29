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

	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IGraphAlgorithm = weavejs.api.graphs.IGraphAlgorithm;
	import IGraphNode = weavejs.api.graphs.IGraphNode;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ForceDirectedLayout = weavejs.graphs.ForceDirectedLayout;
	import GridForceDirectedLayout = weavejs.graphs.GridForceDirectedLayout;
	import KamadaKawaiLayout = weavejs.graphs.KamadaKawaiLayout;
	import LargeGraphLayout = weavejs.graphs.LargeGraphLayout;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;

	/**
	 * This is a plotter for a node edge chart, commonly referred to as a graph.
	 */
	export class GraphPlotter extends AbstractPlotter
	{
		public constructor()
		{
			this.lineStyle.color.internalDynamicColumn.requestLocalObjectCopy(WeaveProperties.defaultColorColumn);
			this.lineStyle.weight.defaultValue.state = 1.5;

			this.fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.setSingleKeySource(this.nodesColumn);

			this.layoutAlgorithm.requestLocalObject(ForceDirectedLayout, true);
			this.addSpatialDependencies(this.layoutAlgorithm);

			this.init();
		}
	
		/**
		 * Initialize the algorithms array.
		 */
		public init():void
		{
			this.algorithms[GraphPlotter.FORCE_DIRECTED] = ForceDirectedLayout;
			this.algorithms[GraphPlotter.GRID_FORCE_DIRECTED] = GridForceDirectedLayout;
			this.algorithms[GraphPlotter.LARGE_GRAPH_LAYOUT] = LargeGraphLayout;
			this.algorithms[GraphPlotter.KAMADA_KAWAI] = KamadaKawaiLayout;
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).initRService(Weave.properties.rServiceURL.value);
		}

		/**
		 * Recompute the positions of the nodes in the graph and then draw the plot.
		 */
		public recomputePositions():void
		{ 
			this.resetAllNodes();
			this._iterations = 0;
			this.continueComputation(null);
		}
		
		/**
		 * Offset the x and y positions of the nodes with the corresponding keys in keys. 
		 */		
		public updateDraggedKeys(keys:IQualifiedKey[], dx:number, dy:number, runSpatialCallbacks:boolean = true):void
		{
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).updateDraggedKeys(keys, dx, dy, runSpatialCallbacks);
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).getOutputBounds(null, this.tempBounds);
			if (runSpatialCallbacks)
				this.spatialCallbacks.triggerCallbacks();
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * Scale the positions of the nodes specified by <code>keys</code> by a factor of <code>scaleFactor</code>.
		 * @param keys The keys to scale.
		 * @param scaleFactor The scaling factor used for the spread.
		 */		
		public scaleNodes(keys:Array, scaleFactor:number = 2):void
		{
			var nodes:Array = [];
			var key:IQualifiedKey;
			var node:IGraphNode;
			var xCenter:number = 0;
			var yCenter:number = 0;
			// get the running sum of the node positions
			for (key of keys || [])
			{
				node = (this.layoutAlgorithm.internalObject as IGraphAlgorithm).getNodeFromKey(key);
				if (!node)
					continue;
				nodes.push(node);
				xCenter += node.position.x;
				yCenter += node.position.y;
			}
			// divide by the number of nodes
			xCenter /= nodes.length;
			yCenter /= nodes.length;
			
			// xCenter and yCenter are now the center of the node cluster
			// for each node, set its new position
			for (node of nodes)
			{
				var currPos:Point = node.position;
				var nextPos:Point = node.nextPosition;
				node.setNextPosition(
					scaleFactor * (currPos.x - xCenter) + xCenter, 
					scaleFactor * (currPos.y - yCenter) + yCenter
				);			
			}
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).updateOutputBounds();
			this.spatialCallbacks.triggerCallbacks();
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * Reset all the nodes the default circular position. 
		 */		
		public resetAllNodes():void
		{
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).resetAllNodes();
			this._iterations = 0;
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).getOutputBounds(null, this.tempBounds);
		}
//		/**
//		 * Set the keys to be drawn in the draggable layer.
//		 */
//		public setDraggableLayerKeys(keys:Array):void
//		{
//			_draggedKeysArray = keys.concat();
//			if (keys.length == 0)
//			{
//				_isDragging = false;
//				return;
//			}
//			
//			_isDragging = true;
//			
//			_draggedKeysLookup = new Map();
//			// for each key, add the immediate neighbor to _draggedKeys
//			for each (var key:IQualifiedKey in keys)
//			{
//				_draggedKeysLookup[key] = key;
//				var node:GraphNode = _keyToNode[key];
//				var connectedNodes:GraphNode[] = node.connections;
//				for each (var neighbor:GraphNode in connectedNodes)
//				{
//					var neighborKey:IQualifiedKey = neighbor.key;
//					if (_draggedKeysLookup[neighborKey] == undefined)
//					{
//						_draggedKeysLookup[neighborKey] = neighborKey;
//						_draggedKeysArray.push(neighborKey);
//					}
//				}
//			}
//		}
		
		/**
		 * Continue the algorithm.
		 * 
		 * @param keys The keys whose positions should be computed.
		 */
		public continueComputation(keys:Array):void
		{
			if (!keys)
				keys = (this.nodesColumn).keys;
			
			this.algorithmRunning.value = true;
			if (!this.shouldStop.value)
			{
				(this.layoutAlgorithm.internalObject as IGraphAlgorithm).getOutputBounds(keys, this.tempBounds);
				(this.layoutAlgorithm.internalObject as IGraphAlgorithm).incrementLayout(keys, this.tempBounds);
			}
			this.shouldStop.value = false;
			this.algorithmRunning.value = false;
		}
		
		/**
		 * Verify the algorithm string is correct and use the corresponding function.
		 */
		private changeAlgorithm():void
		{
			var newAlgorithm:Class = this.algorithms[this.currentAlgorithm.value];
			if (newAlgorithm == null)
				return;
			
			this.layoutAlgorithm.requestLocalObject(newAlgorithm, true);
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).initRService(Weave.properties.rServiceURL.value);
			this.handleColumnsChange();
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).setupData(
				this.nodesColumn, 
				this.edgeSourceColumn, 
				this.edgeTargetColumn);
			this.spatialCallbacks.triggerCallbacks();
			Weave.getCallbacks(this).triggerCallbacks();
		}

		private changeStyle():void
		{
			return;
		}

		// the styles
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, new SolidLineStyle());
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, new SolidFillStyle());

		// the columns
		public get colorColumn():AlwaysDefinedColumn { return this.fillStyle.color; }

		public sizeColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public nodesColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public edgeSourceColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public edgeTargetColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(IAttributeColumn), this.handleColumnsChange);
		public labelColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn());
		public nodeRadiusColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn());
		public edgeThicknessColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn());
		public get edgeColorColumn():AlwaysDefinedColumn { return this.lineStyle.color; }
		
		// the edge styles
		public edgeStyles:Array = [ GraphPlotter.EDGE_GRADIENT, GraphPlotter.EDGE_ARROW, GraphPlotter.EDGE_WEDGE, GraphPlotter.EDGE_LINE ];
		public edgeStyle:LinkableString = Weave.linkableChild(this, new LinkableString(GraphPlotter.EDGE_LINE), this.changeStyle);
		private static EDGE_GRADIENT:string = "Gradient";
		private static EDGE_ARROW:string = "Arrow";
		private static EDGE_WEDGE:string = "Wedge";
		private static EDGE_LINE:string = "Line";

		// the algorithms
		
		public algorithms:Array = [ GraphPlotter.FORCE_DIRECTED, GraphPlotter.GRID_FORCE_DIRECTED, GraphPlotter.LARGE_GRAPH_LAYOUT, GraphPlotter.KAMADA_KAWAI ];
		public layoutAlgorithm:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(IGraphAlgorithm));
		public currentAlgorithm:LinkableString = Weave.linkableChild(this, new LinkableString(GraphPlotter.FORCE_DIRECTED), this.changeAlgorithm); // the algorithm
		private static FORCE_DIRECTED:string = "Force Directed";	
		private static LARGE_GRAPH_LAYOUT:string = "Large Graph Layout";
		private static GRID_FORCE_DIRECTED:string = "Grid Force Directed";
		private static KAMADA_KAWAI:string = "Kamada Kawai";

		// properties
		public radius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2)); // radius of the circles
		public shouldStop:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false)); // should the algorithm halt on the next iteration?
		public algorithmRunning:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false)); // is an algorithm running?
		public drawCurvedLines:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true)); // should we draw curved lines instead of a gradient?
		
		// dragged layer properties
//		private _draggedKeysLookup:Map = new Map();
//		private _draggedKeysArray:Array = []; 
//		public draggedLayerDrawn:boolean = false;
//		private _isDragging:boolean = false;
		private RECORD_INDEX:string = "recordIndex";
		private NEIGHBORS:string = "neighborKeys";
		private FINISHED:string = "finishedKeys";
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			
			if (task.iteration == 0) // Initialize if we're on our first pass.
			{
				if (task.recordKeys.length == 0) return 1;
				task.asyncState[this.RECORD_INDEX] = task.recordKeys.length - 1; 
				task.asyncState[this.NEIGHBORS] = (this.layoutAlgorithm.internalObject as IGraphAlgorithm).getNeighboringKeys(task.recordKeys);
				task.asyncState[this.FINISHED] = new Map();

			}
			
			var key:IQualifiedKey;
			var recordIndex:int = task.asyncState[this.RECORD_INDEX];
			var neighborKeys:Array = task.asyncState[this.NEIGHBORS];
			var finishedKeys:Map = task.asyncState[this.FINISHED];

			for (; recordIndex >= 0; recordIndex--)
			{
				key = task.recordKeys[recordIndex];

				var node:IGraphNode = (this.layoutAlgorithm.internalObject as IGraphAlgorithm).getNodeFromKey(key);
				if (!node) continue;

				var connections:IGraphNode[] = node.connections;
				for (var edgeIndex:int = connections.length - 1; edgeIndex >= 0; edgeIndex--)
				{
					var connectedNode:IGraphNode = connections[edgeIndex];
					if (connectedNode && !finishedKeys.hasOwnProperty(connectedNode.key))
					{
						this.drawEdge(node, connectedNode, task.dataBounds, task.screenBounds, task.buffer);
						// If there's a reverse connection, and the connectedNode in question isn't in the target keys, render it.
						if (connectedNode.hasConnection(node)) 
							this.drawEdge(connectedNode, node, task.dataBounds, task.screenBounds, task.buffer);
					}
				}

				this.drawNode(node, task.dataBounds, task.screenBounds, task.buffer);

				finishedKeys[node.key] = true;
				
				task.asyncState[this.RECORD_INDEX] = recordIndex;
				if (Date.now() > task.iterationStopTime) break;
			}

			recordIndex = task.asyncState[this.RECORD_INDEX];
			var progress:number = (1.0*recordIndex) / (1.0*task.recordKeys.length);
			return 1.0 - progress;
		}

		private drawNode(node:IGraphNode, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var nodeRadius:number = this.sizeColumn.getValueFromKey(node.key, Number);
			if (StandardLib.isUndefined(nodeRadius))
				nodeRadius = this.radius.value;
			tempShape.graphics.clear();
			this.lineStyle.beginLineStyle(node.key, tempShape.graphics);
			tempShape.graphics.beginFill(this.fillStyle.color.getValueFromKey(node.key, Number));
			
			this.screenPoint.x = node.position.x;
			this.screenPoint.y = node.position.y;
			dataBounds.projectPointTo(this.screenPoint, screenBounds);
			var xNode:number = this.screenPoint.x;
			var yNode:number = this.screenPoint.y;
			
			tempShape.graphics.drawCircle(xNode, yNode, nodeRadius);
			tempShape.graphics.endFill();
			destination.draw(tempShape, null, null, null, null, true);

			return;
		}

		private drawEdge(srcNode:IGraphNode, destNode:IGraphNode, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			

			this.screenPoint.x = srcNode.position.x;
			this.screenPoint.y = srcNode.position.y;
			dataBounds.projectPointTo(this.screenPoint, screenBounds);
			var xSrcNode:number = this.screenPoint.x;
			var ySrcNode:number = this.screenPoint.y;

			this.screenPoint.x = destNode.position.x;
			this.screenPoint.y = destNode.position.y;
			dataBounds.projectPointTo(this.screenPoint, screenBounds);
			var xDestNode:number = this.screenPoint.x;
			var yDestNode:number = this.screenPoint.y;
			

			this.edgesShape.graphics.clear();
			this.lineStyle.beginLineStyle(srcNode.key, this.edgesShape.graphics);	

			this.lineEdge(xSrcNode, ySrcNode, xDestNode, yDestNode, destNode.hasConnection(srcNode));

			destination.draw(this.edgesShape, null, null, null, null, true);

			return;
		}

		private lineEdge(srcX:number, srcY:number, destX:number, destY:number, isBidirectional:boolean):void /* Expects screen coords */
		{
			
			this.edgesShape.graphics.moveTo(srcX, srcY);

			if (!isBidirectional)
			{
				this.edgesShape.graphics.lineTo(destX, destY);
			}
			else
			{
				var xMid:number = (srcX + destX) / 2;
				var yMid:number = (srcY + destY) / 2;
				
				if (this.drawCurvedLines.value) // draw curved lines
				{
					var dx:number = srcX - destX;
					var dy:number = srcY - destY;
					var dx2:number = dx * dx;
					var dy2:number = dy * dy;
					var distance:number = Math.sqrt(dx2 + dy2);
					var radius2:number = 0.5 * distance;
					var anchorRadius:number = Math.max(5, Math.min(0.2 * radius2, 12));
					var angle:number = Math.atan2(dy, dx);	

					angle -= Math.PI / 2; // i forget why...
					xAnchor = xMid + anchorRadius * Math.cos(angle);
					yAnchor = yMid + anchorRadius * Math.sin(angle);
					var xAnchor:number;
					var yAnchor:number;
					this.edgesShape.graphics.curveTo(xAnchor, yAnchor, this.screenPoint.x, this.screenPoint.y);
				}
				else // otherwise draw halfway
				{
					this.edgesShape.graphics.lineTo(xMid, yMid);
				}
			}
		}



		

		public get alphaColumn():AlwaysDefinedColumn { return this.fillStyle.alpha; }
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param key The key of a data record.
		 * @param output An Array of Bounds2D objects to store the result in.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			var bounds:Bounds2D = output[0];
			var node:IGraphNode = (this.layoutAlgorithm.internalObject as IGraphAlgorithm).getNodeFromKey(recordKey);
			var keyPoint:Point;
			var edgePoint:Point;
			if (node)
			{
				keyPoint = node.position;
				bounds.includePoint( keyPoint );
			}
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param output A Bounds2D object to store the result in.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).getOutputBounds(null, output);
		}

		/**
		 * When the columns change, the columns need to be verified for valid input.
		 */		
		private handleColumnsChange():void
		{
			if (!this.nodesColumn.internalObject || !this.edgeSourceColumn.internalObject || !this.edgeTargetColumn.internalObject)
				return;
			// set the keys
			this.setSingleKeySource(this.nodesColumn);
			
			// if we don't have the required keys, do nothing
			if ((this.nodesColumn).keys.length == 0 || 
				(this.edgeSourceColumn).keys.length == 0 || 
				(this.edgeTargetColumn).keys.length == 0)
				return;
			if ((this.edgeSourceColumn).keys.length != (this.edgeTargetColumn).keys.length)
				return;
			
			// verify source and target column have same keytype
			var sourceKey:IQualifiedKey = (this.edgeSourceColumn).keys[0];
			var targetKey:IQualifiedKey = (this.edgeTargetColumn).keys[0];
			if (sourceKey.keyType != targetKey.keyType)
				return;
			
			// setup the lookups and objects
			(this.layoutAlgorithm.internalObject as IGraphAlgorithm).setupData(
				this.nodesColumn, 
				this.edgeSourceColumn, 
				this.edgeTargetColumn);

			this._iterations = 0;
			
			// if there isn't a specified color column or if the color column's keytype differs from node column, request default
			if (this.fillStyle.color.keys.length == 0 || (this.fillStyle.color.keys[0]).keyType != sourceKey.keyType)
				this.fillStyle.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
		}

		public resetIterations(newMaxValue:int):void
		{
			this._iterations = 0;
		}

		private _iterations:int = 0;
		private _maxColorValue:number;

		private screenPoint:Point = new Point(); // reusable object
		private tempBounds:Bounds2D = new Bounds2D(); // reusable object
	}
}
