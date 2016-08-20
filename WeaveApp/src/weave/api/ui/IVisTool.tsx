import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import SelectableAttributeComponent from "weave/ui/SelectableAttributeComponent";
import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import JS = weavejs.util.JS;
import {WeaveAPI} from "weavejs";

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export interface IVisTool extends ISelectableAttributes
{
	title:string;
	renderEditor:( pushCrumb:( title:string, renderFn:()=>JSX.Element, stateObject:any )=>void )=>JSX.Element;
}

export class IVisTool
{
	static renderSelectableAttributes(selectableAttributes:Map<string,(IColumnWrapper|ILinkableHashMap)>, pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void):React.ReactChild[][]
	{
		return JS.mapEntries(selectableAttributes).map(([key, value]) => {
			return [
				Weave.lang(key),
				<SelectableAttributeComponent attributeName={key} attributes={ selectableAttributes } pushCrumb={ pushCrumb }/>
			];
		});
	}
}
WeaveAPI.ClassRegistry.registerClass(IVisTool, 'weavejs.api.ui.IVisTool', [ISelectableAttributes]);
export default IVisTool;
