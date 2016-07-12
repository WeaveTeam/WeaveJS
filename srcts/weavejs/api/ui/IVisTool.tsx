namespace weavejs.api.ui
{
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import WeavePath = weavejs.path.WeavePath;
	import SelectableAttributeComponent = weavejs.ui.SelectableAttributeComponent;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;

	export interface IVisToolProps
	{
	}

	export interface IVisToolState
	{
	}

	export class IVisTool extends ISelectableAttributes
	{
		title:string;
		renderEditor:(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void)=>JSX.Element;
	}

	export function renderSelectableAttributes(selectableAttributes:Map<string,(IColumnWrapper|ILinkableHashMap)>, pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void):React.ReactChild[][]
	{
		return weavejs.util.JS.mapEntries(selectableAttributes).map(([key, value]) => {
				return [
					Weave.lang(key),
					<SelectableAttributeComponent attributeName={key} attributes={ selectableAttributes } pushCrumb={ pushCrumb }/>
				]
		})
	}
}
