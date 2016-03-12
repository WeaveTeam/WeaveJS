import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import {IDataSourceEditorState} from "../editors/DataSourceEditor";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";



import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;

/* Import editors and their data sources */
import AbstractDataSource = weavejs.data.source.AbstractDataSource;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveDataSourceEditor from "../editors/WeaveDataSourceEditor";

export interface IDataSourceManagerProps {
	weave: Weave;
}

export interface IDataSourceManagerState {
}

export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	static editorRegistry = new Map<typeof IDataSource, any>()
		.set(WeaveDataSource, WeaveDataSourceEditor);

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

	list: List;
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

		let selectedValues:any[] = [];
		if (this.list && this.list.state && this.list.state.selectedValues)
		{
			selectedValues = this.list.state.selectedValues;
		}

		let editorJsx: JSX.Element;
		let selection: IDataSource;
		if (selectedValues.length > 0)
		{
			selection = this.list.state.selectedValues[0] as IDataSource;
		}
		if (selection !== undefined)
		{
			let dataSource = selection;
			let EditorClass = DataSourceManager.editorRegistry.get(dataSource.constructor as typeof IDataSource);
			if (EditorClass)
				editorJsx = <EditorClass dataSource={dataSource}/>;
			else
				editorJsx = <div>Editor not yet implemented for this data source type.</div>;
		}
		else
		{
			editorJsx = <div/>;
		}

		

		return <HBox style = {{ width: 700, height: 400 }}>
			<VBox style = {{ width: "25%" }}>Select a datasource
				<List onChange={ (selectedValues:any[]) => { this.forceUpdate() } } options = {listOptions} ref={(c:List) => {this.list = c}}/>
			</VBox>
			<VBox style = {{ width: "75%" }}>Browse or Configure
				{editorJsx}
			</VBox>
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