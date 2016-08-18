namespace weavejs.menu
{
	import ServiceLogin = weavejs.admin.ServiceLogin;
	import MenuItemProps = weavejs.ui.menu.MenuItemProps;

	export interface IWeaveMenus
	{
		context:React.ReactInstance;
		weave:Weave;
		createObject:CreateObjectFunction;
		onFileLoaded:()=>void;
		openDataManager:()=>void;
		enableDataManagerItem:()=>boolean;
		showFileMenu:boolean;
		login:ServiceLogin;
		fileMenu:{getSessionItems:()=>MenuItemProps[]}
		dataMenu:{getExportItems:()=>MenuItemProps[]}
		getMenuList:()=>MenuItemProps[];
	}

	export class IWeaveMenus { }
}