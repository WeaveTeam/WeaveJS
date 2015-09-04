import React from "react";
import Pane from "./Pane.jsx";
import Resizer from "./Resizer.jsx";
import VendorPrefix from "react-vendor-prefix";



export default class SplitPane extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount () {
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    componentWillUnmount () {
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.onMouseMove);
    }

    onMouseUp (event) {
        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            if(resizer && resizer.state) {
                resizer.setState({
                    active: false
                });
            }
        });
    }

    onMouseMove (event) {
        this.resizerNames.forEach(resizerName => {
            var resizer = this.refs[resizerName];
            if (resizer.state && resizer.state.active && window.getComputedStyle) {
                var pane1 = this.refs[resizer.props.pane1];
                var pane2 = this.refs[resizer.props.pane2];
                var element1 = React.findDOMNode(pane1);
                var element2 = React.findDOMNode(pane2);
                var element2Style = window.getComputedStyle(element2);
                var container = React.findDOMNode(this);
                var rect = container.getBoundingClientRect();
                var left = window.pageXOffset + rect.left;
                var top = window.pageYOffset + rect.top;

                var mousePos, pane1Begin, pane2End;

                if (this.props.split === "horizontal") {
                    var right = element2.offsetLeft + Number(element2Style.width.replace("px", ""));
                    [mousePos, pane1Begin, pane2End] = [event.pageX - left, element1.offsetLeft, right];
                }
                else {
                    var bottom = element2.offsetTop + Number(element2Style.height.replace("px", ""));
                    [mousePos, pane1Begin, pane2End] = [event.pageY - top, element1.offsetTop, bottom];
                }

                mousePos = Math.max(pane1Begin + this.props.minSize, Math.min(mousePos, pane2End - this.props.minSize));

                pane1.setState({
                   flex: mousePos - pane1Begin
                });

                pane2.setState({
                    flex: pane2End - mousePos
                });
            }
        });
    }

    merge (into, obj) {
        for (let attr in obj) {
            into[attr] = obj[attr];
        }
    }

    render() {
        const split = this.props.split || "horizontal";
        const children = this.props.children;
        const classes = ["SplitPane", "split"];

        var style = {
            display: "flex",
            flex: 1,
            position: "relative",
            outline: "none",
            overflow: "hidden",
            userSelect: "none"
        };

        if (split === "vertical") {
            this.merge(style, {
                flexDirection: "column",
                display: "flex",
                height: "100%",
                width: "100%"
            });
        } else {
            this.merge(style, {
                flexDirection: "row",
                display: "flex",
                width: "100%",
                height: "100%"
            });
        }

        const prefixed = VendorPrefix.prefix({styles: style});
        this.resizerNames = [];
        this.paneNames = [];
        var newChildren = new Array(children.length * 2 - 1);
        var i;
        for (i = 0; i < children.length; i++) {
            var paneName = "pane" + i;
            this.paneNames.push(paneName);
            newChildren[i * 2] = <Pane ref={paneName} key={i * 2} split={split}>{children[i]}</Pane>;
        }

        for (i = 1; i < newChildren.length - 1; i += 2)
        {
            var resizerName = "resizer" + (i / 2);
            this.resizerNames.push(resizerName);
            var resizer = <Resizer ref={resizerName} key={i} split={split} pane1={newChildren[i - 1].ref} pane2={newChildren[i + 1].ref}/>;
            newChildren[i] = resizer;
        }

        return (
            <div className={classes.join(" ")} style={prefixed.styles}>
                {newChildren}
            </div>
        );
    }
}
