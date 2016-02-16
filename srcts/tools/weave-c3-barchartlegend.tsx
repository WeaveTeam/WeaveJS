// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../react-ui/ui.tsx"/>
///<reference path="../../typings/react/react-dom.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import ui from "../react-ui/ui";
import StandardLib from "../utils/StandardLib";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import * as Prefixer from "react-vendor-prefix";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ColorRamp = weavejs.util.ColorRamp;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableNumber = weavejs.core.LinkableNumber;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeySet = weavejs.data.key.DynamicKeySet;
import LinkableString = weavejs.core.LinkableString;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";

export default class WeaveC3BarChartLegend extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    private chartColors = Weave.linkableChild(this, ColorRamp);
    private columns = Weave.linkableChild(this, new LinkableHashMap(ReferencedColumn));
    private maxColumns = Weave.linkableChild(this, LinkableNumber);
    private panelTitle = Weave.linkableChild(this, LinkableString);
    private shapeSize = Weave.linkableChild(this, LinkableNumber);

    private filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
    private selectionKeySet = Weave.linkableChild(this, DynamicKeySet);
    private probeKeySet = Weave.linkableChild(this, DynamicKeySet);

    private spanStyle:CSSProperties;
    private numberOfLabels:number;

    constructor(props:IVisToolProps) {
        super(props);

        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
        this.selectionKeySet.targetPath = ['defaultSelectionKeySet'];
        this.probeKeySet.targetPath = ['defaultProbeKeySet'];


        this.state = {selected:[], probed:[]};
        this.spanStyle = {textAlign:"left", verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingLeft:5, userSelect:"none"};
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
                                "maxColumns": this.maxColumns,
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

    get title():string {
        return this.panelTitle.value ? this.panelTitle.value : Weave.getRoot(this).getName(this);
    }

    handleClick(label:number,temp:any):void {

    }

    handleProbe(bin:number, mouseOver:boolean):void {

    }

    componentDidMount() {
        this.maxColumns.addGroupedCallback(this, this.forceUpdate);
        this.filteredKeySet.addGroupedCallback(this, this.forceUpdate);
        this.shapeSize.addGroupedCallback(this, this.forceUpdate, true);
    }

    componentDidUpdate() {
    }

    drawContinuousPlot() {

    }

    selectionKeysChanged() {

    }

    probeKeysChanged() {

    }

    visualizationChanged() {

    }

    componentWillUnmount() {
    }

    getInteractionStyle(bin:number):CSSProperties {
        var selectedStyle:CSSProperties = {
            width:"100%",
            flex:1.0,
            borderWidth:0,
            borderColor:"black",
            borderStyle:"solid",
            opacity: 1.0
        };
        return selectedStyle;
    }

    render() {
        var width:number = this.props.style.width as number;
        var height:number = this.props.style.height as number;
        var shapeSize = this.shapeSize.value;
        this.numberOfLabels = this.columns.getObjects().length;
        var maxColumns = 1 // = this.maxColumns.value; Only one column actually supported right now.
        var columnFlex:number = 1.0/maxColumns;
        var extraBins:number = this.numberOfLabels % maxColumns == 0 ? 0 : maxColumns-(this.numberOfLabels % maxColumns);
        var ramp:any[] = this.chartColors.state as any[];

        var labels: string[] = this.columns.getObjects().map((item: ReferencedColumn) => item.getMetadata('title'));

        var finalElements:any[] = [];
        var prefixerStyle:{} = Prefixer.prefix({styles: this.spanStyle}).styles;
        for(var j:number = 0; j<maxColumns; j++) {

            var element:JSX.Element[] = [];
            var elements:JSX.Element[] = [];
            for(var i=0; i<this.numberOfLabels+extraBins; i++) {
                if(i%maxColumns == j) {

                    if(i<this.numberOfLabels){
                        element.push(
                            <ui.HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
                                <ui.HBox style={{width:shapeSize, position:"relative", padding:"0px 0px 0px 0px"}}>
                                    <svg style={{position:"absolute"}} width="100%" height="100%">
                                        <rect x={0} y={10} height="80%" width={shapeSize} style={{fill:"#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfLabels - 1), ramp)), stroke:"black", strokeOpacity:0.5}}></rect>
                                    </svg>
                                </ui.HBox>
                                <ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
                                    <span style={prefixerStyle}>{labels[i]}</span>
                                </ui.HBox>
                            </ui.HBox>
                        );
                    }else{
                        element.push(
                            <ui.HBox key={i} style={{width:"100%", flex:1.0}}/>
                        );
                    }
                }
            }
            {
                this.props.style.width > this.props.style.height * 2 ?
                    elements.push(
                        <ui.HBox key={i} style={{width:"100%", flex: columnFlex}}>
                            {
                                element
                                }
                        </ui.HBox>
                    )
                    :
                    elements.push(
                        <ui.VBox key={i} style={{height:"100%", flex: columnFlex}}>
                            {
                                element
                                }
                        </ui.VBox>
                    );

            }

            finalElements[j] = elements;
        }

        return (<div style={{width:"100%", height:"100%", padding:"0px 5px 0px 5px"}}>
            <ui.VBox style={{height:"100%",flex: 1.0, overflow:"hidden"}}>
                <ui.HBox style={{width:"100%", flex: 0.1, alignItems:"center"}}>
                    <span style={prefixerStyle}>Bar color</span>
                </ui.HBox>
                {
                    this.props.style.width > this.props.style.height * 2 ?
                    <ui.HBox style={{width:"100%", flex: 0.9}}> {
                        finalElements
                        }
                    </ui.HBox>
                        :
                    <ui.VBox style={{height:"100%", flex: 0.9}}> {
                        finalElements
                        }
                    </ui.VBox>

                    }
            </ui.VBox>
        </div>);
    }
}

Weave.registerClass("weavejs.tool.BarChartLegend", WeaveC3BarChartLegend, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::BarChartLegendTool", WeaveC3BarChartLegend);
