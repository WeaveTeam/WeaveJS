///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/c3/c3.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import {MenuItemProps} from "../react-ui/Menu/MenuItem";
import {IGetMenuItems} from "../react-ui/Menu/Menu";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import KeySet = weavejs.data.key.KeySet;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import WeaveMenuItem = weavejs.util.WeaveMenuItem;

export class Margin
{
    top = Weave.linkableChild(this, new LinkableNumber(20));
    bottom = Weave.linkableChild(this, new LinkableNumber(100));
    left = Weave.linkableChild(this, new LinkableNumber(100));
    right = Weave.linkableChild(this, new LinkableNumber(20));
}
export class OverrideBounds
{
    xMin = Weave.linkableChild(this, LinkableNumber);
    yMin = Weave.linkableChild(this, LinkableNumber);
    xMax = Weave.linkableChild(this, LinkableNumber);
    yMax = Weave.linkableChild(this, LinkableNumber);
}

export interface VisToolGroup 
{
	filteredKeySet:FilteredKeySet,
	selectionFilter:DynamicKeyFilter,
	probeFilter:DynamicKeyFilter
}

Weave.registerClass("weavejs.tool.Margin", Margin);
Weave.registerClass("weavejs.tool.OverrideBounds", OverrideBounds);

export default class AbstractVisTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties, IGetMenuItems
{
    constructor(props:IVisToolProps)
	{
        super(props);
    }
	
	panelTitle = Weave.linkableChild(this, LinkableString);
	xAxisName = Weave.linkableChild(this, LinkableString);
	yAxisName = Weave.linkableChild(this, LinkableString);
    margin = Weave.linkableChild(this, Margin);
	overrideBounds = Weave.linkableChild(this, OverrideBounds);

	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);

	protected get selectionKeySet()
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	protected isSelected(key:IQualifiedKey):boolean
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	}
	 
	protected get probeKeySet()
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	protected isProbed(key:IQualifiedKey):boolean
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	} 

    get title():string
    {
       return this.panelTitle.value;
    }

	static getMenuItems(target:VisToolGroup):MenuItemProps[]
	{
		return [
			{
				label: "Create subset from selected record(s)",
				click: () => {
					//
				}
			},
			{
				label: "Remove selected records(s) from subset",
				click: () => {
					
				}
			},
			{
				label: "Show All Records",
				click: () => {
				
				}
			},
			{},
			{
				label: "Print/Export Application Image",
				click: () => {
					
				}
			}
		]
	}

	getMenuItems():MenuItemProps[]
	{
		return AbstractVisTool.getMenuItems(this);
	}
	
    get deprecatedStateMapping():Object
	{
		return {
			"children": {
				"visualization": {
					"plotManager": {
						"marginTop": this.margin.top,
						"marginLeft": this.margin.left,
						"marginRight": this.margin.right,
						"marginBottom": this.margin.bottom,
                        "overrideXMin": this.overrideBounds.xMin,
                        "overrideYMin": this.overrideBounds.yMin,
                        "overrideXMax": this.overrideBounds.xMax,
                        "overrideYMax": this.overrideBounds.yMax,
                        "plotters": {
							"yAxis": {
								"overrideAxisName": this.yAxisName
							},
							"xAxis": {
								"overrideAxisName": this.xAxisName
							}
						}
					}
				}
			}
		};
	}
}
