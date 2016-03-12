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
	private containerStyle:React.CSSProperties;
	private element:HTMLElement;
	
	private toolTipOffset = 10;
	private secondRender = false;

	constructor(props:IToolTipProps)
	{
		super(props);

		this.nameFormat = this.props.nameFormat || _.identity;
		this.valueFormat = this.props.valueFormat || _.identity;
		this.titleFormat = this.props.titleFormat || _.identity;
		this.toolTipClass = this.props.toolTipClass || "c3-tooltip";
		this.toolTipContainerClass = this.props.toolTipContainerClass || "c3-tooltip-container";

		this.state = {
			x: 0,
			y: 0,
			title: "",
			columnNamesToValue: {},
			columnNamesToColor: {},
			showToolTip: false
		}

		this.containerStyle = {
			position: "fixed",
			pointerEvents: "none",
			display: "block",
		}
	}

	componentDidMount()
	{
	}

	componentDidUpdate()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
		
		if (this.secondRender)
		{
			this.secondRender = false;
		}
		else if (this.state.showToolTip)
		{
			this.secondRender = true;
			this.forceUpdate();
		}
	}

	getToolTipHtml():string 
	{
		return this.element && this.element.innerHTML;
	}

	render():JSX.Element 
	{
		if (!this.state.showToolTip)
		{
			return <div style={{width: 0, height: 0}}></div>;
		}
		
		var style:React.CSSProperties = _.clone(this.containerStyle);
		style.display = "block";
		if (!this.secondRender)
			style.opacity = 0;
		style.top = this.state.y + this.toolTipOffset;
		style.left = this.state.x + this.toolTipOffset;
		
		// only try to fit on screen during second render
		if (this.secondRender)
		{
			var mirrorLeft = this.state.x - this.element.clientWidth - this.toolTipOffset;
			var mirrorTop = this.state.y - this.element.clientHeight - this.toolTipOffset;
			var right = style.left + this.element.clientWidth;
			var bottom = style.top + this.element.clientHeight;
			
			if ((right > window.innerWidth || weavejs.WeaveAPI.Locale.reverseLayout) && mirrorLeft > 0)
				style.left = mirrorLeft;
			if (bottom > window.innerHeight && mirrorTop > 0)
				style.top = mirrorTop;
		}

		var tableRows:JSX.Element[] = [];
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
			<div style={style} className={this.toolTipContainerClass}>
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
