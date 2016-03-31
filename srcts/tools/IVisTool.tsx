import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;
import * as React from "react";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import ToolTip from "./ToolTip";
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor():JSX.Element;
    selectableAttributes:Map<string,(IColumnWrapper|LinkableHashMap)>;//TODO make this into an interface?
}

export function renderSelectableAttributes(tool:IVisTool)
{
	var attrLabels = Array.from(tool.selectableAttributes.keys());

	return attrLabels.map((label: string, index: number) => {
		let attribute_lhm_or_icw = tool.selectableAttributes.get(label);
		if (Weave.IS(attribute_lhm_or_icw, IColumnWrapper)) // IColumnWrapper
		{
			let attribute = attribute_lhm_or_icw as IColumnWrapper;
			return <SelectableAttributeComponent key={index} attributeNames={attrLabels} label={label} attribute={attribute}/>;
		}
		else  // LinkableHashMap
		{
			let attribute = attribute_lhm_or_icw as LinkableHashMap;
			return <SelectableAttributesList key={index} attributeNames={attrLabels} label={label} columns={attribute} showLabelAsButton={true}/>;
		}
	});
}
