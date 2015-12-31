///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>

import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as c3 from "c3";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../Utils/FormatUtils";
import * as React from "react";
import {IAbstractWeaveToolProps} from "./AbstractWeaveTool";
import ChartAPI = c3.ChartAPI;

interface IColumnStats {
    min: number;
    max: number;
}

declare type NumericRecords = {[name:string]: number} | {[name:string]: NumericRecords}

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
class WeaveC3ScatterPlot extends AbstractWeaveTool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private chart:ChartAPI;
    private dataXType:string;
    private dataYType:string;
    private numericRecords
    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
    }

    private normalizeRecords (records:any[], attributes:string[]) {

        // to avoid computing the stats at each iteration.
        var columnStatsCache:{[attribute:string]:IColoumnStats} = {};
        attributes.forEach(function(attr:string) {
            columnStatsCache[attr] = {
                min: _.min(_.pluck(records, attr)),
                max: _.max(_.pluck(records, attr))
            };
        });

        return records.map(function(record:any) {

            var obj:any = {};

            attributes.forEach(function(attr:string) {
                var min:number = columnStatsCache[attr].min;
                var max:number = columnStatsCache[attr].max;

                if(!min)
                    min = 0;

                if(max - min === 0) {
                    return 0;
                }

                if(record[attr]) {
                    // console.log( (record[attr] - min) / (max - min));
                    obj[attr] = (record[attr] - min) / (max - min);
                } else {
                    // if any of the value above is null then
                    // we can't normalize
                    obj[attr] = null;
                }
            });

            return obj;
        });
    }

    private busy:number;
    private  axisChanged():void {
        if(this.busy) {
            this.busy++;
            return;
        }

        this.chart.axis.labels({
            x: this.paths.xAxis.getState("overrideAxisName") || this.paths.dataX.getValue("this.getMetadata('title')"),
            y: this.paths.yAxis.getState("overrideAxisName") || this.paths.dataY.getValue("this.getMetadata('title')")
        })
    }

    private dataChanged() {
        if(this.busy) {
            this.busy++;
            return;
        }

        let numericMapping:any = {
            point: {
                x: this.paths.dataX,
                y: this.paths.dataY
            },
            size: this.paths.sizeBy
        };

        let stringMapping:any = {
            point: {
                x: this.paths.dataX,
                y: this.paths.dataY
            },
            fill: {
                //alpha: this._fillStylePath.push("alpha"),
                color: this.paths.fill.push("color")
            },
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this.paths.line.push("color")
                //caps: this._lineStylePath.push("caps")
            }
        };

        this.dataXType = this.paths["dataX"].getValue("this.getMetadata('dataType')");
        this.dataYType = this.paths["dataY"].getValue("this.getMetadata('dataType')");

        this.numericRecords = this.paths["plotter"].retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths["plotter"].retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};

        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });

        this.stringRecords.forEach((record, index) => {
            this.xAxisValueToLabel[this.numericRecords[index].point.x] = record.point.x;
            this.yAxisValueToLabel[this.numericRecords[index].point.y] = record.point.y;
        });

        this.normalizedRecords = this.normalizeRecords(this.numericRecords, ["size"]);
        this.plotterState = this.paths.plotter.getUntypedState ? this.paths.plotter.getUntypedState() : this.paths.plotter.getState();
        this.normalizedPointSizes = this.normalizedRecords.map((normalizedRecord) => {
            if(this.plotterState && this.plotterState.sizeBy.length) {
                let minScreenRadius = this.plotterState.minScreenRadius;
                let maxScreenRadius = this.plotterState.maxScreenRadius;
                return (normalizedRecord && normalizedRecord.size ?
                    minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                        this.plotterState.defaultScreenRadius) || 3;
            }
            else {
                return (this.plotterState.defaultScreenRadius) || 3;
            }
        });

        this._axisChanged();
        this.busy = 1;
        this.chart.load({data: _.pluck(this.numericRecords, "point"), unload: true, done: () => {
            if (this.busy > 1) {
                this.busy = 0;
                this._dataChanged();
            }
            else {
                this.busy = 0;
            }
        }});
    }
}