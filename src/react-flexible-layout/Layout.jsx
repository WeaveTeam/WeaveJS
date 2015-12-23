/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "../Utils/StandardLib";
import Resizer from "./Resizer";
import ResizerOverlay from "./ResizerOverlay";
const RESIZEROVERLAY = "resizer";
const HORIZONTAL = "horizontal";
export default class Layout extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.panelDragging = false;
        this.state = props.state;
        this.minSize = 16;
        this.boundHandleStateChange = this.handleStateChange.bind(this);
        this.dragging = false;
    }
    componentDidMount() {
        document.addEventListener("mouseup", this.boundMouseUp = this.onMouseUp.bind(this));
        document.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
        this.element.addEventListener("mousemove", this.boundMouseMove = this.onMouseMove.bind(this));
    }
    componentWillReceiveProps(nextProps) {
        this.setState(StandardLib.includeMissingPropertyPlaceholders(this.state, nextProps.state));
    }
    compoenentWillUnmount() {
        document.removeEventListener("mousedown", this.boundMouseDown);
        document.removeEventListener("mouseup", this.boundMouseUp);
        this.element.removeEventListener("mouseMove", this.boundMouseMove);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState) || !_.isEqual(this.state, nextProps.state);
    }
    componentDidUpdate() {
        if (this.props.onStateChange) {
            this.props.onStateChange();
        }
    }
    getComponentFromId(id) {
        if (this.state.id && _.isEqual(this.state.id, id)) {
            return this;
        }
        else {
            for (var i = 0; i < this.childNames.length; i++) {
                var component = this.refs[this.childNames[i]].getComponentFromId(id);
                if (component) {
                    return component;
                }
            }
        }
    }
    getDOMNodeFromId(id) {
        var component = this.getComponentFromId(id);
        if (component) {
            return component.element;
        }
    }
    onMouseDown(event) {
        this.resizerNames.forEach((resizerName) => {
            var resizer = this.refs[resizerName];
            if (resizer && resizer.state && resizer.state.active) {
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
    onMouseMove(event) {
    }
    getResizerRange(resizer) {
        var direction = resizer.props.direction;
        var pane1 = this.refs[resizer.props.pane1];
        var pane2 = this.refs[resizer.props.pane2];
        var element1 = ReactDOM.findDOMNode(pane1);
        var element2 = ReactDOM.findDOMNode(pane2);
        var rect = this.element.getBoundingClientRect();
        var pageLeft = window.pageXOffset + rect.left;
        var pageTop = window.pageYOffset + rect.top;
        if (direction === HORIZONTAL) {
            return [element1.offsetLeft + pageLeft, element2.offsetLeft + element2.clientWidth + pageLeft];
        }
        else {
            return [element1.offsetTop + pageTop, element2.offsetTop + element2.clientHeight + pageTop];
        }
    }
    onMouseUp(event) {
        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            var resizerOverlay = this.refs[RESIZEROVERLAY];
            if (resizer && resizer.state && resizer.state.active) {
                var range = this.getResizerRange(resizer);
                var begin = range[0];
                var end = range[1];
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
        this.panelDragging = false;
    }
    handleStateChange() {
        this.setState({
            children: this.childNames.filter((ref) => {
                return this.refs[ref] ? true : false;
            }).map((ref) => {
                return this.refs[ref].state;
            })
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
        if (this.state.children && this.state.children.length > 0) {
            var newChildren = new Array(this.state.children.length * 2 - 1);
            this.state.children.forEach((childState, i) => {
                var ref = "child" + i;
                this.childNames[i] = ref;
                newChildren[i * 2] = <Layout onStateChange={this.boundHandleStateChange} ref={ref} state={childState} key={i * 2}/>;
            });
            var i;
            for (i = 1; i < newChildren.length - 1; i += 2) {
                var resizerName = "resizer" + (i / 2);
                this.resizerNames.push(resizerName);
                var resizer = <Resizer ref={resizerName} key={i} direction={this.state.direction} pane1={newChildren[i - 1].ref} pane2={newChildren[i + 1].ref}/>;
                newChildren[i] = resizer;
            }
        }
        var prefixed = VendorPrefix.prefix({ styles: style });
        return (<div ref={(elt) => { this.element = elt; }} style={prefixed.styles}>
                {newChildren}
                <ResizerOverlay ref={RESIZEROVERLAY} direction={this.state.direction}/>
            </div>);
    }
}
//# sourceMappingURL=Layout.jsx.map