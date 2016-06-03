import * as React from "react";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";
import GuidanceToolTip from "./GuidanceToolTip";
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;


export interface InteractiveTourProps extends React.HTMLProps<InteractiveTour>
{
	direction?:string, //row | column
	location?:string, // column -> top | bottom (left | middle-default | right)  // row -> left | right (top | middle-default | bottom)
	type?:string, // start | next | done
	toolTip?:string,
	enableToolTip?:boolean,//todo
	onClose?:Function
}

export interface InteractiveTourState
{
	close?:boolean,
	activeStepName?:string
}

export default class InteractiveTour extends React.Component<InteractiveTourProps,InteractiveTourState>
{

	static stepName:LinkableString = new LinkableString(); // callback are registered in InteractiveTour Instance
	static enable:boolean = false; // set to true from click event of Guidance List element in GetStartedComponent
	static steps:string[] = []; // props.id are supplied as string of Array. Array supplied in click event of Guidance List element in GetStartedComponent
	static stepComponentMap:any = {} // id mapped with component

	// static method passed to target Component's Reference callback
	// props.id is matched the ref callback to cache either mounted or unmounted state of the component
	static getMountedTargetComponent=(mountedElement:any)=>
	{
		if(!InteractiveTour.enable) {
			return;
		}
		if(!mountedElement)
		{
			/*if(InteractiveTour.stepComponentMap[mountedElement.props.id]){
				InteractiveTour.stepComponentMap[mountedElement.props.id] = null; // when component is unmounted
			}*/
			return;
		}

		if(InteractiveTour.steps && InteractiveTour.steps.length > 0) // if part of guidance steps
		{
			if(InteractiveTour.steps.indexOf(mountedElement.props.id) > -1)
			{
				InteractiveTour.stepComponentMap[mountedElement.props.id] = mountedElement;
				if(InteractiveTour.steps.indexOf(mountedElement.props.id) == 0) // if mounted component is part of first step
				{
					InteractiveTour.stepName.value = mountedElement.props.id; // se the state, which will call the callback registered in Guidance Container instance
				}
			}
		}

	};

	// static method passed to target Component's Reference callback
	// this tell on interactive guidance that user clicked the component that belongs to this step
	// move to nextstep
	static targetComponentOnClick=(stepName:string)=>
	{
		if(!InteractiveTour.enable)
		{
			return;
		}
		if(InteractiveTour.steps && InteractiveTour.steps.length > 0 && InteractiveTour.steps.indexOf(stepName) != -1)
		{
			let currentStepIndex:number = InteractiveTour.steps.indexOf(stepName); // get index of currentStep
			let nextStepName:string = InteractiveTour.steps[currentStepIndex + 1]; // increment to find the next step
			if(nextStepName)
				InteractiveTour.stepName.value = nextStepName; // setting the state will trigger callback in InteractiveTour instance
			else
				InteractiveTour.stepName.value = ""
		}

	};

	constructor(props:InteractiveTourProps)
	{
		super(props);
		InteractiveTour.stepName.addGroupedCallback(this,this.updateNextComponentName); // stepName change on target component Event listener
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
		let nextStepName:string = InteractiveTour.stepName.value;
		if(InteractiveTour.stepComponentMap[nextStepName])
		{
			let mountedElement = InteractiveTour.stepComponentMap[nextStepName];
			this.targetMountedNode =  ReactDOM.findDOMNode(mountedElement as any);
		}

		this.setState({
			activeStepName:nextStepName
		})
		
		if(nextStepName == "") // empty string tell last step is reached , so disable the tour
		{
			InteractiveTour.enable = false;
		}
	};




	componentWillReceiveProps(nextProps:InteractiveTourProps)
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

		/*




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


