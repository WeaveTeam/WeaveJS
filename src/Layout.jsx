import React from "react";
import SplitPane from "./react-flexible-layout/src/SplitPane.jsx";
import _ from "lodash";

export default class Layout extends React.Component {
    constructor(props) {
        super(props);

        if(!props.layout) {
            // error
        }

        if(typeof props.layout === "string") {
            this.state = {
                e: props.layout
            };
        } else if(props.layout.v) {
            this.state = {
                v: props.layout.v
            };
        } else if(props.layout.h) {
            this.state = {
                h: props.layout.h
            };
        } else {
            // error
        }
    }

    render() {
        return (
                this.state.e ?
                    <div> {this.state.e} </div>
                             :
                    <SplitPane split={this.state.v ? "vertical" : "horizontal"} minSize="100">
                        {
                            _.reduce((this.state.v || this.state.h), (result, layout, key) => {
                                if(result.length === 2) {
                                    let subLayout = this.state.v ? {v: result} : {h: result};
                                    result = [<Layout key={key} layout={subLayout}/>];
                                }

                                result.push(layout);
                                return result;

                            }, [])

                        }
                    </SplitPane>
        );
    }
}
