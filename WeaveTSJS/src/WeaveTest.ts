import CSVDataSource = weavejs.data.source.CSVDataSource;
import LinkableString = weavejs.core.LinkableString;
import SessionStateLog = weavejs.core.SessionStateLog;

class WeaveTSTest
{
	static test(weave:Weave)
	{
		SessionStateLog.debug = true;

		var lv:LinkableString = weave.root.requestObject('ls', LinkableString, false);
		lv.addImmediateCallback(weave, function():void { console.log('immediate', lv.state); }, true);
		lv.addGroupedCallback(weave, function():void { console.log('grouped', lv.state); }, true);
		lv.state = 'hello';
		lv.state = 'hello';
		weave.path('ls').state('hi').addCallback(null, function():void { console.log(this+'', this.getState()); });
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
			.call(function():void { console.log(this.weave.path('ls2').getState()) });
		var print:Function = function():void {
			console.log("column", this.getMetadata("title"));
			for (var key of this.keys || [])
			console.log(key, this.getValueFromKey(key), this.getValueFromKey(key, Number), this.getValueFromKey(key, String));
		};
		weave.path('csv').request(CSVDataSource)
			.state('csvData', [['a', 'b'], [1, "one"], [2, "two"]])
			.addCallback(null, function():void {
				console.log(this+"");
				var csv:CSVDataSource = this.getObject() as CSVDataSource;
				var ids = csv.getColumnIds();
				for (var id of ids)
				{
					var col = csv.getColumnById(id);
					col.addGroupedCallback(col, print, true);
				}
			});
	}
}