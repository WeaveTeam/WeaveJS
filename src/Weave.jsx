import React from "react";
import SwfObject from "./swfobject.jsx";
import {registerToolImplementation} from "./WeaveTool.jsx";

class Weave extends React.Component {

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

export default Weave;

registerToolImplementation("Weave", Weave);
