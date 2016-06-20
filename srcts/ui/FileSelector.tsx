import * as React from "react";
import * as _ from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import FileInput from "../react-ui/FileInput";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import InteractiveTour from "../react-ui/InteractiveTour";
import Input from "../semantic-ui/Input";
import Button from "../semantic-ui/Button";

import LinkableFile = weavejs.core.LinkableFile;
import LinkableString = weavejs.core.LinkableString;
var URLRequestUtils = weavejs.WeaveAPI.URLRequestUtils;

export interface IFileSelectorProps extends React.HTMLProps<LinkableFileSelector>
{
	targetUrl: LinkableFile|LinkableString;
	placeholder?:string;
	accept?: string;
	onFileChange?:()=>void;
}

export interface IFileSelectorState
{
	validExtension:boolean
}

export default class LinkableFileSelector extends React.Component<IFileSelectorProps, IFileSelectorState>
{
	constructor(props:IFileSelectorProps)
	{
		super(props);

		if (props.targetUrl.value)
		{
			let extension = props.targetUrl.value && props.targetUrl.value.split('.').pop();
			this.state = {
				validExtension: _.includes(this.props.accept.split(','),"."+extension)
			};
		} else {
			this.state = {
				validExtension: true
			}
		}
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
		};

		reader.readAsArrayBuffer(file);
		if(this.props.onFileChange)
		{
			this.props.onFileChange()
		}
	};

	componentWillReceiveProps(nextProps:IFileSelectorProps)
	{
		if (nextProps.targetUrl.value)
		{
			let extension = nextProps.targetUrl.value.split('.').pop();
			this.setState({
				validExtension: _.includes(nextProps.accept.split(','),"."+extension)
			});
		} else {
			this.setState({
				validExtension: true
			})
		}
	}

	render():JSX.Element
	{
		var hBoxFlex:React.CSSProperties = {};
		if(this.props.style && this.props.style.flex)
			hBoxFlex.flex = this.props.style.flex;
		
		// find a way to not include the border color in this file.
		return (
			<HBox style={hBoxFlex}>
				<StatefulTextField {...this.props}
									className={"right labeled" + (this.state.validExtension ? "" : " warning") + (this.props.className ?  (" " + this.props.className):"")}
									ref={linkReactStateRef(this, {value: this.props.targetUrl}, 500)}/>
				<FileInput onChange={this.handleFileChange} accept={this.props.accept}>
					<Button style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, margin: 0, whiteSpace: "nowrap", border: "1px solid #E0E1E2"}}
					        id={InteractiveTour.prefix + "Open file"}
					        ref={InteractiveTour.getPointerTargetComponent}>
						{Weave.lang("Open file")}
					</Button>
				</FileInput>
			</HBox>
		)
	}
}
