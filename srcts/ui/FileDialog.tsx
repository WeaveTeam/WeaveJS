import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import CenteredIcon from "../react-ui/CenteredIcon";
import SmartComponent from "./SmartComponent";
import ConfirmationDialog from "./ConfirmationDialog";
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
		FileDialog.window = null;
	}
	
	static open(context:React.ReactInstance, loadURL:(url:string) => void, loadFile:(file:File) => void)
	{

		if (FileDialog.window)
			PopupWindow.close(FileDialog.window);

		FileDialog.window = PopupWindow.open(context, {
			title: Weave.lang("Open a Weave Session"),
			content:
				<FileDialog openUrlHandler={loadURL} openFileHandler={loadFile} context={context}/>,
			footerContent: <div/>,
			resizable: true,
			modal: true,
			suspendEnter: true,
			width: 920,
			height: 675,
			onClose: FileDialog.close
		});
	}

	openHandler=(file:string|File,handler:Function)=>
	{
		ConfirmationDialog.open(this.props.context,
			Weave.lang("Load Session:"),
			<HBox style={{flex: 1, alignItems: "center"}}>
				<i className="fa fa-exclamation-triangle fa-fw fa-3x" style={{color: "#F78B8B"}}/>
				<div className="ui basic segment">
					<div className="ui basic header">
						{Weave.lang("Are you sure you want to open this session? This will overwrite your current workspace.")}
					</div>
				</div>
			</HBox>,
			Weave.lang("Load Session"),
			() => {
				handler(file);
				FileDialog.close();
			},
			Weave.lang("Cancel"),
			() => {
				ConfirmationDialog.close();
			});
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
			editorJsx = <EditorClass openFileHandler={this.props.openFileHandler} openUrlHandler={this.props.openUrlHandler} openHandler={this.openHandler}/>;
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