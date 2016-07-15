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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;

	export class AnchorPoint implements ILinkableObject
	{
		public x:LinkableNumber = Weave.linkableChild(this,LinkableNumber,convertCoords);
		public y:LinkableNumber = Weave.linkableChild(this,LinkableNumber,convertCoords);
		
		public polarRadians:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
		public radius:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
		//public anchorColor:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public title:LinkableString = Weave.linkableChild(this, LinkableString);
		
		//metric used to calculate the class discrimiation for eg t-stat, p value, mean ratio etc
		export classDiscriminationMetric:LinkableNumber = Weave.linkableChild(this,LinkableNumber);
		
		//is the class to which an anchor belongs after the class discimination algorithm is done
		export classType:LinkableString = Weave.linkableChild(this, LinkableString);
		
		public constructor()
		{
		}
		
		private convertCoords():void
		{
			var xval:number = x.value; 
			var yval:number = y.value;
			
			radius.value = Math.sqrt(xval * xval + yval * yval);

			var pi:number = Math.PI;
			polarRadians.value = Math.atan2(yval,xval);
			if( polarRadians.value < 0 )
				polarRadians.value += 2 * pi;				
		}
	}
}
