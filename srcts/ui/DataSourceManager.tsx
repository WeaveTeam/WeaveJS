import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import MenuButton from "../react-ui/MenuButton";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";
import {MenuItemProps} from "../react-ui/Menu";
import ControlPanel from "./ControlPanel";

import IDataSource = weavejs.api.data.IDataSource;

/* Import editors and their data sources */
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveDataSourceEditor from "../editors/WeaveDataSourceEditor";

import CSVDataSource = weavejs.data.source.CSVDataSource;
import CSVDataSourceEditor from "../editors/CSVDataSourceEditor";

import DBFDataSource = weavejs.data.source.DBFDataSource;
import DBFDataSourceEditor from "../editors/DBFDataSourceEditor";

import GeoJSONDataSource = weavejs.data.source.GeoJSONDataSource;
import GeoJSONDataSourceEditor from "../editors/GeoJSONDataSourceEditor";

import CensusDataSource = weavejs.data.source.CensusDataSource;
import CensusDataSourceEditor from "../editors/CensusDataSourceEditor";

import CKANDataSource = weavejs.data.source.CKANDataSource;
import CKANDataSourceEditor from "../editors/CKANDataSourceEditor";

// import CachedDataSource = weavejs.data.source.CachedDataSource;
// import CachedDataSourceEditor from "../editors/CachedDataSourceEditor";

import ForeignDataMappingTransform = weavejs.data.source.ForeignDataMappingTransform;
import ForeignDataMappingTransformEditor from "../editors/ForeignDataMappingTransformEditor";

import GroupedDataTransform = weavejs.data.source.GroupedDataTransform;
import GroupedDataTransformEditor from "../editors/GroupedDataTransformEditor";


export interface IDataSourceManagerProps
{
	weave:Weave;
}

export interface IDataSourceManagerState
{
}

export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	static editorRegistry = new Map<typeof IDataSource, React.ComponentClass<IDataSourceEditorProps>>()
		.set(CSVDataSource, CSVDataSourceEditor)
		.set(DBFDataSource, DBFDataSourceEditor)
		.set(GeoJSONDataSource, GeoJSONDataSourceEditor)
		.set(CensusDataSource, CensusDataSourceEditor)
		.set(CKANDataSource, CKANDataSourceEditor)
		.set(WeaveDataSource, WeaveDataSourceEditor)
//		.set(CachedDataSource, CachedDataSourceEditor) // should have a button to restore the original data source
		.set(ForeignDataMappingTransform, ForeignDataMappingTransformEditor)
		.set(GroupedDataTransform, GroupedDataTransformEditor)
//		
	
	static selected:IDataSource;

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
	}
	
	componentDidMount()
	{
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}
	
	componentWillUnmount()
	{
		this.props.weave.root.childListCallbacks.removeCallback(this, this.forceUpdate);
	}

	refreshDataSource(dataSource:IDataSource)
	{
		dataSource.hierarchyRefresh.triggerCallbacks();
	}
	
	removeDataSource(dataSource:IDataSource)
	{
		let root = this.props.weave.root;
		root.removeObject(root.getName(dataSource));
	}

	render():JSX.Element
	{
		let root = this.props.weave.root;
		
		
		let listOptions:ListOption[] = root.getObjects(IDataSource).map(dataSource => { 
			var dataSourceMenu:MenuItemProps[] = [
				{
					label: Weave.lang("Refresh"),
					click: () => this.refreshDataSource(dataSource)
				},
				{},
				{
					label: Weave.lang("Delete"),
					click: () => this.removeDataSource(dataSource)
				}
			];
			return {
				label: (
					<HBox style={{justifyContent: "space-between"}}>
						<span style={{overflow: "hidden"}}>{dataSource.getHierarchyRoot().getLabel()}</span>
						<MenuButton menu={dataSourceMenu}/>
					</HBox>
				),
				value: dataSource
			}; 
		});

		let editorJsx:JSX.Element;
		let dataSource = DataSourceManager.selected;
		
		if (dataSource && !Weave.wasDisposed(dataSource))
		{
			let EditorClass = DataSourceManager.editorRegistry.get(dataSource.constructor as typeof IDataSource);
			if (EditorClass)
				editorJsx = <EditorClass dataSource={dataSource}/>;
			else
				editorJsx = <span>{Weave.lang("Editor not yet implemented for this data source type.")}</span>;
		}
		else
		{
			editorJsx = <span>{Weave.lang("Select a data source on the left.")}</span>;
		}
		

		return (
			<HBox className="weave-padded-hbox" style={ {flex:1} }>
				<VBox className="weave-container" style={ {width:200, padding: 0} }>
					<List
						options={listOptions}
						multiple={false}
						selectedValues={ [dataSource] }
						onChange={ (selectedValues:IDataSource[]) => { DataSourceManager.selected = selectedValues[0]; this.forceUpdate() }}
					/>
				</VBox>
				<VBox  style={ {flex: 1} }>
					{editorJsx}
				</VBox>
			</HBox>
		);
	}

	static openInstance(weave:Weave, selected:IDataSource = null):ControlPanel
	{
		DataSourceManager.selected = selected;
		return ControlPanel.openInstance(weave, DataSourceManager, {title: Weave.lang("Manage data sources")}, {weave});
	}
}
