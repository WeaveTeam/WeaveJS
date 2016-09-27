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

namespace weavejs.core
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import JS = weavejs.util.JS;
	
	export class LinkableCallbackScript implements ILinkableObject
	{
		constructor()
		{
			var callbacks:ICallbackCollection = Weave.getCallbacks(this);
			callbacks.addImmediateCallback(null, this._immediateCallback);
			callbacks.addGroupedCallback(null, this._groupedCallback);
		}
		
		public /* readonly */ variables:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap());
		public /* readonly */ script:LinkableString = Weave.linkableChild(this, new LinkableString());
		public /* readonly */ delayWhileBusy:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public /* readonly */ delayWhilePlaceholders:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public /* readonly */ groupedCallback:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		
		private _compiledFunction:Function;
		
		public get(variableName:string):ILinkableObject
		{
			return this.variables.getObject(variableName);
		}
		
		private _immediateCallback():void
		{
			if (!this.groupedCallback.value)
				this._runScript();
		}
		
		private _groupedCallback():void
		{
			if (this.groupedCallback.value)
				this._runScript();
		}
		
		private _runScript():void
		{
			if (this.delayWhileBusy.value && Weave.isBusy(this))
				return;
			
			if (this.delayWhilePlaceholders.value)
			{
				var ldos = this.variables.getObjects(ILinkableDynamicObject);
				for (var ldo of ldos || [])
					if (ldo.foundPlaceholder)
						return;
			}
			
			if (!this.script.value)
				return;
			
			try
			{
				if (Weave.detectChange(this, this.script, this.variables.childListCallbacks))
					this._compiledFunction = JS.compile(this.script.value, this.variables.getNames(), this.errorHandler);
				this._compiledFunction.apply(this, this.variables.getObjects());
			}
			catch (e)
			{
				console.error(e);
			}
		}
		
		private errorHandler(e:Error):void
		{
			var root:ILinkableHashMap = Weave.getRoot(this);
			if (root)
				e.message = "In LinkableCallbackScript " + JSON.stringify(Weave.findPath(root, this)) + ":\n" + e.message;
			
			if (LinkableFunction.debug)
			{
				console.error(e);
				return;
			}
			
			throw e;
		}
	}
}
