import React from "react";
import ui from "../../outts/react-ui/ui.jsx";
import StandardLib from "../Utils/StandardLib";
import CustomLineChart from "../tools/custom-linechart.jsx";
import CustomProbeTool from "./CustomProbeTool.jsx";
import _ from "lodash";

export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.path = this.props.panelPath;
    this.path.push("config").addCallback(this, _.debounce(this.forceUpdate.bind(this), 0));
  }

  componentDidMount() {
    window.addEventListener("resize", this._forceUpdate = () => { this.forceUpdate(); });

  }

  updateTitleToColor(chartToColor) {
    this.refs.probeTool.setState({
      columnTitleToColor: chartToColor
    });
  }

  render() {

    var styles = {
       panel: {
         backgroundColor: "white",
         padding: 20,
         borderBottom: "1px solid #e7eaec !important"
       }
     };

    var {style, ...otherProps} = this.props || {};
    StandardLib.merge(styles.panel, style);

    var panelConfig = this.path.getState("config");

    return (
      <ui.VBox style={styles.panel} {...otherProps}>
        <ui.VBox style={{marginRight: "5%"}}>
          <h4 style={{marginBottom: 0}}>
            {panelConfig.title}
          </h4>
          <span style={{height: 2, backgroundColor: "#65A8D4"}}/>
        </ui.VBox>
        <ui.HBox style={{flex: 1}}>
          <CustomLineChart ref="chart" toolPath={this.path.weave.path(panelConfig.chartRef)} style={{flex: 2}} updateTitleToColor={this.updateTitleToColor.bind(this)}/>
          <div style={{flex: 1}}>
             <CustomProbeTool toolPath={this.path} ref="probeTool"/>
          </div>
        </ui.HBox>
      </ui.VBox>
    );
  }
}
