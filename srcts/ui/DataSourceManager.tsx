import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface IDataSourceManagerProps {
	weave: Weave;
}

export interface IDataSourceManagerState {
}


export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.props.weave.getObject();
	}

	componentDidMount()
	{
		let rootHashMap = this.props.weave.getObject() as LinkableHashMap;
		rootHashMap.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	state: IDataSourceManagerState = {};

	render(): JSX.Element
	{
		let listOptions: ListOption[] = [];

		let rootHashMap = this.props.weave.getObject() as LinkableHashMap;

		for (let value of rootHashMap.getObjects(IDataSource) as IDataSource[])
		{
			let label = rootHashMap.getName(value);
			listOptions.push({ label, value });
		}

		return <HBox style = {{ width: 700, height: 400 }}>
			<VBox style = {{ width: "25%" }}>Select a datasource
				<List options = {listOptions}/>
			</VBox>
			<VBox style = {{ width: "75%" }}>Browse or Configure</VBox>
		</HBox>;
	}

	static openInstance(weave:Weave)
	{
		PopupWindow.open({
			title: "Manage data sources",
			content: (<DataSourceManager weave={weave}/>),
			modal: false
		});
	}
}