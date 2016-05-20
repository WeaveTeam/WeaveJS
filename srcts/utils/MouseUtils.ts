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

	/**
	 * A bitmask for mouse button state. left=1, right=2, middle=4
	 */
	static mouseButtonDown:number = 0;
	
	/**
	 * The last mouse event.
	 */
	static mouseEvent:MouseEvent = new MouseEvent('mousemove');

	static getOffsetPoint(relativeTo:HTMLElement, event:MouseEvent = null):{x:number, y:number}
	{
		if (!event)
			event = MouseUtils.mouseEvent;
		var rect = relativeTo.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * (relativeTo.offsetWidth / rect.width || 1),
			y: (event.clientY - rect.top) * (relativeTo.offsetHeight / rect.height || 1)
		};
	}
}

var canRelyOnButtonsProp = false;
var mouseEventTypes = ['click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'wheel'];
var dragEventTypes = ['dragstart', 'drag', 'dragenter', 'dragexit', 'dragleave', 'dragover', 'drop', 'dragend'];
var buttonToButtonsMapping = [1, 4, 2];

mouseEventTypes.forEach(eventType => document.addEventListener(
	eventType,
	function(event:MouseEvent) {
		MouseUtils.mouseEvent = event;
		if (event.buttons || canRelyOnButtonsProp)
		{
			canRelyOnButtonsProp = true;
			MouseUtils.mouseButtonDown = event.buttons;
		}
		else if (eventType == 'mousedown')
		{
			MouseUtils.mouseButtonDown |= buttonToButtonsMapping[event.button];
		}
		else if (eventType == 'mouseup')
		{
			MouseUtils.mouseButtonDown &= ~buttonToButtonsMapping[event.button];
		}
	},
	true
));

dragEventTypes.forEach(eventType => document.addEventListener(
	eventType,
	function(event:MouseEvent) {
		MouseUtils.mouseEvent = event;
		if (event.buttons || canRelyOnButtonsProp)
		{
			canRelyOnButtonsProp = true;
			MouseUtils.mouseButtonDown = event.buttons;
		}
		else if (eventType == 'dragend' || eventType == 'drop')
		{
			MouseUtils.mouseButtonDown &= ~buttonToButtonsMapping[event.button];
		}
	},
	true
));

/*
// for debugging
mouseEventTypes.concat(dragEventTypes).forEach(eventType => document.addEventListener(
	eventType,
	function(event:MouseEvent) {
		console.log(
			eventType,
			'MouseUtils.mouseButtonDown =', MouseUtils.mouseButtonDown,
			Weave.stringify({x: event.clientX, y: event.clientY, button: event.button, buttons: event.buttons})
		);
	},
	true
));
*/
