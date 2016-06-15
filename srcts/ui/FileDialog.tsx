import * as _ from "lodash";
import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import CenteredIcon from "../react-ui/CenteredIcon";
import SmartComponent from "./SmartComponent";
import WeaveServerFileOpenComponent from "./WeaveServerFileOpenComponent";
import LocalFileOpenComponent from "./LocalFileOpenComponent";

import WeavePromise = weavejs.util.WeavePromise;
import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;

export interface FileListItem {
	label:string;
	iconClass:string;
	isNewFile?:boolean;
}

export interface IOpenFileProps {
	openHandler:(file:string|File) => void;
	context?:React.ReactInstance;
}

export interface IOpenFileState {
	rejected?:boolean;
	fileInfo?:WeaveFileInfo;
	fileNames?:string[];
	allFiles?:boolean;
}

export interface IFileDialogProps extends React.Props<FileDialog>
{
	openHandler:(file:string|File) => void;
	skipConfirmation?: boolean; /* If true, don't ask for confirmation before loading the session */
	context:React.ReactInstance;
}

export interface IFileDialogState
{
	selected?:FileListItem;
}

export default class FileDialog extends SmartComponent<IFileDialogProps, IFileDialogState> {
	static NEW_SESSION:FileListItem = {label: "New Session", iconClass: "fa fa-fw fa-file", isNewFile: true};
	static MY_COMPUTER:FileListItem = {label: "My Computer", iconClass: "fa fa-fw fa-desktop"};
	static WEAVE_SERVER:FileListItem = {label: "Weave Server", iconClass: "fa fa-fw fa-server"};
	static listItems = [FileDialog.NEW_SESSION, FileDialog.MY_COMPUTER, FileDialog.WEAVE_SERVER];
	static window:PopupWindow;

	static storageRegistry = new Map<FileListItem, React.ComponentClass<IOpenFileProps>>()
		.set(FileDialog.MY_COMPUTER, LocalFileOpenComponent)
		.set(FileDialog.WEAVE_SERVER, WeaveServerFileOpenComponent);

	constructor(props:IFileDialogProps)
	{
		super(props);
		this.state = {selected: FileDialog.MY_COMPUTER};
	}

	static close()
	{
		if (FileDialog.window)
		{
			PopupWindow.close(FileDialog.window);
			FileDialog.window = null;
		}
	}
	
	static open(context:React.ReactInstance, openHandler:(file:string|File) => void, skipConfirmation?: boolean)
	{
		if (FileDialog.window)
			PopupWindow.close(FileDialog.window);

		FileDialog.window = PopupWindow.open(context, {
			title: Weave.lang("Open a Weave Session"),
			content:
				<FileDialog openHandler={openHandler} context={context} skipConfirmation={skipConfirmation}/>,
			footerContent: <div/>,
			resizable: false,
			draggable: false,
			modal: true,
			suspendEnter: true,
			width: "95%",
			height: "95%",
			onClose: FileDialog.close
		});
	}

	confirmOpenHandler=(file:string|File)=>
	{
		if (!this.props.skipConfirmation)
		{
			PopupWindow.open(this.props.context, {
				title: Weave.lang("Load Session"),
				content: (
					<VBox style={{ flex: 1, justifyContent: "center" }}>
						<HBox style={{ flex: 1, alignItems: "center" }}>
							<i style={{ fontSize: 50, marginLeft: 15 }} className="fa fa-exclamation-triangle weave-exclamation-triangle"></i>
							<div style={{ margin: 0, marginLeft: 5 }} className="ui basic segment">
								<div className="ui basic header">
									{
										file
										?	Weave.lang("Are you sure you want to open this session? This will overwrite your current workspace.")
										:	Weave.lang("Are you sure you want start a new session? This will overwrite your current workspace.")
									}
								</div>
							</div>
						</HBox>
					</VBox>
				),
				resizable: false,
				modal: true,
				width: 480,
				height: 230,
				onOk: () => {
					this.props.openHandler(file);
					FileDialog.close();
				},
			});
		}
		else
		{
			this.props.openHandler(file);
			FileDialog.close();
		}
	};

	componentDidMount()
	{

	}

	render():JSX.Element
	{
		let editorJsx:JSX.Element;
		let fileSource = this.state.selected;
		let EditorClass = FileDialog.storageRegistry.get(fileSource);
		if (EditorClass)
			editorJsx = (
				<EditorClass
					openHandler={this.confirmOpenHandler}
					context={this.props.context}
				/>
			);
		let listOptions:ListOption[] = FileDialog.listItems.map((fileSource:FileListItem) => {
			return {
				label: (
					<HBox className="weave-padded-hbox" style={{padding: 15, alignItems: "center"}}>
						<HBox>
							<CenteredIcon className=" " iconProps={{ className: fileSource.iconClass, title: fileSource.label}} style={{fontSize: 26}}/>
							{
								fileSource.isNewFile
								?	<div style={{position: "relative"}}>
										<i className="fa fa-asterisk" style={{fontSize: "0.5em", position: "absolute", right: 0}}/>
									</div>
								:	null
							}
						</HBox>
						<span style={{overflow: "hidden", marginLeft: 20}}>{fileSource.label}</span>
					</HBox>
				),
				value: fileSource
			};
		}).filter(_.identity);
		
		return (
				<div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "row"}}>
					<VBox className="ui attached inverted segment" style={ {width: 250, padding: 0, marginBottom: 0} }>
						<List
							options={listOptions}
							multiple={false}
							selectedValues={ [fileSource] }
							onChange={ (selectedValues:FileListItem[]) => {
								if (selectedValues[0] == FileDialog.NEW_SESSION)
								{
									this.forceUpdate();
									weavejs.WeaveAPI.Scheduler.callLater(this, this.confirmOpenHandler, [null]);
								}
								else
								{
									this.setState({
										selected: selectedValues[0]
									});
								}
							}}
						/>
					</VBox>
					<div className="ui basic segment weave-file-picker-editor" style={{display: "flex", flex: 1, marginTop: 0, padding: 0}}>
						{editorJsx}
					</div>
				</div>
		)
	}
}