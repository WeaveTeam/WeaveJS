import React from "react";

class VBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var {style, ...otherProps} = this.props;
		style = style || {};
		style.display = "flex";
		style.flexDirection = "column";

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
