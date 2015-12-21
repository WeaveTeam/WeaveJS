import React from "react";
import ReactDOM from "react-dom";
import radium from "radium";

var buttonStyle = {
	border: 0,
	background: "rgba(0,0,0,0)"
};

export default class Button extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.element.addEventListener("click", this.props.onClick);
	}

	componentWillUnmount() {
		this.element.removeEventListener("click", this.props.onClick);
	}

	render () {

		// do stufff
		return <div ref={(elt) => { this.element = elt; }} style={{padding: 19}}>
						<button style={buttonStyle}>
							<img src="img/burger-menu.png"/>
						</button>
					</div>;
	}
}
