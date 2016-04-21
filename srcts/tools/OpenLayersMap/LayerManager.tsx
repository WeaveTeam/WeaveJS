import * as _ from "lodash";
import * as React from "react";
import AbstractLayer from "./Layers/AbstractLayer";
import AbstractFeatureLayer from "./Layers/AbstractFeatureLayer";
import TileLayer from "./Layers/TileLayer";
import GeometryLayer from "./Layers/GeometryLayer";
import LabelLayer from "./Layers/LabelLayer";
import ScatterPlotLayer from "./Layers/ScatterPlotLayer";
import ImageGlyphLayer from "./Layers/ImageGlyphLayer";


import {VBox, HBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import Checkbox from "../../semantic-ui/Checkbox";
import StatefulRangeSlider from "../../ui/StatefulRangeSlider";
import {linkReactStateRef} from "../../utils/WeaveReactUtils";
import Button from "../../semantic-ui/Button";
import FixedDataTable from "../FixedDataTable";
import MenuButton from "../../react-ui/MenuButton";

import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface ILayerManagerState {
	selectedLayer?: AbstractLayer;
	openedLayer?: AbstractLayer;
}

export interface  ILayerManagerProps extends React.HTMLProps<LayerManager> {
	layers: LinkableHashMap;
	linktoToolEditorCrumb?: Function;
}

export default class LayerManager extends React.Component<ILayerManagerProps, ILayerManagerState> {
	constructor(props:ILayerManagerProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}

	state: ILayerManagerState = {
		selectedLayer: null,
		openedLayer: null,
	};

	componentWillReceiveProps(nextProps:ILayerManagerProps)
	{
		nextProps.layers.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	onEditLayerClick=(layer:AbstractLayer,e: React.MouseEvent) =>{

		if(this.props.linktoToolEditorCrumb)
		{
			this.props.linktoToolEditorCrumb(Weave.lang("{0} layer",this.props.layers.getName(layer)),layer.renderEditor(this.props.linktoToolEditorCrumb));
		}
		else
		{
			this.setState({
				selectedLayer: layer,
				openedLayer: layer
			});
		}
		if (e)
			e.stopPropagation();
	}



	generateItem=(layer:AbstractLayer, index:number):JSX.Element=>
	{
		/* Stop propagation is necessary because otherwise state linkage breaks when the selectedLayer changes. */
		// layer description style set to flex value 1 to take up the remaining space

		return <HBox key={index} style={ {alignItems: "center", padding: "4px"} }
		             className={layer == this.state.selectedLayer ? "weave-list-Item-selected" : "weave-list-Item"}
		             onClick={() => {if (this.state.selectedLayer != layer) this.setState({selectedLayer: layer});}}>
				<Checkbox title={ Weave.lang("Show layer") } ref={ linkReactStateRef(this, { value: layer.visible }) } stopPropagation={true}/>
				<span style={ {flex:1} }>{ layer.getDescription() }</span>
				<button className="ui button"
				        title={ Weave.lang("Edit layer") }
				        style={ {alignSelf: "flex-end", whiteSpace: "nowrap"} }
				        onClick={ this.onEditLayerClick.bind(this,layer) }>
					<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
				</button>
			</HBox>
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

	removeSelected=()=>{
		let selectedName = this.props.layers.getName(this.state.selectedLayer);
		this.props.layers.removeObject(selectedName);
	}

	get selectionIndex():number {
		return this.props.layers.getObjects().indexOf(this.state.selectedLayer);
	}

	render():JSX.Element
	{
		let flex1: React.CSSProperties = { flex: 1 };

		if (!this.state.openedLayer)
		{
			var layerTypes:(new()=>AbstractLayer)[] = [TileLayer, GeometryLayer, LabelLayer, ScatterPlotLayer, ImageGlyphLayer];
			
			return (
				<VBox style={{minHeight: 200, flex: 1}} className="weave-padded-vbox">
					<label>{Weave.lang("Layers")}</label>
					<HBox>
						<MenuButton showIcon={false}
						            style={{flex: "1", alignItems: "center", justifyContent: "center", borderBottomRightRadius:0,borderTopRightRadius:0}} menu={layerTypes.map((layerClass) => ({
								label: weavejs.WeaveAPI.ClassRegistry.getDisplayName(layerClass),
								click: (e:React.MouseEvent) => {
									let newLayer = this.props.layers.requestObject('', layerClass);
									this.setState({selectedLayer: newLayer});
									this.onEditLayerClick(newLayer, e);
								}}))}>
							<i className="fa fa-plus fa-fw"/>
						</MenuButton>
						<Button style={ {flex: "1",borderRadius:0} } disabled={!(this.state.selectedLayer) } onClick={this.removeSelected}><i className="fa fa-minus fa-fw"/></Button>
						<Button style={ {flex: "1",borderRadius:0} } disabled={!(this.state.selectedLayer && this.selectionIndex > 0)} onClick={this.moveSelectedDown}> <i className="fa fa-arrow-down fa-fw"/></Button>
						<Button style={ {flex: "1",borderBottomLeftRadius:0,borderTopLeftRadius:0} } disabled={!(this.state.selectedLayer && this.selectionIndex < this.props.layers.getObjects().length - 1)} onClick={this.moveSelectedUp}><i className="fa fa-arrow-up fa-fw"/></Button>
					</HBox>
					<div style={{flex: 1, overflow: "auto", border: "1px solid lightgrey"}}>
						{this.props.layers.getObjects().reverse().map(this.generateItem)}
					</div>
				</VBox>
			);
		}
		else
		{
			return (
				<VBox style={{flex: 1}}>
					<HBox>
						<Button onClick={() => this.setState({ selectedLayer: this.state.selectedLayer, openedLayer: null}) }>
							{" < "}
						</Button>
						{Weave.lang("Layer: {0}", this.props.layers.getName(this.state.openedLayer))}
					</HBox>
					{this.state.selectedLayer.renderEditor()}
				</VBox>
			);
		}
	}
}
