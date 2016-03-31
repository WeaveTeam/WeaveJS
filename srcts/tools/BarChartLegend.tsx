import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import prefixer from "../react-ui/VendorPrefixer";
import {HBox, VBox} from "../react-ui/FlexBox";
import MiscUtils from "../utils/MiscUtils";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ColorRamp = weavejs.util.ColorRamp;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableNumber = weavejs.core.LinkableNumber;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeySet = weavejs.data.key.DynamicKeySet;
import LinkableString = weavejs.core.LinkableString;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";

export default class BarChartLegend extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties
{
	chartColors = Weave.linkableChild(this, ColorRamp);
	columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	//maxColumns = Weave.linkableChild(this, LinkableNumber);
	panelTitle = Weave.linkableChild(this, LinkableString);
	shapeSize = Weave.linkableChild(this, LinkableNumber);

	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionKeySet = Weave.linkableChild(this, DynamicKeySet);
	probeKeySet = Weave.linkableChild(this, DynamicKeySet);

	private spanStyle:CSSProperties;

	constructor(props:IVisToolProps)
	{
		super(props);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionKeySet.targetPath = ['defaultSelectionKeySet'];
		this.probeKeySet.targetPath = ['defaultProbeKeySet'];

		//this.maxColumns.addGroupedCallback(this, this.forceUpdate);
		this.filteredKeySet.addGroupedCallback(this, this.forceUpdate);
		this.shapeSize.addGroupedCallback(this, this.forceUpdate, true);

		this.state = {selected:[], probed:[]};
		this.spanStyle = {textAlign:"left", verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingLeft:5, userSelect:"none"};
	}

	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this) || Weave.getRoot(this).getName(this);
	}

	handleClick(label:number,temp:any):void 
	{

	}

	handleProbe(bin:number, mouseOver:boolean):void 
	{

	}

	getInteractionStyle(bin:number):CSSProperties 
	{
		var selectedStyle:CSSProperties = {
			flex:1.0,
			borderWidth:0,
			borderColor:"black",
			borderStyle:"solid",
			opacity: 1.0
		};
		return selectedStyle;
	}

	render()
	{
		var shapeSize = this.shapeSize.value;
		var labels:string[] = this.columns.getObjects(IAttributeColumn).map(item => item.getMetadata('title'));
		var maxColumns = 1; // = this.maxColumns.value; Only one column actually supported right now.
		var columnFlex:number = 1.0 / maxColumns;
		var extraBins:number = labels.length % maxColumns == 0 ? 0 : maxColumns - (labels.length % maxColumns);


		var finalElements:any[] = [];
		var prefixerStyle:{} = prefixer(this.spanStyle);
		for (var j:number = 0; j<maxColumns; j++)
		{
			var element:JSX.Element[] = [];
			var elements:JSX.Element[] = [];
			for (var i = 0; i < labels.length + extraBins; i++)
			{
				if (i % maxColumns == j)
				{
					if (i < labels.length)
					{
						element.push(
							<HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
								<HBox style={{width:shapeSize, position:"relative", padding:"0px 0px 0px 0px"}}>
									<svg style={{position:"absolute"}} width="100%" height="100%">
										<rect x={0} y={10} height="80%" width={shapeSize} style={{fill: this.chartColors.getHexColor(i, 0, labels.length - 1), stroke:"black", strokeOpacity:0.5}}></rect>
									</svg>
								</HBox>
								<HBox style={{flex:0.8, alignItems:"center"}}>
									<span style={prefixerStyle}>{Weave.lang(labels[i])}</span>
								</HBox>
							</HBox>
						);
					}
					else
					{
						element.push(
							<HBox key={i} style={{flex: 1.0}}/>
						);
					}
				}
			}

//			if (this.props.style.width > this.props.style.height * 2)
//				elements.push(
//					<HBox key={i} style={{flex: columnFlex}}>
//						{ element }
//					</HBox>
//				)
//			else
				elements.push(
					<VBox key={i} style={{flex: columnFlex}}>
						{ element }
					</VBox>
				);

			finalElements[j] = elements;
		}

		return (<div style={{flex: 1, padding:"0px 5px 0px 5px"}}>
			<VBox style={{flex: 1.0, overflow:"hidden"}}>
				<HBox style={{flex: 0.1, alignItems:"center"}}>
					<span style={prefixerStyle}>Bar color</span>
				</HBox>
				{
//					this.props.style.width > this.props.style.height * 2
//					?
//						<HBox style={{flex: 0.9}}>
//							{ finalElements }
//						</HBox>
//					:
						<VBox style={{flex: 0.9}}>
							{ finalElements }
						</VBox>
					}
			</VBox>
		</div>);
	}

	selectableAttributes = new Map<string, (IColumnWrapper | LinkableHashMap)>();

	renderEditor() : JSX.Element{
		return(<VBox></VBox>);
	}

	get deprecatedStateMapping()
	{
		return {
			"children": {
				"visualization": {
					"plotManager": {
						"plotters": {
							"plot": {
								"filteredKeySet": this.filteredKeySet,
								"chartColors": this.chartColors,
								//"maxColumns": this.maxColumns,
								"columns": this.columns,
								"shapeSize": this.shapeSize
							}
						}
					}
				}
			},
			"panelTitle": this.panelTitle
		};
	}
}

Weave.registerClass("weavejs.tool.BarChartLegend", BarChartLegend, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties], "Bar Chart Legend");
Weave.registerClass("weave.visualization.tools::BarChartLegendTool", BarChartLegend);
