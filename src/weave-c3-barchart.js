import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";
import lodash from "lodash";

export default class WeaveC3Barchart extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this.indexCache = lodash({});
        this.dataNames = [];
        this.chart = c3.generate({
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
            },
            data: {json: [], type: "bar", selection: {
                enabled: true, multiple: true
            }},
            bindto: this.element[0],
            bar: {
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

        toolPath.selection_keyset.addCallback(this._selectionKeysChanged.bind(this), true, false);
    }

    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                      width: jquery(this.element).width()});
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        var indices = this.indexCache.pick(keys).values();

        this.chart.select(this.dataNames, indices, true);
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

        json = lodash.sortBy(json, "sort");

        this.indexCache = lodash(json).map((item, idx) => {return [item.id, idx]; }).zipObject();
        this.dataNames = lodash.keys(mapping);

        var keys = {x: "label", value: heightColumnNames};

        this.chart.load({json, keys, order: null, unload: true, selection: {enabled: true, multiple: true}});

        this.chart.data.names(names);
    }
}

WeavePanel.registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
