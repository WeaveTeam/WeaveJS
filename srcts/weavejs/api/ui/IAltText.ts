namespace weavejs.api.ui
{
	import LinkableString = weavejs.core.LinkableString;
	import LinkableBoolean = weavejs.core.LinkableBoolean;

	export class IAltTextConfig
	{
		static WEAVE_INFO = Weave.classInfo(IAltTextConfig, {
			id: "weavejs.api.ui.IAltTextConfig",
		});

		text = Weave.linkableChild(this, LinkableString);
		showAsCaption = Weave.linkableChild(this, new LinkableBoolean(false));
	}

	export class IAltText
	{
		static WEAVE_INFO = Weave.classInfo(IAltTextConfig, {
			id: "weavejs.api.ui.IAltText",
		});
		altText = Weave.linkableChild(this, IAltTextConfig);
		getAutomaticDescription:()=>string;
	}
}
