import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import prefixer from "../react-ui/VendorPrefixer";
import ReactUtils from "../utils/ReactUtils";
import DOMUtils from "../utils/DOMUtils";
import Resizer from "./Resizer";
import ResizerOverlay from "./ResizerOverlay";

export const VERTICAL:"vertical" = "vertical";
export const HORIZONTAL:"horizontal" = "horizontal";
export type Direction = typeof HORIZONTAL | typeof VERTICAL;

export interface LayoutState
{
	flex?: number;
	id?: Object;
	direction?: Direction;
	children?: LayoutState[];
};

export interface LayoutProps extends React.Props<Layout>
{
	state: LayoutState;
	onStateChange: Function;
	spacing?: number;
}

export default class Layout extends React.Component<LayoutProps, LayoutState>
{
	public children:Layout[];
	private resizers:Resizer[];

	private minSize:number;
	private dragging:boolean;

	private panelDragging:boolean = false;

	private overlay:ResizerOverlay;

	constructor(props:LayoutProps, state:LayoutState)
	{
		super(props, state);
		var ps = props.state || {};
		this.state = { id: ps.id, direction: ps.direction, children: ps.children, flex: ps.flex || 1 };
		this.minSize = 16;
		this.dragging = false;
	}

	componentDidMount():void
	{
		document.addEventListener("mouseup", this.onMouseUp);
		document.addEventListener("mousedown", this.onMouseDown);
		document.addEventListener("mousemove", this.onMouseMove);
	}

	componentWillReceiveProps(nextProps:LayoutProps):void
	{
		ReactUtils.replaceState(this, nextProps.state);
	}

	componentWillUnmount():void
	{
		document.removeEventListener("mouseup", this.onMouseUp);
		document.removeEventListener("mousedown", this.onMouseDown);
		document.removeEventListener("mousemove", this.onMouseMove);
	}

	shouldComponentUpdate(nextProps:LayoutProps, nextState:LayoutState):boolean
	{
		return !_.isEqual(this.state, nextState)
			|| !_.isEqual(this.state, nextProps.state)
			|| !_.isEqual(this.props, nextProps);
	}

	componentDidUpdate():void
	{
		if (this.props.onStateChange && this.state)
			this.props.onStateChange(this.state);
	}

	public getElementFromId(id:Object):Element
	{
		var component = this.getComponentFromId(id);
		return component ? ReactDOM.findDOMNode(component) : null;
	}

	public getComponentFromId(id:Object):Layout
	{
		if (this.state.id && _.isEqual(this.state.id, id))
		{
			return this;
		}
		else
		{
			for (let child of this.children)
			{
				let component = child && child.getComponentFromId(id);
				if (component)
					return component;
			}
		}
		return null;
	}

	private onMouseDown=(event:MouseEvent):void=>
	{
		this.resizers.forEach((resizer, index) => {
			if (resizer.state && resizer.state.active)
			{
				this.overlay.setState({
					active: true,
					range: this.getResizerRange(index)
				});
				this.overlay.onMouseMove(event);
			}
		});
	}

	private onMouseMove=(event:MouseEvent):void=>
	{

	}

	getResizerRange(resizerIndex:number):[number, number]
	{
		var element1 = ReactDOM.findDOMNode(this.children[resizerIndex]) as HTMLElement
		var element2 = ReactDOM.findDOMNode(this.children[resizerIndex + 1]) as HTMLElement;
		if (this.state.direction === HORIZONTAL)
			return [element1.offsetLeft + this.minSize, element2.offsetLeft + element2.offsetWidth - this.minSize];
		else
			return [element1.offsetTop + this.minSize, element2.offsetTop + element2.offsetHeight - this.minSize];
	}

	private onMouseUp=(event:MouseEvent):void=>
	{
		var newState:LayoutState = _.cloneDeep(this.state);

		var element = ReactDOM.findDOMNode(this) as HTMLElement;
		var offsetPoint = DOMUtils.getOffsetPoint(element, event);
		this.resizers.forEach((resizer, index) => {
			if (resizer.state && resizer.state.active)
			{
				var [begin, end] = this.getResizerRange(index);
				var pos:number = this.state.direction === HORIZONTAL ? offsetPoint.x : offsetPoint.y;
				var size:number = this.state.direction === HORIZONTAL ? element.offsetWidth : element.offsetHeight;

				pos = Math.max(begin + this.minSize, Math.min(pos, end - this.minSize));
				newState.children[index].flex = (pos - begin) / size;
				newState.children[index + 1].flex = (end - pos) / size;

				resizer.setState({ active: false });
				this.overlay.setState({ active: false });
				this.setState(newState);
			}
		});
		this.panelDragging = false;
	}

	private generateStyle()
	{
		var style:any = {
			display: "flex",
			flex: this.state.flex || 1,
			position: "relative",
			outline: "none",
			overflow: "hidden",
			userSelect: "none",
			flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
		};
		return prefixer(style);
	}

	render():JSX.Element
	{
		return (
			<div style={this.generateStyle()}>
				{ this.props.children }
				{
					Array.isArray(this.props.children) && (this.props.children as any[]).length
					?	<ResizerOverlay ref={(overlay:ResizerOverlay) => this.overlay = overlay} direction={this.state.direction}/>
					:	null
				}
			</div>
		);
	}

	static renderLayout(props:LayoutProps):JSX.Element
	{
		var {key, state, onStateChange, spacing} = props;
		var ref = props.ref as (layout:Layout)=>any;

		var parentLayout:Layout;

		var elements:JSX.Element[] = [];
		var children:Layout[] = [];
		var resizers:Resizer[] = [];
		if (state && state.children && state.children.length > 0)
		{
			let onChildStateChange = (childIndex:number, childState:LayoutState) => {
				if (!parentLayout)
					return;
				let stateCopy:LayoutState = _.cloneDeep(parentLayout.state);
				stateCopy.children[childIndex] = childState;
				parentLayout.setState(stateCopy);
			};

			let saveChild = (i:number, child:Layout) => children[i] = child;
			let saveResizer = (i:number, resizer:Resizer) => resizers[i] = resizer;

			state.children.forEach((childState, i) => {
				if (i > 0)
					elements.push(
						<Resizer
							key={`${key}.resizers[${i - 1}]`}
							ref={saveResizer.bind(null, i - 1)}
							direction={state.direction}
							spacing={spacing}
						/>
					);
				elements.push(
					Layout.renderLayout({
						key: `${key}.children[${i}]`,
						ref: saveChild.bind(null, i),
						state: childState,
						onStateChange: onChildStateChange.bind(null, i),
						spacing: spacing
					})
				);
			});
			
			if (state.direction === HORIZONTAL && weavejs.WeaveAPI.Locale.reverseLayout)
				elements.reverse();
		}

		var refCallback = function(layout:Layout) {
			parentLayout = layout;
			if (layout)
			{
				layout.children = children;
				layout.resizers = resizers;
			}
			if (ref)
				ref(layout);
		};
		return (
			<Layout
				key={key}
				ref={refCallback}
				children={elements}

				state={_.cloneDeep(Object(state))}
				onStateChange={onStateChange}
				spacing={spacing}
			/>
		);
	}
}
