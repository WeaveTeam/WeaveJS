import React from "react";


var buttonStyle = {
	border: 0,
	background: "rgba(0,0,0,0)"
};

export default class Button extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.element = React.findDOMNode(this);
		this.element.addEventListener("click", this.props.onClick);
	}

	componentWillUnmount() {
		this.element.removeEventListener("click", this.props.onClick);
	}

	render () {

		// do stufff
		return <div style={{padding: 19}}>
					<button style={buttonStyle}>
						<img src="img/burger-menu.png"/>
					</button>
				</div>;
	}
}
