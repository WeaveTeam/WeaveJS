import React from "react";
import CustomSearchTool from "./CustomSearchTool.jsx";
import ui from "./react-ui/ui.jsx";

var style = {
	backgroundColor: "#1C6AAD",
	height: 65,
	boxShadow: "0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28)"
};

class Navbar extends React.Component {

	constructor(props) {
		super(props);

	}

	render() {
		return (
			<div style={style}>
				<ui.HBox>
					<div style={{padding: 19}}>
						<img src="img/burger-menu.png"/>
					</div>
					{
						this.props.children
					}
				</ui.HBox>
			</div>
		);
	}
}
export default Navbar;
