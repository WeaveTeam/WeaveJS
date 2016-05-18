import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import FormatUtils from "../utils/FormatUtils";
import Button from "../semantic-ui/Button";
import Clipboard from "../modules/clipboard";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export interface IFileInfoViewProps extends React.Props<FileInfoView>
{
	fileInfo?:WeaveFileInfo;
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
		let thumbnail:Blob = this.props.fileInfo && this.props.fileInfo.thumb && new Blob([this.props.fileInfo.thumb.data], { type: "image/jpeg" });
		let date:Date = this.props.fileInfo && new Date(this.props.fileInfo.lastModified);
		let copyURL:string = this.props.fileInfo && (window.location.origin + window.location.pathname + "?file=/" + this.props.fileInfo.fileName);
		return (
			<VBox className={this.props.className} style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
				{this.props.fileInfo ?
					<VBox style={{flex: 1, marginTop:"50%", alignItems: "center"}}>
						<VBox style={{flex: 1, display: "flex", justifyContent: "center"}}>
							{this.props.fileInfo && (thumbnail ? <img className="ui image" src={URL.createObjectURL(thumbnail)}/>:null)}
						</VBox>
						<div className="ui medium center aligned dividing icon header">
							{this.props.fileInfo && (thumbnail ? null:<i className="circular file outline icon" title={Weave.lang("Thumbnail Unavailable")}/>)}
							{this.props.fileInfo && this.props.fileInfo.fileName}
							<div className="sub header">
								{Weave.lang("Weave Session") + (this.props.fileInfo && (" - " + FormatUtils.defaultFileSizeFormatting(this.props.fileInfo.fileSize)))}
							</div>
						</div>
				</VBox>:<div/>}
				{this.props.fileInfo ?
					<VBox style={{flex:1, width: "100%", alignItems: "center", justifyContent: "space-between"}}>
						<div style={{flex:1}}>
							{this.props.fileInfo && (Weave.lang("Modified") + " " + FormatUtils.defaultFuzzyTimeAgoFormatting(date) + " " + Weave.lang("ago"))}
						</div>
						<HBox style={{justifyContent: "flex-end"}}>
							<Button
								className="copyButton"
							    data-clipboard-text={copyURL}
							>
								{Weave.lang("Copy URL")}
							</Button>
							{this.props.children}
						</HBox>
					</VBox>:<div/>
				}
			</VBox>
		)
	}
}