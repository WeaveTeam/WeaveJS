/// <reference path="../../typings/react/react.d.ts"/>

import * as React from "react";
import * as _ from "lodash";

export default class HBox extends React.Component<any, any>
{
    constructor(props:any, state:any)
	{
        super(props);
    }

    render()
    {
        var style:any = _.merge({
			display: "flex",
			flexDirection: "row"
		}, this.props.style);
		
        var otherProps:any = {};
        for (var key in this.props)
        {
            if (key !== "style")
            {
                otherProps[key] = this.props[key];
            }
        }

        return (
            <div style={style} {...otherProps}>
                {
                    this.props.children
                }
            </div>
        )
    }
}
