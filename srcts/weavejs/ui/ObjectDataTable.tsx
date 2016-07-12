namespace weavejs.ui
{
	import DataTable = weavejs.ui.DataTable;

	/* Stuff for generic object tables */
	export interface IRow {
		[columnKey: string]: React.ReactChild;
	}

	/* Needed because templating doesn't play nice with JSX syntax. */
	export class ObjectDataTable extends DataTable<IRow>
	{
		constructor(props: IDataTableProps<IRow>) {
			super(props);
		}
	}
}
