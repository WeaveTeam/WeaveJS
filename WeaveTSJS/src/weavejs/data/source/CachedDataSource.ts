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

namespace weavejs.data.source
{
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IDataSource = weavejs.api.data.IDataSource;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;

	export class CachedDataSource extends AbstractDataSource
	{
		static WEAVE_INFO = Weave.setClassInfo(CachedDataSource, {
			id: "weavejs.data.source.CachedDataSource",
			label: "Cached Data Source",
			interfaces: [IDataSource]
		});

		/* override */ public get isLocal():boolean
		{
			return true;
		}

		public /* readonly */ type:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ state:LinkableVariable = Weave.linkableChild(this, LinkableVariable);

		/* override */ protected refreshHierarchy():void
		{
			var root = Weave.getRoot(this);
			var names = root.getNames();
			var name = root.getName(this);
			var classDef:Class<IDataSource> = Weave.getDefinition(this.type.value);
			var state:Object = this.state.state;
			var dataSource:IDataSource = root.requestObject(name, classDef, false);
			Weave.setState(dataSource, state);
			root.setNameOrder(names);
		}
	}
}
