import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import {WeaveComponentRenderer} from "../lib/WeaveUI.js";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

window.weave1 = new Weave();
window.weave2 = new Weave();
window.weave3 = new Weave();
weavejs.core.WeaveArchive.loadUrl(weave1, "/elm/ELM_Alt_Demo/Ar_Riyadh_Health.weave").then(function(){
	weavejs.core.WeaveArchive.loadUrl(weave2, "/elm/ELM_Alt_Demo/Riyadh_City_Health.weave").then(render)
});

var weaveInsts = [weave1, weave2];
var layoutNames = ["Layout", "LineChartLayout"];
function render()
{
	$(() => {
		ReactDOM.render(<MultipleView weaveInstances={weaveInsts}  layouts={layoutNames}
									  style={{width: "90%", height: "90%"}}/>,
			document.getElementById("weaveElt"));
	});
}

class MultipleView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			toggleIndex: 0,
			toggleLayoutIndex: 0,
			addView: false,
			scale: 1
		}
        this.toggleView = this.toggleView.bind(this);
        this.toggleLayout = this.toggleLayout.bind(this);
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

	toggleLayout()
	{
		this.setState({
			toggleLayoutIndex: this.state.toggleLayoutIndex == 0 ? 1 : 0
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
		var layoutName = this.props.layouts[this.state.toggleLayoutIndex];

		var weaveUI = [
			<div key="0" style={styleObject}>
				<WeaveComponentRenderer weave={weaveInst} path={[layoutName]} style={{width: "100%", height: "100%"}}/>
	   		</div>
		];
		
		/*
		var weaveUI = this.props.weaveInstances.map((weaveInst, index) => {
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

			return (
				<div key={index} style={styleObject}>
					<FlexibleLayout layout={layout} style={{width: "100%", height: "100%"}}/>
				</div>
			);
		});
		*/

		var singleViewLabel = "Add Single Tool View For Active Weave";
		if (this.state.addView)
		{
			var weaveInst = this.props.weaveInstances[this.state.toggleIndex];
			var keyIndex = weaveUI.length;
			singleViewLabel = "Remove Single Tool View"

			weaveUI.push(
				<div key={keyIndex} style={{border: "2px solid blue"}}>
					<WeaveComponentRenderer weave={weaveInst} path={['MapTool']} style={{width: "100%", height: "100%"}}/>
				</div>
			);
		}

		return (
			<div style={this.props.style} className="weave-app">
				<div>
					<span onClick={this.toggleView}> Toggle Weave </span> |
					<span onClick={this.toggleLayout}> Toggle Layout </span>|
					<span onClick={this.scaleView}> Scale </span>
					<br/>
				</div>
				{weaveUI}
			</div>
		);
	}
}
