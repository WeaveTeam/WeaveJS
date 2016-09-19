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

namespace weavejs.geom
{
	import Point = weavejs.geom.Point;

	/**
	 * Bounds2D provides a flexible interface to a Rectangle-like object.
	 * The bounds values are stored as xMin,yMin,xMax,yMax instead of x,y,width,height
	 * because information is lost when storing as width,height and it causes rounding
	 * errors when using includeBounds() and includePoint(), depending on the order you
	 * include multiple points.
	 * 
	 * @author adufilie
	 */
	export class Bounds2D
	{
		/**
		 * The default coordinates are all NaN so that includeCoords() will behave as expected after
		 * creating an empty Bounds2D.
		 * @param xMin The starting X coordinate.
		 * @param yMin The starting Y coordinate.
		 * @param xMax The ending X coordinate.
		 * @param yMax The ending Y coordinate.
		 */		
		constructor(xMin:number=NaN, yMin:number=NaN, xMax:number=NaN, yMax:number=NaN)
		{
			this.setBounds(xMin, yMin, xMax, yMax);
		}
		
		/**
		 * These are the values defining the bounds.
		 */
		public xMin:number;
		public yMin:number;
		public xMax:number;
		public yMax:number;
		
		public getXMin():number
		{
			return this.xMin;
		}
		public getYMin():number
		{
			return this.yMin;
		}
		public getXMax():number
		{
			return this.xMax;
		}
		public getYMax():number
		{
			return this.yMax;
		}
		public setXMin(value:number):void
		{
			this.xMin = value;
		}
		public setYMin(value:number):void
		{
			this.yMin = value;
		}
		public setXMax(value:number):void
		{
			this.xMax = value;
		}
		public setYMax(value:number):void
		{
			this.yMax = value;
		}
		
		/**
		 * This function copies the bounds from another Bounds2D object.
		 * @param A Bounds2D object to copy the bounds from.
		 */
		public copyFrom(other:Bounds2D):void
		{
			if (other == null)
			{
				this.reset();
				return;
			}
			this.xMin = other.xMin;
			this.yMin = other.yMin;
			this.xMax = other.xMax;
			this.yMax = other.yMax;
		}
		
		/**
		 * This function makes a copy of the Bounds2D object.
		 * @return An equivalent copy of this Bounds2D object.
		 */
		public cloneBounds():Bounds2D
		{
			return new Bounds2D(this.xMin, this.yMin, this.xMax, this.yMax);
		}

		/**
		 * For the x and y dimensions, this function swaps min and max values if min > max.
		 */
		public makeSizePositive():void
		{
			var temp:number;
			// make width positive
			if (this.xMin > this.xMax)
			{
				temp = this.xMin;
				this.xMin = this.xMax;
				this.xMax = temp;
			}
			// make height positive
			if (this.yMin > this.yMax)
			{
				temp = this.yMin;
				this.yMin = this.yMax;
				this.yMax = temp;
			}
		}
		
		/**
		 * This function resets all coordinates to NaN.
		 */
		public reset():void
		{
			this.xMin = NaN;
			this.yMin = NaN;
			this.xMax = NaN;
			this.yMax = NaN;
		}
		
		/**
		 * This function checks if any coordinates are undefined or infinite.
		 * @return true if any coordinate is not a finite number.
		 */
		public isUndefined():boolean
		{
			return !isFinite(this.xMin) || !isFinite(this.yMin) || !isFinite(this.xMax) || !isFinite(this.yMax);
		}
		
		/**
		 * This function checks if the Bounds2D is empty.
		 * @return true if the width or height is 0, or is undefined.
		 */
		public isEmpty():boolean
		{
			return this.xMin == this.xMax
				|| this.yMin == this.yMax
				|| this.isUndefined();
		}
		
		/**
		 * This function compares the Bounds2D with another Bounds2D.
		 * @param other Another Bounds2D to compare to
		 * @return true if given Bounds2D is equivalent, even if values are undefined
		 */
		public equals(other:Bounds2D):boolean
		{
			if (other == null)
				return this.isUndefined();
			return (this.xMin == other.xMin || (isNaN(this.xMin) && isNaN(other.xMin)))
				&& (this.yMin == other.yMin || (isNaN(this.yMin) && isNaN(other.yMin)))
				&& (this.xMax == other.xMax || (isNaN(this.xMax) && isNaN(other.xMax)))
				&& (this.yMax == other.yMax || (isNaN(this.yMax) && isNaN(other.yMax)));
		}
		
		/**
		 * This function sets the four coordinates that define the bounds.
		 * @param xMin The new xMin value.
		 * @param yMin The new yMin value.
		 * @param xMax The new xMax value.
		 * @param yMax The new yMax value.
		 */
		public setBounds(xMin:number, yMin:number, xMax:number, yMax:number):void
		{
			// allow any values for fastest performance
			this.xMin = xMin;
			this.yMin = yMin;
			this.xMax = xMax;
			this.yMax = yMax;
		}
		
		/**
		 * @param xMin_yMin_xMax_yMax An Array of four Numbers like [xMin, yMin, xMax, yMax]
		 */
		public setCoords(xMin_yMin_xMax_yMax:[number, number, number, number]):void
		{
			this.xMin = xMin_yMin_xMax_yMax[0];
			this.yMin = xMin_yMin_xMax_yMax[1];
			this.xMax = xMin_yMin_xMax_yMax[2];
			this.yMax = xMin_yMin_xMax_yMax[3];
		}
		
		/**
		 * @return [xMin, yMin, xMax, yMax]
		 */
		public getCoords():[number, number, number, number]
		{
			return [this.xMin, this.yMin, this.xMax, this.yMax];
		}

		/**
		 * This function sets the bounds coordinates using x, y, width and height values.
		 * @param x The new xMin value.
		 * @param y The new yMin value.
		 * @param width The new width of the bounds.
		 * @param height The new height of the bounds.
		 */
		public setRectangle(x:number, y:number, width:number, height:number):void
		{
			// allow any values for fastest performance
			this.xMin = x;
			this.yMin = y;
			this.xMax = x + width;
			this.yMax = y + height;
		}
		
		/**
		 * This function copies the values from this Bounds2D object into a Rectangle object.
		 * @param output A Rectangle to store the result in.
		 * @param makeSizePositive If true, this will give the Rectangle positive width/height values.
		 * @return Either the given output Rectangle, or a new Rectangle if none was specified.
		 */
		public getRectangle(output:Rectangle = null, makeSizePositive:boolean = true):Rectangle
		{
			if (output == null)
				output = new Rectangle();
			if (makeSizePositive)
			{
				output.x = this.getXNumericMin();
				output.y = this.getYNumericMin();
				output.width = this.getXCoverage();
				output.height = this.getYCoverage();
			}
			else
			{
				output.x = this.xMin;
				output.y = this.yMin;
				output.width = this.getWidth();
				output.height = this.getHeight();
			}
			return output;
		}
		
//		/**
//		 * This will apply transformations to an existing Matrix for projecting coordinates from this bounds to another.
//		 * @param destinationBounds The destination bounds used to calculate the transformation.
//		 * @param outputMatrix The Matrix used to store the transformation.
//		 * @param startWithIdentity If this is true, then outputMatrix.identity() will be applied first.
//		 */
//		public transformMatrix(destinationBounds:Bounds2D, outputMatrix:Matrix, startWithIdentity:boolean):void
//		{
//			if (startWithIdentity)
//				outputMatrix.identity();
//			outputMatrix.translate(-xMin, -yMin);
//			outputMatrix.scale(
//				destinationBounds.getWidth() / getWidth(),
//				destinationBounds.getHeight() / getHeight()
//			);
//			outputMatrix.translate(destinationBounds.getXMin(), destinationBounds.getYMin());
//		}

		/**
		 * This function will expand this Bounds2D to include a point.
		 * @param newPoint A point to include in this Bounds2D.
		 */
		public includePoint(newPoint:Point):void
		{
			this.includeCoords(newPoint.x, newPoint.y);
		}

		/**
		 * This function will expand this Bounds2D to include a point.
		 * @param newX The X coordinate of a point to include in this Bounds2D.
		 * @param newY The Y coordinate of a point to include in this Bounds2D.
		 */
		public includeCoords(newX:number, newY:number):void
		{
			if (isFinite(newX))
			{
				// If x coordinates are undefined, define them now.
				if (isNaN(this.xMin))
				{
					if (isNaN(this.xMax))
						this.xMin = this.xMax = newX;
					else
						this.xMin = this.xMax;
				}
				else if (isNaN(this.xMax))
					this.xMax = this.xMin;
				// update min,max values for both positive and negative width values
				if (this.xMin > this.xMax) // negative width
				{
					if (newX > this.xMin) this.xMin = newX; // xMin = Math.max(xMin, newX);
					if (newX < this.xMax) this.xMax = newX; // xMax = Math.min(xMax, newX);
				}
				else // positive width
				{
					if (newX < this.xMin) this.xMin = newX; // xMin = Math.min(xMin, newX);
					if (newX > this.xMax) this.xMax = newX; // xMax = Math.max(xMax, newX);
				}
			}
			if (isFinite(newY))
			{
				// If y coordinates are undefined, define them now.
				if (isNaN(this.yMin))
				{
					if (isNaN(this.yMax))
						this.yMin = this.yMax = newY;
					else
						this.yMin = this.yMax;
				}
				else if (isNaN(this.yMax))
					this.yMax = this.yMin;
				// update min,max values for both positive and negative height values
				if (this.yMin > this.yMax) // negative height
				{
					if (newY > this.yMin) this.yMin = newY; // yMin = Math.max(yMin, newY);
					if (newY < this.yMax) this.yMax = newY; // yMax = Math.min(yMax, newY);
				}
				else // positive height
				{
					if (newY < this.yMin) this.yMin = newY; // yMin = Math.min(yMin, newY);
					if (newY > this.yMax) this.yMax = newY; // yMax = Math.max(yMax, newY);
				}
			}
		}
		
		/**
		 * This function will expand this Bounds2D to include an X value.
		 * @param newX The X coordinate to include in this Bounds2D.
		 */
		public includeX(newX:number):void
		{
			this.includeCoords(newX, NaN);
		}
		
		/**
		 * This function will expand this Bounds2D to include a Y value.
		 * @param newY The Y coordinate to include in this Bounds2D.
		 */
		public includeY(newY:number):void
		{
			this.includeCoords(NaN, newY);
		}
		
		/**
		 * This function will expand this Bounds2D to include another Bounds2D.
		 * @param otherBounds Another Bounds2D object to include within this Bounds2D.
		 */
		public includeBounds(otherBounds:Bounds2D):void
		{
			this.includeCoords(otherBounds.xMin, otherBounds.yMin);
			this.includeCoords(otherBounds.xMax, otherBounds.yMax);
		}

		// re-usable temporary objects
		private static /* readonly */ staticBounds2D_A:Bounds2D = new Bounds2D();
		private static /* readonly */ staticBounds2D_B:Bounds2D = new Bounds2D();

		// this function supports comparisons of bounds with negative width/height
		public overlaps(other:Bounds2D, includeEdges:boolean = true):boolean
		{
			// load re-usable objects and make sizes positive to make it easier to compare
			var a:Bounds2D = Bounds2D.staticBounds2D_A;
			a.copyFrom(this);
			a.makeSizePositive();

			var b:Bounds2D = Bounds2D.staticBounds2D_B;
			b.copyFrom(other);
			b.makeSizePositive();

			// test for overlap
			if (includeEdges)
				return a.xMin <= b.xMax && b.xMin <= a.xMax
					&& a.yMin <= b.yMax && b.yMin <= a.yMax;
			else
				return a.xMin < b.xMax && b.xMin < a.xMax
					&& a.yMin < b.yMax && b.yMin < a.yMax;
		}


		/**
		 * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
		 * @param point A point to test.
		 * @return A value of true if the point is contained within this Bounds2D.
		 */
		public containsPoint(point:Point):boolean
		{
			return this.contains(point.x, point.y);
		}
		
		/**
		 * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
		 * @param x An X coordinate for a point.
		 * @param y A Y coordinate for a point.
		 * @return A value of true if the point is contained within this Bounds2D.
		 */
		public contains(x:number, y:number):boolean
		{
			if ( (this.xMin < this.xMax) ? (this.xMin <= x && x <= this.xMax) : (this.xMax <= x && x <= this.xMin) )
				if ( (this.yMin < this.yMax) ? (this.yMin <= y && y <= this.yMax) : (this.yMax <= y && y <= this.yMin) )
					return true;
			return false;
		}
		
		/**
		 * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
		 * @param other Another Bounds2D object to check.
		 * @return A value of true if the other Bounds2D is contained within this Bounds2D.
		 */
		public containsBounds(other:Bounds2D):boolean
		{
			return this.contains(other.xMin, other.yMin)
				&& this.contains(other.xMax, other.yMax);
		}
		
		/**
		 * This function is used to determine which vertices of a polygon can be skipped when rendering within the bounds of this Bounds2D.
		 * While iterating over vertices, test each one with this function.
		 * If (firstGridTest &amp; secondGridTest &amp; thirdGridTest) is non-zero, then the second vertex can be skipped.
		 * @param x The x-coordinate to test.
		 * @param y The y-coordinate to test.
		 * @return A value to be ANDed with other results of getGridTest().
		 */
		public getGridTest(x:number, y:number):uint
		{
			// Note: This function is optimized for speed
			
			// If three consecutive vertices all share one of (X_HI, X_LO, Y_HI, Y_LO) test results,
			// then the middle point can be skipped when rendering inside the bounds.
			
			var x0:number, x1:number, y0:number, y1:number;
			
			if (this.xMin < this.xMax)
				x0 = this.xMin, x1 = this.xMax;
			else
				x1 = this.xMin, x0 = this.xMax;
			
			if (this.yMin < this.yMax)
				y0 = this.yMin, y1 = this.yMax;
			else
				y1 = this.yMin, y0 = this.yMax;
			
			return (x < x0 ? 0x0001/*X_LO*/ : (x > x1 ? 0x0010/*X_HI*/ : 0))
				| (y < y0 ? 0x0100/*Y_LO*/ : (y > y1 ? 0x1000/*Y_HI*/ : 0));
		}
		
		/**
		 * This function projects the coordinates of a Point object from this bounds to a
		 * destination bounds. The specified point object will be modified to contain the result.
		 * @param point The Point object containing coordinates to project.
		 * @param toBounds The destination bounds.
		 */
		public projectPointTo(point:Point, toBounds:Bounds2D):void
		{
			// this function is optimized for speed
			var toXMin:number;
			var toXMax:number;
			var toYMin:number;
			var toYMax:number;
			toXMin = toBounds.xMin;
			toXMax = toBounds.xMax;
			toYMin = toBounds.yMin;
			toYMax = toBounds.yMax;
			
			var x:number = toXMin + (point.x - this.xMin) / (this.xMax - this.xMin) * (toXMax - toXMin);

			if (x <= Infinity) // alternative to !isNaN()
				point.x = x;
			else
				point.x = (toXMin + toXMax) / 2;

			var y:number = toYMin + (point.y - this.yMin) / (this.yMax - this.yMin) * (toYMax - toYMin);
			
			if (y <= Infinity) // alternative to !isNaN()
				point.y = y;
			else
				point.y = (toYMin + toYMax) / 2;
		}
		
		/**
		 * This function projects all four coordinates of a Bounds2D object from this bounds
		 * to a destination bounds. The specified coords object will be modified to contain the result.
		 * @param inputAndOutput A Bounds2D object containing coordinates to project.
		 * @param toBounds The destination bounds.
		 */		
		public projectCoordsTo(coords:Bounds2D, toBounds:Bounds2D):void
		{
			// project min coords
			coords.getMinPoint(Bounds2D.tempPoint);
			this.projectPointTo(Bounds2D.tempPoint, toBounds);
			coords.setMinPoint(Bounds2D.tempPoint);
			// project max coords
			coords.getMaxPoint(Bounds2D.tempPoint);
			this.projectPointTo(Bounds2D.tempPoint, toBounds);
			coords.setMaxPoint(Bounds2D.tempPoint);
		}

		/**
		 * This constrains a point to be within this Bounds2D. The specified point object will be modified to contain the result.
		 * @param point The point to constrain.
		 */
		public constrainPoint(point:Point):void
		{
			// find numerical min,max x values and constrain x coordinate
			if (!isNaN(this.xMin) && !isNaN(this.xMax)) // do not constrain point if bounds is undefined
				point.x = Math.max(Math.min(this.xMin, this.xMax), Math.min(point.x, Math.max(this.xMin, this.xMax)));
			
			// find numerical min,max y values and constrain y coordinate
			if (!isNaN(this.yMin) && !isNaN(this.yMax)) // do not constrain point if bounds is undefined
				point.y = Math.max(Math.min(this.yMin, this.yMax), Math.min(point.y, Math.max(this.yMin, this.yMax)));
		}

		// reusable temporary objects
		private static /* readonly */ tempPoint:Point = new Point();
		private static /* reaonly */ staticRange_A:NumericRange = new NumericRange();
		private static /* readonly */ staticRange_B:NumericRange = new NumericRange();
		
		/**
		 * This constrains the center point of another Bounds2D to be overlapping the center of this Bounds2D.
		 * The specified boundsToConstrain object will be modified to contain the result.
		 * @param boundsToConstrain The Bounds2D objects to constrain.
		 */
		public constrainBoundsCenterPoint(boundsToConstrain:Bounds2D):void
		{
			if (this.isUndefined())
				return;
			// find the point in the boundsToConstrain closest to the center point of this bounds
			// then offset the boundsToConstrain so it overlaps the center point of this bounds
			boundsToConstrain.getCenterPoint(Bounds2D.tempPoint);
			this.constrainPoint(Bounds2D.tempPoint);
			boundsToConstrain.setCenterPoint(Bounds2D.tempPoint);
		}

		/**
		 * This function will reposition a bounds such that for the x and y dimensions of this
		 * bounds and another bounds, at least one bounds will completely contain the other bounds.
		 * The specified boundsToConstrain object will be modified to contain the result.
		 * @param boundsToConstrain the bounds we want to constrain to be within this bounds
		 * @param preserveSize if set to true, width,height of boundsToConstrain will remain the same
		 */
		public constrainBounds(boundsToConstrain:Bounds2D, preserveSize:boolean = true):void
		{
			if (preserveSize)
			{
				var b2c:Bounds2D = boundsToConstrain;
				// constrain x values
				Bounds2D.staticRange_A.setRange(this.xMin, this.xMax);
				Bounds2D.staticRange_B.setRange(b2c.xMin, b2c.xMax);
				Bounds2D.staticRange_A.constrainRange(Bounds2D.staticRange_B);
				boundsToConstrain.setXRange(Bounds2D.staticRange_B.begin, Bounds2D.staticRange_B.end);
				// constrain y values
				Bounds2D.staticRange_A.setRange(this.yMin, this.yMax);
				Bounds2D.staticRange_B.setRange(b2c.yMin, b2c.yMax);
				Bounds2D.staticRange_A.constrainRange(Bounds2D.staticRange_B);
				boundsToConstrain.setYRange(Bounds2D.staticRange_B.begin, Bounds2D.staticRange_B.end);
			}
			else
			{
				// constrain min point
				boundsToConstrain.getMinPoint(Bounds2D.tempPoint);
				this.constrainPoint(Bounds2D.tempPoint);
				boundsToConstrain.setMinPoint(Bounds2D.tempPoint);
				// constrain max point
				boundsToConstrain.getMaxPoint(Bounds2D.tempPoint);
				this.constrainPoint(Bounds2D.tempPoint);
				boundsToConstrain.setMaxPoint(Bounds2D.tempPoint);
			}
		}

		public offset(xOffset:number, yOffset:number):void
		{
			this.xMin += xOffset;
			this.xMax += xOffset;
			this.yMin += yOffset;
			this.yMax += yOffset;
		}
		
		public getXRange():[number, number]
		{
			return [this.xMin, this.xMax];
		}
		
		public getYRange():[number, number]
		{
			return [this.yMin, this.yMax];
		}

		public setXRange(xMin:number, xMax:number):void
		{
			this.xMin = xMin;
			this.xMax = xMax;
		}
		
		public setYRange(yMin:number, yMax:number):void
		{
			this.yMin = yMin;
			this.yMax = yMax;
		}
		
		public setCenteredXRange(xCenter:number, width:number):void
		{
			this.xMin = xCenter - width / 2;
			this.xMax = xCenter + width / 2;
		}

		public setCenteredYRange(yCenter:number, height:number):void
		{
			this.yMin = yCenter - height / 2;
			this.yMax = yCenter + height / 2;
		}

		public setCenteredRectangle(xCenter:number, yCenter:number, width:number, height:number):void
		{
			this.setCenteredXRange(xCenter, width);
			this.setCenteredYRange(yCenter, height);
		}

		/**
		 * This function will set the width and height to the new values while keeping the
		 * center point constant.  This function works with both positive and negative values.
		 */
		public centeredResize(width:number, height:number):void
		{
			this.setCenteredXRange(this.getXCenter(), width);
			this.setCenteredYRange(this.getYCenter(), height);
		}

		public getXCenter():number
		{
			return (this.xMin + this.xMax) / 2;
		}
		public setXCenter(xCenter:number):void
		{
			if (isNaN(this.xMin) || isNaN(this.xMax))
				this.xMin = this.xMax = xCenter;
			else
			{
				var xShift:number = xCenter - (this.xMin + this.xMax) / 2;
				this.xMin += xShift;
				this.xMax += xShift;
			}
		}
		
		public getYCenter():number
		{
			return (this.yMin + this.yMax) / 2;
		}
		public setYCenter(yCenter:number):void
		{
			if (isNaN(this.yMin) || isNaN(this.yMax))
				this.yMin = this.yMax = yCenter;
			else
			{
				var yShift:number = yCenter - (this.yMin + this.yMax) / 2;
				this.yMin += yShift;
				this.yMax += yShift;
			}
		}
		
		/**
		 * This function stores the xCenter and yCenter coordinates into a Point object.
		 * @param value The Point object to store the xCenter and yCenter coordinates in.
		 */
		public getCenterPoint(output:Point):void
		{
			output.x = this.getXCenter();
			output.y = this.getYCenter();
		}
		
		/**
		 * This function will shift the bounds coordinates so that the xCenter and yCenter
		 * become the coordinates in a specified Point object.
		 * @param value The Point object containing the desired xCenter and yCenter coordinates.
		 */
		public setCenterPoint(value:Point):void
		{
			this.setXCenter(value.x);
			this.setYCenter(value.y);
		}
		
		/**
		 * This function will shift the bounds coordinates so that the xCenter and yCenter
		 * become the specified values.
		 * @param xCenter The desired value for xCenter.
		 * @param yCenter The desired value for yCenter.
		 */
		public setCenter(xCenter:number, yCenter:number):void
		{
			this.setXCenter(xCenter);
			this.setYCenter(yCenter);
		}
		
		/**
		 * This function stores the xMin and yMin coordinates in a Point object. 
		 * @param output The Point to store the xMin and yMin coordinates in.
		 */		
		public getMinPoint(output:Point):void
		{
			output.x = this.xMin;
			output.y = this.yMin;
		}
		/**
		 * This function sets the xMin and yMin values from a Point object. 
		 * @param value The Point containing new xMin and yMin coordinates.
		 */		
		public setMinPoint(value:Point):void
		{
			this.xMin = value.x;
			this.yMin = value.y;
		}

		/**
		 * This function stores the xMax and yMax coordinates in a Point object. 
		 * @param output The Point to store the xMax and yMax coordinates in.
		 */		
		public getMaxPoint(output:Point):void
		{
			output.x = this.xMax;
			output.y = this.yMax;
		}
		/**
		 * This function sets the xMax and yMax values from a Point object. 
		 * @param value The Point containing new xMax and yMax coordinates.
		 */		
		public setMaxPoint(value:Point):void
		{
			this.xMax = value.x;
			this.yMax = value.y;
		}
		
		/**
		 * This function sets the xMin and yMin values.
		 * @param x The new xMin coordinate.
		 * @param y The new yMin coordinate.
		 */		
		public setMinCoords(x:number, y:number):void
		{
			this.xMin = x;
			this.yMin = y;
		}
		/**
		 * This function sets the xMax and yMax values.
		 * @param x The new xMax coordinate.
		 * @param y The new yMax coordinate.
		 */		
		public setMaxCoords(x:number, y:number):void
		{
			this.xMax = x;
			this.yMax = y;
		}

		/**
		 * This is equivalent to ObjectUtil.numericCompare(xMax, xMin)
		 */		
		public getXDirection():number
		{
			if (this.xMin > this.xMax)
				return -1;
			if (this.xMin < this.xMax)
				return 1;
			return 0;
		}
		
		/**
		 * This is equivalent to ObjectUtil.numericCompare(yMax, yMin)
		 */		
		public getYDirection():number
		{
			if (this.yMin > this.yMax)
				return -1;
			if (this.yMin < this.yMax)
				return 1;
			return 0;
		}

		/**
		 * The width of the bounds is defined as xMax - xMin.
		 */		
		public getWidth():number
		{
			var _width:number = this.xMax - this.xMin;
			return isNaN(_width) ? 0 : _width;
		}
		
		/**
		 * The height of the bounds is defined as yMax - yMin.
		 */		
		public getHeight():number
		{
			var _height:number = this.yMax - this.yMin;
			return isNaN(_height) ? 0 : _height;
		}

		/**
		 * This function will set the width by adjusting the xMin and xMax values relative to xCenter.
		 * @param value The new width value.
		 */
		public setWidth(value:number):void
		{
			this.setCenteredXRange(this.getXCenter(), value);
		}
		/**
		 * This function will set the height by adjusting the yMin and yMax values relative to yCenter.
		 * @param value The new height value.
		 */
		public setHeight(value:number):void
		{
			this.setCenteredYRange(this.getYCenter(), value);
		}

		/**
		 * Area is defined as the absolute value of width * height.
		 * @return The area of the bounds.
		 */		
		public getArea():number
		{
			var area:number = (this.xMax - this.xMin) * (this.yMax - this.yMin);
			return (area < 0) ? -area : area; // Math.abs(area);
		}
		
		/**
		 * The xCoverage is defined as the absolute value of the width.
		 * @return The xCoverage of the bounds.
		 */
		public getXCoverage():number
		{
			return (this.xMin < this.xMax) ? (this.xMax - this.xMin) : (this.xMin - this.xMax); // Math.abs(xMax - xMin);
		}
		/**
		 * The yCoverage is defined as the absolute value of the height.
		 * @return The yCoverage of the bounds.
		 */
		public getYCoverage():number
		{
			return (this.yMin < this.yMax) ? (this.yMax - this.yMin) : (this.yMin - this.yMax); // Math.abs(yMax - yMin);
		}
		
		/**
		 * The xNumericMin is defined as the minimum of xMin and xMax.
		 * @return The numeric minimum x coordinate.
		 */
		public getXNumericMin():number
		{
			return this.xMax < this.xMin ? this.xMax : this.xMin; // if any are NaN, returns xMin
		}
		/**
		 * The yNumericMin is defined as the minimum of yMin and yMax.
		 * @return The numeric minimum y coordinate.
		 */
		public getYNumericMin():number
		{
			return this.yMax < this.yMin ? this.yMax : this.yMin; // if any are NaN, returns yMin
		}
		/**
		 * The xNumericMax is defined as the maximum of xMin and xMax.
		 * @return The numeric maximum x coordinate.
		 */
		public getXNumericMax():number
		{
			return this.xMax < this.xMin ? this.xMin : this.xMax; // if any are NaN, returns xMax
		}
		/**
		 * The xNumericMax is defined as the maximum of xMin and xMax.
		 * @return The numeric maximum y coordinate.
		 */
		public getYNumericMax():number
		{
			return this.yMax < this.yMin ? this.yMin : this.yMax; // if any are NaN, returns yMax
		}
		
		/**
		 * This function returns a String suitable for debugging the Bounds2D coordinates.
		 * @return A String containing the coordinates of the bounds.
		 */
		public toString():string
		{
			return "(xMin="+this.xMin+", "+"yMin="+this.yMin+", "+"xMax="+this.xMax+", "+"yMax="+this.yMax+")";
		}
	}
}
