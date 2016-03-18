import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import {OverlayTrigger, Popover} from "react-bootstrap";

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

	render():JSX.Element
	{
		var launchStyle = classNames({'btn' : true, 'btn default' : true, 'fa fa-cog' : true});
		var closeStyle = classNames({'btn' : true, 'btn default' : true,  'fa fa-close' : true});
		var inputStyle = classNames('input[type="text"]') ;
		return (
			<HBox>
				<OverlayTrigger trigger="click" placement="bottom"
								overlay={<Popover id="AttributeSelector" title="Attribute Selector"><AttributeSelector column={this.props.attribute}/></Popover>}>

					<HBox style={{flex : 1, display : "flex", flexDirection : 'row', justifyContent:'space-around', alignItems: 'center'}}>
						<label style={{flex: 0.23, textAlign: 'center'}}>{ Weave.lang(this.props.label) }</label>

						<HBox style={{flex: 0.85, display: "flex", flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
							<button className={launchStyle}/>
							<input className={inputStyle} type="text"/>
							<button className={closeStyle}/>
						</HBox>
					</HBox>

				</OverlayTrigger>
			</HBox>
		);
	}
}
