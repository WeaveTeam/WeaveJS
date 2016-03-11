import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";

export default class DataMenu implements MenuBarItemProps{

	constructor(weave:Weave){
		this.weave = weave;
	}

	label : string = "Data";
	weave : Weave;
	menu: MenuItemProps[] = [
		{
			label : Weave.lang('Manage or browse data'),
			click : this.manageOrBrowseData.bind(this)
		},
		{
			label : Weave.lang('Add CSV DataSource'),
			click : this.addCSVDataSource.bind(this)
		}
	];

	bold : boolean = false;

	manageOrBrowseData (){
		console.log("managing and browsing data");
	}

	addCSVDataSource (){
		console.log("adding a csv datasource");
	}
}