import React from "react";



export default class MenuItem extends React.Component {

	constructor(props) {
		super(props);
	}


	render () {
		// do stufff
		return <div>{this.props.children}</div>;
	}
}
