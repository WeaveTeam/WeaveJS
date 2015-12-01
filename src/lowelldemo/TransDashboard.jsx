import React from "react";
import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import ui from "../react-ui/ui.jsx";
import Panel from "./Panel.jsx";

const styles = {
  title: {
    margin: "auto",
    color: "#888888",
    fontSize: 24
  }
};

class TransDashboard extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <ui.VBox>
        <Header>
          <p style={styles.title}>
            Lowell Housing Transactions
          </p>
        </Header>

        <Panel style={{height: 300}}>
          <ui.VBox style={{marginRight: "15%"}}>
            <h4 style={{marginBottom: 0}}>
              City of Lowell Median Value
            </h4>
            <span style={{height: 2, backgroundColor: "#65A8D4"}}/>
          </ui.VBox>
          <ui.HBox>
            <div style={{flex: 1}}>
              <p>
                This is a descriptive paragprah
              </p>
            </div>
            <div style={{flex: 1}}>
              <div style={{margin: "auto"}}>
                This is the chart
              </div>
            </div>
            <div style={{flex: 1}}>
               <div style={{margin: "auto"}}>
                 This is the interactive table on the right
               </div>
            </div>
          </ui.HBox>
        </Panel>
      </ui.VBox>
    );
  }

}

export default TransDashboard;
