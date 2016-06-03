import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";


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
	visible?:boolean,
	activeStepName?:string
	tooltipHeight?:number // used this at componentDidUpdate to re-render again to center the toolTip
	tooltipWidth?:number // used this at componentDidUpdate to re-render again to center the toolTip
}

export default class InteractiveTour extends React.Component<InteractiveTourProps,InteractiveTourState>
{

	static stepName:LinkableString = new LinkableString(); // callback are registered in InteractiveTour Instance
	static enable:boolean = false; // set to true from click event of Guidance List element in GetStartedComponent
	static steps:string[] = []; // props.id are supplied as string of Array. Array supplied in click event of Guidance List element in GetStartedComponent
	static stepContents:string[] = [];
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

	updateNextComponentName=()=>
	{
		let nextStepName:string = InteractiveTour.stepName.value;
		if(InteractiveTour.stepComponentMap[nextStepName])
		{
			let mountedElement = InteractiveTour.stepComponentMap[nextStepName];
			this.targetMountedNode =  ReactDOM.findDOMNode(mountedElement as any);
		}

		this.setState({
			activeStepName:nextStepName
		});
		
		if(nextStepName == "") // empty string tell last step is reached , so disable the tour
		{
			InteractiveTour.enable = false;
		}
	};




	componentWillReceiveProps(nextProps:InteractiveTourProps)
	{

	}

	closeHandler=()=>
	{
		this.setState({
			visible:false
		});

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


		let toolTipPositionStyle:React.CSSProperties = { position:"absolute"};

		if(toolTipPosition == InteractiveTourToolTip.LEFT)
		{
			toolTipPositionStyle.left = mountedElementRect.left;
			toolTipPositionStyle.top = mountedElementRect.top + mountedElementRect.height / 2 ;
			if(this.state.tooltipHeight)
			{
				toolTipPositionStyle.top = toolTipPositionStyle.top - (this.state.tooltipHeight / 2);
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
				toolTipPositionStyle.top = toolTipPositionStyle.top - (this.state.tooltipHeight / 2)
			}
		}
		else if(toolTipPosition == InteractiveTourToolTip.TOP)
		{
			toolTipPositionStyle.left = mountedElementRect.left + mountedElementRect.width / 2;
			toolTipPositionStyle.top = mountedElementRect.top ;
			if(this.state.tooltipWidth)
			{
				toolTipPositionStyle.left = toolTipPositionStyle.left - (this.state.tooltipWidth / 2)
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
				toolTipPositionStyle.left = toolTipPositionStyle.left - (this.state.tooltipWidth / 2)
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
		let contents:string = InteractiveTour.stepContents[currentStepIndex ];

		return  <div>
					<div style={ leftOverlayStyle }/>
					<div style={ rightOverlayStyle }/>
					<div style={ topOverlayStyle }/>
					<div style={ bottomOverlayStyle }/>
					<div style={ highlighterStyle }/>
					<InteractiveTourToolTip ref="toolTip"
					                        style={toolTipPositionStyle}
					                        location={toolTipPosition}
					                        type={type}
					                        title={this.state.activeStepName}
					                        onClose={this.closeHandler}>
						{contents}
					</InteractiveTourToolTip>
				</div>




	}

	componentDidUpdate()
	{
		let mountedToolTip = this.refs["toolTip"];
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

 interface InteractiveTourToolTipProps extends React.HTMLProps<InteractiveTourToolTip>
{
	location:string;
	type: string;
	onClose?:Function;
	onNextClick?:Function;
	title?:string;
	enableFooter?:boolean;
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

	componentWillReceiveProps(nextProps:InteractiveTourToolTipProps)
	{

	}

	closeHandler=()=>{
		if(this.props.onClose){
			this.props.onClose();
		}
	};

	 nextHandler=()=>{
		 if(this.props.onNextClick){
			 this.props.onNextClick();
		 }
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

		if(this.props.location == InteractiveTourToolTip.BOTTOM)
		{
			styleObject.flexDirection = "column";

			arrowStyle.borderTopColor = "transparent"; // 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		/*else if(this.props.location == InteractiveTourToolTip.BOTTOM_RIGHT)
		{
			//styleObject.top = "8px";
			//styleObject.right = "8px";

			//arrowStyle.top = "-16px";
			//arrowStyle.right = "8px";
			arrowStyle.borderTopColor = "transparent"; // 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == InteractiveTourToolTip.BOTTOM_LEFT)
		{
			//styleObject.top = "8px";
			//styleObject.left = "8px";

			//arrowStyle.top = "-16px";// negative value ensures arrow is ahead of tooltip
			//arrowStyle.left = "8px";
			arrowStyle.borderTopColor = "transparent";// 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}*/
		else if(this.props.location == InteractiveTourToolTip.TOP)
		{
			styleObject.flexDirection = "column-reverse";

			arrowStyle["borderBottomColor"] = "transparent";// 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		/*else if(this.props.location == InteractiveTourToolTip.TOP_RIGHT)
		{
			//styleObject.bottom = "8px";
			//styleObject.right = "8px";

			//arrowStyle.bottom = "-16px";
			//arrowStyle.right = "8px";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == InteractiveTourToolTip.TOP_LEFT)
		{
			//styleObject.bottom = "8px";
			//styleObject.left = "8px";

			//arrowStyle.bottom = "-16px"; // negative value ensures arrow is ahead of tooltip
			//arrowStyle.left = "8px";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}*/
		else if(this.props.location == InteractiveTourToolTip.RIGHT)
		{
			styleObject.flexDirection = "row";

			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";

		}
		else if(this.props.location == InteractiveTourToolTip.LEFT)
		{
			styleObject.flexDirection = "row-reverse";

			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderRightColor = "transparent";
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
		if(this.props.enableFooter)
		{
			let tooltipFooter:React.CSSProperties = {
				display:"flex",
				alignItems:"center",
				justifyContent:"space-between",
				borderTop:"1px solid #FFBE00",
				paddingTop:"8px"
			};
			footerUI =  <div style={tooltipFooter}>
							<div style={buttonStyle} onClick={this.nextHandler}>Next</div>
						</div>;
		}

		let contentStyle:React.CSSProperties = {
			padding:"8px"
		};

		return (<div style={ styleObject }>
					<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
					<div style={containerStyle} className="weave-guidance-toolTip">
						<div style={tooltipHeader}>
							<div>
								<span style={{color:"#FFBE00"}}>{this.props.type} : </span>
								{this.props.title}
							</div>
							<div style={buttonStyle} onClick={this.closeHandler}>&#x2715;</div>
						</div>
						<div style={contentStyle}>
							{this.props.children}
						</div>
						{footerUI}
					</div>
				</div>);
	}
}


