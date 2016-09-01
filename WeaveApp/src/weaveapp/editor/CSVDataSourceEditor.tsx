import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";

import {WeaveAPI} from "weavejs";

import StatefulTextField = weavejs.ui.StatefulTextField;
import WeaveReactUtils = weavejs.util.WeaveReactUtils
import ReactUtils = weavejs.util.ReactUtils;
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import ComboBox = weavejs.ui.ComboBox;
import HelpIcon = weavejs.ui.HelpIcon;
import CSVDataSource = weavejs.data.source.CSVDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
import IColumnReference = weavejs.api.data.IColumnReference;
import ComboBoxOption = weavejs.ui.ComboBoxOption;
import PopupWindow = weavejs.ui.PopupWindow;
import Button = weavejs.ui.Button;
import {MetadataEntry} from "weaveapp/editor/MetadataGrid";
import CSVMetadataEditor from "weaveapp/editor/CSVMetadataEditor";
import DataSourceEditor, {IDataSourceEditorProps} from "weaveapp/editor/DataSourceEditor";
import InteractiveTour from "weaveapp/dialog/InteractiveTour";
import KeyTypeInput from "weaveapp/ui/KeyTypeInput";
import FileSelector from "weaveapp/ui/FileSelector";

export default class CSVDataSourceEditor extends DataSourceEditor
{
	private _dataSourceNode:ColumnTreeNode;
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}

	onUrlChange()
	{
		let ds = (this.props.dataSource as CSVDataSource);
		if (ds.url.value)
		{
			this.setState({
				guideToTab: "Browse"
			})
		}
		if (ds.keyType.value === null && ds.url.value)
		{
			ds.keyType.value = ds.url.value;
			//Todo: Put this in a grouped callback, will be fixed with key type issue in csv datasource
			this.forceUpdate();
		}
	}

	handleMetadataUpdate=(newMeta:MetadataEntry, selectedIds:Array<number|string>) =>
	{
		//handle a metadata update for the specified entry and key:value pair
		let ds = (this.props.dataSource as CSVDataSource);
		let newState:{[key:string]:any} = ds.metadata.getSessionState() || {};
		selectedIds.forEach( (id:number|string, index:number) => {
			var currentMeta:Object = ds.generateMetadataForColumnId(id);
			newState[id] = WeaveAPI.SessionManager.combineDiff(currentMeta, newMeta);

			// remove missing values
			_.forEach(newState[id], (value:any, key:string) => {
				if(!newState[id][key])
					delete newState[id][key];
			});
		});

		ds.metadata.setSessionState(newState);
	};

	handleProps(props:IDataSourceEditorProps)
	{
		super.handleProps(props);

		let ds = (props.dataSource as CSVDataSource);
		if (this.props.dataSource)
		{
			let old_ds = (this.props.dataSource as CSVDataSource);
			Weave.getCallbacks(old_ds.url).removeCallback(this, this.onUrlChange);
		}
		Weave.getCallbacks(ds.url).addGroupedCallback(this, this.onUrlChange);
	}

	openMetadataEditor = PopupWindow.generateOpener(() => ({
		context: this,
		title: Weave.lang("Edit Column Metadata"),
		content: <CSVMetadataEditor
			datasource={this.props.dataSource as CSVDataSource}
			onChangeCallback={this.handleMetadataUpdate}
		/>,
		resizable: true,
		width: 920,
		footerContent: <div/>,
		height: 675,
		suspendEnter: true
	}));

	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let ds = (this.props.dataSource as CSVDataSource);
		let keysAreUnique:boolean = ds.keysAreUnique;
		let validExtension:boolean;
		let acceptExtension:string = "text/csv,.csv";
		if (ds.url.value)
		{
			let extension = ds.url.value.split('.').pop();
			validExtension = _.includes(acceptExtension.split(','),"."+extension);
		}
		else
		{
			validExtension = true;
		}
		let columnIds:ComboBoxOption[] = ds.getColumnIds().map( (id, index) => {
			return {label: ds.getColumnTitle(id), value: id}
		});
		columnIds.unshift({label:Weave.lang("Auto-generated keys"), value: null});

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Location")}
					<HelpIcon className={validExtension ? "" : "fa-exclamation-triangle"} style={{color: validExtension ? null : "#794B02"}}>
						<VBox>
							{
								validExtension
								?	Weave.lang("The location of the CSV file for this data source")
								:	Weave.lang("Warning: The file you have chosen has an extension that does not match the expected extension.")
							}
						</VBox>
					</HelpIcon>
				</HBox>,
				/* id, ref, onFileChange are added for Guidance , id and onFileChange argument has to match as they represent step name */
				<FileSelector
					targetUrl={ds.url}
					ref={InteractiveTour.getComponentRefCallback("Location")}
					onFileChange={() => InteractiveTour.targetComponentOnClick("Location")}
					placeholder={Weave.lang("http://www.example.com/example.csv")}
					style={ {width: "100%"} }
					accept={acceptExtension}
				/>
			],
			this.getLabelEditor(ds.label),
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key column")}
					<HelpIcon className={keysAreUnique ? "":"fa-exclamation-triangle"} style={{color:keysAreUnique? null:"#A34341"}}>
						<VBox>
							{keysAreUnique ? Weave.lang("A Column that can uniquely identify each row in the data. If there are no such columns, choose \"Auto-generated keys\""):Weave.lang("Warning: You have chosen a key column that is not unique.")}
						</VBox>
					</HelpIcon>
				</HBox>,
				<ComboBox
					style={{width: "100%"}}
					ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.keyColumn }) } /* searchable field */
					options={columnIds}
					placeholder={Weave.lang("Auto-generated keys")}
					className={keysAreUnique ? "":"error"}
				/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key namespace")}
					<HelpIcon>{Weave.lang("Key namespaces are used to link tables using matching key columns.")}</HelpIcon>
				</HBox>,
				<KeyTypeInput keyTypeProperty={ds.keyType}/>
			],
			[
				Weave.lang("Edit Metadata"),
				<Button onClick={this.openMetadataEditor}>{Weave.lang("Edit Column Metadata...") }</Button>
			]
		];
		return super.editorFields.concat(editorFields);
	}

	renderChildEditor():JSX.Element
	{
		let ds = this.props.dataSource as CSVDataSource;
		let idProperty = '';
		var columnNames = ds.getColumnNames();
		var columns = columnNames.map((name) => ds.getColumnByName(name));

		if (WeaveAPI.Locale.reverseLayout)
		{
			columns.reverse();
			columnNames.reverse();
		}

		var format:any = _.zipObject(columnNames, columns);
		format[idProperty] = IQualifiedKey;

		var keys = ColumnUtils.getAllKeys(columns);
		var records = ColumnUtils.getRecords(format, keys, String);

		var titles:string[] = columns.map(column => Weave.lang(column.getMetadata("title")));
		var columnTitles = _.zipObject(columnNames, titles) as { [columnId: string]: string; };

		return (
			<div style={{flex: 1, position: "relative"}}>
				<div style={{position: "absolute", width: "100%", height: "100%", overflow: "scroll"}}>
					{/*<DataTable columnTitles={columnTitles}
									rows={records}
									idProperty={''}/>
					*/}
				</div>
			</div>
		);
	}
}
