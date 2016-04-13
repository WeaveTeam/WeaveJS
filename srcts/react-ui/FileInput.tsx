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
	constructor(props:FileInputProps)
	{
		super(props);
	}
	
	onChange=(e:React.FormEvent)=>
	{
		if(this.props.onChange)
			this.props.onChange(e)
		// simulate the click event we previously stopped
		DOMUtils.eventFire(ReactDOM.findDOMNode(this) as HTMLElement, "click");
	}
	
	handleClick(e:React.MouseEvent)
	{
		e.stopPropagation(); // prevent the click event from running on the menubar
							 // which causes the file menu to be unmounted
	}

	render()
	{
		var style = this.props.style || {};
		style.position = "relative";
		var props = _.clone(this.props);
		delete props.children;
		return (
			<span style={{position: "relative"}} className={this.props.className}>
				<input type="file" onClick={this.handleClick.bind(this) } {...props as any} onChange={this.onChange} style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, overflow: "hidden" }}/>
				{
					this.props.children
				}
			</span>
		)
	}
	
}
