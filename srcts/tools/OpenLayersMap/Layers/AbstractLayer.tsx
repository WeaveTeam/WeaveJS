import WeavePath = weavejs.path.WeavePath;
import * as React from "react";

import OpenLayersMapTool from "../../OpenLayersMapTool";
import * as lodash from "lodash";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableString = weavejs.core.LinkableString;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import WeaveAPI = weavejs.WeaveAPI;

import StatefulTextField from "../../../ui/StatefulTextField";
import StatefulComboBox from "../../../ui/StatefulComboBox";
import StatefulCheckBox from "../../../ui/StatefulCheckBox";
import {linkReactStateRef} from "../../../utils/WeaveReactUtils";
import SelectableAttributeComponent from "../../../ui/SelectableAttributeComponent";
import ReactUtils from "../../../utils/ReactUtils";

export type EditableField = [
	LinkableBoolean|LinkableString|LinkableNumber,
	(string | {label: string, value: any })[]
] | LinkableVariable;

export default class AbstractLayer implements ILinkableObject
{
	opacity = Weave.linkableChild(this, new LinkableNumber(1));
	visible = Weave.linkableChild(this, new LinkableBoolean(true));
	selectable = Weave.linkableChild(this, new LinkableBoolean(true));

	private projectionSRS: LinkableString; /* A reference to the parent's projectionSRS LinkableString */

	private renderEditableField(value:EditableField, key:string):[string, JSX.Element]
	{
		let lv: LinkableVariable;
		let options: (string|{ label: string, value: any })[];
		if (value instanceof LinkableVariable)
		{
			lv = value;
			options = [];
		}
		else if (Array.isArray(value))
		{
			lv = value[0];
			options = value[1];
		}

		if (lv instanceof LinkableString || lv instanceof LinkableNumber)
		{
			if (typeof options[0] === typeof "") {
				return [Weave.lang(key), <StatefulTextField key={key} ref={linkReactStateRef(this, { content: lv }) } suggestions={options as string[]} />];
			}
			else if (typeof options[0] === typeof {}) {
				return [Weave.lang(key), <StatefulComboBox key={key} ref={linkReactStateRef(this, { value: lv }) } options={options}/>];
			}
			else
			{
				return [Weave.lang(key), <StatefulTextField key={key} ref={linkReactStateRef(this, { value: lv }) }/>];
			}
		}
		else
		{
			return [Weave.lang(key), <StatefulCheckBox key={key} ref={linkReactStateRef(this, { checked: lv }) }/>];
		}		
	}

	renderEditor(): JSX.Element {
		let attributeList: JSX.Element[] = [];
		let idx = 0;

		for (let [key, value] of this.selectableAttributes) {
			attributeList.push(<SelectableAttributeComponent attribute={value} label={Weave.lang(key)}/>)
		}

		let fieldList:[string, JSX.Element][] = [];
		let table: JSX.Element;
		this.editableFields.forEach((value, key) => {fieldList.push(this.renderEditableField(value,key));});

		return <div>
			{attributeList}
			{ReactUtils.generateTable(null, fieldList)}
		</div>;
	}

	get editableFields()
	{
		return new Map<string,EditableField>();
	}

	get selectableAttributes()
	{
		return new Map<string,DynamicColumn>();
	}

	constructor()
	{
		WeaveAPI.Scheduler.callLater(this, this.registerUpdateProjection);
	}

	registerUpdateProjection():void
	{
		let parent = Weave.getAncestor(this, OpenLayersMapTool);
		if (!parent)
		{
			WeaveAPI.Scheduler.callLater(this, this.registerUpdateProjection);
			return;
		}

		this.projectionSRS = parent.projectionSRS;
		this.projectionSRS.addGroupedCallback(this, this.updateProjection, true);
	}

	/*abstract*/ updateProjection(): void {}

	private _parent: OpenLayersMapTool = null;

	get parent(): OpenLayersMapTool
	{
		return this._parent;
	}

	set parent(mapTool: OpenLayersMapTool)
	{
		this._parent = mapTool;
	}


	private _source: ol.source.Source;

	get source():ol.source.Source
	{
		return this._source;
	}

	set source(value:ol.source.Source)
	{

		this._source = value;

		if (!this.olLayer)
		{
			WeaveAPI.Scheduler.callLater(this, () => { this.source = value });
			return;
		}

		this.olLayer.setSource(value);
	}

	private _olLayer: ol.layer.Layer = null;

	/* Handles initial apply of linked properties, adding/removing from map */

	set olLayer(value:ol.layer.Layer)
	{
		if (!this.parent)
		{
			WeaveAPI.Scheduler.callLater(this, () => { this.olLayer = value });
			return;
		}
		if (value)
		{
			this._olLayer = value;
			this.parent.map.addLayer(value);

			this.opacity.addGroupedCallback(this, () => value.set("opacity", this.opacity.value), true);
			this.visible.addGroupedCallback(this, () => value.set("visible", this.visible.value), true);
			this.selectable.addGroupedCallback(this, () => value.set("selectable", this.selectable.value), true);
			let index = this.parent.layers.getObjects().indexOf(this);
			value.setZIndex(index + 2);

			value.set("layerObject", this); /* Need to store this backref */
		}
	}

	get olLayer():ol.layer.Layer
	{
		return this._olLayer;
	}

	get outputProjection():string
	{
		return (this.projectionSRS && this.projectionSRS.value) || (this.parent && this.parent.getDefaultProjection()) || OpenLayersMapTool.DEFAULT_PROJECTION;
	}

	getDescription():string
	{
		let name = (Weave.getOwner(this) as LinkableHashMap).getName(this);
		return name;
	}

	dispose()
	{
		if (this._olLayer != null)
		{
			this.parent.map.removeLayer(this._olLayer);
		}
	}
}
