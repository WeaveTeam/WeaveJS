import React from "react";

var hboxStyle = {
	display: "flex",
	flexDirection: "column",
	height: "100%"
};

export default class HBox extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div style={hboxStyle}>
				{
					this.props.children
				}
			</div>
		);
	}
}
