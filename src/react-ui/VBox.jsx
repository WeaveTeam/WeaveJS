import React from "react";

var vboxStyle = {
	display: "flex",
	flexDirection: "column",
	height: "100%"
};

class VBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div style={vboxStyle}>
				{
					this.props.children
				}
			</div>
		);
	}
}

export default VBox;
