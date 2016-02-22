///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/c3/c3.d.ts"/>

import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import MiscUtils from "../utils/MiscUtils";

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

function finiteOrNull(n:number):number { return isFinite(n) ? n : null; }

declare type AxisClass = {
	axis:string;
	grid:string;
};

declare type CullingMetric = {
	interval:number;
	total:number;
	displayed:number;
}

export default class AbstractC3Tool extends AbstractVisTool
{
    constructor(props:IVisToolProps)
	{
        super(props);
        this.xAxisClass = {axis: "c3-axis-x", grid: "c3-xgrid"};
        this.yAxisClass = {axis: "c3-axis-y", grid: "c3-ygrid"};
        this.y2AxisClass = {axis: "c3-axis-y2", grid: "c3-ygrid"};
		this.handlePointClick = this.handlePointClick.bind(this);
		Weave.getCallbacks(this).addGroupedCallback(this, this.validate, true);
    }
	
	componentDidMount()
	{
		this.c3Config.bindto = this.element;
        MiscUtils.addPointClickListener(this.element, this.handlePointClick);
		this.validate(true);
	}
	
	componentWillUnmount()
	{
		MiscUtils.removePointClickListener(this.element, this.handlePointClick);
		this.chart.destroy();
	}

	protected element:HTMLElement;
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    private xAxisClass:AxisClass;
    private yAxisClass:AxisClass;
    private y2AxisClass:AxisClass;

    private previousWidth:number;
    private previousHeight:number;

	handlePointClick(event:MouseEvent):void
	{
		if (!this.probeKeySet || !this.selectionKeySet)
			return;

        var probeKeys:IQualifiedKey[] = this.probeKeySet.keys;
		if (!probeKeys.length)
		{
			this.selectionKeySet.clearKeys();
			return;
		}
		
		var isSelected = false;
		for (var key of probeKeys)
		{
			if (this.selectionKeySet.containsKey(key))
			{
				isSelected = true;
				break;
			}
		}
		if (event.ctrlKey || event.metaKey)
		{
			if (isSelected)
				this.selectionKeySet.removeKeys(probeKeys);
			else
				this.selectionKeySet.addKeys(probeKeys);
		}
		else
		{
			if (isSelected)
				this.selectionKeySet.clearKeys();
			else
				this.selectionKeySet.replaceKeys(probeKeys);
		}
	}
	
    get internalWidth():number
    {
        return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    get internalHeight():number
    {
        return this.props.style.height - this.c3Config.padding.top - Number(this.margin.bottom.value);
    }
	
	protected updateConfigMargin()
	{
	    this.c3Config.padding.top = this.margin.top.value;
	    this.c3Config.axis.x.height = this.margin.bottom.value;
	    if (weavejs.WeaveAPI.Locale.reverseLayout)
	    {
	        this.c3Config.padding.left = this.margin.right.value;
	        this.c3Config.padding.right = this.margin.left.value;
	    }
	    else
	    {
	        this.c3Config.padding.left = this.margin.left.value;
	        this.c3Config.padding.right = this.margin.right.value;
	    }
	}
	
	protected updateConfigAxisX()
	{
		this.c3Config.axis.x.min = finiteOrNull(this.overrideBounds.xMin.value);
        this.c3Config.axis.x.max = finiteOrNull(this.overrideBounds.xMax.value);
	}

	protected updateConfigAxisY()
	{
		this.c3Config.axis.y.min = finiteOrNull(this.overrideBounds.yMin.value);
        this.c3Config.axis.y.max = finiteOrNull(this.overrideBounds.yMax.value);
	}
	
    private cullAxis(axisSize:number, axisClass:AxisClass):void
    {
        //axis label culling
		var cullingMetric:CullingMetric = this._getCullingMetrics(axisSize,axisClass.axis);
        var intervalForCulling:number = cullingMetric.interval;
        d3.select(this.element).selectAll('.' + axisClass.axis + ' .tick text').each(function (e, index) {
            if (index >= 0)
			{
                d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
            }
        });
		//grid line culling
		var gridCullingInterval:number = this.getInterval('.' + axisClass.grid,cullingMetric.displayed);
		d3.select(this.element).selectAll('.' + axisClass.grid).each(function (e, index) {
			if (index >= 0)
			{
				d3.select(this).style('display', index % gridCullingInterval ? 'none' : 'block');
			}
		});
		//tick culling
		var tickCullingInterval:number = this.getInterval('.'+ axisClass.axis + ' .tick line',cullingMetric.displayed);
		d3.select(this.element).selectAll('.'+ axisClass.axis + ' .tick line').each(function (e, index) {
			if (index >= 0)
			{
				d3.select(this).style('display', index % tickCullingInterval ? 'none' : 'block');
			}
		});
    }

    protected cullAxes()
    {
        //cull axes
        var width:number = this.internalWidth;
        var height:number = this.internalHeight;
        this.cullAxis(width, this.xAxisClass);
        if (weavejs.WeaveAPI.Locale.reverseLayout)
        {
            this.cullAxis(height, this.y2AxisClass);
        }
        else
        {
            this.cullAxis(height, this.yAxisClass);
        }
    }

    componentDidUpdate():void
	{
        if (this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height)
		{
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
			if (this.chart)
	            this.chart.resize({width:this.props.style.width, height:this.props.style.height});
            this.cullAxes();
        }
    }

    customStyle(array:Array<number>, type:string, filter:string, style:any)
    {
        var filtered = d3.select(this.element).selectAll(type).filter(filter);
        if (filtered.length)
        {
            array.forEach((index) => {
                    d3.select(filtered[0][index]).style(style);
            });
        }
    }

    customSelectorStyle(array:Array<number>, selector:any, style:any)
    {
        array.forEach( (index) => {
            if (selector.length)
                d3.select(selector[0][index]).style(style);
        });
    }

	validate(forced:boolean = false):void
	{
	}
	
    render():JSX.Element
    {
        return <div ref={(c:HTMLElement) => {this.element = c;}} style={{width: "100%", height: "100%", maxHeight: "100%"}}/>;
    }

    private _getCullingMetrics(size:number,axisClass:string):CullingMetric
	{
        var textHeight:number = MiscUtils.getTextHeight("test", this.getFontString());
        var labelsToShow:number = Math.floor(size / textHeight);
        labelsToShow = Math.max(2,labelsToShow);

        var tickValues:number = d3.select(this.element).selectAll('.' + axisClass + ' .tick text').size();
		return {interval: this.getInterval('.' + axisClass + ' .tick text',labelsToShow), total:tickValues, displayed:labelsToShow};
    }

	getInterval(classSelector:string, requiredValues:number)
	{
		var totalValues:number = d3.select(this.element).selectAll(classSelector).size();
		var interval:number;
		for (var i:number = 1; i < totalValues; i++)
		{
			if (totalValues / i < requiredValues)
			{
				interval = i;
				break;
			}
		}
		return interval;
	}

    getFontString():string
    {
        return this.props.fontSize + "pt " + this.props.font;
    }
}
