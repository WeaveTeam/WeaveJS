import React from "react";
import Button from "./Button.jsx";
import Menu from "./Menu.jsx";

export default class SlidingMenu extends React.Component {

	constructor(props) {
		super(props);
	}

	showMenu(event) {
		event.stopPropagation();
		this.refs.menu.setState({
			visible: true
		});
		this.refs.overlay.setState({
			visible: true
		});
	}

	hideMenu(event) {
		if(this.refs.menu.state.visible) {
			this.refs.menu.setState({
				visible: false
			});
			this.refs.overlay.setState({
				visible: false
			});
		}
	}
	componentDidMount() {
		React.findDOMNode(this.refs.overlay).addEventListener("click", this.hideMenu.bind(this));
	}

	render () {
		// do stufff
		return (<div>
			<Button onClick={this.showMenu.bind(this)}/>
			<Menu ref="menu" hideMenu={this.hideMenu.bind(this)}>
				{
					this.props.children
				}
			</Menu>
			<Overlay ref="overlay"/>
		</div>);
	}
}

var overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    transition: "background-color 300ms linear",
    zIndex: 201
};



class Overlay extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return this.state.visible ? <div style={overlayStyle}/> : <div/>;
	}
}
