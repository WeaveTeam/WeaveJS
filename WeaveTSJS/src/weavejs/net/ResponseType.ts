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

namespace weavejs.net
{
	export class ResponseType
	{
		public static /* readonly */ UINT8ARRAY:string = 'uint8array';
		public static /* readonly */ ARRAYBUFFER:string = 'arraybuffer';
		public static /* readonly */ BLOB:string = 'blob';
		public static /* readonly */ DOCUMENT:string = 'document';
		public static /* readonly */ JSON:string = 'json';
		public static /* readonly */ TEXT:string = 'text';
		public static /* readonly */ DATAURI:string = 'datauri';
	}
}
