import * as React from "react";
import WeaveApp from "./WeaveApp"
import GetStartedComponent from "./ui/GetStartedComponent";
import MiscUtils from "./utils/MiscUtils";

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface LandingPageState {
	landing:string;
}

export default class LandingPage extends React.Component<any, LandingPageState>
{
	urlParams:any;

	constructor(props:any)
	{
		super(props);

		this.urlParams = MiscUtils.getUrlParams();
		var weaveExternalTools:any = window && window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
		this.state = {
			landing: (
				this.urlParams.skipIntro ||     //flag to skip splash screen
				this.urlParams.file) ||         //if a file is loaded skip splash screen
				(weaveExternalTools && weaveExternalTools[window.name]) //if exporting from flash skip splash screen
				? "default":"splash"
		}
	}

	render():JSX.Element {

		let weave:Weave = (window as any).weave;
		// let skipBlankPageIntro:boolean = this.urlParams ? StandardLib.asBoolean(this.urlParams.skipBlankPageIntro) : false;
		//
		// // check in loaded weave session state to skip BlankPageIntro
		// if (weave.root.getObjects(weavejs.api.data.IDataSource).length > 0 || weave.root.getObjects(weavejs.core.LinkablePlaceholder).length > 0)
		// {
		// 	skipBlankPageIntro = true;
		// }
		//
		// // check in interaction event in GetStartedcomponent to skip BlankPageIntro
		// if (this.state.initialWeaveComponent)
		// {
		// 	skipBlankPageIntro = true;
		// }

		if(this.state.landing == "splash")
		{
			return (
				<GetStartedComponent style={ {width: "100%", height: "100%"} } onChange={(landing:string) => {this.setState({landing})}} />
			);
		}

		return (
			<WeaveApp
				readUrlParams={true}
				weave={weave}
				renderPath={weavejs.WeaveAPI.CSVParser.parseCSVRow(this.urlParams.layout)}
				style={{width: "100%", height: "100%"}}
				landing={this.state.landing}
			/>
		)
	}
}