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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import Scheduler = weavejs.core.Scheduler;
	import AsyncSort = weavejs.util.AsyncSort;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;

	/**
	 * Creates a separate bin for every string value in a column.
	 * 
	 * @author adufilie
	 */
	Weave.classInfo({id: "weavejs.data.bin.CategoryBinningDefinition", interfaces: [IBinningDefinition]})
	export class CategoryBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(false, false);
		}
		
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			// get all string values in the a column
			this._sortMap = {};
			this.strArray = new Array(column.keys.length); // alloc max length
			this.column = column;
			this.i = this.iout = 0;
			this.keys = column.keys;
			this._iterateAll(-1); // restart from first task
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this.asyncResultCallbacks, this._iterateAll, WeaveAPI.TASK_PRIORITY_HIGH, this._done.bind(this));
		}
		
		private _sortMap:{[key:string]:number}; // used by _sortFunc
		private strArray:string[];
		private i:int;
		private iout:int;
		private str:string;
		private column:IAttributeColumn;
		private keys:IQualifiedKey[];
		private _iterateAll = Scheduler.generateCompoundIterativeTask((stopTime:int) => this._iterate1(stopTime), (stopTime:int) => this._iterate1(stopTime));
		private asyncSort:AsyncSort = Weave.disposableChild(this, AsyncSort);
		
		private _iterate1(stopTime:int):number
		{
			for (; this.i < this.keys.length; this.i++)
			{
				if (Date.now() > stopTime)
					return this.i / this.keys.length;
				
				this.str = this.column.getValueFromKey(this.keys[this.i], String) as string;
				if (this.str && !this._sortMap.hasOwnProperty(this.str))
				{
					this.strArray[int(this.iout++)] = this.str;
					this._sortMap[this.str] = this.column.getValueFromKey(this.keys[this.i], Number);
				}
			}
			
			this.strArray.length = this.iout; // truncate
			this.asyncSort.beginSort(this.strArray, this._sortFunc.bind(this)); // sort strings by corresponding numeric values
			this.i = 0;
			
			return 1;
		}
		
		private _iterate2(stopTime:int):number
		{
			if (Weave.isBusy(this.asyncSort))
				return 0;
			
			for (; this.i < this.strArray.length; this.i++)
			{
				if (Date.now() > stopTime)
					return this.i / this.strArray.length;
				
				this.str = Weave.AS(this.strArray[this.i], String) as string;
				
				var svc:SingleValueClassifier = this.output.requestObject(this.str, SingleValueClassifier, false);
				svc.state = this.strArray[this.i];
			}
			
			return 1;
		}
		
		private _done():void
		{
			this.asyncResultCallbacks.triggerCallbacks();
		}
		
		/**
		 * This function sorts string values by their corresponding numeric values stored in _sortMap.
		 */
		private _sortFunc(str1:string, str2:string):int
		{
			return StandardLib.numericCompare(this._sortMap[str1], this._sortMap[str2])
				|| StandardLib.stringCompare(str1, str2);
		}
	}
}
