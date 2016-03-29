import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jquery from "jquery";

import SmartComponent from "../ui/SmartComponent";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

export interface PopoutWindowProps extends React.Props<PopoutWindow>
{
	title:string;
	content?:JSX.Element;
	url?:string;
	onClosing?:Function;
}

export interface PopoutWindowState
{
	content?:JSX.Element;
	update?:any;
	close?:any;
}

export default class PopoutWindow extends SmartComponent<PopoutWindowProps, PopoutWindowState> {
	private defaultOptions:PopoutWindowProps;
	private divId = 'popout-container';

	constructor(props:PopoutWindowProps) {
		super(props);

		this.windowClosing = this.windowClosing.bind(this);
		this.defaultOptions = {
			url: '_blank',
			title: 'Weave'
		};

		this.state = {
			update: null,
			close: null
		};
	}

	componentWillUnmount() {
		this.closeWindow();
	}

	componentDidMount() {
		var popoutWindow:Window, container:HTMLElement, update:(newComponent:any) => void, close:() => void;

		popoutWindow = window.open("","_blank");
		popoutWindow.onbeforeunload = () => {
			if (container) {
				ReactDOM.unmountComponentAtNode(container);
			}
			this.windowClosing();
		};
		var onloadHandler = () => {
			if (container) {
				var existing = popoutWindow.document.getElementById(this.divId);
				if (!existing){
					ReactDOM.unmountComponentAtNode(container);
					container = null;
				} else{
					return;
				}
			}

			popoutWindow.document.title = this.props.title;
			container = popoutWindow.document.createElement('div');
			container.id = this.divId;
			$("link, style").each(function() {
				//Todo: find a better way to clone this link
				var link:any = $(this).clone()[0];
				link.setAttribute("href",window.location.origin + window.location.pathname + link.getAttribute("href"));
				$(popoutWindow.document.head).append(link);
			});
			popoutWindow.document.body.appendChild(container);
			ReactDOM.render(this.props.content, container);
			update = newComponent => {
				ReactDOM.render(newComponent, container);
			};
			close = () => popoutWindow.close();
		};

		popoutWindow.onload = onloadHandler;
		onloadHandler();

		this.setState({ update, close });
	}

	closeWindow() {
		if (this.state.close) {
			this.state.close();
		}
	}

	windowClosing() {
		if (this.props.onClosing) {
			this.props.onClosing();
		}
	}

	componentDidUpdate() {
		this.state.update(this.props.children);
	}

	render() {
		return <div />;
	}
}