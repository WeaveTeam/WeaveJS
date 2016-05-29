import * as React from "react";
import * as ReactDOM from "react-dom";
import {VBox} from  "../react-ui/FlexBox";
import FileDialog from  "../ui/FileDialog";
import DataSourceManager from  "./DataSourceManager";
import ControlPanel  from "./ControlPanel";
import DataMenu  from "../menus/DataMenu";
import FileMenu from "../menus/FileMenu";


export interface GetStartedComponentProps extends React.HTMLProps<GetStartedComponent>
{
    weave:Weave;
	createObject:(type:new(..._:any[])=>any)=>void;
}

export interface GetStartedComponentState
{
	visible:boolean
}

export default class GetStartedComponent extends React.Component<GetStartedComponentProps, GetStartedComponentState>
{


	private dataMenu:DataMenu = null;
	private fileMenu:FileMenu = null;
	constructor(props:GetStartedComponentProps)
	{
		super(props);
		this.dataMenu = new DataMenu(props.weave, props.createObject);
		this.fileMenu = new FileMenu(props.weave);
		this.state = {
			visible:true
		}
	}

	componentWillReceiveProps(nextProps:GetStartedComponentProps)
	{
		
	}

	openDataSourceManager=()=>{
		DataSourceManager.openInstance(this.dataMenu)
		this.setState({
			visible:false
		})
	}

	openFileDialog=()=>{
		FileDialog.open(this.fileMenu.loadUrl,this.fileMenu.handleOpenedFile)
		this.setState({
			visible:false
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
			alignItems: "center",
			justifyContent: "space-around"
		}

		let overlayStyle:React.CSSProperties = {
			position:"absolute",
			left:0,
			top:0,
			width:"100%",
			height:"100%",
			zIndex:0
		}

		let itemStyle:React.CSSProperties = {
			zIndex:1
		}

		return (
			<div style={containerStyle} className="weave-guidance">
				<div style={overlayStyle} className="weave-guidance-overlay"></div>
				<VBox key="data"
				      className="weave-guidance-item"
				      style={itemStyle}
				      onClick={this.openDataSourceManager}>
					<i className="fa fa-database"></i>
					<br/>
					<span> Start with <span style={ {color:"rgb(236, 131, 89)"} }> Data</span></span>
				</VBox>
				<VBox key="charts"
				      className="weave-guidance-item"
				      style={itemStyle}
				      onClick={this.openFileDialog}>
					<i className="fa fa-code"></i>
					<br/>
					<span> Start with <span style={ {color:"rgb(236, 131, 89)"} }> Session</span></span>
				</VBox>
				<VBox key="tutorials"
				      className="weave-guidance-item"
				      style={itemStyle}>
					<i className="fa fa-book"></i>
					<br/>
					<span> Start with <span style={ {color:"rgb(236, 131, 89)"} }> Tutorials</span></span>
				</VBox>

			</div>);
	}
}
