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

namespace weavejs.data.column
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IWeaveGeometryTileService = weavejs.api.net.IWeaveGeometryTileService;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryStreamDecoder = weavejs.geom.GeometryStreamDecoder;
	import KDTree = weavejs.geom.KDTree;
	import ZoomBounds = weavejs.geom.ZoomBounds;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import JSByteArray = weavejs.util.JSByteArray;
	import StandardLib = weavejs.util.StandardLib;
	import WeavePromise = weavejs.util.WeavePromise;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	
	/**
	 * StreamedGeometryColumn
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.StreamedGeometryColumn", interfaces: [IAttributeColumn]})
	export class StreamedGeometryColumn extends AbstractAttributeColumn
	{
		public static debug:boolean = false;
		
		constructor(metadataTileDescriptors:JSByteArray, geometryTileDescriptors:JSByteArray, tileService:IWeaveGeometryTileService, metadata:IColumnMetadata = null)
		{
			super(metadata);
			
			this._tileService = Weave.linkableChild(this, tileService);
			Weave.getCallbacks(this._tileService).addDisposeCallback(this, this.handleTileServiceDispose);
			
			this._geometryStreamDecoder.keyType = metadata.keyType;
			
			// handle tile descriptors
			WeaveAPI.Scheduler.callLater(this._geometryStreamDecoder, this._geometryStreamDecoder.decodeMetadataTileList, [metadataTileDescriptors]);
			WeaveAPI.Scheduler.callLater(this._geometryStreamDecoder, this._geometryStreamDecoder.decodeGeometryTileList, [geometryTileDescriptors]);
			
			this.boundingBoxCallbacks.addImmediateCallback(this, () => {
				if (StreamedGeometryColumn.debug)
					DebugUtils.debugTrace(this,'boundingBoxCallbacks', this.boundingBoxCallbacks, this.keys.length,'keys');
			});
			this.addImmediateCallback(this, () => {
				if (StreamedGeometryColumn.debug)
					DebugUtils.debugTrace(this, this.keys.length,'keys');
			});
		}

		private handleTileServiceDispose():void
		{
			if (StreamedGeometryColumn.debug)
				DebugUtils.debugTrace(this, 'tile service disposed');
			Weave.dispose(this);
		}
		
		public get boundingBoxCallbacks():ICallbackCollection
		{
			return this._geometryStreamDecoder.metadataCallbacks;
		}
		
		/* override */ public getMetadata(propertyName:string):string
		{
			return super.getMetadata(propertyName);
		}
		
		/**
		 * This is a list of unique keys this column defines values for.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			return this._geometryStreamDecoder.keys;
		}
		
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return this._geometryStreamDecoder.getGeometriesFromKey(key) != null;
		}
		
		/**
		 * @return The Array of geometries associated with the given key (if dataType not specified).
		 */
		/* override */ public getValueFromKey<T>(key:IQualifiedKey, dataType:Class<T>=null):GeneralizedGeometry[]|T
		{
			var value:GeneralizedGeometry[]|T = this._geometryStreamDecoder.getGeometriesFromKey(key);
			
			// cast to different types
			if (dataType as any == Boolean)
				value = Weave.IS(value, Array) as any;
			else if (dataType as any == Number)
			{
				var sum:number = Weave.IS(value, Array) ? 0 : NaN;
				for (var geom of (value as GeneralizedGeometry[]) || [])
					sum += geom.bounds.getArea();
				value = sum as any;
			}
			else if (dataType as any == String)
				value = value ? 'Geometry(' + key.keyType + '#' + key.localName + ')' : undefined as any;
			
			return value as GeneralizedGeometry[]|T;
		}
		
		public get collectiveBounds():Bounds2D
		{
			return this._geometryStreamDecoder.collectiveBounds;
		}
		
		/**
		 * This function returns true if the column is still downloading tiles.
		 * @return True if there are tiles still downloading.
		 */
		public isStillDownloading():boolean
		{
			return this._metadataStreamDownloadCounter > 0
				|| this._geometryStreamDownloadCounter > 0;
		}
		
		private _tileService:IWeaveGeometryTileService;
		private /* readonly */ _geometryStreamDecoder:GeometryStreamDecoder = Weave.linkableChild(this, GeometryStreamDecoder);
		
		private _geometryStreamDownloadCounter:int = 0;
		private _metadataStreamDownloadCounter:int = 0;
		
		
		public metadataTilesPerQuery:int = 200; //10;
		public geometryTilesPerQuery:int = 200; //30;
		
		public requestAllMetadata():void
		{
			var mode:string = StreamedGeometryColumn.metadataRequestMode;
			StreamedGeometryColumn.metadataRequestMode = StreamedGeometryColumn.METADATA_REQUEST_MODE_ALL;
			this.requestGeometryDetail(this.collectiveBounds, Infinity);
			StreamedGeometryColumn.metadataRequestMode = mode;
		}
		
		public requestGeometryDetail(dataBounds:Bounds2D, lowestImportance:number):void
		{
			//JS.log("requestGeometryDetail",dataBounds,lowestImportance);
			if (dataBounds == null || isNaN(lowestImportance))
				return;
			
			// don't bother downloading if we know the result will be empty
			if (dataBounds.isEmpty())
				return;
			
			var metaRequestBounds:Bounds2D;
			var metaRequestImportance:number;
			switch (StreamedGeometryColumn.metadataRequestMode)
			{
				case StreamedGeometryColumn.METADATA_REQUEST_MODE_ALL:
					metaRequestBounds = this._geometryStreamDecoder.collectiveBounds;
					metaRequestImportance = 0;
					break;
				case StreamedGeometryColumn.METADATA_REQUEST_MODE_XY:
					metaRequestBounds = dataBounds;
					metaRequestImportance = 0;
					break;
				case StreamedGeometryColumn.METADATA_REQUEST_MODE_XYZ:
					metaRequestBounds = dataBounds;
					metaRequestImportance = lowestImportance;
					break;
			}
			// request metadata tiles
			var metadataTileIDs:any[] = this._geometryStreamDecoder.getRequiredMetadataTileIDs(metaRequestBounds, metaRequestImportance, true); // TODO
			// request geometry tiles needed for desired dataBounds and zoom level (filter by XYZ)
			var geometryTileIDs:any[] = this._geometryStreamDecoder.getRequiredGeometryTileIDs(dataBounds, lowestImportance, true); // TODO

			if (StreamedGeometryColumn.debug)
			{
				if (metadataTileIDs.length > 0)
					console.log(this, "requesting metadata tiles: " + metadataTileIDs);
				if (geometryTileIDs.length > 0)
					console.log(this, "requesting geometry tiles: " + geometryTileIDs);
			}
			
			var query:WeavePromise<JSByteArray>;
			// make requests for groups of tiles
			while (metadataTileIDs.length > 0)
			{
				query = this._tileService.getMetadataTiles(metadataTileIDs.splice(0, this.metadataTilesPerQuery));
				query.then((result:JSByteArray) => this.handleMetadataStreamDownload(result), (error:Object) => this.handleMetadataDownloadFault(error));
				
				this._metadataStreamDownloadCounter++;
			}
			// make requests for groups of tiles
			while (geometryTileIDs.length > 0)
			{
				query = this._tileService.getGeometryTiles(geometryTileIDs.splice(0, this.geometryTilesPerQuery));
				query.then((result:JSByteArray) => this.handleGeometryStreamDownload(result), (error:Object) => this.handleGeometryDownloadFault(error));
				this._geometryStreamDownloadCounter++;
			} 
		}
		
		private handleMetadataDownloadFault(error:Object):void
		{
			if (!this.wasDisposed)
				console.error(error);
			//JS.log("handleDownloadFault",token,ObjectUtil.toString(event));
			this._metadataStreamDownloadCounter--;
		}
		private handleGeometryDownloadFault(error:Object):void
		{
			if (!this.wasDisposed)
				JS.error(error);
			//JS.log("handleDownloadFault",token,ObjectUtil.toString(event));
			this._geometryStreamDownloadCounter--;
		}

		private static _tempDataBounds:Bounds2D;
		private static _tempScreenBounds:Bounds2D;

		public requestGeometryDetailForZoomBounds(zoomBounds:ZoomBounds):void
		{
			if (!StreamedGeometryColumn._tempDataBounds)
				StreamedGeometryColumn._tempDataBounds = new Bounds2D();
			if (!StreamedGeometryColumn._tempScreenBounds)
				StreamedGeometryColumn._tempScreenBounds = new Bounds2D();
			
			zoomBounds.getDataBounds(StreamedGeometryColumn._tempDataBounds);
			zoomBounds.getScreenBounds(StreamedGeometryColumn._tempScreenBounds);
			var minImportance:number = StreamedGeometryColumn._tempDataBounds.getArea() / StreamedGeometryColumn._tempScreenBounds.getArea();
			
			var requestedDataBounds:Bounds2D = StreamedGeometryColumn._tempDataBounds;
			var requestedMinImportance:number = minImportance;
			if (requestedDataBounds.isUndefined())// if data bounds is empty
			{
				// use the collective bounds from the geometry column and re-calculate the min importance
				requestedDataBounds = this.collectiveBounds;
				requestedMinImportance = requestedDataBounds.getArea() / StreamedGeometryColumn._tempScreenBounds.getArea();
			}
			// only request more detail if requestedDataBounds is defined
			if (!requestedDataBounds.isUndefined())
				this.requestGeometryDetail(requestedDataBounds, requestedMinImportance);
		}
		
		private reportNullResult(token:Object):void
		{
			console.error("Did not receive any data from service for geometry column.", token);
		}
		
		private _totalDownloadedSize:int = 0;

		private handleMetadataStreamDownload(result:JSByteArray):void
		{
			this._metadataStreamDownloadCounter--;
			
			if (result == null)
			{
				this.reportNullResult(this);
				return;
			}
			
			this._totalDownloadedSize += result.length;
			//JS.log("handleMetadataStreamDownload "+result.length,"total bytes "+_totalDownloadedSize);

			// when decoding finishes, run callbacks
			this._geometryStreamDecoder.decodeMetadataStream(result);
		}
		
		private handleGeometryStreamDownload(result:JSByteArray):void
		{
			this._geometryStreamDownloadCounter--;

			if (result == null)
			{
				this.reportNullResult(this);
				return;
			}

			this._totalDownloadedSize += result.length;
			//JS.log("handleGeometryStreamDownload "+result.length,"total bytes "+_totalDownloadedSize);

			// when decoding finishes, run callbacks
			this._geometryStreamDecoder.decodeGeometryStream(result);
		}
		
		public static /* readonly */ METADATA_REQUEST_MODE_ALL:string = 'all';
		public static /* readonly */ METADATA_REQUEST_MODE_XY:string = 'xy';
		public static /* readonly */ METADATA_REQUEST_MODE_XYZ:string = 'xyz';
		public static get metadataRequestModeEnum():string[]
		{
			return [
				StreamedGeometryColumn.METADATA_REQUEST_MODE_ALL,
				StreamedGeometryColumn.METADATA_REQUEST_MODE_XY,
				StreamedGeometryColumn.METADATA_REQUEST_MODE_XYZ
			];
		}
		
		/**
		 * This mode determines which metadata tiles will be requested based on what geometry data is requested.
		 * Possible request modes are:<br>
		 *    all -> All metadata tiles, regardless of requested X-Y-Z range <br>
		 *    xy -> Metadata tiles contained in the requested X-Y range, regardless of Z range <br>
		 *    xyz -> Metadata tiles contained in the requested X-Y-Z range only <br>
		 */
		public static metadataRequestMode:string = StreamedGeometryColumn.METADATA_REQUEST_MODE_XYZ;
		
		/**
		 * This is the minimum bounding box screen area in pixels required for a geometry to be considered relevant.
		 * Should be >= 1.
		 */		
		public static geometryMinimumScreenArea:number = 1;
		
		public static test_kdtree(weave:Weave, iterations:int = 10):Object
		{
			var cols:StreamedGeometryColumn[] = WeaveAPI.SessionManager.getLinkableDescendants(weave.root, StreamedGeometryColumn);
			for (var sgc of cols)
				return sgc.test_kdtree(iterations);
			return "No StreamedGeometryColumn to test";
		}
		
		public test_kdtree(iterations:int = 10):Object
		{
			var todo:any[]/*[number[], GeneralizedGeometry]*/ = []; // TODO
			for (var geom of this._geometryStreamDecoder.geometries)
			{
				var bounds:Bounds2D = geom.bounds;
				var key = [bounds.getXNumericMin(), bounds.getYNumericMin(), bounds.getXNumericMax(), bounds.getYNumericMax(), bounds.getArea()];
				todo.push([key, geom]);
			}
			
			// ------
			
			var results:int[] = [];
			for (var i:int = 0; i < iterations; i++)
			{
				ArrayUtils.randomSort(todo);
				var t:int = Date.now();
				var kdtree:KDTree<GeneralizedGeometry> = new KDTree<GeneralizedGeometry>(5);
				for ([key, geom] of todo)
					kdtree.insert(key, geom);
				t = Date.now() - t;
				Weave.dispose(kdtree);
				results.push(t);
			}
			
			return {
				node_count: todo.length,
				times_in_ms: results.join(', '),
				time_mean_ms: StandardLib.mean(results),
				time_min_ms: Math.min.apply(null, results),
				time_max_ms: Math.max.apply(null, results)
			};
		}
	}
}
