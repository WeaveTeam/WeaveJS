namespace weavejs.editor
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import Button = weavejs.ui.Button;

	import CachedDataSource = weavejs.data.source.CachedDataSource;

	export class CachedDataSourceEditor extends DataSourceEditor
	{
		get editorFields():[React.ReactChild, React.ReactChild][]
		{
			let ds = (this.props.dataSource as CachedDataSource);
			return [
				[
					Weave.lang("This data source is using cached data."),
					<Button onClick={() => ds.hierarchyRefresh.triggerCallbacks()}>
						{Weave.lang("Restore this data source")}
					</Button>
				]
			];
		}
	}

	Weave.registerClass(CachedDataSourceEditor, "weavejs.editor.CachedDataSourceEditor", []);
}
