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

namespace weavejs.geom
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryType = weavejs.geom.GeometryType;
	import KDTree = weavejs.geom.KDTree;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JSByteArray = weavejs.util.JSByteArray;
	import StandardLib = weavejs.util.StandardLib;

	/**
	 * This class provides functions for parsing a binary geometry stream.
	 * The callbacks for this object get called when all queued decoding completes.
	 * 
	 * Throughout the code, an ID refers to an integer value, while a Key is a string value.
	 * Binary format:
	 *   tile descriptor format: [float minImportance, float maxImportance, double xMin, double yMin, double xMax, double yMax]
	 *       stream tile format: [int negativeTileID, negative streamVersion or binary stream object beginning with positive int, ...]
	 *   metadata stream object: [int geometryID, String geometryKey, '\0', double xMin, double yMin, double xMax, double yMax, int vertexID1, ..., int vertexID(n), int -1 if no shapeType follows or -2 if shapeType follows, int optionalShapeType]
	 *   geometry stream object: [int geometryID1, int vertexID1, ..., int geometryID(n-1), int vertexID(n-1), int geometryID(n), int negativeVertexID(n), double x, double y, float importance]
	 *   geometry stream marker: [int geometryID1, int vertexID1, ..., int geometryID(n), int vertexID(n), int -1]
	 *   geometry stream marker: [int geometryID, int vertexID_begin, int -2, int vertexID_end]
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.geom.GeometryStreamDecoder"})
	export class GeometryStreamDecoder implements ILinkableObject
	{
		public static debug:boolean = false;
		public totalGeomTiles:int = 0;
		public totalVertices:int = 0;
		
		private streamVersion:int = 0;
		
		constructor()
		{
			if (GeometryStreamDecoder.debug)
				Weave.getCallbacks(this).addImmediateCallback(this, ():void => { console.log(this.totalGeomTiles,'geomTiles,', this.totalVertices, 'vertices'); });
		}
		
		/**
		 * This is an Array of GeneralizedGeometry objects that have been decoded from a stream.
		 */
		public geometries:GeneralizedGeometry[] = [];
		
		/**
		 * This is the bounding box containing all tile boundaries.
		 */
		public collectiveBounds:Bounds2D = new Bounds2D();
		
		/**
		 * This function sets the keyType of the keys that will be
		 * added as a result of downloading the geometries.
		 */		
		public set keyType(value:string)
		{
			this._keyType = value;
		}

		private _keyType:string = null;

		/**
		 * This is the set of geometry keys that have been decoded so far.
		 */
		public /* readonly */ keys:IQualifiedKey[] = [];
		
		/**
		 * These callbacks get called when the keys or bounds change.
		 */
		public /* readonly */ metadataCallbacks:ICallbackCollection = Weave.linkableChild(this, CallbackCollection);

		/**
		 * This object maps a key to an array of geometries.
		 */
		private /* readonly */ map_key_geoms = new Map<IQualifiedKey, GeneralizedGeometry[]>();

		
		/**
		 * @param geometryKey A String identifier.
		 * @return An Array of GeneralizedGeometry objects with keys matching the specified key. 
		 */
		public getGeometriesFromKey(geometryKey:IQualifiedKey):GeneralizedGeometry[]
		{
			return this.map_key_geoms.get(geometryKey);
		}

		/**
		 * metadataTiles & geometryTiles
		 * These are 6-dimensional trees of tiles that are available and have not been downloaded yet.
		 * The dimensions are minImportance, maxImportance, xMin, yMin, xMax, yMax.
		 * The objects contained in the KDNodes are integers representing tile ID numbers.
		 */
		private /* readonly */ metadataTiles:KDTree<TileDescriptor> = Weave.disposableChild(this, new KDTree<TileDescriptor>(GeometryStreamDecoder.KD_DIMENSIONALITY));
		private /* readonly */ geometryTiles:KDTree<TileDescriptor> = Weave.disposableChild(this, new KDTree<TileDescriptor>(GeometryStreamDecoder.KD_DIMENSIONALITY));
		
		/**
		 * (KDTree, int) -> TileDescriptor
		 */
		private /* readonly */ tileLookup:Dictionary2D<KDTree<TileDescriptor>, int, TileDescriptor> = new Dictionary2D<KDTree<TileDescriptor>, int, TileDescriptor>();

		// TODO these should be static variables
		/**
		 * These constants define indices in a KDKey corresponding to the different KDTree dimensions.
		 */
		private static /* readonly */ XMIN_INDEX:int = 0;
		private static /* readonly */ YMIN_INDEX:int = 1;
		private static /* readonly */ XMAX_INDEX:int = 2;
		private static /* readonly */ YMAX_INDEX:int = 3;
		private static /* readonly */ IMAX_INDEX:int = 4;
		private static /* readonly */ KD_DIMENSIONALITY:int = 5;
		/**
		 * These KDKey arrays are created once and reused to avoid unnecessary creation of objects.
		 */
		private /* readonly */ minKDKey = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity];
		private /* readonly */ maxKDKey = [Infinity, Infinity, Infinity, Infinity, Infinity];
		
		/**
		 * These functions return an array of tiles that need to be downloaded in
		 * order for shapes to be displayed at the given importance (quality) level.
		 * Tiles that have already been decoded from a stream will not be returned.
		 * @return A list of tiles, sorted descending by maxImportance.
		 */
		public getRequiredMetadataTileIDs(bounds:Bounds2D, minImportance:number, removeTilesFromList:boolean):number[]
		{
			return this.getRequiredTileIDs(this.metadataTiles, bounds, minImportance, removeTilesFromList);
		}
		public getRequiredGeometryTileIDs(bounds:Bounds2D, minImportance:number, removeTilesFromList:boolean):number[]
		{
			return this.getRequiredTileIDs(this.geometryTiles, bounds, minImportance, removeTilesFromList);
		}
		
		private _filterTiles(tile:TileDescriptor):boolean
		{
			return !tile.exclude;
		}
		private _tileToId(tile:TileDescriptor):int
		{
			return tile.tileID;
		}

		private _getMaxImportance(tile:TileDescriptor):number
		{
			return tile.kdKey[GeometryStreamDecoder.IMAX_INDEX];
		}
		
		private getRequiredTileIDs(tileTree:KDTree<TileDescriptor>, bounds:Bounds2D, minImportance:number, removeTilesFromList:boolean):number[]
		{
			//console.log("getRequiredTileIDs, minImportance="+minImportance);
			// filter out tiles with maxImportance less than the specified minImportance
			this.minKDKey[GeometryStreamDecoder.IMAX_INDEX] = minImportance;
			// set the minimum query values for xMax, yMax
			this.minKDKey[GeometryStreamDecoder.XMAX_INDEX] = bounds.getXNumericMin();
			this.minKDKey[GeometryStreamDecoder.YMAX_INDEX] = bounds.getYNumericMin();
			// set the maximum query values for xMin, yMin
			this.maxKDKey[GeometryStreamDecoder.XMIN_INDEX] = bounds.getXNumericMax();
			this.maxKDKey[GeometryStreamDecoder.YMIN_INDEX] = bounds.getYNumericMax();
			
			var tiles:TileDescriptor[] = tileTree.queryRange(this.minKDKey, this.maxKDKey, true) as TileDescriptor[];
			tiles = tiles.filter(this._filterTiles);
			StandardLib.sortOn(tiles, this._getMaxImportance, -1);
			
			if (removeTilesFromList)
				for (var tile of tiles || [])
					tile.exclude = true;
			
			return tiles.map(this._tileToId);
		}

		/**
		 * This function will decode a tile list stream.
		 * @param stream A list of metadata tiles encoded in a ByteArray stream.
		 */
		public  decodeMetadataTileList(stream:JSByteArray):void
		{
			this.decodeTileList(this.metadataTiles, stream);
		}
		/**
		 * This function will decode a tile list stream.
		 * @param stream A list of geometry tiles encoded in a ByteArray stream.
		 */
		public decodeGeometryTileList(stream:JSByteArray):void
		{
			this.decodeTileList(this.geometryTiles, stream);
		}
		/**
		 * @private
		 */
		private decodeTileList(tileTree:KDTree<TileDescriptor>, stream:JSByteArray):void
		{
			var tiles:TileDescriptor[] = []; // array of descriptor objects containing kdKey and tileID
			// read tile descriptors from stream
			var tileID:int = 0;
			while (stream.position < stream.length)
			{
				var kdKey:number[] = new Array(GeometryStreamDecoder.KD_DIMENSIONALITY);
				kdKey[GeometryStreamDecoder.XMIN_INDEX] = stream.readDouble();
				kdKey[GeometryStreamDecoder.YMIN_INDEX] = stream.readDouble();
				kdKey[GeometryStreamDecoder.XMAX_INDEX] = stream.readDouble();
				kdKey[GeometryStreamDecoder.YMAX_INDEX] = stream.readDouble();
				kdKey[GeometryStreamDecoder.IMAX_INDEX] = stream.readFloat();
				if (stream.position > stream.length)
					throw new Error("Unexpected EOF in stream");
				if (GeometryStreamDecoder.debug)
					console.log((tileTree == this.metadataTiles ? "metadata tile" : "geometry tile") + " " + tileID + "[" + kdKey + "]");
				tiles.push(new TileDescriptor(kdKey, tileID));
				this.collectiveBounds.includeCoords(kdKey[GeometryStreamDecoder.XMIN_INDEX], kdKey[GeometryStreamDecoder.YMIN_INDEX]);
				this.collectiveBounds.includeCoords(kdKey[GeometryStreamDecoder.XMAX_INDEX], kdKey[GeometryStreamDecoder.YMAX_INDEX]);
				tileID++;
			}
			
			// randomize the order of tileDescriptors to avoid a possibly
			// poorly-performing KDTree structure due to the given ordering.
			ArrayUtils.randomSort(tiles);
			// insert tileDescriptors into tree
			for (var tile of tiles || [])
			{
				// insert a new node in the tree, mapping kdKey to tile
				tileTree.insert(tile.kdKey, tile);
				// save mapping from tile ID to TileDescriptor so it can be excluded later
				this.tileLookup.set(tileTree, tile.tileID, tile);
			}

			// collective bounds changed
			
			// Weave automatically triggers callbacks when all tasks complete
			if (!Weave.isBusy(this.metadataCallbacks))
				this.metadataCallbacks.triggerCallbacks();
		}

		private _projectionWKT:string = ""; // stores the well-known-text defining the projection
		
		
		/**
		 * This value specifies the type of the geometries currently being streamed
		 */
		
		private _currentGeometryType:string = GeometryType.POLYGON;
		private setGeometryType(value:string):void
		{
			if (this._currentGeometryType == value)
				return;
			
			this._currentGeometryType = value;
			
			//TEMPORARY SOLUTION -- copy type to all existing geometries
			for (var geom of this.geometries || [])
				if (geom != null)
					geom.geomType = value;
		}
		
		/**
		 * This extracts metadata from a ByteArray.
		 * Callbacks are triggered when all active decoding tasks are completed.
		 */
		public decodeMetadataStream(stream:JSByteArray):void
		{
			var task = (stopTime:int):number =>
			{
				//console.log("decodeMetadataStream",_queuedStreamDictionary[stream],hex(stream));
		    	// declare temp variables
				var flag:int;
				var byte:int;
				var vertexID:int;
				var geometry:GeneralizedGeometry;
				var geometryID:int;
				var key:IQualifiedKey;
				// read objects from stream
				while (stream.position < stream.length)
				{
					flag = stream.readInt();
					if (flag < 0) // flag is negativeTileID
					{
						var tileID:int = (-1 - flag); // decode negativeTileID
						var tile:TileDescriptor = this.tileLookup.get(this.metadataTiles, tileID);
						if (tile)
						{
							tile.exclude = true;
							
							flag = stream.readInt();
							if (flag < 0)
								this.streamVersion = -flag;
							else
								stream.position -= 4; // version 0; rewind

							if (GeometryStreamDecoder.debug)
								console.log("got metadata tileID=" + tileID + "; "+stream.position+'/'+stream.length);
						}
						else
						{
							// something went wrong
							// either the tileDescriptors were not requested yet,
							// or the service is returning incorrect data.
							console.error("ERROR! decodeMetadataStream(): tileID "+tileID+" is out of range");
							break;
						}
						
						// allow resuming later after finding a tileID.
						if (Date.now() > stopTime)
							return stream.position / stream.length;
					}
					else // flag is geometryID
					{
						geometryID = flag;
						// read geometry key (null-terminated string)
						key = WeaveAPI.QKeyManager.getQKey(this._keyType, this.readString(stream));
						// initialize geometry at geometryID
						geometry = Weave.AS(this.geometries[geometryID], GeneralizedGeometry);
						if (!geometry)
							this.geometries[geometryID] = geometry = new GeneralizedGeometry(this._currentGeometryType);
						// save mapping from key to geom
						var geomsForKey = this.map_key_geoms.get(key);
						if (!geomsForKey)
						{
							this.keys.push(key); // keep track of unique keys
							this.map_key_geoms.set(key, geomsForKey = []);
						}
						geomsForKey.push(geometry);
						// read bounds xMin, yMin, xMax, yMax
						geometry.bounds.setBounds(
								stream.readDouble(),
								stream.readDouble(),
								stream.readDouble(),
								stream.readDouble()
							);
						//console.log("got metadata: geometryID=" + flag + " key=" + key + " bounds=" + geometry.bounds);
						
						// read part markers
						var prev:int = 0;
						while (stream.position < stream.length)
						{
							vertexID = stream.readInt(); // read next vertexID
							//console.log("vID=",vertexID);
							if (vertexID < 0)
								break; // there are no more vertexIDs
							geometry.addPartMarker(prev, vertexID);
							prev = vertexID;
						}
						if (prev > 0)
							geometry.addPartMarker(prev, Number.MAX_VALUE);
						
						// if flag is < -1, it means the shapeType follows
						if (vertexID < -1)
						{
							this.readShapeType(stream);
							if (vertexID < -2)
								this._projectionWKT = this.readString(stream);
						}
					}
				}
	
				return 1; // done
			};
			
			// Weave automatically triggers callbacks when all tasks complete
			// high priority because metadata affects keys and keys are a prerequisite for many things
			WeaveAPI.Scheduler.startTask(this.metadataCallbacks, task, WeaveAPI.TASK_PRIORITY_HIGH);
		}
		
		private readShapeType(stream:JSByteArray):void
		{
			/*
			0 	Null Shape 	Empty ST_Geometry
			
			1 	Point 	ST_Point
			21 	PointM 	ST_Point with measures
			
			8 	MultiPoint 	ST_MultiPoint
			28 	MultiPointM 	ST_MultiPoint with measures
			
			3 	PolyLine 	ST_MultiLineString
			23 	PolyLineM 	ST_MultiLineString with measures
			
			5 	Polygon 	ST_MultiPolygon
			25 	PolygonM 	ST_MultiPolygon with measures
			*/
			var type:int = stream.readInt();
			//console.log("shapeType",flag);
			switch (type) // read shapeType
			{
				//Point
				case 1:
				case 21:
					//MultiPoint
				case 8:
				case 28:
					this.setGeometryType(GeometryType.POINT);
					break;
				//PolyLine
				case 3:
				case 23:
					this.setGeometryType(GeometryType.LINE);
					break;
				//Polygon
				case 5:
				case 25:
					this.setGeometryType(GeometryType.POLYGON);
					break;
				default:
			}
		}
		
		private readString(stream:JSByteArray):string
		{
			var start:int = stream.position;
			while (stream.position < stream.length)
			{
				var byte:int = stream.readByte();
				if (byte == 0) // if \0 char is found (end of string)
					break;
			}
			var end:int = stream.position - 1;
			stream.position = start;
			var str:string = stream.readUTFBytes(end - start);
			stream.position = end + 1;
			return str;
		}

		/**
		 * This extracts points from a ByteArray.
		 * Callbacks are triggered when all active decoding tasks are completed.
		 */
		public decodeGeometryStream(stream:JSByteArray):void
		{
			var task = (stopTime:int):number =>
			{
				//console.log("decodeGeometryStream",_queuedStreamDictionary[stream],hex(stream));
		    	// declare temp variables
				var i:int;
				var flag:int;
				var geometryID:int;
				var vertexID:int;
				var x:number, y:number, importance:number = 0;
				// read objects from stream
				while (stream.position < stream.length)
				{
					flag = stream.readInt();
					//console.log("flag",flag);
					if (flag < 0) // flag is negativeTileID
					{
						this.totalGeomTiles++;
						
						var tileID:int = (-1 - flag); // decode negativeTileID
						var tile:TileDescriptor = this.tileLookup.get(this.geometryTiles, tileID);
						if (tile)
						{
							tile.exclude = true;

							flag = stream.readInt();
							if (flag < 0)
								this.streamVersion = -flag;
							else
								stream.position -= 4; // version 0; rewind

							if (GeometryStreamDecoder.debug)
								console.log("got geometry tileID=" + tileID + "; "+stream.length);
						}
						else
						{
							// something went wrong
							// either the tileDescriptors were not requested yet,
							// or the service is returning incorrect data.
							console.error("ERROR! decodeGeometryStream(): tileID "+tileID+" is out of range");
							break;
						}
						
						// allow resuming later after finding a tileID.
						if (Date.now() > stopTime)
							return stream.position / stream.length;
					}
					else // flag is geometryID
					{
						this.totalVertices++;
						
						geometryID = flag;
						// reset lists of IDs
						GeometryStreamDecoder.geometryIDArray.length = 0;
						GeometryStreamDecoder.vertexIDArray.length = 0;
						GeometryStreamDecoder.geometryIDArray.push(geometryID); // save first geometryID
						while (stream.position < stream.length)
						{
							vertexID = stream.readInt(); // read vertexID for current geometryID
							if (vertexID < 0)
							{
								vertexID = (-1 - vertexID); // decode negativeVertexID
								GeometryStreamDecoder.vertexIDArray.push(vertexID); // save vertexID for previous geometryID
								break; // this was the last vertexID
							}
							GeometryStreamDecoder.vertexIDArray.push(vertexID); // save vertexID for previous geometryID
 							geometryID = stream.readInt(); // read next geometryID
							if (geometryID == -2) // polygon marker (v2) ?
								GeometryStreamDecoder.vertexIDArray.push(stream.readInt()); // read end-of-part vertexID
							if (geometryID < 0) // polygon marker (v1 or v2)?
								break;
							GeometryStreamDecoder.geometryIDArray.push(geometryID); // save next geometryID
						}
						
						if (geometryID < 0)
						{
							importance = geometryID; // used as flag for polygon marker
							if (GeometryStreamDecoder.vertexIDArray.length == 1)
								GeometryStreamDecoder.vertexIDArray.unshift(0);
						}
						else
						{
							//console.log("geomIDs",geometryIDArray);
							//console.log("vIDs",vertexIDArray);
							// read coordinates and importance value
							x = stream.readDouble();
							y = stream.readDouble();
							importance = stream.readFloat();
							//console.log("X,Y,I",[x,y,importance]);
						}

						// save vertex in all corresponding geometries
						for (i = GeometryStreamDecoder.geometryIDArray.length; i--;)
						{
							//console.log("geom "+geometryIDArray[i]+" insert "+vertexIDArray[i]+" "+importance+" "+x+" "+y);
							geometryID = GeometryStreamDecoder.geometryIDArray[i];
							vertexID = GeometryStreamDecoder.vertexIDArray[i];
							
							var geometry:GeneralizedGeometry = Weave.AS(this.geometries[geometryID], GeneralizedGeometry);
							if (!geometry)
								this.geometries[geometryID] = geometry = new GeneralizedGeometry(this._currentGeometryType);
							
							if (importance < 0) // part marker
								geometry.addPartMarker(vertexID, GeometryStreamDecoder.vertexIDArray[i + 1]);
							else
								geometry.addPoint(vertexID, importance, x, y);
						}
					}
				}
	            
				return 1; // done
			}
			
			// Weave automatically triggers callbacks when all tasks complete
			// low priority because the geometries can still be used even without all the detail.
			WeaveAPI.Scheduler.startTask(this, task, WeaveAPI.TASK_PRIORITY_NORMAL);
		}

		
		// reusable temporary objects to reduce GC activity
		private static /* readonly */ geometryIDArray:number[] = []; // temporary list of geometryIDs
		private static /* readonly */ vertexIDArray:number[] = []; // temporary list of vertexIDs
		
		/*
		private static function hex(bytes:JSByteArray):String
		{
			var p:int = bytes.pos;
			var h:String = '0123456789ABCDEF';
			var result:String = StandardLib.substitute('({0} bytes, pos={1})', bytes.length, p);
			bytes.pos = 0;
			while (bytes.bytesAvailable)
			{
				var b:int = bytes.readByte();
				result += h.charAt(b>>4) + h.charAt(b&15);
			}
			bytes.pos = p;
			return result;
		}
		*/
	}

	class TileDescriptor
	{
		constructor(kdKey:number[], tileID:int)
		{
			this.kdKey = kdKey;
			this.tileID = tileID;
		}

		public kdKey:number[];
		public tileID:int;
		public exclude:boolean = false;
	}
}
