import * as React from "react";
import * as ReactDOM from "react-dom";
import {VBox} from  "../react-ui/FlexBox";
import DataSourceManager from  "./DataSourceManager";
import ControlPanel  from "./ControlPanel";
import DataMenu  from "../menus/DataMenu";


export interface StepByStepGuidanceProps extends React.HTMLProps<StepByStepGuidance>
{
    weave:Weave;
	createObject:(type:new(..._:any[])=>any)=>void;
}

export interface StepByStepGuidanceState
{
	visible:boolean
}

export default class StepByStepGuidance extends React.Component<StepByStepGuidanceProps, StepByStepGuidanceState>
{


	private dataMenu:DataMenu = null;
	constructor(props:StepByStepGuidanceProps)
	{
		super(props);
		this.dataMenu = new DataMenu(props.weave, props.createObject);
		this.state = {
			visible:true
		}
	}

	componentWillReceiveProps(nextProps:StepByStepGuidanceProps)
	{
		
	}

	openDataSource=()=>{
		DataSourceManager.openInstance(this.dataMenu)
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
				      onClick={this.openDataSource}>
					<i className="fa fa-database"></i>
					<br/>
					<span> Start with <span style={ {color:"orange"} }> Data</span></span>
				</VBox>
				<VBox key="charts"
				      className="weave-guidance-item"
				      style={itemStyle}>
					<i className="fa fa-line-chart"></i>
					<br/>
					<span> Start with <span style={ {color:"orange"} }> Chart</span></span>
				</VBox>
				<VBox key="tutorials"
				      className="weave-guidance-item"
				      style={itemStyle}>
					<i className="fa fa-book"></i>
					<br/>
					<span> Start with <span style={ {color:"orange"} }> Tutorials</span></span>
				</VBox>

			</div>);
	}
}
