import * as React from "react";
import WeaveApp from "./WeaveApp"
import GetStartedComponent from "./ui/GetStartedComponent";
import MiscUtils from "./utils/MiscUtils";

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export declare type LandingPageView = "splash"|"default"|"file";

export interface LandingPageProps
{
	initialView:LandingPageView;
	weave:Weave;
	weaveAppRef:(weaveApp:WeaveApp)=>void;
}

export interface LandingPageState
{
	view:LandingPageView;
}

export default class LandingPage extends React.Component<LandingPageProps, LandingPageState>
{
	urlParams:any;

	constructor(props:LandingPageProps)
	{
		super(props);

		this.urlParams = MiscUtils.getUrlParams();
		var weaveExternalTools: any;
		/* Wrap this in a try/catch so we don't crash if there's a security exception from accessing a window in another domain. */
		try
		{
			weaveExternalTools = window && window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
		}
		catch (e)
		{
			weaveExternalTools = null;
		}
		
		var view = props.initialView;
		var exportedFromFlash = weaveExternalTools && weaveExternalTools[window.name];
		if (this.urlParams.skipIntro || this.urlParams.file || exportedFromFlash)
			view = "default";
		
		this.state = {view};
	}

	render():JSX.Element
	{
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

		if (this.state.view == "splash")
		{
			return (
				<GetStartedComponent style={ {width: "100%", height: "100%"} } onViewSelect={(view:LandingPageView) => {this.setState({view})}} />
			);
		}

		return (
			<WeaveApp
				ref={this.props.weaveAppRef}
				weave={this.props.weave}
				style={{width: "100%", height: "100%"}}
				showFileDialog={this.state.view == "file"}
				readUrlParams={true}
			/>
		)
	}
}