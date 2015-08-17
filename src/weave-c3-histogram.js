import c3 from "c3";
import d3 from "d3";
import WeavePanel from "./WeavePanel.js";
import lodash from "lodash";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";

export default class WeaveC3Histogram extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._plotterPath = this.toolPath.pushPlotter("plot");

        this._binnedColumnPath = this._plotterPath.push("binnedColumn");

        this._binningDefinitionPath = this._binnedColumnPath.push("binningDefinition");

        this._columnPath = this._binnedColumnPath.push("internalDynamicColum").push(null).push("internalDynamicColum").push(null);

        this._lineStylePath = this._plotterPath.push("lineStyle");
        this._fillStylePath = this._plotterPath.push("fillStyle");

        this.chart = c3.generate({
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
            },
            data: {
                columns: [],
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true
               },
               type: "bar"
            },
            bindto: this.element[0],
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        });

        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);
        [
            this._binnedColumnPath,
            this._lineStylePath,
            this._fillStylePath
        ].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this.toolPath.selection_keyset.addCallback(selectionChanged, true, false);
    }

    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                   width: jquery(this.element).width()});
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        if(keys.length) {
            this.chart.focus(keys);
        } else {
            this.chart.focus();
        }
    }

    _updateStyle() {

    }

    _dataChanged() {
        let mapping = {
            bin: this._columnPath,
            fill: {
                alpha: this._fillStylePath.push("alpha"),
                color: this._fillStylePath.push("color"),
                caps: this._fillStylePath.push("caps")
            },
            line: {
                alpha: this._lineStylePath.push("alpha"),
                color: this._lineStylePath.push("color"),
                caps: this._lineStylePath.push("caps")
            }
        };

        // binnedColumn's internalDynamicColumn has a dynamicKeyFilter
        // plot has filtered keySet
        this.records = this._plotterPath.retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter"));

        console.log(this.records);
        var numOfBins = this._binningDefinitionPath.push("numberOfBins").getState();
        console.log(numOfBins);
        var data = d3.layout.histogram().bins(numOfBins)(this.records);
        console.log(data);
        // var columns = [];

        // columns = this.records.map(function(record) {
        //     var tempArr = [];
        //     tempArr.push(record.id);
        //     tempArr.push(record.data);
        //     return tempArr;
        // });

        // this.colors = {};
        // this.records.forEach((record) => {
        //     this.colors[record.id] = record.fill.color;
        // });

        // this.chart.load({columns: columns, colors: this.colors, unload: true});
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
