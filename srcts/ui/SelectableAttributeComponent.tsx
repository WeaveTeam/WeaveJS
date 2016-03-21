import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import DynamicColumn = weavejs.data.column.DynamicColumn;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import {OverlayTrigger, Popover} from "react-bootstrap";
import ReferencedColumn = weavejs.data.column.ReferencedColumn;

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
	componentDidMount(){
		Weave.getCallbacks(this.props.attribute).addGroupedCallback(this, this.forceUpdate)
	};

	//TODO figure out how to make an indent component
	render():JSX.Element
	{
		var clearStyle = classNames({ 'fa fa-trash-o' : true, 'weave-icon' : true});
		var inputStyle = classNames('input[type="text"]') ;
		var labelStyle = {textAlign : 'center', flex: 0.35, fontSize : 'smaller'};

		var refCol = this.props.attribute.getInternalColumn() as ReferencedColumn;
		if(refCol)
			this.columnString = refCol.getMetadata(weavejs.api.data.ColumnMetadata.TITLE);

		return (
			<HBox>
				<HBox style={{flex : 1, display : "flex", flexDirection : 'row', justifyContent:'space-around', alignItems: 'center'}}>
					<OverlayTrigger trigger="click" placement="bottom"
									overlay={<Popover id="AttributeSelector" title="Attribute Selector">
											<AttributeSelector column={ this.props.attribute }/>
										</Popover>}>
						<button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>

					</OverlayTrigger>
					<HBox style={{flex: 0.85, display: "flex", flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
						<input className={inputStyle} type="text" value={ this.columnString } readOnly></input>
						<span className={clearStyle}/>
					</HBox>
				</HBox>

			</HBox>
		);
	}
}