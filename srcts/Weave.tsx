///<reference path="../typings/react/react.d.ts"/>

import * as React from "react";
import SwfObject from "./swfobject";
import {ICallbackObj} from "swfobject-amd";
import {registerToolImplementation} from "./WeaveTool";

declare type WeaveObject = any;

interface IWeaveProps extends React.Props <Weave> {
    onWeaveReady: Function;
    height: number;
    width: number;
}

interface IWeaveState {

}

class Weave extends React.Component <IWeaveProps, IWeaveState> {

    private weave:WeaveObject;

    constructor(props:IWeaveProps) {
        super(props);
    }

    onSwfLoaded (event:ICallbackObj) {
        (event.ref as any).weaveReady = this.weaveReady.bind(this);
    }

    weaveReady (weave:WeaveObject) {
        this.weave = weave;
        this.props.onWeaveReady(weave);
    }

    render() {
        return (<SwfObject swfUrl="../weave.swf" attributes={{id: "weave"}} onLoad={this.onSwfLoaded.bind(this)} style={{height: this.props.height, maxHeight: this.props.height, width: this.props.width}}/>);
    }

    componentDidUpdate() : void {

    }

    componentWillUnmount() : void {

    }

    get title() : string {
        return "Weave";
    }

    destroy() : void {

    }

    resize() : void {

    }
}

export default Weave;

registerToolImplementation("Weave", Weave);