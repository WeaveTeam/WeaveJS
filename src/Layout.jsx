import React from "react";
import SplitPane from "./react-flexible-layout/src/SplitPane.jsx";
//import SplitPane from "react-split-pane";
import _ from "lodash";

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        //this.state = this.props.state;
        this.state = {id: props.state.id, direction: props.state.direction, children: props.state.children, flex: props.state.flex};
    }

    onMouseUp (event) {
    }

    handleStateChange()
    {
        console.log("on state change");
        this.setState({
            children: this.childRefs.map(ref => this.refs[ref])
        });
        if (this.props.onStateChange) {
            this.props.onStateChange();
        }
    }

    render() {
        this.childRefs = [];
        if (this.state.children) {
            var children = this.state.children.map((childState, i) => {
                var ref = "child" + i;
                this.childRefs[i] = ref;
                console.log(ref, childState, i);
                var result = <Layout ref={ref} onStateChange={this.handleStateChange.bind(this)} state={childState} key={i}/>;
                console.log(result);
                return result;
            });
            return <SplitPane state={this.state} onStateChange={this.handleStateChange.bind(this)} split={this.state.direction} minSize={16} flex={this.state.flex}>
                {children}
            </SplitPane>;
        }
        return <div> {this.state.id} </div>;
    }
}
