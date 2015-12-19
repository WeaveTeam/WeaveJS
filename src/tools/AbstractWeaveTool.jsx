import React from "react";

export default class AbstractWeaveTool extends React.Component {


	constructor(props) {
		super(props);
		this.toolPath = props.toolPath;
		this.paths = {};
	}

	getElementSize() {
		return {
			width: this.wrapper.clientWidth,
			height: this.wrapper.clientHeight
		};
	}

	// this function accepts an arry of path configurations
	// a path config is an object with a path object name, the weave path and an
	// optional callback or array of callbacks
	initializePaths(properties) {
		properties.forEach((pathConf) => {
			this.paths[pathConf.name] = pathConf.path;
			if(pathConf.callbacks) {
				var callbacks = Array.isArray(pathConf.callbacks) ? pathConf.callbacks : [pathConf.callbacks];
				callbacks.forEach((callback) => {
					this.paths[pathConf.name].addCallback(this, callback, true);
				});
			}
		});
	}

	componentDidUpdate () {
	}

	componentDidMount() {
		this.wrapper = React.findDOMNode(this);
		this.element = React.findDOMNode(this.refs.chart)
	}

	componentWillUnmount() {

	}

	render() {
		return <div style={this.props.style}>
			<div ref="chart" style={{width: "100%", height: "100%", maxHeight: "100%"}}></div>
		</div>;
	}
}
