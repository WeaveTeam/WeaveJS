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

export interface ILayerManagerState {
	selectedLayer: AbstractLayer;
	openedLayer: AbstractLayer;
}

export interface  ILayerManagerProps extends React.HTMLProps<LayerManager> {
	layers: LinkableHashMap;
}

export default class LayerManager extends React.Component<ILayerManagerProps, ILayerManagerState> {
	constructor(props:ILayerManagerProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}

	state: ILayerManagerState = {
		selectedLayer: null,
		openedLayer: null
	};

	componentWillReceiveProps(nextProps:ILayerManagerProps)
	{
		nextProps.layers.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

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

	moveSelectedUp=()=>{
		let names = this.props.layers.getNames();
		[names[this.selectionIndex], names[this.selectionIndex + 1]] = [names[this.selectionIndex + 1], names[this.selectionIndex]];
		this.props.layers.setNameOrder(names);
	};

	moveSelectedDown=()=>{
		let names = this.props.layers.getNames();
		[names[this.selectionIndex], names[this.selectionIndex - 1]] = [names[this.selectionIndex - 1], names[this.selectionIndex]];
		this.props.layers.setNameOrder(names);
	};

	get selectionIndex():number {
		return this.props.layers.getObjects().indexOf(this.state.selectedLayer);
	}

	/* TODO: Add drag-and-drop of layers. */
	render():JSX.Element
	{
		let flex1: React.CSSProperties = { flex: 1 };
		if (!this.state.openedLayer)
		{
			return <VBox>
				<div style={{ height: 200, overflowY: "scroll" }}>
					{this.props.layers.getObjects().reverse().map(this.generateItem)}
				</div>
				<HBox>
					<button style={flex1}><i className="fa fa-plus"/></button>
					<button style={flex1} disabled={!(this.state.selectedLayer && this.selectionIndex < this.props.layers.getObjects().length - 1)} 
							onClick={this.moveSelectedUp}><i className="fa fa-arrow-up"/></button>
					<button style={flex1} disabled={!(this.state.selectedLayer && this.selectionIndex > 0)} onClick={this.moveSelectedDown}> <i className="fa fa-arrow-down"/></button>
				</HBox>
			</VBox>
		}
		else
		{
			return <VBox>
				<HBox>
					<button onClick={() => this.setState({ selectedLayer: this.state.selectedLayer, openedLayer: null }) }>
						<i className="fa fa-arrow-left"/>
					</button>
					{Weave.lang("Layer: {0}", this.props.layers.getName(this.state.openedLayer))}
				</HBox>
				{this.state.selectedLayer.renderEditor()}
			</VBox>;
		}
	}
}