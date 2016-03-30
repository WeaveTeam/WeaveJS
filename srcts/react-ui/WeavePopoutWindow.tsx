import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jquery from "jquery";

import {WeavePathArray} from "../FlexibleLayout";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

export interface WeavePopoutWindowProps
{
	title?:string;
	url?:string;
	weave?:Weave;
	windowSettings?:string;
	onClosing?:Function;
	path?:WeavePathArray;
}

export default class WeavePopoutWindow
{
	static open(props:WeavePopoutWindowProps)
	{
		var popoutWindow:any,
			container:HTMLElement,
			update:(newComponent:any) => void,
			close:() => void,
			divId:string = 'popout-container',
			url:string = props.url ? props.url:'_blank',
			title:string = props.title ? props.title:'',
			windowSettings:string = props.windowSettings ? props.windowSettings:"width=500, height=500",
			name:string = "";

		popoutWindow = window.open(title,url,windowSettings);
		popoutWindow.onbeforeunload = () => {
			if (container) {
				ReactDOM.unmountComponentAtNode(container);
				props.weave.root.removeObject(name);
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

			popoutWindow.document.title = props.title;
			container = popoutWindow.document.createElement('div');
			container.id = divId;
			popoutWindow.document.body.appendChild(container);
			var baseName:string = props.weave.path(props.path).getSimpleType();
			name = props.weave.root.generateUniqueName(baseName);
			props.weave.root.requestObjectCopy(name,props.weave.getObject(props.path));
			
			
			//send weave objects, and css to new window
			popoutWindow.weave = props.weave;
			popoutWindow.weavejs = weavejs;
			popoutWindow.Weave = Weave;
			$("link, style").each(function() {
				//Todo: find a better way to clone this link
				var link:any = $(this).clone()[0];
				link.setAttribute("href",window.location.origin + window.location.pathname + link.getAttribute("href"));
				$(popoutWindow.document.head).append(link);
			});
			
			
			ReactDOM.render(
				<WeaveComponentRenderer
					weave={props.weave}
					path={[name]}
					style={{width:"100%", height:"100%"}}
				/>, container);
			update = newComponent => {
				ReactDOM.render(newComponent, container);
			};
			close = () => popoutWindow.close();
		};

		popoutWindow.onload = onloadHandler;
		onloadHandler();
	}
}