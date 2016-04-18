import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
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
import ReactUtils from "../utils/ReactUtils";
import classNames from "../modules/classnames";
import {CSSProperties} from "react";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import SelectableAttributesList from "../ui/SelectableAttributesList";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import KeySet = weavejs.data.key.KeySet;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import WeaveMenuItem = weavejs.util.WeaveMenuItem;
import KeyFilter = weavejs.data.key.KeyFilter;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import IColumnReference = weavejs.api.data.IColumnReference;
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import ColumnUtils = weavejs.data.ColumnUtils;

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

Weave.registerClass(Margin, "weavejs.tool.Margin");
Weave.registerClass(OverrideBounds, "weavejs.tool.OverrideBounds");

export default class AbstractVisTool<P extends IVisToolProps, S extends IVisToolState> extends React.Component<P, S> implements IVisTool, ILinkableObjectWithNewProperties, IGetMenuItems, IInitSelectableAttributes
{
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

	get selectableAttributes():Map<string, (IColumnWrapper|ILinkableHashMap)>
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>();
	}
	
	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}
	
	static initSelectableAttributes(selectableAttributes:Map<string, (IColumnWrapper|ILinkableHashMap)>, input:(IAttributeColumn | IColumnReference)[]):void
	{
		var attrs = weavejs.util.JS.mapValues(selectableAttributes);
		ColumnUtils.initSelectableAttributes(attrs, input);
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

	renderNumberEditor(linkableNumber:LinkableNumber, width:number = 50):JSX.Element
	{
		var style:React.CSSProperties = {textAlign: "center", width};
		return <StatefulTextField type="number" style={style} ref={linkReactStateRef(this, {value: linkableNumber})}/>;
	}

	renderEditor(linktoToolEditorCrumbFunction:Function = null):JSX.Element
	{
		var labelStyle:React.CSSProperties = {
			textAlign: 'center',
			display:"flex",
			justifyContent: "flex-end",
		};

		let marginCellsUI:JSX.Element = <HBox style={{alignItems: 'center',justifyContent: "space-between"}} >
											<div style={{width: 50}}>{ this.renderNumberEditor(this.margin.left) }</div>
											<VBox className="weave-padded-vbox" style={{width: 50}}>
												{ this.renderNumberEditor(this.margin.top) }
												{ this.renderNumberEditor(this.margin.bottom) }
											</VBox>
											<div style={{width: 50}}>{ this.renderNumberEditor(this.margin.right) }</div>
										</HBox>;

		let marginUI:JSX.Element = ReactUtils.generateFlexBoxLayout([.3,.7],[[<span style={labelStyle}>{ Weave.lang("Margins") }</span>,marginCellsUI]]);

		return (
			<VBox className="weave-padded-vbox" >
				{ renderSelectableAttributes(this,linktoToolEditorCrumbFunction) }
				<br/>
				{marginUI}
				<br/>
				{this.renderFlexBoxLayout()}
			</VBox>
		);
	}

	renderFlexBoxLayout=():JSX.Element=>
	{
		var labelStyle:React.CSSProperties = {
			textAlign: 'center',
			display:"flex",
			justifyContent: "flex-end"
		};
		var gridUIs:JSX.Element[][] = [
			["Title", this.panelTitle],
			["X Axis Title", this.xAxisName],
			["Y Axis Title", this.yAxisName]
		].map((row:[string, LinkableString]) => {
			return [<span style={ labelStyle }>{Weave.lang(row[0])}</span>,
					<StatefulTextField ref={ linkReactStateRef(this, {value: row[1]}) }/>]
		});

		return ReactUtils.generateFlexBoxLayout([.3,.7],gridUIs);
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
