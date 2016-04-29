import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import AttributeSelector from "../ui/AttributeSelector";
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
		this.attributes.set("Header columns", props.probedHeaderColumns);
		this.attributes.set("Data columns", props.probedColumns);
	}

	static close(window:PopupWindow)
	{
		MouseoverController.window = null;
	}

	static open(weave:Weave,probeHeaderColumns:ILinkableHashMap, probedColumns:ILinkableHashMap)
	{
		if (!probeHeaderColumns)
		{
			//these don't exist, need to create probeHeaderColumns LinkableHashMap
			probeHeaderColumns = weave.root.requestObject("Probe Header Columns", LinkableHashMap);
		}

		if (!probedColumns)
		{
			//these don't exist, need to create probedColumns LinkableHashMap
			probedColumns = weave.root.requestObject("Probed Columns", LinkableHashMap);
		}

		if (MouseoverController.window)
			PopupWindow.close(MouseoverController.window);

		MouseoverController.window = PopupWindow.open({
			title: Weave.lang("Mouseover settings"),
			content: <MouseoverController probedHeaderColumns={probeHeaderColumns} probedColumns={probedColumns}/>,
			resizable: true,
			width: 920,
			height: 675,
			onClose: MouseoverController.close
		});
	}

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1}}>
				<AttributeSelector attributeName="Header Columns" attributes={this.attributes}/>
			</VBox>
		);
	}
}
