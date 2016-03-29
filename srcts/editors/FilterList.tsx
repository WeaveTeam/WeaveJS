import * as React from "react";
import * as _ from "lodash";

export interface FilterDefinition
{

}

export interface IFilterListProps<T> extends React.HTMLProps<FilterList<T>> {
	type: "combo"|"list";

}

export interface IFilterListState<T> {
	selectedItems: T[];
}

export default class FilterList<T> extends React.Component<IFilterListProps<T>, IFilterListState<T>>
{
	constructor(props:IFilterListProps<T>)
	{
		super(props);
	}


}