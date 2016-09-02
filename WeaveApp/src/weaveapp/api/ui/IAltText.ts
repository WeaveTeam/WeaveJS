import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;

export class IAltTextConfig
{
	static WEAVE_INFO = Weave.classInfo(IAltTextConfig, {id: "weavejs.api.ui.IAltTextConfig"});

	text = Weave.linkableChild(this, LinkableString);
	showAsCaption = Weave.linkableChild(this, new LinkableBoolean(false));
}

export default class IAltText
{
	static WEAVE_INFO = Weave.classInfo(IAltText, {id: "weavejs.api.ui.IAltText"});

	altText = Weave.linkableChild(this, IAltTextConfig);
	getAutomaticDescription:()=>string;
}
