import * as React from "react";
import * as _ from "lodash";

const toolOverlayStyle:React.CSSProperties = {
    background: "#000",
    opacity: .2,
    zIndex: 3,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none"
};

export interface IToolOverlayProps extends React.Props<ToolOverlay>
{
}

export interface IToolOverlayState
{
    style: React.CSSProperties;
}
export default class ToolOverlay extends React.Component<IToolOverlayProps, IToolOverlayState>
{
    constructor(props:IToolOverlayProps)
    {
        super(props);
        this.state = {
            style: _.clone(toolOverlayStyle)
        };
    }

    render()
    {
        return <div style={this.state.style}/>;
    }
}
