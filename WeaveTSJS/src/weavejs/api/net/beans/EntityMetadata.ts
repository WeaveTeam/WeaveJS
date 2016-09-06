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

namespace weavejs.api.net.beans
{
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;

	export class EntityMetadata
	{
		public static getSuggestedPublicPropertyNames():string[]
		{
			return [
				ColumnMetadata.TITLE,
				ColumnMetadata.NUMBER,
				ColumnMetadata.STRING,
				ColumnMetadata.KEY_TYPE,
				ColumnMetadata.DATA_TYPE,
				ColumnMetadata.PROJECTION,
				ColumnMetadata.AGGREGATION,
				ColumnMetadata.DATE_FORMAT,
				ColumnMetadata.DATE_DISPLAY_FORMAT,
				ColumnMetadata.OVERRIDE_BINS,
				ColumnMetadata.MIN,
				ColumnMetadata.MAX,
				'year'
			];
		}

		public static getSuggestedPrivatePropertyNames():string[]
		{
			return [
				"connection",
				"sqlQuery",
				"sqlParams",
				"sqlTablePrefix",
				"importMethod",
				"fileName",
				"keyColumn",
				"sqlSchema",
				"sqlTable",
				"sqlKeyColumn",
				"sqlColumn"
			];
		}

		public privateMetadata:Object = {};
		public publicMetadata:IWeaveDataSourceColumnMetadata = {};

		private objToStr(obj:Object):string
		{
			var str:string = '';
			for (var name in obj)
			{
				if (str)
					str += '; ';
				str += name + ': ' + (obj as {[key:string]:string})[name];
			}
			return '{' + str + '}';
		}

		public toString():string
		{
			return this.objToStr({'publicMetadata': this.objToStr(this.publicMetadata), 'privateMetadata': this.objToStr(this.privateMetadata)});
		}
	}
}
