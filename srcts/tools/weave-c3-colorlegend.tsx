// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
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
import StandardLib from "../utils/StandardLib";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import * as Prefixer from "react-vendor-prefix";

import WeavePath = weavejs.path.WeavePath;
import WeavePathData = weavejs.path.WeavePathData;
import WeavePathUI = weavejs.path.WeavePathUI;
import IBinningDefinition = weavejs.api.data.IBinningDefinition;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import KeySet = weavejs.data.key.KeySet;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";
const SHAPE_TYPE_BOX:string = "box";

export default class WeaveC3ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements weavejs.api.core.ILinkableObjectWithNewProperties
{
	panelTitle:LinkableString = Weave.linkableChild(this, LinkableString);
	filteredKeySet:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
	dynamicColorColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	maxColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
	shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(25));
	shapeType:LinkableString = Weave.linkableChild(this, new LinkableString(SHAPE_TYPE_CIRCLE));
	
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

	handleProbe(bin:number, mouseOver:boolean):void
	{
		if (mouseOver)
		{
			var _binnedKeysArray:IQualifiedKey[][] = (this.binnedColumn as any)['_binnedKeysArray'];
			this.probeKeySet.replaceKeys(_binnedKeysArray[bin]);
		}
		else
		{
			this.probeKeySet.replaceKeys([]);
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
			borderColor: StandardLib.rgba(0, 0, 0, borderAlpha),
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
			var maxColumns:number = 1;//TODO: This should really be "this.maxColumns.value" but only supporting 1 column for now
			var columnFlex:number = 1.0/maxColumns;
			var extraBins:number = this.numberOfBins % maxColumns == 0 ? 0 : maxColumns - this.numberOfBins % maxColumns;
			var ramp:any[] = this.colorColumn.ramp.state as any[];
			var yScale:Function = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
			var yMap:Function = (d:number):number => { return yScale(d); };

			shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
			var r:number = (shapeSize / 100 * height / this.numberOfBins) / 2;
			var textLabelFunction:Function = this.binnedColumn.deriveStringFromNumber.bind(this.binnedColumn);
			var finalElements:any[] = [];
			var prefixerStyle:{} = Prefixer.prefix({styles: this.spanStyle}).styles;
			for (var j:number = 0; j < maxColumns; j++)
			{
				switch (shapeType)
				{
					case SHAPE_TYPE_CIRCLE :
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
												<ui.HBox style={{width:"100%", flex:0.2,minWidth:10, position:"relative", padding:"0px 0px 0px 0px"}}>
													<svg style={{position:"absolute"}}
														 viewBox="0 0 100 100" width="100%" height="100%">
														<circle cx="50%" cy="50%" r="45%" style={{
															fill: "#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfBins - 1), ramp)),
															stroke: "black",
															strokeOpacity: 0.5
														}}/>
													</svg>
												</ui.HBox>
												<ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
													 <span style={ prefixerStyle }>{ textLabelFunction(i) }</span>
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

						if (this.props.style.width > this.props.style.height * 2)
						{
							if(weavejs.WeaveAPI.Locale.reverseLayout){
								element = element.reverse();
							}

							elements.push(
								<ui.HBox key={i} style={{width:"100%", flex: columnFlex}}> { element } </ui.HBox>
							);
						}
						else
						{
							elements.push(
								<ui.VBox key={i} style={{height:"100%", flex: columnFlex}}> { element } </ui.VBox>
							);
						}

						finalElements[j] = elements;
					}
						break;
					case SHAPE_TYPE_SQUARE :
						break;

					case SHAPE_TYPE_LINE :
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
												backgroundColor: StandardLib.hex2rgba(StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfBins - 1), ramp)),0.5)
											}}>
												<div style={{
															stroke: "black",
															strokeOpacity: 0.5,
															backgroundColor: "#FFF"
														}}>
													<span style={prefixerStyle}>{ textLabelFunction(i) }</span>
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

						if (this.props.style.width > this.props.style.height * 2)
						{
							if(weavejs.WeaveAPI.Locale.reverseLayout){
								element = element.reverse();
							}

							elements.push(
								<ui.HBox key={i} style={{width:"100%", flex: columnFlex, padding: "5px"}}> { element } </ui.HBox>
							);
						}
						else
						{
							elements.push(
								<ui.VBox key={i} style={{height:"100%", flex: columnFlex, padding: "5px"}}> { element } </ui.VBox>
							);
						}

						finalElements[j] = elements;
					}
				}
			}

			return (<div style={{width:"100%", height:"100%", padding:"0px 5px 0px 5px"}}>
				<ui.VBox style={{height:"100%",flex: 1.0, overflow:"hidden"}}>
					<ui.HBox style={{width:"100%", flex: 0.1, alignItems:"center"}}>
						<span style={prefixerStyle}>{this.dynamicColorColumn.getMetadata('title')}</span>
					</ui.HBox>
					{
						this.props.style.width > this.props.style.height * 2
						? <ui.HBox style={{width:"100%", flex: 0.9}}> { finalElements } </ui.HBox>
						: <ui.VBox style={{height:"100%", flex: 0.9}}> { finalElements } </ui.VBox>
				   	}
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

Weave.registerClass("weavejs.tool.ColorLegend", WeaveC3ColorLegend, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
