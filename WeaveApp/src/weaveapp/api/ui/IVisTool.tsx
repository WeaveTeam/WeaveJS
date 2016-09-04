import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import SelectableAttributeComponent from "weaveapp/ui/SelectableAttributeComponent";
import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import JS = weavejs.util.JS;

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export default class IVisTool extends ISelectableAttributes
{
	static WEAVE_INFO = Weave.classInfo(IVisTool, {
		id: 'weavejs.api.ui.IVisTool',
		interfaces: [ISelectableAttributes]
	});

	title:string;
	renderEditor:( pushCrumb:( title:string, renderFn:()=>JSX.Element, stateObject:any )=>void )=>JSX.Element;

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
