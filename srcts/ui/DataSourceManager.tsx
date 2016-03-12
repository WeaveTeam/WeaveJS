import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";

import IDataSource = weavejs.api.data.IDataSource;

/* Import editors and their data sources */
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveDataSourceEditor from "../editors/WeaveDataSourceEditor";

export interface IDataSourceManagerProps
{
	weave:Weave;
}

export interface IDataSourceManagerState
{
	selectedDataSource?:IDataSource;
}

export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	static editorRegistry = new Map<typeof IDataSource, React.ComponentClass<IDataSourceEditorProps>>()
		//.set(CachedDataSource, CachedDataSourceEditor)
		//.set(CSVDataSource, CSVDataSourceEditor)
		.set(WeaveDataSource, WeaveDataSourceEditor);

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	state:IDataSourceManagerState = {};

	render():JSX.Element
	{
		let root = this.props.weave.root;
		let listOptions:ListOption[] = root.getObjects(IDataSource).map(value => { return {label: root.getName(value), value}; });

		let editorJsx:JSX.Element;
		let dataSource = this.state.selectedDataSource;
		if (dataSource)
		{
			let EditorClass = DataSourceManager.editorRegistry.get(dataSource.constructor as typeof IDataSource);
			if (EditorClass)
				editorJsx = <EditorClass dataSource={dataSource}/>;
			else
				editorJsx = <div>Editor not yet implemented for this data source type.</div>;
		}
		else
		{
			editorJsx = <div>Select a data source on the left.</div>;
		}

		return (
			<HBox style={{ flex: 1, minWidth: 700, minHeight: 400 }}>
				<VBox style={{ flex: .25 }}>
					<List options={listOptions} onChange={ (selectedValues:IDataSource[]) => this.setState({ selectedDataSource: selectedValues[0] }) }/>
				</VBox>
				<div style={{ backgroundColor: '#f0f0f0', width: 4 }}/>
				<VBox style={{ flex: .75 }}>
					{editorJsx}
				</VBox>
			</HBox>
		);
	}

	static openInstance(weave:Weave):PopupWindow
	{
		return PopupWindow.open({
			title: "Manage data sources",
			content: (<DataSourceManager weave={weave}/>),
			modal: false
		});
	}
}