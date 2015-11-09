import React from "react";

var toolOverlayStyle = {
    background: "#000",
    opacity: .2,
    zIndex: 3,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none"
};

class ToolOverlay extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			style: toolOverlayStyle
		};
	}

	render() {
		return <div style={this.state.style}/>;
	}
}

export default ToolOverlay;
