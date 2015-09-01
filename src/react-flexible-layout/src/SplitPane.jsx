import React from "react";
import Pane from "./Pane.jsx";
import Resizer from "./Resizer.jsx";



export default class SplitPane extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            active: false,
            resized: false
        };
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

    onMouseDown (event) {
        var position = this.props.split === "vertical" ? event.clientX : event.clientY;
        this.setState({
            active: true,
            position: position
        });
    }

    onMouseMove (event) {
        if (this.state && this.state.active) {
            var ref1 = this.refs.pane1;
            var ref2 = this.refs.pane2;

            if (ref1) {
                var node = ref1.getDOMNode();
                if (window.getComputedStyle) {
                    var styles = window.getComputedStyle(node);
                    var width = styles.width.replace("px", "");
                    var height = styles.height.replace("px", "");
                    var current = this.props.split === "vertical" ? event.clientX : event.clientY;
                    var size = this.props.split === "vertical" ? width : height;
                    var position = this.state.position;

                    var delta = position - current;
                    var newSize1 = size - delta;
                    //var newSize2 = size + delta;

                    this.setState({
                        position: current,
                        resized: true
                    });

                    if (newSize1 >= this.props.minSize) {
                        ref1.setState({
                            flex: newSize1
                        });
                    } else {
                        ref1.setState({
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
                flexDirection: "column"
            });
        } else {
            this.merge(style, {
                flexDirection: "row",
                height: "100%"
            });
        }

        return (
            <div className={classes.join(" ")} style={style} ref="SplitPane">
                <Pane ref="pane1" split={split} flex=""> </Pane>
                <Resizer ref="resizer" key="resizer" onMouseDown={this.onMouseDown} split={split}/>
                <Pane ref="pane2" split={split}> </Pane>
            </div>
        );
    }
}
