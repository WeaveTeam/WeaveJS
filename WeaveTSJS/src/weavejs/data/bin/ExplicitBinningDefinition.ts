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

namespace weavejs.data.bin
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	
	/**
	 * Defines bins explicitly and is not affected by what column is passed to generateBinClassifiersForColumn().
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.bin.ExplicitBinningDefinition", interfaces: [IBinningDefinition]})
	export class ExplicitBinningDefinition extends LinkableHashMap implements IBinningDefinition
	{
		constructor()
		{
			super(IBinClassifier);
		}
		
		public get asyncResultCallbacks():ICallbackCollection
		{
			return this; // when our callbacks trigger, the results are immediately available
		}

		public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			// do nothing because our bins don't depend on any column.
		}
		
		public getBinClassifiers():IBinClassifier[]
		{
			return this.getObjects(IBinClassifier);
		}
		
		public getBinNames():string[]
		{
			return this.getNames();
		}
	}
}
