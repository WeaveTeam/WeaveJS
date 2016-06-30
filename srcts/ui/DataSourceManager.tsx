import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox, Label} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import InteractiveTour from "../react-ui/InteractiveTour";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import MenuButton from "../react-ui/MenuButton";
import {IDataSourceEditorProps} from "../editors/DataSourceEditor";
import {MenuItemProps} from "../react-ui/Menu";
import ControlPanel from "./ControlPanel";
import DataMenu from "../menus/DataMenu";
import CenteredIcon from "../react-ui/CenteredIcon";
import Dropzone from "../modules/Dropzone";
import LogComponent from "../react-ui/LogComponent";
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

import CachedDataSource = weavejs.data.source.CachedDataSource;
import CachedDataSourceEditor from "../editors/CachedDataSourceEditor";

import SpatialJoinTransform = weavejs.data.source.SpatialJoinTransform;
import SpatialJoinTransformEditor from "../editors/SpatialJoinTransformEditor";

import ForeignDataMappingTransform = weavejs.data.source.ForeignDataMappingTransform;
import ForeignDataMappingTransformEditor from "../editors/ForeignDataMappingTransformEditor";

import GroupedDataTransform = weavejs.data.source.GroupedDataTransform;
import GroupedDataTransformEditor from "../editors/GroupedDataTransformEditor";
import FileMenu from "../menus/FileMenu";


export interface IDataSourceManagerProps
{
	weave:Weave;
	fileMenu?:FileMenu;
}

export interface IDataSourceManagerState
{
	selected?:IDataSource;
	rejected?:boolean
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
		.set(CachedDataSource, CachedDataSourceEditor)
		.set(SpatialJoinTransform, SpatialJoinTransformEditor)
		.set(ForeignDataMappingTransform, ForeignDataMappingTransformEditor)
		.set(GroupedDataTransform, GroupedDataTransformEditor);

	private selectedIndex:number = 0;

	constructor(props:IDataSourceManagerProps)
	{
		super(props);
		this.state = {
			rejected: false
		};
	}

	componentDidMount()
	{
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.updateDataSources, true);
	}

	componentWillUnmount()
	{
		this.props.weave.root.childListCallbacks.removeCallback(this, this.updateDataSources);
	}

	updateDataSources()
	{
		let dataSources = this.props.weave.root.getObjects(IDataSource);

		dataSources.forEach((ds:IDataSource):void =>{
			Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate);//adding callbacks to every datasource
		});

		this.forceUpdate();
	}

	setSelectedDataSource=(dataSource:IDataSource)=>
	{
		this.setState({
			selected: dataSource
		});
	}

	getSelectedDataSource()
	{
		let sources = this.props.weave.root.getObjects(IDataSource);
		var selected = this.state.selected;
		if (!selected || Weave.wasDisposed(selected))
		{
			this.selectedIndex = Math.max(0, Math.min(this.selectedIndex, sources.length - 1));
			selected = sources[this.selectedIndex];
		}
		else
		{
			this.selectedIndex = sources.indexOf(selected);
		}
		
		return selected;
	}

	refreshDataSource(dataSource:IDataSource)
	{
		dataSource.hierarchyRefresh.triggerCallbacks();
		
		// TEMPORARY SOLUTION until all data sources behave correctly - force creating a new copy
		var root = this.props.weave.root;
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
		let root = this.props.weave.root;
		root.removeObject(root.getName(dataSource));
	}

	handleDataFileDrop = (file:File):void =>
	{
		var extension = file.name.split('.').pop();
		if(this.props.fileMenu.getSupportedFileTypes(true).indexOf('.' + extension) != -1)//if file supported
		{
			this.props.fileMenu.handleOpenedFile(file);
		}
		else
		{
			console.log("This data format is not supported yet");//TODO report this status in the editor?
		}

	};

	render():JSX.Element
	{
		let root = this.props.weave.root;

		let listOptions:ListOption[] = root.getObjects(IDataSource).map(dataSource => {
			let icon = "fa fa-fw " + (dataSource.isLocal ? "fa-file-o" : "fa-globe");
			let iconMessage = dataSource.isLocal ? "Does not use remote resources." : "Uses remote resources.";
			return {
				label: (
					<HBox padded style={{flex: 1, alignItems: "center"}}>
						<CenteredIcon className="" iconProps={{ className: icon, title: Weave.lang(iconMessage) }}/>
						<Label style={{flex: 1}} children={dataSource.getLabel()}/>
						<CenteredIcon onClick={()=>this.refreshDataSource(dataSource)}
						              iconProps={{ className: "fa fa-refresh", title: Weave.lang("Refresh this datasource") }}/>
						<CenteredIcon onClick={()=>this.removeDataSource(dataSource)}
						              iconProps={{ className: "fa fa-times", title: Weave.lang("Delete this datasource") }}/>
					</HBox>
				),
				value: dataSource
			};
		});

		let editorJsx:JSX.Element;
		let dataSource = this.getSelectedDataSource();

		let editorStyle:React.CSSProperties = {
			flex: 1
		};

		if (dataSource && !Weave.wasDisposed(dataSource))
		{
			let EditorClass = DataSourceManager.editorRegistry.get(dataSource.constructor as typeof IDataSource);
			if (EditorClass)
			{
				editorJsx = (
					<VBox className="weave-data-source-manager-editor" style={editorStyle}>
						<EditorClass dataSource={dataSource}/>
					</VBox>
				);
			}
			else
			{
				_.merge(editorStyle, {justifyContent: "center", alignItems: "center"});
				editorJsx = (
					<VBox className="weave-data-source-manager-editor" style={editorStyle}>
						<div className="ui centered header">
							{Weave.lang("Editor not yet implemented for this data source type.")}
						</div>
					</VBox>
				);
			}

		}
		else
		{
			_.merge(editorStyle, {justifyContent: "center", alignItems: "center", width: '100%', position:'relative', fontSize:'24px'});
			editorJsx = (
				<div style={{padding: '10px', display: "flex", flex: 1}}>
					<Dropzone
						style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1}}
						className={"weave-dropzone-file"}
						activeStyle={{border: "8px solid #CCC"}}
						onDropAccepted={(files:File[]) => {
							files.forEach((file) => {
								this.handleDataFileDrop(file);
							});
							this.setState({
								rejected:false /*to remove the status of a previous rejection*/
							});
						}}
						onDropRejected={(files:File[]) => {
							this.setState({
								rejected:true
							});
						}}
						accept=".csv,.geojson,.json,.txt,.tsv,.xls,.shp,.dbf"
						disableClick={false}
					>
						<VBox className="weave-data-source-manager-editor" style={editorStyle}>
							<span className="fa fa-files-o fa-th-large fa-5x"></span>

							<VBox style={{ display: 'flex', fontSize: '16px', padding: '15', alignItems : 'center'}}>
								{"Drag and drop a data file to create a datasource"}
							</VBox>

							{this.state.rejected ?
							<LogComponent style={{left:'10px', top:'10px',right:'10px',flex:1, position:'absolute', fontSize:'medium'}} header={ Weave.lang("File Import Error") }
							              messages={ [Weave.lang("The specified file could not be imported. Only files with the following extensions are allowed: .csv, .tsv, .txt, .shp, .dbf, .geojson, .zip, .json")] }
							              clearFunc={ (event)=> {
							                this.setState({rejected:false});
							                event.stopPropagation();/* without this when the close icon is clicked it causes the file explorer to open*/
							              } }
							/>
								: null}

						</VBox>
					</Dropzone>
				</div>
			);
		}

		return (
			<HBox className="ui bottom attached segments" style={ {flex: 1} }  onMouseEnter={() => this.forceUpdate()} >
				<VBox style={{width: 250}} className="weave-data-source-manager-sidebar">
					<VBox className="ui vertical attached segments" style={{flex:1, justifyContent:"space-between",border:"none",borderRadius:0}}>
						<VBox className="ui basic inverted segment" style={{flex: 1, overflow: "auto", padding: 0,border:"none",borderRadius:0}}>
							<div className="ui medium header" style={{padding: 0, paddingLeft: 14, paddingTop: 14}}>{Weave.lang("Connected data sources")}</div>
							<VBox style={{alignItems: listOptions.length ? null:"center"}}>
								{
									listOptions.length
									?	<List
											options={listOptions}
											multiple={false}
											selectedValues={ [dataSource] }
											onChange={ (selectedValues:IDataSource[]) => { this.setSelectedDataSource(selectedValues[0]);  }}
										/>
									:	<div className="weave-list-item" style={{alignSelf: "flex-start", cursor: "default", pointerEvents: "none"}}>
											{Weave.lang("(None)")}
										</div>
								}
							</VBox>
						</VBox>
						<VBox className="ui inverted segment" style={{overflow: "auto", padding: 0, border:"none",borderRadius:0}}>
							<div className="ui medium header" style={{ paddingLeft: 14, paddingTop: 14}}>{Weave.lang("Add more data sources")}</div>
							{
								DataMenu.getDataSourceItems(this.props.weave, this.setSelectedDataSource).map((dsItem, index) => {
									return dsItem.shown
										?   <HBox key={index}
										          ref={InteractiveTour.enable ? InteractiveTour.getComponentRefCallback(dsItem.label as string) : null}
										          onClick={() => {dsItem.click(); InteractiveTour.enable? InteractiveTour.targetComponentOnClick(dsItem.label as string) : null} }
										          className="weave-data-source-item"
										          style={{justifyContent: "space-between", padding: 5}}>
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
