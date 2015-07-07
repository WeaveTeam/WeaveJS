import d3 from "d3"; //ignore-unused
import c3 from "c3";

export default class {
    constructor(targetDiv, toolPath) {
        this.originalState = toolPath.getSessionState();
        this.chart = c3.generate({
            data: {type: "bar"},
            bindto: targetDiv,
            bar: {
                width: {}
            }
        });
    }

    _findPlotter()
    {
        var plotters = this.originalState.children;
    }
}
