import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

export default class LinkableDynamicComponent extends React.Component<any, any> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, weavejs.core.LinkableVariable, this.forceUpdate, true);
	
	getSessionState():any
	{
		return this.linkableState.state;
	}
	
	setSessionState(value:any)
	{
		this.linkableState.state = value;
	}
	
	render()
	{
		return this.renderFromState(this.linkableState.state);
	}
	
	private refHandler=(instance:React.ReactInstance)=>
	{
		if (instance instanceof React.Component)
			Weave.disposableChild(this, instance);
	}
	
	private renderFromState(state:any):JSX.Element
	{
		if (typeof state != 'object')
			return state as any;
		
		var ComponentClass = state ? Weave.getDefinition(state.class) : null;
		if (!ComponentClass)
			return null;
		
		var props = _.omit(state, 'class') as any;
		
		if (!Array.isArray(props.children))
			props.children = [props.children];
		
		props.children = (props.children as any[]).map(this.renderFromState, this);
		
		if (Array.isArray(props.children) && (props.children as any[]).length == 1)
			props.children = (props.children as any[])[0];
		
		return <ComponentClass ref={this.refHandler} {...props}/>;
	}
}

Weave.registerClass(LinkableDynamicComponent, 'weavejs.ui.LinkableDynamicComponent', [weavejs.api.core.ILinkableVariable]);
