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
	private deps = new Set<ILinkableObject>();

	constructor(props:DynamicComponentProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}
	
	componentWillReceiveProps(newProps:DynamicComponentProps)
	{
		var newDeps = new Set<ILinkableObject>(newProps.dependencies);

		for (var dep of newDeps)
			if (!this.deps.has(dep))
				Weave.getCallbacks(dep).addGroupedCallback(this, this.forceUpdate);

		for (var dep of this.deps)
			if (!newDeps.has(dep))
				Weave.getCallbacks(dep).removeCallback(this, this.forceUpdate);

		this.deps = newDeps;
	}
	
	render():JSX.Element
	{
		return this.props.render && this.props.render();
	}
	
	componentWillUnmount()
	{
		this.deps = null;
	}
}
