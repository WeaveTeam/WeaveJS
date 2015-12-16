import React from "react";
import ReactDOM from "react-dom";

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
						this.paths[pathConf.name].addCallback(callback, true);
					});
				}
			});
		}

		componentDidUpdate () {

    }

		componentDidMount() {
			// need to trigger one more render because the first time the c3
			// chart is not sized properly
			this.forceUpdate();
		}

		componentWillUnmount() {

    }

		render() {
        return <div ref={(elt) => { this.wrapper = elt}} style={this.props.style}>
					<div ref={(elt) => { this.element = elt}} style={{width: "100%", height: "100%", maxHeight: "100%"}}></div>
        </div>;
    }
}
