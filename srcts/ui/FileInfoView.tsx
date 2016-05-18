import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import FormatUtils from "../utils/FormatUtils";

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

	defaultProps:IFileInfoViewProps = {
		className: ""
	};

	constructor(props:IFileInfoViewProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		let thumbnail:Blob = this.props.fileInfo && this.props.fileInfo.thumb && new Blob([this.props.fileInfo.thumb.data], { type: "image/jpeg" });
		let date:Date = this.props.fileInfo && new Date(this.props.fileInfo.lastModified);
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"}
		};
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
						{this.props.children}
					</VBox>:<div/>
				}
			</VBox>
		)
	}
}