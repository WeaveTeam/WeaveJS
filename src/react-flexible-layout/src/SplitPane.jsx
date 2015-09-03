import React from "react";
import Pane from "./Pane.jsx";
import Resizer from "./Resizer.jsx";
import VendorPrefix from "react-vendor-prefix";



export default class SplitPane extends React.Component {

    constructor(props) {
        super(props);

        this.oldMousePos = 0;
        this.newMousePos = 0;
    }


    componentDidMount () {
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        var refs = [this.refs.pane1, this.refs.pane2];

        refs.forEach((ref) => {
            if (ref) {
                ref.setState({
                    flex: 1
                });
            }
        });
    }

    componentWillUnmount () {
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.onMouseMove);
    }

    onMouseUp (event) {
        var resizer = this.refs.resizer;

        if(resizer && resizer.state) {
            resizer.setState({
                active: false
            });
        }
    }

    onMouseMove (event) {
        var resizer = this.refs.resizer;
        if (resizer.state && resizer.state.active) {
            var pane1 = this.refs.pane1;
            var pane2 = this.refs.pane2;

            if (pane1 && pane2) {
                var element1 = React.findDOMNode(pane1);
                var element2 = React.findDOMNode(pane2);
                var container = React.findDOMNode(this);

                if (window.getComputedStyle) {
                    var styles1 = window.getComputedStyle(element1);
                    var width1 = Number(styles1.width.replace("px", ""));
                    var height1 = Number(styles1.height.replace("px", ""));

                    var stylec = window.getComputedStyle(container);
                    var widthc = Number(stylec.width.replace("px", ""));
                    var heightc = Number(stylec.height.replace("px", ""));

                    this.newMousePos = this.props.split === "vertical" ? event.clientX : event.clientY;
                    this.mouseDelta = this.newMousePos - this.oldMousePos;
                    this.oldMousePos = this.newMousePos;

                    var paneWidth1 = this.props.split === "vertical" ? width1 : height1;
                    var containerWidth = this.props.split === "vertical" ? widthc : heightc;

                    var newPaneWidth1 = paneWidth1 + this.mouseDelta;

                    pane1.setState({
                       flex: newPaneWidth1
                    });

                    pane2.setState({
                        flex: containerWidth - newPaneWidth1
                    });

                    console.log(newPaneWidth1, containerWidth);
                }
            }
        }
    }

    merge (into, obj) {
        for (let attr in obj) {
            into[attr] = obj[attr];
        }
    }

    render() {
        const split = this.props.split || "vertical";
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

        if (split === "horizontal") {
            this.merge(style, {
                flexDirection: "column",
                display: "flex",
                height: "100%",
                width: "100%",
                minHeight: "100%",
                position: "absolute"
            });
        } else {
            this.merge(style, {
                flexDirection: "row",
                display: "flex",
                width: "100%",
                height: "100%",
                position: "absolute"
            });
        }

        const prefixed = VendorPrefix.prefix({styles: style});

        return (
            <div className={classes.join(" ")} style={prefixed.styles} ref="SplitPane">
                <Pane ref="pane1" split={split}>{children[0]}</Pane>
                <Resizer ref="resizer" key="resizer" split={split}/>
                <Pane ref="pane2" split={split}>{children[1]}</Pane>
            </div>
        );
    }
}
