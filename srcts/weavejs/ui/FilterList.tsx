namespace weavejs.ui
{
	export interface FilterDefinition
	{
	}

	export interface IFilterListProps<T> extends React.HTMLProps<FilterList<T>>
	{
		type: "combo"|"list";
	}

	export interface IFilterListState<T>
	{
		selectedItems: T[];
	}

	export class FilterList<T> extends React.Component<IFilterListProps<T>, IFilterListState<T>>
	{
		constructor(props:IFilterListProps<T>)
		{
			super(props);
		}
	}
}
