/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

import * as React from "react";
import * as weavejs from "weavejs";

import ArrayUtils = weavejs.util.ArrayUtils;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import IWeaveTreeNodeWithEditableChildren = weavejs.api.data.IWeaveTreeNodeWithEditableChildren;
import {ITreeDescriptor} from "weaveapp/ui/WeaveTree";
import IColumnReference = weavejs.api.data.IColumnReference;

/**
 * Tells a Tree control how to work with IWeaveTreeNode objects.
 */
export default class WeaveTreeNodeDescriptor<Node extends IWeaveTreeNode&IColumnReference> implements ITreeDescriptor<Node>
{
	getLabel(node:Node):string
	{
		return node ? node.getLabel() : '';
	}

	isEqual(node1:Node, node2:Node):boolean
	{
		return (
			node1 && node2
			?	node1.equals(node2)
			:	node1 == node2
		);
	}

	getChildren(node:Node):Node[]
	{
		return node ? node.getChildren() as Node[] : null;
	}

	hasChildBranches(node:Node):boolean
	{
		return node && node.hasChildBranches();
	}

	isBranch(node:Node):boolean
	{
		return node && node.isBranch();
	}
}
