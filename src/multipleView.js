import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
/* eslint-disable */
import {WeaveLayoutManager} from "../lib/WeaveUI.js";
/* eslint-enable */

/*global Weave, weavejs*/

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing



window.weave1 = new Weave();
window.weave2 = new Weave();
weavejs.core.WeaveArchive.loadUrl(weave1, "/tncp/TN_EDU.weave").then(function(){
    weavejs.core.WeaveArchive.loadUrl(weave2, "/tncp/TN_FluVaccinations.weave").then(render)
});

var weaveInsts = [weave1,weave2]
function render()
{
	$(() => {
		ReactDOM.render(<MultipleView weaveInstances={weaveInsts} style={{width: "50%", height: "50%"}}/>, document.getElementById("weaveElt"));
	});
}

class MultipleView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            toggleIndex:0,
            addView: false,
            scale:1
        }
        this.toggleView = this.toggleView.bind(this);
        this.addView = this.addView.bind(this);
        this.scaleView = this.scaleView.bind(this);
    }

    toggleView(){
        this.setState({
            toggleIndex: this.state.toggleIndex == 0 ?1:0,
            addView:false
        });
    }

    addView(){
        this.setState({
            addView:!this.state.addView
        });
    }

    scaleView(){
        this.setState({
            scale: this.state.scale == 1 ?0.8:1
        });
    }

    render(){
        var styleObject = {
            border:"2px solid black",
            display: "flex",
            transform: "scale(" + String(this.state.scale) + ")"
        }

        var weaveInst = this.props.weaveInstances[this.state.toggleIndex];
        var layout = weaveInst.root.requestObject("Layout", Weave.getDefinition("FlexibleLayout"));

        var weaveUI = [
        	<div style={styleObject}>
        		<WeaveLayoutManager  layout={layout} style={{flex: "1"}}/>
       		</div>
        ];

       /* var weaveUI = this.props.weaveInstances.map(function(weaveInst,index){
            var layout = weaveInst.root.requestObject("Layout", Weave.getDefinition("FlexibleLayout"));
            var styleObject = {
                border:"2px solid black",
                display:"none"
            }

            if(this.state.toggleIndex == index){
                border:"2px solid black",
                styleObject.display = "flex",
                styleObject.transform =  "scale(" + String(this.state.scale) + ")";
            }

            return <div key={index} style={styleObject}><WeaveLayoutManager  layout={layout} style={{flex: "1"}}/></div>
        },this)*/

        var singleViewLabel = "Add Single Tool View For Active Weave";
        if(this.state.addView){
            var weaveInst = this.props.weaveInstances[this.state.toggleIndex];
            var layout = weaveInst.root.requestObject("SingleToolLayout", Weave.getDefinition("FlexibleLayout"));
            layout.state = {
                  "direction": "horizontal",
                  "flex": 1,
                  "id": [
                    "MapTool"
                  ]
                }
            var keyIndex = weaveUI.length;
            singleViewLabel = "Remove Single Tool View"

            var singleToolView =  <div key={keyIndex} style={{border:"2px solid blue"}} ><WeaveLayoutManager  layout={layout} style={{flex: 1 }}/></div>
            weaveUI.push(singleToolView);
        }


        return <div style={this.props.style}>
                    <div>
                        <span onClick={this.toggleView}> Toggle Weave </span> |
                        <span onClick={this.addView}> {singleViewLabel} </span>|
                        <span onClick={this.scaleView}> Scale </span>
                        <br/>
                    </div>
                    {weaveUI}
                </div>
    }

}




