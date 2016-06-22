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

const HEADER_COLUMNS = "Header columns";
const DATA_COLUMNS = "Data columns";
export default class MouseoverController extends React.Component<MouseoverControllerProps, MouseoverControllerState>
{
	attributes = new Map<string, ILinkableHashMap>();

	constructor(props:MouseoverControllerProps)
	{
		super(props);
		this.attributes.set(HEADER_COLUMNS, props.probedHeaderColumns);
		this.attributes.set(DATA_COLUMNS, props.probedColumns);
	}

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1}}>
				<AttributeSelector attributeName={HEADER_COLUMNS} attributes={this.attributes}/>
			</VBox>
		);
	}
}
