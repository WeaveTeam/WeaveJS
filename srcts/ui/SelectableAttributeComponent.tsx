import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import ColumnUtils = weavejs.data.ColumnUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import PopupWindow from "../react-ui/PopupWindow";

export interface ISelectableAttributeComponentProps
{
	attribute : IColumnWrapper;
	label : string;
	attributeNames?:string[];
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

	launchAttributeSelector=():PopupWindow=>{
		return AttributeSelector.openInstance(this.props.label, this.props.attribute, this.props.attributeNames);
	};

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

		//TODO return single instance
		return (
			<HBox className="weave-padded-hbox" style={{justifyContent: 'space-around', alignItems: 'center'}}>

				<button style={ labelStyle } onClick={ this.launchAttributeSelector }>
				{ Weave.lang(this.props.label) }</button>

				<input style={{flex: 1}} type="text" value={ this.columnString } readOnly/>
				<span className={clearStyle}/>
			</HBox>
		);
	}
}