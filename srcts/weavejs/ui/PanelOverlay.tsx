namespace weavejs.ui
{
	const toolOverlayStyle:React.CSSProperties = {
		background: "#000",
		opacity: .2,
		boxSizing: "border-box",
		backgroundClip: "padding",
		position: "absolute",
		visibility: "hidden",
		pointerEvents: "none"
	};

	export interface IPanelOverlayProps extends React.Props<PanelOverlay>
	{
	}

	export interface IPanelOverlayState
	{
		style: React.CSSProperties;
	}
	export class PanelOverlay extends React.Component<IPanelOverlayProps, IPanelOverlayState>
	{
		constructor(props:IPanelOverlayProps)
		{
			super(props);
			this.state = {
				style: _.clone(toolOverlayStyle)
			};
		}

		render()
		{
			return <div style={this.state.style}/>;
		}
	}
}
