import * as _ from "lodash";
import * as React from "react";

export interface IListViewState {
	scrollTopPx: number;
	heightPx: number;
}

export interface IListViewProps extends React.HTMLProps<ListView> {
	items: any[];
	itemHeight: number;
	itemRender: { (item: any, top: number): JSX.Element };
}

export default class ListView extends React.Component<IListViewProps, IListViewState> {
	constructor(props:IListViewProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.onFrame);
	}

	state: IListViewState = {
		scrollTopPx: 0,
		heightPx: 0
	};

	onFrame()
	{
		if (!this.container) return;

		this.setState({
			scrollTopPx: this.container.scrollTop,
			heightPx: this.container.clientHeight
		});
	}

	private container: HTMLElement;

	render() {
		let firstItem = Math.floor(this.state.scrollTopPx / this.props.itemHeight);
		let lastItem = Math.ceil(firstItem + this.state.heightPx / this.props.itemHeight);

		let elements: JSX.Element[] = [];

		for (let idx = firstItem; (idx < lastItem + 1) && (idx < this.props.items.length); idx++)
		{
			let item = this.props.items[idx];
			elements[idx-firstItem] = this.props.itemRender(item, idx);
		}

		return (
			<div ref={ (c) => { this.container = c; } } style={_.merge({}, this.props.style, {overflow: "auto", flex: 1})}>
				<div style={{position: "relative", height: this.props.itemHeight * this.props.items.length}}>
					{elements}
				</div>
			</div>
		);
	}
}
