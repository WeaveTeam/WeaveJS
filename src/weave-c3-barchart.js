import d3 from "d3"; //ignore-unused
import c3 from "c3";

export default class {
    constructor(targetDiv, weavePath) {
        this.originalState = weavePath.getState();
        this.targetDiv = targetDiv;
        this.chart = c3.generate({
            data: {type: "bar"},
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
