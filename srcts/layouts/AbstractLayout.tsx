import * as React from "react";
import SmartComponent from "../ui/SmartComponent";

export type LayoutPanelProps = {
	maximized:boolean;
};

export declare type WeavePathArray = string[];

export declare type PanelRenderer = (id:WeavePathArray, panelProps?:LayoutPanelProps, panelRenderer?:PanelRenderer) => JSX.Element;

export interface LayoutProps extends React.HTMLProps<AbstractLayout>
{
	panelRenderer: PanelRenderer;
}

export abstract class AbstractLayout extends SmartComponent<LayoutProps, {}>
{
	abstract addPanel(id:WeavePathArray):void;
	abstract removePanel(id:WeavePathArray):void;
	abstract maximizePanel(id:WeavePathArray, maximize:boolean):void;
}

export default AbstractLayout;