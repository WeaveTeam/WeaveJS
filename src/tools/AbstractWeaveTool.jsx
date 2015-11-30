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
            width: this.props.width,
            height: this.props.height
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
			this.element = React.findDOMNode(this);
		}

		componentWillUnmount() {

    }

		render() {
        return <div style={{height: this.props.height, maxHeight: this.props.height, width: this.props.width}}/>;
    }
}
