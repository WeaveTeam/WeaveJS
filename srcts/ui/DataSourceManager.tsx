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
import CSVDataSource = weavejs.data.source.CSVDataSource;
import CSVDataSourceEditor from "../editors/CSVDataSourceEditor";

export interface IDataSourceManagerProps
{
	weave:Weave;
	selectedDataSource?:IDataSource;
}

export interface IDataSourceManagerState
{
	selectedDataSource?:IDataSource;
}

export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	static editorRegistry = new Map<typeof IDataSource, React.ComponentClass<IDataSourceEditorProps>>()
		.set(CSVDataSource, CSVDataSourceEditor)
//		.set(DBFDataSource, DBFDataSource)
//		.set(GeoJSONDataSource, GeoJSONDataSource)
//		.set(CensusDataSource, CensusDataSourceEditor)
//		.set(CKANDataSource, CKANDataSourceEditor)
		.set(WeaveDataSource, WeaveDataSourceEditor)
//		.set(CachedDataSource, CachedDataSourceEditor) // should have a button to restore the original data source
//		.set(ForeignDataMappingTransform, ForeignDataMappingTransformEditor)
//		.set(GroupedDataTransform, GroupedDataTransformEditor)
//		

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	state:IDataSourceManagerState = {};
	
	componentWillReceiveProps(props:IDataSourceManagerProps)
	{
		if (props.selectedDataSource)
			this.setState({selectedDataSource: props.selectedDataSource});
	}

	render():JSX.Element
	{
		let root = this.props.weave.root;
		let listOptions:ListOption[] = root.getObjects(IDataSource).map(value => { return {label: root.getName(value), value}; });

		let editorJsx:JSX.Element;
		let dataSource = this.state.selectedDataSource || this.props.selectedDataSource;
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
					<List
						options={listOptions}
						multiple={false}
						selectedValues={[dataSource]}
						onChange={ (selectedValues:IDataSource[]) => this.setState({ selectedDataSource: selectedValues[0] }) }
					/>
				</VBox>
				<div style={{ backgroundColor: '#f0f0f0', width: 4 }}/>
				<VBox style={{ flex: .75 }}>
					{editorJsx}
				</VBox>
			</HBox>
		);
	}

	static map_weave_dsmPopup= new WeakMap<Weave, PopupWindow>();
	static openInstance(weave:Weave, selectedDataSource:IDataSource = null):PopupWindow
	{
		var map = DataSourceManager.map_weave_dsmPopup;
		var dsm = map.get(weave);
		if (!dsm)
		{
			dsm = PopupWindow.open({
				title: "Manage data sources",
				content: <DataSourceManager weave={weave} selectedDataSource={selectedDataSource}/>,
				modal: false,
				onCancel: () => map.delete(weave)
			});
			map.set(weave, dsm);
		}
		return dsm;
	}
}