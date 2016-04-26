import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import ReactUtils from "../utils/ReactUtils";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface MouseoverControllerProps extends React.Props<MouseoverController>
{
	probedHeaderColumns:ILinkableHashMap;
	probedColumns:ILinkableHashMap;
}

export interface MouseoverControllerState
{

}

export default class MouseoverController extends React.Component<MouseoverControllerProps, MouseoverControllerState>
{

	static window:PopupWindow;
	attributes = new Map<string, ILinkableHashMap>();

	constructor(props:MouseoverControllerProps)
	{
		super(props);
		this.attributes.set("Data Columns", props.probedColumns);
		this.attributes.set("Header Columns", props.probedHeaderColumns);
	}

	static close(window:PopupWindow)
	{
		MouseoverController.window = null;
	}

	static open(weave:Weave,probeHeaderColumns:ILinkableHashMap, probedColumns:ILinkableHashMap)
	{
		if(!probeHeaderColumns)
		{
			//these don't exist, need to create probeHeaderColumns LinkableHashMap
			probeHeaderColumns = weave.root.requestObject("Probe Header Columns", LinkableHashMap);
		}

		if(!probedColumns)
		{
			//these don't exist, need to create probedColumns LinkableHashMap
			probedColumns = weave.root.requestObject("Probed Columns", LinkableHashMap);
		}

		if (MouseoverController.window)
			PopupWindow.close(MouseoverController.window);

		MouseoverController.window = PopupWindow.open({
			title: Weave.lang("Mouseover Controller"),
			content: <MouseoverController probedHeaderColumns={probeHeaderColumns} probedColumns={probedColumns}/>,
			resizable: true,
			width: 550,
			height: 250,
			onClose: MouseoverController.close
		});
	}

	renderFields():JSX.Element
	{
		var tableCellClassNames = {
			td: [
				"weave-left-cell",
				"weave-right-cell"
			]
		};

		return ReactUtils.generateTable(
			null,
			[
				[
					Weave.lang("Header Columns"),
					<SelectableAttributesList attributeName="Header Columns" attributes={this.attributes}/>
				],
				[
					Weave.lang("Data Columns"),
					<SelectableAttributesList attributeName="Data Columns" attributes={this.attributes}/>
				]
			],
			{},tableCellClassNames
		);
	}

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1}}>
				{this.renderFields()}
			</VBox>
		);
	}
}
