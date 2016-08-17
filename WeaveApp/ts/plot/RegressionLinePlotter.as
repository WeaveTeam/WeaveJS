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
	
	import FaultEvent = mx.rpc.events.FaultEvent;
	import ResultEvent = mx.rpc.events.ResultEvent;
	
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import Bounds2D = weavejs.geom.Bounds2D;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Range = weavejs.primitives.Range;
	import WeaveRServlet = weavejs.services.WeaveRServlet;
	import addAsyncResponder = weavejs.services.addAsyncResponder;
	import LinearRegressionResult = weavejs.services.beans.LinearRegressionResult;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	
	export class RegressionLinePlotter extends AbstractPlotter implements IDisposableObject
	{
		public constructor()
		{
			Weave.properties.rServiceURL.addImmediateCallback(this, this.resetRService, true);
			this.spatialCallbacks.addImmediateCallback(this, this.resetRegressionLine );
			this.spatialCallbacks.addGroupedCallback(this, this.calculateRRegression );
			this.setColumnKeySources([this.xColumn, this.yColumn]);
			
			// hack to fix old session states
			this._filteredKeySet.addImmediateCallback(this, function():void {
				if (_filteredKeySet.keyFilter.internalObject == null)
					_filteredKeySet.keyFilter.targetPath = [WeaveProperties.DEFAULT_SUBSET_KEYFILTER];
			});
		}
		
		public drawLine:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public currentTrendline:LinkableString = Weave.linkableChild(this, new LinkableString(RegressionLinePlotter.LINEAR));
		public polynomialDegree:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		public xColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public yColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		public static trendlines:Array = [RegressionLinePlotter.LINEAR, RegressionLinePlotter.POLYNOMIAL, RegressionLinePlotter.LOGARITHMIC, RegressionLinePlotter.EXPONENTIAL, RegressionLinePlotter.POWER];
		public static LINEAR:string = "Linear";
		public static POLYNOMIAL:string = "Polynomial";
		public static LOGARITHMIC:string = "Logarithmic";
		public static EXPONENTIAL:string = "Exponential";
		public static POWER:string = "Power";

		private rService:WeaveRServlet = null;
		
		private resetRService():void
		{
			this.rService = new WeaveRServlet(Weave.properties.rServiceURL.value);
		}
		
		private resetRegressionLine():void
		{
			this.result = null;
		}
		private calculateRRegression():void
		{
			if (this.drawLine.value)
			{
				var dataXY:Array = ColumnUtils.joinColumns([this.xColumn, this.yColumn], Number, false, this.filteredKeySet.keys);
				if (dataXY[1].length == 0)
					return;
				addAsyncResponder(
					this.rService.linearRegression(this.currentTrendline.value, dataXY[1], dataXY[2], this.polynomialDegree.value),
					this.handleLinearRegressionResult,
					this.handleLinearRegressionFault,
					++this.requestID
				);
			}
		}
		
		private requestID = 0; // ID of the latest request, used to ignore old results
		private result:LinearRegressionResult;
		
		private handleLinearRegressionResult(event:ResultEvent, token:Object=null):void
		{
			if (this.requestID != (token|0))
			{
				// ignore outdated results
				return;
			}
			
			this.result = new LinearRegressionResult(event.result);
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		private handleLinearRegressionFault(event:FaultEvent, token:Object = null):void
		{
			if (this.requestID != (token|0))
			{
				// ignore outdated results
				return;
			}
			
			this.result = null;
			console.error(event);
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		public get coefficients():Array
		{
			return this.result ? this.result.coefficients : null;
		}
		public get rSquared():number
		{
			return this.result ? this.result.rSquared : NaN;
		}
		
		private tempRange:Range = new Range();
		private tempPoint:Point = new Point();
		private tempPoint2:Point = new Point();

		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var g:Graphics = tempShape.graphics;
			g.clear();
			
			if (this.currentTrendline.value == RegressionLinePlotter.LINEAR)
			{
				if (this.coefficients)
				{
					this.tempPoint.x = dataBounds.getXMin();
					this.tempPoint2.x = dataBounds.getXMax();
					
					this.tempPoint.y = (this.coefficients[1] * this.tempPoint.x) + this.coefficients[0];
					this.tempPoint2.y = (this.coefficients[1] * this.tempPoint2.x) + this.coefficients[0];
					
					this.tempRange.setRange( dataBounds.getYMin(), dataBounds.getYMax() );
					
					// constrain yMin to be within y range and derive xMin from constrained yMin
					this.tempPoint.x = this.tempPoint.x + (this.tempRange.constrain(this.tempPoint.y) - this.tempPoint.y) / this.coefficients[1];
					this.tempPoint.y = this.tempRange.constrain(this.tempPoint.y);
					
					// constrain yMax to be within y range and derive xMax from constrained yMax
					this.tempPoint2.x = this.tempPoint.x + (this.tempRange.constrain(this.tempPoint2.y) - this.tempPoint.y) / this.coefficients[1];
					this.tempPoint2.y = this.tempRange.constrain(this.tempPoint2.y);
					
					dataBounds.projectPointTo(this.tempPoint,screenBounds);
					dataBounds.projectPointTo(this.tempPoint2,screenBounds);
					this.lineStyle.beginLineStyle(null,g);
					//g.lineStyle(lineThickness.value, lineColor.value,lineAlpha.value,true,LineScaleMode.NONE);
					g.moveTo(this.tempPoint.x,this.tempPoint.y);
					g.lineTo(this.tempPoint2.x,this.tempPoint2.y);
					
					destination.draw(tempShape);
				}
			}	
			else 
			{
				
				if (this.coefficients != null)
				{
					this.points = [];
					this.drawCommand = [];
					var previousPoint:Point = null;
					
					// Use dataBounds to determine how many points should be drawn
//					var flag:boolean = true;
//					 for (var x:int = dataBounds.getXMin(); x < dataBounds.getXMax(); x++)
//					 {
//						tempPoint.x = x;
//						
//						tempPoint.y = 
//						tempPoint.y = evalFunction(currentTrendline.value, coefficients, x);
//						if (isNaN(tempPoint.y))
//						{
//							// technically this is a problem
//						}
//						
//						dataBounds.projectPointTo(tempPoint, screenBounds);
//						points.push(tempPoint.x);
//						points.push(tempPoint.y);
//						
//						if (flag == true)
//						{
//							drawCommand.push(1);
//							flag = false;
//						}
//						else drawCommand.push(2);
//					}
					 
					// Use screenBounds to determine how many points should be drawn ==> Draw lines for every 3 pixels
					var numberOfPoint:number = Math.floor(screenBounds.getXCoverage() / 3);
					var increment:number = dataBounds.getXCoverage() / numberOfPoint;
					var flag:boolean = true;
					for (var x:number = dataBounds.getXMin(); x <= dataBounds.getXMax(); x = x + increment)
					{
						this.tempPoint.x = x;
						this.tempPoint.y = this.evalFunction(this.currentTrendline.value, this.coefficients, x);
						dataBounds.projectPointTo(this.tempPoint, screenBounds);
						this.points.push(this.tempPoint.x);
						this.points.push(this.tempPoint.y);
						
						if (flag == true)
						{
							this.drawCommand.push(1);
							flag = false;
						}
						else if (screenBounds.containsPoint(previousPoint) && screenBounds.containsPoint(this.tempPoint))
							this.drawCommand.push(2);
						else
							this.drawCommand.push(1);
						
						previousPoint = this.tempPoint.clone();
					}
					
					this.lineStyle.beginLineStyle(null,g);
					g.drawPath(this.drawCommand, this.points);					
					
					destination.draw(tempShape);
				}
			}
		}

		public dispose():void
		{
			this.requestID = 0; // forces all results from previous requests to be ignored
		}
		
		private points:number[] = null;
		private drawCommand:int[] = null;
		
		/**
		 *	This function evaluate the regression functions, given the type, the coefficients (a, b, c,..) and the value x.
		 * 	ax^n-1+bx^n-2+...
		 **/
		private evalFunction(type:string, coefficients:Array, xValue:number):number
		{
				
			var b:number = coefficients[0] || 0;
			var a:number = coefficients[1] || 0;
			
			if (type == RegressionLinePlotter.POLYNOMIAL) 
			{
				var result = 0;
				var degree = coefficients.length - 1;
				for (var i = 0; i <= degree; i++)
				{
					result += (coefficients[i] || 0) * Math.pow(xValue, i);
				}
				
				
				return result;
			}
			
			// For the other types, we know that coefficients only has 2 entries.
			
			// Model y = a*ln(x) + b
			// called with (y, ln(x))
			// => A = a, B = b			
			else if (type == RegressionLinePlotter.LOGARITHMIC) 
			{					
				return a*Math.log(xValue) + b;
			}
	
			// Model y = b*exp(a*x)
			// => ln(y) = ln(b) + a*x
			// called with (ln(y), x)
			// => A = a, B = ln(b)
			else if (type == RegressionLinePlotter.EXPONENTIAL) 
			{
				return Math.exp(b)*Math.exp(a*xValue);
			}
			
			// Model y = b*x^a
			// => ln(y) = ln(b) + a*ln(x)
			// called with (ln(y), a*ln(x)
			// => A = a, B = ln(b)
			else if (type == RegressionLinePlotter.POWER) 
			{
				return Math.exp(b) * Math.pow(xValue, a);	
			}
			else
			{
				return NaN;
			}
		}
	}
}

