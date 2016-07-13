import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState,renderSelectableAttributes} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import MiscUtils from "../utils/MiscUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import Accordion from "../semantic-ui/Accordion";
import ColorRampEditor from "../editors/ColorRampEditor";


import StandardLib = weavejs.util.StandardLib;
import LinkableString = weavejs.core.LinkableString
import LinkableBoolean = weavejs.core.LinkableBoolean
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableVariable = weavejs.core.LinkableVariable;
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
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import KeySet = weavejs.data.key.KeySet;
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import ComboBox from "../semantic-ui/ComboBox";
import Checkbox from "../semantic-ui/Checkbox";
import KeyFilter = weavejs.data.key.KeyFilter;


const layoutModes:ComboBoxOption[] = [
	{label:"Vertical" , value:"vertical"},
	{label:"Horizontal" , value:"horizontal"}
];

export default class DataInfoTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool,IInitSelectableAttributes
{
	columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	layout = Weave.linkableChild(this, new LinkableString("horizontal"));
	showRecordBar = Weave.linkableChild(this, new LinkableBoolean(true));
	showRecordValue = Weave.linkableChild(this, new LinkableBoolean(true));
	columnMetaDataProperties = Weave.linkableChild(this,  LinkableHashMap );
	colorRamp = Weave.linkableChild(this, new ColorRamp(["0xFF0000","0xFFFF66","0xCCFF66","0x33CC00"]));
	columnNames:string[] = null;
	
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);

	panelTitle = Weave.linkableChild(this, LinkableString);

	constructor(props:IVisToolProps)
	{
		super(props);
		// new column when added will ensure subsetkey filter know its sources to get keys
		this.columns.childListCallbacks.addImmediateCallback(this,this.updateFilterKeySources,true);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		Weave.getCallbacks(this).addGroupedCallback(this, this.handleChange, true);
	}


	updateFilterKeySources=()=>
	{
		this.filteredKeySet.setColumnKeySources(this.columns.getObjects(IAttributeColumn) as IAttributeColumn[]);
	};


	get defaultPanelTitle():string
	{
		return Weave.lang("Data Info Tool");
	}

	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
	}

	private handleChange():void
	{
		if (!Weave.wasDisposed(this) && !Weave.isBusy(this))
		{
			var columnChanged = Weave.detectChange(this, this.columns,this.columnMetaDataProperties);
			var dataChanged = columnChanged || Weave.detectChange(this, this.probeFilter, this.selectionFilter,  this.filteredKeySet) ;

			if(dataChanged)
				this.columnNames = this.columns.getNames();

			this.forceUpdate();
		}
	}

	protected get probeKeySet()
	{
		let keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}

	protected get selectionKeySet()
	{
		let keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}




	get selectableAttributes()
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
			.set("Columns", this.columns)
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}
	

	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null):JSX.Element =>
	{
		return <DataInfoEditor tool={this} pushCrumb={pushCrumb} />;
	};

	render()
	{
		let columnObjects = this.columns && this.columns.getObjects();
		let key = this.probeKeySet && this.probeKeySet.keys[0];
		key = key ? key : this.filteredKeySet.keys[0];

		let columnUI:JSX.Element[] = columnObjects && columnObjects.map( (col:IAttributeColumn,index:number) =>
			{
				let colName = weavejs.data.ColumnUtils.getTitle(col);
				let metaDataPropNames:LinkableVariable = this.columnMetaDataProperties.getObject(colName) as LinkableVariable;

				let metaDataProps:string[] = null;
				if(metaDataPropNames && metaDataPropNames.state)
				{
					metaDataProps = metaDataPropNames.state as string[]
				}

				return <ColumnStats key={index}
				                    colorRamp={this.colorRamp}
				                    layout={this.layout.value}
				                    column={col}
				                    recordKey={key}
				                    showRecordBar={this.showRecordBar.value}
				                    showRecordValue={this.showRecordValue.value}
				                    columnMetaDataProperties={metaDataProps}/>
				});

		if(this.layout.state == "vertical")
		{
			return (<VBox padded={true} style={{flex: 1, overflow:"hidden"}}>
						{columnUI}
					</VBox>);
		}
		else
		{
			return (<HBox padded={true} style={{flex: 1, overflow:"hidden"}}>
						{columnUI}
					</HBox>);
		}

	}
}
interface ColumnStatsProps extends React.HTMLProps<ColumnStats>
{
	layout:string;
	showRecordBar:boolean;
	showRecordValue:boolean;
	columnMetaDataProperties:any;
	column:IAttributeColumn;
	recordKey:IQualifiedKey;
	colorRamp:ColorRamp;
}

interface ColumnStatsState
{

}

class ColumnStats extends React.Component<ColumnStatsProps, ColumnStatsState>
{
	constructor(props:ColumnStatsProps)
	{
		super(props)
		
		
	}


	render(){


		let colName = weavejs.data.ColumnUtils.getTitle(this.props.column);
		let recordValue = this.props.recordKey ? this.props.column.getValueFromKey(this.props.recordKey) : null;
		let color = recordValue ? this.props.colorRamp.getHexColor(recordValue as any, 0, 100) : null;

		let valueBoxStyle:React.CSSProperties = {
			display:"flex",
			alignItems:"center",
			justifyContent:"center",
			background:color,
			width:"40px",
			height:"40px",
			color:"white",
			margin:"2px",
			textShadow:"0px 0px 2px black",
			borderRadius:"4px"
		};



		let columnTitleUI:JSX.Element = null;
		let recordValueUI:JSX.Element = null;
		let columnInfoUI:JSX.Element = null;

		if(colName){
			columnTitleUI = <div style={ {whiteSpace: "nowrap",overflow: "hidden",textOverflow: "ellipsis",padding:"2px",flex:"1 0"} }>
								{Weave.lang(colName)}
							</div>
		}



		if(this.props.showRecordValue)
		{
			recordValueUI = <div style={ valueBoxStyle }>
								{Weave.lang(recordValue)}
							</div>;
		}

		if(this.props.columnMetaDataProperties )
		{
			let colMetaDataPropertyNames:string[] = this.props.columnMetaDataProperties as string[];

			let infoUIs:JSX.Element[] = null;
			if(colMetaDataPropertyNames)
			{ 
				if(colMetaDataPropertyNames[0] == "all")
				{
					colMetaDataPropertyNames = this.props.column.getMetadataPropertyNames();
				}
					
				let infoStyle:React.CSSProperties = {
					borderBottom:"1px solid lightgrey",
					paddingBottom:"2px",marginTop:"2px",
					fontSize:"12px"
				};
				
				infoUIs = colMetaDataPropertyNames.map((metaDataPropertyName:string , index:number)=>{
					let metadata = this.props.column.getMetadata(metaDataPropertyName);
					if(metadata)
					{
						return  ( <HBox key={index} style={ infoStyle }>
									<div style={ {flex:"1 0"} }>{Weave.lang(metaDataPropertyName)}</div>
									<div>{Weave.lang(metadata)}</div>
								</HBox>);
					}
					else
						return null;

				});

				
				

			}
			

			columnInfoUI = <VBox style={ {flex:"1 0"} } >{infoUIs}</VBox>
		}

		let layoutUI:JSX.Element = null;
		if(this.props.layout == "vertical")
		{
			layoutUI = <HBox padded={true} style={ {flex:"1",alignItems:"center"} }>
							{columnTitleUI}
							{columnInfoUI}
							{recordValueUI}
						</HBox>
		}
		else
		{
			layoutUI = <HBox padded={true} style={ {flex:"1",alignItems:"center"} }>
							{columnInfoUI}
							{recordValueUI}
						</HBox>
		}

		let recordBarUI:JSX.Element = null;
		if(this.props.showRecordBar)
		{
			recordBarUI = <div style={ {position:"relative",width:"100%", height:"40px"} }>
				<HBox style={ {position:"absolute",left:0,top:0,width:"100%", height:"100%"} }>
					<div style={ {background:"grey",flex:"1 0 33.3%"} }></div>
					<div style={ {background:"darkgrey",flex:"1 0 33.3%"} }></div>
					<div style={ {background:"lightgrey",flex:"1 0 33.4%"} }></div>
				</HBox>
				<div style={ {position:"absolute",left:0,top:16,bottom:16,width:String(recordValue) + "%",background:color} }>
				</div>
			</div>;
		}

		return  <VBox  style={ {flex:"1",border:"1px solid lightgrey",borderRadius:"4px",padding:"4px" } }>
					{this.props.layout == "horizontal" ? columnTitleUI : null}
					{layoutUI}
					{recordBarUI}
				</VBox>
	}
}

Weave.registerClass(
	DataInfoTool,
	["weavejs.tool.DataInfo"],
	[weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Data Info"
);


export interface IDataInfoEditorState {

}

export interface IDataInfoEditorProps {
	tool:DataInfoTool
	pushCrumb?:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void;
}

class DataInfoEditor extends React.Component<IDataInfoEditorProps, IDataInfoEditorState>
{

	constructor(props:IDataInfoEditorProps)
	{
		super(props);
		this.props.tool.columns.addGroupedCallback(this,this.forceUpdate)
	}


	componentWillUnmount()
	{
		this.props.tool.columns.removeCallback(this,this.forceUpdate);
	}

	getColMetaDataEditor=():React.ReactChild[][] =>
	{
		let columns = this.props.tool.columns.getObjects();
		return columns.map((col:IAttributeColumn,index:number)=>{
			let colName = weavejs.data.ColumnUtils.getTitle(col);
			let sessionedProperties:LinkableVariable = this.props.tool.columnMetaDataProperties.requestObject(colName,LinkableVariable) as LinkableVariable;
			let options = col.getMetadataPropertyNames().map((metaData:string)=>{
				return {label:metaData, value:metaData}
			});

			if(!sessionedProperties.state)
				sessionedProperties.state  = [];

			let value = sessionedProperties.state;

			options.push({label:"All", value:"all"});

			return [
						Weave.lang(colName),
						<ComboBox style={{width:"100%"}}
						          noneOption= { {label:"(None)",value:[]} }
						          placeholder="Select Property Names"
						          value={value}
						          type="multiple"
						          searchable={true}
						          ref={linkReactStateRef(this, { value: sessionedProperties })}
						          options={options}/>
			      ];

		});

	};

	getTitlesEditor():React.ReactChild[][]
	{
		return [
			[Weave.lang("Chart"),this.props.tool.panelTitle,this.props.tool.defaultPanelTitle]
		].map((row:[string, LinkableString]) => {

			return [
				Weave.lang(row[0]),
				<StatefulTextField ref={ linkReactStateRef(this, {value: row[1]})} placeholder={row[2] as string}/>
			]
		});
	}

	getDisplayEditor():React.ReactChild[][]
	{
		return [
			[Weave.lang("Layout"), <ComboBox style={{width:"100%"}} placeholder="Select a layout mode" ref={linkReactStateRef(this, { value: this.props.tool.layout })} options={layoutModes}/>],
			[Weave.lang("Show Record Bar"),<Checkbox ref={linkReactStateRef(this, { value: this.props.tool.showRecordBar })} label={" "}/>],
			[Weave.lang("Color theme"),
				<ColorRampEditor
					compact={true}
					colorRamp={this.props.tool.colorRamp}
					pushCrumb={ this.props.pushCrumb }
				/>
			],
			[Weave.lang("Show Record Value"),<Checkbox ref={linkReactStateRef(this, { value: this.props.tool.showRecordValue })} label={" "}/>]
		];
	}

	getSelectableAttributesEditor(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null):React.ReactChild[][]
	{
		return renderSelectableAttributes(this.props.tool.selectableAttributes, pushCrumb);
	}

	render(){
		return Accordion.render(
			[Weave.lang("Data"), this.getSelectableAttributesEditor(this.props.pushCrumb)],
			[Weave.lang("Column MetaData"), this.getColMetaDataEditor()],
			[Weave.lang("Display"), this.getDisplayEditor()],
			[Weave.lang("Titles"), this.getTitlesEditor()]
		);
	}
}
