import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as jquery from "jquery";
import ReactUtils from "./ReactUtils";

var $:JQueryStatic = (jquery as any)["default"];

export default class PrintUtils {

	static onBeforeUnLoad=() => { };

	static onLoad=() => { }

	static printTool(tool:Element):void {
		var popoutWindow:Window;
		var options:any = {
			transferStyle: true,
			windowSettings: "width=" + tool.clientWidth + ", height=" + tool.clientHeight
		};
		var content:JSX.Element = (<div/>);
		popoutWindow = ReactUtils.openPopout(content, PrintUtils.onLoad, PrintUtils.onBeforeUnLoad, options);
		popoutWindow.document.body.innerHTML = ($(tool).clone(true,true).html());
		popoutWindow.print();
		popoutWindow.close();
	}

	static printCanvasTool(tool:Element):void {
		var popoutWindow:Window;
		var canvas:HTMLCanvasElement;
		var options:any = {
			transferStyle: true,
			windowSettings: "width=" + tool.clientWidth + ", height=" + tool.clientHeight
		};
		var content:JSX.Element = (
			<img id="printImg"/>
		);
		popoutWindow = ReactUtils.openPopout(content, PrintUtils.onLoad, PrintUtils.onBeforeUnLoad, options);
		var canvasList = tool.getElementsByTagName('canvas');
		if(canvasList.length)
			canvas = canvasList.item(0);
		var data = canvas.toDataURL('image/png');
		popoutWindow.document.getElementById("printImg").setAttribute('src', data);
		popoutWindow.print();
		popoutWindow.close();
	}
}