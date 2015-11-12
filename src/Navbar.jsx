import React from "react";
import CustomSearchTool from "./CustomSearchTool.jsx";
import ui from "./react-ui/ui.jsx";
import SlidingMenu from "./react-sliding-menu/SlidingMenu.jsx";
import * as bs from "react-bootstrap";

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
					<SlidingMenu>
						<ui.VBox>
								<div style={{height: 300, display: "block"}}>
									<div style={{top: "140", left: "100", position: "relative"}}>
										logo placeholder
									</div>
								</div>
								<div style={{flex: 1}}>
									<bs.ListGroup>
										<bs.ListGroupItem><div style={{fontFamily: "'Courgette' cursive", fontSize: "18", textTransform: "lowercase"}}>tnhr</div></bs.ListGroupItem>
										<bs.ListGroupItem>About</bs.ListGroupItem>
										<bs.ListGroupItem><bs.Glyphicon glyph="cog"/> Settings</bs.ListGroupItem>
									</bs.ListGroup>
								</div>
						</ui.VBox>
					</SlidingMenu>
					{
						this.props.children
					}
				</ui.HBox>
			</div>
		);
	}
}
export default Navbar;
