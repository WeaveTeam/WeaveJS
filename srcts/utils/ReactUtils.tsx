import * as React from "react";
import * as ReactDOM from "react-dom";
import reactUpdate from "react-addons-update";
import * as _ from "lodash";

export type ReactComponent = React.Component<any, any> & React.ComponentLifecycle<any, any>;

export interface DynamicTableStyles {
	table?:React.CSSProperties;
	thead?:React.CSSProperties;
	tbody?:React.CSSProperties;
	th?:React.CSSProperties;
	tr?:React.CSSProperties;
	td?:React.CSSProperties;
};

export interface DynamicTableClassNames {
	table?:string;
	thead?:string;
	tbody?:string;
	th?:string;
	tr?:string;
	td?:string;
}

export default class ReactUtils
{
	private static map_popup_element = new WeakMap<React.ReactInstance, [Element, EventListener]>();
	
	static openPopup(jsx:JSX.Element, closeOnMouseDown:boolean = false):React.ReactInstance
	{
		var element = document.body.appendChild(document.createElement("div")) as Element;
		var popup = ReactDOM.render(jsx, element);
		var mousedownHandler:EventListener = null;
		
		if(closeOnMouseDown) 
		{
			document.addEventListener("mousedown", mousedownHandler = (event:MouseEvent) => {
				if (element.contains(event.target as HTMLElement))
					return;
				ReactUtils.closePopup(popup);
			});
		}
		
		ReactUtils.map_popup_element.set(popup, [element, mousedownHandler]);
		return popup;
	}

	static closePopup(popup:React.ReactInstance):void
	{
		var [element, handler] = ReactUtils.map_popup_element.get(popup) || [null, null];
		if (!element)
			throw new Error("closePopup() can only be called for popups created by openPopup()");
		if(handler)
			document.removeEventListener("mousedown", handler);
		ReactDOM.unmountComponentAtNode(element);
		document.body.removeChild(element);
	}
	
	static generateTable(header:(string|JSX.Element)[], body:(string|JSX.Element)[][], styles:DynamicTableStyles = {}, classes:DynamicTableClassNames = {}):JSX.Element
	{
		var tableHead = header && (
			<thead style={styles.thead} className={classes.thead}>
		  		{
					header.map((cell, index) => <th key={index} style={styles.th} className={classes.th}>{cell}</th>)
				}
			</thead>
		);
		
		var tableBody = body && (
			<tbody style={styles.tbody} className={classes.tbody}>
				{
					body.map((row, index) => {
						return (
							<tr key={index} style={styles.tr} className={classes.tr}>
								{
									row.map((cell, index) => <td key={index} style={styles.td}>{cell}</td>)
								}
							</tr>
						)
					})
				}
			</tbody>
		)
		return (
			<table style={styles.table} className={classes.table}>
				{tableHead}
				{tableBody}
			</table>
		)
	}
	/**
	 * Checks if a component has focus.
	 */
	static hasFocus(component:ReactComponent):boolean
	{
		return ReactDOM.findDOMNode(component).contains(document.activeElement);
	}
	
	/**
	 * Calls component.setState(newValues) only if they are different than the current values.
	 */
	static updateState<S>(component:React.Component<any, S>, newValues:S):void
	{
		for (let key in newValues)
		{
			if (!_.isEqual((component.state as any)[key], (newValues as any)[key]))
			{
				component.setState(newValues);
				return;
			}
		}
	}
	
	/**
	 * Replaces the entire component state if it is different from the current state.
	 */
	static replaceState<S>(component:React.Component<any, S>, newState:S):void
	{
		ReactUtils.updateState(component, ReactUtils.includeMissingPropertyPlaceholders(component.state, newState));
	}
	
	/**
	 * Adds undefined values to new state for properties in current state not
	 * found in new state.
	 */
	private static includeMissingPropertyPlaceholders<S>(currentState:S, newState:S)
	{
		var key:string;
		for (key in currentState)
			if (!newState.hasOwnProperty(key))
				(newState as any)[key] = undefined;
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

	static onWillUpdate<T extends React.Component<P,S> & React.ComponentLifecycle<P,S>, P, S>(
			component:T,
			callback:(component:T, nextProps:P, nextState:S, nextContext:any)=>void
		):void
	{
		var superComponentWillUpdate = component.componentWillUpdate;
		component.componentWillUpdate = function(nextProps:P, nextState:S, nextContext:any):void {
			if (superComponentWillUpdate)
				superComponentWillUpdate.call(component, nextProps, nextState, nextContext);
			callback(component, nextProps, nextState, nextContext);
		};
	}

	private static map_callback_onWillUpdateRef = new WeakMap<
		(component:any, nextProps:any, nextState:any, nextContext:any)=>void,
		(component:ReactComponent)=>void
	>();
	
	static onWillUpdateRef<T extends React.Component<P,S> & React.ComponentLifecycle<P,S>, P, S>(
			callback:(component:T, nextProps:P, nextState:S, nextContext:any)=>void
		):(component:T)=>void
	{
		let ref = ReactUtils.map_callback_onWillUpdateRef.get(callback);
		if (ref)
			return ref;

		let prevComponent:T;
		let oldMethod:typeof prevComponent.componentWillUpdate;
		ref = function(component:T):void {
			if (component)
			{
				oldMethod = component.componentWillUpdate;
				component.componentWillUpdate = function(nextProps:P, nextState:S, nextContext:any):void {
					if (oldMethod)
						oldMethod.call(component, nextProps, nextState, nextContext);
					callback(component, nextProps, nextState, nextContext);
				};
				callback(component, component.props, component.state, component.context);
			}
			else if (prevComponent)
			{
				prevComponent.componentWillUpdate = oldMethod;
				oldMethod = null;
			}
			prevComponent = component;
		};

		ReactUtils.map_callback_onWillUpdateRef.set(callback, ref);
		return ref;
	}
}
