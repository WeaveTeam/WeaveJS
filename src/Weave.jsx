import React from "react";
import SwfObject from "./swfobject.jsx";
import {registerToolImplementation} from "./WeaveTool.jsx";

class Weave extends React.Component {

    constructor(props) {
        super(props);
    }

    onSwfLoaded (event) {
        event.ref.weaveReady = this.weaveReady.bind(this);
    }

    weaveReady (weave) {
      this.weave = weave;
      this.props.onWeaveReady(weave);
    }

    render() {
       return (<SwfObject swfUrl="../weave.swf" attributes={{id: "weave"}} onLoad={this.onSwfLoaded.bind(this)} style={{height: this.props.height, maxHeight: this.props.height, width: this.props.width}}/>);
    }

    componentDidUpdate() {
    }

    componentWillUnmount () {
    }

    get title() {
      return "Weave";
    }

    destroy() {

    }

    resize() {

    }
}

export default Weave;

registerToolImplementation("Weave", Weave);
