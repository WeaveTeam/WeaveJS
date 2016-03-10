import * as React from "react";
import * as _ from "lodash";
import reactUpdate from "react-addons-update";
import ReactUtils from "./ReactUtils";
import {ReactComponent} from "./ReactUtils";

import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IDisposableObject = weavejs.api.core.IDisposableObject;

export declare type LinkReactStateMapping = { [prop: string]: LinkReactStateMapping | ILinkableObject };

const UNLINK = "unlinkReactState";

export function unlinkReactState(component:ReactComponent):void
{
	if (component && component.componentWillUpdate && (component.componentWillUpdate as any)[UNLINK])
		(component.componentWillUpdate as any)[UNLINK]();
}

export function linkReactStateRef(context:ILinkableObject, mapping:LinkReactStateMapping, delay:number = 0):(c:ReactComponent)=>void
{
	return (c:ReactComponent) => {
		linkReactState(context, c, mapping, delay);
	};
}

export function linkReactState(context:ILinkableObject, component:ReactComponent, mapping:LinkReactStateMapping, delay:number = 0)
{
	if (!component)
		return;
	
	unlinkReactState(component);
	ReactUtils.onUnmount(component, unlinkReactState);
	
	let localContext = Weave.disposableChild(context, {});
	let reactState = component.state != null ? component.state : {};
	let reactUpdateSpec:any;
	let authority = updateReactState;

	function updateReactState(callingLater:boolean = false):void
	{
		if (callingLater && authority != updateReactState)
			return;
		authority = updateReactState;

		// delay while component has focus because we don't want to overwrite something the user is actively typing
		if (ReactUtils.hasFocus(component))
			return weavejs.WeaveAPI.Scheduler.callLater(localContext, updateReactState, [true]);

		var updatedReactState = reactUpdate(reactState, reactUpdateSpec);
		if (!_.isEqual(reactState, updatedReactState))
			component.setState(reactState = updatedReactState);
	}

	function updateWeaveState(callingLater:boolean = false):void
	{
		if (callingLater && authority != updateWeaveState)
			return;
		authority = updateWeaveState;

		weavejs.core.SessionManager.traverseAndSetState(reactState, mapping);

		// Always update react state after setting weave state because
		// callbacks won't get triggered if the weave state didn't change,
		// and we want to make sure the react value matches the weave value.
		updateReactState();
	}

	let mapValue = (value:any):any => {
		if (Weave.isLinkable(value))
		{
			Weave.getCallbacks(value).addGroupedCallback(localContext, updateReactState);
			return {
				get $set() {
					var state = Weave.getState(value);
					// Replace NaN with undefined because undefined is more likely to appear as "" when displayed as a string,
					// and undefined automatically converts back to NaN when used as a number.
					if (typeof state === 'number' && isNaN(state))
						return undefined;
					return state;
				}
			};
		}
		return weavejs.util.JS.isPrimitive(value) ? value : _.mapValues(value, mapValue);
	};
	reactUpdateSpec = mapValue(mapping);
	
	let delayedUpdateWeaveState = delay ? _.debounce(updateWeaveState.bind(null, true), delay, {leading: false}) : updateWeaveState;

	let superComponentWillUpdate = component.componentWillUpdate;
	function newComponentWillUpdate(nextProps:any, nextState:any, nextContext:any):void
	{
		// store nextState so it can be accessed and modified inside Weave callbacks
		reactState = nextState;
		
		authority = updateWeaveState;
		// set weave state now before render
		if (Weave.wasDisposed(context))
			unlinkReactState(component);
		else
			delayedUpdateWeaveState();
		
		// call original function with possibly-updated reactState
		if (superComponentWillUpdate)
			superComponentWillUpdate.call(component, nextProps, reactState, nextContext);
	}
	(newComponentWillUpdate as any)[UNLINK] = function():void {
		component.componentWillUpdate = superComponentWillUpdate;
		Weave.dispose(localContext);
	};
	component.componentWillUpdate = newComponentWillUpdate;

	authority();
}
