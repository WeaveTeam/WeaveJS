import * as React from "react";

export interface DividerProps
{
	
}

export interface DividerState
{
	
}

const dividerStyle = {
	marginTop: 7,
	marginRight: 0,
	marginBottom: 8,
	marginLeft: 0,
	height: 1,
	border: "none",
	opacity: 1,
	backgroundColor: "rgb(224, 224, 224)"
}

export default class Divider extends React.Component<DividerProps, DividerState>
{
	constructor(props:DividerProps)
	{
		super(props);
	}
	
	render():JSX.Element
	{
		return (
			<hr style={dividerStyle}/>
		);
	}
}
