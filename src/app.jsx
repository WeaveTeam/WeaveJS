import $ from "jquery";
import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import {WeaveLayoutManager} from "./WeaveLayoutManager.jsx";
import DataGrid from "./DataGrid.jsx";
import CustomSearchTool from "./CustomSearchTool.jsx";
import CustomCardViewTool from "./CustomCardViewTool.jsx";
import WeaveReactTable from "./weave-react-table.jsx";
import ui from "./react-ui/ui.jsx";
import Weave from "./Weave.jsx";
import _ from "lodash";
//import ReactBurgerMenu from "react-burger-menu";
import * as bs from "react-bootstrap";

console.log(ui);
//var Menu = ReactBurgerMenu.slide;
var tableContainer = {
    flex: 1
};

var leftPaneStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    position: "relative"
};

export default class App extends React.Component {

    constructor(props) {
        super(props);

        window.weaveReady = () => {
            this.handleWeaveReady();
        };

        this.searchFields = ["First Name", "Middle Name", "Last Name", "Specialization", "CountyFIPS", "FIPS"];
    }

    componentDidMount() {
        this.reactReady = true;
        this.element = React.findDOMNode(this);
        this.weaveContainerElt = React.findDOMNode(this.refs.weaveContainer);
        window.addEventListener("resize", () => { this.forceUpdate(); });
    }

    handleWeaveReady(weave) {
        if(!this.weave) {
            this.weave = weave;
        }
        if(this.reactReady) {
            this.customSearchToolPath = this.weave.path("CustomSearchTool");
            this.customCardViewToolPath = this.weave.path("CustomCardViewTool");
            this.forceUpdate();
        } else {
            setTimeout(this.handleWeaveReady.bind(this), 200);
        }
    }

    componentWillUnmount() {

    }

    showSettings(event) {
    }

    render() {
        if(this.weaveContainerElt) {
            var containerPosition = this.weaveContainerElt.getBoundingClientRect();
            var appPosition = this.element.getBoundingClientRect();

            var style = {
                top: containerPosition.top - appPosition.top,
                left: containerPosition.left - appPosition.left,
                width: containerPosition.right - containerPosition.left,
                height: containerPosition.bottom - containerPosition.top,
                position: "absolute"
            };
        }

        var datagrids = [];
        for(var key in this.tables) {
            datagrids.push(<div key={key} style={tableContainer}>{key}<DataGrid key={key} ref={key}/></div>);
        }

        var customSearchTool = <div/>;
        if(this.customSearchToolPath) {
             customSearchTool = <CustomSearchTool ref="searchTool" bsSize={"small"} toolPath={this.customSearchToolPath}/>;
        }

        var customCardViewTool = <div/>;
        if(this.customCardViewToolPath) {
            customCardViewTool = <CustomCardViewTool ref="cardViewTool" toolPath={this.customCardViewToolPath}/>;
        }

        // var menuItem = {
        //     display: "block",
        //     outline: "none",
        //     padding: "0.8em",
        //     fontSize: "1.15em"
        // };
        // var subMenuItem = {
        //     padding: "0.2em",
        //     outline: "none",
        //     fontSize: "1.0em"
        // };
                // <div style={{height: 108, marginRight: "5px", zIndex: 10, backgroundColor: "#aeb4c9"}}>
                //     <Menu>
                //         <ul className="bm-item-list" style={{height: "100%"}}>
                //             <li style={menuItem}>
                //                 <Item glyphName="plus" label="Vital Stats" href="javascript:void(0);"/>
                //                 <ul style={{listStyleType: "none"}}>
                //                     <li style={subMenuItem}><Item href="javascript:void(0);" label="Birth"/></li>
                //                     <li style={subMenuItem}><Item href="javascript:void(0);" label="Deaths"/></li>
                //                 </ul>
                //             </li>
                //             <li style={menuItem}><Item href="javascript:void(0);" glyphName="remove" label="Crime Stats"/></li>
                //             <li style={menuItem}><Item href="javascript:void(0);" glyphName="user" label="Demography"/></li>
                //             <li style={menuItem}><Item href="http://ivpr.oicweave.org/tnhr/dashboard.php?topic=health" glyphName="tower" label="TN Community Record"/></li>
                //         </ul>
                //     </Menu>
                //     <b style={{fontSize: 40, fontFamily: "Roboto, sans-serif", color: "#373a47", left: "20%", top: "20", fontWeight: "bold", position: "relative"}}>
                //         Prescription Drug Observation
                //     </b>
                // </div>

        return (
            <ui.VBox>
                <div style={{height: 45, marginLeft: "5px", marginRight: "5px", paddingTop: 5}}>
                   {
                     customSearchTool
                   }
                </div>
                <div style={{height: 150, marginLeft: "5px", marginRight: "5px", marginBottom: "20px", paddingTop: 5, overflowY: "scroll"}}>
                    {
                        customCardViewTool
                    }
                </div>
                <div ref="weaveContainer" style={ {display: "flex", flex: 1} }/>
                <Weave ref="weave" style={style} onWeaveReady={this.handleWeaveReady.bind(this)}/>
            </ui.VBox>
        );
    }
}

// class Item extends React.Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             hovered: false
//         };
//     }

//     toggleHover () {
//         this.setState({
//             hovered: !this.state.hovered
//         });
//     }

//     render () {
//         return (
//             <a href={this.props.href} target="_blank" onMouseOver={this.toggleHover.bind(this)} onMouseOut={this.toggleHover.bind(this)} style={{color: this.state.hovered ? "#c94e50" : "#b8b7ad"}}>
//                 {
//                     this.props.glyphName ? <bs.Glyphicon glyph={this.props.glyphName}/> : ""
//                 }
//                 {" "}
//                 {
//                     this.props.label
//                 }
//             </a>
//         );
//     }
// }
