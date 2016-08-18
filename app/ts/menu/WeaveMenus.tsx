namespace weavejs.menu
{
	import IWeaveMenus = weavejs.menu.IWeaveMenus;
	import ServiceLogin = weavejs.admin.ServiceLogin;
	import FileMenu = weavejs.menu.FileMenu;
	import SystemMenu = weavejs.menu.SystemMenu;
	import DataMenu = weavejs.menu.DataMenu;
	import ChartsMenu = weavejs.menu.ChartsMenu;
	import ControllersMenu = weavejs.menu.ControllersMenu;
	import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
	import Admin = weavejs.net.Admin;

	export type CreateObjectFunction = (type:Class)=>void;

	export class WeaveMenus implements IWeaveMenus
	{
		context:React.ReactInstance;
		weave:Weave;
		createObject:CreateObjectFunction;
		onFileLoaded:()=>void;
		openDataManager:()=>void;
		enableDataManagerItem:()=>boolean;
		showFileMenu:boolean;
		login:ServiceLogin;
		systemMenu:SystemMenu;
		fileMenu:FileMenu;
		chartsMenu:ChartsMenu;
		dataMenu:DataMenu;
		controllersMenu:ControllersMenu;

		constructor(context:React.ReactInstance, weave:Weave, createObject:CreateObjectFunction, onFileLoaded:()=>void, openDataManager:()=>void, enableDataManagerItem:()=>boolean)
		{
			this.context = context;
			this.weave = weave;
			this.createObject = createObject;
			this.onFileLoaded = onFileLoaded;
			this.openDataManager = openDataManager;
			this.enableDataManagerItem = enableDataManagerItem;
			
			/* Forces the initialization of the service. */
			/* Hopefully the init flag gets set before our first 'get menu'. */
			Admin.service.getAuthenticatedUser().then(_.noop, _.noop);
			this.login = new ServiceLogin(context, Admin.service);
			
			this.fileMenu = new FileMenu(this);
			this.systemMenu = new SystemMenu(this);
			this.chartsMenu = new ChartsMenu(this);
			this.dataMenu = new DataMenu(this);
			this.controllersMenu = new ControllersMenu(this);
		}

		getMenuList():MenuBarItemProps[]
		{
			if (this.showFileMenu)
				return [
					this.systemMenu,
					this.fileMenu,
					this.chartsMenu,
					this.controllersMenu
				];
			
			return [
				this.systemMenu,
				this.dataMenu,
				this.chartsMenu,
				this.controllersMenu
			];
		}
	}
}
