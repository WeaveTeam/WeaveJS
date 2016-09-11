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

namespace weavejs.data.bin
{
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import LinkableVariable = weavejs.core.LinkableVariable;
	
	/**
	 * This classifies a single value.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.bin.SingleValueClassifier", interfaces:[IBinClassifier]})
	export class SingleValueClassifier extends LinkableVariable implements IBinClassifier
	{
		/**
		 * @param value A value to test.
		 * @return true If this IBinClassifier contains the given value.
		 */
		public contains(value:any):boolean
		{
			return this.sessionStateEquals(value);
		}
	}
}
