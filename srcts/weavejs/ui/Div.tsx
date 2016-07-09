import * as React from "react";

/**
 * Provides a way to render a div separately by setting its state.
 */
export default class Div extends React.Component<React.HTMLProps<Div>, React.HTMLAttributes>
{
	render()
	{
		return <div {...this.props as any} {...this.state}/>;
	}
}
