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

interface IColorLegendState {

}


class WeaveC3ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {
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
    private selectionStatus:{[bin:number]: boolean};
    private probeStatus:{[bin:number]: boolean};

    constructor(props:IVisToolProps) {
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
        this.state = {selected:[], probed:[]};
        this.selectedBins = [];
        this.spanStyle = {textAlign:"left",verticalAlign:"middle", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", paddingLeft:5, userSelect:"none"};
        this.selectionStatus = {};
        this.probeStatus = {};
    }

    get title():string {
       return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
    }

    get numberOfBins():number {
        return this.binnedColumnPath.getObject().numberOfBins;
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    private setupCallbacks() {
        this.dynamicColorColumnPath.addCallback(this, this.forceUpdate);
        this.maxColumnsPath.addCallback(this, this.forceUpdate);
        this.filteredKeySet.addCallback(this, this.forceUpdate);
        this.plotterPath.push("shapeSize").addCallback(this, this.forceUpdate);
        this.binnedColumnPath.addCallback(this, this.forceUpdate);
        this.toolPath.selection_keyset.addCallback(this, this.setSelectedBins);
        this.toolPath.probe_keyset.addCallback(this, this.setProbedBins);
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
        return _.unique(selectedBins);
    }

    getProbedBins():number[] {
        var keys = this.toolPath.probe_keyset.getKeys();
        var probedBins:number[] = [];
        keys.forEach( (key:string) => {
            probedBins.push(this.getBinIndexFromKey(key));
        });
        return _.unique(probedBins);
    }

    setSelectedBins():void {
        var selectedBins = this.getSelectedBins();
        for(var iBin:number = 0; iBin < this.numberOfBins; iBin++) {
            if(selectedBins.indexOf(iBin) > -1) {
                this.selectionStatus[iBin] = true;
            } else {
                this.selectionStatus[iBin] = false;
            }
        }
        this.forceUpdate();
    }

    setProbedBins():void {
        var probed = this.getProbedBins();
        for(var iBin:number = 0; iBin < this.numberOfBins; iBin++) {
            if(probed.indexOf(iBin) > -1) {
                this.probeStatus[iBin] = true;
            } else {
                this.probeStatus[iBin] = false;
            }
        }
        this.forceUpdate();
    }

    handleClick(bin:number, event:React.MouseEvent):void {
        var binnedKeys:any[] = this.binnedColumnPath.getObject()._binnedKeysArray;

        // multiple selection mode
        if(event.ctrlKey || event.metaKey) {
            if(this.selectionStatus[bin]) { // if the bin is already selected, remove it
                var obj:Object = {};
                this.selectionStatus[bin] = false;
                this.toolPath.selection_keyset.removeKeys(this.binnedColumnPath.getObject().getKeysFromBinIndex(bin));
            } else { // otherwise we add it.
                var obj:Object = {};
                this.selectionStatus[bin] = true;
                this.toolPath.selection_keyset.addKeys(this.binnedColumnPath.getObject().getKeysFromBinIndex(bin));
            }
        }
        // single selection mode
        else {
            for(var iBin:number = 0; iBin < this.numberOfBins; iBin++) {
                if(bin == iBin) {
                    this.selectionStatus[iBin] = true;
                    this.toolPath.selection_keyset.setKeys(this.binnedColumnPath.getObject().getKeysFromBinIndex(bin));
                } else {
                    this.selectionStatus[iBin] = false;
                }
            }
        }
    }

    handleProbe(bin:number, mouseOver:boolean):void {
        if(mouseOver){
            this.probeStatus[bin] = true;
            this.toolPath.probe_keyset.setKeys(this.binnedColumnPath.getObject().getKeysFromBinIndex(bin));
        }else{
            this.probeStatus[bin] = false;
            this.toolPath.probe_keyset.setKeys([]);
        }
    }

    componentDidMount() {
        this.setupCallbacks();
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

        if(this.probeStatus[bin]){
            selectedStyle.opacity = 1;
        } else {
            selectedStyle.opacity = 0.3;
        }

        if(this.selectionStatus[bin]){
            selectedStyle.borderWidth = 1;
            selectedStyle.opacity = 1;
        } else {
            selectedStyle.opacity = 0.3;
        }
        // if none of the bins are selected or probed
        // the opacity should be 1

        return selectedStyle;
    }

    render() {
        if(this.numberOfBins) {
            //Binned plot case
            var width:number = this.props.style.width;
            var height:number = this.props.style.height;
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
            var bc:any = this.binnedColumnPath.getObject();
            var textLabelFunction:Function = bc.deriveStringFromNumber.bind(bc);
            var finalElements:any[] = [];
            var prefixerStyle:{} = Prefixer.prefix({styles: this.spanStyle}).styles;
            for(var j:number = 0; j<maxColumns; j++) {
                switch(shapeType) {
                    case SHAPE_TYPE_CIRCLE :
                    {
                        var element:JSX.Element[] = [];
                        var elements:JSX.Element[] = [];
                        for(var i:number = 0; i < this.numberOfBins + extraBins; i++) {
                            if(i%maxColumns == j) {

                                if(i < this.numberOfBins){
                                    element.push(
                                        <ui.HBox key={i} style={this.getInteractionStyle(i)} onClick={this.handleClick.bind(this, i)} onMouseOver={this.handleProbe.bind(this, i, true)} onMouseOut={this.handleProbe.bind(this, i, false)}>
                                                <ui.HBox style={{width:"100%", flex:0.2,minWidth:10, position:"relative", padding:"0px 0px 0px 0px"}}>
                                                    <svg style={{position:"absolute"}}
                                                         viewBox="0 0 100 100" width="100%" height="100%">
                                                        <circle cx="50%" cy="50%" r="45%" style={{fill:"#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, this.numberOfBins - 1), ramp)), stroke:"black", strokeOpacity:0.5}}></circle>
                                                    </svg>
                                                </ui.HBox>
                                                <ui.HBox style={{width:"100%", flex:0.8, alignItems:"center"}}>
                                                     <span style={prefixerStyle}>{textLabelFunction(i)}</span>
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
        else{
            //Continuous plot case
            return (<svg></svg>);
        }
    }
}

export default WeaveC3ColorLegend;

registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
//Weave.registerClass("weavejs.tools.ColorBinLegendTool", WeaveC3ColorLegend, [weavejs.api.core.ILinkableObjectWithNewProperties]);
