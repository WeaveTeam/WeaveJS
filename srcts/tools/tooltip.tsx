/// <reference path="../../typings/weave/WeavePath.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";

// This function generate and html string and is unsafe to use.
// Create a react element instead.
export function getTooltipContent(
                                    columnNamesToValue:{[columnName:string]: string|number},
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
    if(columnNames.length) {
        template += "<table class='" + toolTipClass + "'>" +  titleFormat((title ? "<tr><th colspan='2'>" + title + "</th></tr>" : ""))

        columnNames.forEach((columnName:string) => {
            template += "<tr>";
            template += "<td class='name'>";
            if(columnNamesToColor && columnNamesToColor[columnName]){
                template += "<span style=" + "'background-color': " + this.state.columnNamesToColor[columnName] + "/>";
            }
            template += "<div style='display':'inline'>" + nameFormat(columnName) + "</div></td>";
            template += "<td class='value'>" + valueFormat(columnNamesToValue[columnName]) + "</td>";
            template += "</tr>";
        });
        template += "</table>";
    }

    return template;
}

export interface IToolTipProps extends React.Props<ToolTip>{
    toolTipClass?:string;
    tooltipContainerClass?:string;
    nameFormat?:Function;
    valueFormat?:Function;
    titleFormat?:Function;
}

export interface IToolTipState {
    x?:number;
    y?:number;
    title?:string;
    columnNamesToValue?:{[columnName:string]: string|number};
    columnNamesToColor?:{[columnName:string]: string};
    showToolTip?:boolean;
}

export default class ToolTip extends React.Component<IToolTipProps, IToolTipState> {

    private nameFormat:Function;
    private valueFormat:Function;
    private titleFormat:Function;
    private toolTipClass:string;
    private tooltipContainerClass:string;
    private containerStyle:React.CSSProperties;
    private element:HTMLElement;

    constructor(props:IToolTipProps) {
        super(props);

        this.nameFormat = this.props.nameFormat || _.identity;
        this.valueFormat = this.props.valueFormat || _.identity;
        this.titleFormat = this.props.titleFormat || _.identity;
        this.toolTipClass = this.props.toolTipClass || "c3-tooltip";
        this.tooltipContainerClass = this.props.tooltipContainerClass || "c3-tooltip-container";

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

    componentDidMount() {
        //this.element = ReactDOM.findDOMNode(this);
    }

    getToolTipHtml():string {
        return this.element.innerHTML;
    }

    render():JSX.Element {
        if(!(this.element && this.state.showToolTip)) {
            return <div ref={(c:HTMLElement) => { this.element = c }}></div>;
        } else {
            var style:React.CSSProperties = _.clone(this.containerStyle);
            var tableRows:JSX.Element[] = [];
            style.display = "block";

            var container:any = this.element.parentNode as Element;
            var rect:ClientRect = container.getBoundingClientRect();
            var left: number = window.pageXOffset + rect.left;
            var top: number = window.pageYOffset + rect.top;
            style.left = this.state.x - left;
            style.top = this.state.y - top;

            var columnNames:string[] = Object.keys(this.state.columnNamesToValue);
            if(columnNames.length) {
                tableRows = columnNames.map((columnName:string) => {
                    var colorSpan:JSX.Element = this.state.columnNamesToColor[columnName] ? (<span style={{backgroundColor: this.state.columnNamesToColor[columnName]}}/>) : (null);
                    return (
                        <tr key={columnName}>
                        <td className="name">{colorSpan}<div style={{display:"inline"}}>{this.nameFormat(columnName)}</div></td>
                        <td className="value">{this.valueFormat(this.state.columnNamesToValue[columnName])}</td>
                        </tr>
                    )
                });
            }

            return (
                <div style={style} ref={(c:HTMLElement) => { this.element = c }} className={this.tooltipContainerClass}>
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

}
