import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import GuidanceToolTip from "../react-ui/GuidanceToolTip";
import GuidanceContainer from "../react-ui/GuidanceContainer";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import MenuButton from "../react-ui/MenuButton";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";
import {MenuItemProps} from "../react-ui/Menu";
import ControlPanel from "./ControlPanel";
import DataMenu from "../menus/DataMenu";
import CenteredIcon from "../react-ui/CenteredIcon";

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
	dataMenu:DataMenu;
	enableGuidance?:boolean;
}

export interface IDataSourceManagerState
{
	selected:IDataSource;
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
		.set(GroupedDataTransform, GroupedDataTransformEditor);
//

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.state = {
			selected: this.props.dataMenu.weave.root.getObjects(IDataSource)[0]
		}
	}

	componentDidMount()
	{
		this.props.dataMenu.weave.root.childListCallbacks.addGroupedCallback(this, this.updateDataSources, true);
	}

	componentWillUnmount()
	{
		this.props.dataMenu.weave.root.childListCallbacks.removeCallback(this, this.updateDataSources);
	}

	updateDataSources()
	{
		let dataSources = this.props.dataMenu.weave.root.getObjects(IDataSource);

		dataSources.forEach((ds:IDataSource):void =>{
			Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate);//adding callbacks to every datasource
		});
		
		this.forceUpdate();
	}

	refreshDataSource(dataSource:IDataSource)
	{
		dataSource.hierarchyRefresh.triggerCallbacks();
		
		// TEMPORARY SOLUTION until all data sources behave correctly - force creating a new copy
		var root = this.props.dataMenu.weave.root;
		var name = root.getName(dataSource);
		if (name)
		{
			var names = root.getNames();
			root.requestObjectCopy(name, dataSource);
			root.setNameOrder(names);
		}
	}

	removeDataSource(dataSource:IDataSource)
	{
		let root = this.props.dataMenu.weave.root;
		root.removeObject(root.getName(dataSource));
	}

	render():JSX.Element
	{
		let root = this.props.dataMenu.weave.root;

		let listOptions:ListOption[] = root.getObjects(IDataSource).map(dataSource => {
			return {
				label: (
					<HBox style={{justifyContent: "space-between", alignItems:"center"}}>
						<span style={{overflow: "hidden"}}>{dataSource.getLabel()}</span>
						<HBox>
							<CenteredIcon onClick={()=>this.refreshDataSource(dataSource)}
							              iconProps={{ className: "fa fa-refresh", title: "Refresh this datasource" }}/>
							<CenteredIcon onClick={()=>this.removeDataSource(dataSource)}
							              iconProps={{ className: "fa fa-times", title: "Delete this datasource" }}/>
						</HBox>
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
				editorJsx = <VBox style={ { flex: 1, overflow:'auto'} }>
					<EditorClass dataSource={dataSource} chartsMenu={ this.props.dataMenu.chartsMenu }/>
				</VBox>;
			else
				editorJsx = <VBox className="ui segment" style={{flex:1, overflow: "auto", justifyContent: "center", alignItems: "center"}}>
					<div className="ui centered header">
						{Weave.lang("Editor not yet implemented for this data source type.")}
					</div>
				</VBox>;
		}
		else
		{
			editorJsx = <VBox className="ui segment" style={{flex:1, overflow: "auto", justifyContent: "center", alignItems: "center"}}>
				<div className="ui centered header">
					{Weave.lang((listOptions.length ? "Select" : "Create") + " a data source on the left.")}
				</div>
			</VBox>;
		}

		return (
			<HBox className="ui bottom attached segments" style={ {flex:1, overflow:'auto'} }>
				<VBox style={{width: 250}} className="weave-data-source-manager-sidebar">
					<VBox className="ui vertical inverted attached segments" style={{flex:1, justifyContent:"space-between"}}>
						<VBox className="ui basic inverted segment" style={{flex:1, overflow: "auto"}}>
							<div className="ui medium dividing header">{Weave.lang("Connected data sources")}</div>
							<VBox>
								<List
									options={listOptions}
									multiple={false}
									selectedValues={ [dataSource] }
									onChange={ (selectedValues:IDataSource[]) => { this.setState({ selected: selectedValues[0] });  }}
								/>
							</VBox>
						</VBox>
						<VBox className="ui inverted segment" style={{overflow: "auto"}}>
							<div className="ui meadium dividing header">{Weave.lang("Add more data sources")}</div>
							{
								this.props.dataMenu.getDataSourceItems().map((dsItem, index) => {
									return dsItem.shown
										?   <HBox key={index} onClick={() => dsItem.click()} className="weave-data-source-item" style={{justifyContent: "space-between", padding: 5}}>
										{Weave.lang(dsItem.label as string)}
										<CenteredIcon className="" iconProps={{ className:"fa fa-plus" }}/>
									</HBox>
										:   null
								})
							}
						</VBox>
					</VBox>
				</VBox>
				{editorJsx}
			</HBox>
		);
	}
}
