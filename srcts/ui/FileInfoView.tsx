import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import FormatUtils from "../utils/FormatUtils";
import Button from "../semantic-ui/Button";
import Clipboard from "../modules/clipboard";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
import {GoogleFileInfo} from "./FileDialog";

export interface IFileInfoViewProps extends React.Props<FileInfoView>
{
	fileInfo?:WeaveFileInfo | GoogleFileInfo;
	className:string;
}

export interface IFileInfoViewState
{
}

export default class FileInfoView extends React.Component<IFileInfoViewProps, IFileInfoViewState> {

	element:Element;
	clipboard:Clipboard;
	defaultProps:IFileInfoViewProps = {
		className: ""
	};

	constructor(props:IFileInfoViewProps)
	{
		super(props);
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
	}

	componentDidUpdate()
	{
		let selector = ($(this.element).find(".ui.button.copyButton") as any);
		let selectedElement = selector.get(0);
		if(selectedElement)
		{
			this.clipboard = new Clipboard(selectedElement);
			this.clipboard.on('success', (e) => {
				selector.popup({
					content  : Weave.lang("Copied!"),
					on       : "click"
				}).popup('show');
				e.clearSelection();
			});

			this.clipboard.on('error', (e) => {
				selector.popup({
					content  : Weave.lang("Copy not supported on Safari."),/*Weave.lang("Press ⌘-C to copy"),*/
					on       : "click"
				}).popup('show');
			});
		}
	}

	render():JSX.Element
	{
		let imageUI:JSX.Element = null;
		let copyUrlUI:JSX.Element = null;
		let thumbNailStatusUI:JSX.Element = null;
		let fileName:string = null;
		let fileSizeInfo:string = null;
		let modifiedDate:string = null;

		if(this.props.fileInfo instanceof WeaveFileInfo)
		{
			let fileInfo:WeaveFileInfo = this.props.fileInfo as WeaveFileInfo;
			let thumbnail:Blob = fileInfo && fileInfo.thumb && new Blob([fileInfo.thumb.data], { type: "image/jpeg" });
			let date:Date = fileInfo && new Date(fileInfo.lastModified);
			let copyURL:string = fileInfo && (window.location.origin + window.location.pathname + "?file=/" + fileInfo.fileName);
			fileSizeInfo = Weave.lang("Weave Session") + (fileInfo && (" - " + FormatUtils.defaultFileSizeFormatting(fileInfo.fileSize)))
			fileName = fileInfo && fileInfo.fileName;
			modifiedDate = Weave.lang("Modified") + " " + FormatUtils.defaultFuzzyTimeAgoFormatting(date) + " " + Weave.lang("ago")
			imageUI =  thumbnail ? <img className="ui image" src={URL.createObjectURL(thumbnail)}/> : null;
			thumbNailStatusUI = thumbnail ? null:<i className="circular file outline icon" title={Weave.lang("Thumbnail Unavailable")}/>
			copyUrlUI = <Button className="copyButton" data-clipboard-text={copyURL}>
							{Weave.lang("Copy URL")}
						</Button>
		}
		else if(this.props.fileInfo instanceof GoogleFileInfo)
		{
			let fileInfo:GoogleFileInfo = this.props.fileInfo as GoogleFileInfo;
			let thumbnailPath:string = fileInfo && fileInfo.thumbnailLink;
			let date:string = fileInfo && fileInfo.modifiedTime;
			fileName = fileInfo && fileInfo.name;
			modifiedDate = Weave.lang("Modified") + " " + date + " " + Weave.lang("ago");
			imageUI = thumbnailPath ? <img className="ui image" src={thumbnailPath}/> : null
			thumbNailStatusUI = thumbnailPath ? null:<i className="circular file outline icon" title={Weave.lang("Thumbnail Unavailable")}/>
		}



		return (
			<VBox className={this.props.className} style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
				{this.props.fileInfo ?
					<VBox style={{flex: 1, marginTop:"50%", alignItems: "center"}}>
						<VBox style={{flex: 1, display: "flex", justifyContent: "center"}}>
							{imageUI}
						</VBox>
						<div className="ui medium center aligned dividing icon header">
							{thumbNailStatusUI}
							{fileName}
							<div className="sub header">
								{fileSizeInfo}
							</div>
						</div>
				</VBox>:<div/>}
				{this.props.fileInfo ?
					<VBox style={{flex:1, width: "100%", alignItems: "center", justifyContent: "space-between"}}>
						<div style={{flex:1}}>
							{modifiedDate}
						</div>
						<HBox style={{justifyContent: "flex-end"}}>
							{copyUrlUI}
							{this.props.children}
						</HBox>
					</VBox>:<div/>
				}
			</VBox>
		)
	}
}