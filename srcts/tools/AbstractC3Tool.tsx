///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/c3/c3.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import KeySet = weavejs.data.key.KeySet;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;

export default class AbstractC3Tool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties
{
    constructor(props:IVisToolProps) {
        super(props);
        this.xAxisClass = "c3-axis-x";
        this.yAxisClass = "c3-axis-y";
        this.y2AxisClass = "c3-axis-y2";
    }

	selectionFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
	filteredKeySet:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	protected get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	protected get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }
	
	xAxisName:LinkableString = Weave.linkableChild(this, LinkableString);
	yAxisName:LinkableString = Weave.linkableChild(this, LinkableString);
	marginTop:LinkableString = Weave.linkableChild(this, LinkableString);
	marginBottom:LinkableString = Weave.linkableChild(this, LinkableString);
	marginLeft:LinkableString = Weave.linkableChild(this, LinkableString);
	marginRight:LinkableString = Weave.linkableChild(this, LinkableString);
	panelTitle:LinkableString = Weave.linkableChild(this, LinkableString);

	protected element:HTMLElement;
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    private xAxisClass:string;
    private yAxisClass:string;
    private y2AxisClass:string;

    private previousWidth:number;
    private previousHeight:number;
	
	get deprecatedStateMapping():Object
	{
		return this.super_deprecatedStateMapping;
	}
	
	get super_deprecatedStateMapping():Object
	{
		return {
			"children": {
				"visualization": {
					"plotManager": {
						"marginBottom": this.marginBottom,
						"marginRight": this.marginRight,
						"marginLeft": this.marginLeft,
						"marginTop": this.marginTop,
						"plotters": {
							"yAxis": {
								"overrideAxisName": this.yAxisName
							},
							"xAxis": {
								"overrideAxisName": this.xAxisName
							}
						}
					}
				}
			}
		};
	}

    get title():string {
       return this.panelTitle.value;
    }

    get internalWidth():number {
        return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    get internalHeight():number {
        return this.props.style.height - this.c3Config.padding.top - Number(this.marginBottom.value);
    }

    private cullAxis(axisSize:number, axisClass:string):void {
        var intervalForCulling:number = this.getCullingInterval(axisSize,axisClass);
        d3.select(this.element).selectAll('.' + axisClass + ' .tick text').each(function (e, index) {
            if (index >= 0) {
                d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
            }
        });
    }

    protected cullAxes() {
        //cull axes
        var width:number = this.internalWidth;
        var height:number = this.internalHeight;
        this.cullAxis(width, this.xAxisClass);
        if(weavejs.WeaveAPI.Locale.reverseLayout) {
            this.cullAxis(height, this.y2AxisClass);
        }else{
            this.cullAxis(height, this.yAxisClass);
        }
    }

    componentDidUpdate():void {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
			if (this.chart)
	            this.chart.resize({width:this.props.style.width, height:this.props.style.height});
        }
    }

    customStyle(array:Array<number>, type:string, filter:string, style:any) {
        array.forEach( (index) => {
        	var filtered = d3.select(this.element).selectAll(type).filter(filter);
        	if (filtered.length)
        		d3.select(filtered[0][index]).style(style);
        });
    }

    customSelectorStyle(array:Array<number>, selector:any, style:any) {
        array.forEach( (index) => {
            if (selector.length)
                d3.select(selector[0][index]).style(style);
        });
    }

    render():JSX.Element {
        return <div ref={(c:HTMLElement) => {this.element = c;}} style={{width: "100%", height: "100%", maxHeight: "100%"}}/>;
    }

    getCullingInterval(size:number,axisClass:string):number {
        var textHeight:number = StandardLib.getTextHeight("test", this.getFontString());
        var labelsToShow:number = Math.floor(size / textHeight);
        labelsToShow = Math.max(2,labelsToShow);

        var tickValues:number = d3.select(this.element).selectAll('.' + axisClass + ' .tick text').size();
        var intervalForCulling:number;
        for (var i:number = 1; i < tickValues; i++) {
            if (tickValues / i < labelsToShow) {
                intervalForCulling = i;
                break;
            }
        }
        return intervalForCulling;
    }

    getFontString():string {
        return this.props.fontSize + "pt " + this.props.font;
    }
}
