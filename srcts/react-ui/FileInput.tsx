import * as React from "react";

export interface FileInputProps extends React.HTMLProps<FileInput>
{
	onChange:React.FormEventHandler;
}

export default class FileInput extends React.Component<FileInputProps, {}>
{
	constructor(props:FileInputProps)
	{
		super(props);
	}
	
	render()
	{
		var style = this.props.style || {};
		style.position = "relative";
		return (
			<span style={{position: "relative"}} className={this.props.className}>
				<input type="file" onChange={this.props.onChange} style={{position:"absolute", width: "100%", height: "100%", opacity: 0, overflow: "hidden"}}/> 
				{
					this.props.children
				}
			</span>
		)
	}
	
}
