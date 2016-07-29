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

namespace weavejs.plot
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotter = weavejs.api.ui.IPlotter;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import BLGNode = weavejs.geom.BLGNode;
	import Bounds2D = weavejs.geom.Bounds2D;
	import Point = weavejs.geom.Point;
	import KDTree = weavejs.geom.KDTree;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import Scheduler = weavejs.core.Scheduler;
	import GeometryUtils = weavejs.util.GeometryUtils;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
	import SimpleGeometry = weavejs.geom.SimpleGeometry;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;

	/**
	 * This class provides an interface to a collection of spatially indexed IShape objects.
	 * This class will not detect changes to the shapes you add to the index.
	 * If you change the bounds of the shapes, you will need to call SpatialIndex.createIndex().
	 */
	export class SpatialIndex implements ILinkableObject
	{
		public debug:boolean = false;
		
		public constructor()
		{
			this.callbacks = Weave.getCallbacks(this);
		}
		
		private callbacks:ICallbackCollection;
		
		private _kdTree = Weave.disposableChild(this, new KDTree<IQualifiedKey>(5));
		private _keysArray:IQualifiedKey[] = [];
		private _keyToBoundsMap:Map<IQualifiedKey, Bounds2D[]> = new Map();
		private _keyToGeometriesMap:Map<IQualifiedKey, (GeneralizedGeometry | ISimpleGeometry)[]> = new Map();
		
		private _restarted:boolean = false; // used by async code
		private _queryMissingBounds:boolean; // used by async code
		private _keysArrayIndex:int; // used by async code
		private _keysIndex:int; // used by async code
		private _plotter:IPlotter;//used by async code
		private _boundsArrayIndex:int; // used by async code
		private _boundsArray:Bounds2D[]; // used by async code
		
		/**
		 * These constants define indices in a KDKey corresponding to xmin,ymin,xmax,ymax,importance values.
		 */
		private XMIN_INDEX:int = 0;
		private YMIN_INDEX:int = 1;
		private XMAX_INDEX:int = 2;
		private YMAX_INDEX:int = 3;
		private IMPORTANCE_INDEX:int = 4;
		
		/**
		 * These KDKey arrays are created once and reused to avoid unnecessary creation of objects.
		 * The only values that change are the ones that are undefined here.
		 */
		private minKDKey:number[] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN, NaN, 0];
		private maxKDKey:number[] = [NaN, NaN, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
		
		// reusable temporary objects
		private _tempBoundsPolygon:[Point, Point, Point, Point, Point] = [new Point(), new Point(), new Point(), new Point(), new Point()]; // used by setTempBounds and getKeysGeometryOverlap

		/**
		 * This bounds represents the full extent of the shape index.
		 */
		public collectiveBounds:Bounds2D = new Bounds2D();
		
		/**
		 * This function gets a list of Bounds2D objects associated with a key.
		 * @param key A record key.
		 * @result An Array of Bounds2D objects associated with the key, or null if there are none.
		 */
		public getBoundsFromKey(key:IQualifiedKey):Bounds2D[]
		{
			return this._keyToBoundsMap.get(key);
		}

		/**
		 * The list of all the IQualifiedKey objects (record identifiers) referenced in this index.
		 */
		public get keys():IQualifiedKey[]
		{
			return this._keysArray;
		}

		/**
		 * This function fills the spatial index with the data bounds of each record in a plotter.
		 *
		 * @param plotter An IPlotter object to index.
		 * @param queryMissingBounds Set this to true to include records with undefined bounds in the spatial index.
		 */
		public createIndex(plotter:IPlotter, queryMissingBounds:boolean = false):void
		{
			if (this.debug)
				console.log(Weave.id(plotter), Weave.id(this), 'createIndex');

			this._plotter = plotter;
			this._queryMissingBounds = queryMissingBounds;
			this._restarted = true;

			this._iterateAll(-1); // restart from first task
			// normal priority because some things can be done without having a fully populated spatial index (?)
			WeaveAPI.Scheduler.startTask(this, this._iterateAll, WeaveAPI.TASK_PRIORITY_NORMAL, this.callbacks.triggerCallbacks, Weave.lang("Creating spatial index for {0}", Weave.className(plotter).split('.').pop()));
		}

		private _iterateAll:Function = Scheduler.generateCompoundIterativeTask(this._iterate0, this._iterate1, this._iterate2);

		private _iterate0():number
		{
			this._restarted = false;

			if (Weave.IS(this._plotter, IPlotterWithGeometries))
				this._keyToGeometriesMap = new Map();
			else
				this._keyToGeometriesMap = null;

			this._keysArray.length = 0; // hack to prevent callbacks
			this.clear();

			// make a copy of the keys vector
			if (this._plotter)
				ArrayUtils.copy(this._plotter.filteredKeySet.keys, this._keysArray);

			// randomize the order of the shapes to avoid a possibly poorly-performing
			// KDTree structure due to the given ordering of the records
			ArrayUtils.randomSort(this._keysArray);
			if (this.debug)
				console.log(Weave.id(this._plotter), Weave.id(this), 'keys', this._keysArray.length);

			return 1;
		}

		private _iterate1(stopTime:int):number
		{
			for (; this._keysIndex < this._keysArray.length; this._keysIndex++)
			{
				if (this._restarted)
					return 0;
				if (Date.now() > stopTime)
					return this._keysIndex / this._keysArray.length;

				var key:IQualifiedKey = this._keysArray[this._keysIndex] as IQualifiedKey;
				var boundsArray = this._keyToBoundsMap.get(key);
				if (!boundsArray)
					this._keyToBoundsMap.set(key, boundsArray = []);

				// this may trigger callbacks, which would cause us to skip the new key
				// at index 0 if we did not have _iterate0 as part of the async task
				this._plotter.getDataBoundsFromRecordKey(key, boundsArray);

				if (this._keyToGeometriesMap != null)
					this._keyToGeometriesMap.set(key, (this._plotter as IPlotterWithGeometries).getGeometriesFromRecordKey(key));
			}

			return this._restarted ? 0 : 1;
		}

		private _iterate2(stopTime:int):number
		{
			for (; this._keysArrayIndex < this._keysArray.length; this._keysArrayIndex++)
			{
				var key:IQualifiedKey = this._keysArray[this._keysArrayIndex] as IQualifiedKey;
				if (!this._boundsArray) // is there an existing nested array?
				{
					//trace(key.keyType,key.localName,'(',_keysArrayIndex,'/',_keysArray.length,')');
					// begin outer loop iteration
					this._boundsArray = this._keyToBoundsMap.get(key);

					if (!this._boundsArray)
						continue;

					this._boundsArrayIndex = 0;
				}
				for (; this._boundsArrayIndex < this._boundsArray.length; this._boundsArrayIndex++) // iterate on nested array
				{
					if (this._restarted)
						return 0;
					if (Date.now() > stopTime)
						return this._keysArrayIndex / this._keysArray.length;

					//trace('bounds(',_boundsArrayIndex,'/',_boundsArray.length,')');
					var bounds:Bounds2D = this._boundsArray[this._boundsArrayIndex] as Bounds2D;
					// do not index shapes with undefined bounds
					//TODO: index shapes with missing bounds values into a different index
					// TEMPORARY SOLUTION: store missing bounds if queryMissingBounds == true
					if (!bounds.isUndefined() || this._queryMissingBounds)
						this._kdTree.insert([bounds.getXNumericMin(), bounds.getYNumericMin(), bounds.getXNumericMax(), bounds.getYNumericMax(), bounds.getArea()], key);
					// always include bounds because it may have some coords defined while others aren't
					this.collectiveBounds.includeBounds(bounds);
				}
				// all done with nested array
				this._boundsArray = null;
			}

			return this._restarted ? 0 : 1;
		}

		/**
		 * This function empties the spatial index.
		 */
		public clear():void
		{
			this.callbacks.delayCallbacks();
			if (this.debug)
				console.log(Weave.id(this._plotter), Weave.id(this), 'clear');

			if (this._keysArray.length > 0)
				this.callbacks.triggerCallbacks();

			this._boundsArray = null;
			this._keysArrayIndex = 0;
			this._keysIndex = 0;
			this._keysArray.length = 0;
			this._kdTree.clear();
			this.collectiveBounds.reset();

			this.callbacks.resumeCallbacks();
		}

		private static polygonOverlapsPolyLine(polygon:{x:number, y:number}[], line:{x:number, y:number}[]):boolean
		{
			for (var i:int = 0; i < line.length - 1; ++i)
			{
				if (GeometryUtils.polygonOverlapsLine(polygon, line[i].x, line[i].y, line[i + 1].x, line[i + 1].y))
				{
					return true;
				}
			}

			return false;
		}
		private static polygonOverlapsPolyPoint(polygon:{x:number, y:number}[], points:{x:number, y:number}[]):boolean
		{
			for (var i:int = 0; i < points.length; ++i)
			{
				if (GeometryUtils.polygonOverlapsPoint(polygon, points[i].x, points[i].y))
					return true;
			}

			return false;
		}
		private static getMinimumUnscaledDistanceFromPolyLine(line:{x:number, y:number}[], x:number, y:number):number
		{
			var min:number = Number.POSITIVE_INFINITY;
			for (var i:int = 0; i < line.length - 1; ++i)
			{
				var distance:number = GeometryUtils.getUnscaledDistanceFromLine(line[i].x, line[i].y, line[i + 1].x, line[i + 1].y, x, y, true);
				min = Math.min(distance, min);
			}
			return min;
		}
		private static getMinimumUnscaledDistanceFromPolyPoint(points:{x:number, y:number}[], x:number, y:number):number
		{
			var min:number = Number.POSITIVE_INFINITY;
			for (var i:int = 0; i < points.length; ++i)
			{
				var distance:number = GeometryUtils.getDistanceFromPointSq(points[i].x, points[i].y, x, y);
				min = Math.min(distance, min);
			}
			return min;
		}
		/**
		 * This function will get the keys whose bounding boxes intersect with the given bounds.
		 *
		 * @param bounds A bounds used to query the spatial index.
		 * @param minImportance The minimum importance value imposed on the resulting keys.
		 * @return An array of keys.
		 */
		public getKeysBoundingBoxOverlap(bounds:Bounds2D, minImportance:number = 0):IQualifiedKey[]
		{
			// This is a filter for bounding boxes and should be used for getting fast results
			// during panning and zooming.

			// set the minimum query values for shape.bounds.xMax, shape.bounds.yMax
			this.minKDKey[this.XMAX_INDEX] = bounds.getXNumericMin(); // enforce result.XMAX >= query.xNumericMin
			this.minKDKey[this.YMAX_INDEX] = bounds.getYNumericMin(); // enforce result.YMAX >= query.yNumericMin
			this.minKDKey[this.IMPORTANCE_INDEX] = minImportance; // enforce result.IMPORTANCE >= minImportance
			// set the maximum query values for shape.bounds.xMin, shape.bounds.yMin
			this.maxKDKey[this.XMIN_INDEX] = bounds.getXNumericMax(); // enforce result.XMIN <= query.xNumericMax
			this.maxKDKey[this.YMIN_INDEX] = bounds.getYNumericMax(); // enforce result.YMIN <= query.yNumericMax

			//return _kdTree.queryRange(minKDKey, maxKDKey, true, IMPORTANCE_INDEX, KDTree.DESCENDING);
			return this._kdTree.queryRange(this.minKDKey, this.maxKDKey);
		}

		/**
		 * used by getKeysGeometryOverlap.
		 */
		private setTempBounds(bounds:Bounds2D):void
		{
			var b:Bounds2D = bounds as Bounds2D;
			var xMin:number = b.xMin;
			var yMin:number = b.yMin;
			var xMax:number = b.xMax;
			var yMax:number = b.yMax;
			this._tempBoundsPolygon[0].x = xMin; this._tempBoundsPolygon[0].y = yMin;
			this._tempBoundsPolygon[1].x = xMin; this._tempBoundsPolygon[1].y = yMax;
			this._tempBoundsPolygon[2].x = xMax; this._tempBoundsPolygon[2].y = yMax;
			this._tempBoundsPolygon[3].x = xMax; this._tempBoundsPolygon[3].y = yMin;
			this._tempBoundsPolygon[4].x = xMin; this._tempBoundsPolygon[4].y = yMin;
		}

		/**
		 * This function will get the keys whose geometries intersect with the given bounds.
		 *
		 * @param queryBounds A bounds used to query the spatial index.
		 * @param minImportance The minimum importance value to use when determining geometry overlap.
		 * @param filterBoundingBoxesByImportance If true, bounding boxes will be pre-filtered by importance before checking geometry overlap.
		 * @param dataBounds Used for simplifying geometries
		 * @return An array of keys.
		 */
		public getKeysGeometryOverlap(queryBounds:Bounds2D, minImportance:number = 0, filterBoundingBoxesByImportance:boolean = false, dataBounds:Bounds2D = null):IQualifiedKey[]
		{
			var keys = this.getKeysBoundingBoxOverlap(queryBounds, filterBoundingBoxesByImportance ? minImportance : 0);

			// if this index isn't for an IPlotterWithGeometries OR the user wants legacy probing
			if (this._keyToGeometriesMap == null/* || !WeaveProperties.getProperties(this).enableGeometryProbing.value*/)
				return keys;

			// if there are 0 keys
			if (keys.length == 0)
				return keys;

			// define the bounds as a polygon
			this.setTempBounds(queryBounds);

			var test:uint;
			var result:IQualifiedKey[] = [];

			// for each key, look up its geometries
			keyLoop: for (var i:int = keys.length; i--;)
			{
				var key:IQualifiedKey = keys[i];
				var geoms = this._keyToGeometriesMap.get(key);

				if (!geoms || geoms.length == 0) // geoms may be null if async task hasn't completed yet
				{
					result.push(key);
					continue;
				}

				// for each geometry, get vertices, check type, and do proper geometric overlap
				for (var iGeom:int = 0; iGeom < geoms.length; ++iGeom)
				{
					var overlapCount:int = 0;
					var geom:Object = geoms[iGeom];
					if (Weave.IS(geom, GeneralizedGeometry))
					{
						var genGeom:GeneralizedGeometry = geom as GeneralizedGeometry;
						var genGeomIsPoly:boolean = genGeom.isPolygon();
						var genGeomIsLine:boolean = genGeom.isLine();
						var simplifiedGeom = genGeom.getSimplifiedGeometry(minImportance, dataBounds);

						if (simplifiedGeom.length == 0 && genGeom.bounds.overlaps(queryBounds))
						{
							result.push(key);
							continue keyLoop;
						}

						// for each part, build the vertices polygon and check for the overlap
						for (var part of simplifiedGeom)
						{
							if (part.length == 0) // if no points, continue
								continue;

							// if a polygon, check for polygon overlap
							if (genGeomIsPoly)
							{
								test = GeometryUtils.polygonOverlapsPolygon(this._tempBoundsPolygon, part);
								if (test == GeometryUtils.CONTAINED_IN)
								{
									overlapCount++;
								}
								else if (test != GeometryUtils.NO_OVERLAP)
								{
									result.push(key);
									continue keyLoop;
								}
							}
							else if (genGeomIsLine)
							{
								if (SpatialIndex.polygonOverlapsPolyLine(this._tempBoundsPolygon, part))
								{
									result.push(key);
									continue keyLoop;
								}
							}
							else // point
							{
								if (SpatialIndex.polygonOverlapsPolyPoint(this._tempBoundsPolygon, part))
								{
									result.push(key);
									continue keyLoop;
								}
							}
						}
					}
					else // NOT a generalized geometry
					{
						var simpleGeom:ISimpleGeometry = geom as ISimpleGeometry;
						var simpleGeomIsPoly:boolean = simpleGeom.isPolygon();
						var simpleGeomIsLine:boolean = simpleGeom.isLine();
						// get its vertices
						var vertices:{x:number, y:number}[] = simpleGeom.getVertices();

						if (simpleGeomIsPoly)// a polygon, check for polygon overlap
						{
							if (GeometryUtils.polygonOverlapsPolygon(this._tempBoundsPolygon, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
						else if (simpleGeomIsLine) // if a line, check for bounds intersect line
						{
							if (SpatialIndex.polygonOverlapsPolyLine(this._tempBoundsPolygon, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
						else
						{
							if (SpatialIndex.polygonOverlapsPolyPoint(this._tempBoundsPolygon, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
					}

					if (overlapCount % 2)
					{
						result.push(key);
						continue keyLoop;
					}
				} // end for each (var geom...
			} // end for each (var key...

			return result;
		} // end function

		/**
		 * This function will get the keys closest the center of the bounds object. Generally this function will
		 * return an array of at most one key. Sometimes, it may return more than one key if there are multiple keys
		 * with equivalent distance to the center of the bounds object.
		 *
		 * @param queryBounds A bounds used to query the spatial index. It will be modified by constraining it to within the dataBounds.
		 * @param xPrecision If specified, X distance values will be divided by this and truncated before comparing.
		 * @param yPrecision If specified, Y distance values will be divided by this and truncated before comparing.
		 * @param dataBounds Used for simplifying geometries.
		 * @return An array of IQualifiedKey objects.
		 */
		public getClosestOverlappingKeys(queryBounds:Bounds2D, xPrecision:number, yPrecision:number, dataBounds:Bounds2D):IQualifiedKey[]
		{
			var xQueryCenter:number = queryBounds.getXCenter();
			var yQueryCenter:number = queryBounds.getYCenter();
			dataBounds.constrainBounds(queryBounds, false);
			var importance:number = xPrecision * yPrecision;
			var keys = this.getKeysGeometryOverlap(queryBounds, importance, false, dataBounds);

			// init local vars
			var closestDistanceSq:number = Infinity;
			var xDistance:number;
			var yDistance:number;
			var distanceSq:number;
			var recordBounds:Bounds2D;
			var foundQueryCenterOverlap:boolean = false; // true when we found a key that overlaps the center of the given bounds
			// begin with a result of zero shapes
			var result:IQualifiedKey[] = [];
			var resultCount:int = 0;
			for (var iKey:int = 0; iKey < keys.length; ++iKey)
			{
				var key:IQualifiedKey = keys[iKey];
				var overlapsQueryCenter:boolean = false;
				var geoms:(ISimpleGeometry | GeneralizedGeometry)[] = null;
				if (this._keyToGeometriesMap && WeaveProperties.getProperties(this).enableGeometryProbing.value)
					geoms = this._keyToGeometriesMap.get(key); // may be null if async task hasn't completed

				if (geoms) // the plotter is an IPlotterWithGeometries and the user wants geometry probing
				{
					for (var iGeom:int = 0; iGeom < geoms.length; ++iGeom)
					{
						var geom = geoms[iGeom] as SimpleGeometry | GeneralizedGeometry;
						xDistance = geom.bounds.getXCenter() - xQueryCenter;
						yDistance = geom.bounds.getYCenter() - yQueryCenter;
						if (!isNaN(xPrecision) && xPrecision != 0)
							xDistance = (xDistance / xPrecision) | 0;
						if (!isNaN(yPrecision) && yPrecision != 0)
							yDistance = (yDistance / yPrecision) | 0;
						var geomDistance:number = xDistance * xDistance + yDistance * yDistance;

						if (Weave.IS(geom, GeneralizedGeometry))
						{
							var genGeom = geom as GeneralizedGeometry;
							var genGeomIsPoly = genGeom.isPolygon();
							var genGeomIsLine = genGeom.isLine();
							var genGeomIsPoint = genGeom.isPoint();
							var simplifiedGeom = (geom as GeneralizedGeometry).getSimplifiedGeometry(importance, dataBounds);
							var overlapCount:int = 0;

							for (var part of simplifiedGeom)
							{
								if (genGeomIsPoly)
								{
									distanceSq = geomDistance;
									// if the polygon contains the point, this key is probably what we want
									if (GeometryUtils.polygonOverlapsPoint(part, xQueryCenter, yQueryCenter))
										overlapCount++;
								}
								else if (genGeomIsLine)
								{
									distanceSq = SpatialIndex.getMinimumUnscaledDistanceFromPolyLine(part, xQueryCenter, yQueryCenter);
									if (distanceSq <= Number.MIN_VALUE)
									{
										overlapsQueryCenter = true;
										break;
									}
								}
								else if (genGeomIsPoint)
								{
									distanceSq = SpatialIndex.getMinimumUnscaledDistanceFromPolyPoint(part, xQueryCenter, yQueryCenter);
									// give points priority since it's unlikely they will be exactly at the center of the query bounds
									overlapsQueryCenter = true;
									break;
								}
							}
							if (overlapCount % 2)
							{
								distanceSq = 0;
								overlapsQueryCenter = true;
							}

							// Consider all keys until we have found one that overlaps the query center.
							// Consider lines and points because although they may not overlap, it's very likely that no points or lines
							// will overlap. If we consider all of them, we can still find the closest.
							// After that, only consider keys that overlap query center.
							if (!foundQueryCenterOverlap || overlapsQueryCenter || genGeomIsLine || genGeomIsPoint)
							{
								// if this is the first record that overlaps the query center, reset the list of keys
								if (!foundQueryCenterOverlap && overlapsQueryCenter)
								{
									resultCount = 0;
									closestDistanceSq = Infinity;
									foundQueryCenterOverlap = true;
								}
								// if this distance is closer than any previous distance, clear all previous keys
								if (distanceSq < closestDistanceSq)
								{
									// clear previous result and update closest distance
									resultCount = 0;
									closestDistanceSq = distanceSq;
								}
								// add keys to the result if they are the closest so far
								if (distanceSq == closestDistanceSq && (resultCount == 0 || result[resultCount - 1] != key))
									result[resultCount++] = key;
							}
						}
						else
						{
							var simpleGeom = geom as SimpleGeometry;
							var simpleGeomIsPoly = simpleGeom.isPolygon();
							var simpleGeomIsLine = simpleGeom.isLine();
							var simpleGeomIsPoint = simpleGeom.isPoint();
							var vertices = simpleGeom.getVertices();

							// calculate the distanceSq and overlapsQueryCenter
							if (simpleGeomIsPoly)
							{
								if (GeometryUtils.polygonOverlapsPoint(vertices, xQueryCenter, yQueryCenter))
								{
									distanceSq = 0;
									overlapsQueryCenter = true;
								}
								else
								{
									distanceSq = geomDistance;
									overlapsQueryCenter = false;
								}
							}
							else if (simpleGeomIsLine)
							{
								distanceSq = SpatialIndex.getMinimumUnscaledDistanceFromPolyLine(vertices, xQueryCenter, yQueryCenter);
								overlapsQueryCenter = distanceSq <= Number.MIN_VALUE;
							}
							else if (simpleGeomIsPoint)
							{
								distanceSq = SpatialIndex.getMinimumUnscaledDistanceFromPolyPoint(vertices, xQueryCenter, yQueryCenter);
								// give points priority since it's unlikely they will be exactly at the center of the query bounds
								overlapsQueryCenter = true;
							}

							// Consider all keys until we have found one that overlaps the query center.
							// Consider lines and points because although they may not overlap, it's very likely that no points or lines
							// will overlap. If we consider all of them, we can still find the closest.
							// After that, only consider keys that overlap query center.
							if (!foundQueryCenterOverlap || overlapsQueryCenter || simpleGeomIsLine || simpleGeomIsPoint)
							{
								// if this is the first record that overlaps the query center, reset the list of keys
								if (!foundQueryCenterOverlap && overlapsQueryCenter)
								{
									resultCount = 0;
									closestDistanceSq = Infinity;
									foundQueryCenterOverlap = true;
								}
								// if this distance is closer than any previous distance, clear all previous keys
								if (distanceSq < closestDistanceSq)
								{
									// clear previous result and update closest distance
									resultCount = 0;
									closestDistanceSq = distanceSq;
								}
								// add keys to the result if they are the closest so far
								if (distanceSq == closestDistanceSq && (resultCount == 0 || result[resultCount - 1] != key))
									result[resultCount++] = key;
							}
						}
					} // geomLoop
				}
				else if (this._keyToBoundsMap.get(key)) // if the plotter wasn't an IPlotterWithGeometries or if the user wants the old probing
				{
					for (recordBounds of this._keyToBoundsMap.get(key))
					{
						// find the distance squared from the query point to the center of the shape
						xDistance = recordBounds.getXCenter() - xQueryCenter;
						yDistance = recordBounds.getYCenter() - yQueryCenter;
						if (!isNaN(xPrecision) && xPrecision != 0)
							xDistance = (xDistance / xPrecision) | 0;
						if (!isNaN(yPrecision) && yPrecision != 0)
							yDistance = (yDistance / yPrecision) | 0;
						distanceSq = xDistance * xDistance + yDistance * yDistance;

						overlapsQueryCenter = recordBounds.contains(xQueryCenter, yQueryCenter);

						// Consider all keys until we have found one that overlaps the query center.
						// After that, only consider keys that overlap query center.
						if (!foundQueryCenterOverlap || overlapsQueryCenter || recordBounds.isEmpty())
						{
							// if this is the first record that overlaps the query center, reset the list of keys
							if (!foundQueryCenterOverlap && overlapsQueryCenter)
							{
								resultCount = 0;
								closestDistanceSq = Infinity;
								foundQueryCenterOverlap = true;
							}
							// if this distance is closer than any previous distance, clear all previous keys
							if (distanceSq < closestDistanceSq)
							{
								// clear previous result and update closest distance
								resultCount = 0;
								closestDistanceSq = distanceSq;
							}
							// add keys to the result if they are the closest so far
							if (distanceSq == closestDistanceSq && (resultCount == 0 || result[resultCount - 1] != key))
								result[resultCount++] = key;
						}
					}
				} // if else
			} // keyLoop

			result.length = resultCount;
			return result;
		}

		/**
		 * This function will get the keys whose geometries intersect with the given array of geometries.
		 * This function call getKeysOverlapGeometry below for each element in the array.
		 * @param geometries an Array of ISimpleGeometry objects used to query the spatial index.
		 * @param minImportance The minimum importance value to use when determining geometry overlap.
		 * @param filterBoundingBoxesByImportance If true, bounding boxes will be pre-filtered by importance before checking geometry overlap.
		 * @return An array of IQualifiedKey objects.
		 **/


		public getKeysGeometryOverlapGeometries(geometries:ISimpleGeometry[], minImportance:number = 0, filterBoundingBoxesByImportance:boolean = false):IQualifiedKey[]
		{
			var keySet = new Set<IQualifiedKey>();
			for (var geometry of geometries || [])
			{
				var queriedKeys = this.getKeysGeometryOverlapGeometry(geometry, minImportance, filterBoundingBoxesByImportance);
				for (var key of queriedKeys || [])
					keySet.add(key);
			}
			return Array.from(keySet);
		}

		/**
		 * This function will get the keys whose geometries intersect with the given geometry.
		 *
		 * @param geometry An ISimpleGeometry object used to query the spatial index.
		 * @param minImportance The minimum importance value to use when determining geometry overlap.
		 * @param filterBoundingBoxesByImportance If true, bounding boxes will be pre-filtered by importance before checking geometry overlap.
		 * @return An array of IQualifiedKey objects.
		 */
		public getKeysGeometryOverlapGeometry(geometry:ISimpleGeometry, minImportance:number = 0, filterBoundingBoxesByImportance:boolean = false):IQualifiedKey[]
		{
			// first filter by bounds
			var queryGeomVertices:{x:number, y:number}[] = geometry.getVertices();
			var keys:IQualifiedKey[] = this.getKeysBoundingBoxOverlap((geometry as SimpleGeometry).bounds, filterBoundingBoxesByImportance ? minImportance : 0);

			var geomEnabled:boolean = this._keyToGeometriesMap && WeaveProperties.getProperties(this).enableGeometryProbing.value;

			var result:IQualifiedKey[] = [];
			var test:uint;

			// for each key, look up its geometries
			keyLoop: for (var i:int = keys.length; i--;)
			{
				var key:IQualifiedKey = keys[i];
				var overlapCount:int = 0;

				var geoms:(GeneralizedGeometry | ISimpleGeometry)[] = geomEnabled ? this._keyToGeometriesMap.get(key) : null;
				if (!geoms || geoms.length == 0)
				{
					var keyBounds:Bounds2D[] = this._keyToBoundsMap.get(key);
					for (var j:int = 0; j < keyBounds.length; j++)
					{
						this.setTempBounds(keyBounds[j]);
						test = GeometryUtils.polygonOverlapsPolygon(queryGeomVertices, this._tempBoundsPolygon);
						if (test == GeometryUtils.CONTAINED_IN)
						{
							overlapCount++;
						}
						else if (test != GeometryUtils.NO_OVERLAP)
						{
							result.push(key);
							continue keyLoop;
						}
					}
					if (overlapCount % 2)
						result.push(key);
					//iterate over bounds from key and check if they intersect lasso polygon
					continue;
				}

				// for each geometry, get vertices, check type, and do proper geometric overlap
				for (var iGeom:int = 0; iGeom < geoms.length; ++iGeom)
				{
					var geom:Object = geoms[iGeom];

					if (Weave.IS(geom, GeneralizedGeometry))
					{
						var genGeom:GeneralizedGeometry = geom as GeneralizedGeometry;
						var genGeomIsPoly:boolean = genGeom.isPolygon();
						var genGeomIsLine:boolean = genGeom.isLine();
						var simplifiedGeom = genGeom.getSimplifiedGeometry(minImportance/*, dataBounds*/);

						if (simplifiedGeom.length == 0)
						{
							//make the polygon
							this.setTempBounds((geom as GeneralizedGeometry).bounds);
							//check if the lasso polygon overlaps the geometry bounds
							if (GeometryUtils.polygonOverlapsPolygon(queryGeomVertices, this._tempBoundsPolygon))
							{
								result.push(key);
								continue keyLoop;
							}
						}

						// for each part, build the vertices polygon and check for the overlap
						for (var iPart:int = 0; iPart < simplifiedGeom.length; ++iPart)
						{
							// get the part
							var part = simplifiedGeom[iPart];
							if (part.length == 0) // if no points, continue
								continue;

							// if a polygon, check for polygon overlap
							if (genGeomIsPoly)
							{
								test = GeometryUtils.polygonOverlapsPolygon(queryGeomVertices, part);
								if (test == GeometryUtils.CONTAINED_IN)
								{
									overlapCount++;
								}
								else if (test != GeometryUtils.NO_OVERLAP)
								{
									result.push(key);
									continue keyLoop;
								}
							}
							else if (genGeomIsLine)
							{
								if (SpatialIndex.polygonOverlapsPolyLine(queryGeomVertices, part))
								{
									result.push(key);
									continue keyLoop;
								}
							}
							else // point
							{
								if (SpatialIndex.polygonOverlapsPolyPoint(queryGeomVertices, part))
								{
									result.push(key);
									continue keyLoop;
								}
							}
						}
					}
					else // NOT a generalized geometry
					{
						var simpleGeom:ISimpleGeometry = geom as ISimpleGeometry;
						var simpleGeomIsPoly:boolean = simpleGeom.isPolygon();
						var simpleGeomIsLine:boolean = simpleGeom.isLine();
						// get its vertices
						var vertices:{x:number, y:number}[] = simpleGeom.getVertices();

						if (simpleGeomIsPoly)// a polygon, check for polygon overlap
						{
							if (GeometryUtils.polygonOverlapsPolygon(queryGeomVertices, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
						else if (simpleGeomIsLine) // if a line, check for bounds intersect line
						{
							if (SpatialIndex.polygonOverlapsPolyLine(queryGeomVertices, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
						else
						{
							if (SpatialIndex.polygonOverlapsPolyPoint(queryGeomVertices, vertices))
							{
								result.push(key);
								continue keyLoop;
							}
						}
					}
					if (overlapCount % 2)
					{
						result.push(key);
						continue keyLoop;
					}
				} // end for each (var geom...
			} // end for each (var key...

			return result;
		}
	}
}
