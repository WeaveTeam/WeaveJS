import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import MenuButton from "../react-ui/MenuButton";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";
import {MenuItemProps} from "../react-ui/Menu";

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
	selected?:IDataSource;
}

export interface IDataSourceManagerState
{
	selected?:IDataSource;
}

export default class DataSourceManager extends React.Component<IDataSourceManagerProps,IDataSourceManagerState>
{
	static editorRegistry = new Map<typeof IDataSource, React.ComponentClass<IDataSourceEditorProps>>()
		.set(CSVDataSource, CSVDataSourceEditor)
		.set(DBFDataSource, DBFDataSourceEditor)
		.set(GeoJSONDataSource, GeoJSONDataSourceEditor)
		.set(CensusDataSource, CensusDataSourceEditor)
		.set(CKANDataSource, CKANDataSourceEditor)
		.set(CensusDataSource, CensusDataSourceEditor)
		.set(WeaveDataSource, WeaveDataSourceEditor)
//		.set(CachedDataSource, CachedDataSourceEditor) // should have a button to restore the original data source
		.set(ForeignDataMappingTransform, ForeignDataMappingTransformEditor)
		.set(GroupedDataTransform, GroupedDataTransformEditor)
//		

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.state = {
			selected: props.selected
		};
	}
	
	componentDidMount()
	{
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}
	
	componentWillUnmount()
	{
		this.props.weave.root.childListCallbacks.removeCallback(this, this.forceUpdate);
	}

	componentWillReceiveProps(props:IDataSourceManagerProps)
	{
		if (props.selected)
			this.setState({selected: props.selected});
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
		let dataSource = this.state.selected;
		
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
			<HBox style={{flex: 1}}>
				<VBox style={{ width: 200 }}>
					<List
						options={listOptions}
						multiple={false}
						selectedValues={[dataSource]}
						onChange={ (selectedValues:IDataSource[]) => this.setState({ selected: selectedValues[0] }) }
					/>
				</VBox>
				<div style={{ backgroundColor: '#f0f0f0', width: 4}}/>
				<VBox style={{ flex: 1, margin: 10 }}>
					{editorJsx}
				</VBox>
			</HBox>
		);
	}

	static map_weave_dsmPopup = new WeakMap<Weave, PopupWindow>();
	static openInstance(weave:Weave, selected:IDataSource = null):PopupWindow
	{
		var dsm = DataSourceManager.map_weave_dsmPopup.get(weave);
		if (dsm)
		{
			dsm.setState({content: <DataSourceManager weave={weave} selected={selected}/>});
		}
		else
		{
			dsm = PopupWindow.open({
				title: "Manage data sources",
				content: <DataSourceManager weave={weave} selected={selected}/>,
				modal: false,
				width: 800,
				height: 600,
				onCancel: () => DataSourceManager.map_weave_dsmPopup.delete(weave)
			});
			DataSourceManager.map_weave_dsmPopup.set(weave, dsm);
		}
		return dsm;
	}
}
