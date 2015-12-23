/// <reference path="../../typings/react/react.d.ts"/>

import * as React from "react";

export default class HBox extends React.Component<any, any> {

    constructor(props:any, state:any) {
        super(props);
    }

    render() {
        var style:any = this.props.style || {};
        var otherProps:any = {};
        for(var key in this.props) {
            if(key !== "style") {
                otherProps[key] = this.props[key];
            }
        }

        style.display = "flex";
        style.flexDirection = "column";

        return (
            <div style={style} {...otherProps}>
                {
                    this.props.children
                }
            </div>
        )
    }
}
