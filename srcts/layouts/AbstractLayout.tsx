import * as React from "react";
import SmartComponent from "../ui/SmartComponent";

export type LayoutPanelProps = {
	isMaximized:boolean;
	isMinimized?:boolean;
};

export declare type WeavePathArray = string[];

export interface ILayoutProps extends React.HTMLProps<AbstractLayout>
{
	panelRenderer: (id:WeavePathArray, panelProps?:LayoutPanelProps) => JSX.Element;
}

export abstract class AbstractLayout extends SmartComponent<ILayoutProps, {}>
{
	abstract addPanel(id:WeavePathArray):void;
	abstract removePanel(id:WeavePathArray):void;
	abstract toggleMaximize(id:WeavePathArray):void;
	//abstract toggleMinimize(id:WeavePathArray):void;
}
