namespace weavejs.tool.oltool.layer
{
	import WeavePath = weavejs.path.WeavePath;
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import StatefulRangeSlider = weavejs.ui.StatefulRangeSlider;
	import ComboBox = weavejs.ui.ComboBox;
	import Checkbox = weavejs.ui.Checkbox;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils
	import DynamicComponent = weavejs.ui.DynamicComponent;
	import SelectableAttributeComponent = weavejs.ui.SelectableAttributeComponent;
	import ReactUtils = weavejs.util.ReactUtils;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
	import WeaveAPI = weavejs.WeaveAPI;
	import Projections = weavejs.tool.oltool.Projections;

	export type EditableField = [
		LinkableBoolean|LinkableString|LinkableNumber,
		(string | {label: string, value: any })[]
	] | LinkableVariable | IFilteredKeySet;

	import Bounds2D = weavejs.geom.Bounds2D;
	import renderSelectableAttributes = weavejs.api.ui.renderSelectableAttributes;
	import IOpenLayersMap = weavejs.tool.oltool.IOpenLayersMap;

	export class AbstractLayer implements ILinkableObject
	{
		opacity = Weave.linkableChild(this, new LinkableNumber(1));
		visible = Weave.linkableChild(this, new LinkableBoolean(true));
		selectable = Weave.linkableChild(this, new LinkableBoolean(true));

		private projectionSRS: LinkableString; /* A reference to the parent's projectionSRS LinkableString */

		get deprecatedStateMapping(): Object
		{
			return {
				alpha: this.opacity
			};
		}

		getExtent():Bounds2D
		{
			return new Bounds2D();
		}

		public static selectableLayerFilter(layer: ol.layer.Base): boolean
		{
			return layer.get("selectable");
		}

		private renderEditableField(value:EditableField, key:string):[React.ReactChild, React.ReactChild]
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
			else if (Weave.IS(value, IFilteredKeySet)) {
				let fks = Weave.AS(value, IFilteredKeySet);
				return [
					Weave.lang(key),
					<DynamicComponent dependencies={[fks]} render={()=>
						<Checkbox key={key} label={" "} value={!fks.keyFilter.target}
							onChange={(value) => { fks.keyFilter.targetPath = value ? null : ['defaultSubsetKeyFilter'] } }/>
					}/>
				]
			}

			if (key == "Opacity")
			{
				return [
					Weave.lang(key),
					<StatefulRangeSlider valueFormat={(value) => " " + Math.round(value * 100) + "%"} min={0} max={1} step={0.01} style={{ display: "inline", width: "50px", verticalAlign: "middle" }} ref={WeaveReactUtils.linkReactStateRef(this, { value }) }/>
				]
			}

			if (lv instanceof LinkableString || lv instanceof LinkableNumber) {
				if (typeof options[0] === typeof "") {
					return [
						Weave.lang(key),
						<ComboBox key={key} ref={WeaveReactUtils.linkReactStateRef(this, { value: lv }) } options={options as string[]} />
					]; /* searchable field */
				}
				else if (typeof options[0] === typeof {}) {
					return [
						Weave.lang(key),
						<ComboBox key={key} ref={WeaveReactUtils.linkReactStateRef(this, { value: lv }) } options={options}/>
					];
				}
				else {
					return [
						Weave.lang(key),
						<StatefulTextField key={key} ref={WeaveReactUtils.linkReactStateRef(this, { value: lv }) }/>
					];
				}
			}
			else if (lv instanceof LinkableBoolean) {
				return [
					Weave.lang(key),
					<Checkbox key={key} ref={WeaveReactUtils.linkReactStateRef(this, { value: lv }) } label={" "}/>
				];
			}
			else return ["",""];
		}

		renderEditableFields(): React.ReactChild[][]
		{
			let fieldList: [React.ReactChild, React.ReactChild][] = [];

			this.editableFields.forEach((value, key) => {
				fieldList.push(this.renderEditableField(value, key)); 
			});
			return fieldList;
		}

		//todo:find a better way to pass pushCrumb
		renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null): JSX.Element =>{
			let attributeList: JSX.Element;
			let idx = 0;

			/*for (let [key, value] of this.selectableAttributes) {
				attributeList.push(<SelectableAttributeComponent key={key} attribute={value} label={Weave.lang(key)}/>)
			}*/

			return ReactUtils.generateTable({
				body: [].concat(
					renderSelectableAttributes(this.selectableAttributes, pushCrumb),
					this.renderEditableFields()
				),
				classes: {
					td: [
						"weave-left-cell",
						"weave-right-cell"
					]
				}
			});
		}

		get editableFields()
		{
			return new Map<string, EditableField>()
				.set("Opacity", this.opacity);
		}

		get selectableAttributes()
		{
			return new Map<string,IColumnWrapper>();
		}

		constructor()
		{
		}

		onLayerReady():void
		{
			let parent = Weave.getAncestor(this, IOpenLayersMap);
			this.projectionSRS = parent.projectionSRS;
			this.projectionSRS.addGroupedCallback(this, this.updateProjection, true);
		}

		/*abstract*/ updateProjection(): void {}

		parent: IOpenLayersMap = null;

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

		private addAndConfigureLayer()
		{
			let value = this.olLayer;
			this.parent.map.addLayer(value);

			this.opacity.addGroupedCallback(this, () => value.set("opacity", this.opacity.value), true);
			this.visible.addGroupedCallback(this, () => value.set("visible", this.visible.value), true);
			this.selectable.addGroupedCallback(this, () => value.set("selectable", this.selectable.value), true);
			let index = this.parent.layers.getObjects().indexOf(this);
			value.setZIndex(index + 2);

			value.set("layerObject", this); /* Need to store this backref */
			this.onLayerReady();
		}

		set olLayer(value:ol.layer.Layer)
		{
			if (!this.parent || !this.parent.map) {
				WeaveAPI.Scheduler.callLater(this, ()=>{this.olLayer = value});
				return;
			}

			if (value)
			{
				this._olLayer = value;
				this.addAndConfigureLayer();
			}
		}

		get olLayer():ol.layer.Layer
		{
			return this._olLayer;
		}

		get outputProjection():string
		{
			return (this.projectionSRS && this.projectionSRS.value) || (this.parent && this.parent.getDefaultProjection()) || Projections.DEFAULT_PROJECTION;
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
}
