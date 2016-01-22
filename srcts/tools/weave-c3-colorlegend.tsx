// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../react-ui/ui.tsx"/>
///<reference path="../../typings/react/react-dom.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import ui from "../react-ui/ui";
import StandardLib from "../utils/StandardLib";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import * as Prefixer from "react-vendor-prefix";

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";

class WeaveC3ColorLegend extends React.Component<IVisToolProps, IVisToolState>
{
	private plotterPath:WeavePath;
	private dynamicColorColumnPath:WeavePath;
	private binningDefinition:WeavePath;
	private binnedColumnPath:WeavePath;
	private maxColumnsPath:WeavePath;
	private filteredKeySet:WeavePath;
	private selectionKeySet:WeavePath;
	private probeKeySet:WeavePath;
	protected toolPath:WeavePath;
	private spanStyle:CSSProperties;

	private selectedBins:number[];

	constructor(props:IVisToolProps)
	{
		super(props);
		this.toolPath = props.toolPath;
		this.plotterPath = this.toolPath.pushPlotter("plot");
		this.dynamicColorColumnPath = this.plotterPath.push("dynamicColorColumn", null);
		this.binningDefinition = this.dynamicColorColumnPath.push("internalDynamicColumn", null, "binningDefinition", null);
		this.binnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn", null);
		this.maxColumnsPath = this.plotterPath.push("maxColumns");
		this.filteredKeySet = this.plotterPath.push("filteredKeySet");
		this.selectionKeySet = this.toolPath.push("selectionKeySet");
		this.probeKeySet = this.toolPath.push("probeKeySet");
		this.state = {selected:[], probed:[]};
		this.selectedBins = [];
		this.spanStyle = {
			textAlign: "left",
			verticalAlign: "middle",
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			paddingLeft: 5,
			userSelect: "none"
		};
	}

	get title():string
	{
		return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
	}
	
	get numberOfBins():number
	{
		return this.binnedColumnPath.getObject().numberOfBins;
	}

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

	private setupCallbacks()
	{
		this.dynamicColorColumnPath.addCallback(this, this.forceUpdate);
		this.maxColumnsPath.addCallback(this, this.forceUpdate);
		this.filteredKeySet.addCallback(this, this.forceUpdate);
		this.plotterPath.push("shapeSize").addCallback(this, this.forceUpdate);
		this.binnedColumnPath.addCallback(this, this.forceUpdate);
		this.toolPath.selection_keyset.addCallback(this, this.forceUpdate);
		this.toolPath.probe_keyset.addCallback(this, this.forceUpdate);
	}

	getBinIndexFromKey(key:any):number
	{
		return this.binnedColumnPath.getObject().getValueFromKey(key,Number);
	}

	getSelectedBins():number[]
	{
		var keys = this.toolPath.selection_keyset.getKeys();
		var selectedBins:number[] = [];
		keys.forEach( (key:string) => {
			selectedBins.push(this.getBinIndexFromKey(key));
		});
		return _.unique(selectedBins);
	}

	getProbedBins():number[]
	{
		var keys = this.toolPath.probe_keyset.getKeys();
		var probedBins:number[] = [];
		keys.forEach( (key:string) => {
			probedBins.push(this.getBinIndexFromKey(key));
		});
		return _.unique(probedBins);
	}

	handleClick(bin:number, event:React.MouseEvent):void
	{
		var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;
		//setKeys
		if (_.contains(this.selectedBins,bin))
		{
			var currentSelection:any[] = this.toolPath.selection_keyset.getKeys();
			currentSelection = _.difference(currentSelection,binnedKeys[bin]);
			this.toolPath.selection_keyset.setKeys(currentSelection);
			_.remove(this.selectedBins, (value:number) =>{
				return value == bin;
			});
		}
		else
		{
			if ((event.ctrlKey || event.metaKey))
			{
				this.toolPath.selection_keyset.addKeys(binnedKeys[bin]);
				this.selectedBins.push(bin);
			}
			else
			{
				this.toolPath.selection_keyset.setKeys(binnedKeys[bin]);
				this.selectedBins = [bin];
			}
		}
	}

	handleProbe(bin:number, mouseOver:boolean):void
	{
		if (mouseOver)
		{
			var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;
			this.toolPath.probe_keyset.setKeys(binnedKeys[bin]);
		}
		else
		{
			this.toolPath.probe_keyset.setKeys([]);
		}
	}

	componentDidMount()
	{
		this.setupCallbacks();
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
			borderWidth: 1
		};
	}

	render()
	{
		if (this.numberOfBins)
		{
			//Binned plot case
			var width:number = this.props.style.width;
			var height:number = this.props.style.height;
			var shapeSize:number = this.plotterPath.getState("shapeSize");
			var shapeType:string = this.plotterPath.getState("shapeType");
			var maxColumns:number = 1;//TODO: This should really be "this.maxColumnsPath.getState();" but only supporting 1 column for now
			var columnFlex:number = 1.0/maxColumns;
			var extraBins:number = this.numberOfBins % maxColumns == 0 ? 0 : maxColumns - this.numberOfBins % maxColumns;
			var ramp:any[] = this.dynamicColorColumnPath.getState("ramp");
			var yScale:Function = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
			var yMap:Function = (d:number):number => { return yScale(d); };

			shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
			var r:number = (shapeSize / 100 * height / this.numberOfBins) / 2;
			var bc:any = this.binnedColumnPath.getObject();
			var textLabelFunction:Function = bc.deriveStringFromNumber.bind(bc);
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
				}
			}

			return (<div style={{width:"100%", height:"100%", padding:"0px 5px 0px 5px"}}>
				<ui.VBox style={{height:"100%",flex: 1.0, overflow:"hidden"}}>
					<ui.HBox style={{width:"100%", flex: 0.1, alignItems:"center"}}>
						<span style={prefixerStyle}>{this.dynamicColorColumnPath.getObject().getMetadata('title')}</span>
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


export default WeaveC3ColorLegend;

registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
//Weave.registerClass("weavejs.tools.ColorBinLegendTool", WeaveC3ColorLegend, [weavejs.api.core.ILinkableObjectWithNewProperties]);
