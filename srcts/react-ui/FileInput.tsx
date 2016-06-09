import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import DOMUtils from "../utils/DOMUtils";

export interface FileInputProps extends React.HTMLProps<FileInput>
{
	onChange:React.FormEventHandler;
}

export default class FileInput extends React.Component<FileInputProps, {}>
{
	input:HTMLInputElement;

	constructor(props:FileInputProps)
	{
		super(props);
	}
	
	onChange=(e:React.FormEvent)=>
	{
		if(this.props.onChange)
			this.props.onChange(e);
		// Might need to simulate the click event we previously stopped
		// DOMUtils.eventFire(ReactDOM.findDOMNode(this) as HTMLElement, "click");
	};
	
	handleClick=(e:React.MouseEvent)=>
	{
		e.stopPropagation(); // prevent the click event from running on the menubar
							 // which causes the file menu to be unmounted
	};

	render()
	{
		//value prop on input = "" because it allows us to load the same file again by clearing the value explicitly
		var style = this.props.style || {};
		style.position = "relative";
		var props = _.clone(this.props);
		delete props.children;
		return (
			<div onClick={(e:React.MouseEvent) => this.input.click() } style={{position: "relative", display:"flex"}} className={"ui fluid action input " + this.props.className}>
				<input ref={(c) => this.input = c} type="file" value = "" onClick={this.handleClick } {...props as any} onChange={this.onChange} style={{display:"none"}}/>
				{
					this.props.children
				}
			</div>
		);
	}
}
