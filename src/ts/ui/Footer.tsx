import * as React from "react";

export interface FooterProps
{

}

export interface FooterState
{

}

export default class Footer extends React.Component<FooterProps, FooterState>
{

	render()
	{
		return (
			<div className="app footer">
				WeaveJS is a collection of open source projects. The content of this page is licensed under Creative Commons Attribution 3.0 License, and code samples are licensed under the BSD License.
			</div>
		);
	}
}