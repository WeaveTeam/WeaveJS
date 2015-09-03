import React from "react";
import Pane from "./Pane.jsx";
import Resizer from "./Resizer.jsx";
import VendorPrefix from "react-vendor-prefix";



export default class SplitPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            resized: false
        };
        console.log(this);
    }


    componentDidMount () {
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        var refs = [this.refs.pane1, this.refs.pane2];


        refs.forEach((ref) => {
            if (ref && !this.state.resized) {
                ref.setState({
                    flex: 100
                });
            }
        });
    }

    componentWillUnmount () {
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.onMouseMove);
    }


    onMouseMove (event) {
        var resizer = this.refs.resizer;
        if (resizer.state && resizer.state.active) {
            var pane1 = this.refs.pane1;
            var pane2 = this.refs.pane2;

            if (pane1 && pane2) {
                var element1 = React.findDOMNode(pane1);
                var element2 = React.findDOMNode(pane2);

                if (window.getComputedStyle) {
                    var styles = window.getComputedStyle(element1);
                    var width = styles.width.replace("px", "");
                    var height = styles.height.replace("px", "");
                    console.log(width);
                    console.log(height);
                    var current = this.props.split === "vertical" ? event.clientX : event.clientY;
                    var size = this.props.split === "vertical" ? width : height;
                    var position = this.state.position;

                    var delta = position - current;
                    this.newSize1 = size - delta;
                    //var newSize2 = size + delta;

                    this.setState({
                        position: current,
                        resized: true
                    });

                    if (this.newSize1 >= this.props.minSize) {
                        pane1.setState({
                            flex: this.newSize1
                        });
                    } else {
                        pane2.setState({
                            flex: this.props.minSize
                        });
                    }
                }
            }
        }
    }

    onMouseUp () {
        this.setState({
            active: false
        });
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

        var style = {};

        if (split === "horizontal") {
            this.merge(style, {
                flexDirection: "column",
                height: "100%",
                width: "100%",
                minHeight: "100%"
            });
        } else {
            this.merge(style, {
                flexDirection: "row",
                width: "100%",
                height: "100%"
            });
        }

        const prefixed = VendorPrefix.prefix({styles: style});

        return (
            <div className={classes.join(" ")} style={prefixed.styles} ref="SplitPane">
                <Pane ref="pane1" split={split} flex={this.newSize1}> </Pane>
                <Resizer ref="resizer" key="resizer" split={split}/>
                <Pane ref="pane2" split={split}> </Pane>
            </div>
        );
    }
}
