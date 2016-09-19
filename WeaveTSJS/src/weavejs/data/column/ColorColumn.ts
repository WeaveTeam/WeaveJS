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

namespace weavejs.data.column
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import ColorRamp = weavejs.util.ColorRamp;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	/**
	 * ColorColumn
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.ColorColumn", interfaces:[IColumnWrapper, IAttributeColumn, ICallbackCollection]})
	export class ColorColumn extends ExtendedDynamicColumn
	{
		constructor()
		{
			super();
			this._internalColumnStats = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.internalDynamicColumn));
		}
		
		/* override */ public getMetadata(propertyName:string):string
		{
			if (propertyName == ColumnMetadata.DATA_TYPE)
				return DataTypes.STRING;
			
			return super.getMetadata(propertyName);
		}
		
		// color values depend on the min,max stats of the internal column
		private _internalColumnStats:IColumnStatistics;
		
		public /* readonly */ramp:ColorRamp = Weave.linkableChild(this, ColorRamp);
		public /* readonly */rampCenterAtZero:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.cacheState);
		
		private _rampCenterAtZero:boolean;
		private cacheState():void
		{
			this._rampCenterAtZero = this.rampCenterAtZero.value;
		}
		
		public getDataMin():number
		{
			if (this._rampCenterAtZero)
			{
				var dataMin:number = this._internalColumnStats.getMin();
				var dataMax:number = this._internalColumnStats.getMax();
				return -Math.max(Math.abs(dataMin), Math.abs(dataMax));
			}
			return this._internalColumnStats.getMin();
		}
		public getDataMax():number
		{
			if (this._rampCenterAtZero)
			{
				var dataMin:number = this._internalColumnStats.getMin();
				var dataMax:number = this._internalColumnStats.getMax();
				return Math.max(Math.abs(dataMin), Math.abs(dataMax));
			}
			return this._internalColumnStats.getMax();
		}
		public getColorFromDataValue(value:number):number
		{
			var dataMin:number = this._internalColumnStats.getMin();
			var dataMax:number = this._internalColumnStats.getMax();
			var norm:number;
			if (dataMin == dataMax)
			{
				norm = isFinite(value) ? 0.5 : NaN;
			}
			else if (this._rampCenterAtZero)
			{
				var absMax:number = Math.max(Math.abs(dataMin), Math.abs(dataMax));
				norm = (value + absMax) / (2 * absMax);
			}
			else
			{
				norm = (value - dataMin) / (dataMax - dataMin);
			}
			return this.ramp.getColorFromNorm(norm);
		}
		
		/**
		 * This is a CSV containing specific colors associated with record keys.
		 * The format for each row in the CSV is:  keyType,localName,color
		 */
		public /* readonly */recordColors:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, (value:any) => this.verifyRecordColors(value)));
		private verifyRecordColors(value:any):boolean
		{
			if (Weave.IS(value, String))
			{
				value = WeaveAPI.CSVParser.parseCSV(Weave.AS(value, String) as string);
				this.recordColors.setSessionState(value);
				return false;
			}
			if (value == null)
				return true;
			
			return Weave.IS(value, Array) && StandardLib.arrayIsType(Weave.AS(value, Array), Array);
		}
		private map_key_recordColor:Map<IQualifiedKey, number>;
		private handleRecordColors():void
		{
			var rows:any[][] = Weave.AS(this.recordColors.getSessionState(), Array) || [];
			this.map_key_recordColor = new Map<IQualifiedKey, any>();
			for (var row of rows)
			{
				if (row.length != 3)
					continue;
				try
				{
					var key:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(row[0], row[1]);
					var color:number = StandardLib.asNumber(row[2]);
					this.map_key_recordColor.set(key, color);
				}
				catch (e)
				{
					console.error(e);
				}
			}
		}
		private _recordColorsTriggerCounter:uint = 0;
		
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):string|number
		{
			if (this._recordColorsTriggerCounter != this.recordColors.triggerCounter)
			{
				this._recordColorsTriggerCounter = this.recordColors.triggerCounter;
				this.handleRecordColors();
			}
			
			var color:number;

			var recordColor:number = this.map_key_recordColor.get(key);
			if (recordColor !== undefined)
			{
				color = recordColor;
			}
			else
			{
				var value:number = this.internalDynamicColumn.getValueFromKey(key, Number);
				color = this.getColorFromDataValue(value);
			}
			
			if (dataType == Number)
				return color;
			
			// return a 6-digit hex value for a String version of the color
			if (isFinite(color))
				return '#' + StandardLib.numberToBase(color, 16, 6);
			
			return '';
		}

//		public function deriveStringFromNumber(value:Number):String
//		{
//			if (isNaN(value))
//				return "NaN";
//			return '#' + StringLib.toBase(value, 16, 6);
//		}
	}
}
