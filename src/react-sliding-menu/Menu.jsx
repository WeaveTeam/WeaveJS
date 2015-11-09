import React from "react";
import MenuItem from "./MenuItem.jsx";


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
    transition: "-webkit-transform ease 300ms",
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

        // do stufff
        return (<div style={menuStyle}>
                    <div style={divStyle}>
                    <CloseButton hideMenu={this.props.hideMenu}/>
                    {this.props.children}
                    </div>
                </div>);
    }
}

class CloseButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <span style={{
                        background: "#888",
                        cursor: "pointer",
                        height: 14,
                        position: "absolute",
                        right: 18,
                        top: 14,
                        width: 3,
                        zIndex: 1,
                        WebkitTransform: "rotate(45deg)"
                }}/>
                <span style={{
                    background: "#888",
                    cursor: "pointer",
                    height: 14,
                    position: "absolute",
                    right: 18,
                    top: 14,
                    width: 3,
                    zIndex: 1,
                    WebkitTransform: "rotate(-45deg)"
                }}/>
                <button onClick={this.props.hideMenu}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "transparent",
                            fontSize: 14,
                            height: 14,
                            outline: "none",
                            overflow: "hidden",
                            padding: 0,
                            position: "absolute",
                            right: 13,
                            textIndent: 14,
                            top: 14,
                            width: 14,
                            zIndex: 1
                }}/>
            </div>
        );
    }
}
