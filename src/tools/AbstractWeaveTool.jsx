import React from "react";

export default class AbstractWeaveTool extends React.Component {


		constructor(props) {
			super(props);
			this.props = props;
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
					var callbacks = pathConf.callbacks;
					if(Array.isArray(callbacks)){
						callbacks.forEach((callback) => {
							this.paths[pathConf.name].addCallback(callback);
						});
					} else {
						this.paths[pathConf.name].addCallback(pathConf.callbacks, true);
					}
				}
			});
		}

		componentDidUpdate () {

    }

		componentDidMount() {
			this.wrapper = React.findDOMNode(this);
			this.element = React.findDOMNode(this.refs.chart);
			// need to trigger one more render because the first time the c3
			// chart is not sized properly
			this.forceUpdate();
		}

		componentWillUnmount() {

    }

		render() {
        return <div style={this.props.style}>
					<div ref="chart" style={{width: "100%", height: "100%", maxHeight: "100%"}}></div>
        </div>;
    }
}
