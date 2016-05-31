import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox,VBox} from  "../react-ui/FlexBox";
import FileDialog from  "../ui/FileDialog";
import DataSourceManager from  "./DataSourceManager";
import ControlPanel  from "./ControlPanel";
import DataMenu  from "../menus/DataMenu";
import FileMenu from "../menus/FileMenu";


export interface GetStartedComponentProps extends React.HTMLProps<GetStartedComponent>
{
    weave:Weave;
	createObject:(type:new(..._:any[])=>any,enableGuidance:boolean)=>void;
}

export interface GetStartedComponentState
{
	visible?:boolean;
	showGuidanceList?:boolean;
}

export default class GetStartedComponent extends React.Component<GetStartedComponentProps, GetStartedComponentState>
{


	private dataMenu:DataMenu = null;
	private fileMenu:FileMenu = null;
	private enableGuidanceMode:boolean = false;
	constructor(props:GetStartedComponentProps)
	{
		super(props);
		this.dataMenu = new DataMenu(props.weave, this.createObjectWithGuidanceModeState);
		this.fileMenu = new FileMenu(props.weave);
		this.state = {
			visible:true,
			showGuidanceList:false
		}
	}

	// wrapper function to supply guidance mode state
	// createObject function is in WeaveApp
	createObjectWithGuidanceModeState = (type:new(..._:any[])=>any)=>{
		this.props.createObject(type,this.enableGuidanceMode);
	}



	componentWillReceiveProps(nextProps:GetStartedComponentProps)
	{
		
	}

	openDataSourceManager=(enableGuidance:boolean = false)=>{
		DataSourceManager.openInstance(this.dataMenu,null,enableGuidance);
		this.setState({
			visible:false
		})
	}

	openFileDialog=()=>{
		FileDialog.open(this.fileMenu.loadUrl,this.fileMenu.handleOpenedFile);
		this.setState({
			visible:false
		})
	}

	enableGuidanceList=()=>{
		this.setState({
			showGuidanceList:true
		})
	}

	render() {
		if(!this.state.visible)
			return <div/>;

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
		}

		let overlayStyle:React.CSSProperties = {
			position:"absolute",
			left:0,
			top:0,
			width:"100%",
			height:"100%"
		}


		let guidanceListUI:JSX.Element  = null;
		if(this.state.showGuidanceList)
		{
			guidanceListUI = <VBox style={ {position:"relative"} } className="weave-guidance-list">
								<span className="weave-guidance-list-item"
								      onClick={ ()=>{this.enableGuidanceMode =true;this.openDataSourceManager(true)} }>
									CSV Data to Visualization
								</span>
								<span className="weave-guidance-list-item"
								      onClick={this.openFileDialog}>
									How to upload Local Weave File
								</span>
							</VBox>
		}

		return (
			<div style={containerStyle} className="weave-getstarted">
				<div style={overlayStyle} className="weave-getstarted-overlay"></div>
				<HBox style={ {width:"100%",justifyContent: "space-around", position:"relative"} }>
					<VBox key="data"
					      className="weave-getstarted-item"
					      onClick={()=>this.openDataSourceManager(false) }>
						<i className="fa fa-database"></i>
						<br/>
						<span> Load <span style={ {color:"rgb(236, 131, 89)"} }> Data</span></span>
					</VBox>
					<VBox key="charts"
					      className="weave-getstarted-item"
					      onClick={this.openFileDialog}>
						<i className="fa fa-code"></i>
						<br/>
						<span> Load <span style={ {color:"rgb(236, 131, 89)"} }> Session</span></span>
					</VBox>
					<VBox key="tutorials"
					      className="weave-getstarted-item"
					      onClick={this.enableGuidanceList}>
						<i className="fa fa-book"></i>
						<br/>
						<span> Start with <span style={ {color:"rgb(236, 131, 89)"} }> Guidance Tour</span></span>
					</VBox>
				</HBox>
				{guidanceListUI}

			</div>);
	}
}
