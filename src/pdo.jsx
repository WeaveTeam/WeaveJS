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
import StandardLib from "./Utils/StandardLib.js";

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

        window.weaveReady = weave => {
            this.handleWeaveReady(weave);
        };
        this.state = {
            view: TOPPRACTITIONER
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
          if (file) {
            this.setState({view: file.split(".")[0]});
          } else {
              this.changeView();
          }
          this.customSearchToolPath = this.weave.path("CustomSearchTool").request("ExternalTool");
          this.customCardViewToolPath = this.weave.path("CustomCardViewTool").request("ExternalTool");
          this.toolHeightPath = this.customCardViewToolPath.push("toolHeight").request("LinkableNumber");
          this.toolHeightPath.addCallback(this.forceUpdate.bind(this), true);
        } else {
            setTimeout(this.handleWeaveReady.bind(this), 200);
        }
    }

  getFileName() {
    var file = this.weave.path().getValue("Weave.fileName");
    if (file === "defaults.xml") {
      return null;
    }
    if (!this.currentFile) {
      this.currentFile = file;
    }
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

        var getColor = (activeView) => {
          return this.getActiveView() === activeView ? "rgb(245, 255, 142)" : "white";
        };
        var toolHeight = this.toolHeightPath ? this.toolHeightPath.getState() : 0;
        return (
            <ui.VBox>
                <Navbar>
                    <ui.HBox>
                        <ui.HBox style={{marginTop: 17, marginLeft: 5, marginRight: 5, flex: 1}}>
                           {
                             customSearchTool
                           }
                       </ui.HBox>
                        <ui.HBox style={{width: "20%", minWidth: 240, height: 30, margin: "auto"}}>
                            <ui.VBox style={viewsIconStyle}>
                                <div style={{margin: "auto", marginBottom: 5}} onClick={() => this.setState({view: TOPPRACTITIONER}, this.changeView.bind(this))}>
                                      {
                                          (this.getActiveView() === PRACTITIONER || this.getActiveView() === TOPPRACTITIONER) ?
                                            <img src="img/practitioner-icon-active.png" width="20" height="20"/>
                                                                              :
                                            <img src="img/practitioner-icon.png" width="20" height="20"/>
                                      }
                                </div>
                                <ui.HBox>
                                  <span style={{textAlign: "center", color: "white", fontSize: 10, width: "100%"}}>
                                    <a onClick={() => this.setState({view: TOPPRACTITIONER}, this.changeView.bind(this))} style={{margin: "auto", fontSize: 10, color: getColor(TOPPRACTITIONER)}}> Top </a>
                                    |
                                    <a onClick={() => this.setState({view: PRACTITIONER}, this.changeView.bind(this))} style={{margin: "auto", fontSize: 10, color: getColor(PRACTITIONER)}}> Practitioner </a>
                                  </span>
                                </ui.HBox>
                            </ui.VBox>
                            <ui.VBox style={viewsIconStyle}>
                                <div style={{margin: "auto", marginBottom: 5}} onClick={() => this.setState({view: PATIENT}, this.changeView.bind(this))}>
                                {
                                    this.getActiveView() === PATIENT ?
                                        <img style={{margin: "auto"}} src="img/patient-icon-active.png" width="20" height="20"/>
                                                                          :
                                        <img style={{margin: "auto"}} src="img/patient-icon.png" width="20" height="20"/>
                                }
                                </div>
                                <a style={{margin: "auto", fontSize: 10, color: (() => { return this.getActiveView() === PATIENT ? "rgb(245, 255, 142)" : "white"; })() }}> Patient </a>
                            </ui.VBox>
                            <ui.VBox style={viewsIconStyle}>
                                <div style={{margin: "auto", marginBottom: 5}} onClick={() => this.setState({view: PRESCRIPTION}, this.changeView.bind(this))}>
                                {
                                    this.getActiveView() === PRESCRIPTION ?
                                        <img style={{margin: "auto"}} src="img/rx-icon-active.png" width="20" height="20"/>
                                                                          :
                                        <img style={{margin: "auto"}} src="img/rx-icon.png" width="20" height="20"/>
                                }
                                </div>
                                <a style={{margin: "auto", fontSize: 10, color: (() => { return this.getActiveView() === PRESCRIPTION ? "rgb(245, 255, 142)" : "white"; })() }}> Prescription </a>
                            </ui.VBox>
                       </ui.HBox>
                   </ui.HBox>
                </Navbar>
                <div style={{height: toolHeight, marginLeft: "5px", marginRight: "5px", paddingTop: 5, overflowY: toolHeight ? "scroll" : "hidden"}}>
                    {
                        customCardViewTool
                    }
                </div>
                <div ref="weaveContainer" style={ {display: "flex", flex: 1} }/>
                <Weave ref="weave" style={style} onWeaveReady={_.debounce(this.handleWeaveReady.bind(this), 100)}/>
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
