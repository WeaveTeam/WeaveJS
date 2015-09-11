#!/bin/bash

import React from "react";
//import SplitPane from "./react-flexible-layout/src/SplitPane.jsx";
import VendorPrefix from "react-vendor-prefix";
import Resizer from "./Resizer.jsx";
import ResizerOverlay from "./ResizerOverlay.jsx";
import _ from "lodash";

var RESIZEROVERLAY = "resizerOverlay";
var HORIZONTAL = "horizontal";

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        // this.state = this.props.state;
        this.state = {id: props.state.id, direction: props.state.direction, children: props.state.children, flex: props.state.flex};
        this.minSize = 16;
        this._boundHandleStateChange = this.handleStateChange.bind(this);
        this.dragging = false;
    }


    componentDidMount () {
        document.addEventListener("mouseup", this._onMouseUp = this.onMouseUp.bind(this));
        document.addEventListener("mousedown", this._onMouseDown = this.onMouseDown.bind(this));

        this.element = React.findDOMNode(this);

        this.element.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this));
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps.state);
    }

    componentWillUnmount () {
        document.removeEventListener("mousedown", this._onMouseDown);
        document.removeEventListener("mouseup", this._onMouseUp);
        document.removeEventListener("mouseMove", this._onMouseMove);
    }

    shouldComponentUpdate (nextProps, nextState) {
        return !_.isEqual(this.state, nextState)
            || !_.isEqual(this.state, nextProps.state);
    }

    componentDidUpdate() {
        if (this.props.onStateChange) {
            this.props.onStateChange();
        }
    }

    getDOMNodeFromId (id) {
        if(this.state.id && this.state.id === id) {
            return this.element;
        } else {
            for(var i = 0; i < this.childNames.length; i++) {
                var node = this.refs[this.childNames[i]].getDOMNodeFromId(id);
                if(node) {
                    return node;
                }
            }
        }
    }

    onMouseDown (event) {
        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            if (resizer.state && resizer.state.active) {
                var overlayRange = this.getResizerRange(resizer);
                overlayRange[0] += this.minSize;
                overlayRange[1] -= this.minSize;
                this.refs[RESIZEROVERLAY].setState({
                    active: true,
                    range: overlayRange
                });
            }
        });
    }

    onMouseMove () {
        if(this.grabberActive) {
            console.log("mouse over on layout", this);
        }


        // handle the shadded area
    }

    getResizerRange(resizer) {
        var direction = resizer.props.direction;
        var pane1 = this.refs[resizer.props.pane1];
        var pane2 = this.refs[resizer.props.pane2];

        var element1 = React.findDOMNode(pane1);
        var element2 = React.findDOMNode(pane2);

        var rect = this.element.getBoundingClientRect();
        var pageLeft = window.pageXOffset + rect.left;
        var pageTop = window.pageYOffset + rect.top;

        if (direction === HORIZONTAL) {
            return [element1.offsetLeft + pageLeft, element2.offsetLeft + element2.clientWidth + pageLeft];
        } else {
            return [element1.offsetTop + pageTop, element2.offsetTop + element2.clientHeight + pageTop];
        }
    }

    onMouseUp (event) {

        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            var resizerOverlay = this.refs[RESIZEROVERLAY];

            if (resizer.state && resizer.state.active) {
                var [begin, end] = this.getResizerRange(resizer);

                var mousePos = this.state.direction === HORIZONTAL ? event.pageX : event.pageY;
                var size = this.state.direction === HORIZONTAL ? this.element.clientWidth : this.element.clientHeight;

                mousePos = Math.max(begin + this.minSize, Math.min(mousePos, end - this.minSize));

                var pane1 = this.refs[resizer.props.pane1];
                var pane2 = this.refs[resizer.props.pane2];

                pane1.setState({
                   flex: (mousePos - begin) / size
                });

                pane2.setState({
                    flex: (end - mousePos) / size
                });

                resizer.setState({
                    active: false
                });

                resizerOverlay.setState({
                    active: false
                });

                this.handleStateChange();
            }
        });

        this.grabberActive = false;
    }

    handleStateChange ()
    {
        this.setState({
            children: this.childNames.map(ref => this.refs[ref].state)
        });
    }

    render() {
        this.childNames = [];
        this.resizerNames = [];
        var style = {
            display: "flex",
            flex: this.state.flex,
            width: "100%",
            height: "100%",
            position: "relative",
            outline: "none",
            overflow: "hidden",
            userSelect: "none",
            flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
        };

        var grabber = {
            width: "32",
            height: "32",
            cursor: "move"
        };

        if (this.state.children) {
            var newChildren = new Array(this.state.children.length * 2 - 1);

            this.state.children.forEach((childState, i) => {
                var ref = "child" + i;
                this.childNames[i] = ref;
                newChildren[i * 2] = <Layout onStateChange={this._boundHandleStateChange} ref={ref} state={childState} key={i * 2}/>;
            });

            var i;
            for (i = 1; i < newChildren.length - 1; i += 2)
            {
                var resizerName = "resizer" + (i / 2);
                this.resizerNames.push(resizerName);
                var resizer = <Resizer ref={resizerName} key={i} direction={this.state.direction} pane1={newChildren[i - 1].ref} pane2={newChildren[i + 1].ref}/>;
                newChildren[i] = resizer;
            }
        }

        var prefixed = VendorPrefix.prefix({styles: style});

        return <div style={prefixed.styles}>
                    { this.state.id ? <div onMouseDown={() => { this.grabberActive = true; } } style={grabber}/> : ""}
                    {newChildren}
                    <ResizerOverlay ref={RESIZEROVERLAY} direction={this.state.direction}/>
               </div>;
    }
}
