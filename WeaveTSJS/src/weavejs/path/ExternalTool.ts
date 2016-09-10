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

namespace weavejs.path
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableString = weavejs.core.LinkableString;
	import StandardLib = weavejs.util.StandardLib;

	@Weave.classInfo({id: 'weavejs.path.ExternalTool', interfaces: [ILinkableHashMap]})
	export class ExternalTool extends LinkableHashMap //implements ISelectableAttributes
	{
		/**
		 * The name of the global JavaScript variable which is a mapping from a popup's
		 * window.name to an object containing "path" and "window" properties.
		 */
		public static /* readonly */ WEAVE_EXTERNAL_TOOLS:string = 'WeaveExternalTools';
		
		/**
		 * URL for external tool
		 */
		private toolUrl:LinkableString;
		
		/**
		 * The popup's window.name
		 */
		public /* readonly */ windowName:string = ExternalTool.generateWindowName();
		
		constructor()
		{
			super();
			
			this.toolUrl = this.requestObject("toolUrl", LinkableString, true);
			this.toolUrl.addGroupedCallback(this, this.toolPropertiesChanged);
		}
		
		private toolPropertiesChanged():void
		{
			if (this.toolUrl.value)
			{
				this.launch();
			}
		}
		
		public launch():boolean
		{
			return ExternalTool.launch(this, this.toolUrl.value, this.windowName, "menubar=no,status=no,toolbar=no");
		}
		
		public static generateWindowName():string
		{
			return StandardLib.replace(StandardLib.guid(), '-', '');
		}
		
		public static launch(owner:ILinkableObject, url:string, windowName:string = '', features:string = null):boolean
		{
			var path:any/*WeavePath*/ = Weave.getPath(owner); // TODO fix this
			if (!(window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS]) {
				(window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS] = {};
			    // when we close this window, close all popups
			    if (window.addEventListener)
			        window.addEventListener("unload", function():void {
			            for (var key in (window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS])
						{
			                try
							{
								(window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS][key].window.close();
							}
							catch (e)
							{
								// ignore error
							}
						}
			        });
			}
			var popup:Window = window.open(url, windowName, features);
			(window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS][windowName] = {"path": path, "window": popup};
				
			if (!popup)
				console.error("External tool popup was blocked by the web browser.");
			
			return !!popup;
		}
		
		/* override */ public dispose():void
		{
			super.dispose();
			try
			{
				(window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS][this.windowName].window.close();
				delete (window as any)[ExternalTool.WEAVE_EXTERNAL_TOOLS][this.windowName];
			}
			catch (e)
			{
				// ignore error
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public getSelectableAttributeNames():string[]
		{
			return this.getSelectableAttributes().map(this.getLabel);
		}
		
		private getLabel(obj:ILinkableObject):string
		{
			var label:string = WeaveAPI.EditorManager.getLabel(obj);
			if (!label)
			{
				var path:string[] = Weave.findPath(this, obj);
				if (path)
					label = path.join('/');
			}
			return label;
		}

		/**
		 * @inheritDoc
		 */
		public getSelectableAttributes():IAttributeColumn[]
		{
			var hashMaps:ILinkableHashMap[] = [this as ILinkableHashMap].concat(Weave.getDescendants(this, ILinkableHashMap));
			var flatList:IAttributeColumn[] = Array.prototype.concat.apply([], hashMaps.map(function(hm:ILinkableHashMap) { return hm.getObjects(IAttributeColumn); }));
			return flatList.filter((item:ILinkableObject):boolean => { return this.getLabel(item) && true; });
			//return getObjects(IAttributeColumn);
		}
	}
}
