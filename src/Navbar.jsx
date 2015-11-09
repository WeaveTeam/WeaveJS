import React from "react";
import CustomSearchTool from "./CustomSearchTool.jsx";
import ui from "./react-ui/ui.jsx";
import SlidingMenu from "./react-sliding-menu/SlidingMenu.jsx";

var style = {
	backgroundColor: "#1C6AAD",
	height: 65,
	boxShadow: "0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28)"
};

export default class Navbar extends React.Component {

	constructor(props) {
		super(props);

	}

	render() {
		return (
			<div style={style}>
				<ui.HBox>
					<SlidingMenu>
						<div>
							Test
						</div>
					</SlidingMenu>
					{
						this.props.children
					}
				</ui.HBox>
			</div>
		);
	}
}
