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

namespace weavejs.api.data
{
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;

	export class ISelectableAttributes extends ILinkableObject
	{
		// TODO fix classInfo argument so that it accepts abstract classes
		static WEAVE_INFO = Weave.classInfo(ISelectableAttributes, {
			id: "weavejs.api.data.ISelectableAttributes"
		});

		selectableAttributes:Map<string, IColumnWrapper|ILinkableHashMap>
	}
}
