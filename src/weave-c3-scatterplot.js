import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";

// function _buildC3Visualization (weaveState) {
//     this.c3Opts = {};
// }

export default class extends WeavePanel {

    constructor(element, toolPath) {
        super(element, toolPath);
        this.toolPath = toolPath;
        this.element = element;
    }

    // This function takes in a weave session state
    // and creates a c3 visualization object
    //
    // This function should not be called externally
    _buildC3Visualization() {

        var plotterPath = this.toolPath.pushPlotter();
        var dataXPath = plotterPath.push("dataX");
        var dataYPath = plotterPath.push("dataY");

        this._c3Opts = {
             size: {
                width: jquery(this.div).width(),
                height: jquery(this.div).height()
            },
            data: {
                json: plotterPath.retrieveRecords({ x: dataXPath, y: dataYPath}),
                keys: {
                    x: "x",
                    value: ["y"]
                },
                type: "scatter"
            },
            axis: {
                x: {
                    // needs to change
                    label: dataXPath.push(null).getState().metadata.title,
                    tick: {
                        fit: false
                    }
                },
                y: {
                    label: dataYPath.push(null).getState().metadata.title
                }
            }
        };
    }

    // This function takes a DOM element ID as a target
    // for generating a c3 visualization.
    generate() {
        this.chart = this._buildC3Visualization();
        this._c3Opts.bindto = this.div[0];
        this.chart = c3.generate(this._c3Opts);
    }
}
