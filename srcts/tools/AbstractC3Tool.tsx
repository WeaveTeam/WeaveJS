import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import * as c3 from "c3";
import {HBox, VBox} from "../react-ui/FlexBox";
import * as jquery from "jquery";
import DOMUtils from "../utils/DOMUtils";
import ReactUtils from "../utils/ReactUtils";
import ToolTip from "./ToolTip";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

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

export interface IAbstractC3ToolProps extends IVisToolProps
{
    font?:string;
    fontSize?:number;
}

export default class AbstractC3Tool extends AbstractVisTool<IAbstractC3ToolProps, IVisToolState>
{
    constructor(props:IVisToolProps)
	{
        super(props);
		
		this.debouncedHandleC3Selection = _.debounce(this.handleC3Selection.bind(this), 0);
		this.debouncedHandleChange = _.debounce(this.handleChange.bind(this), 30);
		
		var self = this;
		this.c3Config = {
			bindto: null,
			size: {},
			padding: {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0
			},
			interaction: { brighten: false },
			transition: { duration: 0 },
            tooltip: { show: false },
			data: {
				selection: {
					enabled: true,
					multiple: true,
					draggable: true
				},
				onselected: (d:any) => {
					if (this.chart.internal.dragging)
						this.debouncedHandleC3Selection();
				},
				onunselected: (d:any) => {
					if (this.chart.internal.dragging)
						this.debouncedHandleC3Selection();
				},
				onmouseover: (d) => {
					if (d && d.hasOwnProperty("index"))
						this.handleC3MouseOver(d);
				},
				onmouseout: (d) => {
					if (d && d.hasOwnProperty("index"))
						this.handleC3MouseOut(d);
				}
			},
            onrendered: function() {
				self.chart = this.api;
				self.handleC3Render();
			}
		};
		
        this.xAxisClass = {axis: "c3-axis-x", grid: "c3-xgrid"};
        this.yAxisClass = {axis: "c3-axis-y", grid: "c3-ygrid"};
        this.y2AxisClass = {axis: "c3-axis-y2", grid: "c3-ygrid"};
		this.handlePointClick = this.handlePointClick.bind(this);
		Weave.getCallbacks(this).addGroupedCallback(this, this.debouncedHandleChange, true);
		
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.validateSize);
    }
	
	componentDidMount()
	{
		super.componentDidMount();
		
		this.toolTip = ReactUtils.openPopup(<ToolTip/>) as ToolTip;
        DOMUtils.addPointClickListener(this.element, this.handlePointClick);
		this.validateSize();
		this.handleChange();
	}
	
	componentWillUnmount()
	{
		ReactUtils.closePopup(this.toolTip);
		DOMUtils.removePointClickListener(this.element, this.handlePointClick);
		if (this.chart)
		{
			this.chart.destroy();
			this.chart = null;
		}
	}

    componentDidUpdate():void
	{
		this.validateSize();
	}
	
	validateSize()
	{
		if (!this.element)
			return;
        if (this.c3Config.size.width != this.element.clientWidth || this.c3Config.size.height != this.element.clientHeight)
		{
            this.c3Config.size = { width: this.element.clientWidth, height: this.element.clientHeight };
			if (this.chart)
	            this.chart.resize({ width: this.element.clientWidth, height: this.element.clientHeight });
            this.cullAxes();
        }
    }
	
    render():JSX.Element
    {
        return <div ref={(c:HTMLElement) => { this.element = c;}} style={{flex: 1, overflow: "hidden"}} onMouseLeave={ () => this.toolTip.hide() }>
			<div ref={(c:HTMLElement) => { this.c3Config.bindto = c;}}/>
		</div>;
    }

	protected toolTip:ToolTip;
	protected element:HTMLElement;
    protected chart:c3.ChartAPI;
    protected c3Config:c3.ChartConfiguration;
    private xAxisClass:AxisClass;
    private yAxisClass:AxisClass;
    private y2AxisClass:AxisClass;
    private busy:boolean;

	private debouncedHandleC3Selection:Function;
	private debouncedHandleChange:Function;

	protected mergeConfig(c3Config:c3.ChartConfiguration):void
	{
		_.merge(this.c3Config, c3Config);
	}
	
	private handleChange():void
	{
		if (!Weave.wasDisposed(this) && !Weave.isBusy(this) && !this.busy && this.validate(!this.chart))
		{
            this.busy = true;
            c3.generate(this.c3Config);
		}
	}

	protected handleC3Render():void
	{
		this.busy = false;
		this.handleChange();
		if (!this.busy)
			this.cullAxes();
		if(this.element && this.chart) {
			$(this.element).find(".c3-chart").each( (i,e) => {
				e.addEventListener("mouseout", (event) => {
					this.handleC3MouseOut(event);
				});
			});
		}
	}

	protected handleC3Selection():void
	{
	}

	protected handleC3MouseOver(d:any):void
	{
	}

	protected handleC3MouseOut(d:any):void
	{
		if (this.probeKeySet)
			this.probeKeySet.replaceKeys([]);
		this.toolTip.hide();
	}

	/**
	 * @param forced true if chart generation should be forced 
	 * @return true if the chart should be (re)generated
	 */
	protected validate(forced:boolean = false):boolean
	{
		return forced;
	}
	
    get internalWidth():number
    {
        return this.c3Config.size.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    get internalHeight():number
    {
        return this.c3Config.size.height - this.c3Config.padding.top - this.margin.bottom.value;
    }
	
	protected updateConfigMargin()
	{
	    this.c3Config.padding.top = this.margin.top.value;
		
		if (this.c3Config.axis && this.c3Config.axis.x)
		    this.c3Config.axis.x.height = this.margin.bottom.value;
		else
			this.c3Config.padding.bottom = this.margin.bottom.value;
	    
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
		var yMin = finiteOrNull(this.overrideBounds.yMin.value);
		var yMax = finiteOrNull(this.overrideBounds.yMax.value);
		if (this.c3Config.axis.y)
		{
			this.c3Config.axis.y.min = yMin;
        	this.c3Config.axis.y.max = yMax;
		}
		if (this.c3Config.axis.y2)
		{
			this.c3Config.axis.y2.min = yMin;
        	this.c3Config.axis.y2.max = yMax;
		}
	}

	protected handlePointClick(event:MouseEvent)
	{
		AbstractVisTool.handlePointClick(this, event);
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
        this.cullAxis(this.internalWidth, this.xAxisClass);
        this.cullAxis(this.internalHeight, weavejs.WeaveAPI.Locale.reverseLayout ? this.y2AxisClass : this.yAxisClass);
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
	
    private _getCullingMetrics(size:number,axisClass:string):CullingMetric
	{
        var textHeight:number = DOMUtils.getTextHeight("test", this.getFontString());
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
