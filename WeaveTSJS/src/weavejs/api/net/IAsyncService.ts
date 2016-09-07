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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import WeavePromise = weavejs.util.WeavePromise;
	
	/**
	 * This is an interface for an asynchronous service.
	 * The invokeAsyncMethod() function invokes an asynchronous method and returns an AsyncToken which you can add IResponder objects to.
	 * This is an ILinkableObject so its busy status can be checked and its URL requests will be cancelled when it is disposed.
	 */
	export class IAsyncService extends ILinkableObject
	{
		/**
		 * This function will invoke an asynchronous method using the given parameters object.
		 * When the method finishes, the AsyncToken returned by this function will call its responders.
		 * @param methodName A String to identify which remote procedure to call.
		 * @param methodParameters Either an Array or an Object to use as a list of parameters.
		 * @return An AsyncToken that you can add responders to.
		 */
		invokeAsyncMethod:(methodName:string, methodParameters:string[]|Object) => WeavePromise<any>;
	}
}
