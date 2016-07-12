namespace weavejs.ui.menu
{
	import Menu = weavejs.ui.menu.Menu;
	import ReactUtils = weavejs.util.ReactUtils;
	import Popup = weavejs.ui.Popup;

	export class ContextMenu extends Menu
	{
		static open(event:React.MouseEvent)
		{
			event.preventDefault();
			var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
			if (!contextMenuItems.length)
				return;
			var contextMenu:ContextMenu = null;
			var popup = Popup.open(
				event.target as Element,
				<ContextMenu
					menu={contextMenuItems}
					ref={(c:ContextMenu) => contextMenu = c}
					style={{
						top: event.clientY,
						left: event.clientX
					}}
				/>,
				true
			);
			contextMenu.popup = popup;
		}

		popup:Popup;
		handleClick=()=>
		{
			Popup.close(this.popup);
		}

		render()
		{
			return <Menu ref={ReactUtils.registerComponentRef} {...this.props} onClick={this.handleClick} />
		}
	}
}
