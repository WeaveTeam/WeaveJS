import * as React from "react";
import * as ReactDOM from "react-dom";
import * as weavejs from "weavejs";
import NavBar from "./ui/NavBar";
import MainSection from "./ui/MainSection";
import Footer from "./ui/Footer";
import * as jquery from "jquery";
var $ = (jquery as any).default as typeof jquery;

import VBox = weavejs.ui.flexbox.VBox;
import HBox = weavejs.ui.flexbox.HBox;

export const HOME = "Home";

export interface SiteState
{
	route:string;
}
export class Site extends React.Component<{}, SiteState>
{
	state = {route: HOME};

	handleViewChange=(route:string)=>
	{

	}

	render()
	{
		return (
			<VBox style={{height: "100%"}}>
				<HBox style={{position: "fixed", top: 0, left: 0, width: "100%", overflow: "visible"}}>
					<NavBar onMenuItemClick={this.handleViewChange}/>
				</HBox>
				<VBox style={{height: "100%"}}>
					<MainSection route={this.state.route}/>
					<Footer/>
				</VBox>
			</VBox>
		);
	}
}

$(function(){
	ReactDOM.render(
		<Site/>,
		document.getElementById("weavejs-site")
	);
});
