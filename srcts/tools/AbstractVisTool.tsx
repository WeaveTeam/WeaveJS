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
import ReactUtils from "../utils/ReactUtils";
import {OverlayTrigger,Popover} from "react-bootstrap";
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
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

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
	selectableAttributes:{[label:string]:IColumnWrapper|LinkableHashMap};
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

	renderNumberEditor(linkableNumber:LinkableNumber, flex:number):JSX.Element
	{
		var style:React.CSSProperties = {textAlign: "center", height: 24};
		if (flex)
			style.flex = flex;
		return <StatefulTextField style={style} ref={linkReactStateRef(this, {content: linkableNumber})}/>;
	}

	renderEditor():JSX.Element
	{
		var attrLabels = Object.keys(Object(this.selectableAttributes));

		var selectors = attrLabels.map((label:string, index:number) => {
			if (Weave.IS(this.selectableAttributes[label], IColumnWrapper))
			{
				let attribute = this.selectableAttributes[label] as IColumnWrapper;
				return <SelectableAttributeComponent label={ label } attribute={ attribute }/>;
			}
			else // LinkableHashMap
			{
				let attribute = this.selectableAttributes[label] as LinkableHashMap;
				return(<SelectableAttributesList button={ true } label={ label } columns={ attribute }/>);
			}
		});

		return (
			<VBox className="weave-padded-vbox">
				{ReactUtils.generateTable(
					null,
					[
						["Title", this.panelTitle],
						["X Axis Title", this.xAxisName],
						["Y Axis Title", this.yAxisName]
					].map((row:[string, LinkableString]) => [
						Weave.lang(row[0]),
						<StatefulTextField ref={ linkReactStateRef(this, {content: row[1]}) }/>
					]),
					{
						table: {width: "100%"},
						td: [{whiteSpace: "nowrap"}, {padding: 5, width: "100%"}]
					}
				)}

				<label style={ {fontWeight: 'bold'} }>{Weave.lang('Attributes')}</label>
				{ selectors }

				<HBox className="weave-padded-hbox" style={{alignItems: 'center'}}>
					<span>{ Weave.lang("Margins:") }</span>
					{ this.renderNumberEditor(this.margin.left, 1) }
					<VBox className="weave-padded-vbox" style={{flex: 1}}>
						{ this.renderNumberEditor(this.margin.top, 0) }
						{ this.renderNumberEditor(this.margin.bottom, 0) }
					</VBox>
					{ this.renderNumberEditor(this.margin.right, 1) }
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
