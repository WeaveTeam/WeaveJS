import * as _ from "lodash";
import * as React from "react";
import AbstractLayer from "./Layers/AbstractLayer";
import AbstractFeatureLayer from "./Layers/AbstractFeatureLayer";
import {VBox, HBox} from "../../react-ui/FlexBox";
import ListView from "../../ui/ListView";
import StatefulCheckBox from "../../ui/StatefulCheckBox";
import StatefulRangeSlider from "../../ui/StatefulRangeSlider";
import {linkReactStateRef} from "../../utils/WeaveReactUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface ILayerEditorState {
	selectedLayer: AbstractLayer;
	openedLayer: AbstractLayer;
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
		selectedLayer: null,
		openedLayer: null
	};

	rowHeight = 16;

	generateItem=(layer:AbstractLayer, index:number):JSX.Element=>
	{
		let marginStyle: React.CSSProperties = {marginRight: "0.5em"};
		/* Stop propagation is necessary because otherwise state linkage breaks when the selectedLayer changes. */
		return <div key={index} style={{width: "100%", whiteSpace: "nowrap"}}
				className={layer === this.state.selectedLayer ? "weave-tree-view selected" : "weave-tree-view"}
				onClick={() => { if (this.state.selectedLayer !== layer) this.setState({ selectedLayer: layer, openedLayer: null }); }}>
				<span style={marginStyle}>
				<StatefulCheckBox ref={linkReactStateRef(this, { checked: layer.visible }) } stopPropagation/>
					{Weave.lang("Visible")}
				</span>
				<span style={marginStyle}>
					<StatefulRangeSlider min={0} max={1} step={0.01} style={{display: "inline", width: "50px"}} ref={linkReactStateRef(this, { value: layer.opacity })}/>
				</span>
				<span style={marginStyle}>
					<StatefulCheckBox ref={linkReactStateRef(this, { checked: layer.selectable }) } disabled={!(layer instanceof AbstractFeatureLayer) } stopPropagation/>
					{Weave.lang("Selectable")}
				</span>
				<span style={marginStyle}>{layer.getDescription() }</span>
				<span style={{ float: "right", borderColor: "black", borderStyle: "solid", borderWidth: "1px" }} onClick={(e: React.MouseEvent) => { this.setState({ selectedLayer: layer, openedLayer: layer }); e.stopPropagation() } }><i className="fa fa-gear"/>{Weave.lang("Edit") }</span>
		</div>;
	}

	render():JSX.Element
	{
		if (!this.state.openedLayer)
		{
			return <VBox>
				<div style={{ height: 500, overflowY: "scroll" }}>
					{this.props.layers.getObjects().map(this.generateItem)}
				</div>
			</VBox>
		}
		else
		{
			return <VBox>
				<button onClick={() => this.setState({ selectedLayer: this.state.selectedLayer, openedLayer: null })}><i className="fa fa-arrow-left"/></button>
				{this.state.selectedLayer.renderEditor()}
			</VBox>;
		}
	}
}