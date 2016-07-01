import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

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

weavejs.WeaveAPI.ClassRegistry.registerClass(DynamicComponent, 'weavejs.ui.DynamicComponent');
