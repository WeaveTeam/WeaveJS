import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";
import lodash from "lodash";
import d3 from "d3";

/**
 * Calculates an interpolated color for a normalized value.
 * @param normValue A Number between 0 and 1.
 * @param colors An Array or list of colors to interpolate between.  Normalized values of 0 and 1 will be mapped to the first and last colors.
 * @return An interpolated color associated with the given normValue based on the list of color values.
 */
 function interpolateColor(normValue, colors)
{
    // handle an array of colors as the second parameter
    if (colors.length === 1 && Array.isArray(colors[0])) {
        colors = colors[0];
    }

    // handle invalid parameters
    if (normValue < 0 || normValue > 1 || colors.length === 0) {
        return NaN;
    }

    // find the min and max colors we want to interpolate between

    var maxIndex = colors.length - 1;
    var leftIndex = maxIndex * normValue;
    var rightIndex = leftIndex + 1;

    // handle boundary condition
    if (rightIndex === colors.length) {
        return parseInt(colors[leftIndex], 16);
    }

    var minColor = colors[leftIndex];
    var maxColor = colors[rightIndex];

    // normalize the norm value between the two norm values associated with the surrounding colors
    normValue = normValue * maxIndex - leftIndex;

    var percentLeft = 1 - normValue; // relevance of minColor
    var percentRight = normValue; // relevance of maxColor
    const R = 0xFF0000;
    const G = 0x00FF00;
    const B = 0x0000FF;
    return (
        ((percentLeft * (minColor & R) + percentRight * (maxColor & R)) & R) |
        ((percentLeft * (minColor & G) + percentRight * (maxColor & G)) & G) |
        ((percentLeft * (minColor & B) + percentRight * (maxColor & B)) & B)
    );
}

export default class WeaveC3ColorLegend extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);
        this.lookup = {};
        this._plotterPath = toolPath.pushPlotter("plot");
        this._colorColumnPath = this._plotterPath.push("dynamicColorColumn").push(null);
        this._binningDefinition = this._colorColumnPath.push("internalDynamicColumn").push(null).push("binningDefinition").push(null);

        this._filteredColumnPath = this._colorColumnPath.push("internalDynamicColumn").push(null).push("internalDynamicColumn").push(null);

        this._filteredColumn = {
            get keyFilter() { return this._filteredColumnPath.push("filter").getState(); },
            get internalDynamicColumn() { return this._filteredColumnPath.push("internalDynamicColumn").getState(); }
        };

        this._svg = d3.select(this.element[0]).append("svg");
        this._colorColumnPath.addCallback(lodash.debounce(this.updateLayout.bind(this), true, false), 100);
        this.update();
    }

    _updateContents () {
        this._sizeChanged();
    }

    _dataChanged() {

    }

    _sizeChanged() {
        this.updateLayout();
    }

    updateLayout() {
        console.log("updating layout");

        // clear the svg and rerender everything
        this._svg.selectAll("*").remove();

        var width = jquery(this.element).width();
        var height = jquery(this.element).height();
        var numOfBins = this._binningDefinition.push("numberOfBins").getState();

        var shapeSize = this._plotterPath.push("shapeSize").getState();
        var ramp = this._colorColumnPath.push("ramp").getState();

        if(!Array.isArray(ramp)) {
            ramp = ramp.split(",");
        }
        console.log(interpolateColor(0, ramp));
        var yScale = d3.scale.linear()
                            .domain([0, numOfBins + 1])
                            .range([0, height]);

        var yMap = (d) => { return yScale(d); };

        if(width && height && numOfBins) {
            this._svg.attr("width", width)
                     .attr("height", height);

            for(var i = 1; i <= numOfBins; i++) {
                this._svg.append("circle")
                    .attr("cx", 25)
                    .attr("cy", yMap(i))
                    .attr("r", 15)
                    .style("fill", "#" + lodash.padLeft(interpolateColor( (i - 1) / (numOfBins - 1), ramp).toString(16), 6, "0")) // convert rgb into hex with padding
                    .style("stroke", "black")
                    .style("stroke-opacity", 0.5);
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
