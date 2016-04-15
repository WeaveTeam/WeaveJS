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

import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface ILayerManagerState {
	selectedLayer?: AbstractLayer;
	openedLayer?: AbstractLayer;
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
		openedLayer: null,
	};

	componentWillReceiveProps(nextProps:ILayerManagerProps)
	{
		nextProps.layers.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	generateItem=(layer:AbstractLayer, index:number):JSX.Element=>
	{
		/* Stop propagation is necessary because otherwise state linkage breaks when the selectedLayer changes. */

		return <HBox key={index} style={{width: "100%", alignItems: "center", paddingTop: "4px", paddingBottom: "4px"}} className={layer == this.state.selectedLayer ? "weave-list-Item-selected" : "weave-list-Item"}
				onClick={() => {if (this.state.selectedLayer != layer) this.setState({selectedLayer: layer});}}>
				<Checkbox title={Weave.lang("Show layer")} ref={linkReactStateRef(this, { value: layer.visible }) } stopPropagation={true}/>
				<span style={{width: "100%"}}>{layer.getDescription()}</span>
				<button className="ui button" title={Weave.lang("Edit layer")} style={{alignSelf: "flex-end", whiteSpace: "nowrap"}} onClick={(e: React.MouseEvent) => { this.setState({ selectedLayer: layer, openedLayer: layer }); e.stopPropagation() } }>
					{" > "}
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

	/* TODO: Add drag-and-drop of layers. */
	render():JSX.Element
	{
		let flex1: React.CSSProperties = { flex: 1 };

		let addLayerMenuItem = (layerClass:new()=>AbstractLayer):IMenuButtonItem => {
			return {
				label: weavejs.WeaveAPI.ClassRegistry.getDisplayName(layerClass),
				onClick: () => this.props.layers.requestObject('', layerClass)
			};
		};

		if (!this.state.openedLayer)
		{
			var layerTypes = [TileLayer, GeometryLayer, LabelLayer, ScatterPlotLayer, ImageGlyphLayer];

			return <VBox className="weave-padded-vbox">
				<label>{Weave.lang("Layers")}</label>
				<VBox className="weave-container" style={{overflowY: "scroll", width: "100%" }}>
							{this.props.layers.getObjects().reverse().map(this.generateItem)}
				</VBox>
				<HBox className="weave-padded-hbox">
					<MenuButton style={flex1} items={layerTypes.map(addLayerMenuItem)}>
						<i className="fa fa-plus"/>
					</MenuButton>
					<Button style={flex1} disabled={!(this.state.selectedLayer) } onClick={this.removeSelected}><i className="fa fa-minus"/></Button>
					<Button style={flex1} disabled={!(this.state.selectedLayer && this.selectionIndex < this.props.layers.getObjects().length - 1)} 
							onClick={this.moveSelectedUp}><i className="fa fa-arrow-up"/></Button>
					<Button style={flex1} disabled={!(this.state.selectedLayer && this.selectionIndex > 0)} onClick={this.moveSelectedDown}> <i className="fa fa-arrow-down"/></Button>
				</HBox>
			</VBox>
		}
		else
		{
			return <VBox>
				<HBox>
					<Button onClick={() => this.setState({ selectedLayer: this.state.selectedLayer, openedLayer: null}) }>
						<i className="fa fa-arrow-left"/>
					</Button>
					{Weave.lang("Layer: {0}", this.props.layers.getName(this.state.openedLayer))}
				</HBox>
				{this.state.selectedLayer.renderEditor()}
			</VBox>;
		}
	}
}

interface IMenuButtonItem {
	label: string;
	onClick: React.MouseEventHandler;
}

interface IMenuButtonProps extends React.HTMLProps<MenuButton>
{
	items: IMenuButtonItem[];
}

interface IMenuButtonState { };

class MenuButton extends React.Component<IMenuButtonProps,IMenuButtonState> {
	private dropdownInstance: React.ReactInstance;
	private button: HTMLButtonElement

	closePopup=():void=>
	{
		if (this.dropdownInstance) {
			ReactUtils.closePopup(this.dropdownInstance);
			this.dropdownInstance = null;
		}
	}

	renderItem(value:IMenuButtonItem, index:number)
	{
		let newOnClick = (e:React.MouseEvent) => {
			this.closePopup();
			value.onClick(e);
		}
		return <div className="weave-menuitem" onClick={newOnClick} key={index.toString() }>
			{value.label}
		</div>;
	}

	openPopup=():void=>
	{
		let rect = this.button.getBoundingClientRect();
		this.dropdownInstance = ReactUtils.openPopup(
			<div className="weave-menu" style={{position: "absolute", top: rect.bottom, left: rect.left}}>
				{this.props.items.map(this.renderItem, this)}
			</div>, true
		);
	}

	render():JSX.Element
	{
		let props = _.clone(this.props);
		delete props.children;
		delete props.items;
		delete props.style;
		delete props.onClick;

		return <button className="ui button" style={_.merge({ position: "relative" }, this.props.style) } ref={(c) => this.button = c} onClick={this.openPopup} {...props as any}>
			{this.props.children}
		</button>;
	}
}
