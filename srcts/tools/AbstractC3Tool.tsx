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

export class Margin {
    top = Weave.linkableChild(this, new LinkableNumber(20));
    bottom = Weave.linkableChild(this, new LinkableNumber(100));
    left = Weave.linkableChild(this, new LinkableNumber(100));
    right = Weave.linkableChild(this, new LinkableNumber(20));
}

Weave.registerClass("weavejs.tool.Margin", Margin);

export default class AbstractC3Tool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties
{
    constructor(props:IVisToolProps)
	{
        super(props);
        this.xAxisClass = "c3-axis-x";
        this.yAxisClass = "c3-axis-y";
        this.y2AxisClass = "c3-axis-y2";
		this.handlePointClick = this.handlePointClick.bind(this);
		Weave.getCallbacks(this).addGroupedCallback(this, this.validate, true);
    }
	
	componentDidMount()
	{
		this.c3Config.bindto = this.element;
        StandardLib.addPointClickListener(this.element, this.handlePointClick);
		this.validate(true);
	}
	
	componentWillUnmount()
	{
		StandardLib.removePointClickListener(this.element, this.handlePointClick);
		this.chart.destroy();
	}

	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);

	xAxisName = Weave.linkableChild(this, LinkableString);
	yAxisName = Weave.linkableChild(this, LinkableString);

    margin = Weave.linkableChild(this, Margin);

	panelTitle = Weave.linkableChild(this, LinkableString);
    overrideYMin = Weave.linkableChild(this, LinkableNumber);
    overrideYMax = Weave.linkableChild(this, LinkableNumber);

	protected element:HTMLElement;
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    private xAxisClass:string;
    private yAxisClass:string;
    private y2AxisClass:string;

    private previousWidth:number;
    private previousHeight:number;

	protected get selectionKeySet()
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	protected isSelected(key:IQualifiedKey):boolean
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	}
	 
	protected get probeKeySet()
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	protected isProbed(key:IQualifiedKey):boolean
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	} 

    get deprecatedStateMapping():Object
	{
		return {
			"children": {
				"visualization": {
					"plotManager": {
						"marginBottom": this.margin.bottom,
						"marginRight": this.margin.right,
						"marginLeft": this.margin.left,
						"marginTop": this.margin.top,
                        "overrideYMax": this.overrideYMax,
                        "overrideYMin": this.overrideYMin,
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
	
    get title():string {
       return this.panelTitle.value;
    }

    get internalWidth():number {
        return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    get internalHeight():number {
        return this.props.style.height - this.c3Config.padding.top - Number(this.margin.bottom.value);
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

    componentDidUpdate():void
	{
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height)
		{
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
			if (this.chart)
	            this.chart.resize({width:this.props.style.width, height:this.props.style.height});
            //this.validate(true);
        }
    }

    customStyle(array:Array<number>, type:string, filter:string, style:any) {
        var filtered = d3.select(this.element).selectAll(type).filter(filter);
        if (filtered.length)
        {
            array.forEach((index) => {
                    d3.select(filtered[0][index]).style(style);
            });
        }
    }

    customSelectorStyle(array:Array<number>, selector:any, style:any) {
        array.forEach( (index) => {
            if (selector.length)
                d3.select(selector[0][index]).style(style);
        });
    }

	validate(forced:boolean = false):void
	{
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
