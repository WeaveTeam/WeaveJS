import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import {WeaveComponentRenderer} from "../lib/WeaveUI.js";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

window.weave1 = new Weave();
window.weave2 = new Weave();
window.weave = new Weave();
weavejs.core.WeaveArchive.loadUrl(weave1, "test-export.weave").then(function(){
	weavejs.core.WeaveArchive.loadUrl(weave2, "/tncp/TN_EDU.weave").then(render)
});

var weaveInsts = [weave1, weave2];
function render()
{
	$(() => {
		ReactDOM.render(<MultipleView weaveInstances={weaveInsts} style={{width: "90%", height: "90%"}}/>, document.getElementById("weaveElt"));
	});
}

class MultipleView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			toggleIndex: 0,
			addView: false,
			scale: 1
		}
        this.toggleView = this.toggleView.bind(this);
        this.addView = this.addView.bind(this);
        this.scaleView = this.scaleView.bind(this);
	}

	toggleView()
	{
		this.setState({
			toggleIndex: this.state.toggleIndex == 0 ? 1 : 0,
			addView: false
		});
	}

	addView()
	{
		this.setState({
			addView: !this.state.addView
		});
	}

	scaleView()
	{
		this.setState({
			scale: this.state.scale == 1 ? 0.8 : 1
		});
	}

	render()
	{
		var styleObject = {
			border: "2px solid black",
			display: "flex",
			transform: "scale(" + String(this.state.scale) + ")"
		}

		var weaveInst = this.props.weaveInstances[this.state.toggleIndex];
		var layout = weaveInst.root.requestObject("Layout", Weave.getDefinition("FlexibleLayout"));
		weave.root.setSessionState(weaveInst.root.getSessionState());
		var weaveUI = [
			<div key="0" style={styleObject}>
				<WeaveComponentRenderer weave={weave} path={['Layout']} style={{width: "100%", height: "100%"}}/>
	   		</div>
		];
		
		

		return (
			<div style={this.props.style} className="weave-app">
				<div>
					<span onClick={this.toggleView}> Toggle Weave </span> |
					<span onClick={this.scaleView}> Scale </span>
					<br/>
				</div>
				{weaveUI}
			</div>
		);
	}
}
