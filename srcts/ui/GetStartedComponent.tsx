import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox,VBox} from  "../react-ui/FlexBox";
import InteractiveTour from  "../react-ui/InteractiveTour";
import FileDialog from  "../ui/FileDialog";


export interface GetStartedComponentProps extends React.HTMLProps<GetStartedComponent>
{
	loader:(initialWeaveComponent:string)=>void;
}

export interface GetStartedComponentState
{
	visible?:boolean;
	showInteractiveTourList?:boolean;
}

export default class GetStartedComponent extends React.Component<GetStartedComponentProps, GetStartedComponentState>
{

	static DATA:string = "data";
	static SESSION:string = "session";
	static INTERACTIVETOUR:string = "interactive tour";


	constructor(props:GetStartedComponentProps)
	{
		super(props);
		this.state = {
			visible:true,
			showInteractiveTourList:false
		}
	}

	componentWillReceiveProps(nextProps:GetStartedComponentProps)
	{
		
	}

	openDataSourceManager=(enableInteractiveTour:boolean = false)=>{
		InteractiveTour.enable  = enableInteractiveTour
		 if(this.props.loader)
			this.props.loader(enableInteractiveTour ? GetStartedComponent.INTERACTIVETOUR : GetStartedComponent.DATA);
		this.setState({
			visible:false
		})
	};

	openFileDialog=()=>{
		if(this.props.loader)
			this.props.loader(GetStartedComponent.SESSION);
		FileDialog.open();
		this.setState({
			visible:false
		})
	};

	enableInteractiveTourList=()=>{
		this.setState({
			showInteractiveTourList:true
		})
	};

	render() {
		if(!this.state.visible )
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
		if(this.state.showInteractiveTourList)
		{
			guidanceListUI = <VBox style={ {position:"relative"} } className="weave-guidance-list">
								<span className="weave-guidance-list-item"
								      onClick={ ()=>{ InteractiveTour.steps = ["CSV file", "Open file","Create a chart"]; this.openDataSourceManager(true)} }>
									CSV Data to Visualization
								</span>
							</VBox>
		}

		let styleObj:React.CSSProperties = _.merge({},this.props.style,{position:"relative"})

		return (
			<div style={styleObj}>
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
						      onClick={this.enableInteractiveTourList}>
							<i className="fa fa-book"></i>
							<br/>
							<span> Start <span style={ {color:"rgb(236, 131, 89)"} }> Interactive Tour</span></span>
						</VBox>
					</HBox>
					{guidanceListUI}

				</div>
			</div>);
	}
}
