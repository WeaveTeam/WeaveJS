import * as React from "react";
import StatefulTextField from "../ui/StatefulTextField";
import FileInput from "../react-ui/FileInput";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import Input from "../semantic-ui/Input";
import LinkableFile = weavejs.core.LinkableFile;
import LinkableString = weavejs.core.LinkableString;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;

export interface IFileSelectorProps extends React.HTMLProps<LinkableFileSelector>
{
	targetUrl: LinkableFile|LinkableString;
	placeholder?:string;
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
	textField:StatefulTextField;
	componentDidMount()
	{
	}
	
	handleFileChange=(event:React.FormEvent)=>
	{
		let file = (event.target as HTMLInputElement).files[0] as File;

		let reader = new FileReader();

		reader.onload = (event:Event) =>
		{
			let buffer = reader.result as ArrayBuffer;
			let fileName = URLRequestUtils.saveLocalFile(Weave.getRoot(this.props.targetUrl), file.name, new Uint8Array(buffer));
			this.props.targetUrl.value = fileName;
			// this.textField.input.inputElement.blur(); // clear the blur
		}

		reader.readAsArrayBuffer(file);
	}

	render():JSX.Element
	{
		return (
				<StatefulTextField {...this.props}
								   className={"right labeled " + (this.props.className || "")}
								   placeholder={this.props.placeholder}
							   	   ref={linkReactStateRef(this, {value: this.props.targetUrl}, 500)}>
				   {
					   <div className="ui label">
					   		<FileInput onChange={this.handleFileChange} accept={this.props.accept}>
						   		{Weave.lang("Add file")}
					   		</FileInput>
						</div>
				   }
				</StatefulTextField>
		)
	}
}
