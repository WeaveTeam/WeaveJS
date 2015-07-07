import d3 from "d3";
import c3 from "c3";


// function _buildC3Visualization (weaveState) {
//     this.c3Opts = {};
// }

export default class {

    constructor(weavePath) {
        this.weavePath = weavePath;
    }

    // This function takes in a weave session state
    // and creates a c3 visualization object
    //
    // This function should not be called externally
    _buildC3Visualization() {

        var plotterPath = this.weavePath.pushPlotter();

        var dataXPath = plotterPath.push("dataX");
        var dataYPath = plotterPath.push("dataY");

        function getXLabel () {
            return "X";
        }

        function getYLabel () {
            return "Y";
        }

        this._c3Opts = {
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
                    label: getXLabel(),
                    tick: {
                        fit: false
                    }
                },
                y: {
                    label: getYLabel()
                }
            }
        };
    }

    // This function takes a DOM element ID as a target
    // for generating a c3 visualization.
    generate(targetID) {
        this.chart = this._buildC3Visualization();
        this._c3Opts.bindto = "#" + targetID;
        this.chart = c3.generate(this._c3Opts);
    }

}
