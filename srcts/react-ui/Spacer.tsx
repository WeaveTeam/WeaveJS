import * as React from "react";

export class HSpacer extends React.Component<React.HTMLProps<HTMLDivElement>, {}>
{
	render()
	{
		return <div style={{height: 10}} {...this.props}/>;
	}
}

export class VSpacer extends React.Component<React.HTMLProps<HTMLDivElement>, {}>
{
	render()
	{
		return <div style={{width: 10}} {...this.props}/>;
	}
}
