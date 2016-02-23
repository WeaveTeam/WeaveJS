///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export interface IToolTipProps extends React.Props<ToolTip>{
    toolTipClass?:string;
    toolTipContainerClass?:string;
    nameFormat?:Function;
    valueFormat?:Function;
    titleFormat?:Function;
}

export interface IToolTipState
{
    x?:number;
    y?:number;
    title?:string;
    columnNamesToValue?:{[columnName:string]: string};
    columnNamesToColor?:{[columnName:string]: string};
    showToolTip?:boolean;
}

export default class ToolTip extends React.Component<IToolTipProps, IToolTipState>
{
    private nameFormat:Function;
    private valueFormat:Function;
    private titleFormat:Function;
    private toolTipClass:string;
    private toolTipContainerClass:string;
    private toolTipOffset:number;
    private containerStyle:React.CSSProperties;
    private element:HTMLElement;

    constructor(props:IToolTipProps)
    {
        super(props);

        this.nameFormat = this.props.nameFormat || _.identity;
        this.valueFormat = this.props.valueFormat || _.identity;
        this.titleFormat = this.props.titleFormat || _.identity;
        this.toolTipClass = this.props.toolTipClass || "c3-tooltip";
        this.toolTipContainerClass = this.props.toolTipContainerClass || "c3-tooltip-container";
        this.toolTipOffset = 10;

        this.state = {
            x: 0,
            y: 0,
            title: "",
            columnNamesToValue: {},
            columnNamesToColor: {},
            showToolTip: false
        }

        this.containerStyle = {
            position: "absolute",
            pointerEvents: "none",
            display: "block",
        }
    }

    componentDidMount()
    {
        //this.element = ReactDOM.findDOMNode(this);
    }

    componentDidUpdate()
    {
        if (this.state.showToolTip)
        {
            var container:HTMLElement = this.element.parentNode as HTMLElement;
            if (!(container.clientHeight < this.element.clientHeight))
            {
                var bottomOverflow:number = this.element.offsetTop + this.element.offsetHeight - container.offsetHeight;
                if (bottomOverflow > 0)
                {
                    this.forceUpdate();
                }
            }
            if (!(container.clientWidth < this.element.clientWidth))
            {
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    //handle left overflow
                    if (this.element.offsetLeft < 0)
                    {
                        this.forceUpdate();
                    }
                }
                else
                {
                    var rightOverflow:number = this.element.offsetLeft + this.element.offsetWidth - container.offsetWidth;
                    if (rightOverflow > 0)
                    {
                        this.forceUpdate();
                    }
                }
            }
        }
    }

    getToolTipHtml():string 
    {
        return this.element.innerHTML;
    }

    render():JSX.Element 
    {

        if (!(this.element && this.state.showToolTip))
        {
            return <div ref={(c:HTMLElement) => { this.element = c }}></div>;
        }
        else
        {
            var style:React.CSSProperties = _.clone(this.containerStyle);
            var tableRows:JSX.Element[] = [];
            style.display = "block";

            var container:HTMLElement = this.element.parentNode as HTMLElement;
            var rect:ClientRect = container.getBoundingClientRect();
            var left: number = window.pageXOffset + rect.left;
            var top: number = window.pageYOffset + rect.top;

            var yPos:number = this.state.y - top + this.toolTipOffset;
            var xPos:number = this.state.x - left + this.toolTipOffset;

            var bottomOverflow:number = yPos + this.element.offsetHeight - container.offsetHeight;
            style.top = yPos;
            if (!(container.clientHeight < this.element.clientHeight))
            {
                if (bottomOverflow > 0)
                {
                    style.top =  yPos - bottomOverflow;
                }
                else
                {
                    style.top = yPos;
                }
            }

            style.left = xPos;
            if (weavejs.WeaveAPI.Locale.reverseLayout)
            {
                style.left = style.left - this.element.clientWidth - this.toolTipOffset*2;
                if (style.left < 0 && (this.element.getBoundingClientRect().width != rect.width))
                {
                    style.left = 0;
                }
            }
            else
            {
                var rightOverflow:number = this.element.offsetLeft + this.element.offsetWidth - container.offsetWidth;
                if (!(container.clientWidth < this.element.clientWidth))
                {
                    if (rightOverflow > 0)
                    {
                        style.left = xPos - rightOverflow;
                    }
                }
            }

            var columnNames:string[] = Object.keys(this.state.columnNamesToValue);
            if (columnNames.length)
            {
                tableRows = columnNames.map((columnName:string) => {
                    var colorSpan:JSX.Element = this.state.columnNamesToColor[columnName] ? (<span style={{backgroundColor: this.state.columnNamesToColor[columnName]}}/>) : (null);
					var returnElements:JSX.Element[] = [];
					if (weavejs.WeaveAPI.Locale.reverseLayout)
					{
						returnElements.push(<td key={returnElements.length} className="value">{this.valueFormat(this.state.columnNamesToValue[columnName])}</td>);
						returnElements.push(<td key={returnElements.length} className="name"><div style={{display:"inline"}}>{this.nameFormat(columnName)}</div>{colorSpan}</td>);
					}
					else
					{
						returnElements.push(<td key={returnElements.length} className="name">{colorSpan}<div style={{display:"inline"}}>{this.nameFormat(columnName)}</div></td>);
						returnElements.push(<td key={returnElements.length} className="value">{this.valueFormat(this.state.columnNamesToValue[columnName])}</td>);
					}
					return ( <tr key={columnName}>{returnElements}</tr>);
                });
            }

            return (
                <div style={style} ref={(c:HTMLElement) => { this.element = c }} className={this.toolTipContainerClass}>
                <table className={this.toolTipClass}>
                    <tbody>
                        {
                            <tr><th colSpan={2}>{this.state.title ? this.titleFormat(this.state.title): ""}</th></tr>
                        }
                        {
                            tableRows
                        }
                    </tbody>
                </table>
                </div>
            )
        }
    }

	static getToolTipData(context:ILinkableObject, keys:IQualifiedKey[], additionalColumns:IAttributeColumn[] = []): { [columnName: string]: string }
	{
		let columnHashMap = Weave.getRoot(context).getObject("Probed Columns") as ILinkableHashMap;
		let columns = columnHashMap.getObjects(IAttributeColumn);
		var result:{[columnName: string]: string} = {};

		for (let child of columns.concat(additionalColumns))
		{
			let title:string = child.getMetadata("title");
			let value:string = child.getValueFromKey(keys[0], String);
			if (value)
			{
				result[title] = value;
			}
		}

		//handle remaining keys
		if(keys.length > 1 && columns.length > 0)
			result["("+ keys.length + " records total, 1 shown)"] = null;
		return result;
	}
	
	static getToolTipTitle(context:ILinkableObject, key:IQualifiedKey):string
	{
		let titleHashMap = Weave.getRoot(context).getObject("Probe Header Columns") as ILinkableHashMap;

		return _.map(titleHashMap.getObjects(IAttributeColumn), column => column.getValueFromKey(key, String)).join(", ");
	}

	static getToolTipContent(
            columnNamesToValue:{[columnName:string]: string},
            title?:string,
            nameFormat?:Function,
            valueFormat?:Function,
            titleFormat?:Function,
            toolTipClass?:string,
            columnNamesToColor?:{[columnName:string]: string}
        ):string
	{
	    nameFormat = nameFormat || _.identity;
	    valueFormat = valueFormat || _.identity;
	    titleFormat = titleFormat || _.identity;
	    toolTipClass = toolTipClass || "c3-tooltip";
	
	    var template:string = "";
	
	    var columnNames:string[] = Object.keys(columnNamesToValue);
	    if (columnNames.length)
	    {
	        template += "<table class='" + toolTipClass + "'>" +  titleFormat((title ? "<tr><th colspan='2'>" + title + "</th></tr>" : ""))
	
	        columnNames.forEach((columnName:string) => {
	            template += "<tr>";
	            template += "<td class='name'>";
	            if (columnNamesToColor && columnNamesToColor[columnName])
	            {
	                template += "<span style=" + "'background-color': " + columnNamesToColor[columnName] + "/>";
	            }
	            template += "<div style='display':'inline'>" + nameFormat(columnName) + "</div></td>";
	            template += valueFormat(columnNamesToValue[columnName]) === null ? "<td class='value'>" + valueFormat(columnNamesToValue[columnName]) + "</td>" : "";
	            template += "</tr>";
	        });
	        template += "</table>";
	    }
	
	    return template;
	}
}
