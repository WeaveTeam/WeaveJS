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
import ColorRamp = weavejs.util.ColorRamp;

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
	private colorRamp:ColorRamp;

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

		this.colorRamp = new weavejs.util.ColorRamp();
		this.colorRamp.state = [
			"0xFF0000","0xFFFF66","0xCCFF66","0x33CC00"
		];
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

					let value:number = NaN;
					//code for heat map
					if(record.stats < 15)
						value = 15;
					else if(record.stats > 50)
						value = 60;
					else
						value = record.stats;


					let color = this.colorRamp.getHexColor(value as any, 15, 60)

					return <RecordStats key={index}
					                    label={record.label}
					                    color={color}
										width={String(value)}/>
				})
		return (<HBox padded={true} style={{flex: 1, overflow:"hidden"}}>
					{recordUI}
				</HBox>);
	}
}
interface RecordStatsProps extends React.HTMLProps<RecordStats>
{
	label:string;
	color:string;
	width:string;
}

interface RecordStatsState
{

}

class RecordStats extends React.Component<RecordStatsProps, RecordStatsState>
{
	constructor(props:RecordStatsProps){
		super(props)
	}

	render(){
		let valueBoxStyle:React.CSSProperties = {
			display:"flex",
			background:this.props.color,
			width:"60px",
			height:"60px",
			alignItems:"center",
			justifyContent:"center",
			color:"white",
			margin:"2px",
			textShadow:"0px 0px 2px black",
			borderRadius:"4px"
		};

		return  <VBox  style={ {flex:"1",border:"1px solid lightgrey",borderRadius:"4px",padding:"4px" } }>
					<HBox style={ {flex:"1"} }>
						<div style={ {whiteSpace: "nowrap",overflow: "hidden",textOverflow: "ellipsis",padding:"2px"} }>
							{this.props.label}
						</div>
						<div style={ valueBoxStyle }>
							{this.props.width}
						</div>
					</HBox>
					<div style={ {position:"relative",width:"100%", height:"40px"} }>
						<HBox style={ {position:"absolute",left:0,top:0,width:"100%", height:"100%"} }>
							<div style={ {background:"grey",flex:"1 0 33.3%"} }></div>
							<div style={ {background:"darkgrey",flex:"1 0 33.3%"} }></div>
							<div style={ {background:"lightgrey",flex:"1 0 33.4%"} }></div>
						</HBox>
						<div style={ {position:"absolute",left:0,top:16,bottom:16,width:this.props.width + "%",background:this.props.color} }>
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
