import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import prefixer from "./VendorPrefixer"
import ReactNode = __React.ReactNode;
import ReactInstance = __React.ReactInstance;
import ReactElement = __React.ReactElement;

export class HBox extends React.Component<React.HTMLProps<HBox>, {}>
{
	/**
	 * Creates a copy of a style object and adds { display: "flex", flexDirection: "row" }
	 * @param style A style object.
	 * @return A new style object.
	 */
	private static style(style:React.CSSProperties):React.CSSProperties
	{
		return _.merge({}, style, { display: "flex", flexDirection: "row" });
	}

	render()
	{
		return <div {...this.props as React.HTMLAttributes} style={HBox.style(this.props.style)}/>;
	}
}

export class VBox extends React.Component<React.HTMLProps<VBox>, {}>
{
	/**
	 * Creates a copy of a style object and adds { display: "flex", flexDirection: "column" }
	 * @param style A style object.
	 * @return A new style object.
	 */
	private static style(style:React.CSSProperties):React.CSSProperties
	{
		return _.merge({}, style, { display: "flex", flexDirection: "column" });
	}

	render()
	{
		return <div {...this.props as React.HTMLAttributes} style={VBox.style(this.props.style)}/>;
	}
}


export interface IHDividedBoxState {
	activeResizerIndex?:number;
	dragging?:boolean;
	leftChildWidth?:number;
	mouseXPos?:number;
}

//todo option to disable live dragging
export interface IHDividedBoxProps extends React.HTMLProps<HDividedBox> {

}
export class HDividedBox extends React.Component<IHDividedBoxProps, IHDividedBoxState>
{
	/**
	 * Creates a copy of a style object and adds { display: "flex", flexDirection: "row" }
	 * @param style A style object.
	 * @return A new style object.
	 */
	private static style(style:React.CSSProperties):React.CSSProperties
	{
		return _.merge({}, style, { display: "flex", flexDirection: "row"  });
	}

	constructor(props:React.HTMLProps<HBox>)
	{
		super(props)
	}

	state:IHDividedBoxState = {
		activeResizerIndex:NaN,
		leftChildWidth:null, // needs to be null as default value, to avoid warning for NaN  as "mutated Style"
		mouseXPos:NaN,
		dragging:false
	}



	// set the state with initial values from mouse event
	private resizerMouseDownHandler = (index:number, event:React.MouseEvent):void=>
	{
		// as resizer index is same as left child index , easy to identify from refs
		var leftChild:Element = ReactDOM.findDOMNode(this.refs["child" + index]);
		this.setState({
			mouseXPos:event.clientX,
			activeResizerIndex:index,
			dragging:true,
			leftChildWidth:leftChild.getBoundingClientRect().width
		});

		// important to add mouseup/mousemove on the window /document /parent div
		// listeners are added only resizer is selected
		ReactDOM.findDOMNode(this).addEventListener("mousemove",this.resizerMouseMoveHandler);
		ReactDOM.findDOMNode(this).addEventListener("mouseup",this.resizerMouseUpHandler)

		event.stopPropagation();
		event.preventDefault();
	}


	// leftChildWidth and mouseXPos state values are updated while dragging
	private resizerMouseMoveHandler = (event:MouseEvent):void =>
	{
		// ensures no value is calculated when no resizer is active
		// todo try removing mousemove when
		if(!this.state.dragging )
		{
			return;
		}

		//calculates width of the child left to active resizer
		let deltaXPos:number = event.clientX - this.state.mouseXPos ;
		let newWidth:number = this.state.leftChildWidth + deltaXPos;

		this.setState({
			leftChildWidth:newWidth,
			mouseXPos:event.clientX
		});

		event.stopPropagation();
		event.preventDefault();
	}


	// caching the widths of all left child
	// this ensures when we switch resizer the width is maintained
	private leftChildWidths:number[] = [];

	private resizerMouseUpHandler = (event:MouseEvent):void =>
	{
		if(!isNaN(this.state.activeResizerIndex) )
		{
			//cache the width of left child for released resizer
			this.leftChildWidths[this.state.activeResizerIndex] =  this.state.leftChildWidth;
		}

		// reset all values to avoid conflicts in next resizing event
		this.setState({
			dragging:false,
			activeResizerIndex:NaN,
			leftChildWidth:null,
			mouseXPos:NaN
		});

		//important: remove listeners from this component when resizing is stopped
		//this ensures this component wont wait for mouseup / mousemove events
		//when there is no resizing
		ReactDOM.findDOMNode(this).removeEventListener("mousemove",this.resizerMouseMoveHandler);
		ReactDOM.findDOMNode(this).removeEventListener("mouseup",this.resizerMouseUpHandler)

		event.stopPropagation();
		event.preventDefault();
	}

	
	
	render()
	{
		var childrenUI:any[]  = [];
		// storing childCount is important, to make sure resizer is not added after last child
		var childCount:number = React.Children.count(this.props.children);

		React.Children.forEach(this.props.children,function(child:ReactNode , index:number){

			/* ***** Child ****** */

			var childStyle:React.CSSProperties = {
				overflow:"auto"
			};

			if(childCount - 1 == index){ //last child takes rest of the space
				childStyle.flex = 1;
			}
			//set left child width 
			if(this.state.dragging)
			{
				// if index is not there undefined comes, browser ignores one without the value
				// and browser Layout mechanism set the width values
				childStyle.width = (this.state.activeResizerIndex == index) ?  this.state.leftChildWidth : this.leftChildWidths[index];
			}
			else 
			{
				childStyle.width = this.leftChildWidths[index];
			}

			var childRef:string = "child"+index;
			// make sure the child Style overflow property is set along with calculated width
			var mutateProps:any = _.merge({},(child as ReactElement<any>).props, {
				key:childRef,
				ref:childRef,
				style:prefixer(childStyle)
			});

			var childUI:any = React.cloneElement(child as ReactElement<any>, mutateProps);
			childrenUI.push(childUI);

			/* ***** Resizer ****** */

			//resizer is added right after every child except last child
			if(childCount - 1 !== index) // resizer not required for last child
			{
				// index matches with left child
				var ref:string = "resizer"+index;
				var resizerUI:JSX.Element = <Resizer key={ref}
													 ref={ref}
													 type={VERTICAL}
													 onMouseDown = { this.resizerMouseDownHandler.bind(this,index) }/>;

				childrenUI.push(resizerUI);
			}
			
		}.bind(this));

		return <div {...this.props as React.HTMLAttributes} style={HDividedBox.style(this.props.style)}>
					{childrenUI}
				</div>;
	}
}

interface IResizerProps extends React.HTMLProps<Resizer>
{
	type:string;
}

const VERTICAL="vertical";
const HORIZONTAL="horizontal";

class Resizer extends React.Component<IResizerProps, {}> {


	render(){
		var styleObj:React.CSSProperties = {
			boxSizing: "border-box",
			background:"#000",
			opacity: .2,
			backgroundClip: "padding-box",
		};
		

		if(this.props.type === VERTICAL){
			_.merge(styleObj, {
				width: "11px",
				margin: "0 -5px",
				borderLeft: "5px solid rgba(255, 255, 255, 0)",
				borderRight: "5px solid rgba(255, 255, 255, 0)",
				cursor: "col-resize",
				height: "100%"
			});
		}else if(this.props.type === HORIZONTAL){
			_.merge(styleObj, {
				height: "11px",
				margin: "-5px 0",
				borderTop: "5px solid rgba(255, 255, 255, 0)",
				borderBottom: "5px solid rgba(255, 255, 255, 0)",
				cursor: "row-resize",
				width: "100%"
			});
		}

		
		return <span style={ styleObj } onMouseDown={this.props.onMouseDown}/>
	}

}
