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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotter = weavejs.api.ui.IPlotter;
	import SessionManager = weavejs.core.SessionManager;
	import ReprojectedGeometryColumn = weavejs.data.column.ReprojectedGeometryColumn;
	import SortedKeySet = weavejs.data.key.SortedKeySet;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;

	/**
	 * This plotter is for drawing text labels on the map, corresponding to a geometry column.
	 */
	export class GeometryLabelPlotter extends TextGlyphPlotter implements IObjectWithDescription
	{
		public constructor()
		{
			// hide dataX,dataY because they don't need to be shown in the session state.
			(WeaveAPI.SessionManager as SessionManager).excludeLinkableChildFromSessionState(this, this.dataX);
			(WeaveAPI.SessionManager as SessionManager).excludeLinkableChildFromSessionState(this, this.dataY);
			this.hideOverlappingText.value = true;

			// set up x,y columns to be derived from the geometry column
			Weave.linkState(this.geometryColumn, this.dataX.requestLocalObject(ReprojectedGeometryColumn, true));
			Weave.linkState(this.geometryColumn, this.dataY.requestLocalObject(ReprojectedGeometryColumn, true));
			
			this._sortCopyKeys = SortedKeySet.generateSortCopyFunction([this.getGeometryArea, this.sortColumn, this.text], [-1, 1, 1]);
			this._filteredKeySet.setColumnKeySources([this.geometryColumn, this.sortColumn, this.text], null, this._sortCopyKeys);
			this.addSpatialDependencies(this.geometryColumn);
		}
		
		/*override*/ public getDescription():string
		{
			return this.geometryColumn.getDescription();
		}
		
		public geometryColumn:ReprojectedGeometryColumn = Weave.linkableChild(this, ReprojectedGeometryColumn);
		
		private _sortCopyKeys:Function;
		
		private getGeometryArea(key:IQualifiedKey):number
		{
			try
			{
				var geom:GeneralizedGeometry = this.geometryColumn.getValueFromKey(key, Array)[0] as GeneralizedGeometry;
				return geom.bounds.getArea();
			}
			catch (e)
			{
				// we don't care if this fails
			}
			return NaN;
		}
		
		// backwards compatibility 0.9.6
		/*[Deprecated(replacement="geometryColumn")] public set geometry(value:Object):void
		{
			Weave.setState(geometryColumn.internalDynamicColumn, value);
		}*/
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryLabelPlotter, "Geometry labels");
}

