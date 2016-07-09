import * as React from "react";

export interface ILogComponentProps extends React.HTMLProps<LogComponent> {
	messages?: string[];
	uiClass?: string;
	clearFunc: (event:React.MouseEvent) => void;
	header: React.ReactChild;
}

export default class LogComponent extends React.Component<ILogComponentProps, Object>
{
	constructor(props:ILogComponentProps)
	{
		super(props);
	}

	render():JSX.Element {
		if (this.props.messages.length) {
			return (
				<div className={["ui", this.props.uiClass || "negative", "message"].join(" ")} {...this.props as any}>
					<i className="close icon" onClick={this.props.clearFunc}></i>
					<div className="header">
						{this.props.header}
					</div>
					<ul className="list">
						{this.props.messages.map((message, idx) => (<li key={idx}>{message}</li>)) }
					</ul>
				</div>
			);
		}
		else {
			return <div/>;
		}
	}
}