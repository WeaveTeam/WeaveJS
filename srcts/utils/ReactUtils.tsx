import * as React from "react";
import * as ReactDOM from "react-dom";
import reactUpdate from "react-addons-update";
import DOMUtils from "./DOMUtils";
import {HBox,VBox} from "../react-ui/FlexBox";
import * as _ from "lodash";
import * as jquery from "jquery";
import polyfill from "./polyfill";
import MouseUtils from "./MouseUtils";
import MiscUtils from "./MiscUtils";

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
	td?:string|string[];
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
			windowSettings:string = windowOptions.windowSettings || "width=900, height=700",

		popoutWindow = window.open(title,url,windowSettings);
		if (!popoutWindow)
		{
			console.error("Popout window was blocked");
			return;
		}
		popoutWindow.onbeforeunload = () => {
			if (container) {
				onBeforeUnLoad && onBeforeUnLoad();
				ReactDOM.unmountComponentAtNode(container);
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

			if (windowOptions.transferStyle)
			{
				var links = document.getElementsByTagName("link");
				// make link href absolute
				for (var i = 0; i < links.length; ++i)
				{
					var link = links[i].cloneNode() as HTMLLinkElement;
					link.setAttribute("href", link.href || "");
					popoutWindow.document.head.appendChild(link);
				}
			}

			polyfill(popoutWindow);
			ReactDOM.render(jsx, container);
			onLoad && onLoad();
		};

		popoutWindow.onload = onloadHandler;
		(popoutWindow as any).update = (jsx:JSX.Element) => {ReactDOM.render(jsx, container)};
		onloadHandler();
		return popoutWindow;
	}
	
	static openPopup(context:React.ReactInstance, jsx:JSX.Element, closeOnMouseDown:boolean = false, onClose?:(popup:React.ReactInstance)=>void):React.ReactInstance
	{
		var document = ReactUtils.getDocument(context);
		var element = document.body.appendChild(document.createElement("div")) as Element;
		var popup = ReactDOM.render(jsx, element);
		var mousedownHandler:EventListener = null;
		
		if (closeOnMouseDown) 
		{
			document.addEventListener("mousedown", mousedownHandler = (event:MouseEvent) => {
				if (element.contains(event.target as HTMLElement))
					return;
				onClose && onClose(popup);
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
		
		var document = DOMUtils.getWindow(element).document;
		if (handler)
			document.removeEventListener("mousedown", handler);
		ReactDOM.unmountComponentAtNode(element);
		document.body.removeChild(element);
	}


	static generateFlexBoxLayout=(flexValues:number[],rowsUI:React.ReactChild[][],cellStyles:React.CSSProperties[] = [],cellClassNames:string[] = []):JSX.Element=>
	{

		var wrappedRowsUI:JSX.Element[] = rowsUI.map((cells:React.ReactChild[],rowIndex:number) => {

			let cellsUI:JSX.Element[] = [];

			for(let cellIndex:number = 0 ; cellIndex < cells.length ; cellIndex++)
			{
				let customCellStyle:React.CSSProperties = cellStyles[cellIndex]?cellStyles[cellIndex]:{};
				// overflow hidden ensures flex values are maintained // default if no overflow values are mentioned
				let cellStyle:React.CSSProperties = _.merge({overflow:"hidden"},customCellStyle,{flex:flexValues[cellIndex]});
				let cell = <div key={cellIndex} style={ cellStyle } className={cellClassNames[cellIndex]}>
								{cells[cellIndex]}
							</div>
				cellsUI.push(cell);
			}
			return <HBox key={rowIndex} className="weave-padded-hbox" style={ {alignItems:"center"} }>{cellsUI}</HBox>
		});

		//div wrapper is must if this dom becomes child of flexBox display has to be block for overflow to work correctly
		return <div><VBox  className="weave-padded-vbox" >
					{wrappedRowsUI}
				</VBox></div>;
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

		//div wrapper is must if this dom becomes child of flexBox display has to be block for overflow to work correctly
		return <div>
					<div className="ui grid">
						{columnGridUI}
					</div>
				</div>;
	}
	
	static generateTable(params:{
			header?:React.ReactChild[],
			body:React.ReactChild[][],
			styles?:DynamicTableStyles,
			classes?:DynamicTableClassNames,
			props?:React.HTMLProps<HTMLTableElement>
		}):JSX.Element
	{
		var {header, body, styles, classes, props} = params;
		styles = styles || {};
		classes = classes || {};

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
					body.filter(_.identity).map((row, index) => {
						return (
							<tr key={index} style={styles.tr} className={classes.tr}>
								{
									row.map((cell, index) => {
										if (cell === undefined)
											return null;
										
										let style:React.CSSProperties = Array.isArray(styles.td) ? (styles.td as React.CSSProperties[])[index] : styles.td;
										let className:string = Array.isArray(classes.td) ? classes.td[index] : classes.td as string;
										
										let colSpan:number = 1;
										for (let next = index + 1; next < row.length; next++)
											if (row[next] === undefined)
												colSpan++;
										
										return (
											<td
												key={index}
												style={style}
												className={className}
												colSpan={colSpan}
												children={cell}
											/>
										);
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
		return ReactDOM.findDOMNode(component).contains(ReactUtils.getDocument(component).activeElement);
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

	static getWindow(instance:React.ReactInstance):Window
	{
		return DOMUtils.getWindow(ReactUtils.getElement(instance));
	}
	static getDocument(instance:React.ReactInstance):Document
	{
		return ReactUtils.getWindow(instance).document;
	}

	static getElement(instance:React.ReactInstance):Element
	{
		if (instance instanceof React.Component)
			return ReactDOM.findDOMNode(instance);
		else
			return instance as Element;
	}

	private static map_element_componentSet = new WeakMap<Element, Set<React.Component<any, any>>>();

	/**
	 * Generates a ref function that makes it possible to use ReactUtils.findComponent() on the resulting DOM Element.
	 */
	static registerComponentRef<T extends React.ReactInstance>( component:ReactComponent, then?:(instance:T)=>void ):(instance:T)=>void
	{
		var componentSet:Set<React.Component<any,any>> = null;
		return function(instance:T):void {
			if (componentSet)
				componentSet.delete(component);
			
			var element = ReactUtils.getElement(instance);
			if (element)
			{
				componentSet = ReactUtils.map_element_componentSet.get(element);
				if (!componentSet)
				{
					componentSet = new Set<React.Component<any, any>>();
					ReactUtils.map_element_componentSet.set(element, componentSet);
				}
				componentSet.add(component);
			}
			else
			{
				componentSet = null;
			}
			
			if (then)
				then.call(this, instance);
		};
	}

	/**
	 * Returns the first ancestor React Component of a particular type which has been registered via ReactUtils.registerComponentRef().
	 */
	static findComponent<T extends React.Component<any,any>>(instance:React.ReactInstance, type?:new(..._:any[])=>T):T
	{
		var element = ReactUtils.getElement(instance);
		if (!element)
			return null;
		var rcs = ReactUtils.map_element_componentSet.get(element);
		if (rcs)
		{
			// get the last matching component that was added to the set 
			var result:T = null;
			for (var rc of rcs)
				if (!type || rc instanceof type)
					result = rc as T;
			if (result)
				return result;
		}
		return ReactUtils.findComponent(element.parentElement, type);
	}
}
