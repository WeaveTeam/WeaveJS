import React from "react";

var vboxStyle = {
	display: "flex",
	flexDirection: "column",
	width: "100%"
};

class VBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var {style, ...otherProps} = this.props;
		style = style || {};
		style.display = style.display || vboxStyle.display;
		style.width = style.width || vboxStyle.width;
		style.flexDirection = vboxStyle.flexDirection;

		return (
			<div style={style} {...otherProps}>
				{
					this.props.children
				}
			</div>
		);
	}
}

export default VBox;
