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
import Navbar from "./Navbar.jsx";
import * as StandardLib from "./Utils/StandardLib.js";

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

const PRACTITIONER = "practitioner";
const PATIENT = "patient";
const PRESCRIPTION = "prescription";

class PDO extends React.Component {

    constructor(props) {
        super(props);

        window.weaveReady = () => {
            this.handleWeaveReady();
        };
        this.state = {
            view: PRACTITIONER
        };
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
        	var file = this.getFileName();
        	if (file)
	        	this.setState({view: file.split(".")[0]});
	        else
	            this.changeView();
            this.customSearchToolPath = this.weave.path("CustomSearchTool");
            this.customCardViewToolPath = this.weave.path("CustomCardViewTool");
            this.forceUpdate();
        } else {
            setTimeout(this.handleWeaveReady.bind(this), 200);
        }
    }

	getFileName() {
		var file = this.weave.path().getValue("Weave.fileName");
		if (file === "defaults.xml")
			return null;
		if (!this.currentFile)
			this.currentFile = file;
		return file;
	}

    getActiveView() {
        return this.state.view;
    }

    changeView() {
        if(this.weave) {
        	var newFile = this.state.view + ".weave";
	    	if (this.currentFile !== newFile) {
	    		this.currentFile = newFile;
	        	this.weave.loadFile(StandardLib.resolveRelative(newFile, window.location.pathname));
	        }
        }
    }

    getViewIconURL(icon) {
        if(icon === PRACTITIONER) {
            if(icon === this.state.view) {
                return "img/practitioner-icon-active.png";
            } else {
                return "img/practitioner-icon.png";
            }
        }
        if(icon === PATIENT) {
            if(icon === this.state.vew) {
                return "img/patient-icon-active.png";
            } else {
                return "img/patient-icon.png";
            }
        }
        if(icon === PRESCRIPTION) {
            if(icon === this.state.vew) {
                return "img/rx-icon-active.png";
            } else {
                return "img/rx-icon.png";
            }
        }
    }

    componentWillUnmount() {

    }



    render() {

        var viewsIconStyle = {
            flex: 1,
            borderLeft: "1px solid",
            borderColor: "rgba(255,255,255, 0.2)",
            cursor: "pointer"
        };

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

        return (
            <ui.VBox>
                <Navbar>
                    <ui.HBox>
                        <ui.HBox style={{marginTop: 17, marginLeft: 5, marginRight: 5, width: "80%"}}>
                           {
                             customSearchTool
                           }
                       </ui.HBox>
                        <ui.HBox style={{width: "20%", height: 30, margin: "auto"}}>
                            <ui.VBox style={viewsIconStyle} onClick={() => this.setState({view: PRACTITIONER}, this.changeView.bind(this))}>
                                {
                                    this.getActiveView() === PRACTITIONER ?
                                        <img style={{margin: "auto"}} src="img/practitioner-icon-active.png" width="20" height="20"/>
                                                                          :
                                        <img style={{margin: "auto"}} src="img/practitioner-icon.png" width="20" height="20"/>
                                }
                                <font style={{margin: "auto", color: () => { return this.getActiveView() === PRACTITIONER ? "rgb(245, 255, 142)" : "white"; }() }}> Practitioner </font>
                            </ui.VBox>
                            <ui.VBox style={viewsIconStyle} onClick={() => this.setState({view: PATIENT}, this.changeView.bind(this))}>
                                {
                                    this.getActiveView() === PATIENT ?
                                        <img style={{margin: "auto"}} src="img/patient-icon-active.png" width="20" height="20"/>
                                                                          :
                                        <img style={{margin: "auto"}} src="img/patient-icon.png" width="20" height="20"/>
                                }
                                <font style={{margin: "auto", color: () => { return this.getActiveView() === PATIENT ? "rgb(245, 255, 142)" : "white"; }() }}> Patient </font>
                            </ui.VBox>
                            <ui.VBox style={viewsIconStyle} onClick={() => this.setState({view: PRESCRIPTION}, this.changeView.bind(this))}>
                                {
                                    this.getActiveView() === PRESCRIPTION ?
                                        <img style={{margin: "auto"}} src="img/rx-icon-active.png" width="20" height="20"/>
                                                                          :
                                        <img style={{margin: "auto"}} src="img/rx-icon.png" width="20" height="20"/>
                                }
                                <font style={{margin: "auto", color: () => { return this.getActiveView() === PRESCRIPTION ? "rgb(245, 255, 142)" : "white"; }() }}> Prescription </font>
                            </ui.VBox>
                       </ui.HBox>
                   </ui.HBox>
                </Navbar>
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
export default PDO;
