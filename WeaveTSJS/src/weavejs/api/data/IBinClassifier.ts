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
	
	/**
	 * A class implementing IBinClassifier should contain sessioned properties
	 * that define what values are contained in the bin.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.data.IBinClassifier"})
	export class IBinClassifier extends ILinkableObject
	{
		/**
		 * This function tests if a data value is contained in this IBinClassifier.
		 * @param value A data value to test.
		 * @return true If this IBinClassifier contains the given value.
		 */
		contains:(value:any)=>boolean;
	}
}
