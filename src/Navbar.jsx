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


const PRACTITIONER = "practitioner";
const TOPPRACTITIONER = "practitioner-n";
const PATIENT = "patient";
const PRESCRIPTION = "prescription";

class Navbar extends React.Component {

	constructor(props) {
		super(props);
		this.pdo = props.pdo;
	}

	getActiveView() {
		let pdo = this.pdo;
		return pdo.getActiveView();
	}
	setActiveView(viewName) {
		let pdo = this.pdo;
		pdo.setState({view: viewName}, pdo.changeView.bind(pdo));
	}

	render() {
		var viewsIconStyle = {
            whiteSpace: "nowrap",
            borderLeft: "1px solid",
            backgroundColor: "rgba(0,0,0,1)",
            borderColor: "rgba(255,255,255, 0.2)",
            cursor: "pointer",
            paddingLeft: 1,
            paddingRight: 1
        };

        var getColor = (activeView) => {
          return this.getActiveView() === activeView ? "rgb(245, 255, 142)" : "black";
        };

        var getLinkStyle = (activeView) => {
        	return this.getActiveView() === activeView ? 
        	{
        		cursor: "pointer",
        		fontWeight: "bold"
        	} :
        	{
        		cursor: "pointer",
        		fontWeight: "normal"
        	}
        }

		return (
			<div style={style}>
				<ui.HBox>
					<SlidingMenu>
						<ui.VBox>
								<img style={{width: "140px", height: "140px"}} src="img/tn-logo.svg"/>
								<div>
									<bs.ListGroup>
										<bs.ListGroupItem>
											<a onClick={() => this.setActiveView(TOPPRACTITIONER)} style={getLinkStyle(TOPPRACTITIONER)}>Top Practitioner</a>
										</bs.ListGroupItem>
										<bs.ListGroupItem>
											<a onClick={() => this.setActiveView(PRACTITIONER)} style={getLinkStyle(PRACTITIONER)}>Practitioner</a>
										</bs.ListGroupItem>
										<bs.ListGroupItem>
											<a onClick={() => this.setActiveView(PATIENT)} style={getLinkStyle(PATIENT)}>Patient</a>
										</bs.ListGroupItem>
										<bs.ListGroupItem>
											<a onClick={() => this.setActiveView(PRESCRIPTION)} style={getLinkStyle(PRESCRIPTION)}>Prescription</a>
										</bs.ListGroupItem>
									</bs.ListGroup>
									<bs.ListGroup>
										<bs.ListGroupItem>
											<a href="http://ivpr.oicweave.org/tnhr/dashboard.php?topic=health" target="_blank">TN Community Profile</a>
										</bs.ListGroupItem>
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
