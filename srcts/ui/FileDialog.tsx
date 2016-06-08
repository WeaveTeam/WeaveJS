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


export interface IOpenFileProps {
	openUrlHandler:(url:string, pushHistory:boolean) => void;
	openFileHandler:(file:File) => void;
	openHandler:(file:string|File,handler:Function) => void;
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
	openUrlHandler:(url:string) => void;
	openFileHandler:(file:File) => void;
	skipConfirmation?: boolean; /* If true, don't ask for confirmation before loading the session */
	context:React.ReactInstance;
}

export interface IFileDialogState
{
	selected?:string;
}

export default class FileDialog extends SmartComponent<IFileDialogProps, IFileDialogState> {
	static listItems:{[key:string]:string}[] = [{label: "My Computer" , iconClass:"fa fa-desktop"}, {label: "Weave Server", iconClass: "fa fa-server"}];
	static window:PopupWindow;

	static storageRegistry = new Map< String, React.ComponentClass<IOpenFileProps>>()
		.set("My Computer", LocalFileOpenComponent)
		.set("Weave Server", WeaveServerFileOpenComponent);

	constructor(props:IFileDialogProps)
	{
		super(props);
		this.state = {selected: "My Computer"};
	}

	static close()
	{
		if(FileDialog.window)
		{
			PopupWindow.close(FileDialog.window);
			FileDialog.window = null;
		}
	}
	
	static open(context:React.ReactInstance, loadURL:(url:string) => void, loadFile:(file:File) => void, skipConfirmation?: boolean)
	{

		if (FileDialog.window)
			PopupWindow.close(FileDialog.window);

		FileDialog.window = PopupWindow.open(context, {
			title: Weave.lang("Open a Weave Session"),
			content:
				<FileDialog openUrlHandler={loadURL} openFileHandler={loadFile} context={context} skipConfirmation={skipConfirmation}/>,
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

	openHandler=(file:string|File,handler:Function)=>
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
									{Weave.lang("Are you sure you want to open this session? This will overwrite your current workspace.") }
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
					handler(file);
					FileDialog.close();
				},
			});
		}
		else
		{
			handler(file);
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
			editorJsx = <EditorClass openFileHandler={this.props.openFileHandler} openUrlHandler={this.props.openUrlHandler} openHandler={this.openHandler} context={this.props.context}/>;
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
				<div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "row"}}>
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
					<div className="ui basic segment weave-file-picker-editor" style={{display: "flex", flex: 1, marginTop: 0, padding: 0}}>
						{editorJsx}
					</div>
				</div>
		)
	}
}