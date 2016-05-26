import * as React from "react";
import SmartComponent from "../ui/SmartComponent";
import {WeavePathArray} from "../utils/WeaveReactUtils";

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

	static readDragData(event:React.DragEvent):LayoutDragData
	{
		try
		{
			var str = event.dataTransfer.getData('text/plain');
			var obj = JSON.parse(str);
			if(obj)
			{
				return {
					panelDragged: Weave.AS(obj.panelDragged, Array),
					layout: Weave.AS(obj.layout, Array) as WeavePathArray
				}
			}
			else
			{
				return null;
			}
		}
		catch (e)
		{
			return null;
		}
	}
}
