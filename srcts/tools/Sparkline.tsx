import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";
import * as jquery from "jquery";
import MiscUtils from "../utils/MiscUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import StatefulTextArea from "../ui/StatefulTextArea";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import {Sparklines, SparklinesLine, SparklinesBars, SparklinesCurve} from "react-sparklines"
import Accordion from "../semantic-ui/Accordion";
import ResizingDiv, {ResizingDivState} from "../ui/ResizingDiv";
import SmartComponent from "../ui/SmartComponent";
import ComboBox, {ComboBoxOption}  from "../semantic-ui/ComboBox";
import Checkbox from "../semantic-ui/Checkbox";

import StandardLib = weavejs.util.StandardLib;
import LinkableString = weavejs.core.LinkableString
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import IColumnReference = weavejs.api.data.IColumnReference;
import KeySet = weavejs.data.key.KeySet;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import LinkableVariable = weavejs.core.LinkableVariable;

declare type Record = {
	id: IQualifiedKey,
	value: number,
	fill: { color: string },
	line: { color: string }
};

export interface ISparklineProps extends IVisToolProps {
	width?:number;
	height?:number;
}

export interface ISparklineState extends IVisToolState {
	data?:number[];
	width?:number;
	height?:number;
}

const LINE:string = "line";
const BARS:string = "bars";
const CURVE:string = "curve";
const CHART_MODES:ComboBoxOption[] = [
	{label: "Line", value: LINE},
	{label: "Bars", value: BARS},
	{label: "Curve", value: CURVE}
];

export default class Sparkline extends SmartComponent<ISparklineProps, ISparklineState> implements IVisTool, IInitSelectableAttributes
{
	column  = Weave.linkableChild(this, DynamicColumn);
	sortColumn = Weave.linkableChild(this, DynamicColumn);
	chartMode = Weave.linkableChild(this, new LinkableString(LINE, this.verifyChartMode));
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
	panelTitle = Weave.linkableChild(this, LinkableString);
	altText:LinkableString = Weave.linkableChild(this, new LinkableString(this.panelTitle.value));
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	private records:Record[];

	private verifyChartMode(mode:string):boolean
	{
		return [LINE, BARS, CURVE].indexOf(mode) >= 0;
	}

	private RECORD_FORMAT = {
		id: IQualifiedKey,
		value: this.column,
		sort: this.sortColumn,
		fill: { color: this.fill.color },
		line: { color: this.line.color }
	};
	private RECORD_DATATYPE = {
		value: Number,
		sort: Number,
		fill: { color: String },
		line: { color: String }
	};

	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }

	constructor(props:ISparklineProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		
		this.fill.color.internalDynamicColumn.globalName = "defaultColorColumn";
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.column.addGroupedCallback(this, this.dataChanged, true);
		this.sortColumn.addGroupedCallback(this, this.dataChanged, true);
		this.chartMode.addGroupedCallback(this, this.dataChanged, true);

		this.filteredKeySet.addGroupedCallback(this, this.dataChanged, true);
		this.selectionFilter.addGroupedCallback(this, this.forceUpdate);
		this.probeFilter.addGroupedCallback(this, this.forceUpdate);

		this.state = {
			data: [],
			width: props.width,
			height: props.height
		}
	}


	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
	}

	get selectableAttributes()
	{
		return new Map<string, IColumnWrapper | ILinkableHashMap>()
			.set("Column", this.column)
			.set("Sort", this.sortColumn);
	}

	get defaultPanelTitle():string
	{
		if (!this.column)
			return Weave.lang('Sparkline');
		return Weave.lang("Sparkline of {0}", weavejs.data.ColumnUtils.getTitle(this.column));
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}

	getTitleEditor():React.ReactChild[][]
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

	getMarginEditor():React.ReactChild[][]
	{
		return [
			[
				Weave.lang("Margins"),
				/*<HBox className="weave-padded-hbox" style={{alignItems: 'center'}} >
					{ this.renderNumberEditor(this.margin.left, 1) }
					<VBox className="weave-padded-vbox" style={{flex: 1}}>
						{ this.renderNumberEditor(this.margin.top, null) }
						{ this.renderNumberEditor(this.margin.bottom, null) }
					</VBox>
					{ this.renderNumberEditor(this.margin.right, 1) }
				</HBox>*/
				<div/>
			]
		];
	}

	getAltTextEditor():React.ReactChild[][]
	{
		return [
			[
				Weave.lang("Alt Text"),
				<StatefulTextField ref={ linkReactStateRef(this, {value: this.altText})} placeholder={Weave.lang("Enter text description of chart")}/>
			]
		]
	}

	//todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void):JSX.Element =>
	{
		return Accordion.render(
			[Weave.lang("Data"), renderSelectableAttributes(this.selectableAttributes, pushCrumb)],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("Mode"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.chartMode })} options={CHART_MODES}/>
					]
				]
			],
			[Weave.lang("Title"), this.getTitleEditor()],
			[Weave.lang("Margins"), this.getMarginEditor()],
			[Weave.lang("Accessibility"), this.getAltTextEditor()]
		);
	};

	get deprecatedStateMapping()
	{
		return {
			"column": this.column,
			"sortColumn": this.sortColumn
		};
	}

	componentDidUpdate()
	{

	}

	handleResize=(newSize:ResizingDivState) =>
	{
		this.setState({
			width: newSize.width,
			height: newSize.height
		});
	};

	dataChanged()
	{
		let data:number[] = [];
		if (this.column)
		{
			this.filteredKeySet.setColumnKeySources([this.column]);

			this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
			this.records = _.sortByOrder(this.records, ["sort"], ["asc"]);

			if(this.records.length)
				data = this.records.map( (record:any, index:number) => {
					return record["value"]
				});
		}

		this.setState({
			data
		});
	}

	render()
	{

		let lineComponent:React.ReactChild;
		let style:React.CSSProperties;

		switch (this.chartMode.value)
		{
			case LINE:
				lineComponent = <SparklinesLine />;
				break;
			case BARS:
				lineComponent = <SparklinesBars />;
				break;
			case CURVE:
				lineComponent = <SparklinesCurve />;
				break;
		}

		return (
			<ResizingDiv style={{flex: 1, whiteSpace: "nowrap"}} onResize={this.handleResize}>
				{this.state.width && this.state.height ?
					<div
						style={{flex: 1, overflow:"auto"}}
					>
						<Sparklines key={this.chartMode.value} data={this.state.data} width={this.state.width} height={this.state.height}>
							{lineComponent}
						</Sparklines>
					</div>:""
				}
			</ResizingDiv>
		);
	}
}

Weave.registerClass(
	Sparkline,
	["weavejs.tool.Sparkline", "weave.visualization.tools::Sparkline"],
	[weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Sparkline"
);
