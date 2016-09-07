/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
package
{
	import weavejs.WeaveAPI;
	import weavejs.api.core.ILinkableDynamicObject;
	import weavejs.api.core.ILinkableHashMap;
	import weavejs.api.core.ILocale;
	import weavejs.api.core.IProgressIndicator;
	import weavejs.api.core.IScheduler;
	import weavejs.api.core.ISessionManager;
	import weavejs.api.data.ICSVParser;
	import weavejs.api.data.IDataSource;
	import weavejs.api.data.IDataSource_Transform;
	import weavejs.api.data.IQualifiedKeyManager;
	import weavejs.api.data.IStatisticsCache;
	import weavejs.api.net.IURLRequestUtils;
	import weavejs.api.ui.IEditorManager;
	import weavejs.core.EditorManager;
	import weavejs.core.LinkableDynamicObject;
	import weavejs.core.LinkableHashMap;
	import weavejs.core.Locale;
	import weavejs.core.ProgressIndicator;
	import weavejs.core.Scheduler;
	import weavejs.core.SessionManager;
	import weavejs.data.CSVParser;
	import weavejs.data.StatisticsCache;
	import weavejs.data.key.QKeyManager;
	import weavejs.data.source.GeoJSONDataSource;
	import weavejs.data.source.WeaveDataSource;
	import weavejs.geom.TempHack_SolidFillStyle;
	import weavejs.geom.TempHack_SolidLineStyle;
	import weavejs.net.URLRequestUtils;
	
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
			
			// register singleton implementations
			WeaveAPI.ClassRegistry.registerImplementation(IURLRequestUtils, URLRequestUtils);
			WeaveAPI.ClassRegistry.registerImplementation(ISessionManager, SessionManager);
			WeaveAPI.ClassRegistry.registerImplementation(IQualifiedKeyManager, QKeyManager);
			WeaveAPI.ClassRegistry.registerImplementation(IScheduler, Scheduler);
			WeaveAPI.ClassRegistry.registerImplementation(IProgressIndicator, ProgressIndicator);
			WeaveAPI.ClassRegistry.registerImplementation(IStatisticsCache, StatisticsCache);
			WeaveAPI.ClassRegistry.registerImplementation(IEditorManager, EditorManager);
			WeaveAPI.ClassRegistry.registerImplementation(ICSVParser, CSVParser);
			WeaveAPI.ClassRegistry.registerImplementation(ILocale, Locale);
			
			WeaveAPI.ClassRegistry.registerImplementation(ILinkableHashMap, LinkableHashMap);
			WeaveAPI.ClassRegistry.registerImplementation(ILinkableDynamicObject, LinkableDynamicObject);
			
			// temporary hack
			//TODO - traverse weavejs namespace and register all classes with all their interfaces
			var IDataSource_File:Class = IDataSource;
			var IDataSource_Service:Class = IDataSource;
			var IDataSource_Transform:Class = IDataSource;
			WeaveAPI.ClassRegistry.registerImplementation(IDataSource_File, GeoJSONDataSource, "GeoJSON file");
			WeaveAPI.ClassRegistry.registerImplementation(IDataSource_Service, WeaveDataSource, "Weave server");

			Weave.setClassInfo(TempHack_SolidFillStyle, {id: "ExtendedFillStyle"});
			Weave.setClassInfo(TempHack_SolidLineStyle, {id: "ExtendedLineStyle"});
			
			// TEMPORARY
			//WeaveTest.test(weave);
			WeaveTest;
		}
	}
	new WeaveJS().start();
}