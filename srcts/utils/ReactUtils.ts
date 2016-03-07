import * as React from "react";

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
	
	static onUnmount<T extends React.Component<any, any> & React.ComponentLifecycle<any, any>>(component:T, callback:(component:T)=>void):void
	{
		// add listener to replace instance with placeholder when it is unmounted
		var superWillUnmount = component.componentWillUnmount;
		component.componentWillUnmount = function() {
			if (superWillUnmount)
				superWillUnmount.call(component);
			callback(component);
		};
	}
}
