import * as React from "react";
import * as _ from "lodash";
import reactUpdate from "react-addons-update";

import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IDisposableObject = weavejs.api.core.IDisposableObject;

export declare type ReactStateLinkObject = { [prop: string]: ReactStateLinkObject | ILinkableObject };

const UNLINK = "unlinkReactState";
export type ReactComponent = React.Component<any, any> & React.ComponentLifecycle<any, any>;

export function unlinkReactState(component:ReactComponent)
{
	if (component && component.shouldComponentUpdate && (component.shouldComponentUpdate as any)[UNLINK])
		(component.shouldComponentUpdate as any)[UNLINK]();
}

export function linkReactStateRef(context:ILinkableObject, mapping:ReactStateLinkObject, delay:number = 500)
{
	return (c: React.Component<any, any>) => {
		linkReactState(context, c, mapping, delay);
	};
}

export function linkReactState(context:ILinkableObject, component:ReactComponent, mapping:ReactStateLinkObject, delay:number = 500)
{
	if (component === null)
		return;
	
	unlinkReactState(component);

	let scu = component.shouldComponentUpdate;

	function setWeaveState(state:any):void {
		if (Weave.wasDisposed(context))
			unlinkReactState(component);
		else
			weavejs.core.SessionManager.traverseAndSetState(state, mapping);
	};

	let setWeaveStateDebounced = _.debounce(setWeaveState, delay, { leading: false });

	component.shouldComponentUpdate = function(nextProps:any, nextState:any, nextContext:any):boolean
	{
		setWeaveStateDebounced(nextState);
		return scu ? scu.call(component, nextProps, nextState, nextContext) : true;
	}

	Weave.disposableChild(context, component.shouldComponentUpdate);

	(component.shouldComponentUpdate as any)[UNLINK] = () => {
		var temp = component.shouldComponentUpdate;
		component.shouldComponentUpdate = scu;
		Weave.dispose(temp);
	};

	let updateObj:any;
	let weaveCallback = () => component.setState(reactUpdate(component.state, updateObj));

	let mapValue = (value:any):any => {
		if (Weave.isLinkable(value))
		{
			Weave.getCallbacks(value).addGroupedCallback(component.shouldComponentUpdate, weaveCallback);
			return { $apply: Weave.getState.bind(Weave, value) };
		}
		return weavejs.util.JS.isPrimitive(value) ? value : _.mapValues(value, mapValue);
	};
	
	updateObj = mapValue(mapping);
	weaveCallback();
}
