import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState,renderSelectableAttributes} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import MiscUtils from "../utils/MiscUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import StatefulTextArea from "../ui/StatefulTextArea";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import Accordion from "../semantic-ui/Accordion";


import StandardLib = weavejs.util.StandardLib;
import LinkableString = weavejs.core.LinkableString
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

declare type Record = {
	id: IQualifiedKey,
	label: string,
	stats: number
};

export default class StatsTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool
{
	label = Weave.linkableChild(this, DynamicColumn);
	stats = Weave.linkableChild(this, DynamicColumn);
	min = Weave.linkableChild(this, new LinkableNumber(0));
	max = Weave.linkableChild(this, new LinkableNumber(100));
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	panelTitle = Weave.linkableChild(this, LinkableString);

	private RECORD_FORMAT = {
		id: IQualifiedKey,
		label: this.label,
		stats: this.stats
	};

	private RECORD_DATATYPE = {
		label: String,
		stats: Number
	};


	private records:Record[];

	constructor(props:IVisToolProps)
	{
		super(props);
		this.filteredKeySet.setColumnKeySources([this.label, this.stats]);
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		Weave.getCallbacks(this).addGroupedCallback(this, this.handleChange, true);
	}

	private handleChange():void
	{
		if (!Weave.wasDisposed(this) && !Weave.isBusy(this))
		{
			var columnChanged = Weave.detectChange(this, this.label, this.stats);
			var dataChanged = columnChanged || Weave.detectChange(this, this.filteredKeySet);

			if(dataChanged)
				this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);

			this.forceUpdate();
		}
	}
	
	


	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
	}

	get selectableAttributes()
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
			.set("Label", this.label)
			.set("Stats", this.stats);
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}

	get defaultPanelTitle():string
	{
		return Weave.lang("Stats Tool");
	}

	getTitlesEditor():React.ReactChild[][]
	{
		return [
			[
				Weave.lang("Chart"),
				this.panelTitle,
				this.defaultPanelTitle
			]
		].map((row:[string, LinkableString]) => {

			return [
				Weave.lang(row[0]),
				<StatefulTextField ref={ linkReactStateRef(this, {value: row[1]})} placeholder={row[2] as string}/>
			]
		});
	}

	getSelectableAttributesEditor(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null):React.ReactChild[][]
	{
		return renderSelectableAttributes(this.selectableAttributes, pushCrumb);
	}

	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null):JSX.Element =>
	{
		return Accordion.render(
			[Weave.lang("Data"), this.getSelectableAttributesEditor(pushCrumb)],
			[Weave.lang("Titles"), this.getTitlesEditor()]
		);
	};


	componentDidUpdate()
	{

	}

	render()
	{
		let recordUI:JSX.Element[] = this.records && this.records.map((record:Record,index:number)=>{
					let color = "green";
					if(record.stats <= 33)
					{
						color = "red";
					}else if(record.stats > 33 && record.stats < 67){
						color = "orange";
					}
					return <RecordStats key={index} label={record.label} color={color}/>
				})
		return (<HBox style={{flex: 1, overflow:"hidden"}}>
					{recordUI}
				</HBox>);
	}
}
export interface RecordStatsProps extends React.HTMLProps<RecordStats>
{
	label:string;
	color:string;
}

export interface RecordStatsState
{

}

class RecordStats extends React.Component<RecordStatsProps, RecordStatsState>
{
	constructor(props:RecordStatsProps){
		super(props)
	}

	render(){
		return  <VBox style={ {flex:"1",border:"1px solid grey" } }>
					<div>
						{this.props.label}
					</div>
					<div style={ {flex:"1"} }></div>
					<div style={ {position:"relative",width:"100%", height:"100px"} }>
						<HBox style={ {position:"absolute",left:0,top:0,width:"100%", height:"100%"} }>
							<div style={ {background:"darkgrey",flex:"1 0 33.3%"} }></div>
							<div style={ {background:"grey",flex:"1 0 33.3%"} }></div>
							<div style={ {background:"lightgrey",flex:"1 0 33.3%"} }></div>
						</HBox>
						<div style={ {position:"absolute",left:0,top:10,bottom:10,width:"20px",background:this.props.color} }>
						</div>
					</div>
				</VBox>
	}
}

Weave.registerClass(
	StatsTool,
	["weavejs.tool.Stats"],
	[weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Stats"
);
