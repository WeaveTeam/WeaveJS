import * as React from "react";
import * as lodash from "lodash";
import LinkableTextField from "../ui/LinkableTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";

import LinkableFile = weavejs.core.LinkableFile;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;

export interface IFileSelectorProps
{
	target: LinkableFile;
	accept?: string;
}

export interface IFileSelectorState
{

}

export default class LinkableFileSelector extends React.Component<IFileSelectorProps, IFileSelectorState>
{
	constructor(props:IFileSelectorProps)
	{
		super(props);
	}

	private fileElement: HTMLInputElement;

	handleFileChange=(event:React.FormEvent)=>
	{
		let file = this.fileElement && this.fileElement.files[0];

		let reader = new FileReader();

		reader.onload = (event:Event) =>
		{
			let buffer = reader.result as ArrayBuffer;
			let fileName = URLRequestUtils.saveLocalFile(Weave.getRoot(this.props.target), file.name, new Uint8Array(buffer));
			this.props.target.value = fileName;
		}

		reader.readAsArrayBuffer(file);
	}

	handleClick=(event:React.MouseEvent):void =>
	{
		this.fileElement && this.fileElement.click();
	}
	render():JSX.Element
	{
		return <HBox>
			<LinkableTextField ref={linkReactStateRef(this, {content: this.props.target}, 500)}/>
			<input type="button" value={Weave.lang("Add file")} onClick={this.handleClick}/>
			<input type="file" onChange={this.handleFileChange} 
				accept={ this.props.accept } 
				ref={(c) => { this.fileElement = c } } 
				style={{ display: "none" }}/>
		</HBox>
	}
}