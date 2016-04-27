import * as React from "react";
import * as ReactDOM from "react-dom";
import SmartComponent from "../ui/SmartComponent";
import ReactUtils from "../utils/ReactUtils";

export interface AccordionProps extends React.HTMLProps<Accordion>
{
	collapsible?: boolean;
	activeChild?: number; // index of child
	titles:string[] // titles for Each Child
}

export interface AccordionState
{
	activeChild: number; // index of child
}

export default class Accordion extends SmartComponent<AccordionProps, AccordionState>
{
	constructor(props:AccordionProps)
	{
		super(props);
		this.state = { // if not activeChild default 
			activeChild: props.activeChild ? props.activeChild : 0
		};
	}

	componentWillReceiveProps(nextProps:AccordionProps)
	{
		if (nextProps.activeChild !== nextProps.activeChild)
			this.setState({
				activeChild: nextProps.activeChild
			});
	}

	handleClick=(childID: number, event:React.MouseEvent)=>
	{
		this.setState({ // will render with new active child
			activeChild: childID
		});
		this.props.onClick && this.props.onClick.call(this, [childID, event]);
	};

	render()
	{
		let headerStyle:React.CSSProperties = {cursor: this.props.collapsible ? null : "default"};
		let childrenUI:React.ReactChild[] = []; 

		// for each child in props.children - two children are created with title and Content as in Semantic UI 
		React.Children.forEach(this.props.children, (child:React.ReactNode , index:number) => {
			let activeStatus:string = !this.props.collapsible || this.state.activeChild == index ? "active" : ""
			let accordionTitle:string = this.props.titles[index];
			childrenUI.push(
				<div
					className={"title " + activeStatus}
					key={"title" + index}
					onClick={this.props.collapsible ? this.handleClick.bind(this, index) : null}
					style={headerStyle}
				>
					{this.props.collapsible ? <i className="dropdown icon"/> : null}
					{Weave.lang(accordionTitle)}
				</div>,
				<div className={"content " + activeStatus} key={"content" + index}>
					{child}
				</div>
			);
		});

		return (
			<div className="ui styled accordion">
				{childrenUI}
			</div>
		);
	}
	
	static render(...sections:Array<[string, React.ReactChild[][] | React.ReactChild]>):JSX.Element
	{
		var classes = {
			td: [
				"weave-left-cell",
				"weave-right-cell"
			]
		};
		return <Accordion
			titles={sections.map(([header, content]) => header)}
			children={
				sections.map(([header, content], index) => (
					Array.isArray(content)
					?	ReactUtils.generateTable({
							body: content,
							props: {key: index},
							classes
						})
					:	content
				))
			}
		/>;
	}
}
