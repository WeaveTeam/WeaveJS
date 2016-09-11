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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This provides a wrapper for a dynamically created IBinningDefinition.
	 * When <code>generateBinClassifiersForColumn(column)</code> is called, the column
	 * will be monitored for changes and results will be computed automatically.
	 */
	@Weave.classInfo({id: "weavejs.data.bin.DynamicBinningDefinition", interfaces: [IBinningDefinition]})
	export class DynamicBinningDefinition extends LinkableDynamicObject implements IBinningDefinition
	{
		/**
		 * @param lockFirstColumn If set to true, the first column passed to <code>generateBinClassifiersForColumn()</code> will be the only column accepted.
		 */
		constructor(lockFirstColumn:boolean = false)
		{
			super(IBinningDefinition);
			this.addImmediateCallback(null, this.watchInternalObject);
			this._columnLocked = lockFirstColumn;
		}
		
		private _columnLocked:boolean = false;
		private internalResultWatcher:LinkableWatcher = Weave.disposableChild(this, LinkableWatcher);
		private internalObjectWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher, this.handleInternalObjectChange);
		private columnWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher, this.generateBins);
		private statsWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher, this.generateBins);
		
		private watchInternalObject():void
		{
			this.internalObjectWatcher.target = this.internalObject;
		}
		
		private handleInternalObjectChange():void
		{
			if (this.internalObject)
				this.internalResultWatcher.target = Weave.AS(this.internalObject, IBinningDefinition).asyncResultCallbacks
			this.generateBins();
		}
		
		private _updatingTargets:boolean = false;
		private generateBins():void
		{
			// prevent recursion if this function is called as a result of updating targets
			if (this._updatingTargets)
				return;
			this._updatingTargets = true;
			
			var column:IAttributeColumn = Weave.AS(this.columnWatcher.target, IAttributeColumn);
			this.statsWatcher.target = column ? WeaveAPI.StatisticsCache.getColumnStatistics(column) : null;
			this._updatingTargets = false; // done preventing recursion


			var overrideBins:string = column ? column.getMetadata(ColumnMetadata.OVERRIDE_BINS) : null;
			if (overrideBins && DynamicBinningDefinition.getBinsFromJson(overrideBins, this.overrideBinsOutput, column))
				this.asyncResultCallbacks.triggerCallbacks();
			else
				this.overrideBinsOutput.removeAllObjects();
			
			if (this.internalObject && column)
				Weave.AS(this.internalObject, IBinningDefinition).generateBinClassifiersForColumn(column);
			else
				this.asyncResultCallbacks.triggerCallbacks(); // bins are empty
		}
		
		/**
		 * @param json Any one of the following formats:
		 *     [1,2,3]<br>
		 *     [[0,5],[5,10]]<br>
		 *     [{"min": 0, "max": 33, "label": "low"}, {"min": 34, "max": 66, "label": "midrange"}, {"min": 67, "max": 100, "label": "high"}]
		 * @return true on success
		 */
		public static getBinsFromJson(json:string, output:ILinkableHashMap, toStringColumn:IAttributeColumn = null):boolean
		{
			if (!DynamicBinningDefinition.tempNumberClassifier)
				DynamicBinningDefinition.tempNumberClassifier = new NumberClassifier();
			
			Weave.getCallbacks(output).delayCallbacks();
			output.removeAllObjects();
			
			var array:any[];
			try
			{
				array = Weave.AS(JSON.parse(json), Array);
				
				for (var item of array || [])
				{
					var label:string;
					if (Weave.IS(item, String) || StandardLib.getArrayType(Weave.AS(item, Array)) == String)
					{
						label = (Weave.AS(item, Array) || [item]).join(', ');
						var sc:StringClassifier = output.requestObject(label, StringClassifier, false);
						sc.setSessionState(Weave.AS(item, Array) || [item]);
					}
					else
					{
						DynamicBinningDefinition.tempNumberClassifier.min.value = -Infinity;
						DynamicBinningDefinition.tempNumberClassifier.max.value = Infinity;
						DynamicBinningDefinition.tempNumberClassifier.minInclusive.value = true;
						DynamicBinningDefinition.tempNumberClassifier.maxInclusive.value = true;
						
						if (Weave.IS(item, Array))
						{
							DynamicBinningDefinition.tempNumberClassifier.min.value = item[0];
							DynamicBinningDefinition.tempNumberClassifier.max.value = item[1];
						}
						else if (Weave.IS(item, Number))
						{
							DynamicBinningDefinition.tempNumberClassifier.min.value = Weave.AS(item, Number) as number;
							DynamicBinningDefinition.tempNumberClassifier.max.value = Weave.AS(item, Number) as number;
						}
						else
						{
							WeaveAPI.SessionManager.setSessionState(DynamicBinningDefinition.tempNumberClassifier, item);
						}
						
						if (item && typeof item == 'object' && item['label'])
							label = item['label'];
						else
							label = DynamicBinningDefinition.tempNumberClassifier.generateBinLabel(toStringColumn);
						output.requestObjectCopy(label, DynamicBinningDefinition.tempNumberClassifier);
					}
				}
			}
			catch (e)
			{
				console.error("Invalid JSON bin specification: " + json, null, e);
				Weave.getCallbacks(output).resumeCallbacks();
				return false;
			}
			
			Weave.getCallbacks(output).resumeCallbacks();
			return true;
		}
		
		public get asyncResultCallbacks():ICallbackCollection
		{
			return Weave.getCallbacks(this.internalResultWatcher);
		}

		public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			if (this._columnLocked && this.columnWatcher.target)
				throw new Error("generateBinClassifiersForColumn(): Column was locked upon creation of this DynamicBinningDefinition.");
			this.columnWatcher.target = column;
		}
		
		public getBinClassifiers():IBinClassifier[]
		{
			var override:IBinClassifier[] = this.overrideBinsOutput.getObjects() as IBinClassifier[];
			if (override.length)
				return override;
			if (this.internalObject && this.columnWatcher.target)
				return Weave.AS(this.internalObject, IBinningDefinition).getBinClassifiers();
			return [];
		}
		
		public getBinNames():string[]
		{
			var override:string[] = this.overrideBinsOutput.getNames();
			if (override.length)
				return override;
			if (this.internalObject && this.columnWatcher.target)
				return Weave.AS(this.internalObject, IBinningDefinition).getBinNames();
			return [];
		}
		
		public get binsOverridden():boolean
		{
			return this.overrideBinsOutput.getNames().length > 0;
		}
		
		protected overrideBinsOutput:ILinkableHashMap = Weave.disposableChild(this, new LinkableHashMap(IBinClassifier));
		
		// reusable temporary object
		private static tempNumberClassifier:NumberClassifier;
	}
}
