namespace weavejs.app
{
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
	import KeySet = weavejs.data.key.KeySet;
	import KeyFilter = weavejs.data.key.KeyFilter;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;

	export class AccessibilityProperties
	{
		static WEAVE_INFO = Weave.classInfo(AccessibilityProperties, {
			id: "weavejs.app.AccessibilityProperties",
		});

		enableAccessibilityFeatures = Weave.linkableChild(this, LinkableBoolean);
		enableCaptioning = Weave.linkableChild(this, LinkableBoolean);
	}

	export class WeaveProperties implements ILinkableObject, ILinkableObjectWithNewProperties
	{
		static WEAVE_INFO = Weave.classInfo(WeaveProperties, {
			id: "weavejs.app.WeaveProperties",
			interfaces: [ILinkableObjectWithNewProperties],
			deprecatedIds: ["weave::WeaveProperties"]
		});

		static WEAVE_PROPERTIES = "WeaveProperties";

		static DEFAULT_COLOR_COLUMN = "defaultColorColumn";
		static DEFAULT_COLOR_BIN_COLUMN = "defaultColorBinColumn";
		static DEFAULT_COLOR_DATA_COLUMN = "defaultColorDataColumn";

		static DEFAULT_SUBSET_KEYFILTER = "defaultSubsetKeyFilter";
		static DEFAULT_SELECTION_KEYSET = "defaultSelectionKeySet";
		static DEFAULT_PROBE_KEYSET = "defaultProbeKeySet";

		static ALWAYS_HIGHLIGHT_KEYSET = "alwaysHighlightKeySet";
		static SAVED_SELECTION_KEYSETS = "savedSelections";
		static SAVED_SUBSETS_KEYFILTERS = "savedSubsets";

		static getProperties(context:Weave | ILinkableObject):WeaveProperties
		{
			if (!(context instanceof Weave))
				context = Weave.getWeave(context);
			var weave = context as Weave;

			var wp = Weave.AS(weave.root.getObject(WeaveProperties.WEAVE_PROPERTIES), WeaveProperties);
			if (!wp)
			{
				wp = weave.root.requestObject(WeaveProperties.WEAVE_PROPERTIES, WeaveProperties, true);
				wp.init();
			}
			return wp;
		}

		static notify(weave:Weave, level:"error"|"warning"|"info"|"success", message:string)
		{
			WeaveProperties.getProperties(weave).notificationSystem.addNotification({
				level,
				message,
				position: 'br'
			});
		}

		private _weave:Weave;
		notificationSystem:NotificationSystem.System;

		enableMenuBar = Weave.linkableChild(this, new LinkableBoolean(true));
		showSessionHistorySlider = Weave.linkableChild(this, new LinkableBoolean(false));
		enableSessionHistoryControls = Weave.linkableChild(this, new LinkableBoolean(true));
		toolInteractions = Weave.linkableChild(this, LinkableHashMap);
		accessibility = Weave.linkableChild(this, AccessibilityProperties);
		enableGeometryProbing = Weave.linkableChild(this, new LinkableBoolean(true));
		macros = Weave.linkableChild(this, LinkableHashMap);

		get weave():Weave { return this._weave || (this._weave = Weave.getWeave(this)); }

		get defaultProbeKeySet() { return this.weave.root.requestObject(WeaveProperties.DEFAULT_PROBE_KEYSET, KeySet, true); }
		get defaultSelectionKeySet() { return this.weave.root.requestObject(WeaveProperties.DEFAULT_SELECTION_KEYSET, KeySet, true); }
		get defaultSubsetKeyFilter() { return this.weave.root.requestObject(WeaveProperties.DEFAULT_SUBSET_KEYFILTER, KeyFilter, true); }

		get defaultColorColumn() { return this.weave.root.requestObject(WeaveProperties.DEFAULT_COLOR_COLUMN, ColorColumn, true); }
		get defaultColorBinColumn() { return this.defaultColorColumn.internalDynamicColumn.requestGlobalObject(WeaveProperties.DEFAULT_COLOR_BIN_COLUMN, BinnedColumn, true); }
		get defaultColorDataColumn() { return this.defaultColorBinColumn.internalDynamicColumn.requestGlobalObject(WeaveProperties.DEFAULT_COLOR_DATA_COLUMN, FilteredColumn, true); }

		private init()
		{
			this.defaultColorDataColumn.filter.target = this.defaultSubsetKeyFilter;
			this.defaultProbeKeySet;
			this.defaultSelectionKeySet;
		}

		public get deprecatedStateMapping():Object
		{
			return {};
		}
	}
}
