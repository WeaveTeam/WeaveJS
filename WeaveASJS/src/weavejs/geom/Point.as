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

package weavejs.geom
{
	public class Point
	{
		public function Point(x:Number = NaN, y:Number = NaN)
		{
			this.x = x;
			this.y = y;
		}
		public var x:Number;
		public var y:Number;

		public static function distance(p1:Point, p2:Point):Number
		{
			var dx:Number = p2.x - p1.x;
			var dy:Number = p2.y - p1.y;
			return Math.sqrt(dx * dx + dy * dy);
		}

		public static function interpolate(p1:Point, p2:Point, percentage:Number):Point
		{
			var dx:Number = p2.x - p1.x;
			var dy:Number = p2.y - p1.y;
			return new Point(p1.x + percentage * dx, p1.y + percentage * dy);
		}
	}
}
