namespace weavejs.ui.menu
{
	import SessionHistorySlider = weavejs.editor.SessionHistorySlider;
	import WeaveMenus = weavejs.menu.WeaveMenus;
	import MenuBar = weavejs.ui.menu.MenuBar;
	import WeaveProperties = weavejs.app.WeaveProperties;

	export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
	{
		style:React.CSSProperties;
		menus:WeaveMenus;
		weave:Weave;
	}

	export interface WeaveMenuBarState
	{
		
	}

	export class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
	{
		constructor(props:WeaveMenuBarProps)
		{
			super(props);
		}

		render():JSX.Element
		{
			var enableSessionHistorySlider = WeaveProperties.getProperties(this.props.weave).showSessionHistorySlider;
			var enableSessionHistoryControls = WeaveProperties.getProperties(this.props.weave).enableSessionHistoryControls;

			return (
				<MenuBar
					style={this.props.style}
					config={this.props.menus.getMenuList()}
				>
					<DynamicComponent dependencies={[enableSessionHistoryControls, enableSessionHistorySlider]} render={() => {
						return (
							enableSessionHistoryControls.value
							? <SessionHistorySlider key="historySlider" stateLog={this.props.weave.history} showSlider={enableSessionHistorySlider.value}/>
							: null
						);
					}}/>
				</MenuBar>
			);
		}
	}
}
