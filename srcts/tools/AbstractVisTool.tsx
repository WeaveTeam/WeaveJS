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
import {MenuItemProps, IGetMenuItems} from "../react-ui/Menu";
import {VBox, HBox} from "../react-ui/FlexBox";
import LinkableTextField from "../ui/LinkableTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";

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
import KeyFilter = weavejs.data.key.KeyFilter;

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

    private static createFromSetToSubset(set: KeySet, filter:KeyFilter):void
    {
		filter.replaceKeys(false, true, set.keys, null);
		set.clearKeys();
    }
    private static removeFromSetToSubset(set: KeySet, filter: KeyFilter):void
    {
		filter.excludeKeys(set.keys);
		set.clearKeys();
    }
    private static clearSubset(filter:KeyFilter):void
    {
		filter.replaceKeys(true, true);
    }

    private static localProbeKeySet: KeySet = new weavejs.data.key.KeySet();
	
	static getMenuItems(target:VisToolGroup):MenuItemProps[]
	{
		let menuItems:Array<any> = [];
		let selectionKeySet = target.selectionFilter.target as KeySet;
		let probeKeySet = target.probeFilter.target as KeySet;
		let subset = target.filteredKeySet.keyFilter.getInternalKeyFilter() as KeyFilter;

		Weave.copyState(probeKeySet, this.localProbeKeySet);

		let usingIncludedKeys: boolean = subset.included.keys.length > 0;
		let usingExcludedKeys: boolean = subset.excluded.keys.length > 0;
		let includeMissingKeys: boolean = subset.includeMissingKeys.value;
		let usingSubset: boolean = includeMissingKeys ? usingExcludedKeys : true;
		let usingProbe: boolean = this.localProbeKeySet.keys.length > 0;
		let usingSelection: boolean = selectionKeySet.keys.length > 0;

		if (!usingSelection && usingProbe)
		{
			menuItems.push({
				label: Weave.lang("Create subset from highlighted record(s)"),
				click: this.createFromSetToSubset.bind(null, this.localProbeKeySet, subset)
			});
			menuItems.push({
				label: Weave.lang("Remove highlighted record(s) from subset"),
				click: this.removeFromSetToSubset.bind(null, this.localProbeKeySet, subset)
			});
		}
		else
		{
			menuItems.push({
				enabled: usingSelection,
				label: Weave.lang("Create subset from selected record(s)"),
				click: this.createFromSetToSubset.bind(null, selectionKeySet, subset)
			});
			menuItems.push({
				enabled: usingSelection,
				label: Weave.lang("Remove selected record(s) from subset"),
				click: this.removeFromSetToSubset.bind(null, selectionKeySet, subset)
			});
		}

		menuItems.push({
			enabled: usingSubset,
			label: Weave.lang("Show all records"),
			click: this.clearSubset.bind(null, subset)
		});

		return menuItems;
	}

	getMenuItems():MenuItemProps[]
	{
		return AbstractVisTool.getMenuItems(this);
	}
	
	renderEditor():JSX.Element
	{
		return (
			<VBox>
				<HBox>
					<span>{Weave.lang("Visualization Title")}</span>
					<LinkableTextField ref={linkReactStateRef(this, {content: this.panelTitle})}/>
				</HBox>
				<HBox>
					<span>{Weave.lang("X Axis Title")}</span>
					<LinkableTextField ref={linkReactStateRef(this, {content: this.xAxisName})}/>
				</HBox>
				<HBox>
					<span>{Weave.lang("Y Axis Title")}</span>
					<LinkableTextField ref={linkReactStateRef(this, {content: this.yAxisName})}/>
				</HBox>

				<HBox>
					<span>{Weave.lang("Margins:")}</span>
					<LinkableTextField style={{width: 30}} ref={linkReactStateRef(this, {content: this.margin.left})}/>
					<VBox>
						<LinkableTextField style={{width: 30}} ref={linkReactStateRef(this, {content: this.margin.top})}/>
						<LinkableTextField style={{width: 30}} ref={linkReactStateRef(this, {content: this.margin.bottom})}/>
					</VBox>
					<LinkableTextField style={{width: 30}} ref={linkReactStateRef(this, {content: this.margin.right})}/>
				</HBox>
			</VBox>
		);
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
