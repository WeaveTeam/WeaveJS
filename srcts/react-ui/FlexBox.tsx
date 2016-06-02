import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

export class HBox extends React.Component<React.HTMLProps<HBox>, {}>
{
	/**
	 * Creates a copy of a style object and adds { display: "flex", flexDirection: "row" }
	 * @param style A style object.
	 * @return A new style object.
	 */
	private static style(style:React.CSSProperties):React.CSSProperties
	{
		return _.merge({ display: "flex" }, style, { flexDirection: "row" });
	}

	render():JSX.Element
	{
		return <div {...this.props as React.HTMLAttributes} style={HBox.style(this.props.style)}/>;
	}
}

export class VBox extends React.Component<React.HTMLProps<VBox>, {}>
{
	/**
	 * Creates a copy of a style object and adds { display: "flex", flexDirection: "column" }
	 * @param style A style object.
	 * @return A new style object.
	 */
	private static style(style:React.CSSProperties):React.CSSProperties
	{
		return _.merge({ display: "flex" }, style, { flexDirection: "column" });
	}

	render():JSX.Element
	{
		return <div {...this.props as React.HTMLAttributes} style={VBox.style(this.props.style)}/>;
	}
}
