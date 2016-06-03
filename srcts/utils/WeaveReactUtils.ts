import * as React from "react";
import * as _ from "lodash";
import reactUpdate from "react-addons-update";
import ReactUtils from "./ReactUtils";
import {ReactComponent} from "./ReactUtils";

import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IDisposableObject = weavejs.api.core.IDisposableObject;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;

// This makes Weave handle linkable React classes appropriately.
Weave.registerAsyncClass(
	React.Component,
	component => {
		ReactUtils.onUnmount(
			component,
			component => {
				if (Weave.getOwner(component))
					weavejs.core.LinkablePlaceholder.replaceInstanceWithPlaceholder(component);
				Weave.dispose(component);
			}
		);
	}
);

export declare type LinkReactStateMapping = { [prop: string]: LinkReactStateMapping | ILinkableObject };
export declare type WeavePathArray = string[];

const UNLINK = "unlinkReactState";

export function unlinkReactState(component:ReactComponent):void
{
	if (component && component.componentWillUpdate && (component.componentWillUpdate as any)[UNLINK])
		(component.componentWillUpdate as any)[UNLINK]();
}

const map_ref_mapping = new WeakMap<ReactComponent, LinkReactStateMapping>();

export function linkReactStateRef(context:ILinkableObject, mapping:LinkReactStateMapping, delay:number = 0):(component:ReactComponent)=>void
{
	var prevComponent:ReactComponent;
	return function(component:ReactComponent):void {
		if (component)
		{
			linkReactState(context, component, mapping, delay);
			map_ref_mapping.set(component, mapping);
		}
		else if (prevComponent)
		{
			unlinkReactState(prevComponent);
		}
		prevComponent = component;
	};
}

export function linkReactState(context:ILinkableObject, component:ReactComponent, mapping:LinkReactStateMapping, delay:number = 0)
{
	if (!component)
		throw new Error("linkReactState(): component cannot be null");
	
	unlinkReactState(component);
	
	let localContext = Weave.disposableChild(context, {});
	let reactState = component.state != null ? component.state : {};
	let reactUpdateSpec:any;
	let authority = _.isEqual(map_ref_mapping.get(component), mapping) ? updateWeaveState : updateReactState;

	function updateReactState(callingLater:boolean = false):void
	{
		//console.log('updateReactState(callingLater = ' + callingLater + ')', 'authority', !callingLater || authority == updateReactState, 'hasFocus', ReactUtils.hasFocus(component));
		if (callingLater && authority != updateReactState)
			return;

		// delay while component has focus because we don't want to overwrite something the user is actively typing
		if (ReactUtils.hasFocus(component))
		{
			authority = updateReactState;
			weavejs.WeaveAPI.Scheduler.callLater(localContext, updateReactState, [true]);
			return;
		}
		authority = null;
		var updatedReactState = reactUpdate(reactState, reactUpdateSpec);
		if (!_.isEqual(reactState, updatedReactState))
			component.setState(reactState = updatedReactState);
	}

	let delayedUpdateWeaveState:Function;
	function updateWeaveState(callingLater:boolean = false):void
	{
		//console.log('updateWeaveState(callingLater = ' + callingLater + ')', 'authority', !callingLater || authority == updateWeaveState);
		if (callingLater && authority != updateWeaveState)
			return;
		
		// stop if context was disposed
		if (Weave.wasDisposed(context))
		{
			unlinkReactState(component);
			return;
		}
		
		// delay while component has focus
		if (!callingLater && delay > 0 && ReactUtils.hasFocus(component))
		{
			authority = updateWeaveState;
			delayedUpdateWeaveState();
			return;
		}

		// update weave state
		authority = null;
		weavejs.core.SessionManager.traverseAndSetState(reactState, mapping);

		// Always update react state after setting weave state because
		// callbacks won't get triggered if the weave state didn't change,
		// and we want to make sure the react value matches the weave value.
		updateReactState();
	}
	if (delay > 0)
		delayedUpdateWeaveState = _.debounce(updateWeaveState.bind(null, true), delay, {leading: false});

	let mapValue = (value:any):any => {
		if (Weave.isLinkable(value))
		{
			Weave.getCallbacks(value).addGroupedCallback(localContext, updateReactState, false, false); // don't delay while busy
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

	let superComponentWillUpdate = component.componentWillUpdate;
	function newComponentWillUpdate(nextProps:any, nextState:any, nextContext:any):void
	{
		// store nextState so it can be accessed and modified inside Weave callbacks
		reactState = nextState;
		
		// set weave state now before render
		updateWeaveState();
		
		// call original function with possibly-updated reactState
		if (superComponentWillUpdate)
			superComponentWillUpdate.call(component, nextProps, reactState, nextContext);
	}
	(newComponentWillUpdate as any)[UNLINK] = function():void {
		component.componentWillUpdate = superComponentWillUpdate;
		Weave.dispose(localContext);
	};
	component.componentWillUpdate = newComponentWillUpdate;

	ReactUtils.onUnmount(component, unlinkReactState);
	
	authority();
}

/**
 * Shortcut for boilerplate code that creates a LinkableWatcher which calls forceUpdate() on a component.
 */
export function forceUpdateWatcher(component:ReactComponent, type:new(..._:any[])=>ILinkableObject, defaultPath:(typeof LinkableWatcher.prototype.targetPath) = null):LinkableWatcher
{
	var watcher = Weave.disposableChild(component, new LinkableWatcher(type, null, component.forceUpdate.bind(component)));
	if (defaultPath)
		watcher.targetPath = defaultPath;
	return watcher;
}

export function requestObject<T extends ReactComponent>(weave:Weave, path:string[]/* TODO change to WeavePathArray */, type:new(..._:any[])=>T, onCreate:(instance:T) => void):void
{
	var oldObject = weave.getObject(path);
	weave.requestObject(path, type);
	var newObject = weave.getObject(path);
	var lp = Weave.AS(newObject, LinkablePlaceholder);
	if (oldObject != newObject && lp)
	{
		Weave.getCallbacks(lp).addDisposeCallback(this, () => {
			if (onCreate && lp.getInstance())
				onCreate(lp.getInstance());
		});
	}
}
