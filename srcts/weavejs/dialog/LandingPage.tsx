namespace weavejs.dialog
{
	import WeaveApp = weavejs.app.WeaveApp;
	import MiscUtils = weavejs.util.MiscUtils;

	const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

	export declare type LandingPageView = "splash"|"default"|"file"|"tour list" |"tour";

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

	export class LandingPage extends React.Component<LandingPageProps, LandingPageState>
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

		loadGetStartedComponentWithTourList=()=>{
			this.props.weave.history.clearHistory(); // important to clear the hsitory created by prev tour
			this.props.weave.root.removeAllObjects(); // important to clear the all the session state object created by prev tour
			this.setState({
				view:"tour list"
			});
		};

		render():JSX.Element
		{

			if (this.state.view == "splash" || this.state.view == "tour list")
			{
				return (
					<GetStartedComponent style={ {width: "100%", height: "100%"} }
										 showInteractiveTourList={this.state.view == "tour list"}
										 onViewSelect={(view:LandingPageView) => {this.setState({view})}} />
				);
			}


			return (
				<WeaveApp
					ref={this.props.weaveAppRef}
					weave={this.props.weave}
					style={{width: "100%", height: "100%"}}
					showFileDialog={this.state.view == "file"}
					enableTour={this.state.view == "tour"}
					readUrlParams={true}
					onClose={this.loadGetStartedComponentWithTourList}
				/>
			)
		}

		static initialize(options:{
			element:string|Element,
			weaveInstance?:Weave
			showSplash?:boolean}):Weave
		{
			let {element, weave} = WeaveApp.getElementAndInstance(options);

			if (typeof Symbol === 'undefined')
			{
				ReactDOM.render(<span>Browser not supported</span>, element);
				return;
			}

			ReactDOM.render(
				<LandingPage
					weave={weave}
					initialView={options.showSplash ? "splash" : "file"}
					weaveAppRef={(weaveApp:weavejs.app.WeaveApp) => (window as any).weaveApp = weaveApp}
				/>,
				element
			);

			return weave;
		}
	}
}
