import React from "react";


export default class Test extends React.Component
{
	constructor(props)
	{
		super(props);
		window.test = this;
	}

	render()
	{
		return <div>
					{JSON.stringify(this.state)}
				</div>;
	}
}
