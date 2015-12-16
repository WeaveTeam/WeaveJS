import React from "react";
import ReactDOM from "react-dom";
import StandardLib from "../Utils/StandardLib";
import VendorPrefix from "react-vendor-prefix";
import Resizer from "./Resizer.jsx";
import ResizerOverlay from "./ResizerOverlay.jsx";
import _ from "lodash";

var RESIZEROVERLAY = "resizerOverlay";
var HORIZONTAL = "horizontal";

class Layout extends React.Component {
    constructor(props) {
        super(props);
        // this.state = this.props.state;
        this.state = {id: props.state.id, direction: props.state.direction, children: props.state.children, flex: props.state.flex};
        this.minSize = 16;
        this.dragging = false;
    }


    componentDidMount () {
        document.addEventListener("mouseup", this._onMouseUp = this.onMouseUp.bind(this));
        document.addEventListener("mousedown", this._onMouseDown = this.onMouseDown.bind(this));

        this.element.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this));
    }

    componentWillReceiveProps (nextProps) {
        this.setState(StandardLib.includeMissingPropertyPlaceholders(this.state, nextProps.state));
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
        if(this.props.onStateChange && this.state) {
            this.props.onStateChange(this.state);
        }
    }

    getDOMNodeFromId (id) {
        var component = this.getComponentFromId(id);
        if(component) {
          return component.element;
        }
    }

    getComponentFromId (id) {
        if(this.state.id && _.isEqual(this.state.id, id)) {
            return this;
        } else {
            for(var i = 0; i < this.childNames.length; i++) {
                var node = this.refs[this.childNames[i]].getComponentFromId(id);
                if(node) {
                    return node;
                }
            }
        }
    }

    onMouseDown (event) {
        this.resizerNames.forEach(resizerName => {
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

    onMouseMove () {

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
        } else {
            return [element1.offsetTop + pageTop, element2.offsetTop + element2.clientHeight + pageTop];
        }
    }

    onMouseUp (event) {
        var newState = _.cloneDeep(this.state);

        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            var resizerOverlay = this.refs[RESIZEROVERLAY];

            if (resizer && resizer.state && resizer.state.active) {
                var [begin, end] = this.getResizerRange(resizer);

                var mousePos = this.state.direction === HORIZONTAL ? event.pageX : event.pageY;
                var size = this.state.direction === HORIZONTAL ? this.element.clientWidth : this.element.clientHeight;

                mousePos = Math.max(begin + this.minSize, Math.min(mousePos, end - this.minSize));

                var ref1 = resizer.props.pane1;
                var ref2 = resizer.props.pane2;
                var pane1 = this.refs[ref1];
                var pane2 = this.refs[ref2];

                var index1 = this.childNames.indexOf(ref1);
                var index2 = this.childNames.indexOf(ref2);

                var flex1 = (mousePos - begin) / size;
                var flex2 = (end - mousePos) / size;

                newState.children[index1].flex = flex1;
                newState.children[index2].flex = flex2;

                pane1.setState({
                   flex: flex1
                });

                pane2.setState({
                    flex: flex2
                });

                resizer.setState({
                    active: false
                });

                resizerOverlay.setState({
                    active: false
                });
                this.setState(newState);
            }
        });
        this.panelDragging = false;
    }

    handleStateChange (childRef, newState)
    {
        var stateCopy = _.cloneDeep(this.state);
        var index = this.childNames.indexOf(childRef);

        stateCopy.children[index] = newState;
        this.setState(stateCopy);
    }

    render() {
        this.childNames = [];
        this.resizerNames = [];
        var style = {
            display: "flex",
            flex: this.state.flex,
            position: "relative",
            outline: "none",
            overflow: "hidden",
            userSelect: "none",
            flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
        };

        if(this.state.direction === HORIZONTAL) {
          style.height = "100%";
        } else {
          style.width = "100%";
        }

        if (this.state.children && this.state.children.length > 0) {
            var newChildren = new Array(this.state.children.length * 2 - 1);

            this.state.children.forEach((childState, i) => {
                var ref = "child" + i;
                this.childNames[i] = ref;
                newChildren[i * 2] = <Layout onStateChange={this.handleStateChange.bind(this, ref)} ref={ref} state={childState} key={i * 2}/>;
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

        return <div ref={(elt) => { this.element = elt }} style={prefixed.styles}>
                    {newChildren}
                    <ResizerOverlay ref={RESIZEROVERLAY} direction={this.state.direction}/>
               </div>;
    }
}

export default Layout;
