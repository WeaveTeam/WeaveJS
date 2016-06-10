import * as React from "react";
import * as ReactDOM from "react-dom";
import DOMUtils from "./DOMUtils";

export default class MouseUtils
{
	static addPointClickListener(target:HTMLElement, listener:(event:MouseEvent)=>void, pixelThreshold:number = 1):void
	{
		var _listener = listener as any;
		_listener.onMouseDown = function(event:MouseEvent):void {
			_listener.mouseDownEvent = event;
		};
		_listener.onClick = function(event:MouseEvent):void {
			var mde:MouseEvent = _listener.mouseDownEvent;
			if (Math.abs(mde.clientX - event.clientX) <= pixelThreshold && Math.abs(mde.clientY - event.clientY) <= pixelThreshold)
				listener(event);
		};
		target.addEventListener('mousedown', _listener.onMouseDown);
		target.addEventListener('click', _listener.onClick);
	}

	static removePointClickListener(target:HTMLElement, listener:any):void
	{
		target.removeEventListener('mousedown', listener.onMouseDown);
		target.removeEventListener('click', listener.onClick);
	}
	
	static getOffsetPoint(relativeTo:HTMLElement, event:MouseEvent = null):{x:number, y:number}
	{
		if (!event)
			event = MouseUtils.forElement(relativeTo).mouseEvent;
		
		if (!event)
		{
			console.error(
				"Warning: MouseUtils.getOffsetPoint(element, null) will not be correct the first time it is called.",
				"To work around this, call MouseUtils.forElement() first."
			);
			return {x: 0, y: 0};
		}
		
		var rect = relativeTo.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * (relativeTo.offsetWidth / rect.width || 1),
			y: (event.clientY - rect.top) * (relativeTo.offsetHeight / rect.height || 1)
		};
	}

	/**
	 * This function can be used to check if the user clicked on an element
	 * even if the 'click' event doesn't get dispatched due to DOM changes
	 * @param element the Element in question
	 * @returns {boolean} return true if the element received the last 'mousedown' event.
	 */
	static receivedMouseDown(element:Element):boolean
	{
		var instance = MouseUtils.forElement(element);
		return instance.mouseDownEvent && element && element.contains(instance.mouseDownEvent.target as Element);
	}
	
	static isMouseOver(element:HTMLElement, event:MouseEvent = null, inclusive:boolean = true):boolean
	{
		var rect = element.getBoundingClientRect();
		if (!event)
			event = MouseUtils.forElement(element).mouseEvent;
		
		if (!event)
		{
			console.error(
				"Warning: MouseUtils.isMouseOver(element, null) will not be correct the first time it is called.",
				"To work around this, call MouseUtils.forElement() first."
			);
			return false;
		}
		
		if (inclusive)
			return event.clientX >= rect.left
				&& event.clientX <= rect.left + rect.width
				&& event.clientY >= rect.top
				&& event.clientY <= rect.top + rect.height;
		
		return event.clientX > rect.left
			&& event.clientX < rect.left + rect.width
			&& event.clientY > rect.top
			&& event.clientY < rect.top + rect.height;
	}

	private static map_window_MouseUtils = new WeakMap<Window, MouseUtils>();
	
	static forComponent(component:React.Component<any, any>):MouseUtils
	{
		return MouseUtils.forElement(ReactDOM.findDOMNode(component));
	}
	
	static forElement(element:Element):MouseUtils
	{
		var window = DOMUtils.getWindow(element);
		var instance = MouseUtils.map_window_MouseUtils.get(window);
		if (!instance)
		{
			instance = new MouseUtils(window);
			MouseUtils.map_window_MouseUtils.set(window, instance);
		}
		return instance;
	}
	
	private static buttonToButtonsMapping = [1, 4, 2];
	
	//--------------------
	//
	
	static echoWindowEvents(windowSource:Window, windowTarget:Window) {
		MouseUtils.mouseEventTypes.forEach(eventType => windowSource.document.addEventListener(eventType, (event) => windowTarget.requestAnimationFrame(() => windowTarget.document.dispatchEvent(event))));
		MouseUtils.dragEventTypes.forEach(eventType => windowSource.document.addEventListener(eventType, (event) => windowTarget.requestAnimationFrame(() => windowTarget.document.dispatchEvent(event))));
	}

	static mouseEventTypes = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'wheel'];
	static dragEventTypes = ['dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend'];
	constructor(window:Window)
	{
		MouseUtils.mouseEventTypes.forEach(eventType => window.document.addEventListener(eventType, this.handleMouseEvent, true));
		MouseUtils.dragEventTypes.forEach(eventType => window.document.addEventListener(eventType, this.handleDragEvent, true));
			
		// for debugging
		//mouseEventTypes.concat(dragEventTypes).forEach(eventType => window.document.addEventListener(eventType, this.debugEvent, true));
	}
	
	/**
	 * A bitmask for mouse button state. left=1, right=2, middle=4
	 */
	mouseButtonDown:number = 0;
	
	/**
	 * The last mouse event.
	 */
	mouseEvent:MouseEvent = new MouseEvent('mousemove');
	mouseDownEvent:MouseEvent = null;
	
	private canRelyOnButtonsProp = false;
	
	private handleMouseEvent=(event:MouseEvent)=>
	{
		this.mouseEvent = event;
		if (event.type == 'mousedown')
			this.mouseDownEvent = event;
		if (event.buttons || this.canRelyOnButtonsProp)
		{
			this.canRelyOnButtonsProp = true;
			this.mouseButtonDown = event.buttons;
		}
		else if (event.type == 'mousedown')
		{
			this.mouseButtonDown |= MouseUtils.buttonToButtonsMapping[event.button];
		}
		else if (event.type == 'mouseup')
		{
			this.mouseButtonDown &= ~MouseUtils.buttonToButtonsMapping[event.button];
		}
	}
	
	private handleDragEvent=(event:MouseEvent)=>
	{
		this.mouseEvent = event;
		if (event.buttons || this.canRelyOnButtonsProp)
		{
			this.canRelyOnButtonsProp = true;
			this.mouseButtonDown = event.buttons;
		}
		else if (event.type == 'dragend' || event.type == 'drop')
		{
			this.mouseButtonDown &= ~MouseUtils.buttonToButtonsMapping[event.button];
		}
	}
	
	private debugEvent=(event:MouseEvent)=>
	{
		console.log(
			event.type,
			'mouseButtonDown =', this.mouseButtonDown,
			Weave.stringify({x: event.clientX, y: event.clientY, button: event.button, buttons: event.buttons})
		);
	}
}
