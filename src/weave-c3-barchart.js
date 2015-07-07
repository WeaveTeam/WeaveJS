import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";

export default class extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this.chart = c3.generate({
            size: {
                width: jquery(this.div).width(),
                height: jquery(this.div).height()
            },
            data: {json: [], type: "bar"},
            bindto: this.div[0],
            bar: {
                width: {}
            }
        });
    }
}
