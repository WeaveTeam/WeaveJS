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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * This is a simple and generic interface for getting columns of data from a source.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.data.IDataSource"})
	export class IDataSource extends ILinkableObject
	{
		/**
		 * A boolean determining whether or not a datasource depends on only session-local resources.
		 * @return False if the datasource uses or depends on remote/network resources, true otherwise.
		 */
		isLocal:boolean;
		/**
		 * Gets the label of the root hierarchy node.
		 * @return The label of the root hierarchy node.
		 */
		getLabel:()=>string;

		/**
		 * When explicitly triggered, this will force the hierarchy to be refreshed.
		 * This should not be used to determine when the hierarchy is updated.
		 * For that purpose, add a callback directly to the IDataSource instead.
		 */
		hierarchyRefresh:ICallbackCollection;
		
		/**
		 * Gets the root node of the attribute hierarchy, which should have descendant nodes that implement IColumnReference.
		 */
		getHierarchyRoot:()=>IWeaveTreeNode&IColumnReference;
		
		/**
		 * Finds the hierarchy node that corresponds to a set of metadata, or null if there is no such node.
		 * @param metadata Metadata used to identify a node in the hierarchy, which may or may not reference a column.
		 * @return The hierarchy node corresponding to the metadata or null if there is no corresponding node.
		 */
		findHierarchyNode:(metadata:IColumnMetadata)=>IWeaveTreeNode&IColumnReference;
		
		/**
		 * Generates a new IAttributeColumn which will receive data from this IDataSource.
		 * @param metadata Metadata used to identify a column in this IDataSource.
		 * @return A new IAttributeColumn object that will be updated when the column data is available.
		 */
		generateNewAttributeColumn:(metadata:IColumnMetadata)=>IAttributeColumn;
	}
}
