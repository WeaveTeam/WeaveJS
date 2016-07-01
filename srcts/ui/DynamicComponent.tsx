import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import MiscUtils from "../utils/MiscUtils";

import ILinkableObject = weavejs.api.core.ILinkableObject;

export interface DynamicComponentProps extends React.Props<DynamicComponent>
{
	dependencies:ILinkableObject[];
	render:()=>JSX.Element;
}

export interface DynamicComponentState
{
}

export default class DynamicComponent extends React.Component<DynamicComponentProps, DynamicComponentState>
{
	constructor(props:DynamicComponentProps)
	{
		super(props);
		DynamicComponent.setDependencies(this, props.dependencies);
	}
	
	componentWillReceiveProps(newProps:DynamicComponentProps)
	{
		DynamicComponent.setDependencies(this, newProps.dependencies);
	}
	
	render():JSX.Element
	{
		return this.props.render && this.props.render();
	}
	
	componentWillUnmount()
	{
		DynamicComponent.setDependencies(this, []);
	}
	
	private static map_component_dependencies = new WeakMap<React.Component<any, any>, Set<ILinkableObject>>();
	
	static setDependencies(component:React.Component<any, any>, dependencies:ILinkableObject[]):void
	{
		var oldDeps = DynamicComponent.map_component_dependencies.get(component);
		var newDeps = new Set<ILinkableObject>(dependencies && dependencies.filter(_.identity));

		for (let dep of newDeps)
			if (!oldDeps || !oldDeps.has(dep))
				Weave.getCallbacks(dep).addGroupedCallback(component, component.forceUpdate);

		if (oldDeps)
			for (let dep of oldDeps)
				if (!newDeps.has(dep))
					Weave.getCallbacks(dep).removeCallback(component, component.forceUpdate);
		
		DynamicComponent.map_component_dependencies.set(component, newDeps);
	}
}

export class LinkableDynamicComponent extends React.Component<any, any> implements weavejs.api.core.ILinkableVariable
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
