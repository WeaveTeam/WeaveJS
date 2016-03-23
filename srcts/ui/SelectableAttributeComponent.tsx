import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import DynamicColumn = weavejs.data.column.DynamicColumn;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import {OverlayTrigger, Popover} from "react-bootstrap";
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import ColumnUtils = weavejs.data.ColumnUtils;

export interface ISelectableAttributeComponentProps
{
	attribute : DynamicColumn;
	label : string;
}

export interface ISelectableAttributeComponentState
{
}

export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>
{
	constructor(props:ISelectableAttributeComponentProps)
	{
		super(props);
	}

	columnString: string;
	componentDidMount()
	{
		Weave.getCallbacks(this.props.attribute).addGroupedCallback(this, this.forceUpdate)
	}
	//TODO figure out how to make an indent component
	render():JSX.Element
	{
		var clearStyle = classNames({ 'fa fa-trash-o' : true, 'weave-icon' : true});
		var labelStyle = {textAlign: 'center', flex: 0.35, fontSize: 'smaller'};

		this.columnString = ColumnUtils.getColumnListLabel(this.props.attribute);

		return (
			<HBox className="weave-padded-hbox" style={{justifyContent: 'space-around', alignItems: 'center'}}>
				<OverlayTrigger trigger="click" placement="bottom"
								overlay={<Popover id="AttributeSelector" title="Attribute Selector">
										<AttributeSelector column={ this.props.attribute }/>
									</Popover>}>
					<button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>

				</OverlayTrigger>
				<input style={{flex: 1}} type="text" value={ this.columnString } readOnly/>
				<span className={clearStyle}/>
			</HBox>
		);
	}
}