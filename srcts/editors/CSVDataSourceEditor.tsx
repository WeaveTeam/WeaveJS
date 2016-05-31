import * as React from "react";
import * as _ from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import GuidanceToolTip from "../react-ui/GuidanceToolTip";
import GuidanceContainer from "../react-ui/GuidanceContainer";
import FileSelector from "../ui/FileSelector";
import FixedDataTable from "../tools/FixedDataTable";
import DataSourceEditor from "./DataSourceEditor";
import KeyTypeInput from "../ui/KeyTypeInput";
import ComboBox from "../semantic-ui/ComboBox";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import HelpIcon from "../react-ui/HelpIcon";

import CSVDataSource = weavejs.data.source.CSVDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
import {ComboBoxOption} from "../semantic-ui/ComboBox";

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
		if(ds.url.value){
			this.setState({
				guideToTab:"Browse"
			})
		}
		if (ds.keyType.value === null && ds.url.value)
		{
			ds.keyType.value = ds.url.value;
			//Todo: Put this in a grouped callback, will be fixed with key type issue in csv datasource
			this.forceUpdate();
		}
	}
	
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
		} else {
			validExtension = true;
		}
		let columnIds:ComboBoxOption[] = ds.getColumnIds().map( (id, index) => {
			return {label: ds.getColumnTitle(id), value: id}
		});
		columnIds.unshift({label:Weave.lang("Auto-generated keys"), value: null});

		let enableGuidance:boolean = this.props.enableGuidance && !ds.url.value;

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(ds.label),
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("URL")}
					<HelpIcon className={validExtension ? "":"fa-exclamation-triangle"} style={{color:validExtension? null:"#794B02"}}>
						<VBox>
							{validExtension ? Weave.lang("The URL of the file to be used"):Weave.lang("Warning: The file you have chosen has an extension that does not match the expected extension.")}
						</VBox>
					</HelpIcon>
				</HBox>,
				<GuidanceContainer enable={enableGuidance}
				                   direction={GuidanceContainer.VERTICAL}
				                   location={GuidanceToolTip.BOTTOM_RIGHT}
				                   type={GuidanceContainer.NEXT}
				                   toolTip="Click to add CSV File">
					<FileSelector targetUrl={ds.url}
					              placeholder={Weave.lang("http://www.example.com/example.csv")}
					              style={ {width: "100%"} }
					              accept={acceptExtension}/>
				</GuidanceContainer>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key column")}
					<HelpIcon className={keysAreUnique ? "":"fa-exclamation-triangle"} style={{color:keysAreUnique? null:"#A34341"}}>
						<VBox>
							{keysAreUnique ? Weave.lang("A Column that can uniquely identify each row in the data. If there are no such columns, choose \"Auto-generated keys\""):Weave.lang("Warning: You have chosen a key column that is not unique.")}
						</VBox>
					</HelpIcon>
				</HBox>,
				<ComboBox style={{width: "100%"}}
				          ref={linkReactStateRef(this, { value: ds.keyColumn }) } /* searchable field */
				          options={columnIds}
				          className={keysAreUnique ? "":"error"}
				/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key namespace")}
					<HelpIcon>{Weave.lang("Key namespaces are used to link tables using matching key columns.")}</HelpIcon>
				</HBox>,
				<KeyTypeInput keyTypeProperty={ds.keyType}/>
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
	
		if (weavejs.WeaveAPI.Locale.reverseLayout)
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
					{/*<FixedDataTable columnTitles={columnTitles}
								 	rows={records}
								 	idProperty={''}/>
					*/}
				</div>
			</div>
		);
	}
}
