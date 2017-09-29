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
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILocale"})
	export class ILocale
	{
		reverseLayout:boolean;

		/**
		 * A mapping from original text to translated text.
		 */
		data:{[key:string]:string};

		/**
		 * This will look up the localized version of a piece of text.
		 * @param text The original text as specified by the developer.
		 * @return The text in the current locale, or the original text if no localization exists.
		 */
		getText:(text:string) => string;
	}
}
