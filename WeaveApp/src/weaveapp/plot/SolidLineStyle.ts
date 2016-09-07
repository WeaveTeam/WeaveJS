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

import ICallbackCollection = weavejs.api.core.ICallbackCollection;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import EquationColumnLib = weavejs.data.EquationColumnLib;

export default class SolidLineStyle implements ILinkableObject
{
	static WEAVE_INFO = Weave.setClassInfo(SolidLineStyle, {
		id: "weavejs.plot.SolidLineStyle",
		deprecatedIds: ["ExtendedLineStyle"]
	});

	public constructor()
	{
		this._callbackCollection = Weave.getCallbacks(this);
		this.weight.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);

		this.normalizedWeightColumn.min.value = 1;
		this.normalizedWeightColumn.max.value = 5;
	}

	private _callbackCollection:ICallbackCollection; // the ICallbackCollection for this object

	private _triggerCounter:number = 0; // used to detect change

	// This maps an AlwaysDefinedColumn to its preferred value type.
	private map_column_dataType:Map<AlwaysDefinedColumn, GenericClass> = new Map();
	// this maps an AlwaysDefinedColumn to the default value for that column.
	// if there is an internal column in the AlwaysDefinedColumn, the default value is not stored
	private map_column_defaultValue:Map<AlwaysDefinedColumn, string|number> = new Map();

	private createColumn(dataType:GenericClass, defaultValue:string|number):AlwaysDefinedColumn
	{
		var column:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		this.map_column_dataType.set(column, dataType);
		column.defaultValue.state = defaultValue;
		return column;
	}

	public enable:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));

	public color:AlwaysDefinedColumn = this.createColumn(Number, 0x000000);
	public weight:AlwaysDefinedColumn = this.createColumn(Number, 1);
	public alpha:AlwaysDefinedColumn = this.createColumn(Number, 0.5);
	public caps:AlwaysDefinedColumn = this.createColumn(String, null);
	public joints:AlwaysDefinedColumn = this.createColumn(String, null);
	public miterLimit:AlwaysDefinedColumn = this.createColumn(Number, 3);

	public get normalizedWeightColumn():NormalizedColumn { return Weave.AS(this.weight.getInternalColumn(), NormalizedColumn); }

	/**
	 * For use with ColumnUtils.getRecords()
	 */
	public get recordFormat()
	{
		return { 'color': this.color, 'weight': this.weight, 'alpha': this.alpha, 'caps': this.caps, 'joints': this.joints, 'miterLimit': this.miterLimit };
	}

	/**
	 * For use with ColumnUtils.getRecords()
	 */
	public get recordType()
	{
		return { 'color': Number, 'weight': Number, 'alpha': Number, 'caps': String, 'joints': String, 'miterLimit': Number };
	}

	/**
	 * IQualifiedKey -> getLineStyleParams() result
	 */
	private map_key_style:WeakMap<IQualifiedKey, { 'color':number, 'weight':number, 'alpha':number, 'caps':string, 'joints':string, 'miterLimit':number }>;

	public beginLineStyle(key:IQualifiedKey, graphics:Graphics)
	{
		var style = this.getStyle(key);
		graphics.lineStyle(style.weight, style.color, style.alpha);
	}

	public getStyle(key:IQualifiedKey):{ color:number, weight:number, alpha:number, caps:string, joints:string, miterLimit:number }
	{
		if (this._triggerCounter != this._callbackCollection.triggerCounter)
		{
			this._triggerCounter = this._callbackCollection.triggerCounter;
			// update the default values
			for (var col of this.map_column_dataType.keys())
			{
				var column:AlwaysDefinedColumn = col as AlwaysDefinedColumn;
				if (column.getInternalColumn() != null)
					this.map_column_defaultValue.delete(column);
				else
					this.map_column_defaultValue.set(column, EquationColumnLib.cast(column.defaultValue.state, this.map_column_dataType.get(column)) as string|number);
			}
			this.map_key_style = new WeakMap();
		}

		var params = this.map_key_style.get(key);
		if (params)
			return params;

		var _color = this.map_column_defaultValue.get(this.color);
		var _weight = this.map_column_defaultValue.get(this.weight);
		var _alpha = this.map_column_defaultValue.get(this.alpha);
		var _caps = this.map_column_defaultValue.get(this.caps) as string;
		var _joints = this.map_column_defaultValue.get(this.joints) as string;
		var _miterLimit = this.map_column_defaultValue.get(this.miterLimit);

		var lineColor:number      = _color      !== undefined ? _color      : this.color.getValueFromKey(key, Number);
		var lineWeight:number     = _weight     !== undefined ? _weight     : this.weight.getValueFromKey(key, Number);
		var lineAlpha:number      = _alpha      !== undefined ? _alpha      : this.alpha.getValueFromKey(key, Number);
		var lineCaps:string       = _caps       !== undefined ? _caps       : this.caps.getValueFromKey(key, String) as string || null;
		var lineJoints:string     = _joints     !== undefined ? _joints     : this.joints.getValueFromKey(key, String) as string || null;
		var lineMiterLimit:number = _miterLimit !== undefined ? _miterLimit : this.miterLimit.getValueFromKey(key, Number);

		params = {
			'color': lineColor,
			'weight': lineWeight,
			'alpha': lineAlpha,
			'caps': lineCaps,
			'joints': lineJoints,
			'miterLimit': lineMiterLimit
		};

		this.map_key_style.set(key, params);

		return params;
	}
}
