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
	 * Implement this interface to specify how to rewrite deprecated session state paths.
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILinkableObjectWithNewPaths"})
	export class ILinkableObjectWithNewPaths extends ILinkableObject
	{
		/**
		 * Receives a deprecated path and returns the new path.
		 * @param relativePath The deprecated path.
		 * @return The new path.
		 */
		deprecatedPathRewrite:(relativePath:(string|number)[]) => (string|number)[];
	}
}
