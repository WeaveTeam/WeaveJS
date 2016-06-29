import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import {CSSProperties} from "react";
import * as jquery from "jquery";
import MiscUtils from "../utils/MiscUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import StatefulTextArea from "../ui/StatefulTextArea";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import {Sparklines, SparklinesLine, SparklinesBars, SparklinesCurve, SparklinesNormalBand, SparklinesReferenceLine} from "react-sparklines"
import Accordion from "../semantic-ui/Accordion";
import ResizingDiv, {ResizingDivState} from "../ui/ResizingDiv";
import SmartComponent from "../ui/SmartComponent";
import ComboBox, {ComboBoxOption}  from "../semantic-ui/ComboBox";
import Checkbox from "../semantic-ui/Checkbox";
import ConfigUtils from "../utils/ConfigUtils";
import ToolTip from "./ToolTip";

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
import LinkableBoolean = weavejs.core.LinkableBoolean;

export declare type Record = {
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
	data?:number[][];
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

const COLUMN:string = "column";
const RECORD:string = "record";
const ORIENTATION_MODES:ComboBoxOption[] = [
	{label: "Column Oriented", value: COLUMN},
	{label: "Record Oriented", value: RECORD}
];

const NONE:string = null;
const MIN:string = "max";
const MAX:string = "min";
const MEAN:string = "mean";
const AVG:string = "avg";
const MEDIAN:string = "median";
const REFERENCELINE_MODES:ComboBoxOption[] = [
	{label: "(None)", value: NONE},
	{label: "Min", value: MIN},
	{label: "Max", value: MAX},
	{label: "Mean", value: MEAN},
	{label: "Average", value: AVG},
	{label: "Median", value: MEDIAN},
];

export default class Sparkline extends SmartComponent<ISparklineProps, ISparklineState> implements IVisTool, IInitSelectableAttributes
{
	columns  = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	sortColumn = Weave.linkableChild(this, DynamicColumn);
	labelColumn = Weave.linkableChild(this, DynamicColumn);
	chartType = Weave.linkableChild(this, new LinkableString(LINE, this.verifyChartMode));
	orientationMode = Weave.linkableChild(this, new LinkableString(COLUMN, this.verifyOrientationMode));
	referenceLineMode = Weave.linkableChild(this, new LinkableString(NONE, this.verifyReferenceLineMode));
	showAllRecords = Weave.linkableChild(this, new LinkableBoolean(false));
	showRowLabels = Weave.linkableChild(this, new LinkableBoolean(true));
	showNormalBands = Weave.linkableChild(this, new LinkableBoolean(false));
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
	marginTop = Weave.linkableChild(this, new LinkableNumber(0));
	marginBottom = Weave.linkableChild(this, new LinkableNumber(0));
	marginLeft = Weave.linkableChild(this, new LinkableNumber(0));
	marginRight = Weave.linkableChild(this, new LinkableNumber(0));

	panelTitle = Weave.linkableChild(this, LinkableString);
	altText:LinkableString = Weave.linkableChild(this, new LinkableString(this.panelTitle.value));
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	private records:Record[];
	private toolTip:ToolTip;

	private verifyChartMode(mode:string):boolean
	{
		return [LINE, BARS, CURVE].indexOf(mode) >= 0;
	}

	private verifyOrientationMode(mode:string):boolean
	{
		return [COLUMN, RECORD].indexOf(mode) >= 0;
	}

	private verifyReferenceLineMode(mode:string):boolean
	{
		return [NONE, MIN, MAX, MEAN, AVG, MEDIAN].indexOf(mode) >= 0;
	}

	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }

	protected isSelected(key:IQualifiedKey):boolean
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	}

	protected isProbed(key:IQualifiedKey):boolean
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	}

	constructor(props:ISparklineProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		
		this.line.color.internalDynamicColumn.globalName = "defaultColorColumn";
		this.fill.color.internalDynamicColumn.globalName = "defaultColorColumn";
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.columns.addGroupedCallback(this, this.dataChanged, true);
		this.sortColumn.addGroupedCallback(this, this.dataChanged, true);
		this.labelColumn.addGroupedCallback(this, this.dataChanged, true);
		this.orientationMode.addGroupedCallback(this, this.dataChanged, true);
		this.showAllRecords.addGroupedCallback(this, this.dataChanged, true);
		this.filteredKeySet.addGroupedCallback(this, this.dataChanged, true);
		this.selectionFilter.addGroupedCallback(this, this.dataChanged, true);
		this.probeFilter.addGroupedCallback(this, this.dataChanged, true);

		this.chartType.addGroupedCallback(this, this.forceUpdate, true);
		this.showRowLabels.addGroupedCallback(this, this.forceUpdate, true);
		this.showNormalBands.addGroupedCallback(this, this.forceUpdate, true);
		this.referenceLineMode.addGroupedCallback(this, this.forceUpdate, true);
		this.marginTop.addGroupedCallback(this, this.forceUpdate, true);
		this.marginBottom.addGroupedCallback(this, this.forceUpdate, true);
		this.marginLeft.addGroupedCallback(this, this.forceUpdate, true);
		this.marginRight.addGroupedCallback(this, this.forceUpdate, true);


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
			.set("Columns", this.columns)
			.set("Sort", this.sortColumn);
	}

	get defaultPanelTitle():string
	{
		var columns = this.columns.getObjects() as IAttributeColumn[];
		if (columns.length == 0)
			return Weave.lang('Sparkline');
		return Weave.lang("Sparkline of {0}", columns.map(column=>weavejs.data.ColumnUtils.getTitle(column)).join(Weave.lang(", ")));
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
				<HBox className="weave-padded-hbox" style={{alignItems: 'center'}} >
					{ ConfigUtils.renderNumberEditor(this.marginLeft, 1) }
					<VBox className="weave-padded-vbox" style={{flex: 1}}>
						{ ConfigUtils.renderNumberEditor(this.marginTop, null) }
						{ ConfigUtils.renderNumberEditor(this.marginBottom, null) }
					</VBox>
					{ ConfigUtils.renderNumberEditor(this.marginRight, 1) }
				</HBox>
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
		let columns = this.columns.getObjects(IAttributeColumn);

		return Accordion.render(
			[Weave.lang("Data"), renderSelectableAttributes(this.selectableAttributes, pushCrumb)],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("Type"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.chartType })} options={CHART_MODES}/>
					],
					[
						Weave.lang("Orientation"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.orientationMode })} options={ORIENTATION_MODES} type={(columns.length <= 1) ? "disabled":null}/>
					],
					[
						Weave.lang("Reference line"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.referenceLineMode })} options={REFERENCELINE_MODES}/>
					],
					[
						Weave.lang("Show normal bands"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showNormalBands })} label={" "}/>
					],
					[
						Weave.lang("Show line labels"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showRowLabels })} label={" "}/>
					],
					[
						Weave.lang("Show All Records"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showAllRecords })} label={" "} disabled={this.orientationMode.value == COLUMN}/>
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
			"columns": this.columns,
			"sortColumn": this.sortColumn
		};
	}

	componentDidUpdate()
	{

	}

	componentDidMount()
	{
		this.toolTip = ReactUtils.openPopup(this, <ToolTip/>) as ToolTip;
	}

	componentWillUnmount()
	{
		ReactUtils.closePopup(this.toolTip);
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
		let data:number[][];

		let columns = this.columns.getObjects(IAttributeColumn);
		let names:string[] = this.columns.getNames();

		this.filteredKeySet.setColumnKeySources(columns);

		if (weavejs.WeaveAPI.Locale.reverseLayout)
		{
			columns.reverse();
			names.reverse();
		}

		if (columns.length)
		{
			//single column case
			let format:any = _.zipObject(names, columns);
			format = _.assign(format,{
				id: IQualifiedKey,
				sort: this.sortColumn,
				fill: { color: this.fill.color },
				line: { color: this.line.color }
			});

			let datatype:any = {
				sort: Number,
				fill: { color: String },
				line: { color: String }
			};
			names.forEach( (name,index) => {
				datatype[name] = Number;
			});


			this.records = weavejs.data.ColumnUtils.getRecords(format, this.filteredKeySet.keys, datatype);
			this.records = _.sortByOrder(this.records, ["sort"], ["asc"]);

			if(this.records.length) {
				if (columns.length == 1) {
					//single column case
					data = [
						this.records.map((record:any, index:number) => {
							return record[names[0]];
						})];
				} else {
					if(this.orientationMode.value == COLUMN) {
						//group columns into rows
						data = names.map((name:string, index:number) => {
							return this.records.map((record:any, i:number) => {
								return record[name];
							})
						});
					} else if(this.orientationMode.value == RECORD) {
						if (!this.showAllRecords.value) {
							let records:any[] = this.getInteractedRecords();
							data = records && records.map((record:any, index:number) => {
								return names.map((name:string, index:number) => {
									return record[name]
								})
							});
						} else {
							//all records case. group records into rows
							data = this.records.map((record:any, index:number) => {
								return names.map((name:string, i:number) => {
									return record[name];
								})
							});
						}
					}
				}
			}

		}

		this.setState({
			data
		});
	}

	getInteractedRecords():Record[]
	{
		let probeKeys = this.probeKeySet.keys;
		let selectedKeys = this.selectionKeySet.keys;
		let records:Record[];
		if(probeKeys.length) {
			//show the sparklines for the probed keys
			records = probeKeys.map((key,index) => {
				return _.find(this.records, (record:Record) => {
					return record.id === key;
				});
			});

		} else if (selectedKeys.length) {
			//show the sparklines for the selected keys
			records = selectedKeys.map((key,index) => {
				return _.find(this.records, (record:Record) => {
					return record.id === key;
				});
			});
		}

		return _.sortByOrder(records, ["sort"], ["asc"]);
	}

	/**
	 * Gets the Sparkline reference line component depending on the mode
	 * @param mode - The Sparkline reference line drawing mode
	 */
	getReferenceLineComponent(mode:string)
	{
		switch (mode)
		{
			case NONE:
				break;
			default:
				return <SparklinesReferenceLine type={mode}/>
		}
	}

	/**
	 * Gets the Spark Line component depending on the mode
	 * @param mode - The Sparkline drawing mode
	 * @returns React.ReactChild - returns the Sparkline to be displayed
	 */
	getLineComponent(mode:string, style:React.CSSProperties):React.ReactChild
	{
		switch (mode)
		{
			case LINE:
				return <SparklinesLine style={style}/>;
			case BARS:
				return <SparklinesBars style={style}/>;
			case CURVE:
				return  <SparklinesCurve style={style}/>;
		}
	}

	handleClick=(record:Record, event:React.MouseEvent):void =>
	{
		if(this.orientationMode.value == COLUMN || !this.selectionKeySet)
			return;

		var currentSelection:IQualifiedKey[] = this.selectionKeySet.keys;

		if (_.includes(currentSelection, record.id))
		{
			currentSelection = _.difference(currentSelection, [record.id]);
			this.selectionKeySet.replaceKeys(currentSelection);
		}
		else
		{
			if ((event.ctrlKey || event.metaKey))
				this.selectionKeySet.addKeys([record.id]);
			else
				this.selectionKeySet.replaceKeys([record.id]);
		}
	};

	handleProbe=(record:Record, mouseOver:boolean, event:React.MouseEvent):void =>
	{
		if(this.orientationMode.value == COLUMN || !this.probeKeySet)
			return;

		if (mouseOver)
		{
			this.probeKeySet.replaceKeys([record.id]);
		}
		else
		{
			this.probeKeySet.replaceKeys([]);
		}
		let columns = this.columns.getObjects(IAttributeColumn);
		this.toolTip.show(this, event.nativeEvent as MouseEvent, this.probeKeySet.keys, columns);
	};

	getSparklines()
	{
		var rows:JSX.Element[] = [];
	}

	render()
	{
		return (
			<ResizingDiv
				style={{flex: 1, whiteSpace: "nowrap", marginTop: this.marginTop.value, marginBottom: this.marginBottom.value, marginLeft: this.marginLeft.value, marginRight: this.marginRight.value}}
				onResize={this.handleResize}
				onMouseLeave={ () => this.toolTip.hide() }
			>
				{this.state.width && this.state.height ?
					<VBox
						style={{flex: 1, overflow:"auto", height: "100%"}}
					>
						{this.state.data && this.state.data.map( (data,index) => {
							let style:React.CSSProperties = {};
							let label:string;
							let referenceLineKey:string = this.referenceLineMode.value ? this.referenceLineMode.value:"custom";
							let normalBandKey:string = this.showNormalBands.value ? "yes":"no";
							let interactedRecords:Record[] = this.getInteractedRecords();
							let interactive:boolean = !this.showAllRecords.value;
							if(this.orientationMode.value == RECORD){
								let record:Record = this.records && this.records[index] as Record;
								if (interactive) {
									record = interactedRecords[index];
								}
								let selectionEmpty: boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;
								let selected:boolean = this.isSelected(record.id);
								let probed:boolean = this.isProbed(record.id);
								style = _.assign(style,
									{
										stroke: record.line.color,
										strokeWidth: probed ? 3:(selected ? 2:null),
										strokeOpacity: (selectionEmpty || selected || probed) ? 1.0 : 0.1,
										fill: record.fill.color,
										fillOpacity: (selectionEmpty || selected || probed) ? 0.8 : 0.1 });
								label = record.id.toString();
							} else {
								let columns = this.columns.getObjects(IAttributeColumn);
								label = Weave.lang(weavejs.data.ColumnUtils.getTitle(columns[index]));
								style = {};
							}
							return (
								<VBox
									key={index}
									style={{flex: 1, overflow:"hidden", position: "relative"}}
									onClick={this.handleClick.bind(this,this.records && (interactive ? interactedRecords && interactedRecords[index]:(this.records[index] as Record)))}
									onMouseMove={this.handleProbe.bind(this,this.records && (interactive ? interactedRecords && interactedRecords[index]:(this.records[index] as Record)), true)}
									onMouseOut={this.handleProbe.bind(this,this.records && (interactive ? interactedRecords && interactedRecords[index]:(this.records[index] as Record)), false)}
								>
									{<span style={{position: "absolute", top: 0, left: 0}}>{this.showRowLabels.value ? label:""}</span>}
									<Sparklines key={this.chartType.value.concat(referenceLineKey,normalBandKey,String(this.probeKeySet.keys),String(this.selectionKeySet.keys))} data={data} width={this.state.width} height={this.state.height/this.state.data.length}>
										{this.getLineComponent(this.chartType.value,style)}
										<SparklinesNormalBand style={{fill: 'red', fillOpacity: this.showNormalBands.value ? .1:0}}/>
										<SparklinesReferenceLine type={referenceLineKey} value={0} style={{ stroke: 'red', strokeOpacity: this.referenceLineMode.value ? .75:0, strokeDasharray: '2, 2'}}/>
									</Sparklines>
								</VBox>
							)
						})}
					</VBox>:""
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
