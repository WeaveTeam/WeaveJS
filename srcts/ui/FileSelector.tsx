import * as React from "react";
import * as lodash from "lodash";
import LinkableTextField from "../ui/LinkableTextField";
import FileInput from "../react-ui/FileInput";
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
	
	handleFileChange=(event:React.FormEvent)=>
	{
		let file = (event.target as HTMLInputElement).files[0] as File;

		let reader = new FileReader();

		reader.onload = (event:Event) =>
		{
			let buffer = reader.result as ArrayBuffer;
			let fileName = URLRequestUtils.saveLocalFile(Weave.getRoot(this.props.target), file.name, new Uint8Array(buffer));
			this.props.target.value = fileName;
		}

		reader.readAsArrayBuffer(file);
	}

	render():JSX.Element
	{
		return <HBox>
			<LinkableTextField ref={linkReactStateRef(this, {content: this.props.target}, 500)}/>
			<FileInput onChange={this.handleFileChange} accept={this.props.accept}>
				<input type="button" value={Weave.lang("Add file")}/>
			</FileInput>
		</HBox>
	}
}