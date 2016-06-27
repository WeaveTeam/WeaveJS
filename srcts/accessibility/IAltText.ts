import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;

export class AltTextConfig
{
	text = Weave.linkableChild(this, LinkableString);
	showAsCaption = Weave.linkableChild(this, new LinkableBoolean(false));
}
Weave.registerClass(AltTextConfig, "weavejs.api.ui.IAltTextConfig");

export default class IAltText
{
	altText = Weave.linkableChild(this, AltTextConfig);
	getAutomaticDescription:()=>string;
}
Weave.registerClass(IAltText, "weavejs.api.ui.IAltText");