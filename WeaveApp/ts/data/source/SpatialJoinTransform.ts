import * as weavejs from "weavejs";
import * as ol from "openlayers";
import proj4 from "../../modules/proj4";
import * as _ from "lodash";
import {WeaveAPI} from "weavejs";
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import IDataSource = weavejs.api.data.IDataSource;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import LinkableString = weavejs.core.LinkableString;
import ColumnUtils = weavejs.data.ColumnUtils;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ProxyColumn = weavejs.data.column.ProxyColumn;
import StringColumn = weavejs.data.column.StringColumn;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
import DataSourceUtils = weavejs.data.DataSourceUtils;
import ArrayUtils = weavejs.util.ArrayUtils;
import JS = weavejs.util.JS;
import StandardLib = weavejs.util.StandardLib;
import AbstractDataSource = weavejs.data.source.AbstractDataSource;
import Geometry = ol.geom.Geometry;
import Feature = ol.Feature;
import IColumnReference = weavejs.api.data.IColumnReference;
import Vector = ol.source.Vector;
import GeoJSON = ol.format.GeoJSON;

export default class SpatialJoinTransform extends AbstractDataSource implements ISelectableAttributes
{
	public geometryColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	public xColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	public yColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	public pointProjection:LinkableString = Weave.linkableChild(this, LinkableString);
	private _source:Vector;
	private _parser:GeoJSON;

	public get isLocal():boolean
	{
		return !DataSourceUtils.hasRemoteColumnDependencies(this);
	}

	/* Output dataType is determined by the geometryColumn input. */
	/* Output keyType is determined by the xColumn/yColumn input. */

	public get selectableAttributes():Map<string, (weavejs.api.data.IColumnWrapper|weavejs.api.core.ILinkableHashMap)>
	{
		return new Map()
			.set("Join Geometry", this.geometryColumn)
			.set("Datapoint X", this.xColumn)
			.set("Datapoint Y", this.yColumn);
	}

	constructor()
	{
		super();
		this._source = new Vector({});
		this._parser = new GeoJSON();
	}

	protected initialize(forceRefresh:Boolean = false):void
	{
		super.initialize(true);
	}

	public getHierarchyRoot():IWeaveTreeNode&IColumnReference
	{
		if (!this._rootNode)
		{
			this._rootNode = new ColumnTreeNode({
				dataSource: this,
				data: this,
				"label": this.getLabel,
				hasChildBranches: false,
				children: [
					this.generateHierarchyNode({})
				]
			});
		}
		return this._rootNode;
	}

	protected generateHierarchyNode(metadata:{[property:string]:string}):IWeaveTreeNode
	{
		metadata[ColumnMetadata.TITLE] = ColumnUtils.getTitle(this.geometryColumn);
		metadata[ColumnMetadata.KEY_TYPE] = this.xColumn.getMetadata(ColumnMetadata.KEY_TYPE);
		metadata[ColumnMetadata.DATA_TYPE] = this.geometryColumn.getMetadata(ColumnMetadata.KEY_TYPE);
		return new ColumnTreeNode({
			dataSource: this,
			idFields: [],
			data: metadata
		});
	}

	protected requestColumnFromSource(proxyColumn:ProxyColumn):void
	{
		var metadata:Object = proxyColumn.getProxyMetadata();

		var geomKeys:IQualifiedKey[] = this.geometryColumn.keys;
		var rawGeometries:JSON[] = weavejs.data.ColumnUtils.getGeoJsonGeometries(this.geometryColumn, this.geometryColumn.keys);
		var key:IQualifiedKey;
		var feature:Feature;

		this._source.clear();

		for (var idx:int = 0; idx < geomKeys.length; idx++)
		{
			var rawGeom:JSON = rawGeometries[idx];
			key = geomKeys[idx] as IQualifiedKey;

			var geometry:Geometry = this._parser.readGeometry(rawGeom,
				{
					dataProjection: ol.proj.get(this.geometryColumn.getMetadata(ColumnMetadata.PROJECTION)),
					featureProjection: ol.proj.get(this.pointProjection.value)
				}
			);

			if (geometry.getExtent().some(_.isNaN))
			{
				console.error("Dropping feature", key, "due to containing NaN coordinates. Possibly misconfigured projection?");
				continue;
			}

			feature = new Feature(geometry);
			feature.setId(key);
			this._source.addFeature(feature);
		}

		var keys:IQualifiedKey[] = [];
		var data:any[] = [];
		for (key of ArrayUtils.union(this.xColumn.keys, this.yColumn.keys))
		{
			var x:number = this.xColumn.getValueFromKey(key, Number);
			var y:number = this.yColumn.getValueFromKey(key, Number);

			var features:Feature[] = this._source.getFeaturesAtCoordinate([x,y]);

			for (feature of features)
			{
				var featureKey:IQualifiedKey = feature.getId();
				keys.push(key);
				data.push(featureKey.localName);
			}
		}

		var column:StringColumn = new StringColumn(metadata);

		column.setRecords(keys, data);
		proxyColumn.setInternalColumn(column);
	}
}
//var IDataSource_Service:Class = IDataSource;
//WeaveAPI.ClassRegistry.registerImplementation(IDataSource_Service, SpatialJoinTransform, "Spatial Join Transform");
WeaveAPI.ClassRegistry.registerImplementation(IDataSource, SpatialJoinTransform, "Spatial Join Transform");