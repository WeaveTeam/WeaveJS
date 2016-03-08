import * as React from "react";

export type ReactComponent = React.Component<any, any> & React.ComponentLifecycle<any, any>;

export default class ReactUtils
{
	/**
	 * Adds undefined values to new state for properties in current state not
	 * found in new state.
	 */
	static includeMissingPropertyPlaceholders(currentState:any, newState:any)
	{
		var key:string;
		for (key in currentState)
			if (!newState.hasOwnProperty(key))
				newState[key] = undefined;
		return newState;
	}
	
	static onUnmount<T extends ReactComponent>(component:T, callback:(component:T)=>void):void
	{
		// add listener to replace instance with placeholder when it is unmounted
		var superWillUnmount = component.componentWillUnmount;
		component.componentWillUnmount = function() {
			if (superWillUnmount)
				superWillUnmount.call(component);
			callback(component);
		};
	}

	static onUpdate<T extends ReactComponent>(component: T, callback: (component: T) => void): void
	{
		var superComponentDidUpdate = component.componentDidUpdate;
		component.componentDidUpdate = function(prevProps: any, prevState: any, prevContext: any) {
			if (superComponentDidUpdate)
				superComponentDidUpdate.call(component, prevProps, prevState, prevContext);
			callback(component);
		};
	}

	static map_callback_onUpdateRef = new WeakMap();
	static onUpdateRef<T extends ReactComponent>(callback:(component:T)=>void):(component:T)=>void
	{
		if (map_callback_onUpdateRef.has(callback))
			return map_callback_onUpdateRef.get(callback);
		
		var localSerial = ReactUtils.serial++;
		var prevCDU:(prevProps:any, prevState:any, prevContext:any)=>void;
		var prevComponent:T;
		var ref = function(component:T):void {
			if (component)
			{
				prevCDU = component.componentDidUpdate;
				component.componentDidUpdate = function(prevProps: any, prevState: any, prevContext: any):void {
					if (prevCDU)
						prevCDU.call(component, prevProps, prevState, prevContext);
					callback(component);
				};
			}
			else if (prevComponent)
			{
				prevComponent.componentDidUpdate = prevCDU;
				prevCDU = null;
			}
			prevComponent = component;
		};
		map_callback_onUpdateRef.set(callback, ref);
		return ref;
	}
}
