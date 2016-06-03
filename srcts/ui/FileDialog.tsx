import * as React from "react";
import * as ReactDOM from "react-dom";
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
import SmartComponent from "./SmartComponent";
import ConfirmationDialog from "./ConfirmationDialog";
import ServiceLogin from "../ui/admin/ServiceLogin";

import WeavePromise = weavejs.util.WeavePromise;
import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;


export interface IOpenFileProps {
	openUrlHandler:(url:string, pushHistory:boolean) => void;
	openFileHandler:(file:File) => void;
}

export interface IOpenFileState {
	rejected?:boolean;
	fileInfo?:WeaveFileInfo;
	fileNames?:string[];
	allFiles?:boolean;
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
		if (file)
			FileDialog.openHandler(file, this.props.openFileHandler);
	};

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1, alignItems: "center", padding: 10}}>
				<VBox style={{flex: 1, alignItems: "center"}}>
					<Dropzone
						style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1}}
						className={this.state.rejected ? "weave-dropzone-file-error":"weave-dropzone-file"}
						activeStyle={{border: "8px solid #CCC"}}
					    onDropAccepted={(files:File[]) => {
							files.map((file) => {
								FileDialog.openHandler(file,this.props.openFileHandler);
							});
						}}
					    onDropRejected={(files:File[]) => {
							this.setState({
								rejected: true
							})
						}}
					    accept=".weave"
					    disableClick={false}
					>
						<span>{Weave.lang("Click to open a .weave file")}</span>
						<div className="ui horizontal divider" style={{width: "50%"}}>{Weave.lang("Or")}</div>
						<VBox style={{alignItems: "center"}}>
							<span>{Weave.lang("Drag it here")}</span>
							{this.state.rejected ? <span>{Weave.lang("The specified file could not be uploaded. Only files with the following extensions are allowed: weave")}</span>:""}
						</VBox>
					</Dropzone>
				</VBox>
			</VBox>
		);
	}
}

export class WeaveServerFileOpen extends SmartComponent<IOpenFileProps, IOpenFileState> {

	element:Element;
	dimmerSelector:any;
	login:ServiceLogin;
	constructor(props:IOpenFileProps)
	{
		super(props);
		this.state = {
			fileInfo:null,
			fileNames:[],
			allFiles:true
		}
	}

	handleSuccess=(fields:any) => {
		this.getWeaveFiles();
	};

	getWeaveFiles=() => {
		weavejs.net.Admin.service.getWeaveFileNames(this.state.allFiles).then( (fileNames:string[]) => {
			this.setState({
				fileNames
			});
		},(error:any) => {
			this.login.open();
		});
	};

	handleCancel=() => {
		this.setState({
			fileNames: []
		});
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		this.forceUpdate();
	}

	componentDidUpdate()
	{
		this.getWeaveFiles();
	}

	render():JSX.Element
	{
		this.dimmerSelector = FileDialog.element;

		let fileList:ListOption[] = this.state.fileNames.map((file:any) => {
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
				filename: file.value,
				filelabel: (
					<HBox className="weave-padded-hbox" >
						<CenteredIcon iconProps={{className: "fa fa-file-text-o fa-fw"}}/>
						{file.value}
					</HBox>
				)
			} as IRow
		});
		let columnIds = ["filename","filelabel"];
		let columnTitles:IColumnTitles = {};

		let fileLocationForm:JSX.Element = (
			<div className="ui form" style={{paddingLeft: "1rem"}}>
				<div className="inline fields">
					<div className="ui grid" style={{flex: 1}}>
						<div className="two column row">
							<div className="right floated column">
								<div className="field">
									<div className="ui radio checkbox">
										<input type="radio" checked={!this.state.allFiles} onChange={(e:any) => {
										this.setState({
											allFiles: false
										});
									}}/>
										<label>{Weave.lang("My files")}</label>
									</div>
								</div>
							</div>
							<div className="column">
								<div className="field">
									<div className="ui radio checkbox">
										<input type="radio" checked={this.state.allFiles} onChange={(e:any) => {
										this.setState({
											allFiles: true
										});
									}}/>
										<label>{Weave.lang("All files")}</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);

		return (
			<VBox style={{flex: 1, padding: 10}}>
				<HBox className="weave-server-file-view" style={{flex: 1}}>
					<VBox style={{flex: 1}}>
						{fileLocationForm}
						<VBox style={{flex: 1, border: "1px solid #D6D6D6"}}>
							<FixedDataTable rows={rows}
							                columnIds={columnIds}
							                idProperty="filename"
							                showIdColumn={false}
							                columnTitles={columnTitles}
							                multiple={false}
							                disableSort={true}
							                headerHeight={0}
							                rowHeight={40}
							                onSelection={(selectedFiles:string[]) => {
						                    if(selectedFiles[0])
												weavejs.net.Admin.service.getWeaveFileInfo(selectedFiles[0]).then(
													(fileInfo:WeaveFileInfo) => {
														this.setState({
															fileInfo
														});
													},
													(error:any) => {
														this.login.open();
													}
												);
						                }}
							/>
						</VBox>
					</VBox>
					<VBox style={ {flex: 1, paddingLeft: 20} }>
						<FileInfoView fileInfo={this.state.fileInfo}>
							{this.state.fileInfo ?
								<Button
									onClick={() => {
					                    FileDialog.openHandler("/" + this.state.fileInfo.fileName,this.props.openUrlHandler);
									}}
								    style={{marginLeft: 8}}
								>
									{Weave.lang("Load Session")}
								</Button>:null}
						</FileInfoView>
					</VBox>
				</HBox>
				<ServiceLogin ref={(c: ServiceLogin) => this.login = c} service={weavejs.net.Admin.service} onSuccess={this.handleSuccess} onCancel={this.handleCancel} context={this.dimmerSelector}/>
			</VBox>
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
	selected?:string;
}

export default class FileDialog extends SmartComponent<IFileDialogProps, IFileDialogState> {
	static listItems:{[key:string]:string}[] = [{label: "My Computer" , iconClass:"fa fa-desktop"}, {label: "Weave Server", iconClass: "fa fa-server"}];
	static element:Element;

	static storageRegistry = new Map< String, React.ComponentClass<IOpenFileProps>>()
		.set("My Computer", LocalFileOpen)
		.set("Weave Server", WeaveServerFileOpen);

	constructor(props:IFileDialogProps)
	{
		super(props);
		this.state = {selected: "My Computer"};
	}

	static close()
	{
		($(FileDialog.element) as any).modal('hide');
	}
	
	static open()
	{
		($(FileDialog.element) as any)
			.modal({
				detachable: false,
				transition: "fade",
				allowMultiple: true,
				onDeny: () => {
					return false;
				}
			})
			.modal('show');
	}

	static openHandler(file:string|File,handler:Function)
	{
		ConfirmationDialog.open(
			() => {
				handler(file);
				FileDialog.close();
			},
			() => {
				ConfirmationDialog.close();
			},
			$(FileDialog.element));
	};

	componentDidMount()
	{
		FileDialog.element = ReactDOM.findDOMNode(this);
	}

	render():JSX.Element
	{
		let editorJsx:JSX.Element;
		let fileSource = this.state.selected;
		let EditorClass = FileDialog.storageRegistry.get(fileSource);
		if (EditorClass)
			editorJsx = <EditorClass openFileHandler={this.props.openFileHandler} openUrlHandler={this.props.openUrlHandler}/>;
		let listOptions:ListOption[] = FileDialog.listItems.map((fileSource:any) => {
			return {
				label: (
					<HBox className="weave-padded-hbox" style={{padding: 15, alignItems: "center"}}>
						<HBox>
							<CenteredIcon iconProps={{ className: fileSource.iconClass, title: fileSource.label}} style={{fontSize: 26}}/>
						</HBox>
						<span style={{overflow: "hidden", marginLeft: 20}}>{fileSource.label}</span>
					</HBox>
				),
				value: fileSource.label
			};
		});
		
		return (
			<div className="ui fullscreen modal">
				<i className="close icon"/>
				<div className="header">
					{Weave.lang("Open a Weave Session")}
				</div>
				<div className="content" style={{padding:0}}>
					<div style={{height: 675, flex: 1, overflow: "auto", display: "flex", flexDirection: "row"}}>
						<VBox className="ui attached inverted segment" style={ {width: 250, padding: 0, marginBottom: 0} }>
							<List
								options={listOptions}
								multiple={false}
								selectedValues={ [fileSource] }
								onChange={ (selectedValues:string[]) => {
									this.setState({
										selected: selectedValues[0]
									})
								}}
							/>
						</VBox>
						<div className="ui basic segment" style={{display: "flex", flex: 1, marginTop: 0, padding: 0}}>
							{editorJsx}
						</div>
					</div>
					<ConfirmationDialog title={Weave.lang("Load Session:")}
					                    content={Weave.lang("Are you sure you want to open this session? This will overwrite your current workspace.")}
					                    okButtonContent={Weave.lang("Load Session")}
					                    cancelButtonContent={Weave.lang("Cancel")}/>
				</div>
			</div>
		)
	}
}