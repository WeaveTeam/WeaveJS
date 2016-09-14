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

namespace weavejs.data.key
{
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	
	/**
	 * This is a wrapper for a dynamically created object implementing IKeyFilter.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.DynamicKeyFilter", interfaces: [IDynamicKeyFilter, ILinkableDynamicObject, ICallbackCollection, IDisposableObject]})
	export class DynamicKeyFilter extends LinkableDynamicObject implements IDynamicKeyFilter
	{
		constructor()
		{
			super(IKeyFilter);
		}
		
		public getInternalKeyFilter():IKeyFilter
		{
			return Weave.AS(this.internalObject, IKeyFilter);
		}
	}
}
