import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import * as c3 from "c3";
import C3Chart from "./C3Chart";
import {HBox, VBox} from "../react-ui/FlexBox";
import * as jquery from "jquery";
import DOMUtils from "../utils/DOMUtils";
import MouseUtils from "../utils/MouseUtils";
import ReactUtils from "../utils/ReactUtils";
import ToolTip from "./ToolTip";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import PrintUtils from "../utils/PrintUtils";

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
		
		this.toolTip = ReactUtils.openPopup(this, <ToolTip/>) as ToolTip;
        MouseUtils.addPointClickListener(this.element, this.handlePointClick);
		this.validateSize();
		this.handleChange();
	}
	
	componentWillUnmount()
	{
		ReactUtils.closePopup(this.toolTip);
		MouseUtils.removePointClickListener(this.element, this.handlePointClick);
	}

    componentDidUpdate():void
	{
		this.validateSize();
	}

	getMenuItems():MenuItemProps[]
	{
		let menuItems:MenuItemProps[] = AbstractVisTool.getMenuItems(this);

		if(Weave.beta)
			menuItems.push({
				label: Weave.lang("Print Tool (Beta)"),
				click: PrintUtils.printTool.bind(null, this.element)
			});

		return menuItems;
	}
	
	validateSize()
	{
		if (!this.element || !this.chart)
			return;
		var chartWidth = this.chart.internal && this.chart.internal.config && this.chart.internal.config.size_width;
		var chartHeight = this.chart.internal && this.chart.internal.config && this.chart.internal.config.size_height;
        if (chartWidth != this.element.clientWidth || chartHeight != this.element.clientHeight)
		{
            this.c3Config.size = { width: this.element.clientWidth, height: this.element.clientHeight };
			if (this.chart)
	            this.chart.resize({ width: this.element.clientWidth, height: this.element.clientHeight });
            this.cullAxes();
        }
    }
	
	render():JSX.Element
	{
		return (
			<div
				ref={(c:HTMLElement) => { this.element = c;}}
				style={{flex: 1, overflow: "hidden"}}
				onMouseLeave={ () => this.toolTip.hide() }
			>
				<C3Chart
					config={weavejs.util.JS.copyObject(this.c3Config, true)}
					ref={(c:C3Chart) => {
						this.chartComponent = c;
						this.chart = c && c.chart
						if (this.chart)
							this.handleC3Render();
					}}
				/>
			</div>
		);
	}

	protected toolTip:ToolTip;
	protected element:HTMLElement;
	protected chartComponent:C3Chart;
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
			if (this.chart && _.isEqual(this.chartComponent.props.config, this.c3Config))
				this.chart.flush();
			else
				this.forceUpdate();
		}
	}

	protected handleC3Render():void
	{
		if (!this.chart)
			return;
		
		this.busy = false;
		this.handleChange();
		if (this.busy)
			return;

		this.cullAxes();
		if (this.element && this.chart) {
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

	/**
	 *
	 * @param label
	 * @param angle
	 * @returns {number}
	 */
	getRotatedLabelHeight(label:string, angle:number):number
	{
		let labelLengthRatio:number = Math.cos(Math.abs(angle)*(Math.PI/180));
		let labelHeightRatio:number = Math.sin(Math.abs(angle)*(Math.PI/180));
		var stringHeightFromLength:number = DOMUtils.getTextWidth(label, this.getFontString()) * labelLengthRatio;
		var stringHeightFromHeight:number = DOMUtils.getTextHeight(label, this.getFontString()) * labelHeightRatio;

		return stringHeightFromHeight + stringHeightFromLength;
	}

	/**
	 * Truncate a string from the middle by 'adj' characters and replace with 'replacement'
	 * @param str String to truncate.
	 * @param adj Number of characters to remove from the middle.
	 * @param replacement String to put in place of removed content.
	 * @returns {string} The string that results from removing 'adj' characters and replacing with 'replacement'
	 */
	centerEllipseString(str:string, adj:number, replacement:string)
	{
		var middleIndex:number = Math.floor(str.length/2);
		var startCut:number = middleIndex - Math.floor(adj/2);
		var endCut:number = middleIndex + Math.floor(adj/2)+adj%2;
		return str.slice(0, startCut) + replacement + str.slice(endCut);
	}

	formatXAxisLabel(label:string, angle:number):string
	{
		if(Array.isArray(label) && label.length)
			label = label[0];

		let adjustment = 0;
		let labelHeight = this.getRotatedLabelHeight(label, angle);
		let truncatedLabel:string = label;
		while (labelHeight > (this.margin.bottom.value - 20) && adjustment < label.length)
		{
			adjustment++;
			truncatedLabel = this.centerEllipseString(label, adjustment, "\u2026"); //unicode "..."
			labelHeight = this.getRotatedLabelHeight(truncatedLabel, angle);
		}

		return truncatedLabel;
	}

	formatYAxisLabel(label:string, angle:number):string
	{
		if(Array.isArray(label) && label.length)
			label = label[0];

		let adjustment = 0;
		let labelWidth = DOMUtils.getTextWidth(label, this.getFontString());
		let truncatedLabel:string = label;
		while (labelWidth > (weavejs.WeaveAPI.Locale.reverseLayout ? this.margin.right.value:this.margin.left.value) && adjustment < label.length)
		{
			adjustment++;
			truncatedLabel = this.centerEllipseString(label, adjustment, "\u2026"); //unicode "..."
			labelWidth = DOMUtils.getTextWidth(label, this.getFontString());
		}

		return truncatedLabel;
	}
}
