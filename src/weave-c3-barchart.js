import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";

export default class extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this.chart = c3.generate({
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
            },
            data: {json: [], type: "bar"},
            bindto: this.element[0],
            bar: {
                width: {}
            },
            axis: {
                x: { type: "category"}
            }
        });

        var plotter = toolPath.pushPlotter("plot");

        var boundDataChanged = this._dataChanged.bind(this);

        ["heightColumns", "labelColumn", "sortColumn"].forEach(
            (item) => {plotter.push(item).addCallback(boundDataChanged, true, false); }
        );
    }

    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                      width: jquery(this.element).width()});
    }

    _dataChanged() {
        var plotter = this.toolPath.pushPlotter("plot");
        var heightColumnNames = [];
        var heightColumns = plotter.push("heightColumns").getChildren();
        var mapping =
        {
            label: plotter.push("labelColumn"),
            sort: plotter.push("sortColumn")
        };
        var names = {};

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let title = column.getValue("getMetadata('title')");
            let name = column.getPath().pop();
            names[name] = title;
            mapping[name] = column;
            heightColumnNames.push(name);
        }
        var json = this.toolPath.pushPlotter("plot").retrieveRecords(mapping);
        /* [x, label, label, label] [heightColumn, value, value, value] */
        var keys = {x: "label", value: heightColumnNames};

        this.chart.load({json, keys, names});
    }
}
