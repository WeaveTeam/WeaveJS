import React from "react";
import ui from "../react-ui/ui.jsx";

export default class Header extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    var navBarStyle = {
      background: "#333",
      height: 60,
      minHeight: 50,
      borderBottom: "solid",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(100,100,100,0.1)"
    };

    return (<ui.HBox style={navBarStyle}>
      {this.props.children}
    </ui.HBox>);
  }
}
