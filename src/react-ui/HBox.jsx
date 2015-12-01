import React from "react";

var hboxStyle = {
	display: "flex",
	flexDirection: "row",
	height: "100%"
};

class HBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var {style, ...otherProps} = this.props || {};
		style = style || {};
		style.display = style.display || hboxStyle.display;
		style.height = style.height || hboxStyle.height;
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

export default HBox;
