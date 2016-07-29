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
	import Rectangle = weavejs.geom.Rectangle;
	import VEdge = weavejs.geom.net_ivank_voronoi.VEdge;
	import Voronoi = weavejs.geom.net_ivank_voronoi.Voronoi;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import CategoryBinningDefinition = weavejs.data.bin.CategoryBinningDefinition;
	import KeySet = weavejs.data.key.KeySet;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ColorRamp = weavejs.util.ColorRamp;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;

	export class AnchorPlotter extends AbstractPlotter implements ITextPlotter
	{
		public constructor()
		{
			super();
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // this causes a redraw when text format changes
			this.setSingleKeySource(this._keySet);
		}
		
		public setRadViz(radviz:RadVizPlotter | CompoundRadVizPlotter):void
		{
			if (this.radviz)
				throw new Error("RadViz plotter may only be set once.");
			this.radviz = radviz;
			Weave.linkableChild(this, this.radviz.fillStyle.color);
			this.addSpatialDependencies(this.radviz.anchors);
			this.radviz.anchors.childListCallbacks.addGroupedCallback(this, this.handleAnchorsChange, true);
			this.spatialCallbacks.triggerCallbacks();
		}
		private radviz:RadVizPlotter | CompoundRadVizPlotter;

		public labelAngleRatio:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, this.verifyLabelAngleRatio));
		
		private _keySet:KeySet = Weave.disposableChild(this, KeySet);
		private tempPoint:Point = new Point();
		private _bitmapText:BitmapText = new BitmapText();
		private coordinate:Point = new Point();//reusable object
		public enableWedgeColoring:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.fillColorMap);
		public colorMap:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired")), this.fillColorMap);
		public anchorColorMap:Map<string, number>;
		public wordWrap:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(200));
		
		
		public drawingClassLines:boolean = false;//this divides the circle into sectors which represent classes (number of sectors = number of classes)


		// anchorClasses key is String, value is array of AnchorPoint names
		public anchorClasses:Map<string, string[]> = null;//this tells us the classes to which dimensional anchors belong to

		public anchorThreshold:number;
		public doCDLayout:boolean = false;// this displays the tstat value with every dimensional anchor name (displayed only when CD layout is done)
		public doCDLayoutMetric:boolean = true; // ToDo yenfu whether display metric info
		
		private getClassFromAnchor(anchorName:string):string
		{
			for (var key of this.anchorClasses.keys())
			{
				var anchors = this.anchorClasses.get(key);
				if (anchors.indexOf(anchorName) >= 0)
					return key;
			}
			return null;
		}
		
		//Fill this hash map with bounds of every record key for efficient look up in getDataBoundsFromRecordKey
		private map_key_bounds:Map<IQualifiedKey, Bounds2D> = new Map();
		private _currentScreenBounds:Bounds2D = new Bounds2D();
		private _currentDataBounds:Bounds2D = new Bounds2D();
		
		public circleLineStyle:SolidLineStyle = Weave.linkableChild(this, new SolidLineStyle());
		public anchorLineStyle:SolidLineStyle = Weave.linkableChild(this, new SolidLineStyle());
		public anchorFillStyle:SolidFillStyle = Weave.linkableChild(this, new SolidFillStyle());
		public anchorRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		
		public unrestrictAnchors:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public showBarycenter:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public barycenterRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));
		public barycenterFillStyle:SolidFillStyle = Weave.linkableChild(this, new SolidFillStyle());
		public barycenterLineStyle:SolidLineStyle = Weave.linkableChild(this, new SolidLineStyle());
		
		public showVoronoi:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public showConvexHull:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public handleAnchorsChange():void
		{
			var keys = this.radviz.anchors.getNames(AnchorPoint);
			var keyArray = WeaveAPI.QKeyManager.getQKeys(AnchorPlotter.ANCHOR_KEYTYPE, keys);

			this._keySet.replaceKeys(keyArray);
			this.fillColorMap();
		}
		
		private static ANCHOR_KEYTYPE:string = 'dimensionAnchors';
		
		
		
		private fillColorMap():void
		{
			this.anchorColorMap = new Map();
			var _names = this.radviz.anchors.getNames(AnchorPoint);
			for (var i:int = 0; i < _names.length; i++)
				this.anchorColorMap.set(_names[i], this.colorMap.getColorFromNorm(i / (_names.length - 1))); 
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			this.drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			var x:number; 
			var y:number;
			
			var anchor:AnchorPoint;
			var radians:number;
			this.map_key_bounds = new Map();

			for (var key of recordKeys)
			{
				anchor = Weave.AS(this.radviz.anchors.getObject(key.localName), AnchorPoint);
				if (key.keyType != AnchorPlotter.ANCHOR_KEYTYPE || !anchor)
					continue;
				
				this.anchorLineStyle.beginLineStyle(null, graphics);
				this.anchorFillStyle.beginFillStyle(null, graphics);

				if (this.anchorThreshold)
				{
					if (anchor.classDiscriminationMetric.value < this.anchorThreshold)
						continue;
					
				}
				
				x = anchor.x.value;
				y = anchor.y.value;
				radians = anchor.polarRadians.value;
				var radius:number = anchor.radius.value;
				
				var cos:number = Math.cos(radians);
				var sin:number = Math.sin(radians);
				
				this.tempPoint.x = radius * cos;
				this.tempPoint.y = radius * sin;
				dataBounds.projectPointTo(this.tempPoint, screenBounds);
				
				// draw circle
				if (this.enableWedgeColoring.value)
				{
					graphics.beginFill(this.anchorColorMap.get(key.localName));
				}
				else if (this.doCDLayout)
				{
					//color the dimensional anchors according to the class they belong to
					var classStr:string = this.getClassFromAnchor(key.localName);
					var cc:ColorColumn = Weave.AS(this.radviz.fillStyle.color.getInternalColumn(), ColorColumn);
					var binColumn:BinnedColumn = Weave.AS(cc.getInternalColumn(), BinnedColumn);
					binColumn.binningDefinition.requestLocalObject(CategoryBinningDefinition, false);
					var binIndex:int = binColumn.getBinIndexFromDataValue(classStr);
					var color:number = cc.ramp.getColorFromNorm(binIndex / (binColumn.numberOfBins - 1));
					if (isFinite(color))
						graphics.beginFill(color);
				}
				graphics.drawCircle(this.tempPoint.x, this.tempPoint.y, this.anchorRadius.value);				
				graphics.endFill();
				
				
				
				this._bitmapText.trim = false;
				this._bitmapText.text = " " + anchor.title.value + " ";
				
				if (this.doCDLayout && this.doCDLayoutMetric)//displays the class discrimination metric used, either tstat or pvalue
					this._bitmapText.text = this._bitmapText.text + "\n"+ "  Metric : " + 
						Math.round(anchor.classDiscriminationMetric.value *100)/100 +"\n" + "  Class :" + anchor.classType.value;
				this._bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
				
				this._bitmapText.angle = screenBounds.getYDirection() * (radians * 180 / Math.PI);
				this._bitmapText.angle = (this._bitmapText.angle % 360 + 360) % 360;
				if (cos > -0.000001) // the label exactly at the bottom will have left align
				{
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
					// first get values between -90 and 90, then multiply by the ratio
					this._bitmapText.angle = ((this._bitmapText.angle + 90) % 360 - 90) * this.labelAngleRatio.value;
				}
				else
				{
					this._bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_RIGHT;
					// first get values between -90 and 90, then multiply by the ratio
					this._bitmapText.angle = (this._bitmapText.angle - 180) * this.labelAngleRatio.value;
				}
				
				LinkableTextFormat.defaultTextFormat.copyTo(this._bitmapText.textFormat);				
				this._bitmapText.x = this.tempPoint.x;
				this._bitmapText.y = this.tempPoint.y;
				this._bitmapText.maxWidth = this.wordWrap.value;
				
				// draw almost-invisible rectangle behind text
				/*_bitmapText.getUnrotatedBounds(_tempBounds);
				_tempBounds.getRectangle(_tempRectangle);				
				graphics.fillRect(_tempRectangle, 0x02808080);*/
				
				// draw bitmap text
				this._bitmapText.draw(graphics);
			}
			
			if (this.showBarycenter.value)
			{
				this.drawBarycenter(recordKeys, dataBounds, screenBounds, graphics);
			}
			if (this.showVoronoi.value)
			{
				this.drawVoronoi(recordKeys, dataBounds, screenBounds, graphics);
			}
			if (this.showConvexHull.value)
			{
				this.drawConvexHull(recordKeys, dataBounds, screenBounds, graphics);
			}
			
			this._currentScreenBounds.copyFrom(screenBounds);
			this._currentDataBounds.copyFrom(dataBounds);
		}
		
		
		/**
		 * This function draws the background graphics for this plotter, if applicable.
		 * An example background would be the origin lines of an axis.
		 * @param dataBounds The data coordinates that correspond to the given screenBounds.
		 * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
		 * @param destination The sprite to draw the graphics onto.
		 */
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			super.drawBackground(dataBounds, screenBounds, graphics);

			this.coordinate.x = -1;
			this.coordinate.y = -1;
			
			
			dataBounds.projectPointTo(this.coordinate, screenBounds);
			var x:number = this.coordinate.x;
			var y:number = this.coordinate.y;
			this.coordinate.x = 1;
			this.coordinate.y = 1;
			dataBounds.projectPointTo(this.coordinate, screenBounds);
			
			// draw RadViz circle
			if (this.unrestrictAnchors.value)
					return;

			try {
				this.circleLineStyle.beginLineStyle(null, graphics);
				graphics.drawEllipse(x, y, this.coordinate.x - x, this.coordinate.y - y);
			} catch (e) { }

			if (this.drawingClassLines)
			{
				this.drawClassLines(dataBounds, screenBounds, graphics);
			}
			
			this._currentScreenBounds.copyFrom(screenBounds);
			this._currentDataBounds.copyFrom(dataBounds);
		}
		
		public drawClassLines(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			var numOfClasses:int = 0;
			for ( var type in this.anchorClasses)
			{
				numOfClasses++;
			}
			
			var classTheta:number = (2 * Math.PI)/ numOfClasses;
			var classIncrementor:number = 0; 
			var centre:Point = new Point();
			centre.x = 0; centre.y = 0;
			dataBounds.projectPointTo(centre, screenBounds);//projecting the centre of the Radviz circle
			
			for (var cdClass in this.anchorClasses)
			{
				this._bitmapText.text = "";
				var previousClassAnchor:Point = new Point();
				var classLabelPoint:Point = new Point();
				var currentClassPos:number = classTheta * classIncrementor;
				previousClassAnchor.x = Math.cos(currentClassPos);
				previousClassAnchor.y = Math.sin(currentClassPos);
				dataBounds.projectPointTo(previousClassAnchor,screenBounds);
				
				var nextClassAnchor:Point = new Point();
				var nextClassPos:number = (classTheta - 0.02)  * (classIncrementor + 1);
				nextClassAnchor.x = Math.cos(nextClassPos);
				nextClassAnchor.y = Math.sin(nextClassPos);
				dataBounds.projectPointTo(nextClassAnchor, screenBounds);
				
				graphics.lineStyle(2, 0xb8860B, .4);
				//graphics.lineStyle(2,Math.random() * uint.MAX_VALUE);
				classIncrementor ++;
				graphics.moveTo(previousClassAnchor.x, previousClassAnchor.y);
				graphics.lineTo(centre.x, centre.y);
				//graphics.lineTo(nextClassAnchor.x, nextClassAnchor.y);
				
				//adding class labels TO DO find a way of displaying class labels using legend or labels
				/*var classLabelPosition:number = (classTheta/2)*classIncrementor;
				classLabelPoint.x = Math.cos(classLabelPosition);
				classLabelPoint.y = Math.sin(classLabelPosition);
				dataBounds.projectPointTo(classLabelPoint, screenBounds);
				
				_bitmapText.text = String(cdClass);
				_bitmapText.x = classLabelPoint.x;
				_bitmapText.y = classLabelPoint.y;
				
				_bitmapText.draw(destination);*/
			}
		}
		
		public drawBarycenter(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			var barycenter:Point = new Point();
			var counter:int = 0;
			var anchor:AnchorPoint;
			
			// don't draw anything if there are no anchors.
			if (!recordKeys || !recordKeys.length)
				return;
			
			for (var key of recordKeys)
			{
				anchor = Weave.AS(this.radviz.anchors.getObject(key.localName), AnchorPoint);
				if (key.keyType != AnchorPlotter.ANCHOR_KEYTYPE || !anchor)
					continue;
				
				barycenter.x += anchor.x.value;
				barycenter.y += anchor.y.value;
				counter++;
			}
			
			barycenter.x = barycenter.x / counter;
			barycenter.y = barycenter.y / counter;
			
			this.barycenterLineStyle.beginLineStyle(null, graphics);
			this.barycenterFillStyle.beginFillStyle(null, graphics);
			
			dataBounds.projectPointTo(barycenter, screenBounds);
			
			graphics.drawCircle(barycenter.x, barycenter.y, this.barycenterRadius.value);
			
			graphics.endFill();
		}
		
		public drawConvexHull(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			AnchorPlotter.static_drawConvexHull(this.radviz.anchors, this.circleLineStyle, recordKeys, dataBounds, screenBounds, graphics);
		}
		
		public static static_drawConvexHull(anchors:LinkableHashMap, lineStyle:SolidLineStyle, recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			var anchor1:AnchorPoint;
			var anchor2:AnchorPoint;
			var anchor:AnchorPoint;
			var _anchors:AnchorPoint[] = [];
			var index:int;
			var p1:Point = new Point();
			var p2:Point = new Point();
			
			if (recordKeys)
			{
				// convert the array of record keys into array of anchors
				for (index = 0; index < recordKeys.length; index++)
				{
					anchor = Weave.AS(anchors.getObject(recordKeys[index].localName), AnchorPoint);
					
					if (recordKeys[index].keyType != AnchorPlotter.ANCHOR_KEYTYPE || !anchor)
						continue;
					
					_anchors.push(anchor);
				}
			}
			else
				_anchors = anchors.getObjects();
			
			// don't draw anything if no anchors
			if (_anchors.length == 0)
				return;
			
			// sort by polar angle
			_anchors.sort(AnchorPlotter.anchorCompareFunctionByPolarAngle);
			
			// draw convex hull
			for (index = 0; index < _anchors.length - 1; index++)
			{
				anchor1 = _anchors[index];
				anchor2 = _anchors[index + 1];
				p1.x = anchor1.x.value; p1.y = anchor1.y.value;
				p2.x = anchor2.x.value;p2.y = anchor2.y.value;
				dataBounds.projectPointTo(p1, screenBounds);
				dataBounds.projectPointTo(p2, screenBounds);
				lineStyle.beginLineStyle(null, graphics);
				graphics.moveTo(p1.x, p1.y);
				graphics.lineTo(p2.x, p2.y);				
			}
			
			// draw the last connecting line between the last anchor and the first one.
			p1.x = _anchors[_anchors.length - 1].x.value; p1.y = _anchors[_anchors.length - 1].y.value;
			p2.x = _anchors[0].x.value; p2.y = _anchors[0].y.value;
			
			dataBounds.projectPointTo(p1, screenBounds);
			dataBounds.projectPointTo(p2, screenBounds);
			graphics.moveTo(p1.x, p1.y);
			graphics.lineTo(p2.x, p2.y);
			
			graphics.endFill();

		}

		private static anchorCompareFunctionByPolarAngle(a1:AnchorPoint, a2:AnchorPoint):number
		{
			if (a1.polarRadians.value < a2.polarRadians.value)
				return -1;
			else if (a1.polarRadians.value > a2.polarRadians.value)
				return 1;
			else
				return 0;
		}

		public drawVoronoi(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			// http://blog.ivank.net/voronoi-diagram-in-as3.html
			var i:int;
			var edges:VEdge[];
			var v:Voronoi = new Voronoi();
			var vertices:Point[] = [];
			
			var counter:int = 0;
			
			var barycenter:Point = new Point();
			
			var anchor:AnchorPoint;
			
			// don't draw anything if there are no anchors.
			if (!recordKeys || !recordKeys.length)
				return;
			
			for (var key of recordKeys)
			{
				anchor = Weave.AS(this.radviz.anchors.getObject(key.localName), AnchorPoint);
				if (key.keyType != AnchorPlotter.ANCHOR_KEYTYPE || !anchor)
					continue;
				
				barycenter.x += anchor.x.value;
				barycenter.y += anchor.y.value;
				var p:Point = new Point(anchor.x.value, anchor.y.value);
				dataBounds.projectPointTo(p, screenBounds);
				vertices.push(p);
				p.x += 0.0000001 * vertices.length;
				p.y += 0.0000001 * vertices.length;
				counter++;
			}
			
			barycenter.x = barycenter.x / counter;
			barycenter.y = barycenter.y / counter;
			dataBounds.projectPointTo(barycenter, screenBounds);
			
			vertices.push(barycenter);

			edges = v.GetEdges(vertices, screenBounds.getWidth(), screenBounds.getHeight());
			
			graphics.lineStyle(1, 0x888888);
			for (i = 0; i < edges.length; i++)
			{
			   graphics.moveTo(edges[i].start.x, edges[i].start.y);
			   graphics.lineTo(edges[i].end  .x, edges[i].end  .y);
			}
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			if (this.radviz.anchors)
			{
				var bounds:Bounds2D = this.initBoundsArray(output);
				var anchor:AnchorPoint = Weave.AS(this.radviz.anchors.getObject(recordKey.localName), AnchorPoint);
				if (anchor)
					bounds.includeCoords(anchor.x.value, anchor.y.value);
			}
			else
				this.initBoundsArray(output, 0);
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(-1, -1.1, 1, 1.1);
		}
		
		private verifyLabelAngleRatio(value:number):boolean
		{
			return 0 <= value && value <= 1;
		}
		
		private _tempBounds:Bounds2D = new Bounds2D();
		private _tempRectangle:Rectangle = new Rectangle();
		
		public rotatePoint(p:Point, o:Point, d:number):Point{
			
			var np:Point = new Point();
			p.x += (0 - o.x);
			p.y += (0 - o.y);
			np.x = (p.x * Math.cos(d)) - (p.y * Math.sin(d));
			np.y = Math.sin(d) * p.x + Math.cos(d) * p.y;
			np.x += (0 + o.x);
			np.y += (0 + o.y);
			
			return np;
			
		}
	}	
}
