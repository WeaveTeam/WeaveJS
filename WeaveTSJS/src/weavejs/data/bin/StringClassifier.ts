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
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import StandardLib = weavejs.util.StandardLib;

	/**
	 * A classifier that accepts a list of String values.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.bin", interfaces: [IBinClassifier]})
	export class StringClassifier extends LinkableVariable implements IBinClassifier
	{
		constructor()
		{
			super(Array /*, this.isStringArray*/);
			// can't call super with 'this' in typescript 1.8.10
			this._verifier = this.isStringArray;
		}
		
		/* override */ public setSessionState(value:any):void
		{
			// backwards compatibility
			if (Weave.IS(value, String))
				value = WeaveAPI.CSVParser.parseCSVRow(value as string);
			super.setSessionState(value);
		}
		
		private isStringArray(array:any[]):boolean
		{
			return StandardLib.getArrayType(array) == String;
		}
		
		/**
		 * This object maps the discrete values contained in this classifier to values of true.
		 */
		private _valueMap:{[key:string]:boolean} = null;
		
		private _triggerCount:int = 0;

		/**
		 * @param value A value to test.
		 * @return true If this IBinClassifier contains the given value.
		 */
		public contains(value:any):boolean
		{
			if (this._triggerCount != this.triggerCounter)
			{
				this._triggerCount = this.triggerCounter;
				this._valueMap = {};
				for (var str of this._sessionStateInternal || [])
					this._valueMap[str] = true;
			}
			
			return this._valueMap[value] != undefined;
		}
	}
}
