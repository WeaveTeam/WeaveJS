/// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../react-ui/ui.tsx"/>
///<reference path="../../typings/react/react-dom.d.ts"/>



import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import ui from "../react-ui/ui";
import {IAbstractWeaveToolProps, IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import StandardLib from "../utils/StandardLib";
import * as ReactDOM from "react-dom";

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";

class WeaveC3ColorLegend extends AbstractWeaveTool {
    constructor(props:IAbstractWeaveToolProps) {
        super(props);
    }

    componentDidUpdate() {
        var elementSize = this.element ? this.getElementSize() : null;
        ReactDOM.render(
            <ColorLegend toolPath={this.toolPath} width={elementSize.width} height={elementSize.height}/>
            , this.element);
    }
}

interface IColorLegendProps {
    toolPath:WeavePath;
    width:number;
    height:number;
}

class ColorLegend extends React.Component<IColorLegendProps, any> {

    private plotterPath:WeavePath;
    private dynamicColorColumnPath:WeavePath;
    private binningDefinition:WeavePath;
    private binnedColumnPath:WeavePath;
    private maxColumnsPath:WeavePath;
    private filteredKeySet:WeavePath;
    private selectionKeySet:WeavePath;
    private probeKeySet:WeavePath;
    private numberOfBins:number;
    private toolPath:WeavePath;

    private keyDown:boolean;

    constructor(props:IColorLegendProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.plotterPath = this.toolPath.pushPlotter("plot");
        this.dynamicColorColumnPath = this.plotterPath.push("dynamicColorColumn", null);
        this.binningDefinition = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null).push("binningDefinition").push(null);
        this.binnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn", null);
        this.maxColumnsPath = this.plotterPath.push("maxColumns");
        this.filteredKeySet = this.plotterPath.push("filteredKeySet");
        this.selectionKeySet = this.toolPath.push("selectionKeySet");
        this.probeKeySet = this.toolPath.push("probeKeySet");
        this.numberOfBins = this.binnedColumnPath.getValue("this.numberOfBins");
    }

    private setupCallbacks() {
        this.dynamicColorColumnPath.addCallback(this, this.forceUpdate);
        this.maxColumnsPath.addCallback(this, this.forceUpdate);
        this.filteredKeySet.addCallback(this,this.forceUpdate);
    }

    handleClick(bin:number):void {
        var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;
        //setKeys
        if(!this.keyDown) {
            this.toolPath.selection_keyset.addKeys(binnedKeys[bin]);
        }else {
            this.toolPath.selection_keyset.setKeys(binnedKeys[bin]);
        }
    }

    handleProbe(bin:number, mouseOver:boolean):void {
        if(mouseOver){
            var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;
            this.toolPath.probe_keyset.setKeys(binnedKeys[bin]);
        }else{
            this.toolPath.probe_keyset.setKeys([]);
        }

    }

    toggleKey(event:KeyboardEvent):void {
        if((event.keyCode === 17)||(event.keyCode === 91) || (event.keyCode === 224)) {
            this.keyDown = !this.keyDown;
        }
    }

    componentDidMount() {
        this.setupCallbacks();
        document.addEventListener("keydown", this.toggleKey.bind(this));
        document.addEventListener("keyup", this.toggleKey.bind(this));
    }

    componentDidUpdate() {
    }

    drawContinuousPlot() {

    }
    //drawBinnedPlot(numberOfBins:number) {
    //    // clear the svg and rerender everything
    //    this.svg.selectAll("*").remove();
    //
    //    var width:number = this.element.clientWidth;
    //    var height:number = this.element.clientHeight;
    //
    //    var shapeSize:number = this.plotterPath.getState("shapeSize");
    //    var shapeType:string = this.plotterPath.getState("shapeType");
    //
    //    var ramp:any[] = this.dynamicColorColumnPath.getState("ramp");
    //
    //    var yScale:Function = d3.scale.linear().domain([0, numberOfBins + 1]).range([0, height]);
    //
    //    var yMap:Function = (d:number):number => { return yScale(d); };
    //
    //    if(width && height && numberOfBins) {
    //        this.svg.attr("width", width).attr("height", height);
    //    }
    //
    //    this.svg.append("text")
    //            .attr("y", yMap(0.5))
    //            .attr("x", 10)
    //            .text(this.dynamicColorColumnPath.getValue("this.getMetadata('title')"))
    //             .attr("font-family", "sans-serif")
    //             .attr("font-size", "12px");
    //
    //    shapeSize = _.max([1, _.min([shapeSize, height / numberOfBins])]);
    //
    //    let r:number = (shapeSize / 100 * height / numberOfBins) / 2;
    //
    //    var textLabelFunction:Function = this.binnedColumnPath.getValue("this.deriveStringFromNumber.bind(this)            ");
    //
    //    for(var i = 0; i < numberOfBins; i++) {
    //        switch(shapeType) {
    //            case SHAPE_TYPE_CIRCLE :
    //                this.svg.append("circle")
    //                         .attr("cx", 25)
    //                         .attr("cy", yMap(i + 1))
    //                         .attr("r", r)
    //                         .style("fill", "#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, numberOfBins - 1), ramp)))
    //                         .style("stroke", "black")
    //                         .style("stroke-opacity", 0.5);
    //                this.svg.append("text")
    //                         .attr("x", 50)
    //                         .attr("y", yMap(i + 1) + r / 2)
    //                         .text(textLabelFunction(i))
    //                         .attr("font-family", "sans-serif")
    //                         .attr("font-size", "12px");
    //                break;
    //            case SHAPE_TYPE_SQUARE :
    //                break;
    //
    //            case SHAPE_TYPE_LINE :
    //                break;
    //        }
    //    }
    //}

    selectionKeysChanged() {

    }

    probeKeysChanged() {

    }

    visualizationChanged() {

    }

    componentWillUnmount() {
    }

    render() {
        this.numberOfBins = this.binnedColumnPath.getValue("this.numberOfBins");
        if(this.numberOfBins) {
            //Binned plot case
            var width:number = this.props.width;
            var height:number = this.props.height;
            var shapeSize:number = this.plotterPath.getState("shapeSize");
            var shapeType:string = this.plotterPath.getState("shapeType");
            var maxColumns:number = this.maxColumnsPath.getState();
            var columnFlex:number = 1.0/maxColumns;
            var extraBins:number = this.numberOfBins%maxColumns == 0 ? 0 : maxColumns-(this.numberOfBins%maxColumns);
            var ramp:any[] = this.dynamicColorColumnPath.getState("ramp");
            var yScale:Function = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
            var yMap:Function = (d:number):number => { return yScale(d); };

            shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
            var r:number = (shapeSize / 100 * height / this.numberOfBins) / 2;
            var textLabelFunction:Function = this.binnedColumnPath.getValue("this.deriveStringFromNumber.bind(this)");
            var finalElements:any[] = [];
            for(var j:number = 0; j<maxColumns; j++) {
                switch(shapeType) {
                    case SHAPE_TYPE_CIRCLE :
                    {
                        var element:JSX.Element[] = [];
                        var elements:JSX.Element[] = [];
                        for(var i=0; i<this.numberOfBins+extraBins; i++) {
                            if(i%maxColumns == j) {

                                if(i<this.numberOfBins){
                                    element.push(
                                        <ui.HBox key={i} style={{width:"100%",flex:1.0}} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
                                                <ui.HBox style={{width:"100%", flex:0.2, position:"relative", padding:"0px 0px 0px 0px", minWidth:"10px"}}>
                                                    <svg style={{position:"absolute"}}
                                                         viewBox="0 0 100 100" width="100%" height="100%">
                                                        <circle cx="50%" cy="50%" r="45%" style={{fill:"#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfBins - 1), ramp)), stroke:"black", strokeOpacity:0.5}}></circle>
                                                    </svg>
                                                </ui.HBox>
                                                <ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
                                                     <span style={{textAlign:"left",verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", display:"table-cell"}}>{textLabelFunction(i)}</span>
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
                        elements.push(
                            <ui.VBox key={i} style={{width:"100%", flex: columnFlex}}>
                                    {
                                        element
                                    }
                            </ui.VBox>
                        );
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
                        <span style={{textAlign:"left",fontFamily:"sans-serif", fontSize:"12px", verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", display:"table-cell"}}>{this.dynamicColorColumnPath.getValue("this.getMetadata('title')")}</span>
                    </ui.HBox>
                    <ui.HBox style={{width:"100%", flex: 0.9}}> {
                        finalElements
                        }
                    </ui.HBox>
                </ui.VBox>
            </div>);
        }
        else{
            //Continuous plot case
            return (<svg></svg>);
        }
    }
}


export default WeaveC3ColorLegend;

registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);