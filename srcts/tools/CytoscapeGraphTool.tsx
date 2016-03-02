import cytoscape from "cytoscape";
import * as lodash from "lodash";
import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import AbstractVisTool from "./AbstractVisTool";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableNumber = weavejs.core.LinkableNumber;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import Bounds2D = weavejs.geom.Bounds2D;

export default class CytoscapeGraphTool extends AbstractVisTool {
	private element: Element;
	private cy: any;

	/* Node properties */
	nodeLabel = Weave.linkableChild(this, DynamicColumn);
	nodeFill = Weave.linkableChild(this, SolidFillStyle);
	nodeLine = Weave.linkableChild(this, SolidLineStyle);
	nodeRadius = Weave.linkableChild(this, new AlwaysDefinedColumn(10));
	nodeParent = Weave.linkableChild(this, DynamicColumn);
	
	edgeSource = Weave.linkableChild(this, DynamicColumn);
	edgeTarget = Weave.linkableChild(this, DynamicColumn);
	edgeLine = Weave.linkableChild(this, SolidLineStyle);

	nodeX = Weave.linkableChild(this, DynamicColumn);
	nodeY = Weave.linkableChild(this, DynamicColumn);

	constructor(props:IVisToolProps)
	{
		super(props);
	}

	render()
	{
		return <div ref={(c: HTMLElement) => { this.element = c; } } style = {{ width: "100%", height: "100%" }}/>;
	}

	componentDidMount()
	{
		this.cy = cytoscape({
			container: this.element
		});
	}
}