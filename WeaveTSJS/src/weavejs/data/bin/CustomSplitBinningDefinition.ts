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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import LinkableString = weavejs.core.LinkableString;
	import AsyncSort = weavejs.util.AsyncSort;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	import NumberClassifier = weavejs.data.bin.NumberClassifier;

	/**
	 * Divides a data range into a number of bins based on range entered by user.
	 * 
	 * @author adufilie
	 * @author abaumann
	 * @author skolman
	 */
	@Weave.classInfo({id: "weavejs.data.bin.CustomSplitBinningDefinition", interfaces: [IBinningDefinition]})
	export class CustomSplitBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, false);
		}
		
		/**
		 * A list of numeric values separated by commas that mark the beginning and end of bin ranges.
		 */
		public /* readonly */ splitValues:LinkableString = Weave.linkableChild(this, LinkableString);
		
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			// make sure callbacks only run once.
			Weave.getCallbacks(this.output).delayCallbacks();
			
			var name:string;
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			var i:int;
			var values:any[] /* string[]|number[] */ = String(this.splitValues.value || '').split(',');
			// remove bad values
			for ( i = values.length; i--;)
			{
				var number:number = StandardLib.asNumber(values[i]);
				if (!isFinite(number))
					values.splice(i, 1);
				else
					values[i] = number;
			}
			// sort numerically
			AsyncSort.sortImmediately(values);
			
			for (i = 0; i < values.length - 1; i++)
			{
				this.tempNumberClassifier.min.value = values[i];
				this.tempNumberClassifier.max.value = values[i + 1];
				this.tempNumberClassifier.minInclusive.value = true;
				this.tempNumberClassifier.maxInclusive.value = (i == values.length - 2);
				
				//first get name from overrideBinNames
				name = this.getOverrideNames()[i];
				//if it is empty string set it from generateBinLabel
				if(!name)
					name = this.tempNumberClassifier.generateBinLabel(column);
				this.output.requestObjectCopy(name, this.tempNumberClassifier);
			}
			
			// allow callbacks to run now.
			Weave.getCallbacks(this.output).resumeCallbacks();
			
			// trigger callbacks now because we're done updating the output
			this.asyncResultCallbacks.triggerCallbacks();
		}
		
		// reusable temporary object
		private tempNumberClassifier:NumberClassifier = Weave.disposableChild(this, NumberClassifier);

		// backwards compatibility
		/**
		 * @deprecated replacement="splitValues")
		 */
		public set binRange(value:string) { this.splitValues.value = value; }

		// backwards compatibility
		/**
		 * @deprecated replacement="splitValues")
		 */
		public set dataMin(value:string) { this.splitValues.value = value + ',' + this.splitValues.value; }

		// backwards compatibility
		/**
		 * @deprecated replacement="splitValues")
		 */
		public set dataMax(value:string) { this.splitValues.value += ',' + value; }
	}
}

