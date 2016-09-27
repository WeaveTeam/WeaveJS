/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
package
{
	import weavejs.api.core.ILinkableVariable;
import weavejs.path.WeavePath;
import weavejs.path.WeavePathData;
import weavejs.path.WeavePathDataShared;
import weavejs.path.WeavePathUI;

public class WeaveTest
	{
		private static const dependencies:Array = [
			ILinkableVariable,
			WeavePath,
			WeavePathData,
			WeavePathDataShared,
			WeavePathUI,
			//EntityNodeSearch, //TODO - resolve circular dependency issue
			null
		];
	}
}
