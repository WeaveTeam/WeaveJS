import React from "react";
import ui from "../react-ui/ui.jsx";
import VendorPrefix from "react-vendor-prefix";

export default class CustomProbeTool extends React.Component {


  constructor(props) {
    super(props);
    this.path = this.props.toolPath;

    this.forceUpdate = this.forceUpdate.bind(this);
    this.dataChanged = this.dataChanged.bind(this);
    this.path.addCallback(this.dataChanged);

    this.state = {
      columnTitleToColor: {}
    };
  }

  componentDidMount() {

  }

  dataChanged() {

  }

  render() {

    var columnsPath = this.path.push("columns");
    var probeKeySet = this.path.weave.path("defaultProbeKeySet");
    window.probeKeySet = probeKeySet;
    var columnNames = columnsPath.getNames();
    var data = columnsPath.retrieveRecords(columnNames, probeKeySet);

    var tableStyle = {
      borderCollapse: "collapse",
      borderSpacing: 0,
      backgroundColor: "fff",
      emptyCells: "show",
      boxShadow: "7px 7px 12px -9px rgb(119,119,119)",
      opacity: 0.9,
      background: "#fff",
      marginBottom: "1.25rem",
      border: "solid 1px #ddd"
    };

    var tables = data.map((record, index) => {
        var rows = [];
        for(var columnName of columnNames) {
          var title = columnsPath.push(columnName).getValue('getMetadata("title")');
          var value = record[columnName];
          rows.push(<tr key={columnName}>
            <td>{title}</td>
            <td style={{color: this.state.columnTitleToColor[title]}}>{value}</td>
          </tr>);
        }
        return <table key={index} style={VendorPrefix.prefix({style: tableStyle}).styles}>
          {
            rows
          }
        </table>;
    });

    return (<ui.HBox>
      {
        tables
      }
    </ui.HBox>);
  }
}
