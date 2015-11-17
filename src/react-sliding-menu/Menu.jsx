import React from "react";
import MenuItem from "./MenuItem.jsx";
import radium from "radium";

var menuStyle = {
    display: "block"
};

var divStyle = {
    position: "absolute",
    zIndex: 2,
    top: 0,
    left: -300,
    width: 300,
    height: "100%",
    boderBox: "",
    transition: "transform ease 300ms",
    background: "#f2f2f2"
};

export default class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };
    }

    render () {
        if(this.state.visible) {
            divStyle.transform = "translate3d(300px, 0, 0)";
        } else {
            delete divStyle.transform;
        }

        //var menutItems = this.props.children.map((child) =>
        // do stufff
        return (<div style={menuStyle}>
                    <div style={divStyle}>
                    <CloseButton hideMenu={this.props.hideMenu}/>
                    {this.props.children}
                    </div>
                </div>);
    }
}
Menu = radium(Menu);

class CloseButton extends React.Component {

    constructor(props) {
        super(props);
    }

   getCrossStyle(type) {
        return {
          position: "absolute",
          width: 3,
          height: 14,
          top: 14,
          right: 18,
          cursor: "pointer",
          transform: type === "before" ? "rotate(45deg)" : "rotate(-45deg)",
          zIndex: 1,
          background: "#888"
        };
    }
    render() {

        var buttonStyle = {
          width: 14,
          height: 14,
          position: "absolute",
          right: 13,
          top: 14,
          padding: 0,
          overflow: "hidden",
          textIndent: 14,
          fontSize: 14,
          border: "none",
          background: "transparent",
          color: "transparent",
          outline: "none",
          zIndex: 1
        };

        return (
            <div>
                <span style={this.getCrossStyle("before")}/>
                <span style={this.getCrossStyle("after")}/>
                <button onClick={this.props.hideMenu} style={buttonStyle}/>
            </div>
        );
    }
}
CloseButton = radium(CloseButton);
