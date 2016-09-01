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

namespace weavejs.geom.radviz
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;

	export class ILayoutAlgorithm
	{
		static WEAVE_INFO = Weave.classInfo(ILayoutAlgorithm, {
			id: 'weavejs.geom.radviz.ILayoutAlgorithm',
			interfaces: [ICallbackCollection]
		});
	}

	/**
	 * An interface for dimensional layout algorithms
	 */
	export interface ILayoutAlgorithm extends ICallbackCollection
	{
		/**
		 * Runs the layout algorithm and calls performLayout()
		 * @param array An array of IAttributeColumns to reorder
		 * @param keyNumberHashMap hash map to speed up computation
		 * @return An ordered array of IAttributeColumns
		 */
		run(array:IAttributeColumn[], keyNumberHashMap:D2D_KeyColumnNumber):IAttributeColumn[];

		/**
		 * Performs the calculations to reorder an array
		 * @param columns an array of IAttributeColumns
		 */
		performLayout(columns:IAttributeColumn[]):void;
	}

	export type D2D_KeyColumnNumber = Dictionary2D<IQualifiedKey, IAttributeColumn, number>;
}