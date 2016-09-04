import CSVDataSource = weavejs.data.source.CSVDataSource;
class WeaveTSTest
{
	static test(weave:Weave)
	{
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