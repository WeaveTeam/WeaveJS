import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import * as _ from "lodash";
import {MenuItemProps, IGetMenuItems} from "../react-ui/Menu";
import Menu from "../react-ui/Menu";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import MiscUtils from "../utils/MiscUtils";
import {OverlayTrigger,Popover} from "react-bootstrap";
import classNames from "../modules/classnames";
import {CSSProperties} from "react";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";

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
import EntityNode = weavejs.data.hierarchy.EntityNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;

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

export default class AbstractVisTool<P extends IVisToolProps, S extends IVisToolState> extends React.Component<P, S> implements IVisTool, ILinkableObjectWithNewProperties, IGetMenuItems
{
	selectableAttributes:{[label:string]:DynamicColumn};
	constructor(props:P)
	{
		super(props);
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
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
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
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

	private static localProbeKeySet = new weavejs.data.key.KeySet();

	static getMenuItems(target:VisToolGroup):MenuItemProps[]
	{
		let menuItems:Array<any> = [];
		let selectionKeySet = target.selectionFilter.target as KeySet;
		let probeKeySet = target.probeFilter.target as KeySet;
		let subset = target.filteredKeySet.keyFilter.getInternalKeyFilter() as KeyFilter;

		if (probeKeySet)
			Weave.copyState(probeKeySet, this.localProbeKeySet);
		else
			this.localProbeKeySet.clearKeys();

		let usingIncludedKeys: boolean = subset && subset.included.keys.length > 0;
		let usingExcludedKeys: boolean = subset && subset.excluded.keys.length > 0;
		let includeMissingKeys: boolean = subset && subset.includeMissingKeys.value;
		let usingSubset: boolean = includeMissingKeys ? usingExcludedKeys : true;
		let usingProbe: boolean = this.localProbeKeySet.keys.length > 0;
		let usingSelection: boolean = selectionKeySet && selectionKeySet.keys.length > 0;

		if (!usingSelection && usingProbe && subset)
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
				enabled: usingSelection && subset,
				label: Weave.lang("Create subset from selected record(s)"),
				click: this.createFromSetToSubset.bind(null, selectionKeySet, subset)
			});
			menuItems.push({
				enabled: usingSelection && subset,
				label: Weave.lang("Remove selected record(s) from subset"),
				click: this.removeFromSetToSubset.bind(null, selectionKeySet, subset)
			});
		}

		menuItems.push({
			enabled: usingSubset && subset,
			label: Weave.lang("Show all records"),
			click: this.clearSubset.bind(null, subset)
		});

		return menuItems;
	}

	getMenuItems():MenuItemProps[]
	{
		return AbstractVisTool.getMenuItems(this);
	}

	renderNumberEditor(linkableNumber:LinkableNumber):JSX.Element
	{
		return <StatefulTextField style={{flex: 1, textAlign: 'center'}} ref={linkReactStateRef(this, {content: linkableNumber})}/>;
	}

	renderEditor():JSX.Element
	{
		var labelStyle = {textAlign : 'center', fontSize : '12px'};
		var boxStyle = { display : "flex", flexDirection : 'row', justifyContent:'space-around', alignItems: 'center'};
		var heading:CSSProperties = {fontWeight : 'bold',padding : '2px 2px 2px 2px'} ;
		var icon = classNames({'fa fa-compass': true, 'weave-icon':true});


		var attrLabels = Object.keys(Object(this.selectableAttributes));
		var selectors = attrLabels.map((label:string, index:number) => {
			var attribute:DynamicColumn = this.selectableAttributes[label];
			return <SelectableAttributeComponent label={label} attribute={attribute}/>;
		});

		return (
			<VBox>
				<label style={ heading }>{Weave.lang('Titles')}</label>
				<table>
					<tbody><tr>
						<td><span style={ labelStyle }>{ Weave.lang("Visualization") }</span></td>
						<td><StatefulTextField ref={ linkReactStateRef(this, {content: this.panelTitle}) }/></td>
					</tr></tbody>
					<tbody><tr>
						<td><span style={ labelStyle }>{ Weave.lang("X Axis") }</span></td>
						<td><StatefulTextField style={{ flexBasis : 0.8}} ref={ linkReactStateRef(this, {content: this.xAxisName}) }/></td>
					</tr></tbody>
					<tbody><tr>
						<td><span style={ labelStyle }>{ Weave.lang("Y Axis") }</span></td>
						<td><StatefulTextField ref={ linkReactStateRef(this, {content: this.yAxisName}) }/></td>
					</tr></tbody>
				</table>

				<label style={ heading }>{Weave.lang('Attributes')}</label>
				{ selectors }

				<label style={ heading }>{Weave.lang('Margins')}</label>

				<table>
					<tbody><tr><td>{ this.renderNumberEditor(this.margin.top) }</td></tr></tbody>
					<tbody><tr>
						<td>{ this.renderNumberEditor(this.margin.left) }</td>
						<td><span>blah</span></td>
						<td>{ this.renderNumberEditor(this.margin.right) }</td>
					</tr></tbody>
					<tbody><tr><td>{ this.renderNumberEditor(this.margin.bottom) }</td></tr></tbody>
				</table>
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

	static handlePointClick(toolGroup:VisToolGroup, event:MouseEvent):void
	{
		let probeKeySet = toolGroup.probeFilter.target as KeySet;
		let selectionKeySet = toolGroup.selectionFilter.target as KeySet;

		if (!(probeKeySet instanceof KeySet) || !(selectionKeySet instanceof KeySet))
			return;

		var probeKeys: IQualifiedKey[] = probeKeySet.keys;
		if (!probeKeys.length)
		{
			selectionKeySet.clearKeys();
			return;
		}

		var isSelected = false;
		for (var key of probeKeys)
		{
			if (selectionKeySet.containsKey(key))
			{
				isSelected = true;
				break;
			}
		}
		if (event.ctrlKey || event.metaKey)
		{
			if (isSelected)
				selectionKeySet.removeKeys(probeKeys);
			else
				selectionKeySet.addKeys(probeKeys);
		}
		else
		{
			//Todo: needs to be more efficient check
			if (_.isEqual(selectionKeySet.keys.sort(), probeKeys.sort()))
				selectionKeySet.clearKeys();
			else
				selectionKeySet.replaceKeys(probeKeys);
		}
	}
}
