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

import * as React from "react";
import * as weavejs from "weavejs";
import {Graphics} from "pixi.js";
import Weave = weavejs.Weave;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;

export default class SolidFillStyle implements ILinkableObject
{
	/**
	 * Used to enable or disable fill patterns.
	 */
	public enable:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));

	/**
	 * These properties are used with a basic Graphics.setFill() function call.
	 */
	public color:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(NaN));
	public alpha:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(1.0));

	/**
	 * For use with ColumnUtils.getRecords()
	 */
	public get recordFormat()
	{
		return { 'color': this.color, 'alpha': this.alpha };
	}

	/**
	 * For use with ColumnUtils.getRecords()
	 */
	public get recordType()
	{
		return { 'color': Number, 'alpha': Number };
	}

	beginFillStyle(key:IQualifiedKey, graphics:Graphics)
	{
		var style = this.getStyle(key);
		graphics.beginFill(style.color, style.alpha);
	}

	public getStyle(key:IQualifiedKey):{ color:number, alpha:number }
	{
		return {
			'color': this.color.getValueFromKey(key, Number),
			'alpha': this.alpha.getValueFromKey(key, Number)
		};
	}
}

Weave.registerClass(SolidFillStyle, ["weavejs.plot.SolidFillStyle", "ExtendedFillStyle"]);
