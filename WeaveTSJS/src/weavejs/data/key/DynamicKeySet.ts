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
	import IDynamicKeySet = weavejs.api.data.IDynamicKeySet;
	import IKeySet = weavejs.api.data.IKeySet;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	
	/**
	 * This is a wrapper for a dynamically created object implementing IKeySet.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.DynamicKeySet", interfaces: [IDynamicKeyFilter, ILinkableDynamicObject, ICallbackCollection, IDisposableObject]})
	export class DynamicKeySet extends LinkableDynamicObject implements IDynamicKeySet
	{
		constructor()
		{
			super(IKeySet);
		}
		
		public getInternalKeySet():IKeySet
		{
			return Weave.AS(this.internalObject, IKeySet);
		}
	}
}
