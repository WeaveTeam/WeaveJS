/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
package
{
	import weavejs.api.core.ILinkableVariable;
import weavejs.core.CallbackCollection;
import weavejs.core.EventCallbackCollection;
	import weavejs.core.LinkableBoolean;
	import weavejs.core.LinkableCallbackScript;
	import weavejs.core.LinkableDynamicObject;
	import weavejs.core.LinkableFunction;
	import weavejs.core.LinkableHashMap;
	import weavejs.core.LinkableNumber;
import weavejs.core.LinkablePromise;
import weavejs.core.LinkableString;
	import weavejs.core.LinkableVariable;
	import weavejs.core.LinkableWatcher;
	import weavejs.core.SessionStateLog;
import weavejs.util.ArrayUtils;
import weavejs.util.AsyncSort;
import weavejs.util.ColorRamp;
import weavejs.util.DateUtils;
import weavejs.util.JS;
	import weavejs.util.JSByteArray;
import weavejs.util.StandardLib;
import weavejs.util.WeaveMenuItem;

	public class WeaveTest
	{
		private static const dependencies:Array = [
			ILinkableVariable,
			LinkableNumber,LinkableString,LinkableBoolean,LinkableVariable,
			LinkableHashMap,LinkableDynamicObject,LinkableWatcher,
			LinkableCallbackScript,LinkableFunction,

			WeaveMenuItem,
			EventCallbackCollection,
			ColorRamp,
			LinkablePromise,
			JSByteArray,
			AsyncSort,
			ArrayUtils,
			StandardLib,
			DateUtils,
			CallbackCollection,
			//EntityNodeSearch, //TODO - resolve circular dependency issue
			null
		];
		
		public static function test(weave:Weave):void
		{
			SessionStateLog.debug = true;
			
			var lv:LinkableString = weave.root.requestObject('ls', LinkableString, false);
			lv.addImmediateCallback(weave, function():void { JS.log('immediate', lv.state); }, true);
			lv.addGroupedCallback(weave, function():void { JS.log('grouped', lv.state); }, true);
			lv.state = 'hello';
			lv.state = 'hello';
			weave.path('ls').state('hi').addCallback(null, function():void { JS.log(this+'', this.getState()); });
			lv.state = 'world';
			weave.path('script')
				.request('LinkableCallbackScript')
				.state('script', 'console.log(Weave.className(this), this.get("ldo").target.value, Weave.getState(this));')
				.push('variables', 'ldo')
					.request('LinkableDynamicObject')
					.state(['ls']);
			lv.state = '2';
			lv.state = 2;
			lv.state = '3';
			weave.path('ls2').request('LinkableString');
			weave.path('sync')
				.request('LinkableSynchronizer')
				.state('primaryPath', ['ls'])
				.state('primaryTransform', 'state + "_transformed"')
				.state('secondaryPath', ['ls2'])
				.call(function():void { JS.log(this.weave.path('ls2').getState()) });
			var print:Function = function():void {
				JS.log("column", this.getMetadata("title"));
				for each (var key:* in this.keys)
					JS.log(key, this.getValueFromKey(key), this.getValueFromKey(key, Number), this.getValueFromKey(key, String));
			};
		}
	}
}
