import * as React from "react";
import * as weavejs from "weavejs";

import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import IColumnReference = weavejs.api.data.IColumnReference;
import WeaveTreeNodeDescriptor from "weave/ui/WeaveTreeNodeDescriptor";
import {WeaveTree, IWeaveTreeProps, ITreeDescriptor} from "weave/ui/WeaveTree";

let defaultTreeDescriptor:ITreeDescriptor<any>;

export default class WeaveDataTree extends WeaveTree<IWeaveTreeNode & IColumnReference>
{
	public static defaultProps:IWeaveTreeProps<any> = {
		get treeDescriptor() {
			return defaultTreeDescriptor || (defaultTreeDescriptor = new WeaveTreeNodeDescriptor<IWeaveTreeNode & IColumnReference>());
		}
	};

	constructor(props: IWeaveTreeProps<IWeaveTreeNode & IColumnReference>)
	{
		super(props);
	}
}
