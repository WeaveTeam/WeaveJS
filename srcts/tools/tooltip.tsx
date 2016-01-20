/// <reference path="../../typings/weave/WeavePath.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>

import * as _ from "lodash";
import * as React from "react";

export function getTooltipContent(
                                    columnNamesToValue:{[columnName:string]: string|number},
                                    title?:string,
                                    nameFormat?:Function,
                                    valueFormat?:Function,
                                    titleFormat?:Function,
                                    toolTipClass?:string
                                ):string
{
    nameFormat = nameFormat || _.identity;
    valueFormat = valueFormat || _.identity;
    titleFormat = titleFormat || _.identity;
    toolTipClass = toolTipClass || "c3-tooltip";

    var template:string = "";

    var columnNames:string[] = Object.keys(columnNamesToValue);
    if(columnNames.length) {
        template += "<table class='" + toolTipClass + "'>" +  titleFormat((title ? "<tr><th colspan='2'>" + title + "</th></tr>" : ""))

        columnNames.forEach((columnName:string) => {
            template += "<tr>";
            template += "<td class='name'>" + nameFormat(columnName) + "</td>";
            template += "<td class='value'>" + valueFormat(columnNamesToValue[columnName]) + "</td>";
            template += "</tr>";
        });
        template += "</table>";
    }

    return template;
}

interface IToolTipPros extends React.Props<ToolTip>{
    event:MouseEvent,
    columnNamesToValue:{[columnName:string]: string|number},
    toolTipClass?:string,
    title?:string,
    tooltipContainerClass?:string,
    nameFormat?:Function,
    valueFormat?:Function,
    titleFormat?:Function,
    showTooltip:boolean
}

interface IToolTipState {

}

export default class ToolTip extends React.Component<IToolTipPros, IToolTipState> {

    private nameFormat:Function;
    private valueFormat:Function;
    private titleFormat:Function;
    private toolTipClass:string;
    private tooltipContainerClass:string;
    private containerStyle:React.CSSProperties;
    private element:HTMLElement;

    constructor(props:IToolTipPros) {
        super(props);

        this.nameFormat = this.props.nameFormat || _.identity;
        this.valueFormat = this.props.valueFormat || _.identity;
        this.titleFormat = this.props.titleFormat || _.identity;
        this.toolTipClass = this.props.toolTipClass || "c3-tooltip";
        this.tooltipContainerClass = this.props.tooltipContainerClass || "c3-tooltip-container";

        this.containerStyle = {
            position: "relative",
            pointerEvents: "none",
            display: "none",
            left: this.props.event.clientX,
            top: this.props.event.clientY
        }
    }

    componentDidMount() {

    }

    getToolTipHtml():string {
        return this.element.innerHTML;
    }

    render():JSX.Element {

        var tableRows:JSX.Element[] = [];
        this.containerStyle.display = this.props.showTooltip ? "none" : "block";
        var columnNames:string[] = Object.keys(this.props.columnNamesToValue);
        if(columnNames.length) {
            tableRows = columnNames.map((columnName:string) => {
                return (
                    <tr key={columnName}>
                        <td className="name">{this.nameFormat(columnName)}</td>
                        <td className="value">{this.valueFormat(this.props.columnNamesToValue[columnName])}</td>
                    </tr>
                )
            });
        }

        return (
            <div ref={(c:HTMLElement) => { this.element = c }} className={this.tooltipContainerClass}>
                <table className={this.toolTipClass}>
                    {
                        this.props.title ? <tr><th colSpan={2}>{this.titleFormat(this.props.title)}</th></tr> : ""
                    }
                    {
                        tableRows
                    }
                </table>
            </div>
        )
    }

}
