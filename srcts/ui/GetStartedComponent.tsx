import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox,VBox} from  "../react-ui/FlexBox";
import InteractiveTour from  "../react-ui/InteractiveTour";
import {LandingPageView} from "../LandingPage";
import MiscUtils from "../utils/MiscUtils";

export interface GetStartedComponentProps extends React.HTMLProps<GetStartedComponent>
{
	onViewSelect:(view:LandingPageView)=>void;
	showInteractiveTourList?:boolean;
}

export interface GetStartedComponentState
{
	showInteractiveTourList?:boolean;
}

export default class GetStartedComponent extends React.Component<GetStartedComponentProps, GetStartedComponentState>
{
	constructor(props:GetStartedComponentProps)
	{
		super(props);
		this.state = {
			showInteractiveTourList:props.showInteractiveTourList != undefined ? props.showInteractiveTourList:false
		}
	}

	componentWillReceiveProps(nextProps:GetStartedComponentProps)
	{
		if(this.props.showInteractiveTourList != nextProps.showInteractiveTourList)
		{
			this.setState({
				showInteractiveTourList:nextProps.showInteractiveTourList != undefined ? nextProps.showInteractiveTourList:false
			});
		}
	}

	enableInteractiveTourList=()=>
	{
		this.setState({
			showInteractiveTourList:true
		})
	};

	private items:any = {
		csvToViz:{
			steps:["CSV file", "Location","Preview","Sheet 1","Charts"],
			stepPointers:["CSV file", "Open file",null,"Sheet 1","Charts"],
			contents:[
				"Click on CSV file to load rows of data for visualization",
				"Click on open a file button to load CSV file from your local machine",
				"In this table you can see the downloaded data",
				"Click on Layout Tab to add charts of your choice",
				"Click on charts to select visualization chart of your choice"
			]
		},
		multipleTabViz:{
			steps:["CSV file", "Location","Preview","Sheet 1","Charts"],
			stepPointers:["CSV file", "Open file",null,"Sheet 1","Charts"],
			contents:[
				"Click on CSV file to load rows of data for visualization",
				"Click on open a file button to load CSV file from your local machine",
				"In this table you can see the downloaded data",
				"Click on Sheet Tab to add charts of your choice",
				"Click on charts to select visualization chart of your choice"
			]
		}
	};

	interactiveListItemClick=(itemName:string)=>
	{
		InteractiveTour.steps = this.items[itemName].steps ;
		InteractiveTour.stepContents = this.items[itemName].contents ;
		InteractiveTour.stepPointers = this.items[itemName].stepPointers ;
		if(this.props.onViewSelect)
			this.props.onViewSelect("tour");
	};

	render() {
		let urlParams:any = MiscUtils.getUrlParams();

		let containerStyle:React.CSSProperties = {
			position:"absolute",
			left:0,
			top:0,
			width:"100%",
			height:"100%",
			display:"flex",
			flexDirection:"column",
			alignItems: "center",
			justifyContent: "space-around"
		};

		let overlayStyle:React.CSSProperties = {
			position:"absolute",
			left:0,
			top:0,
			width:"100%",
			height:"100%"
		};


		let interactiveTourListUI:JSX.Element  = null;
		if(this.state.showInteractiveTourList)
		{
			interactiveTourListUI = <VBox style={ {position:"relative", fontFamily:"inherit"} } className="weave-guidance-list">
								<span className="weave-guidance-list-item"
								      onClick={ ()=>this.interactiveListItemClick("csvToViz") }>
									1.  CSV Data to Visualization
								</span>
							</VBox>
		}

		let styleObj:React.CSSProperties = _.merge({},this.props.style,{position:"relative"});


		let itemTextStyle:React.CSSProperties = {
			textAlign:"center"
		};


		let disableStyle:React.CSSProperties = {
			borderColor: "grey",
			color: "grey",
			textAlign:"center"
		};

		// empty div required to move the getStarted item in center of the screen
		let emptyDiv:JSX.Element = interactiveTourListUI? null : <div/>;

		// important for logo to have position relative as the container's one of the child is absolute
		/* both padded vbox and hbox class are added to getStarted container, as flex wrap is used , we can expect column layout when screen size is reduced, this ensures spacing*/
		return (
			<div style={styleObj}>
				<div style={containerStyle} className="weave-getstarted">
					<div style={overlayStyle} className="weave-getstarted-overlay"></div>
					<h1 style={ {position:"relative", whiteSpace: "nowrap"} } className="weave-getstarted-logo">
						Weave <span style={ {color:"rgb(236, 131, 89)"} }>2</span>
					</h1>
					<HBox style={ {width:"100%",justifyContent: "space-around", position:"relative",flexWrap:"wrap"} } >
						<VBox key="data"
						      className="weave-getstarted-item"
						      onClick={()=>this.props.onViewSelect("default") }>
							<div className="weave-getstarted-item-icon">
								<i className="fa fa-database"></i>
							</div>
							<span style={itemTextStyle}> Load <span style={ {color:"rgb(236, 131, 89)"} }> Data</span></span>
						</VBox>
						<VBox key="charts"
						      className="weave-getstarted-item"
						      onClick={()=>this.props.onViewSelect("file")}>
							<div className="weave-getstarted-item-icon">
								<i className="fa fa-file"></i>
							</div>
							<span style={itemTextStyle}> Load <span style={ {color:"rgb(236, 131, 89)"} }> Session</span></span>
						</VBox>
						<VBox key="tutorials"
						      className="weave-getstarted-item"
						      style={ Boolean(urlParams.enableTour) ? {cursor:"pointer"} : {cursor:"default"} }
						      onClick={Boolean(urlParams.enableTour) ? this.enableInteractiveTourList : null}
						      >
							<div style={ Boolean(urlParams.enableTour) ? {} : disableStyle } className="weave-getstarted-item-icon">
								<i className="fa fa-book"></i>
							</div>
							<span style={ Boolean(urlParams.enableTour) ? itemTextStyle : disableStyle }>
								Interactive <span style={ Boolean(urlParams.enableTour) ? {color:"rgb(236, 131, 89)"} : disableStyle }> Tour</span>
							</span>
						</VBox>
					</HBox>
					{emptyDiv}
					{interactiveTourListUI}

				</div>
			</div>);
	}
}
