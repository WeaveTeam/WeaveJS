namespace weavejs.app
{
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;

	export class AccessibilityProperties {
		enableAccessibilityFeatures = Weave.linkableChild(this, LinkableBoolean);
		enableCaptioning = Weave.linkableChild(this, LinkableBoolean);
	}

	Weave.registerClass(AccessibilityProperties, "weavejs.ui.properties.accessibilty");

	export class WeaveProperties implements ILinkableObject, ILinkableObjectWithNewProperties
	{
		notificationSystem:NotificationSystem.System;
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

		static getProperties(context:Weave | ILinkableObject):WeaveProperties
		{
			if (!(context instanceof Weave))
				context = Weave.getWeave(context);
			return (context as Weave).root.requestObject("WeaveProperties", WeaveProperties, true);
		}

		static notify(weave:Weave, level:"error"|"warning"|"info"|"success", message:string)
		{
			WeaveProperties.getProperties(weave).notificationSystem.addNotification({
				level,
				message,
				position: 'br'
			});
		}
	}

	Weave.registerClass(WeaveProperties, "weavejs.ui.WeaveProperties", [ILinkableObject, ILinkableObjectWithNewProperties]);
}
