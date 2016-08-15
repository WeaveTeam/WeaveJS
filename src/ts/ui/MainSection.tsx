import * as React from "react";
import * as weavejs from "weavejs";

import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import Button = weavejs.ui.Button;

export interface MainSectionProps
{
	route:string;
}

export interface MainSectionState
{

}

const highlights = [
	{
		title: "Versatile",
		description: "WeaveJS is an adaptable architecture, capable of adjusting to different MV* framework"
	},
	{
		title: "Efficient",
		description: "Efficiently manages your application states and callbacks"
	},
	{
		title: "Scalable",
		description: "Scales with the complexity of your application"
	}
];

export default class MainSection extends React.Component<MainSectionProps, MainSectionState>
{

	render()
	{
		return (
			<div style={{flex: 1}}>
				<VBox className="main-header" style={{justifyContent: "center", alignItems: "center"}}>
					<div style={{marginLeft: 20, marginRight: 20}}>
						<HBox style={{width: "100%"}}>
							{/*<h1 className="main-logo">Weave JS</h1>*/}
							<h1 className="main-title">WeaveJS</h1>
						</HBox>
						<h2>Open Source Modern Application Architecture For Building Interactive Apps.</h2>
						<HBox style={{ height: 200, alignItems: "center", width: "100%"}}>
							<HBox style={{flex: 1, justifyContent: "space-around"}}>
								<Button className="get-started-button">Get Started</Button>
								<Button className="get-started-button" style={{marginLeft: 100}}>Download WeaveJS</Button>
							</HBox>
						</HBox>
					</div>
				</VBox>
				<VBox className="highlights" style={{marginLeft: "auto", marginRight: "auto", marginTop: 20, marginBottom: 20, alignItems: "center", textAlign: "center"}}>
					<span style={{fontSize: "1.5em", marginTop: 20, marginBottom: 20, fontWeight: "bold"}}>Why WeaveJS?</span>
					<HBox style={{ width: "100%", justifyContent: "center"}}>
						{
							highlights.map((highlight, index) => {
								return (
									<VBox key={index} style={{width: 270, marginLeft: 25, marginRight: 25}}>
										<span style={{fontSize: "1.3em", fontWeight: "bold"}}>{highlight.title}</span>
										<span style={{marginTop: 20, marginBottom: 20}}>{highlight.description}</span>
									</VBox>
								);
							})
						}
					</HBox>
				</VBox>
			</div>
		);
	}
}