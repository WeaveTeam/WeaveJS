import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

function getJSXCode() {
	return [
		{
			label: "Regular string label"
		},
		{
			label: <div key={2}> I am jsx code inside of json </div>
		}
	]
}

const jsxConst = [
	{
		label: "Regular string label"
	},
	{
		label: <div key={4}> I am jsx code inside of json </div>
	}
]

class InnerTest extends React.Component
{
	constructor(props)
	{
		super(props)
	}
	
	render()
	{
		console.log(this.props.label, this.props.label._owner)
		return <div> {this.props.label} </div>
	}
}

export default class Test extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return <div>
					{
						getJSXCode().map((jsx, index) => {
							return <InnerTest key={index} label={jsx.label}/>;
						})
					}
					{
						jsxConst.map((jsx, index) => {
							return <InnerTest key={index} label={jsx.label}/>;;
						})
					}
				</div>;
	}
}

$(() => {
	ReactDOM.render(<Test/>, document.getElementById("testDiv"));
});
