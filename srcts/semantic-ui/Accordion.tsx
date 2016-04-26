import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";
import ReactChild = __React.ReactChild;

export interface AccordionProps  extends React.HTMLProps<Accordion>
{
	activeChild?: number;
	titles:string[]
}

export interface AccordionState
{
	activeChild: number;
}

export default class Accordion extends SmartComponent<AccordionProps, AccordionState>
{
	element:Element;
	selector:any;

	constructor(props:AccordionProps)
	{
		super(props);
		this.state = {
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
		this.setState({
			activeChild:childID
		});
		this.props.onClick && this.props.onClick.call(this,[childID,event]);
	};





	render()
	{
		let childrenUI:React.ReactChild[]  = [];

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
