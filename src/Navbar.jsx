import React from "react";
import CustomSearchTool from "./CustomSearchTool.jsx";
import ui from "../outts/react-ui/ui.jsx";
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
    this.slidingMenu.hideMenu();
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
          };
        };

        var viewItems = [
          [TOPPRACTITIONER, "Top Practitioner"],
          [PRACTITIONER, "Practitioner"],
          [PATIENT, "Patient"],
          [PRESCRIPTION, "Prescription"]
        ];

        var viewSelectionNodes = viewItems.map(function (viewItem, index)
        {
          return (
            <bs.ListGroupItem key={viewItem[0]}>
              <a onClick={() => this.setActiveView(viewItem[0])} style={getLinkStyle(viewItem[0])}>{viewItem[1]}</a>
            </bs.ListGroupItem>
          );
        }, this);

        let slidingMenu = (
          <SlidingMenu ref={(ref) => { this.slidingMenu = ref; }}>
        <ui.VBox>
            <img style={{width: "140px", height: "140px"}} src="img/tn-logo.svg"/>
            <div>
              <bs.ListGroup>
                {viewSelectionNodes}
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
      </SlidingMenu>);

    return (
      <div style={style}>
        <ui.HBox>
          {
              slidingMenu
          }
          {
              this.props.children
          }
        </ui.HBox>
      </div>
    );
  }
}
export default Navbar;
