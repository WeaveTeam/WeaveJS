import React from "react";

class HBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var {style, ...otherProps} = this.props || {};
		style = style || {};
		style.display = "flex";
		style.flexDirection = "row";

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
