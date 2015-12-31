///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>


import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";

export interface IAbstractWeaveToolProps extends React.Props<AbstractWeaveTool> {
    toolPath:WeavePath;
    style:React.CSSProperties
}

export interface IAbstractWeaveToolState {

}

export interface IAbstractWeaveToolPaths {
    [name:string] : WeavePath
}

export interface ElementSize {
    width:number;
    height:number;
}

interface PathConfig {
    name: string;
    path: WeavePath;
    callbacks?: Function|Function[];
}

export default class AbstractWeaveTool extends React.Component<IAbstractWeaveToolProps, IAbstractWeaveToolState> {

    protected toolPath:WeavePath;
    private wrapper:HTMLElement;
    protected element:HTMLElement;
    protected paths:IAbstractWeaveToolPaths;
    protected elementSize:ElementSize;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.paths = {};
    }

    getElementSize():ElementSize {
        return {
            width: this.wrapper.clientWidth,
            height: this.wrapper.clientHeight
        };
    }

    // this function accepts an arry of path configurations
    // a path config is an object with a path object name, the weave path and an
    // optional callback or array of callbacks
    initializePaths(properties:PathConfig[]):void {
        properties.forEach((pathConf:PathConfig) => {
            this.paths[pathConf.name] = pathConf.path;
            if(pathConf.callbacks) {
                var callbacks:Function[] = Array.isArray(pathConf.callbacks) ? pathConf.callbacks as Function[] : [pathConf.callbacks as Function];
                callbacks.forEach((callback:Function) => {
                    this.paths[pathConf.name].addCallback(this, callback, true);
                });
            }
        });
    }

    componentDidUpdate () {

    }

    componentDidMount () {

    }

    componentWillUnmount () {

    }

    handleClick(event:React.MouseEvent):void {

    }

    render():JSX.Element {
        return <div ref={(elt:HTMLElement) => { this.wrapper = elt; }} style={this.props.style}>
            <div ref={(elt:HTMLElement) => {this.element = elt; }} onClick={this.handleClick.bind(this)} style={{width: "100%", height: "100%", maxHeight: "100%"}}></div>
        </div>;
    }

    customFocus(array:Array<number>, type:string, filter:string) {
        array.forEach( (index) => {
            d3.select(d3.select(this.element).selectAll(type).filter(filter)[0][index]).style("opacity",1.0);
        });
    }

    customDeFocus(array:Array<number>, type:string, filter:string) {
        array.forEach( (index) => {
            d3.select(d3.select(this.element).selectAll(type).filter(filter)[0][index]).style("opacity",0.3);
        });
    }
}
