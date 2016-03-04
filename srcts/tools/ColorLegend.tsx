///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../react-ui/ui.tsx"/>
///<reference path="../../typings/react/react-dom.d.ts"/>

import ILinkableObject = weavejs.api.core.ILinkableObject;

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import ui from "../react-ui/ui";
import MiscUtils from "../utils/MiscUtils";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import * as Prefixer from "react-vendor-prefix";
import ToolTip from "./ToolTip";

import IBinningDefinition = weavejs.api.data.IBinningDefinition;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import KeySet = weavejs.data.key.KeySet;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";
const SHAPE_TYPE_BOX:string = "box";

export default class ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements weavejs.api.core.ILinkableObjectWithNewProperties
{
	panelTitle = Weave.linkableChild(this, LinkableString);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	dynamicColorColumn = Weave.linkableChild(this, DynamicColumn);
	maxColumns = Weave.linkableChild(this, new LinkableNumber(1));
	shapeSize = Weave.linkableChild(this, new LinkableNumber(25));
	shapeType = Weave.linkableChild(this, new LinkableString(SHAPE_TYPE_BOX));
	showLegendName = Weave.linkableChild(this, new LinkableBoolean(true));
	//lineStyle = Weave.linkableChild(this, SolidLineStyle);
	
	private get colorColumn() { return this.dynamicColorColumn.target as ColorColumn; }
	private get binnedColumn() { var cc = this.colorColumn; return cc ? cc.getInternalColumn() as BinnedColumn : null; }
	private get binningDefinition() { var bc = this.binnedColumn ; return bc ? bc.binningDefinition.target as IBinningDefinition : null; }
	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }
	
	private spanStyle:CSSProperties;

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
			textAlign: "left",
			verticalAlign: "middle",
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			padding: 5,
			userSelect: "none"
		};
	}

	get deprecatedStateMapping():Object
	{
		return {children: {visualization: {plotManager: {plotters: {plot: this}}}}};
	}
	
	get title():string
	{
		return this.panelTitle.value;
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

	handleProbe(bin:number, mouseOver:boolean, event:React.MouseEvent):void
	{
		if (mouseOver)
		{
			var _binnedKeysArray:IQualifiedKey[][] = (this.binnedColumn as any)['_binnedKeysArray'];
			var columnNamesToValue:{[columnName:string] : string} = ToolTip.getToolTipData(this, _binnedKeysArray[bin]);
			this.probeKeySet.replaceKeys(_binnedKeysArray[bin]);
			if (this.props.toolTip && !this.props.toolTip.state.showToolTip && _binnedKeysArray[bin].length)
				this.props.toolTip.setState({
					x: event.pageX,
					y: event.pageY,
					showToolTip: true,
					title: this.panelTitle.value,
					columnNamesToValue: columnNamesToValue
				});
		}
		else
		{
			this.probeKeySet.replaceKeys([]);
			if (this.props.toolTip && this.props.toolTip.state.showToolTip)
				this.props.toolTip.setState({
					showToolTip: false
				});
		}
	}

	componentDidMount()
	{
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
			width: "100%",
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
			var width:number = this.props.style.width as number;
			var height:number = this.props.style.height as number;
			var shapeSize:number = this.shapeSize.value;
			var shapeType:string = this.shapeType.value;
			var maxColumns:number = this.maxColumns.value;
			var columnFlex:number = 1.0/maxColumns;
			var extraBins:number = this.numberOfBins % maxColumns == 0 ? 0 : maxColumns - this.numberOfBins % maxColumns;
			var totalBins:number = this.numberOfBins + extraBins;
			var yScale:Function = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
			var yMap:Function = (d:number):number => { return yScale(d); };

			shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
			var r:number = (shapeSize / 100 * height / this.numberOfBins) / 2;
			var textLabelFunction:Function = this.binnedColumn.deriveStringFromNumber.bind(this.binnedColumn);
			var finalElements:any[] = [];
			var prefixerStyle:{} = Prefixer.prefix({styles: this.spanStyle}).styles;

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
										<ui.HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
											{weavejs.WeaveAPI.Locale.reverseLayout ?
											<ui.HBox style={{width:"100%", flex:0.8, alignItems:"center", justifyContent:"flex-end"}}>
												<span style={ prefixerStyle }>{ Weave.lang(textLabelFunction(i)) }</span>
											</ui.HBox>:""}
											<ui.HBox style={{width:"100%", flex:0.2,minWidth:10, position:"relative", padding:"0px 0px 0px 0px"}}>
												<svg style={{position:"absolute"}}
													 viewBox="0 0 100 100" width="100%" height="100%">
													{
														shapeElement
													}
												</svg>
											</ui.HBox>
											{weavejs.WeaveAPI.Locale.reverseLayout ?
												"":<ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
												<span style={ prefixerStyle }>{ Weave.lang(textLabelFunction(i)) }</span>
											</ui.HBox>}
										</ui.HBox>
									);
								}
								else
								{
									element.push(
										<ui.HBox key={i} style={{width:"100%", flex:1.0}}/>
									);
								}
							}
						}

						elements.push(
							<ui.VBox key={i} style={{flex: columnFlex, padding: "5px"}}> { element } </ui.VBox>
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
										<ui.HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
											<ui.HBox style={{
												width:"100%", flex:1.0,
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
											</ui.HBox>
										</ui.HBox>
									);
								}
								else
								{
									element.push(
										<ui.HBox key={i} style={{width:"100%", flex:1.0}}/>
									);
								}
							}
						}

						elements.push(
							<ui.VBox key={i} style={{flex: columnFlex, padding: "5px"}}> { element } </ui.VBox>
						);

						finalElements[j] = elements;
					}
				}
			}

			return (<div style={{width:"100%", height:"100%", padding:"0px 5px 0px 5px"}}>
				<ui.VBox style={{height:"100%",flex: 1.0, overflow:"hidden"}}>
					{this.showLegendName.value ?
						<ui.HBox style={{width:"100%", flex: 0.1, alignItems:"center"}}>
							<span style={prefixerStyle}>{Weave.lang(this.dynamicColorColumn.getMetadata('title'))}</span>
						</ui.HBox>
						: null
					}
					<ui.HBox style={{width:"100%", flex: 0.9}}> { finalElements } </ui.HBox>
				</ui.VBox>
			</div>);
		}
		else
		{
			//Continuous plot case
			return (<svg></svg>);
		}
	}
}

Weave.registerClass("weavejs.tool.ColorLegend", ColorLegend, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::ColorBinLegendTool", ColorLegend);
