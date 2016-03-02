import * as React from "react";

export interface DialogProps extends React.HTMLProps<Dialog>
{
	
}

export interface DialogState
{
	
}

export default class Dialog extends React.Component<React.HTMLProps<Dialog>, DialogState>
{
	constructor(props:DialogProps)
	{
		super();
	}
	
	render():JSX.Element
	{
		return (
			<div {...this.props as any}/>
		)
	}
}
