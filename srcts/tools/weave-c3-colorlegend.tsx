/// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>

import AbstractWeaveTool from "./AbstractWeaveTool";
import {IAbstractWeaveToolProps, IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import StandardLib from "../Utils/StandardLib";
import * as d3 from "d3";

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";

export default class WeaveC3ColorLegent extends AbstractWeaveTool {

    private plotterPath:WeavePath;
    private dynamicColorColumnPath:WeavePath;
    private binningDefinition:WeavePath;
    private binnedColumnPath:WeavePath;
    private svg:d3.Selection<SVGElement>;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.plotterPath = this.toolPath.pushPlotter("plot");
        this.dynamicColorColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null).push("binningDefinition").push(null);
        this.binnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn", null);
        this.setupCallbacks();
    }

    private setupCallbacks() {
        this.dynamicColorColumnPath.addCallback(this, _.debounce(this.forceUpdate.bind(this), 0));
    }

    componentDidMount() {
        super.componentDidMount();
        this.svg = d3.select(this.element).append("svg");
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        var numberOfBins:number = this.binnedColumnPath.getValue("numberOfBins");

        if(numberOfBins) {
            this.drawBinnedPlot(numberOfBins)
        } else {
            this.drawContinousPlot();
        }
    }

    drawContinousPlot() {

    }
    drawBinnedPlot(numberOfBins:number) {
        // clear the svg and rerender everything
        this.svg.selectAll("*").remove();

        var width:number = this.element.clientWidth;
        var height:number = this.element.clientHeight;

        var shapeSize:number = this.plotterPath.getState("shapeSize");
        var shapeType:string = this.plotterPath.getState("shapeType");

        var ramp:any[] = this.dynamicColorColumnPath.getState("ramp");

        var yScale:Function = d3.scale.linear().domain([0, numberOfBins + 1]).range([0, height]);

        var yMap:Function = (d:number):number => { return yScale(d); };

        if(width && height && numberOfBins) {
            this.svg.attr("width", width).attr("height", height);
        }

        this.svg.append("text")
                .attr("y", yMap(0.5))
                .attr("x", 10)
                .text(this.dynamicColorColumnPath.getValue("ColumnUtils.getTitle(this)"))
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "12px");

        shapeSize = _.max([1, _.min([shapeSize, height / numberOfBins])]);

        let r:number = (shapeSize / 100 * height / numberOfBins) / 2;

        var textLabelFunction = this.binnedColumnPath.getValue("deriveStringFromNumber");

        for(var i = 0; i < numberOfBins; i++) {
            switch(shapeType) {
                case SHAPE_TYPE_CIRCLE :
                    this.svg.append("circle")
                             .attr("cx", 25)
                             .attr("cy", yMap(i + 1))
                             .attr("r", r)
                             .style("fill", "#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, numberOfBins - 1), ramp)))
                             .style("stroke", "black")
                             .style("stroke-opacity", 0.5);
                    this.svg.append("text")
                             .attr("x", 50)
                             .attr("y", yMap(i + 1) + r / 2)
                             .text(textLabelFunction(i))
                             .attr("font-family", "sans-serif")
                             .attr("font-size", "12px");
                    break;
                case SHAPE_TYPE_SQUARE :
                    break;

                case SHAPE_TYPE_LINE :
                    break;
            }
        }
    }

    selectionKeysChanged() {

    }

    visualizationChanged() {

    }

    componentWillUnmount() {
        this.element.remove();
        super.componentWillUnmount();
    }
}
