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
		ReactDOM.render(<MultipleView weaveInstances={weaveInsts} style={{width: "100%", height: "100%"}}/>, document.getElementById("weaveElt"));
	});
}

class MultipleView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            toggleIndex:0
        }
        this.toggleView = this.toggleView.bind(this);
    }

    toggleView(){
        this.setState({
            toggleIndex: this.state.toggleIndex == 0 ?1:0
        });
    }

    render(){


        var weaveUI = this.props.weaveInstances.map(function(weaveInst,index){
            var layout = weaveInst.root.requestObject("Layout", Weave.getDefinition("FlexibleLayout"));
            var styleObject = {
                display:"none"
            }
            if(this.state.toggleIndex == index)styleObject.display = "block";
            return <div key={index} style={styleObject}><WeaveLayoutManager  layout={layout} style={{flex: 1,width: "100%"}}/></div>
        },this)



        return <div style={this.props.style}>
                    <div onClick={this.toggleView}> Toggle Weave </div>
                    {weaveUI}
                </div>
    }

}




