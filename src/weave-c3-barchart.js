import c3 from "c3";
import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";
import lodash from "lodash";

export default class WeaveC3Barchart extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this.indexCache = lodash({});
        this.dataNames = [];
        this.chart = null;
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
            },
            legend: false
        });

        this.setupCallbacks();
    }

    setupCallbacks() {
        this._boundDataChanged = this._dataChanged.bind(this);
        this._boundSelectionChanged = this._selectionKeysChanged.bind(this);

        var plotter = this.toolPath.pushPlotter("plot");

        ["heightColumns", "labelColumn", "sortColumn"].forEach(
            (item) => {plotter.push(item).addCallback(this._boundDataChanged, true, false); },
        this);

        this.toolPath.selection_keyset.addCallback(this._boundSelectionChanged, true, false);
    }

    teardownCallbacks() {
        this.toolPath.selection_keyset.removeCallback(this._boundSelectionChanged);
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

    _updateStyle() {}


    _update() {
        this.chart = c3.generate(this._c3Options);
        this._updateStyle();
    }

    destroy() {
        /* Cleanup callbacks */
        this.teardownCallbacks();
        this.chart.destroy();
        super();
    }
}

//WeavePanelManager.registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
