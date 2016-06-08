import * as React from "react";
import SmartComponent from "../ui/SmartComponent";
import {WeavePathArray} from "../utils/WeaveReactUtils";
import MiscUtils from "../utils/MiscUtils";
import ReactUtils from "../utils/ReactUtils";
import MouseUtils from "../utils/MouseUtils";

export type LayoutPanelProps = {
	maximized?:boolean;
};

export declare type PanelRenderer = (id:WeavePathArray, panelProps?:LayoutPanelProps, panelRenderer?:PanelRenderer) => JSX.Element;

export interface LayoutProps extends React.HTMLProps<AnyAbstractLayout>
{
	panelRenderer: PanelRenderer;
}

export declare type LayoutDragData = {
	panelDragged: WeavePathArray,
	layout: WeavePathArray
};

export declare type AnyAbstractLayout = AbstractLayout<LayoutProps, {}>;

export abstract class AbstractLayout<P extends LayoutProps, S> extends SmartComponent<P, S>
{
	title:string;
	abstract addPanel(id:WeavePathArray):void;
	abstract removePanel(id:WeavePathArray):void;
	abstract maximizePanel(id:WeavePathArray, maximize:boolean):void;
	abstract getPanelIds():WeavePathArray[];
}

export class PanelDragEvent
{
	private static DRAG_DATA_TYPE = 'abstract-layout-panel-id'; // lower-case because DataTransfer converts it to lower case anyway
	
	static hasPanelId(event:React.DragEvent):boolean
	{
		var types = event.dataTransfer.types;
		if (Array.isArray(types))
			return (types as any as any[]).indexOf(PanelDragEvent.DRAG_DATA_TYPE) >= 0;
		if (types.contains)
			return types.contains(PanelDragEvent.DRAG_DATA_TYPE);
		console.error("Unexpected DragEvent.prototype.types value", event);
		return false;
	}

	static setPanelId(event:React.DragEvent, panelId:WeavePathArray, instance:React.ReactInstance = null):void
	{
		var dt = event.dataTransfer;
		if (instance)
		{
			var element = ReactUtils.getElement(instance);
			var offset = MouseUtils.getOffsetPoint(element as HTMLElement);

			// setDragImage is missing from type
			if ((dt as any).setDragImage)
				(dt as any).setDragImage(element, offset.x, offset.y);
		}

		dt.setData(PanelDragEvent.DRAG_DATA_TYPE, JSON.stringify(panelId));
	}

	static getPanelId(event:React.DragEvent):WeavePathArray
	{
		try
		{
			var str = event.dataTransfer.getData(PanelDragEvent.DRAG_DATA_TYPE);
			return MiscUtils.normalizeStructure(JSON.parse(str), ['string']);
		}
		catch (e)
		{
			return null;
		}
	}

	static getLayout(event:React.DragEvent, weave:Weave):AnyAbstractLayout
	{
		var panelId = PanelDragEvent.getPanelId(event);
		var panel = weave.getObject(panelId) as React.Component<any, any>;
		return ReactUtils.findComponent(panel, AbstractLayout as any) as AnyAbstractLayout;
	}
}