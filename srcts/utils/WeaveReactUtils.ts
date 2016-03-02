import * as React from "react";
import * as _ from "lodash";
import reactUpdate from "react-addons-update";

import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IDisposableObject = weavejs.api.core.IDisposableObject;

export declare type ReactStateLinkObject = { [prop: string]: ReactStateLinkObject | ILinkableObject };

var SCU = "shouldComponentUpdate";
var UNLINK = "unlinkReactState";

export function unlinkReactState(_component:React.Component<any,any>)
{
	let component: any = _component as any;
	if (component && component[SCU] && component[SCU][UNLINK])
		component[SCU][UNLINK]();
}

export function linkReactStateRef(context: ILinkableObject, mapping: ReactStateLinkObject, delay:number = 500)
{
	return (c: React.Component<any, any>) => {
		linkReactState(context, c, mapping, delay);
	};
}

export function linkReactState(context: ILinkableObject, _component: React.Component<any, any>, mapping: ReactStateLinkObject, delay:number = 500) {
	let component = _component as any;

	if (component === null) return;
	
	unlinkReactState(component);

	let scu = component[SCU] as Function;

	function setWeaveState(nextProps:any, nextState:any) {
		if (Weave.wasDisposed(context))
			unlinkReactState(component);
		else
			weavejs.core.SessionManager.traverseAndSetState(nextState, mapping);
	};

	let setWeaveStateDebounced = _.debounce(setWeaveState, delay, { leading: false });

	component[SCU] = function(nextProps: any, nextState: any)
	{
		setWeaveStateDebounced(nextProps, nextState);
		return scu ? scu.call(component, nextProps, nextState) : true;
	}

	Weave.disposableChild(context, component[SCU]);

	component[SCU][UNLINK] = () => { component[SCU] = scu };

	let updateObj:any;
	let weaveCallback = () => component.setState(reactUpdate(component.state, updateObj));

	let mapValue = (value:any):any => {
		if (Weave.isLinkable(value))
		{
			Weave.getCallbacks(value).addGroupedCallback(component[SCU], weaveCallback);
			return { $apply: Weave.getState.bind(Weave, value) };
		}
		return weavejs.util.JS.isPrimitive(value) ? value : _.mapValues(value, mapValue);
	};
	
	updateObj = mapValue(mapping);
	weaveCallback();
}
