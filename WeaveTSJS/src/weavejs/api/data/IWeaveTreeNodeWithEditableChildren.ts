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

namespace weavejs.api.data
{
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

	/**
	 * Extends IWeaveTreeNode by adding addChildAt() and removeChild().
	 * @author adufilie
	 */	
    export class IWeaveTreeNodeWithEditableChildren extends IWeaveTreeNode
    {
		static WEAVE_INFO = Weave.classInfo(IWeaveTreeNodeWithEditableChildren, {
			id: "weavejs.api.data.IWeaveTreeNodeWithEditableChildren",
			interfaces: [IWeaveTreeNode]
		});
		/**
		 * Adds a child node.
		 * @param child The child to add.
		 * @param index The new child index.
		 * @return true if successful.
		 */
		addChildAt:(newChild:IWeaveTreeNode, index:int)=>boolean;

		/**
		 * Removes a child node.
		 * @param child The child to remove.
		 * @return true if successful.
		 */
		removeChild:(child:IWeaveTreeNode)=>boolean;
    }
}
