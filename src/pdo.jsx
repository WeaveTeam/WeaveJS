import React from "react";
import ReactDOM from "react-dom";
import CustomSearchTool from "./CustomSearchTool.jsx";
import CustomCardViewTool from "./CustomCardViewTool.jsx";
import ui from "../outts/react-ui/ui.jsx";
import _ from "lodash";
//import ReactBurgerMenu from "react-burger-menu";
import * as bs from "react-bootstrap";
import Navbar from "./Navbar.jsx";
import StandardLib from "../outts/utils/StandardLib.js";
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/*global Weave, weavejs*/

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
const TOPPRACTITIONER = "practitioner-n";
const PATIENT = "patient";
const PRESCRIPTION = "prescription";

class PDO extends React.Component {

    constructor(props) {
        super(props);

        this.weave = props.weave;
        this.state = {
            view: TOPPRACTITIONER
        };
    }

    componentDidMount() {
        this.element = ReactDOM.findDOMNode(this);
        this.weaveContainerElt = ReactDOM.findDOMNode(this.refs.weaveContainer);
        window.addEventListener("resize", () => { this.forceUpdate(); });
		this.changeView();
		this.customSearchToolPath = this.weave.path("CustomSearchTool").request("ExternalTool");
		this.customCardViewToolPath = this.weave.path("CustomCardViewTool").request("ExternalTool");
		this.toolHeightPath = this.customCardViewToolPath.push("toolHeight").request("LinkableNumber");
		this.toolHeightPath.addCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true);
	}

	getActiveView() {
		return this.state.view;
	}

    changeView() {
		if(this.weave) {
			var newFile = this.state.view + ".weave";
			if (this.currentFile !== newFile) {
				this.currentFile = newFile;
				weavejs.core.WeaveArchive.loadUrl(this.weave, newFile);
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
            if(icon === this.state.view) {
                return "img/patient-icon-active.png";
            } else {
                return "img/patient-icon.png";
            }
        }
        if(icon === PRESCRIPTION) {
            if(icon === this.state.view) {
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
            whiteSpace: "nowrap",
            minWidth: "80px",
            borderLeft: "1px solid",
            borderColor: "rgba(255,255,255, 0.2)",
            cursor: "pointer",
            paddingLeft: 1,
            paddingRight: 1
        };

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

        var getColor = (activeView) => {
          return this.getActiveView() === activeView ? "rgb(245, 255, 142)" : "white";
        };
        var toolHeight = this.toolHeightPath ? this.toolHeightPath.getState() : 0;
        return (
            <ui.VBox>
                <Navbar pdo={this}>
                    <ui.HBox>
                        <ui.HBox style={{marginTop: 17, marginLeft: 5, marginRight: 5, flex: 1}}>
                           {
                             customSearchTool
                           }
                       </ui.HBox>
                   </ui.HBox>
                </Navbar>
                <div style={{height: toolHeight, marginLeft: "5px", marginRight: "5px", paddingTop: 5, overflowY: toolHeight ? "scroll" : "hidden"}}>
                    {
                        customCardViewTool
                    }
                </div>
                <div style={ {flex: 1} }>
                	<WeaveLayoutManager ref="weaveContainer" weave={this.weave}/>
                </div>
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
