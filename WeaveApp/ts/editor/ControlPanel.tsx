import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";

import {WeaveAPI} from "weavejs";
import Dictionary2D = weavejs.util.Dictionary2D;
import PopupWindow = weavejs.ui.PopupWindow;
import PopupWindowProps = weavejs.ui.PopupWindowProps;

export default class ControlPanel extends PopupWindow
{
	//TODO - ok/cancel buttons with targets like in Flash Weave

	static d2d_weave_class_popup = new Dictionary2D<Weave, typeof React.Component, PopupWindow>(true, true);
	static openInstance<P>(weave:Weave, ComponentType:new(..._:any[])=>React.Component<P, any>, popupProps:PopupWindowProps = null, componentProps:P = null):ControlPanel
	{
		var popup = ControlPanel.d2d_weave_class_popup.get(weave, ComponentType);
		if (popup)
			popup.close();
		popup = PopupWindow.open(
			_.merge(
				{
					title: WeaveAPI.ClassRegistry.getDisplayName(ComponentType),
					width: 900,
					height: 600
				},
				popupProps,
				{
					modal: false,
					content: <ComponentType {...componentProps}/>,
					onClose: () => ControlPanel.d2d_weave_class_popup.remove(weave, ComponentType)
				}
			) as PopupWindowProps
		);
		ControlPanel.d2d_weave_class_popup.set(weave, ComponentType, popup);
		return popup;
	}
}
