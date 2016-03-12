///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/jquery/jquery.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";
import * as jquery from "jquery";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

import StandardLib = weavejs.util.StandardLib;
import LinkableString = weavejs.core.LinkableString
import LinkableNumber = weavejs.core.LinkableNumber;

export default class TextTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool
{

	htmlText = Weave.linkableChild(this, new LinkableString(""));
	padding = Weave.linkableChild(this, new LinkableNumber(4));
	panelBackgroundColor = Weave.linkableChild(this, LinkableNumber);
	panelBorderColor = Weave.linkableChild(this, LinkableNumber);

	private element:HTMLElement;
	private textToolContainerClass:string;

	constructor(props:IVisToolProps)
	{
		super(props);

		this.textToolContainerClass = "text-tool-container";

		this.htmlText.addGroupedCallback(this, this.forceUpdate);
		this.padding.addGroupedCallback(this, this.forceUpdate);
		this.panelBackgroundColor.addGroupedCallback(this, this.forceUpdate);
		this.panelBorderColor.addGroupedCallback(this, this.forceUpdate)

	}

	panelTitle = Weave.linkableChild(this, LinkableString);

	get title(): string {
		return this.panelTitle.value;
	}

	componentDidMount()
	{

	}

	get deprecatedStateMapping()
	{
		return {
			"htmlText": this.htmlText,
			"padding": this.padding,
			"panelBackgroundColor": this.panelBackgroundColor,
			"panelBorderColor": this.panelBorderColor
		};
	}

	componentDidUpdate()
	{
		$(this.element).empty();
		//parse html, stripping out <script> tags
		let htmlElements:any[] = $.parseHTML(this.htmlText.value,null,false);
		if(htmlElements) {
			htmlElements.forEach((element:any) => {
				if(element.outerHTML)
					$(this.element).append(element.outerHTML);
			});
		}
	}

	render()
	{
		let bgColor:string = this.panelBackgroundColor.value ? StandardLib.getHexColor(this.panelBackgroundColor.value) : "#FFFFFF";
		return (<div style={{flex: 1, padding:this.padding.value, backgroundColor:bgColor, overflow:"auto"}}
					 ref={(c:HTMLElement) => { this.element = c }}
					 className={this.textToolContainerClass}></div>);
	}


}
Weave.registerClass("weavejs.tool.Text", TextTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::TextTool", TextTool);