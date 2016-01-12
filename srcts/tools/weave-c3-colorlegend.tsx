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
import CSSProperties = __React.CSSProperties;

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
        this.state = {selected:[], probed:[]};
    }

    private setupCallbacks() {
        this.dynamicColorColumnPath.addCallback(this, this.forceUpdate);
        this.maxColumnsPath.addCallback(this, this.forceUpdate);
        this.filteredKeySet.addCallback(this, this.forceUpdate);
        this.plotterPath.push("shapeSize").addCallback(this, this.forceUpdate);
        this.binnedColumnPath.addCallback(this, this.forceUpdate);
        this.toolPath.selection_keyset.addCallback(this, this.forceUpdate);
        this.toolPath.probe_keyset.addCallback(this, this.forceUpdate);
    }

    getBinIndexFromKey(key:any):number {
        return this.binnedColumnPath.getObject().getValueFromKey(key,Number);
    }

    getSelectedBins():number[] {
        var keys = this.toolPath.selection_keyset.getKeys();
        var selectedBins:number[] = [];
        keys.forEach( (key:string) => {
            selectedBins.push(this.getBinIndexFromKey(key));
        });
        return selectedBins;
    }

    getProbedBins():number[] {
        var keys = this.toolPath.probe_keyset.getKeys();
        var probedBins:number[] = [];
        keys.forEach( (key:string) => {
            probedBins.push(this.getBinIndexFromKey(key));
        });
        return probedBins;
    }

    handleClick(bin:number):void {
        var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;
        //setKeys
        if(this.keyDown) {
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

        var probedBins:number[] = this.getProbedBins();
        if(probedBins.length){
            if (probedBins.indexOf(bin) >= 0) {
                selectedStyle.opacity = 1;
            }else{
                selectedStyle.opacity = 0.3;
            }
        }
        var selectedBins:number[] = this.getSelectedBins();
        if (selectedBins.length) {
            if (selectedBins.indexOf(bin) >= 0) {
                selectedStyle.borderWidth = 1;
            }else if(probedBins.indexOf(bin) == -1){
                selectedStyle.opacity = 0.3;
            }
        }
        return selectedStyle;
    }

    render() {
        this.numberOfBins = this.binnedColumnPath.getValue("this.numberOfBins");
        if(this.numberOfBins) {
            //Binned plot case
            var width:number = this.props.width;
            var height:number = this.props.height;
            var shapeSize:number = this.plotterPath.getState("shapeSize");
            var shapeType:string = this.plotterPath.getState("shapeType");
            var maxColumns:number = 1;//TODO: This should really be "this.maxColumnsPath.getState();" but only supporting 1 column for now
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
                                        <ui.HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
                                                <ui.HBox style={{width:"100%", flex:0.2,minWidth:10, position:"relative", padding:"0px 0px 0px 0px"}}>
                                                    <svg style={{position:"absolute"}}
                                                         viewBox="0 0 100 100" width="100%" height="100%">
                                                        <circle cx="50%" cy="50%" r="45%" style={{fill:"#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfBins - 1), ramp)), stroke:"black", strokeOpacity:0.5}}></circle>
                                                    </svg>
                                                </ui.HBox>
                                                <ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
                                                     <span style={{textAlign:"left",verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingLeft:5}}>{textLabelFunction(i)}</span>
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
                            this.props.width > this.props.height ?
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
                        <span style={{textAlign:"left",fontFamily:"sans-serif", fontSize:"12px", verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{this.dynamicColorColumnPath.getValue("this.getMetadata('title')")}</span>
                    </ui.HBox>
                    {
                        this.props.width > this.props.height ?
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
        else{
            //Continuous plot case
            return (<svg></svg>);
        }
    }
}


export default WeaveC3ColorLegend;

registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);