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

namespace weavejs.data.key
{
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;

	export declare type QKeyLike = {keyType: string, localName: string};

	/**
	 * This class is internal to QKeyManager because instances
	 * of QKey should not be instantiated outside QKeyManager.
	 */
	@Weave.classInfo({id: "weavejs.data.key.QKey ", interfaces: [IQualifiedKey]})
	export class QKey implements IQualifiedKey
	{
		private static serial:uint = 0;
		
		constructor(keyType:string, localName:string, toString:string)
		{
			this.kt = keyType;
			this.ln = localName;
			this._toNumber = QKey.serial++;
			this._toString = toString;
		}
		
		private kt:string;
		private ln:string;
		private _toNumber:number;
		private _toString:string;
		
		/**
		 * This is the namespace of the QKey.
		 */
		public get keyType():string
		{
			return this.kt;
		}
		
		/**
		 * This is local record identifier in the namespace of the QKey.
		 */
		public get localName():string
		{
			return this.ln;
		}
		
		public toNumber():number
		{
			return this._toNumber;
		}
		
		public toString():string
		{
			return this._toString;
		}
	}
}
