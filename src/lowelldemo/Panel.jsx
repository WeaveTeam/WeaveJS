import React from "react";
import ui from "../react-ui/ui.jsx";
import StandardLib from "../Utils/StandardLib";


export default class Panel extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
  var styles = {
    panel: {
      backgroundColor: "white",
      padding: 20,
      borderBottom: "1px solid #e7eaec !important",
      width: "100%",
      height: "100%"
    }
  };

    var {style, ...otherProps} = this.props || {};
    StandardLib.merge(styles.panel, style);

    return (
      <ui.VBox style={styles.panel} {...otherProps}>
        {this.props.children}
      </ui.VBox>
    );
  }
}
