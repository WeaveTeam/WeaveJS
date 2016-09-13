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

namespace weavejs.api.net
{
	; /* Added to work around bug in sourcemap generation */
	import JSByteArray = weavejs.util.JSByteArray;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import WeavePromise = weavejs.util.WeavePromise;
	/**
	 * This is an interface for requesting tiles for a streamed geometry collection.
	 * 
	 * @author adufilie
	 */
	export interface IWeaveGeometryTileService extends ILinkableObject
	{
		/**
		 * @return A WeavePromise which returns a JSByteArray
		 */
		getMetadataTiles(tileIDs:number[]):WeavePromise<weavejs.util.JSByteArray>;
		
		/**
		 * @return A WeavePromise which returns a JSByteArray
		 */
		getGeometryTiles(tileIDs:number[]):WeavePromise<weavejs.util.JSByteArray>;
	}
}
