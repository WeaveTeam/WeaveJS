import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import MiscUtils from "../utils/MiscUtils";
import ReactUtils from "../utils/ReactUtils";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import prefixer from "../react-ui/VendorPrefixer";
import ToolTip from "./ToolTip";
import AbstractVisTool from "./AbstractVisTool";
import {HBox, VBox} from "../react-ui/FlexBox";
import Menu from "../react-ui/Menu";
import {MenuItemProps, IGetMenuItems} from "../react-ui/Menu";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import ColorRampComponent from "../react-ui/ColorRamp";
import Input from "../semantic-ui/Input";
import ComboBox from "../semantic-ui/ComboBox";
import ColorRampEditor from "../editors/ColorRampEditor";
import Button from "../semantic-ui/Button";
import ColorController from "../editors/ColorController";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import StatefulTextField from "../ui/StatefulTextField";
import BinNamesList from "../ui/BinNamesList";
import BinningDefinitionEditor from "../editors/BinningDefinitionEditor";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import IBinningDefinition = weavejs.api.data.IBinningDefinition;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import KeySet = weavejs.data.key.KeySet;
import LinkableNumber = weavejs.core.LinkableNumber;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import IColumnReference = weavejs.api.data.IColumnReference;
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import ColorRamp = weavejs.util.ColorRamp;
import StandardLib = weavejs.util.StandardLib;

import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import CustomSplitBinningDefinition = weavejs.data.bin.CustomSplitBinningDefinition;
import QuantileBinningDefinition = weavejs.data.bin.QuantileBinningDefinition;
import EqualIntervalBinningDefinition = weavejs.data.bin.EqualIntervalBinningDefinition;
import StandardDeviationBinningDefinition = weavejs.data.bin.StandardDeviationBinningDefinition;
import CategoryBinningDefinition = weavejs.data.bin.CategoryBinningDefinition;
import NaturalJenksBinningDefinition = weavejs.data.bin.NaturalJenksBinningDefinition;
import ColumnUtils = weavejs.data.ColumnUtils;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";
const SHAPE_TYPE_BOX:string = "box";
const SHAPE_MODES:{label:string, value:any}[] = [{label: "Box", value: SHAPE_TYPE_BOX},
												{label: "Circle", value: SHAPE_TYPE_CIRCLE},
												{label: "Line", value: SHAPE_TYPE_LINE},
												{label: "Square", value: SHAPE_TYPE_SQUARE}];

export default class ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements weavejs.api.core.ILinkableObjectWithNewProperties, IVisTool, IInitSelectableAttributes
{
	panelTitle = Weave.linkableChild(this, LinkableString);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	dynamicColorColumn = Weave.linkableChild(this, DynamicColumn);
	maxColumns = Weave.linkableChild(this, new LinkableNumber(1));
	shapeSize = Weave.linkableChild(this, new LinkableNumber(25));
	shapeType = Weave.linkableChild(this, new LinkableString(SHAPE_TYPE_CIRCLE));
	showLegendName = Weave.linkableChild(this, new LinkableBoolean(true));
	//lineStyle = Weave.linkableChild(this, SolidLineStyle);
	
	element:HTMLElement;
	
	private get colorColumn() { return this.dynamicColorColumn.target as ColorColumn; }
	private get binnedColumn() { var cc = this.colorColumn; return cc ? cc.getInternalColumn() as BinnedColumn : null; }
	private get binningDefinition() { var bc = this.binnedColumn ; return bc ? bc.binningDefinition.target as IBinningDefinition : null; }
	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }
	
	private spanStyle:CSSProperties;
	private textStyle:CSSProperties;
	private toolTip:ToolTip;

	constructor(props:IVisToolProps)
	{
		super(props);
		
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		
		this.filteredKeySet.setSingleKeySource(this.dynamicColorColumn);
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];
		this.dynamicColorColumn.targetPath = ['defaultColorColumn'];

		this.state = {selected:[], probed:[]};
		this.spanStyle = {
			padding: 5,
			userSelect: "none",
			textOverflow: "ellipsis",
			overflow: "hidden",
			whiteSpace: "nowrap"
		};
		this.textStyle = {
			flex:0.8,
			alignItems:"center",
			justifyContent:"flex-start",
			overflow: "hidden"
		}

	}
	
	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
	}
	
	get numberOfBins():number
	{
		var bc = this.binnedColumn;
		return bc ? bc.numberOfBins : 0;
	}


	getSelectedBins():number[]
	{
		return _.unique(this.selectionKeySet.keys.map((key:IQualifiedKey) => this.binnedColumn.getValueFromKey(key, Number)));
	}

	getProbedBins():number[]
	{
		return _.unique(this.probeKeySet.keys.map((key:IQualifiedKey) => this.binnedColumn.getValueFromKey(key, Number)));
	}

	handleClick(bin:number, event:React.MouseEvent):void
	{
		var selectedBins:number[] = this.getSelectedBins();
		var _binnedKeysArray:IQualifiedKey[][] = (this.binnedColumn as any)['_binnedKeysArray'];
		if (_.contains(selectedBins, bin))
		{
			var currentSelection:IQualifiedKey[] = this.selectionKeySet.keys;
			currentSelection = _.difference(currentSelection, _binnedKeysArray[bin]);
			this.selectionKeySet.replaceKeys(currentSelection);
			_.remove(selectedBins, (value:number) => value == bin);
		}
		else
		{
			if ((event.ctrlKey || event.metaKey))
				this.selectionKeySet.addKeys(_binnedKeysArray[bin]);
			else
				this.selectionKeySet.replaceKeys(_binnedKeysArray[bin]);
		}
	}

	handleProbe(bin:number, mouseOver:boolean, event:MouseEvent):void
	{
		if (mouseOver)
		{
			var keys:IQualifiedKey[] = this.binnedColumn.getKeysFromBinIndex(bin);
			if (!keys)
				return;
			this.probeKeySet.replaceKeys(keys);
		}
		else
		{
			this.probeKeySet.replaceKeys([]);
		}
		this.toolTip.show(this, event, this.probeKeySet.keys, [this.binnedColumn.internalDynamicColumn]);
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
		this.toolTip = ReactUtils.openPopup(<ToolTip/>) as ToolTip;
	}
	
	componentWillUnmount()
	{
		ReactUtils.closePopup(this.toolTip);
	}

	getMenuItems()
	{
		return AbstractVisTool.getMenuItems(this);
	}
	
	getInteractionStyle(bin:number):CSSProperties
	{
		var probed:boolean = this.getProbedBins().indexOf(bin) >= 0;
		var selected:boolean = this.getSelectedBins().indexOf(bin) >= 0;
		
		var borderAlpha:number;
		if (probed)
			borderAlpha = 1;
		else if (selected)
			borderAlpha = 0.5;
		else
			borderAlpha = 0;
		
		return {
			flex: 1.0,
			borderColor: MiscUtils.rgba(0, 0, 0, borderAlpha),
			borderStyle: "solid",
			borderWidth: 1,
			padding: "2px",
			overflow: "hidden"
		};
	}

	render()
	{
		if (this.numberOfBins)
		{
			//Binned plot case
			var width:number = this.element ? this.element.clientWidth : 200;
			var height:number = this.element ? this.element.clientHeight : 300;
			var shapeSize:number = this.shapeSize.value;
			var shapeType:string = this.shapeType.value;
			var maxColumns:number = this.maxColumns.value;
			var columnFlex:number = 1.0/maxColumns;
			var columnFlexPercent:string = String(columnFlex*100)+"%";
			var extraBins:number = this.numberOfBins % maxColumns == 0 ? 0 : maxColumns - this.numberOfBins % maxColumns;
			var totalBins:number = this.numberOfBins + extraBins;
			var yScale:Function = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
			var yMap:Function = (d:number):number => { return yScale(d); };

			shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
			var r:number = (shapeSize / 100 * height / this.numberOfBins) / 2;
			var textLabelFunction:Function = this.binnedColumn.deriveStringFromNumber.bind(this.binnedColumn);
			var finalElements:any[] = [];
			var prefixerStyle:{} = prefixer(this.spanStyle);

			for (var j:number = 0; j < maxColumns; j++)
			{
				var elements:JSX.Element[] = [];
				switch (shapeType)
				{
					//handle circle/square/line in same switch logic
					case SHAPE_TYPE_CIRCLE :
					case SHAPE_TYPE_SQUARE :
					case SHAPE_TYPE_LINE:
					{
						var element:JSX.Element[] = [];
						for (var i = 0; i < totalBins; i++)
						{
							if (i % maxColumns == j)
							{

								if (i < this.numberOfBins)
								{
									//get shape Element
									var shapeElement:JSX.Element;
									//handle different cases for circle/square/line
									switch (shapeType)
									{
										case SHAPE_TYPE_CIRCLE :
											shapeElement = <circle cx="50%" cy="50%" r="45%" style={{
														fill: this.colorColumn.ramp.getHexColor(i, 0, this.numberOfBins - 1),
														stroke: "black",
														strokeOpacity: 0.5
													}}/>;
											break;
										case SHAPE_TYPE_SQUARE :
											shapeElement = <rect x="5%" y="5%" width="90%" height="90%" style={{
														fill: this.colorColumn.ramp.getHexColor(i, 0, this.numberOfBins - 1),
														stroke: "black",
														strokeOpacity: 0.5
													}}/>;
											break;
										case SHAPE_TYPE_LINE :
											shapeElement = <line x1="5%" y1="50%" x2="95%" y2="50%" style={{
														stroke: this.colorColumn.ramp.getHexColor(i, 0, this.numberOfBins - 1),
														strokeWidth: 5
													}}/>;
											break;
									}

									element.push(
										<HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseMove={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
											{weavejs.WeaveAPI.Locale.reverseLayout ?
											<HBox style={this.textStyle}>
												<span style={ prefixerStyle }>{ Weave.lang(textLabelFunction(i)) }</span>
											</HBox>:null}
											<HBox style={{flex:0.2, minWidth:10, padding:"0px 0px 0px 0px"}}>
												<svg viewBox="0 0 100 100" width="100%">
													{
														shapeElement
													}
												</svg>
											</HBox>
											{weavejs.WeaveAPI.Locale.reverseLayout ?
												null:<HBox style={this.textStyle}>
												<span style={ prefixerStyle }>{ Weave.lang(textLabelFunction(i)) }</span>
											</HBox>}
										</HBox>
									);
								}
								else
								{
									element.push(
										<HBox key={i} style={this.getInteractionStyle(i)}/>
									);
								}
							}
						}

						elements.push(
							<VBox key={i} style={{width: columnFlexPercent, flex: columnFlex, padding: "5px"}}> { element } </VBox>
						);

						finalElements[j] = elements;
					}
						break;
					case SHAPE_TYPE_BOX :
					{
						var element:JSX.Element[] = [];
						var elements:JSX.Element[] = [];
						for (var i = 0; i < this.numberOfBins + extraBins; i++)
						{
							if (i % maxColumns == j)
							{

								if (i < this.numberOfBins)
								{
									element.push(
										<HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseMove={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
											<HBox style={{
												flex:1.0,
												alignItems:"center",
												justifyContent:"center",
												backgroundColor: MiscUtils.rgb_a(this.colorColumn.ramp.getColor(i, 0, this.numberOfBins - 1), 1.0)
											}}>
												<div style={{
															stroke: "black",
															strokeOpacity: 0.5,
															backgroundColor: "#FFF"
														}}>
													<span style={prefixerStyle}>{ Weave.lang(textLabelFunction(i)) }</span>
												</div>
											</HBox>
										</HBox>
									);
								}
								else
								{
									element.push(
										<HBox key={i} style={this.getInteractionStyle(i)}/>
									);
								}
							}
						}

						elements.push(
							<VBox key={i} style={{width: columnFlexPercent, flex: columnFlex, padding: "5px"}}> { element } </VBox>
						);

						finalElements[j] = elements;
					}
				}
			}

			return (
				<VBox style={{flex: 1, padding: "0px 5px 0px 5px", overflow: "hidden"}} ref={(vbox:VBox) => this.element = ReactDOM.findDOMNode(vbox) as HTMLElement}>
					{this.showLegendName.value ?
						<HBox style={{flex: 0.1, alignItems:"center"}}>
							<span style={prefixerStyle}>{Weave.lang(this.dynamicColorColumn.getMetadata('title'))}</span>
						</HBox>
						: null
					}
					<HBox style={{flex: 0.9}}> { finalElements } </HBox>
				</VBox>
			);
		}
		else
		{
			//Continuous plot case
			if(this.colorColumn)
			{
				var dataColumn = this.colorColumn.internalDynamicColumn;
				
				return (
					<VBox style={{flex: 1, marginLeft: 20}} className="weave-padded-vbox">
						<label style={{marginTop: 5, fontWeight: "bold"}}>{Weave.lang(this.dynamicColorColumn.getMetadata('title'))}</label>
						<HBox style={{flex: 1, overflow: "auto"}} className="weave-padded-hbox">
							<ColorRampComponent style={{width: 30}} direction="to bottom" ramp={this.colorColumn ? this.colorColumn.ramp.getHexColors():[]}/>
							<VBox style={{justifyContent: "space-between"}}>
								{ColumnUtils.deriveStringFromNumber(dataColumn, this.colorColumn.getDataMax())}
								{this.colorColumn.rampCenterAtZero.value ? ColumnUtils.deriveStringFromNumber(dataColumn, 0) : null}
								{ColumnUtils.deriveStringFromNumber(dataColumn, this.colorColumn.getDataMin())}
							</VBox>
						</HBox>
					</VBox>
				);
			}
			return <div/>;
		}
	}

	get selectableAttributes()
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
			.set("Color Data", this.dynamicColorColumn);
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}
	
	// TODO
	openColorController(tabIndex:number)
	{
		ColorController.activeTabIndex = tabIndex;
		ColorController.open(this.colorColumn);
	}
	
	renderEditor(linkFunction:Function = null):JSX.Element
	{
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: [
				{ textAlign: "right", whiteSpace: "nowrap", paddingRight: 8},
				{ paddingBottom: 4, paddingTop: 4, width: "100%", paddingLeft: 8}
			]
		};
		
		return ReactUtils.generateTable(
			null,
			renderSelectableAttributes(this.selectableAttributes, linkFunction).concat(
				[
					[
						Weave.lang("Shape Type"),
						<ComboBox ref={linkReactStateRef(this, { value: this.shapeType })} options={SHAPE_MODES}/> 
					],
					[
						Weave.lang("Color Theme"),
						<ColorRampEditor compact={true} colorRamp={this.colorColumn.ramp} onButtonClick={() => this.openColorController(1)}/>
					],
					[
						Weave.lang("Binning Method"),
						<BinningDefinitionEditor compact={true} binnedColumn={this.binnedColumn} onButtonClick={() => this.openColorController(0)}/>
					],
					[ 
						Weave.lang("Layout"),
						<HBox className="weave-padded-hbox" style={{padding: 0, alignItems: "center"}}>
							<StatefulTextField type="number" style={{textAlign: "center", width:50}} ref={linkReactStateRef(this, {value: this.maxColumns})}/>
							{Weave.lang("Columns")}
						</HBox>
					]
				]
			),
			tableStyles
		);
	}

	get deprecatedStateMapping():Object
	{
		return {
			children: {
				visualization: {
					plotManager: {
						marginTop: (str:string) => this.showLegendName.value = str != '0',
						plotters: {
							plot: this
						}
					}
				}
			}
		};
	}
}

Weave.registerClass(
	ColorLegend,
	["weavejs.tool.ColorLegend", "weave.visualization.tools::ColorBinLegendTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Color Legend"
);
