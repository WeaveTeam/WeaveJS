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
	import CSSProperties = React.CSSProperties;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import ILinkableObject = weavejs.api.core.ILinkableObject;

	/**
	 * Contains a list of properties for use with a TextFormat object.
	 */
	export class LinkableTextFormat implements ILinkableObject
	{
		public static defaultTextFormat:LinkableTextFormat = new LinkableTextFormat();

		public static DEFAULT_COLOR:number = 0x000000;
		public static DEFAULT_SIZE:number = 11;
		public static DEFAULT_FONT:string = "sans";
		
		public font:LinkableString = Weave.linkableChild(this, new LinkableString(LinkableTextFormat.DEFAULT_FONT, function(value:string):boolean{ return value ? true : false; }));
		public size:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(LinkableTextFormat.DEFAULT_SIZE, function(value:number):boolean{ return value > 2; }));
		public color:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(LinkableTextFormat.DEFAULT_COLOR, isFinite));
		public bold:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public italic:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public underline:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public getStyle():CSSProperties
		{
			return {
				fontFamily: this.font.value,
				fontSize: this.size.value,
				color: this.color.value,
				fontWeight: this.bold.value ? "bold" : "normal",
				fontStyle: this.italic.value ? "italic" : "normal",
				textDecoration: this.underline.value ? "underline" : "none"
			};
		}
	}
}

