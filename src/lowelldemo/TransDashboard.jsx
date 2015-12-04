import React from "react";
import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import ui from "../react-ui/ui.jsx";
import Panel from "./Panel.jsx";
import Weave from "../Weave.jsx";
import _ from "lodash";
import c3 from "c3";
import CustomLineChart from "../tools/custom-linechart.jsx";
import SlidingMenu from "../react-sliding-menu/SlidingMenu.jsx";
import {Button} from "react-bootstrap";

const styles = {
  title: {
    margin: "auto",
    color: "#BBBBBB",
    fontSize: 24
  }
};

class TransDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.charts = {};
  }

  componentDidMount() {

  }



  componentDidUpdate() {

  }

  onWeaveReady(weave) {
    this.weave = weave;
    this.weave.path("lowelltrans").addCallback(this.forceUpdate.bind(this), true);
  }

  openParcel() {
    window.open("/weave.html?file=Lowell_Transactions_Parcel_Yearly_20150715_Demo.weave", "Parcel", {
      height: 300,
      width: 400,
      menubar: 0,
      toolbar: 0,
      titlebar: 0
    });
  }

  openCensusTract() {
    window.open("/weave.html?file=Lowell_Transactions_CT_Map_20150730_Demo.weave", "Census", {
      height: 300,
      width: 400,
      menubar: 0,
      toolbar: 0,
      titlebar: 0
    });
  }

  render() {

    var panels = this.weave ? this.weave.path("lowelltrans").getChildren().map((childPath, index) => {
      return <Panel panelPath={childPath} key={index} style={{margin: 15, flex: 1 }}></Panel>
    }) : "";

    return (
      <ui.VBox>
        <ui.VBox style={{height: 1000}}>
          <Header>
            <SlidingMenu/>
            <p style={styles.title}>
              Lowell Housing Dashboard
            </p>
            <ui.HBox style={{float: "right !important"}}>
              <div style={{borderLeft: "1px solid", borderColor: "#BBBBBB"}}>
                <div style={{margin: 20}}>
                  <p style={{fontSize: 16, color: "#BBBBBB"}}>About</p>
                </div>
              </div>
              <div style={{borderLeft: "1px solid", borderColor: "#BBBBBB"}}>
                <div style={{margin: 20}}>
                  <p style={{fontSize: 16, color: "#BBBBBB"}}>Settings</p>
                </div>
              </div>
            </ui.HBox>
          </Header>
          <ui.HBox style={{marginLeft: "80%", marginTop: 5}}>
            <div style={{marginRight: 10}}>
              <Button onClick={this.openParcel.bind(this)}>Launch Parcel Map</Button>
            </div>
            <div>
              <Button onClick={this.openCensusTract.bind(this)}>Census Tract</Button>
            </div>
          </ui.HBox>
          {
            panels
          }
        </ui.VBox>
        <Weave ref="weave" onWeaveReady={_.debounce(this.onWeaveReady.bind(this), 100)} width="100%" height="100%"></Weave>
      </ui.VBox>
    );
  }

}

export default TransDashboard;
