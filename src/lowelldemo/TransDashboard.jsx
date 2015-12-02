import React from "react";
import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import ui from "../react-ui/ui.jsx";
import Panel from "./Panel.jsx";
import Weave from "../Weave.jsx";
import _ from "lodash";
import c3 from "c3";

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

  getPanel(panelConfig) {
      return (
        <Panel style={panelConfig.style}>
          <ui.VBox style={{marginRight: "15%"}}>
            <h4 style={{marginBottom: 0}}>
              {panelConfig.title}
            </h4>
            <span style={{height: 2, backgroundColor: "#65A8D4"}}/>
          </ui.VBox>
          <ui.HBox>
            <div style={{flex: 5}}>
              <div style={{margin: 5, width: "100%", height: "100%"}} ref={panelConfig.chartRef}>
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
      );
  }

  componentDidUpdate() {
    var chart = React.findDOMNode(this.refs.chart);
    c3.generate({
      data: {
        columns: [
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 50, 20, 10, 40, 15, 25]
        ]
      },
      bindto: chart
    });
  }

  onWeaveReady(weave) {
    this.weave = weave;
    this.weave.path("lowelltrans").addCallback(this.forceUpdate.bind(this), true);
  }

  render() {

    if(!this.weave) {
      return <Weave ref="weave" onWeaveReady={_.debounce(this.onWeaveReady.bind(this), 100)} style={{width: 1, height: 1}}></Weave>;
    }

    return (
      <ui.VBox>
        <Header>
          <ui.HBox>
            <Weave ref="weave" width={1} height={1}></Weave>
          </ui.HBox>
          <p style={styles.title}>
            Lowell Housing Transactions
          </p>
        </Header>


        <Panel style={{height: 300, margin: 30}}>
          <ui.VBox style={{marginRight: "15%"}}>
            <h4 style={{marginBottom: 0}}>
              City of Lowell Mean Values: Single, Two and Three Family; and Condominium
            </h4>
            <span style={{height: 2, backgroundColor: "#65A8D4"}}/>
          </ui.VBox>
          <ui.HBox>
            <div style={{flex: 1}}>
              <p>
                This is a descriptive paragprah
              </p>
            </div>
            <div style={{flex: 4}}>
              <div style={{margin: "auto", width: "100%", height: "100%"}} ref="chart">
              </div>
            </div>
            <div style={{flex: 1}}>
               <div style={{margin: "auto"}}>
                 This is the interactive table on the right
               </div>
            </div>
          </ui.HBox>
        </Panel>

        <Panel style={{height: 300, margin: 10}}>
          <ui.VBox style={{marginRight: "15%"}}>
            <h4 style={{marginBottom: 0}}>
              City of Lowell: $ of Sales: Single, Two and Three Family; and Condominium
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
