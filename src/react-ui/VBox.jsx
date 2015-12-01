import React from "react";

var vboxStyle = {
	display: "flex",
	flexDirection: "column",
	flex: 1
};

class VBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var {style, ...otherProps} = this.props;
		style = style || {};
		style.display = style.display || vboxStyle.display;
		style.height = style.height || vboxStyle.height;
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
