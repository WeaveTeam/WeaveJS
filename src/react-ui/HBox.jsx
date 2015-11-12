import React from "react";

var hboxStyle = {
	display: "flex",
	flexDirection: "row",
	width: "100%"
};

export default class HBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var {style, ...otherProps} = this.props || {};
		style = style || {};
		style.display = style.display || hboxStyle.display;
		style.width = style.width || hboxStyle.width;
		style.flexDirection = hboxStyle.flexDirection;

		return (
			<div style={style} {...otherProps}>
				{
					this.props.children
				}
			</div>
		);
	}
}
