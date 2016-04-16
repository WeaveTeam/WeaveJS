import * as React from "react";
import * as ReactDOM from "react-dom";
import reactUpdate from "react-addons-update";
import {HBox,VBox} from "../react-ui/FlexBox";
import * as _ from "lodash";
import * as jquery from "jquery";

import {linkReactStateRef} from "./WeaveReactUtils";

import LinkableString = weavejs.core.LinkableString;

var $:JQueryStatic = (jquery as any)["default"];

export type ReactComponent = React.Component<any, any> & React.ComponentLifecycle<any, any>;

export interface DynamicTableStyles {
	table?:React.CSSProperties;
	thead?:React.CSSProperties;
	tbody?:React.CSSProperties;
	th?:React.CSSProperties | React.CSSProperties[];
	tr?:React.CSSProperties;
	td?:React.CSSProperties | React.CSSProperties[];
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

	static openPopout(jsx:JSX.Element, onLoad?:Function, onBeforeUnLoad?:Function, windowOptions?:any):Window
	{
		var popoutWindow:Window,
			container:HTMLElement,
			update:(newComponent:any) => void,
			close:() => void,
			divId:string = windowOptions.divId || 'popout-container',
			url:string = windowOptions.url || '_blank',
			title:string = windowOptions.title || '',
			windowSettings:string = windowOptions.windowSettings || "width=500, height=500",

		popoutWindow = window.open(title,url,windowSettings);
		popoutWindow.onbeforeunload = () => {
			if (container) {
				ReactDOM.unmountComponentAtNode(container);
				onBeforeUnLoad && onBeforeUnLoad();
			}
		};
		var onloadHandler = () => {
			if (container) {
				var existing = popoutWindow.document.getElementById(divId);
				if (!existing){
					ReactDOM.unmountComponentAtNode(container);
					container = null;
				} else{
					return;
				}
			}

			popoutWindow.document.title = windowOptions.windowName || "Weave Pop-Out";
			container = popoutWindow.document.createElement('div');
			container.id = divId;
			popoutWindow.document.body.appendChild(container);

			onLoad && onLoad();

			if(windowOptions.transferStyle) {
				$("link, style").each(function () {
					//Todo: find a better way to clone this link
					var link:any = $(this).clone()[0];
					link.setAttribute("href", window.location.origin + window.location.pathname + link.getAttribute("href"));
					$(popoutWindow.document.head).append(link);
				});
			}


			ReactDOM.render(jsx, container);
		};

		popoutWindow.onload = onloadHandler;
		(popoutWindow as any).update = (jsx:JSX.Element) => {ReactDOM.render(jsx, container)};
		onloadHandler();
		return popoutWindow;
	}
	
	static openPopup(jsx:JSX.Element, closeOnMouseDown:boolean = false):React.ReactInstance
	{
		var element = document.body.appendChild(document.createElement("div")) as Element;
		var popup = ReactDOM.render(jsx, element);
		var mousedownHandler:EventListener = null;
		
		if (closeOnMouseDown) 
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
		if (!ReactUtils.map_popup_element.has(popup))
			throw new Error("closePopup() can only be called for popups created by openPopup()");
		
		var [element, handler] = ReactUtils.map_popup_element.get(popup);
		if (!element.parentNode)
			return;
		if (handler)
			document.removeEventListener("mousedown", handler);
		ReactDOM.unmountComponentAtNode(element);
		document.body.removeChild(element);
	}

	static generateFlexBoxLayout=(flexValues:number[],rowsUI:React.ReactChild[][]):JSX.Element=>
	{

		var wrappedRowsUI:JSX.Element[] = rowsUI.map((cells:React.ReactChild[],rowIndex:number) => {

			let cellsUI:JSX.Element[] = [];

			for(let cellIndex:number = 0 ; cellIndex < cells.length ; cellIndex++)
			{
				let cell = <div key={cellIndex} style={ {flex:flexValues[cellIndex]} }>
								{cells[cellIndex]}
							</div>
				cellsUI.push(cell);
			}
			return <HBox key={rowIndex}className="weave-padded-hbox" style={ {alignItems:"center"} }>{cellsUI}</HBox>
		});

		return <VBox  className="weave-padded-vbox" >
					{wrappedRowsUI}
				</VBox>;
	}

	static generateGridLayout=(gridValues:string[],gridRowsUI:JSX.Element[][]):JSX.Element=>
	{

		var columnGridUI:JSX.Element[][] = gridRowsUI.map((row:JSX.Element[]) => {

			let cellsUI:JSX.Element[] = [];
			for(let index:number = 0 ; index < row.length ; index++)
			{
				let cell = <div className={gridValues[index] + " wide column"}>
								{row[index]}
							</div>
				cellsUI.push(cell);
			}
			return cellsUI
		});

		return <div className="ui grid">
					{columnGridUI}
				</div>;
	}
	
	static generateTable(header:React.ReactChild[], body:React.ReactChild[][], styles:DynamicTableStyles = {}, classes:DynamicTableClassNames = {}):JSX.Element
	{
		var tableHead = header && (
			<thead style={styles.thead} className={classes.thead}>
		  		{
					header.map((cell, index) => {
						let style = Array.isArray(styles.th) ? (styles.th as React.CSSProperties[])[index] : styles.th;
						return <th key={index} style={style} className={classes.th}>{cell}</th>
					})
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
									row.map((cell, index) => {
										let style = Array.isArray(styles.td) ? (styles.td as React.CSSProperties[])[index] : styles.td;
										return <td key={index} style={style} className={classes.td}>{cell}</td>
									})
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
		// var allRows = [header].concat(body);
		// var columns = _.zip(allRows);
		// return (
		// 	<HBox style={_.merge({flex: 1}, styles.table)} className={classes.table}>
		// 	{
		// 		columns.map((column, i) => {
		// 			return (
		// 				<VBox key={i} style={{flex: 1}}>
		// 				{
		// 					column.map((cell, j) => {
		// 						if(j == 0)
		// 							return <HBox key={j} style={_.merge({flex: 1}, styles.td)} className={classes.thead}> {cell} </HBox>
		// 						let style = Array.isArray(styles.td) ? (styles.td as React.CSSProperties[])[j] : styles.td;
		// 						return <HBox key={j} style={_.merge({flex: 1}, styles.td)} className={classes.td}> {cell} </HBox>
		// 					})
		// 				}
		// 				</VBox>
		// 			)
		// 			
		// 		})
		// 	}
		// 	</HBox>
		// )
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
