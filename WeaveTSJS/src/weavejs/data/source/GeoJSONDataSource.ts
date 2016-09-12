/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */
namespace weavejs.data.source {
	import WeaveAPI = weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IDataSource = weavejs.api.data.IDataSource;
	import AbstractDataSource = weavejs.data.source.AbstractDataSource;
	import IDataSource_File = weavejs.api.data.IDataSource_File;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableFile = weavejs.core.LinkableFile;
	import LinkableString = weavejs.core.LinkableString;
	import GeometryColumn = weavejs.data.column.GeometryColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeoJSON = weavejs.geom.GeoJSON;
	import ResponseType = weavejs.net.ResponseType;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import JS = weavejs.util.JS;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	
	@Weave.classInfo({id: "weavejs.data.source.GeoJSONDataSource", label: "GeoJSON file", interfaces: [IDataSource]})
	export class GeoJSONDataSource extends AbstractDataSource
	{
		/*override*/ get isLocal():boolean
		{
			return this.url.isLocal;
		}

		/*override*/ public getLabel():string
		{
			return this.label.value || (this.url.value || '').split('/').pop() || super.getLabel();
		}
		
		public url:LinkableFile = Weave.linkableChild(this, new LinkableFile(null, null, ResponseType.JSON), this.handleFile);
		public keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public keyProperty:LinkableString = Weave.linkableChild(this, LinkableString);
		
		/**
		 * overrides the projection specified in the GeoJSON object.
		 */
		public projection:LinkableString = Weave.linkableChild(this, LinkableString);
		
		/**
		 * The GeoJSON data.
		 */
		private jsonData:GeoJSONDataSourceData = null;
		
		/**
		 * Gets the projection metadata used in the geometry column.
		 */
		public getProjection():string
		{
			return this.projection.value
				|| (this.jsonData ? this.jsonData.projection : null)
				|| "EPSG:4326";
		}
		/**
		 * Gets the keyType metadata used in the columns.
		 */
		
		public getPropertyNames():string[]
		{
			return (this.jsonData && this.jsonData.propertyNames) ? [].concat(this.jsonData.propertyNames) : [];
		}
		public getKeyType():string
		{
			var kt:string = this.keyType.value;
			if (!kt)
			{
				kt = this.url.value;
				if (this.keyProperty.value)
					kt += "#" + this.keyProperty.value;
			}
			return kt;
		}
		
		/*override*/ protected get initializationComplete():boolean
		{
			return super.initializationComplete && !Weave.isBusy(this.url) && !!this.jsonData;
		}
		
		/**
		 * This gets called as a grouped callback.
		 */		
		/*override*/ protected initialize(forceRefresh:boolean = false):void
		{
			this._rootNode = null;
			
			if (Weave.detectChange(this.initializeObserver, this.keyType, this.keyProperty))
			{
				if (this.jsonData)
					this.jsonData.resetQKeys(this.getKeyType(), this.keyProperty.value);
			}
			
			// recalculate all columns previously requested because data may have changed.
			super.initialize(true);
		}
		private initializeObserver = {};
		
		private handleFile():void
		{
			if (Weave.isBusy(this.url))
				return;
			
			this.jsonData = null;
			
			if (!this.url.result)
			{
				this.hierarchyRefresh.triggerCallbacks();
				
				if (this.url.error)
					JS.error(this.url.error);
				
				return;
			}
			
			try
			{
				var obj:Object = this.url.result;
				
				// make sure it's valid GeoJSON
				if (!GeoJSON.isGeoJSONObject(obj))
					throw new Error("Invalid GeoJSON file: " + this.url.value);
				
				// parse data
				this.jsonData = new GeoJSONDataSourceData(obj, this.getKeyType(), this.keyProperty.value);
				
				this.hierarchyRefresh.triggerCallbacks();
			}
			catch (e)
			{
				JS.error(e);
			}
		}
		
		/**
		 * Gets the root node of the attribute hierarchy.
		 */
		/*override*/ public getHierarchyRoot():IWeaveTreeNode & IColumnReference
		{
			if (!Weave.IS(this._rootNode, GeoJSONDataSourceNode))
			{
				var meta:IColumnMetadata = {};
				meta.title = this.getLabel();
				
				var rootChildren:(IWeaveTreeNode&IColumnReference)[] = [];
				if (this.jsonData)
				{
					// include empty string for the geometry column
					rootChildren = [''].concat(this.jsonData.propertyNames)
						.map((n:string, i:number, a:string[]) => { return this.generateHierarchyNode(n); })
						.filter((n:IWeaveTreeNode, i:number, a:IWeaveTreeNode[]) => { return n != null; });
				}
				
				this._rootNode = new GeoJSONDataSourceNode(this, meta, rootChildren);
			}
			return this._rootNode;
		}
		
		/*override*/ protected generateHierarchyNode(metadata:{[key:string]:string}|string):IWeaveTreeNode&IColumnReference
		{
			if (metadata == null || !this.jsonData)
				return null;
			
			if (Weave.IS(metadata, String))
			{
				var str:string = metadata as string;
				metadata = {};
				(metadata as {[key:string]:string})[GeoJSONDataSource.GEOJSON_PROPERTY_NAME] = str;
			}
			if (metadata && metadata.hasOwnProperty(GeoJSONDataSource.GEOJSON_PROPERTY_NAME))
			{
				metadata = this.getMetadataForProperty((metadata as {[key:string]:string})[GeoJSONDataSource.GEOJSON_PROPERTY_NAME] as string);
				return new GeoJSONDataSourceNode(this, metadata as {[key:string]:string}, null, [GeoJSONDataSource.GEOJSON_PROPERTY_NAME]);
			}
			
			return null;
		}

		/*override*/ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var propertyName:string = proxyColumn.getMetadata(GeoJSONDataSource.GEOJSON_PROPERTY_NAME);
			var metadata = this.getMetadataForProperty(propertyName);
			if (!metadata || !this.jsonData || (propertyName && this.jsonData.propertyNames.indexOf(propertyName) < 0))
			{
				proxyColumn.dataUnavailable();
				return;
			}
			proxyColumn.setMetadata(metadata);
			
			var dataType:string = metadata[ColumnMetadata.DATA_TYPE];
			if (dataType == DataType.GEOMETRY)
			{
				var qkeys:IQualifiedKey[] = [];
				var geoms:GeneralizedGeometry[] = [];
				var i:int = 0;
				var initGeoms:Function = (stopTime:int):Number=>
				{
					if (!this.jsonData)
					{
						proxyColumn.dataUnavailable();
						return 1;
					}
					for (; i < this.jsonData.qkeys.length; i++)
					{
						if (JS.now() > stopTime)
							return i / this.jsonData.qkeys.length;
						
						var geomsFromJson:GeneralizedGeometry[] = GeneralizedGeometry.fromGeoJson(this.jsonData.geometries[i]);
						for (var geom of geomsFromJson)
						{
							qkeys.push(this.jsonData.qkeys[i]);
							geoms.push(geom);
						}
					}
					return 1;
				}
				var setGeoms:Function = ():void=>
				{
					var gc:GeometryColumn = new GeometryColumn(metadata);
					gc.setRecords(qkeys, geoms);
					proxyColumn.setInternalColumn(gc);
				}
				// high priority because not much can be done without data
				WeaveAPI.Scheduler.startTask(proxyColumn, initGeoms, WeaveAPI.TASK_PRIORITY_HIGH, setGeoms);
			}
			else
			{
				var data:any[] = ArrayUtils.pluck(this.jsonData.properties, propertyName);
				var type:string = this.jsonData.propertyTypes[propertyName];
				if (type == 'number')
				{
					var nc:NumberColumn = new NumberColumn(metadata);
					nc.setRecords(this.jsonData.qkeys, data);
					proxyColumn.setInternalColumn(nc);
				}
				else
				{
					var sc:StringColumn = new StringColumn(metadata);
					sc.setRecords(this.jsonData.qkeys, data);
					proxyColumn.setInternalColumn(sc);
				}
			}
		}
		
		private getMetadataForProperty(propertyName:string):{[key:string]:string}
		{
			if (!this.jsonData)
				return null;
			
			var meta:{[key:string]:string} = null;
			if (!propertyName)
			{
				meta = {};
				meta[GeoJSONDataSource.GEOJSON_PROPERTY_NAME] = '';
				meta[ColumnMetadata.TITLE] = this.getGeomColumnTitle();
				meta[ColumnMetadata.KEY_TYPE] = this.getKeyType();
				meta[ColumnMetadata.DATA_TYPE] = DataType.GEOMETRY;
				meta[ColumnMetadata.PROJECTION] = this.getProjection();
			}
			else if (this.jsonData.propertyNames.indexOf(propertyName) >= 0)
			{
				meta = {};
				meta[GeoJSONDataSource.GEOJSON_PROPERTY_NAME] = propertyName;
				meta[ColumnMetadata.TITLE] = propertyName;
				meta[ColumnMetadata.KEY_TYPE] = this.getKeyType();
				
				if (propertyName == this.keyProperty.value)
					meta[ColumnMetadata.DATA_TYPE] = this.getKeyType();
				else
					meta[ColumnMetadata.DATA_TYPE] = this.jsonData.propertyTypes[propertyName];
			}
			return meta;
		}
		private static GEOJSON_PROPERTY_NAME:string = 'geoJsonPropertyName';
		
		private getGeomColumnTitle():string
		{
			return Weave.lang("{0} geometry", this.getLabel());
		}
	}
}
