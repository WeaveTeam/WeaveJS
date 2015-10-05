import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import {WeaveLayoutManager} from "./WeaveLayoutManager.jsx";
import DataGrid from "./DataGrid.jsx";
import CustomListView from "./CustomListView.jsx";
import WeaveReactTable from "./weave-react-table.jsx";
import Weave from "./Weave.jsx";
import _ from "lodash";

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
            this.forceUpdate();
        } else {
            setTimeout(this.handleWeaveReady.bind(this), 200);
        }
    }

    componentWillUnmount() {

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

        return (
            <div style = { {display: "flex", flexDirection: "row", height: "100%"} }>
                <div style={{width: 100, marginLeft: "5px", marginRight: "5px", paddingTop: 5}}>
                    <CustomListView ref="listTool" bsSize={"small"}/>
                </div>
                <div ref="weaveContainer" style={ {display: "flex", flex: 1} }/>
                <Weave ref="weave" style={style} onWeaveReady={this.handleWeaveReady.bind(this)}/>
            </div>
        );
    }
}
