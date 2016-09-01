namespace weavejs.editor
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import Button = weavejs.ui.Button;

	import CachedDataSource = weavejs.data.source.CachedDataSource;

	export class CachedDataSourceEditor extends DataSourceEditor
	{
		static WEAVE_INFO = Weave.classInfo(CachedDataSourceEditor, {
			id: "weavejs.editor.CachedDataSourceEditor",
			linkable: false
		});

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
}
