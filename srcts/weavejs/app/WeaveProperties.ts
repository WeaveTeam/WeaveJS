	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;

	class AccessibilityProperties {
		enableAccessibilityFeatures = Weave.linkableChild(this, LinkableBoolean);
		enableCaptioning = Weave.linkableChild(this, LinkableBoolean);
	}

	Weave.registerClass(AccessibilityProperties, "weavejs.ui.properties.accessibilty");

	export class WeaveProperties implements ILinkableObject, ILinkableObjectWithNewProperties {

		enableMenuBar = Weave.linkableChild(this, new LinkableBoolean(true));
		showSessionHistorySlider = Weave.linkableChild(this, new LinkableBoolean(false));
		enableSessionHistoryControls = Weave.linkableChild(this, new LinkableBoolean(true));
		toolInteractions = Weave.linkableChild(this, LinkableHashMap);
		accessibility = Weave.linkableChild(this, AccessibilityProperties);
		macros = Weave.linkableChild(this, LinkableHashMap);

		public get deprecatedStateMapping():Object
		{
			return {};
		}
	}
	export function getWeaveProperties(weave:Weave):WeaveProperties
	{
		return weave.root.requestObject("WeaveProperties", WeaveProperties, true);
	}

	Weave.registerClass(WeaveProperties, "weavejs.ui.properties.WeaveProperties", [ILinkableObject, ILinkableObjectWithNewProperties]);
