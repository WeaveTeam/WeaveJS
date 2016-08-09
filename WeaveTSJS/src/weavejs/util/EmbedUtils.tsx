namespace weavejs.util
{
	import WeaveApp = weavejs.app.WeaveApp;
	import LandingPage = weavejs.dialog.LandingPage;
	import WeaveComponentRenderer = weavejs.ui.WeaveComponentRenderer;
	import WeaveArchive = weavejs.core.WeaveArchive;

	export class EmbedUtils
	{
		static getElementAndInstance(options:{
			element:string|Element,
			weaveInstance?:Weave
		}):{element: Element, weave:Weave}
		{
			let element:Element;

			if (typeof options.element == typeof "")
			{
				element = document.getElementById(options.element as string);
			}
			else
			{
				element = options.element as Element;
			}

			(element as HTMLElement).style.display = "flex";

			/* Check if WeaveJS's class registries have been initialized. */
			if (!((WeaveAPI.ClassRegistry as any)['defaultPackages'] as any).length)
			{
				new WeaveJS().start();
			}

			let weave = options.weaveInstance;
			if (!weave)
			{
				/* Check if window.weave exists and is a weave instance, if so, use that. */
				if ((window as any).weave instanceof Weave)
				{
					weave = (window as any).weave;
				}
				else
				{
					weave = new Weave();
					(window as any).weave = weave;
				}
			}

			return {element, weave};
		}

		static select(keyType:string, localNames:string[])
		{

		}

		static highlight(keyType:string, localNames:string[])
		{

		}

		static embed(options:{
			element:string|Element, 
			sessionUrl?: string,
			path?:string[],
			mode?:"splash"|"file"|"app"|"tool",
			weaveInstance?:Weave}):Weave
		{
			let {element, weave} = EmbedUtils.getElementAndInstance(options);

			if (typeof Symbol === 'undefined')
			{
				ReactDOM.render(<span>Browser not supported</span>, element);
				return;
			}
			let jsxElement:JSX.Element;

			let mode = ( options.mode && options.mode.toLowerCase() ) || "tool";
			switch (mode) {
				case "splash":
				case "file":
					jsxElement = <LandingPage
						weave={weave}
						initialView={mode == "splash" ? "splash" : "file"}
						weaveAppRef={(weaveApp:WeaveApp) => (window as any).weaveApp = weaveApp}
					/>;
					break;
				case "app":
					jsxElement = <WeaveApp weave={weave} renderPath={options.path}/>;
					break;
				case "tool":
					/* Hack: In order to ensure right-click and tooltip work, instantiate a whole WeaveApp. */
					jsxElement = <WeaveApp forceMenuBar={false} weave={weave} renderPath={options.path}/>;
					break;
			}

			ReactDOM.render(
				jsxElement,
				element
			);

			if (options.sessionUrl)
			{
				WeaveArchive.setSessionFromUrl(weave, options.sessionUrl);
			}

			return weave;
		}
	}
}