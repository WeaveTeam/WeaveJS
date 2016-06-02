import * as React from "react";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";
import GuidanceToolTip from "./GuidanceToolTip";
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;


export interface GuidanceContainerProps extends React.HTMLProps<GuidanceContainer>
{
	direction?:string, //row | column
	location?:string, // column -> top | bottom (left | middle-default | right)  // row -> left | right (top | middle-default | bottom)
	type?:string, // start | next | done
	toolTip?:string,
	enableToolTip?:boolean,//todo
	onClose?:Function
}

export interface GuidanceContainerState
{
	close?:boolean,
	activeStepName?:string
}

export default class GuidanceContainer extends React.Component<GuidanceContainerProps,GuidanceContainerState>
{

	static stepName:LinkableString = new LinkableString(); // callback are registered in GuidanceContainer Instance
	static enableGuidance:boolean = false; // set to true from click event of Guidance List element in GetStartedComponent
	static guidanceSteps:string[] = []; // props.id are supplied as string of Array. Array supplied in click event of Guidance List element in GetStartedComponent
	static stepComponentMap:any = {} // id mapped with component

	// static method passed to target Component's Reference callback
	// props.id is matched the ref callback to cache either mounted or unmounted state of the component
	static getMountedTargetComponent=(mountedElement:any)=>
	{
		if(!mountedElement)
		{
			if(GuidanceContainer.stepComponentMap[mountedElement.props.id]){
				GuidanceContainer.stepComponentMap[mountedElement.props.id] = null; // when component is unmounted
			}
			return;
		}

		if(GuidanceContainer.enableGuidance)
		{
			if(GuidanceContainer.guidanceSteps && GuidanceContainer.guidanceSteps.length > 0) // if part of guidance steps
			{
				if(GuidanceContainer.guidanceSteps.indexOf(mountedElement.props.id) > -1)
				{
					GuidanceContainer.stepComponentMap[mountedElement.props.id] = mountedElement;
					if(GuidanceContainer.guidanceSteps.indexOf(mountedElement.props.id) == 0) // if mounted component is part of first step
					{
						GuidanceContainer.stepName.value = mountedElement.props.id; // se the state, which will call the callback registered in Guidance Container instance
					}
				}
			}
		}
	};

	// static method passed to target Component's Reference callback
	// this tell on interactive guidance that user clicked the component that belongs to this step
	// move to nextstep
	static targetComponentOnClick=(stepName:string)=>
	{
		if(GuidanceContainer.enableGuidance)
		{
			if(GuidanceContainer.guidanceSteps && GuidanceContainer.guidanceSteps.length > 0 && GuidanceContainer.guidanceSteps.indexOf(stepName) != -1)
			{
				let currentStepIndex:number = GuidanceContainer.guidanceSteps.indexOf(stepName); // get index of currentStep
				let nextStepName:string = GuidanceContainer.guidanceSteps[currentStepIndex + 1]; // increment to find the next step
				if(nextStepName)
					GuidanceContainer.stepName.value = nextStepName; // setting the state will trigger callback in GuidanceContainer instance
				else
					GuidanceContainer.stepName.value = ""
			}
		}
	};

	constructor(props:GuidanceContainerProps)
	{
		super(props);
		GuidanceContainer.stepName.addGroupedCallback(this,this.updateNextComponentName); // stepName change on target component Event listener
		this.state = {
			close:false,
			activeStepName:""
		}
	}

	// store the ref of mounted component
	// to get its absolute position
	// to draw highlighter and overlay
	private targetMountedNode:any = null;

	updateNextComponentName=()=>{
		let nextStepName:string = GuidanceContainer.stepName.value;
		if(GuidanceContainer.stepComponentMap[nextStepName])
		{
			let mountedElement = GuidanceContainer.stepComponentMap[nextStepName];
			this.targetMountedNode =  ReactDOM.findDOMNode(mountedElement as any);
		}

		this.setState({
			activeStepName:nextStepName
		})
	};




	componentWillReceiveProps(nextProps:GuidanceContainerProps)
	{

	}

	closeHandler=()=>{
		this.setState({close:true});
		if(this.props.onClose){
			this.props.onClose();
		}
	};




	render() {

		if(this.state.activeStepName)
		{

			// todo : add ToolTip back
			// todo : automate ToolTip position around the component
			// todo : try react animation for tooltip mount and unmount when step change

			let highlighterStyle:React.CSSProperties = {
				position:"fixed",
				pointerEvents:"none",// so that target component will receive events
				boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.5)", //todo: move to css
				border:"1px solid yellow" //todo: move to css
			};

			let mountedElementRect:ClientRect = this.targetMountedNode.getBoundingClientRect();
			// duplicate component position to highlighter , and since pointer events is set to none, it will look like component is visible
			highlighterStyle.left = mountedElementRect.left;
			highlighterStyle.top = mountedElementRect.top;
			highlighterStyle.width = mountedElementRect.width;
			highlighterStyle.height = mountedElementRect.height;

			// to overlay other regions in the screen, except the component
			// we neee to split the overlay to four components
			let leftOverlayStyle:React.CSSProperties = {
				position:"fixed",
				left:0,
				top:0,
				width: mountedElementRect.left,
				height: "100%",
				background:"transparent"
			};

			let rightOverlayStyle:React.CSSProperties = {
				position:"fixed",
				left:mountedElementRect.right,
				top:0,
				right: 0,
				height: "100%",
				background:"transparent"
			};

			let topOverlayStyle:React.CSSProperties = {
				position:"fixed",
				left:0,
				top:0,
				height: mountedElementRect.top,
				width: "100%",
				background:"transparent"
			};

			let bottomOverlayStyle:React.CSSProperties = {
				position:"fixed",
				left:0,
				bottom:0,
				top: mountedElementRect.bottom,
				width: "100%",
				background:"transparent"
			};

			return  <div>
						<div style={ leftOverlayStyle }/>
						<div style={ rightOverlayStyle }/>
						<div style={ topOverlayStyle }/>
						<div style={ bottomOverlayStyle }/>
						<div style={ highlighterStyle }/>
					</div>

		}
		else
		{
			return <div style={ {position:"fixed"} }/>
		}

		/*let urlParams:any = MiscUtils.getUrlParams();
		 let skipGuidance:boolean = Boolean(urlParams.skipGuidance);

		 if(this.state.close || skipGuidance || !this.props.enable)
		 {
		 return <div>{this.props.children}</div>
		 }


		 let overlayStyle:React.CSSProperties = {
		 position:"fixed",
		 left:0,
		 right:0,
		 top:0,
		 bottom:0,
		 opacity:0.5,
		 background:"black",
		 zIndex:1
		 };

		 let overLayUI:JSX.Element  =  <div style={overlayStyle} />;


		 let direction:string = this.props.direction ? this.props.direction : "row";

		 return (<div>
		 {overLayUI}
		 <div style={ {position:"relative",zIndex:1} }>
		 <div style={ {display:"flex",flexDirection:direction} }>
		 {this.props.children}
		 <GuidanceToolTip location={this.props.location} type={this.props.type} onClose={this.closeHandler}>
		 {this.props.toolTip}
		 </GuidanceToolTip>

		 </div>
		 </div>
		 </div>);*/
	}
}


