import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
import ReactUtils from "../utils/ReactUtils";

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
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"}
		};
		return (
			<VBox className={this.props.className} style={{flex: 1, alignItems: "center"}}>
				{ReactUtils.generateTable({
					body: [
						[
							Weave.lang("File"),
							this.props.fileInfo && this.props.fileInfo.fileName
						],
						[
							Weave.lang("Size"),
							this.props.fileInfo && this.props.fileInfo.fileSize
						],
						[
							Weave.lang("Modified"),
							this.props.fileInfo && this.props.fileInfo.lastModified
						]
					],
					classes: {
						td: [
							"weave-left-cell",
							"weave-right-cell"
						]
					},
					styles: tableStyles
				})}
				<div style={{marginTop: 25}}>
					{this.props.fileInfo && (thumbnail ? <img src={URL.createObjectURL(thumbnail)}/>:<div>{Weave.lang("Thumbnail Unavailable")}</div>)}
				</div>
				{this.props.children}
			</VBox>
		)
	}
}