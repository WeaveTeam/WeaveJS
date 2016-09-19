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
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import JS = weavejs.util.JS;
	import GeometryObject = GeoJSON.GeometryObject;

	/**
	 * GeneralizedGeometry
	 * A generalized geometry is one that lends itself to be displayed at different quality levels.
	 * The geometry coordinates may be inserted individually through the "coordinates" property,
	 * or they can all be processed at once through the setCoordinates() function.
	 * The bounds object is separate from the coordinates, so if coordinates are inserted individually,
	 * the bounds object should be updated accordingly if you want it to be accurate.
	 *
	 * @author adufilie
	 */
	export class GeneralizedGeometry
	{
		/**
		 * Create an empty geometry.
		 * @param geomType The type of the geometry (GeometryType.LINE, GeometryType.POINT, or GeometryType.POLYGON).
		 */
		constructor(geomType:string = "Polygon")
		{
			this.geomType = geomType;
			this.parts[0] = new BLGTree();
		}

		/**
		 * Derives GeneralizedGeometry objects from a GeoJSON geometry object.
		 * @param geoJsonGeom A GeoJSON geometry object.
		 * @return An array of GeneralizedGeometry objects
		 */
		public static fromGeoJson(geoJsonGeom:GeometryObject):GeneralizedGeometry[]
		{
			var type:string = geoJsonGeom.type;
			var coords:any[] = geoJsonGeom.coordinates;

			// convert coords to MultiPolygon format: multi[ poly[ line[ point[] ] ] ]
			if (type == GeoJSON.T_POINT)
				type = GeometryType.POINT, coords = /*multi*/[/*poly*/[/*line*/[/*point*/coords]]];
			else if (type == GeoJSON.T_MULTI_POINT)
				type = GeometryType.POINT, coords = /*multi*/[/*poly*/[/*line*/coords]];
			else if (type == GeoJSON.T_LINE_STRING)
				type = GeometryType.LINE, coords = /*multi*/[/*poly*/[/*line*/coords]];
			else if (type == GeoJSON.T_MULTI_LINE_STRING)
				type = GeometryType.LINE, coords = /*multi*/[/*poly line*/coords];
			else if (type == GeoJSON.T_POLYGON)
				type = GeometryType.POLYGON, coords = /*multi*/[/*poly*/coords];
			else if (type == GeoJSON.T_MULTI_POLYGON)
				type = GeometryType.POLYGON;

			var result:any[] = [];
			for (var poly of coords || [])
			{
				var geom:GeneralizedGeometry = new GeneralizedGeometry(type);
				var xyCoords:any[] = [];
				for (var part of poly || [])
				{
					// add part marker if this is not the first part
					if (xyCoords.length > 0)
						xyCoords.push(NaN, NaN);
					// push x,y coords
					for (var point of part || [])
						xyCoords.push(point[0], point[1]);
				}
				geom.setCoordinates(xyCoords, BLGTreeUtils.METHOD_SAMPLE);
				result.push(geom);
			}

			return result;
		}

		/**
		 * Generates a GeoJson Geometry object.
		 * @param minImportance No points with importance less than this value will be returned.
		 * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
		 * @return A GeoJson Geometry object, or null if there are no coordinates.
		 */
		public toGeoJson(minImportance:number = 0, visibleBounds:Bounds2D = null):GeometryObject
		{
			var type:string = GeometryType.toGeoJsonType(this.geomType, true); // Multi- geoms can represent non-Multi geoms
			var coords:any[] = [];
			var parts:BLGNode[][] = this.getSimplifiedGeometry(minImportance, visibleBounds);

			if (type == GeoJSON.T_MULTI_POINT)
			{
				for (var part of parts || [])
					for (var node of part || [])
						coords.push([node.x, node.y]);
			}
			else if (type == GeoJSON.T_MULTI_LINE_STRING)
			{
				for (var part of parts || [])
				{
					var lineString:number[][] = [];
					for (var node of part || [])
					{
						lineString.push([node.x, node.y]);
					}
					if (lineString.length)
						coords.push(lineString);
				}
			}
			else if (type == GeoJSON.T_MULTI_POLYGON)
			{
				var polygon:number[][][] = [];
				for (var part of parts || [])
				{
					var linearRing:number[][] = [];
					for (var node of part || [])
					{
						linearRing.push([node.x, node.y]);
					}

					// make sure it's a linear ring
					var first:number[] = linearRing[0];
					var last:number[] = linearRing[linearRing.length - 1];
					if (first && !(first[0] == last[0] && first[1] == last[1]))
						linearRing.push(first.concat());

					if (linearRing.length)
						polygon.push(linearRing);
				}
				if (polygon.length)
					coords.push(polygon);
			}
			
			if (!coords.length)
				return null;

			var geom:GeometryObject = {
				type,
				coordinates: coords
			};
			return geom;
		}

		/**
		 * Each of these integers corresponds to a vertexID that separates the current part from the next part.
		 * For example, partMarkers[0] is the vertexID that marks the end of part 0 and the start of part 1.
		 * If there are no part markers, it is assumed that there is only one part.
		 */
		private partMarkers:int[] = [];
		/**
		 * This maps BLGTree from the parts Array to a Boolean.
		 * If there are multiple parts in this geometry, only parts that map to values of true will be included in getSimplifiedGeometry() results.
		 */
		private map_blgTree_receivedPartMarker = new WeakMap<BLGTree, boolean>();
		/**
		 * These are the coordinates associated with the geometry.
		 * Each element in this vector is a separate part of the geometry.
		 * Each could be either a new polygon or a hole in a previous polygon.
		 */
		private parts:BLGTree[] = [];
		/**
		 * This is a bounding box for the geometry.
		 * It is useful for spatial indexing when not all the points are available yet.
		 */
		public bounds:Bounds2D = new Bounds2D();

		/**
		 * This is the type of the geometry.  Value should be one of the static geometry types listed in this class.
		 */
		public geomType:string;

		/**
		 * geometry types
		 */
		public isLine():boolean { return this.geomType == GeometryType.LINE; }
		public isPoint():boolean { return this.geomType == GeometryType.POINT; }
		public isPolygon():boolean { return this.geomType == GeometryType.POLYGON; }

		/**
		 * @return true if the geometry has no information on its individual coordinates.
		 */
		public get isEmpty():boolean
		{
			if (this.partMarkers.length > 0)
				return false;
			return this.parts[0].isEmpty;
		}

		/**
		 * @param minImportance No points with importance less than this value will be returned.
		 * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
		 * @return An Array of ISimpleGeometry objects
		 * @see weave.api.data.ISimpleGeometry
		 */
		public getSimpleGeometries(minImportance:number = 0, visibleBounds:Bounds2D = null, output:ISimpleGeometry[] = null):ISimpleGeometry[]
		{
			var result:ISimpleGeometry[] = output || [];
			var parts:BLGNode[][] = this.getSimplifiedGeometry(minImportance, visibleBounds);
			for (var i:int = 0; i < parts.length; i++)
			{
				var part:BLGNode[] = parts[i];
				var geom:ISimpleGeometry = result[i] || new SimpleGeometry(this.geomType); // re-use existing or create new
				geom.setVertices(ArrayUtils.copy(part, []));
				result[i] = geom;
			}
			return result;
		}

		/**
		 * @param minImportance No points with importance less than this value will be returned.
		 * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
		 * @return A vector of results from BLGTree.getPointVector(minImportance, visibleBounds) from each part.
		 */
		public getSimplifiedGeometry(minImportance:number = 0, visibleBounds:Bounds2D = null):BLGNode[][]
		{
			// if bounds is completely contained in visibleBounds, don't pass visibleBounds to getPointVector() (faster this way)
			if (visibleBounds && visibleBounds.containsBounds(this.bounds))
				visibleBounds = null;
			this._simplifiedParts.length = 0;
			var part:BLGTree;
			for (var i:int = 0; i < this.parts.length; i++)
			{
				part = this.parts[i];

				// skip this part if we're not sure it's actually a single part
				if (this.parts.length > 1 && !this.map_blgTree_receivedPartMarker.get(part))
					continue;

				var simplifiedPart:BLGNode[] = part.getPointVector(minImportance, visibleBounds);

				// skip parts without enough vertices
				if (simplifiedPart.length == 0)
					continue;
				if (simplifiedPart.length == 1 && this.geomType != GeometryType.POINT)
					continue;
				if (simplifiedPart.length == 2 && this.geomType == GeometryType.POLYGON)
					continue;

				this._simplifiedParts.push(simplifiedPart);
			}
			return this._simplifiedParts;
		}
		// _simplifiedParts: A place to store results from getSimplifiedGeometry()
		private _simplifiedParts:BLGNode[][] = [];

		/**
		 * Inserts a new point into the appropriate part of the geometry.
		 */
		public addPoint(vertexID:int, importance:number, x:number, y:number):void
		{
			var partID:int = ArrayUtils.binarySearch(this.partMarkers, vertexID, false);

			// special case - if this vertex is exactly at a part marker, it should go to the next part
			if (partID < this.partMarkers.length && this.partMarkers[partID] == vertexID)
				partID++;

			var part:BLGTree = this.parts[partID];
			part.insert(vertexID, importance, x, y);
		}

		/**
		 * Specifies a range of vertexIDs that correspond to a single part.
		 * @param beginIndex The index of the first vertex of a geometry part.
		 * @param endIndex The index after the last vertex of the geometry part.
		 */
		public addPartMarker(beginIndex:int, endIndex:int):void
		{
			// split BLG trees appropriately.
			this.splitAtIndex(beginIndex);
			this.splitAtIndex(endIndex);

			// find the corresponding part and mark it as received.
			var partID:int = ArrayUtils.binarySearch(this.partMarkers, endIndex, false);
			var part:BLGTree = this.parts[partID];
			this.map_blgTree_receivedPartMarker.set(part, true);
		}

		/**
		 * If necessary, this will split a BLGTree for a particular part into two and update the partMarkers.
		 */
		private splitAtIndex(vertexID:int):void
		{
			if (vertexID <= 0 || vertexID >= Number.MAX_VALUE || ArrayUtils.binarySearch(this.partMarkers, vertexID, true) >= 0)
				return;

			// partMarkers[i] marks the end of parts[i]
			for (var i:int = this.partMarkers.length; i > 0; i--)
			{
				if (vertexID > this.partMarkers[i - 1])
					break;

				this.partMarkers[i] = this.partMarkers[i - 1];
				this.parts[i + 1] = this.parts[i];
			}

			this.partMarkers[i] = vertexID;
			this.parts[i + 1] = this.parts[i].splitAtIndex(vertexID);
			// We don't have to worry about receivedPartMarkers here because if we need
			// to split an existing part it means we haven't received its partMarker yet.
		}

		/**
		 * This function assigns importance values to a list of coordinates and replaces the contents of the BLGTree.
		 * @param xyCoordinates An array of Numbers, even index values being x coordinates and odd index values being y coordinates.
		 *                      To indicate part markers, use a sequence of two NaN values.
		 */
		public setCoordinates(xyCoordinates:number[], method:string = "BLGTreeUtils.METHOD_SAMPLE"):void
		{
			// reset bounds and parts before processing coordinates
			this.bounds.reset();
			this.partMarkers.length = 0;
			this.parts.length = 1;

			var coordinates:BLGTree = this.parts[0];
			coordinates.clear();
			this.map_blgTree_receivedPartMarker.set(coordinates, true);

			var firstVertex:VertexChainLink = null;
			var newVertex:VertexChainLink;
			var x:number, y:number;
			var firstVertexID:int = 0;
			var ix:int = 0; // index of current x coordinate in xyCoordinates
			// point data doesn't apply to the generalization algorithm
			if (this.geomType == GeometryType.POINT)
			{
				for (; ix + 1 < xyCoordinates.length; ix += 2)
				{
					x = xyCoordinates[ix];
					y = xyCoordinates[ix + 1];
					coordinates.insert(ix / 2, Infinity, x, y);
					this.bounds.includeCoords(x, y);
				}
				return;
			}
			// process each part of the geometry (additional parts may be islands or lakes)
			while (ix + 1 < xyCoordinates.length) // while there is an x,y pair
			{
				// loop through coordinates
				var numPoints:int = 0;
				for (; ix + 1 < xyCoordinates.length; ix += 2)
				{
					x = xyCoordinates[ix];
					y = xyCoordinates[ix + 1];

					// check for part marker
					if (isNaN(x) && isNaN(y))
					{
						if (numPoints > 0)
						{
							ix += 2; // skip part marker
							break; // end of part
						}
						continue; // haven't seen beginning of part yet
					}

					// skip invalid points
					if (!isFinite(x) || !isFinite(y))
						continue;

					// create chain link for this coordinate
					newVertex = VertexChainLink.getUnusedInstance(firstVertexID + numPoints, x, y);
					if (numPoints == 0)
					{
						firstVertex = newVertex;
					}
					else
					{
						// don't add consecutive duplicate points
						if (newVertex.equals2D(firstVertex.prev))
						{
							VertexChainLink.saveUnusedInstance(newVertex);
							continue;
						}
						// stop adding points when the current coord is equal to the first coord
						if (newVertex.equals2D(firstVertex))
						{
							ix += 2; // make sure to skip this coord

							VertexChainLink.saveUnusedInstance(newVertex);
							break; // end of part
						}
						firstVertex.insert(newVertex);
					}
					// include this vertex in the geometry bounds
					this.bounds.includeCoords(x, y);
					numPoints++;
				}

				// end of part
				if (numPoints > 0)
				{
					// ARC: end points of a part are required points
					if (this.geomType == GeometryType.LINE && numPoints > 0)
					{
						firstVertex.importance = Infinity;
						firstVertex.prev.importance = Infinity;
					}

					if (firstVertexID > 0)
					{
						// create new part and add part marker
						coordinates = new BLGTree();
						this.map_blgTree_receivedPartMarker.set(coordinates, true);
						this.parts.push(coordinates);
						this.partMarkers.push(firstVertexID);
					}

					// assign importance values to points and save them
					BLGTreeUtils.buildBLGTree(firstVertex, coordinates, method);
				}

				// done copying points for this part, advance firstVertexID to after the current part
				firstVertexID += numPoints;
			}
		}
	}
}
