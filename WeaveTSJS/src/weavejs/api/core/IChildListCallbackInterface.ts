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
	/**
	 * This is an interface for adding and removing callbacks that get triggered when
	 * a child object is added or removed.  The accessor functions in this interface
	 * return values that are only defined while immediate callbacks are running, not
	 * during grouped callbacks.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.IChildListCallbackInterface"})
	export class IChildListCallbackInterface extends ICallbackCollection
	{
		/**
		 * This is the object that was added prior to running immediate callbacks.
		 */
		lastObjectAdded:ILinkableObject;

		/**
		 * This is the name of the object that was added prior to running immediate callbacks.
		 */
		lastNameAdded:string;
		
		/**
		 * This is the object that was removed prior to running immediate callbacks.
		 */
		lastObjectRemoved:ILinkableObject;
		
		/**
		 * This is the name of the object that was removed prior to running immediate callbacks.
		 */
		lastNameRemoved:string;
	}
}
