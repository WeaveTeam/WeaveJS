import * as React from "react";
import SmartComponent from "../ui/SmartComponent";

export type LayoutItemProps = {
	onReposition?:(position:{left:number, top:number, width:number, height:number})=>void
};

export declare type WeavePathArray = string[];

export interface ILayoutProps extends React.HTMLProps<AbstractLayout>
{
	itemRenderer: (id:WeavePathArray, panelProps?:LayoutItemProps) => JSX.Element;
}

export abstract class AbstractLayout extends SmartComponent<ILayoutProps, {}>
{
	abstract addItem(id:WeavePathArray):void;
	abstract removeItem(id:WeavePathArray):void;
}
