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
            var rect:ClientRect = container.getBoundingClientRect();
            var left: number = Math.round(window.pageXOffset + rect.left);
            var top: number = Math.round(window.pageYOffset + rect.top);
            if (window.innerHeight > this.element.clientHeight)
            {
                var bottomOverflow:number = top + this.element.offsetTop + this.element.offsetHeight - window.innerHeight;
                if (bottomOverflow > 0)
                {
                    this.forceUpdate();
                }
            }
            if (window.innerWidth > this.element.clientWidth)
            {
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    //handle left overflow
                    if (left + this.element.offsetLeft < 0)
                    {
                        this.forceUpdate();
                    }
                }
                else
                {
                    var rightOverflow:number = left + this.element.offsetLeft + this.element.offsetWidth - window.innerWidth;
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
            return <div ref={(c:HTMLElement) => { this.element = c }} style={{width: 0, height: 0}}></div>;
        }
        else
        {
            var style:React.CSSProperties = _.clone(this.containerStyle);
            var tableRows:JSX.Element[] = [];
            style.display = "block";
            var container:HTMLElement = this.element.parentNode as HTMLElement;
            var rect:ClientRect = container.getBoundingClientRect();
            var left: number = Math.round(window.pageXOffset + rect.left);
            var top: number = Math.round(window.pageYOffset + rect.top);

            var yPos:number = this.state.y - top + this.toolTipOffset;
            var xPos:number = this.state.x - left + this.toolTipOffset;

            var bottomOverflow:number = this.state.y + this.toolTipOffset + this.element.offsetHeight - window.innerHeight;
            style.top = yPos;
            if (top + container.clientHeight > this.element.clientHeight)
            {
                if (bottomOverflow > 0)
                {
                    style.top =  style.top - this.element.clientHeight - this.toolTipOffset*2;
                }
            }

            style.left = xPos;
            if (weavejs.WeaveAPI.Locale.reverseLayout)
            {
                style.left = style.left - this.element.clientWidth - this.toolTipOffset*2;
                if ((left + style.left) < 0 && (this.element.getBoundingClientRect().width != rect.width))
                {
                    style.left = xPos;
                }
            }
            else
            {
                var rightOverflow:number = this.state.x + this.toolTipOffset + this.element.offsetWidth - window.innerWidth;
                if (left + container.clientWidth > this.element.clientWidth)
                {
                    if (rightOverflow > 0)
                    {
                        style.left = style.left - this.element.clientWidth - this.toolTipOffset*2;
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
						returnElements.push(<td key={returnElements.length} className="value">{this.valueFormat(Weave.lang(this.state.columnNamesToValue[columnName]))}</td>);
						returnElements.push(<td key={returnElements.length} className="name"><div style={{display:"inline"}}>{this.nameFormat(Weave.lang(columnName))}</div>{colorSpan}</td>);
					}
					else
					{
						returnElements.push(<td key={returnElements.length} className="name">{colorSpan}<div style={{display:"inline"}}>{Weave.lang(this.nameFormat(columnName))}</div></td>);
						returnElements.push(<td key={returnElements.length} className="value">{this.valueFormat(Weave.lang(this.state.columnNamesToValue[columnName]))}</td>);
					}
					return ( <tr key={columnName}>{returnElements}</tr>);
                });
            }

            return (
                <div style={style} ref={(c:HTMLElement) => { this.element = c }} className={this.toolTipContainerClass}>
	                <table className={this.toolTipClass}>
	                    <tbody>
	                        {
	                            <tr><th colSpan={2}>{this.state.title ? this.titleFormat(Weave.lang(this.state.title)): ""}</th></tr>
	                        }
	                        {
	                            tableRows
	                        }
	                    </tbody>
	                </table>
                </div>
            );
        }
    }

	show(context:ILinkableObject, event:MouseEvent, keys:IQualifiedKey[], additionalColumns:IAttributeColumn[]):void
	{
		if (keys.length == 0)
			return this.hide();
		
		this.setState({
			x: event.clientX,
			y: event.clientY,
			showToolTip: true,
			title: ToolTip.getToolTipTitle(context, keys),
			columnNamesToValue: ToolTip.getToolTipData(context, keys, additionalColumns),
			columnNamesToColor: {}
		});
	}

	hide():void
	{
		this.setState({ showToolTip: false });
	}

	private static getToolTipTitle(context:ILinkableObject, keys:IQualifiedKey[]):string
	{
		let titleHashMap = Weave.getRoot(context).getObject("Probe Header Columns") as ILinkableHashMap;
		let columns = titleHashMap ? titleHashMap.getObjects(IAttributeColumn) : [] as IAttributeColumn[];

		return _.map(columns, column => column.getValueFromKey(keys[0], String)).filter(str => !!str).join(", ");
	}

	private static getToolTipData(context:ILinkableObject, keys:IQualifiedKey[], additionalColumns:IAttributeColumn[] = []): { [columnName: string]: string }
	{
		let columnHashMap = Weave.getRoot(context).getObject("Probed Columns") as ILinkableHashMap;
		let columns = columnHashMap ? columnHashMap.getObjects(IAttributeColumn).concat(additionalColumns) : additionalColumns;
		var result:{[columnName: string]: string} = {};

		for (let child of columns)
		{
			let title:string = child.getMetadata("title");
			let value:string = child.getValueFromKey(keys[0], String);
			if (value)
				result[title] = value;
		}

		//handle remaining keys
		if (keys.length > 1)
		{
			let str = keys.length + " records total";
			if (columns.length > 0)
				str += ", 1 shown";
			result["(" + str + ")"] = null;
		}
		return result;
	}
}
