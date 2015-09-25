export default class AbstractWeaveTool {


	constructor(props) {
		this.props = props;
		this.element = props.element;
		this.toolPath = props.toolPath;
	}

	_getElementSize() {
        return {
            width: this.element.clientWidth,
            height: this.element.clientHeight
        };
    }

	resize () {

    }

    destroy() {

    }
}
