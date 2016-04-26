import * as React from "react";
import * as ReactDOM from "react-dom";
import SmartComponent from "../ui/SmartComponent";

export interface AccordionProps  extends React.HTMLProps<Accordion>
{
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
		if(nextProps.activeChild !==  nextProps.activeChild )
			this.setState({
				activeChild: nextProps.activeChild
			});
	}



	handleClick=(childID: number, event:React.MouseEvent)=>
	{
		this.setState({ // will render with new active child
			activeChild:childID
		});
		this.props.onClick && this.props.onClick.call(this,[childID,event]);
	};





	render()
	{
		let childrenUI:React.ReactChild[]  = []; 

		// for each child in props.children - two children are created with title and Content  as in Semantic UI 
		React.Children.forEach(this.props.children,function(child:React.ReactNode , index:number){
			let activeStatus:string = this.state.activeChild == index ? "active" : ""
			let accordionTitle:string = this.props.titles[index];

			let childTitleUI:React.ReactChild = <div className={"title " + activeStatus}
			                                         key={"title" + index}
			                                         onClick={this.handleClick.bind(this,index)}>
														<i className="dropdown icon"></i>
														{Weave.lang(accordionTitle)}
												</div>
			childrenUI.push(childTitleUI);

			let childContentUI:React.ReactChild =  <div className={"content " + activeStatus} key={"content" + index}>
														{child}
													</div>
			childrenUI.push(childContentUI);

		}.bind(this));


		return (
			<div className="ui styled accordion">
				{childrenUI}
			</div>

		);
	}
}
