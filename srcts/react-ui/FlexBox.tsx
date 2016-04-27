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
	resizingLeftChildWidth?:number;
	mouseXPos?:number;
}

//todo option to disable live dragging
export interface IHDividedBoxProps extends React.HTMLProps<HDividedBox> {
	loadWithEqualWidthChildren?:boolean;
	childMinWidth?:number; // default value 10px
	resizerStyle?:React.CSSProperties;
	resizerSize?:number;
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
		if(this.props.loadWithEqualWidthChildren)
		{
			this.setEqualWidthChildren();
		}
	}

	setEqualWidthChildren=():void=>{
		var childCount:number = React.Children.count(this.props.children);

		React.Children.forEach(this.props.children,function(child:ReactNode , index:number) {
			this.leftChildWidths[index] = String(100/childCount) + "%";
		}.bind(this));

	}

	// caching the widths of all left child
	// this ensures when we switch resizer the width is maintained
	private leftChildWidths:number[] = [];
	private containerWidth:number = NaN;

	state:IHDividedBoxState = {
		activeResizerIndex:NaN,
		resizingLeftChildWidth:null, // needs to be null as default value, to avoid warning for NaN  as "mutated Style"
		mouseXPos:NaN,
		dragging:false
	}

	// set the state with initial values from mouse event
	private resizerMouseDownHandler = (index:number, event:React.MouseEvent):void=>
	{
		// as resizer index is same as left child index , easy to identify from refs
		var leftChild:Element = ReactDOM.findDOMNode(this.refs["child" + index]);
		this.containerWidth = ReactDOM.findDOMNode(this).getBoundingClientRect().width;
		this.setState({
			mouseXPos:event.clientX,
			activeResizerIndex:index,
			dragging:true,
			resizingLeftChildWidth:leftChild.getBoundingClientRect().width
		});

		// important to add mouseup/mousemove on the window /document /parent div
		// listeners are added only resizer is selected
		ReactDOM.findDOMNode(this).addEventListener("mousemove",this.resizerMouseMoveHandler);
		ReactDOM.findDOMNode(this).addEventListener("mouseup",this.resizerMouseUpHandler)

		event.stopPropagation();
		event.preventDefault();
	}


	// resizingLeftChildWidth and mouseXPos state values are updated while dragging
	private resizerMouseMoveHandler = (event:MouseEvent):void =>
	{
		// ensures no value is calculated when no resizer is active
		// todo: try removing mousemove when
		if(!this.state.dragging )
		{
			return;
		}

		//calculates width of the child left to active resizer
		let deltaXPos:number = event.clientX - this.state.mouseXPos ;
		let newWidth:number = this.state.resizingLeftChildWidth + deltaXPos;

		this.setState({
			resizingLeftChildWidth:newWidth,
			mouseXPos:event.clientX
		});

		event.stopPropagation();
		event.preventDefault();
	}




	private resizerMouseUpHandler = (event:MouseEvent):void =>
	{
		if(!isNaN(this.state.activeResizerIndex) )
		{
			//cache the width of left child for released resizer
			this.leftChildWidths[this.state.activeResizerIndex] =  this.state.resizingLeftChildWidth;
		}

		//this.containerWidth = NaN;

		// reset all values to avoid conflicts in next resizing event
		this.setState({
			dragging:false,
			activeResizerIndex:NaN,
			resizingLeftChildWidth:null,
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
		let leftChildWidthSum:number = 0;
		React.Children.forEach(this.props.children,function(child:ReactNode , index:number){
			if(!child)// this case happen in react Composite element based on a condition sometimes null or empty string will come in place of react element
				return

			/* ***** Child ****** */

			var childStyle:React.CSSProperties = {
				overflow:"auto"
			};

			if(childCount - 1 == index)//last child takes rest of the space of the container
			{

				if(isNaN(this.containerWidth)) // when render called from constructor for first time
				{
					childStyle.flex = 1;
				}
				else // when mousedown sets the containerWidth
				{
					// setting flex 1 instead of width wont work, if parent has flexible size, while resizing
					// flex 1 will work if parent get fixed width in DOM tree
					childStyle.width  = this.containerWidth - leftChildWidthSum;
				}
			}
			else
			{
				//set left child width
				if(this.state.dragging)
				{
					childStyle.width = (this.state.activeResizerIndex == index) ?  this.state.resizingLeftChildWidth : this.leftChildWidths[index];
				}
				else
				{
					childStyle.width = this.leftChildWidths[index];
				}

				leftChildWidthSum = leftChildWidthSum + childStyle.width;
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
				let resizerStyle:React.CSSProperties = this.props.resizerStyle?this.props.resizerStyle:{};

				// index matches with left child
				let ref:string = "resizer"+index;
				let resizerUI:JSX.Element = <Resizer key={ref}
													 ref={ref}
													 size={this.props.resizerSize}
													 style={resizerStyle}
													 type={VERTICAL}
													 onMouseDown = { this.resizerMouseDownHandler.bind(this,index) }/>;

				childrenUI.push(resizerUI);
				leftChildWidthSum = leftChildWidthSum + (this.props.resizerSize?this.props.resizerSize :1);
			}
			
		}.bind(this));

		var styleObj:React.CSSProperties = HDividedBox.style(this.props.style);
		styleObj.position = "relative"; //important to accommodate if any children is absolute

		return <div {...this.props as React.HTMLAttributes} style={ styleObj }>
					{childrenUI}
				</div>;
	}
}

interface IResizerProps extends React.HTMLProps<Resizer>
{
	type:string;
	size?:number;
}

const VERTICAL="vertical";
const HORIZONTAL="horizontal";

class Resizer extends React.Component<IResizerProps, {}> {


	render(){

		// background-clip: padding-box
		// this ensures the cursor comes when it reached the padding region
		var styleObj:React.CSSProperties = _.merge({},this.props.style,{
			boxSizing: "border-box",
			backgroundClip:"padding-box"
		});


		// setting padding and margin with equal positive and negative values, will ensure the resize-cursor is visible when its 4 px near the resizer
		// positive and negative negates the 4px layout for rendering Engine, but cursor will become visible when its 4px near
		if(this.props.type === VERTICAL){
			_.merge(styleObj, {
				paddingLeft:"4px",
				marginLeft:"-4px",
				paddingRight:"4px",
				marginRight:"-4px",
				cursor: "col-resize"
			});
		}else if(this.props.type === HORIZONTAL){
			_.merge(styleObj, {
				paddingTop:"4px",
				marginTop:"-4px",
				paddingBottom:"4px",
				marginBottom:"-4px",
				cursor: "row-resize"
			});
		}
		if(this.props.size)
		{
			if(this.props.type === VERTICAL)
			{
				styleObj.width = 1;
			}
			else if(this.props.type === HORIZONTAL)
			{
				styleObj.height = 1;
			}
		}

		let className:string =  this.props.className ? this.props.className : "weave-hDividedBox-resizer"
		return <span style={ styleObj } onMouseDown={this.props.onMouseDown} className={className}/>
	}

}
