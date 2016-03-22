import * as _ from "lodash";
import * as React from "react";
import AbstractLayer from "./Layers/AbstractLayer";
import AbstractFeatureLayer from "./Layers/AbstractFeatureLayer";
import {VBox, HBox} from "../../react-ui/FlexBox";
import ListView from "../../ui/ListView";
import StatefulCheckBox from "../../ui/StatefulCheckBox";
import {linkReactStateRef} from "../../utils/WeaveReactUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface ILayerEditorState {
	selectedLayer: AbstractLayer;
}

export interface  ILayerEditorProps extends React.HTMLProps<LayerEditor> {
	layers: LinkableHashMap;
}

export default class LayerEditor extends React.Component<ILayerEditorProps, ILayerEditorState> {
	constructor(props:ILayerEditorProps)
	{
		super(props);
	}

	state: ILayerEditorState = {
		selectedLayer: null
	};

	rowHeight = 16;

	renderItem=(layer:AbstractLayer, index:number):JSX.Element=>
	{
		let marginStyle: React.CSSProperties = {marginRight: "1em"};
		return <div style={{ position: "absolute", top: index * this.rowHeight, width: "100%"}}>
				<span style={marginStyle}><StatefulCheckBox ref={linkReactStateRef(this, { checked: layer.visible }) }/>{Weave.lang("Visible")}</span>
				<span style={marginStyle}><StatefulCheckBox disabled={!(layer instanceof AbstractFeatureLayer)} ref={linkReactStateRef(this, {checked: layer.selectable})}/>{Weave.lang("Selectable")}</span>
				<span style={marginStyle}>{layer.getDescription() }</span>
				<i className="fa fa-gear" style={{float: "right"}} onClick={() => this.setState({ selectedLayer: layer})}/>
		</div>;
	}

	render():JSX.Element
	{
		if (!this.state.selectedLayer)
		{
			return <VBox>
				<ListView style={{overflowX: "hidden", borderStyle: "solid", borderWidth: "1px", borderColor: "darkgrey", height: 200}} items={this.props.layers.getObjects() } itemHeight={20} itemRender={this.renderItem}/>
			</VBox>
		}
		else
		{
			return <VBox>
				<button onClick={() => this.setState({ selectedLayer: null })}><i className="fa fa-arrow-left"/></button>
				{this.state.selectedLayer.renderEditor()}
			</VBox>;
		}
	}
}