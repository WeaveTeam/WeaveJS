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
	import ShpHeader = org.vanrijkom.shp.ShpHeader;
	import ShpPoint = org.vanrijkom.shp.ShpPoint;
	import ShpPolygon = org.vanrijkom.shp.ShpPolygon;
	import ShpPolyline = org.vanrijkom.shp.ShpPolyline;
	import ShpRecord = org.vanrijkom.shp.ShpRecord;
	import ShpTools = org.vanrijkom.shp.ShpTools;

	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryType = weavejs.geom.GeometryType;
	import JSByteArray = weavejs.util.JSByteArray;


	/**
	 * The callbacks for this object get called when all queued decoding completes.
	 *
	 * @author adufilie
	 * @author awilkins
	 */
	export class ShpFileReader implements ILinkableObject
	{
		static WEAVE_INFO = Weave.setClassInfo(ShpFileReader, {
			id: "weavejs.geom.ShpFileReader",
		});

		private shp: ShpHeader;

		private records:ShpRecord[];
		private irecord:number = 0;
		public geoms:GeneralizedGeometry[] = [];

		private _processingIsDone:boolean = false;
		public get geomsReady():boolean { return this._processingIsDone; }

		constructor(shpData:JSByteArray)
		{
			this.shp	= new ShpHeader(shpData);
			this.records = ShpTools.readRecords(shpData);
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this, this.iterate, WeaveAPI.TASK_PRIORITY_HIGH, this.asyncComplete);
		}

		private iterate(stopTime:number):number
		{
			for (; this.irecord < this.records.length; this.irecord++)
			{
				if (Date.now() > stopTime)
					return this.irecord / this.records.length;

				var iring:number;
				var ipoint:number;
				var point:ShpPoint;
				var ring:ShpPoint[];

				//trace( irecord, records.length );
				var geom:GeneralizedGeometry = new GeneralizedGeometry();
				var points:number[] = [];
				var record:ShpRecord = this.records[this.irecord] as ShpRecord;

				if( Weave.IS(record.shape, ShpPolygon) )
				{
					geom.geomType = GeometryType.POLYGON;
					var poly:ShpPolygon = Weave.AS(record.shape, ShpPolygon);
					for(iring = 0; iring < poly.rings.length; iring++ )
					{
						// add part marker if this is not the first part
						if (iring > 0)
							points.push(NaN, NaN);
						ring = poly.rings[iring];
						for(ipoint = 0; ipoint < ring.length; ipoint++ )
						{
							point = Weave.AS(ring[ipoint], ShpPoint);
							points.push( point.x, point.y );
						}
					}
				}
				if( Weave.IS(record.shape, ShpPolyline) )
					geom.geomType = GeometryType.LINE;
				if( Weave.IS(record.shape, ShpPoint) )
				{
					geom.geomType = GeometryType.POINT;
					point = Weave.AS(record.shape, ShpPoint);
					points.push( point.x, point.y );
				}
				if (points)
					geom.setCoordinates( points, BLGTreeUtils.METHOD_SAMPLE );
				this.geoms.push(geom);
			}
			return 1;
		}

		private asyncComplete():void
		{
			this._processingIsDone = true;
			Weave.getCallbacks(this).triggerCallbacks();
		}
	}
}