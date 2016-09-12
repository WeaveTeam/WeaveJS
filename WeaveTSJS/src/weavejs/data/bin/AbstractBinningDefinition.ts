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
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;

	/**
	 * Extend this class and implement <code>generateBinClassifiersForColumn()</code>, which should store its results in the
	 * protected <code>output</code> variable and trigger <code>asyncResultCallbacks</code> when the task completes.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: 'weavejs.data.bin.AbstractBinningDefinition', interfaces: [IBinningDefinition]})
	export class AbstractBinningDefinition implements IBinningDefinition
	{
		constructor(allowOverrideBinNames:boolean, allowOverrideInputRange:boolean)
		{
			if (allowOverrideBinNames)
				this._overrideBinNames = Weave.linkableChild(this, new LinkableString(''));
			
			if (allowOverrideInputRange)
			{
				this._overrideInputMin = Weave.linkableChild(this, LinkableNumber);
				this._overrideInputMax = Weave.linkableChild(this, LinkableNumber);
			}
		}
		
		/**
		 * Implementations that extend this class should use this as an output buffer.
		 */		
		protected output:ILinkableHashMap = Weave.disposableChild(this, new LinkableHashMap(IBinClassifier));
		private _asyncResultCallbacks:ICallbackCollection = Weave.disposableChild(this, CallbackCollection);
		
		public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			throw new Error("Not implemented");
		}
		
		public get asyncResultCallbacks():ICallbackCollection
		{
			return this._asyncResultCallbacks;
		}
		
		public getBinNames():string[]
		{
			if (Weave.isBusy(this))
				return null;
			return this.output.getNames();
		}
		
		public getBinClassifiers():IBinClassifier[]
		{
			if (Weave.isBusy(this))
				return null;
			return this.output.getObjects() as IBinClassifier[];
		}
		
		//-------------------
		
		private _overrideBinNames:LinkableString;
		private _overrideInputMin:LinkableNumber;
		private _overrideInputMax:LinkableNumber;
		private _overrideBinNamesArray:string[] = [];

		public get overrideBinNames():LinkableString { return this._overrideBinNames; }
		public get overrideInputMin():LinkableNumber { return this._overrideInputMin; }
		public get overrideInputMax():LinkableNumber { return this._overrideInputMax; }

		private getOverrideNamesObserver = {};
		protected getOverrideNames():string[]
		{
			if (this.overrideBinNames && Weave.detectChange(this.getOverrideNamesObserver, this.overrideBinNames))
				this._overrideBinNamesArray = WeaveAPI.CSVParser.parseCSVRow(this.overrideBinNames.value) || [];
			return this._overrideBinNamesArray;
		}
	}
}
