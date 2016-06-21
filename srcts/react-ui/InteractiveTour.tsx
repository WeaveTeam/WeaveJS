import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

import LinkableString = weavejs.core.LinkableString;


export interface InteractiveTourProps extends React.HTMLProps<InteractiveTour>
{
	enableToolTip?:boolean,//todo
	onClose?:Function
}

export interface InteractiveTourState
{
	visible?:boolean,
	activeStepName?:string
	tooltipHeight?:number // used this at componentDidUpdate to re-render again to center the toolTip
	tooltipWidth?:number // used this at componentDidUpdate to re-render again to center the toolTip
}


export default class InteractiveTour extends React.Component<InteractiveTourProps,InteractiveTourState>
{
	// initialize with null values, we don't want occupy memory as they are static variables
	// Since Tour happens only for the first time , there is no point on creating these objects for the App
	static stepName:LinkableString = new LinkableString(); // callback are registered in InteractiveTour Instance
	static unMountedStepName:string = null;
	static steps:string[] = null; // props.id are supplied as string of Array. Array supplied in click event of Guidance List element in GetStartedComponent
	static stepContents:string[] = null; // contents matching steps name
	static stepPointers:string[] = null; // pointers to click matching steps name
	static stepComponentMap:any = null; // id mapped with component
	static pointerComponentMap:any = null; // id mapped with component
	static stepComponentRefCallbackMap:Map<string,Function> = null;
	static stepPointerRefCallbackMap:Map<string,Function> = null;


	static startTour=(steps:string[],stepContents:string[],stepPointers:string[])=>
	{
		// objects are created, when tour is initiated
		InteractiveTour.steps = steps;
		InteractiveTour.stepContents = stepContents;
		InteractiveTour.stepPointers = stepPointers;
		InteractiveTour.stepComponentMap = {};
		InteractiveTour.pointerComponentMap = {};
		InteractiveTour.stepComponentRefCallbackMap = new Map();
		InteractiveTour.stepPointerRefCallbackMap = new Map();

		// closure function preferred over static function , keeping memory in mind
		function registerMountedComponentToStepName(stepName:string,mountedElement:any)
		{
			if(!mountedElement)
			{
				
				return;
			}
				

			if(InteractiveTour.steps && InteractiveTour.steps.length > 0) // if part of guidance steps
			{
				let stepIndex:number = InteractiveTour.steps.indexOf(stepName);
				if(stepIndex > -1)
				{
					InteractiveTour.stepComponentMap[stepName] = mountedElement;
					if(stepIndex == 0) // if mounted component is part of first step
					{
						InteractiveTour.stepName.value = stepName; // se the state, which will call the callback registered in Guidance Container instance
					}
					if(InteractiveTour.steps[stepIndex] == InteractiveTour.stepPointers[stepIndex])
					{
						InteractiveTour.pointerComponentMap[stepName] = mountedElement;
					}
					// sometimes after click event for next step is triggered, but component might not got mounted yet
					if(InteractiveTour.unMountedStepName && InteractiveTour.unMountedStepName == stepName)
					{
						InteractiveTour.unMountedStepName = null; // set to null as its mounted
						InteractiveTour.stepName.value = stepName;
					}
				}
			}

		}

		// closure function preferred over static function , keeping memory in mind
		function registerPointerComponentToStepName(stepName:string ,mountedElement:any)
		{
			if(!mountedElement)
				return;

			if(InteractiveTour.stepPointers && InteractiveTour.stepPointers.length > 0) // if part of guidance steps
			{
				if(InteractiveTour.stepPointers.indexOf(stepName) > -1)
				{
					InteractiveTour.pointerComponentMap[stepName] = mountedElement;
				}
			}

		}

		// for each stepName ref callback function attached bounded with step name.
		// this ensures callbacks are attached only to current active tour steps
		// not for all the components in the app.
		steps.map(function(stepName:string,index:number){
			InteractiveTour.stepComponentRefCallbackMap.set(stepName,registerMountedComponentToStepName.bind(null,stepName))
		});

		stepPointers.map(function(stepName:string,index:number){
			if(stepName)
				InteractiveTour.stepPointerRefCallbackMap.set(stepName,registerPointerComponentToStepName.bind(null,stepName))
		});
	};

	static getComponentRefCallback=(stepName:string): any =>
	{
		return InteractiveTour.stepComponentRefCallbackMap && InteractiveTour.stepComponentRefCallbackMap.get(stepName);
	};

	static getPointerRefCallback=(stepName:string): any =>
	{
		return InteractiveTour.stepPointerRefCallbackMap && InteractiveTour.stepPointerRefCallbackMap.get(stepName);
	};

	static isEnabled=()=>{
		return InteractiveTour.steps && InteractiveTour.steps.length > 0;
	};

	static isLastStep=(index:number)=>{
		return InteractiveTour.steps && InteractiveTour.steps.length == index + 1;
	};

	static reset=()=>
	{
		InteractiveTour.steps = null;
		InteractiveTour.stepContents = null;
		InteractiveTour.stepPointers = null;
		InteractiveTour.unMountedStepName = null;
		InteractiveTour.stepComponentMap = null;
		InteractiveTour.pointerComponentMap = null;
		InteractiveTour.stepComponentRefCallbackMap = null;
		InteractiveTour.stepPointerRefCallbackMap = null;
	};

	

	// static method passed to target Component's Reference callback
	// this tell on interactive guidance that user clicked the component that belongs to this step
	// move to nextstep
	static targetComponentOnClick=(stepName:string)=>
	{

		if(InteractiveTour.steps && InteractiveTour.steps.length > 0 && InteractiveTour.steps.indexOf(stepName) != -1 )
		{
			let currentStepIndex:number = InteractiveTour.steps.indexOf(stepName); // get index of currentStep
			let nextStepName:string = InteractiveTour.steps[currentStepIndex + 1]; // increment to find the next step
			if(nextStepName)
			{
				if(InteractiveTour.stepComponentMap[nextStepName]) // check whether nextStep component is mounted
				{
					InteractiveTour.stepName.value = nextStepName; // setting the state will trigger callback in InteractiveTour instance
				}
				else
				{
					// store the step name which has unmounted component and set the session value after component is mounted
					InteractiveTour.unMountedStepName = nextStepName;
				}

			}
			else
				InteractiveTour.stepName.value = ""
		}

	};

	constructor(props:InteractiveTourProps)
	{
		super(props);
		InteractiveTour.stepName.addGroupedCallback(this,this.updateNextComponentName,true); // stepName change on target component Event listener
		this.state = {
			visible:true,
			activeStepName:null,
			tooltipHeight:null,
			tooltipWidth:null
		}
	}

	// store the ref of mounted component
	// to get its absolute position
	// to draw highlighter and overlay
	private targetMountedNode:any = null;
	private pointerMountedNode:any = null;
	

	updateNextComponentName=()=>
	{
		let nextStepName:string = InteractiveTour.stepName.value;

		
		if(nextStepName == "") // empty string tell last step is reached , so disable the tour
		{
			this.setState({
				visible:false
			});
			InteractiveTour.reset();
			if(this.props.onClose)
			{
				this.props.onClose();
			}
		}
		else
		{
			let stepIndex:number = InteractiveTour.steps.indexOf(nextStepName);
			let nextPointerName:string = InteractiveTour.stepPointers[stepIndex];
			
			let mountedElement = InteractiveTour.stepComponentMap[nextStepName];
			if(mountedElement)
			{
				this.targetMountedNode =  ReactDOM.findDOMNode(mountedElement as any);
				if(InteractiveTour.stepComponentMap[nextStepName] === InteractiveTour.pointerComponentMap[nextPointerName])
				{
					this.pointerMountedNode = this.targetMountedNode;
				}
				else
				{
					let pointerElement = InteractiveTour.pointerComponentMap[nextPointerName];
					this.pointerMountedNode =  ReactDOM.findDOMNode(pointerElement as any);
				}
			}

			this.setState({
				activeStepName:nextStepName
			});

		}
	};


	closeHandler=()=>
	{
		this.setState({
			visible:false
		});

		InteractiveTour.reset();

		if(this.props.onClose)
		{
			this.props.onClose();
		}
	};



	render()
	{
		if(!this.state.activeStepName || !this.state.visible)
		{
			return <div style={ {position:"fixed"} }/>
		}

		// todo : try react animation for tooltip mount and unmount when step change

		let highlighterStyle:React.CSSProperties = {
			position:"fixed",
			pointerEvents:"none",// so that target component will receive events
			boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.5)", //todo: move to css
			border:"1px solid yellow" //todo: move to css
		};

		let pointerStyleInner:React.CSSProperties = {
			position:"relative",
			height: "50%",
			left: "50%",
			top: "50%",
			borderRadius:"50%",
			transform: "translate(-50%,-50%)",
			width: "50%"
		};

		let pointerStyleOuter:React.CSSProperties = {
			position:"absolute",
			height: "100%",
			left: "0",
			top: "0",
			borderRadius:"50%",
			transform: "transform: translateY(-50%)",
			transformOrigin: "center",
			width: "100%"
		};



		let mountedElementRect:ClientRect = this.targetMountedNode.getBoundingClientRect();


		// duplicate component position to highlighter , and since pointer events is set to none, it will look like component is visible
		highlighterStyle.left = mountedElementRect.left;
		highlighterStyle.top = mountedElementRect.top;
		highlighterStyle.width = mountedElementRect.width;
		highlighterStyle.height = mountedElementRect.height;


		// to overlay other regions in the screen, except the component
		// we need to split the overlay to four components (top, bottom, right, left) to avoid overlapping on respective target
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

		let maxSpace:number = null;
		let leftSpace:number = mountedElementRect.left;
		let rightSpace:number = window.innerWidth - mountedElementRect.right;
		let toolTipPosition:string = null;

		toolTipPosition = rightSpace >= leftSpace ? InteractiveTourToolTip.RIGHT : InteractiveTourToolTip.LEFT;
		maxSpace = rightSpace >= leftSpace ? rightSpace : leftSpace;

		let topSpace:number = mountedElementRect.top;
		toolTipPosition = maxSpace >= topSpace ? toolTipPosition : InteractiveTourToolTip.TOP;
		maxSpace = maxSpace >= topSpace ? maxSpace : topSpace;


		let bottomSpace:number =  window.innerHeight - mountedElementRect.bottom;
		toolTipPosition = maxSpace >= bottomSpace ? toolTipPosition : InteractiveTourToolTip.BOTTOM;
		maxSpace = maxSpace >= bottomSpace ? maxSpace : bottomSpace;


		let pxToShift:number = 0;
		let toolTipPositionStyle:React.CSSProperties = { position:"absolute"};

		if(toolTipPosition == InteractiveTourToolTip.LEFT)
		{
			toolTipPositionStyle.left = mountedElementRect.left;
			toolTipPositionStyle.top = mountedElementRect.top + mountedElementRect.height / 2 ;
			if(this.state.tooltipHeight)
			{

				toolTipPositionStyle.top = toolTipPositionStyle.top - (this.state.tooltipHeight / 2);
				if(toolTipPositionStyle.top < 0)
				{
					toolTipPosition = InteractiveTourToolTip.LEFT_TOP;
					pxToShift =   this.state.tooltipHeight/2 - (mountedElementRect.height / 2);
				}
				else if(toolTipPositionStyle.top + this.state.tooltipHeight > window.innerHeight)
				{
					toolTipPosition = InteractiveTourToolTip.LEFT_BOTTOM;
					pxToShift = - this.state.tooltipHeight/2 + (mountedElementRect.height / 2);
				}

			}
			if(this.state.tooltipWidth)
			{
				toolTipPositionStyle.left = toolTipPositionStyle.left - this.state.tooltipWidth;
			}
		}
		else if(toolTipPosition == InteractiveTourToolTip.RIGHT)
		{
			toolTipPositionStyle.left = mountedElementRect.right;
			toolTipPositionStyle.top = mountedElementRect.top + mountedElementRect.height / 2;
			if(this.state.tooltipHeight)
			{
				toolTipPositionStyle.top = toolTipPositionStyle.top - (this.state.tooltipHeight / 2);
				if(toolTipPositionStyle.top < 0)
				{
					toolTipPosition = InteractiveTourToolTip.RIGHT_TOP;
					pxToShift =   this.state.tooltipHeight/2 - (mountedElementRect.height / 2);
				}
				else if(toolTipPositionStyle.top + this.state.tooltipHeight > window.innerHeight)
				{
					toolTipPosition = InteractiveTourToolTip.RIGHT_BOTTOM;
					pxToShift = - this.state.tooltipHeight/2 + (mountedElementRect.height / 2);
				}

			}
		}
		else if(toolTipPosition == InteractiveTourToolTip.TOP)
		{
			toolTipPositionStyle.left = mountedElementRect.left + mountedElementRect.width / 2;
			toolTipPositionStyle.top = mountedElementRect.top ;
			if(this.state.tooltipWidth)
			{
				toolTipPositionStyle.left = toolTipPositionStyle.left - (this.state.tooltipWidth / 2);
				if(toolTipPositionStyle.left < 0)
				{
					toolTipPosition = InteractiveTourToolTip.TOP_LEFT;
					pxToShift =   this.state.tooltipWidth/2 - (mountedElementRect.width / 2);
				}
				else if(toolTipPositionStyle.left + this.state.tooltipWidth > window.innerWidth)
				{
					toolTipPosition = InteractiveTourToolTip.TOP_RIGHT;
					pxToShift = - this.state.tooltipWidth/2 + (mountedElementRect.width / 2);
				}
			}
			if(this.state.tooltipHeight)
			{
				toolTipPositionStyle.top = toolTipPositionStyle.top - this.state.tooltipHeight;
			}
		}
		else if(toolTipPosition == InteractiveTourToolTip.BOTTOM)
		{
			toolTipPositionStyle.left = mountedElementRect.left + mountedElementRect.width / 2;
			toolTipPositionStyle.top = mountedElementRect.bottom;
			if(this.state.tooltipWidth)
			{
				toolTipPositionStyle.left = toolTipPositionStyle.left - (this.state.tooltipWidth / 2);
				if(toolTipPositionStyle.left < 0)
				{
					toolTipPosition = InteractiveTourToolTip.TOP_LEFT;
					pxToShift =   this.state.tooltipWidth/2 - (mountedElementRect.width / 2);
				}
				else if(toolTipPositionStyle.left + this.state.tooltipWidth > window.innerWidth)
				{
					toolTipPosition = InteractiveTourToolTip.TOP_RIGHT;
					pxToShift = - this.state.tooltipWidth/2 + (mountedElementRect.width / 2);
				}
			}
		}

		let type:string = null;

		if(InteractiveTour.steps.indexOf(this.state.activeStepName) == 0)
			type = InteractiveTourToolTip.START;
		else if(InteractiveTour.steps.indexOf(this.state.activeStepName) == InteractiveTour.steps.length -1)
			type = InteractiveTourToolTip.DONE;
		else
			type = InteractiveTourToolTip.NEXT;

		let currentStepIndex:number = InteractiveTour.steps.indexOf(this.state.activeStepName); // get index of currentStep
		let contents:string = InteractiveTour.stepContents[currentStepIndex];
		let interactionState:boolean = InteractiveTour.stepPointers[currentStepIndex] ? true : false;

		let pointerUI:JSX.Element = null;
		
		if(this.pointerMountedNode)
		{
			let pointerElementRect:ClientRect = this.targetMountedNode == this.pointerMountedNode ? mountedElementRect : this.pointerMountedNode.getBoundingClientRect();
			let pointerStyle:React.CSSProperties = {
				position:"fixed",
				pointerEvents:"none",// so that target component will receive events
				zIndex:1, // pointers comes over the component so its necessary to set 1 as menu too have zindex 1
				width:32,
				height:32
			};

			pointerStyle.left = pointerElementRect.left + pointerElementRect.width / 2 - 16;
			pointerStyle.top = pointerElementRect.top + pointerElementRect.height / 2 -16;
			pointerUI = <div style={ pointerStyle }>
							<div style={ pointerStyleInner } className="weave-guidance-pointer-inner"/>
							<div style={ pointerStyleOuter } className="weave-guidance-pointer-outer"/>
						</div>;
		}


		return  <div>
					<div style={ leftOverlayStyle }/>
					<div style={ rightOverlayStyle }/>
					<div style={ topOverlayStyle }/>
					<div style={ bottomOverlayStyle }/>
					<div style={ highlighterStyle }/>
					{pointerUI}
					<InteractiveTourToolTip ref="toolTip"
					                        style={toolTipPositionStyle}
					                        location={toolTipPosition}
					                        onNextClick={!interactionState ? InteractiveTour.targetComponentOnClick : null}
					                        onDoneClick={InteractiveTour.isLastStep(currentStepIndex) ? this.closeHandler : null}
					                        enableFooter={!interactionState}
					                        type={type}
					                        stepIndex={currentStepIndex}
					                        shift={pxToShift}
					                        title={this.state.activeStepName}
					                        onClose={this.closeHandler}>
						{contents}
					</InteractiveTourToolTip>
				</div>




	}

	componentDidUpdate()
	{
		let mountedToolTip = this.refs["toolTip"];
		if(mountedToolTip)
		{
			let toolTipDOMNode = ReactDOM.findDOMNode(mountedToolTip as any);
			let toolTipRect:ClientRect = toolTipDOMNode.getBoundingClientRect();

			// if condition is important else infinte loop will happen calling render and componentDidUpdate again and again
			if(this.state.tooltipHeight != toolTipRect.height || this.state.tooltipWidth != toolTipRect.width)
			{
				this.setState({// re-render again to center tooltip
					tooltipHeight:toolTipRect.height,
					tooltipWidth:toolTipRect.width
				});
			}
		}



	}



}

 interface InteractiveTourToolTipProps extends React.HTMLProps<InteractiveTourToolTip>
{
	location:string;
	type: string;
	onClose?:()=>void;
	onNextClick?:(stepName:string)=>void;
	onDoneClick?:()=>void;
	title:string;
	enableFooter?:boolean;
	shift?:number;
	stepIndex?:number;
}

 interface InteractiveTourToolTipState
{

}

 class InteractiveTourToolTip extends React.Component<InteractiveTourToolTipProps,InteractiveTourToolTipState>
{
	static START:string = "Start";
	static NEXT:string = "Next";
	static DONE:string = "Done";

	static BOTTOM:string = "bottom";
	static BOTTOM_LEFT:string = "bottom left";
	static BOTTOM_RIGHT:string = "bottom right";

	static TOP:string = "top";
	static TOP_LEFT:string = "top left";
	static TOP_RIGHT:string = "top right";


	static LEFT:string = "left";
	static LEFT_TOP:string = "left top";
	static LEFT_BOTTOM:string = "left bottom";

	static RIGHT:string = "right";
	static RIGHT_TOP:string = "right top";
	static RIGHT_BOTTOM:string = "right bottom";

	constructor(props:InteractiveTourToolTipProps)
	{
		super(props);
		this.state = {
			visible:true
		}
	}


	closeHandler=()=>
	{
		this.props.onClose && this.props.onClose()
	};

	 nextHandler=()=>
	 {
		 this.props.onNextClick && this.props.onNextClick(this.props.title);
	 };


	render() {

		let styleObject:React.CSSProperties = _.merge({},this.props.style,{
			display:"flex",
			alignItems: "center",
			minWidth:"200px",
			maxWidth:"300px"
		});
		
		let containerStyle:React.CSSProperties = {
			padding:"8px"
		};

		let arrowStyle:React.CSSProperties = {
			//position:""
		};

		if(this.props.location == InteractiveTourToolTip.BOTTOM ||  this.props.location == InteractiveTourToolTip.BOTTOM_LEFT || this.props.location == InteractiveTourToolTip.BOTTOM_RIGHT)
		{
			styleObject.flexDirection = "column";

			arrowStyle.borderTopColor = "transparent"; // 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";

			if(this.props.location != InteractiveTourToolTip.BOTTOM)
			{
				containerStyle.position = "relative";
				containerStyle.left = this.props.shift;
			}
		}
		else if(this.props.location == InteractiveTourToolTip.TOP ||  this.props.location == InteractiveTourToolTip.TOP_LEFT || this.props.location == InteractiveTourToolTip.TOP_RIGHT)
		{
			styleObject.flexDirection = "column-reverse";

			arrowStyle["borderBottomColor"] = "transparent";// 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";

			if(this.props.location != InteractiveTourToolTip.TOP)
			{
				containerStyle.position = "relative";
				containerStyle.left = this.props.shift;
			}
		}
		else if(this.props.location == InteractiveTourToolTip.RIGHT || this.props.location == InteractiveTourToolTip.RIGHT_BOTTOM || this.props.location == InteractiveTourToolTip.RIGHT_TOP)
		{
			styleObject.flexDirection = "row";

			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";

			if(this.props.location != InteractiveTourToolTip.RIGHT)
			{
				containerStyle.position = "relative";
				containerStyle.top = this.props.shift;
			}
		}
		else if(this.props.location == InteractiveTourToolTip.LEFT || this.props.location == InteractiveTourToolTip.LEFT_BOTTOM || this.props.location == InteractiveTourToolTip.LEFT_TOP)
		{
			styleObject.flexDirection = "row-reverse";

			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderRightColor = "transparent";

			if(this.props.location != InteractiveTourToolTip.LEFT)
			{
				containerStyle.position = "relative";
				containerStyle.top =  this.props.shift;
			}
		}


		let tooltipHeader:React.CSSProperties = {
			display:"flex",
			alignItems:"center",
			justifyContent:"space-between",
			borderBottom:"1px solid #FFBE00",
			paddingBottom:"8px"
		};

		let buttonStyle:React.CSSProperties = {
			cursor:"pointer",
			color:"#FFBE00"
		};
		
		let footerUI:JSX.Element = null;
		let closeButtonUI:JSX.Element = null;
		if(this.props.enableFooter)
		{
			let tooltipFooter:React.CSSProperties = {
				display:"flex",
				justifyContent:"flex-end",
				borderTop:"1px solid #FFBE00",
				paddingTop:"8px"

			};

			let nextButtonUI:JSX.Element = this.props.onNextClick ? <div style={buttonStyle} onClick={this.nextHandler}>Next</div> : null;
			let doneButtonUI:JSX.Element = this.props.onDoneClick ? <div style={buttonStyle} onClick={this.closeHandler}>Done</div>: null;
			if(this.props.onDoneClick){
				nextButtonUI = null;//ensures when done is set , next wont we available
			}
			footerUI =  <div style={tooltipFooter}>
							{nextButtonUI}
							{doneButtonUI}
						</div>;
		}
		if(!this.props.onDoneClick)
		{
			closeButtonUI = <div style={buttonStyle} onClick={this.closeHandler}>&#x2715;</div>;
		}

		let contentStyle:React.CSSProperties = {
			padding:"8px"
		};

		return (<div style={ styleObject }>
					<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
					<div style={containerStyle} className="weave-guidance-toolTip">
						<div style={tooltipHeader}>
							<div>
								<span style={{color:"#FFBE00"}}>Step ({this.props.stepIndex + 1} of {InteractiveTour.steps.length}) : </span>
								{this.props.title}
							</div>
							{closeButtonUI}
						</div>
						<div style={contentStyle}>
							{this.props.children}
						</div>
						{footerUI}
					</div>
				</div>);
	}
}


