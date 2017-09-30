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

namespace weavejs.util
{
	export class WeavePromiseHandler<T, U>
	{
		public onFulfilled:(value:T) => (U|Promise<U>|WeavePromise<U>);
		public onRejected:(error:any) => (U|Promise<U>|WeavePromise<U>);
		public next:WeavePromise<U>;
		
		/**
		 * Used as a flag to indicate that this handler has not been called yet
		 */
		public isNew:boolean = true;
		
		public constructor(onFulfilled:(value:T) => (U|Promise<U>|WeavePromise<U>), onRejected:(error:any) => (U|Promise<U>|WeavePromise<U>), next:WeavePromise<U>)
		{
			this.next = next;
			this.onFulfilled = onFulfilled;
			this.onRejected = onRejected;
		}
		
		public onResult(result:T):void
		{
			this.isNew = false;
			try
			{
				if (this.onFulfilled != null)
					this.next.setResult(this.onFulfilled(result) as any);
				else
					this.next.setResult(result as any);
			}
			catch (e)
			{
				this.next.setError(e);
			}
		}
		
		public onError(error:Error|string):void
		{
			this.isNew = false;
			try
			{
				if (this.onRejected != null)
					this.next.setResult(this.onRejected(error) as any);
				else
					this.next.setError(error);
			}
			catch (e)
			{
				this.next.setError(e);
			}
		}
	}
}
