import * as React from "react";
import * as _ from "lodash";
import PopupWindow from "../react-ui/PopupWindow";
import {PopupWindowProps} from "../react-ui/PopupWindow";
import Dictionary2D = weavejs.util.Dictionary2D;

export interface IControlPanelProps
{
}

export interface IControlPanelState
{
}

export default class ControlPanel extends PopupWindow
{
	//TODO - ok/cancel buttons with targets like in Flash Weave	
	
	static d2d_weave_class_popup = new Dictionary2D<Weave, typeof React.Component, PopupWindow>(true, true);
	static openInstance<P>(weave:Weave, ComponentType:new(..._:any[])=>React.Component<P, any>, popupProps:PopupWindowProps = null, componentProps:P = null):ControlPanel
	{
		var popup = ControlPanel.d2d_weave_class_popup.get(weave, ComponentType);
		if (popup)
			PopupWindow.close(popup);
		popup = PopupWindow.open(
			_.merge(
				{
					title: weavejs.WeaveAPI.ClassRegistry.getDisplayName(ComponentType),
					width: 800,
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
