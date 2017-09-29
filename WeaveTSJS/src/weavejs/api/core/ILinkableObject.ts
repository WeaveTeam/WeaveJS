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

namespace weavejs.api.core
{

	export interface NonArrayObject {
		length?:void,
		push?:void,
		pop?:void,
		concat?:void,
		join?:void,
		reverse?:void,
		shift?:void,
		slice?:void,
		splice?:void,
		unshift?:void,
		indexOf?:void,
		lastIndexOf?:void,
		every?:void,
		some?:void,
		forEach?:void,
		map?:void,
		filter?:void,
		reduce?:void,
		reduceRight?:void
	}

	/**
	 * An object that implements this empty interface has an associated ICallbackCollection and session state,
	 * accessible through the global functions in the weave.api package. In order for an ILinkableObject to
	 * be created dynamically at runtime, it must not require any constructor parameters.
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILinkableObject"})
	export class ILinkableObject implements NonArrayObject
	{
	}
}
