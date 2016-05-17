import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import CenteredIcon from "../react-ui/CenteredIcon";
import Dropzone from "../modules/Dropzone";
import FixedDataTable from "../tools/FixedDataTable";
import {IRow, IColumnTitles} from "../tools/FixedDataTable";
import FileInfoView from "./FileInfoView";
import Button from "../semantic-ui/Button";
import FileInput from "../react-ui/FileInput";

import WeavePromise = weavejs.util.WeavePromise;
import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;


export interface IOpenFileProps {
	openUrlHandler:(url:string) => void;
	openFileHandler:(file:File) => void;
	fileNames:string[];
}

export interface IOpenFileState {
	rejected?:boolean;
	fileInfo?:WeaveFileInfo;
}

export class LocalFileOpen extends React.Component<IOpenFileProps, IOpenFileState> {

	constructor(props:IOpenFileProps)
	{
		super(props);
		this.state = {
			rejected:false
		}
	}

	handleFileChange=(event:React.FormEvent)=>
	{
		let file = (event.target as HTMLInputElement).files[0] as File;
		this.props.openFileHandler(file);
		PopupWindow.close(FileDialog.window);
	};

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1, alignItems: "center", marginLeft: 20, marginRight: 20}}>
				<FileInput onChange={this.handleFileChange} accept={".weave"}>
					<Button className="fluid" style={{width:"100%", justifyContent: "center", borderRadius: ".28571429rem"}}>
						{Weave.lang("Open a local session")}
					</Button>
				</FileInput>
				<div className="ui horizontal divider">{Weave.lang("Or")}</div>
				<VBox style={{flex: 1, alignItems: "center", width: "100%"}}>
					<Dropzone
						style={{}}
						className={this.state.rejected ? "weave-dropzone-file-error":"weave-dropzone-file"}
						activeStyle={{border: "8px solid #CCC"}}
					    onDropAccepted={(files:File[]) => {
							files.map((file) => {
								this.props.openFileHandler(file);
							});
							PopupWindow.close(FileDialog.window);
						}}
					    onDropRejected={(files:File[]) => {
							this.setState({
								rejected: true
							})
						}}
					    accept=".weave"
					    disableClick={true}
					>
						<VBox style={{flex: 1, alignItems: "center"}}>
							<span>{Weave.lang("Drag weave session here")}</span>
							{this.state.rejected ? <span>{Weave.lang("The specified file could not be uploaded. Only files with the following extensions are allowed: weave")}</span>:""}
						</VBox>
					</Dropzone>
				</VBox>
			</VBox>
		);
	}
}

export class WeaveServerFileOpen extends React.Component<IOpenFileProps, IOpenFileState> {

	constructor(props:IOpenFileProps)
	{
		super(props);
		this.state = {
			fileInfo:null
		}
	}

	render():JSX.Element
	{

		let fileList:ListOption[] = this.props.fileNames.map((file:any) => {
			return {
				label: (
					<HBox style={{justifyContent: "space-between", alignItems:"center"}}>
						<span style={{overflow: "hidden"}}>{file}</span>
					</HBox>
				),
				value: file
			};
		});

		let rows:IRow[] = fileList.map((file:ListOption) => {
			return {
				filename: file.value
			} as IRow
		});
		let columnIds = ["filename"];
		let columnTitles:IColumnTitles = {
			filename: Weave.lang("Filename")
		};

		return (
			<HBox style={{flex: 1, marginLeft: 20, marginRight: 20}}>
				<VBox style={{flex: 1}}>
					<FixedDataTable rows={rows}
					                columnIds={columnIds}
					                idProperty="filename"
					                showIdColumn={true}
					                columnTitles={columnTitles}
					                multiple={false}
					                onSelection={(selectedFiles:string[]) => {
										weavejs.net.Admin.service.getWeaveFileInfo(selectedFiles[0]).then( (fileInfo:WeaveFileInfo) => {
											this.setState({
												fileInfo
											});
										});
					                }}
					/>
				</VBox>
				<VBox style={ {flex: 1, paddingLeft: 20} }>
					<FileInfoView className="weave-container" fileInfo={this.state.fileInfo}>
						{this.state.fileInfo ? <VBox style={{flex: 1, justifyContent: "flex-end"}}><Button
							onClick={() => {
				                    this.props.openUrlHandler("/" + this.state.fileInfo.fileName);
				                    PopupWindow.close(FileDialog.window);
						}}
						>
							{Weave.lang("Load Session")}
						</Button></VBox>:null}
					</FileInfoView>
				</VBox>
			</HBox>
		);
	}
}

export interface IFileDialogProps extends React.Props<FileDialog>
{
	openUrlHandler:(url:string) => void;
	openFileHandler:(file:File) => void;
}

export interface IFileDialogState
{
	fileNames:string[];
}

export default class FileDialog extends React.Component<IFileDialogProps, IFileDialogState> {
	static window:PopupWindow;
	static listItems:{[key:string]:string}[] = [{label: "My Computer" , iconClass:"fa fa-desktop"}, {label: "Weave Server", iconClass: "fa fa-server"}];
	static activeListIndex:number = 0;
	static selected:string;

	static storageRegistry = new Map< String, React.ComponentClass<IOpenFileProps>>()
		.set("My Computer", LocalFileOpen)
		.set("Weave Server", WeaveServerFileOpen);

	constructor(props:IFileDialogProps)
	{
		super(props);
		FileDialog.selected = "My Computer";
		this.state = {fileNames: []};
	}

	static close(window:PopupWindow)
	{
		FileDialog.window = null;
	}

	static open(openUrl:(url:string) => void, openFile:(file:File) => void)
	{
		if (FileDialog.window)
			PopupWindow.close(FileDialog.window);

		FileDialog.window = PopupWindow.open({
			title: Weave.lang("File Picker"),
			content: <FileDialog openUrlHandler={openUrl} openFileHandler={openFile}/>,
			resizable: true,
			width: 920,
			height: 675,
			onClose: FileDialog.close
		});
	}

	render():JSX.Element
	{
		let editorJsx:JSX.Element;
		let fileSource = FileDialog.selected;
		let EditorClass = FileDialog.storageRegistry.get(fileSource);
		if (EditorClass)
			editorJsx = <EditorClass openFileHandler={this.props.openFileHandler} openUrlHandler={this.props.openUrlHandler} fileNames={this.state.fileNames}/>;
		let listOptions:ListOption[] = FileDialog.listItems.map((fileSource:any) => {
			return {
				label: (
					<HBox className="weave-padded-hbox">
						<HBox>
							<CenteredIcon iconProps={{ className: fileSource.iconClass, title: fileSource.label }}/>
						</HBox>
						<span style={{overflow: "hidden"}}>{fileSource.label}</span>
					</HBox>
				),
				value: fileSource.label
			};
		});
		
		return (
			<HBox style={{flex: 1}}>
				<VBox className="weave-container" style={ {width: 150, padding: 0} }>
					<List
						options={listOptions}
						multiple={false}
						selectedValues={ [fileSource] }
						onChange={ (selectedValues:string[]) => {
							FileDialog.selected = selectedValues[0];
							if(FileDialog.selected === "Weave Server"){
								if(weavejs.net.Admin.service.authenticated.value)
								{
									console.log("Already Authenticated");
									weavejs.net.Admin.service.getWeaveFileNames(true).then( (fileNames:string[]) => {
										this.setState({
											fileNames
										});
									});
								} else {
									weavejs.net.Admin.service.authenticate("zach","zach").then(() => {
										weavejs.net.Admin.service.getWeaveFileNames(true).then( (fileNames:string[]) => {
											this.setState({
												fileNames
											});
										});
									});
								}


							} else {
								this.setState({
									fileNames:[]
								})
							}
						}}
					/>
				</VBox>
				<VBox style={ {flex: 1, overflow:'auto'} }>
					{editorJsx}
				</VBox>
			</HBox>
		)
	}
}