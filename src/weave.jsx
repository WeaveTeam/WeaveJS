import React from "react";
import SwfObject from "./swfobject.jsx";
import {registerToolImplementation} from "./WeaveTool.jsx";
import AbstractWeaveTool from "./AbstractWeaveTool";

export default class Weave extends React.Component {

    constructor(props) {
        super(props);
    }

    onSwfLoaded (event) {
        event.ref.weaveReady = this.props.onWeaveReady;
    }

    render() {
       return (<SwfObject swfUrl="../weave.swf" attributes={{id: "weave"}} onLoad={this.onSwfLoaded.bind(this)} style={this.props.style}/>);
    }

    componentWillUnmount () {
    }

    destroy() {

    }

    resize() {

    }
}

registerToolImplementation("Weave", Weave);
