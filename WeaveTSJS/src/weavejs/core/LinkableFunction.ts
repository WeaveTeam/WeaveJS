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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * LinkableFunction allows a function to be defined by a String that can use macros defined in the static macros hash map.
	 * Libraries listed in macroLibraries variable will be included when compiling the function.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableFunction"})
	export class LinkableFunction extends LinkableString
	{
		/**
		 * Debug mode. 
		 */		
		public static debug:boolean = false;
		
		/**
		 * @param defaultValue The default function definition.
		 * @param ignoreRuntimeErrors If this is true, errors thrown during evaluation of the function will be caught and values of undefined will be returned.
		 * @param useThisScope When true, variable lookups will be evaluated as if the function were in the scope of the thisArg passed to the apply() function.
		 * @param paramNames An Array of parameter names that can be used in the function definition.
		 */
		constructor(defaultValue:string = null, ignoreRuntimeErrors:boolean = false, paramNames:string[] = null)
		{
			super(StandardLib.unIndent(defaultValue));
			this._ignoreRuntimeErrors = ignoreRuntimeErrors;
			this._paramNames = paramNames ? paramNames.concat() : [];
		}
		
		private _catchErrors:boolean = false;
		private _ignoreRuntimeErrors:boolean = false;
		private _compiledMethod:Function = null;
		private _paramNames:string[] = null;
		private _isFunctionDefinition:boolean = false;
		private _triggerCount:uint = 0;

		/**
		 * This is used as a placeholder to prevent re-compiling erroneous code.
		 */
		private static RETURN_UNDEFINED():any { return undefined; }
		
		/**
		 * This will attempt to compile the function.  An Error will be thrown if this fails.
		 */
		public validate():void
		{
			if (this._triggerCount != this.triggerCounter)
			{
				// in case compile fails, set variables now to prevent re-compiling erroneous code
				this._triggerCount = this.triggerCounter;
				this._compiledMethod = LinkableFunction.RETURN_UNDEFINED;
				this._isFunctionDefinition = false;
				this._compiledMethod = JS.compile(this.value, this._paramNames, this.errorHandler);
			}
		}
		
		private errorHandler=(e:Error):void=>
		{
			var root:ILinkableHashMap = Weave.getRoot(this);
			if (root)
				e.message = "In LinkableFunction " + JSON.stringify(Weave.findPath(root, this)) + ":\n" + e.message;
			
			if (LinkableFunction.debug)
				console.error(e);
			
			if (this._ignoreRuntimeErrors || LinkableFunction.debug)
				return;
			
			throw e;
		}
		
		/**
		 * This will evaluate the function with the specified parameters.
		 * @param thisArg The value of 'this' to be used when evaluating the function.
		 * @param argArray An Array of arguments to be passed to the compiled function.
		 * @return The result of evaluating the function.
		 */
		public apply(thisArg:any = null, argArray:any[] = null):any
		{
			if (this._triggerCount != this.triggerCounter)
				this.validate();
			return this._compiledMethod.apply(thisArg, argArray);
		}
		
		/**
		 * This will evaluate the function with the specified parameters.
		 * @param thisArg The value of 'this' to be used when evaluating the function.
		 * @param args Arguments to be passed to the compiled function.
		 * @return The result of evaluating the function.
		 */
		public call(thisArg:any = null, ...args:any[]):any
		{
			if (this._triggerCount != this.triggerCounter)
				this.validate();
			return this._compiledMethod.apply(thisArg, args);
		}
	}
}
