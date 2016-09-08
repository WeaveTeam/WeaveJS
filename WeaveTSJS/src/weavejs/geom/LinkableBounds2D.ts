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
	import StandardLib = weavejs.util.StandardLib;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	
	/**
	 * This is a linkable version of a Bounds2D object.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.geom.LinkableBounds2D", interfaces: [ILinkableVariable, ICallbackCollection, IDisposableObject]})
	export class LinkableBounds2D extends LinkableVariable
	{
		public setBounds(xMin:number, yMin:number, xMax:number, yMax:number):void
		{
			LinkableBounds2D.tempBounds.setBounds(xMin, yMin, xMax, yMax);
			this.setSessionState(LinkableBounds2D.tempBounds);
		}
		private static /* readonly */ tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object
		
		public copyFrom(sourceBounds:Bounds2D):void
		{
			LinkableBounds2D.tempBounds.copyFrom(sourceBounds);
			this.setSessionState(LinkableBounds2D.tempBounds);
		}
		
		public copyTo(destinationBounds:Bounds2D):void
		{
			LinkableBounds2D.tempBounds.reset();
			this.detectChanges();
			if (this._sessionStateInternal && typeof this._sessionStateInternal == 'object')
			{
				LinkableBounds2D.tempBounds.xMin = StandardLib.asNumber(this._sessionStateInternal.xMin);
				LinkableBounds2D.tempBounds.yMin = StandardLib.asNumber(this._sessionStateInternal.yMin);
				LinkableBounds2D.tempBounds.xMax = StandardLib.asNumber(this._sessionStateInternal.xMax);
				LinkableBounds2D.tempBounds.yMax = StandardLib.asNumber(this._sessionStateInternal.yMax);
			}
			destinationBounds.copyFrom(LinkableBounds2D.tempBounds);
		}
	}
}
