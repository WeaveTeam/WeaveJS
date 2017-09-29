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
	 * This is an interface for an ILinkableObject which provides a way to determine if it is busy or not,
	 * for use with ISessionManager.linkableObjectIsBusy().
	 * 
	 * @see weave.api.core.ISessionManager#linkableObjectIsBusy
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILinkableObjectWithBusyStatus"})
	export class ILinkableObjectWithBusyStatus extends ILinkableObject
	{
		/**
		 * This function will override the behavior of ISessionManager.linkableObjectIsBusy().
		 * @return A value of true if this object is busy with asynchronous tasks.
		 */
		isBusy:() => boolean;
	}
}
