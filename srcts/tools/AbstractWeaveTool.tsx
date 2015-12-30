///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";

interface IAbstractWeaveToolProps extends React.Props<AbstractWeaveTool> {
    toolPath:WeavePath;
    style:React.CSSProperties
}

interface IAbstractWeaveToolState {

}

interface ElementSize {
    width:number;
    height:number;
}

interface PathConfig {
    name: string;
    path: WeavePath;
    callbacks?: Function|Function[];
}

export default class AbstractWeaveTool extends React.Component<IAbstractWeaveToolProps, IAbstractWeaveToolState> {

    private toolPath:WeavePath;
    private wrapper:HTMLElement;
    private element:HTMLElement;
    private paths:{[name:string] : WeavePath};

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
}
