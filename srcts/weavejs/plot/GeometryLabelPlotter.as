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
	import setSessionState = weavejs.api.setSessionState;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotter = weavejs.api.ui.IPlotter;
	import SessionManager = weavejs.core.SessionManager;
	import ReprojectedGeometryColumn = weavejs.data.column.ReprojectedGeometryColumn;
	import SortedKeySet = weavejs.data.key.SortedKeySet;
	import GeneralizedGeometry = weavejs.primitives.GeneralizedGeometry;

	/**
	 * This plotter is for drawing text labels on the map, corresponding to a geometry column.
	 */
	public class GeometryLabelPlotter extends TextGlyphPlotter implements IObjectWithDescription
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryLabelPlotter, "Geometry labels");

		public function GeometryLabelPlotter()
		{
			// hide dataX,dataY because they don't need to be shown in the session state.
			(WeaveAPI.SessionManager as SessionManager).excludeLinkableChildFromSessionState(this, dataX);
			(WeaveAPI.SessionManager as SessionManager).excludeLinkableChildFromSessionState(this, dataY);
			hideOverlappingText.value = true;

			// set up x,y columns to be derived from the geometry column
			Weave.linkState(geometryColumn, dataX.requestLocalObject(ReprojectedGeometryColumn, true));
			Weave.linkState(geometryColumn, dataY.requestLocalObject(ReprojectedGeometryColumn, true));
			
			_sortCopyKeys = SortedKeySet.generateSortCopyFunction([getGeometryArea, sortColumn, text], [-1, 1, 1]);
			_filteredKeySet.setColumnKeySources([geometryColumn, sortColumn, text], null, _sortCopyKeys);
			this.addSpatialDependencies(this.geometryColumn);
		}
		
		override public function getDescription():String
		{
			return geometryColumn.getDescription();
		}
		
		public const geometryColumn:ReprojectedGeometryColumn = Weave.linkableChild(this, ReprojectedGeometryColumn);
		
		private var _sortCopyKeys:Function;
		
		private function getGeometryArea(key:IQualifiedKey):Number
		{
			try
			{
				var geom:GeneralizedGeometry = geometryColumn.getValueFromKey(key, Array)[0] as GeneralizedGeometry;
				return geom.bounds.getArea();
			}
			catch (e:Error)
			{
				// we don't care if this fails
			}
			return NaN;
		}
		
		// backwards compatibility 0.9.6
		[Deprecated(replacement="geometryColumn")] public function set geometry(value:Object):void
		{
			Weave.setState(geometryColumn.internalDynamicColumn, value);
		}
	}
}
