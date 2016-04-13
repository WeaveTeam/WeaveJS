import AbstractVisTool from "./AbstractVisTool";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as React from "react";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";
import * as jquery from "jquery";
import MiscUtils from "../utils/MiscUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

import StandardLib = weavejs.util.StandardLib;
import LinkableString = weavejs.core.LinkableString
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export default class TextTool extends AbstractVisTool<IVisToolProps, IVisToolState>
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

	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
	}

	renderEditor():JSX.Element
	{
		return (
			<VBox>
				{
					super.renderEditor()
				}
				<HBox>
					{ReactUtils.generateTable(
						null,
						[["Text", this.htmlText]].map((row:[string, LinkableString]) => [
							Weave.lang(row[0]),
							<StatefulTextField ref={ linkReactStateRef(this, {value: row[1]}) }/>
						]),
						{
							table: {width: "100%"},
							td: [{whiteSpace: "nowrap"}, {padding: 5, width: "100%"}]
						}
					)}
				</HBox>
			</VBox>
		)
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

Weave.registerClass(
	TextTool,
	["weavejs.tool.Text", "weave.ui::TextTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Text"
);
