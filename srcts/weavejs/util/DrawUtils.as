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

namespace weavejs.util
{
	import Graphics = PIXI.Graphics;
	import Point = weavejs.geom.Point;
	
	/**
	 * A set of static functions for drawing to Graphics objects.
	 */
	export class DrawUtils
	{
		/**
		 * Clears the line style for a Graphics object with optimal performance.
		 */
		public static clearLineStyle(graphics:Graphics):void
		{
			// LineScaleMode.NONE is important for performance.
			graphics.lineStyle(1, 0, 0); // thickness=1, alpha=0
		}
		
		/**
		 * Similar to lineTo() and curveTo(), this will draw an arc on a Graphics object.
		 * @param graphics The Graphics where the arc will be drawn
		 * @param continueLine If this is true, lineTo() will be used on the first coordinate instead of moveTo()
		 * @param xCenter The x center coord of the arc
		 * @param yCenter The y center coord of the arc
		 * @param startAngle The angle where the arc starts
		 * @param endAngle The angle where the arc ends
		 * @param radius The radius of the circle that contains the arc
		 * @param yRadius Optional y radius for an elliptical arc instead of a circular one
		 * @param outputStartCoords A Point object used to output the starting coordinates of the arc.
		 * @author adufilie
		 */		
		public static arcTo(graphics:Graphics, continueLine:Boolean, xCenter:number, yCenter:number, startAngle:number, endAngle:number, radius:number, yRadius:number = NaN, outputStartCoords:Point = null):void
		{
			if (isNaN(yRadius))
				yRadius = radius;
			
			// Calculate the span of each segment in radians based on a radius and a segmentLength.
			// argLength = arcSpan * radius
			// numSegs = arcLength / segLength
			// segSpan = arcSpan / numSegs
			//         = arcSpan / (arcLength / segLength)
			//         = arcSpan / (arcSpan * radius / segLength)
			//         = segLength / radius
			var maxRadius:number = Math.max(Math.abs(radius), Math.abs(yRadius));
			var segmentLength:number = 4; // pixels
			var segmentSpan:number = segmentLength / maxRadius; // radians
			segmentSpan = Math.min(Math.PI / 4, segmentSpan); // maximum 45 degrees per segment
			// make sure we iterate in the right direction
			if (startAngle > endAngle)
				segmentSpan = -segmentSpan;
			// draw the segments
			var segmentCount:number = Math.ceil((endAngle - startAngle) / segmentSpan);
			for (var i:number = 0; i <= segmentCount; i++)
			{
				// make sure last coord is at specified endAngle
				if (i == segmentCount)
					startAngle = endAngle;
				
				var x:number = xCenter + Math.cos(startAngle) * radius;
				var y:number = yCenter + Math.sin(startAngle) * yRadius;
				if (i == 0 && outputStartCoords)
				{
					outputStartCoords.x = x;
					outputStartCoords.y = y;
				}
				if (i == 0 && !continueLine)
					graphics.moveTo(x, y);
				else
					graphics.lineTo(x, y);
				
				// prepare for next iteration
				startAngle += segmentSpan;
			}
		}

		/**
		 * @param horizontalEndPoints When true, the curve starts and ends horizontal. When false, vertical.
		 * @param curveNormValue Values that produce nice curves range from 0 to 1, 0 being a straight line.
		 * @param continuingLine If true, the graphics cursor is assumed to be already at (startX,startY) and moveTo will not be used prior to drawing the curve.
		 */
		public static drawDoubleCurve(graphics:Graphics, startX:number, startY:number, endX:number, endY:number, horizontalEndPoints:Boolean, curveNormValue:number = 1, continuingLine:Boolean = false):void
		{
			if (!continuingLine)
				graphics.moveTo(startX, startY);
			
			var dx:number = (endX - startX);
			var dy:number = (endY - startY);
			var centerX:number = startX + dx / 2;
			var centerY:number = startY + dy / 2;
			if (horizontalEndPoints)
			{
				graphics.curveTo(startX + dx / 4 * curveNormValue, startY, centerX, centerY);
				graphics.curveTo(endX - dx / 4 * curveNormValue, endY, endX, endY);
			}
			else
			{
				graphics.curveTo(startX, startY + dy / 4 * curveNormValue, centerX, centerY);
				graphics.curveTo(endX, endY - dy / 4 * curveNormValue, endX, endY);
			}
		}
		
		public static drawCurvedLine(graphics:Graphics, startX:number, startY:number, endX:number, endY:number, curvature:number):void
		{
			graphics.moveTo(startX, startY);
			
			if(curvature == 0)
				graphics.lineTo(endX, endY);
			else
				graphics.curveTo(startX + (endX - startX)/2, startY + (1 - curvature)/2*(endY - startY), endX, endY);
		}
		
		/**
		 * Draws a dashed line using lineTo/moveTo with the current lineStyle of a Graphics object.
		 * @param graphics The Graphics object on which to draw.
		 * @param points A list of Point objects defining a polyline.
		 * @param dashedLengths A list of alternating segment and gap lengths.
		 */
		public static drawDashedLine(graphics:Graphics, points:Point[], dashedLengths:number[]):void
		{
			if (!graphics || !points || !dashedLengths || points.length == 0)
				return;
			
			var a:Point = new Point();
			var b:Point = new Point();
			var iPoint:number = 1;
			var iDash:number = 0;
			var dashLength:number = dashedLengths[0];
			
			a.x = points[0].x;
			a.y = points[0].y;
			graphics.moveTo(a.x, a.y);
			
			while (iPoint < points.length && isFinite(dashLength))
			{
				b.x = points[iPoint].x;
				b.y = points[iPoint].y;
				var segmentLength:number = Point.distance(a, b);
				
				if (!isFinite(segmentLength))
					break;
				
				var c:Point = Point.interpolate(b, a, Math.min(dashLength / segmentLength, 1));
				if (iDash % 2)
					graphics.moveTo(c.x, c.y);
				else
					graphics.lineTo(c.x, c.y);
				a = c;
				
				if (segmentLength <= dashLength) // segment ended
					++iPoint;
				
				if (segmentLength < dashLength) // segment ended before dash
					dashLength -= segmentLength; // partial dash progression
				else // dash ended
					dashLength = dashedLengths[++iDash % dashedLengths.length];
			}
		}
	}
}