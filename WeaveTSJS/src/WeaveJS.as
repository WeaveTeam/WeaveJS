/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
package
{
public class WeaveJS
	{
		public function WeaveJS()
		{

		}
		public function start():void
		{
			WeaveAPI.ClassRegistry['defaultPackages'].push(
				'',
				'weavejs',
				'weavejs.api',
				'weavejs.api.core',
				'weavejs.api.data',
				'weavejs.api.service',
				'weavejs.api.ui',
				'weavejs.core',
				'weavejs.data',
				'weavejs.data.bin',
				'weavejs.data.column',
				'weavejs.data.hierarchy',
				'weavejs.data.key',
				'weavejs.data.source',
				'weavejs.geom',
				'weavejs.path',
				'weavejs.util'
			);
			
			//TODO - traverse weavejs namespace and register all classes with all their interfaces
//			var IDataSource_File:Class = IDataSource;
//			var IDataSource_Service:Class = IDataSource;
//			var IDataSource_Transform:Class = IDataSource;

			// TEMPORARY
			//WeaveTest.test(weave);
			Weave;
			WeaveTest;
		}
	}
	new WeaveJS().start();
}