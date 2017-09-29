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
	 * This is an interface for a central location to report progress of asynchronous requests.
	 * Since this interface extends ILinkableObject, getCallbackCollection() can be used on an IProgressIndicator.
	 * Callbacks should be triggered after any action that would change the result of getNormalizedProgress().
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.IProgressIndicator"})
	export class IProgressIndicator extends ILinkableObject
	{
		/**
		 * This is the number of active background tasks.
		 */
		getTaskCount:() => int;

		/**
		 * This function will register a background task.
		 * @param taskToken A token representing a background task.  If this is an AsyncToken, a responder will be added that will automatically call removeTask(taskToken) on success or failure.
		 * @param busyObject An object that is responsible for the task. If specified, will call WeaveAPI.SessionManager.assignBusyTask().
		 * @param description A description of the task.
		 * @see weave.api.core.ISessionManager#assignBusyTask()
		 */
		addTask:(taskToken:Object, busyObject?:ILinkableObject, description?:string) => void;
		
		/**
		 * This function will check if a background task is registered as an active task.
		 * @param taskToken A token representing a background task.
		 * @return A value of true if the task was previously added and not yet removed.
		 */
		hasTask:(taskToken:Object) => boolean;
		
		/**
		 * This function will report the progress of a background task.
		 * @param taskToken An object representing a task.
		 * @param progress A number between 0 and 1 indicating the current progress of the task.
		 */
		updateTask:(taskToken:Object, progress:number) => void;

		/**
		 * This function will remove a previously registered pending request token and decrease the pendingRequestCount if necessary.
		 * Also calls WeaveAPI.SessionManager.unassignBusyTask().
		 * @param taskToken The object to remove from the progress indicator.
		 * @see weave.api.core.ISessionManager#unassignBusyTask()
		 */
		removeTask:(taskToken:Object) => void;
		
		/**
		 * This function checks the overall progress of all pending requests.
		 *
		 * @return A Number between 0 and 1.
		 */
		getNormalizedProgress:() => number;
	}
}
