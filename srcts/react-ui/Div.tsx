import * as React from "react";
import * as ReactDOM from "react-dom";

/**
 * Provides a way to render a div separately by setting its state.
 */
export default class Div extends React.Component<React.HTMLProps<HTMLDivElement>, React.HTMLAttributes>
{
	render()
	{
		return <div {...this.props} {...this.state}/>;
	}
}
