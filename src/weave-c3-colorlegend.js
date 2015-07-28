import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";
import lodash from "lodash";
import StandardLib from "./Utils/StandardLib";
import d3 from "d3";

const SHAPE_TYPE_CIRCLE:String = "circle";
const SHAPE_TYPE_SQUARE:String = "square";
const SHAPE_TYPE_LINE:String = "line";

export default class WeaveC3ColorLegend extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);
        this.lookup = {};
        this._plotterPath = toolPath.pushPlotter("plot");
        this.dynamicColorColumnPath = this._plotterPath.push("dynamicColorColumn").push(null);
        this._binningDefinition = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null).push("binningDefinition").push(null);

        this._filteredColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null).push("internalDynamicColumn").push(null);

        this._filteredColumn = {
            get keyFilter() { return this._filteredColumnPath.push("filter").getState(); },
            get internalDynamicColumn() { return this._filteredColumnPath.push("internalDynamicColumn").getState(); }
        };

        this._svg = d3.select(this.element[0]).append("svg");
        this._colorColumnPath.addCallback(lodash.debounce(this.drawAll.bind(this), true, false), 100);
        this.update();
    }

    _updateContents () {
        this._sizeChanged();
    }

    _dataChanged() {

    }

    _sizeChanged() {
        this.drawAll();
    }

    drawAll() {

        var internalColorColumn = this.dynamicColorColumnPath.getState();
        if (Array.isArray(internalColorColumn) && internalColorColumn.length === 0) {
            return; // draw nothing
        }

        var binnedColumn = this.dynamicColorColumnPath.push("internalDynamicColumn")
                                                  .push(null)
                                                  .push("internalDynamicColumn")
                                                  .push(null)
                                                  .push("internalDynamicColumn")
                                                  .push(null)
                                                  .getState();

        var numberOfBins = this.dynamicColorColumnPath.push("internalDynamicColumn")
                                               .push(null)
                                               .push("binningDefinition")
                                               .push(null)
                                               .push("numberOfBins")
                                               .getState();

        if(!Array.isArray(binnedColumn) && numberOfBins) {
            this.drawBinnedPlot();
        } else {
            this.drawContinuousPlot();
        }
    }

    drawContinuousPlot() {

    }

    drawBinnedPlot() {
        // clear the svg and rerender everything
        this._svg.selectAll("*").remove();

        var width = jquery(this.element).width();
        var height = jquery(this.element).height();

        var numOfBins = this.dynamicColorColumnPath.push("internalDynamicColumn")
                                               .push(null)
                                               .push("binningDefinition")
                                               .push(null)
                                               .push("numberOfBins")
                                               .getState();

        var _shapeSize = this._plotterPath.push("shapeSize").getState();
        var _shapeType = this._plotterPath.push("shapeType").getState();

        var xShapeOffset = _shapeSize / 2;
        var ramp = this.dynamicColorColumnPath.push("ramp").getState();

        if(!Array.isArray(ramp)) {
            ramp = ramp.split(",");
        }

        var yScale = d3.scale.linear()
                             .domain([0, numOfBins + 1])
                             .range([0, height]);

        var xScale = d3.scale.linear()
                             .domain([0, numOfBins + 1])
                             .range([0, width]);


        var yMap = (d) => { return yScale(d); };

        var xMap = (d) => { return xScale(d); };

        //var rMap = (d) => { return rScale(d); };

        if(width && height && numOfBins) {
            this._svg.attr("width", width)
                     .attr("height", height);
        }

        this._svg.append("text")
                 .attr("y", yMap(0.5))
                 .text(this.dynamicColorColumnPath.getValue("ColumnUtils.getTitle(this)"));

        _shapeSize = lodash.max([1, lodash.min([_shapeSize, height / numOfBins])]);

        let r = (_shapeSize / 100 * height / numOfBins) / 2;

        var BinnedColumnPath = this.dynamicColorColumnPath.push("internalDynamicColumn").push(null);
        var textLabelFunction = BinnedColumnPath.getValue("deriveStringFromNumber");

        for(var i = 0; i < numOfBins; i++) {
            switch(_shapeType) {
                case SHAPE_TYPE_CIRCLE :
                    this._svg.append("circle")
                             .attr("cx", 25)
                             .attr("cy", yMap(i + 1))
                             .attr("r", r)
                             .style("fill", "#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(i, 0, numOfBins), ramp)))
                             .style("stroke", "black")
                             .style("stroke-opacity", 0.5);
                    this._svg.append("text")
                             .attr("x", 50)
                             .attr("y", yMap(i + 1))
                             .text(textLabelFunction(i));
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
        this.chart.destroy();
        super();
    }
}

WeavePanel.registerToolImplementation("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
