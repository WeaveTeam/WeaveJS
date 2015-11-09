import AbstractWeaveTool from "./AbstractWeaveTool.js";
import {registerToolImplementation} from "./WeaveTool.jsx";
import lodash from "lodash";
import StandardLib from "./Utils/StandardLib";
import d3 from "d3";

const SHAPE_TYPE_CIRCLE = "circle";
const SHAPE_TYPE_SQUARE = "square";
const SHAPE_TYPE_LINE = "line";

class WeaveC3ColorLegend extends AbstractWeaveTool {

    constructor(props) {
        super(props);
        this._svg = d3.select(this.element).append("svg");
        this.lookup = {};
        this._plotterPath = this.toolPath.pushPlotter("plot");
        this.dynamicColorColumnPath = this._plotterPath.push("dynamicColorColumn", null);
        this._binningDefinition = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null).push("binningDefinition").push(null);
        this._binnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn", null);
        this._setupCallbacks();

        this.update = lodash.debounce(this._update.bind(this), 20);
        this.update();
    }

    _setupCallbacks() {
        this.dynamicColorColumnPath.addCallback(lodash.debounce(this.drawAll.bind(this), 20), true, false);
    }

   _sizeChanged() {
        this.drawAll();
    }

    resize () {
        this._sizeChanged();
    }

    _dataChanged() {

    }

    drawAll() {
        if (!this.dynamicColorColumnPath.getType(null)) {
            return; // draw nothing
        }

        var numberOfBins = this._binnedColumnPath.getValue("numberOfBins");

        if(numberOfBins) {
            this.drawBinnedPlot(numberOfBins);
        } else {
            this.drawContinuousPlot();
        }
    }

    drawContinuousPlot() {

    }

    drawBinnedPlot(numberOfBins) {
        // clear the svg and rerender everything
        this._svg.selectAll("*").remove();

        var width = this.element.clientWidth;
        var height = this.element.clientHeight;

        var _shapeSize = this._plotterPath.getState("shapeSize");
        var _shapeType = this._plotterPath.getState("shapeType");

        // var xShapeOffset = _shapeSize / 2;
        var ramp = this.dynamicColorColumnPath.getState("ramp");

        var yScale = d3.scale.linear()
                             .domain([0, numberOfBins + 1])
                             .range([0, height]);

        /* var xScale = d3.scale.linear()
                             .domain([0, numberOfBins + 1])
                             .range([0, width]); */


        var yMap = (d) => { return yScale(d); };

        //var xMap = (d) => { return xScale(d); };

        //var rMap = (d) => { return rScale(d); };
        if(width && height && numberOfBins) {
            this._svg.attr("width", width)
                     .attr("height", height);
        }

        this._svg.append("text")
                 .attr("y", yMap(0.5))
                 .attr("x", 10)
                 .text(this.dynamicColorColumnPath.getValue("ColumnUtils.getTitle(this)"))
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "12px");

        _shapeSize = lodash.max([1, lodash.min([_shapeSize, height / numberOfBins])]);

        let r = (_shapeSize / 100 * height / numberOfBins) / 2;

        var BinnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn", null);
        var textLabelFunction = BinnedColumnPath.getValue("deriveStringFromNumber");

        for(var i = 0; i < numberOfBins; i++) {
            switch(_shapeType) {
                case SHAPE_TYPE_CIRCLE :
                    this._svg.append("circle")
                             .attr("cx", 25)
                             .attr("cy", yMap(i + 1))
                             .attr("r", r)
                             .style("fill", "#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, numberOfBins - 1), ramp)))
                             .style("stroke", "black")
                             .style("stroke-opacity", 0.5);
                    this._svg.append("text")
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

    _selectionKeysChanged() {

    }

    _visualizationChanged() {

    }

    _updateStyle() {

    }

    _update() {
        this._updateStyle();
    }

    destroy() {
        this.element.remove();
    }
}

export default WeaveC3ColorLegend;

registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
