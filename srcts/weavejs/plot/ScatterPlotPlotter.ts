namespace weavejs.plot
{
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import IKeySet = weavejs.api.data.IKeySet;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import StandardLib = weavejs.util.StandardLib;
	import IPlotter = weavejs.api.ui.IPlotter;
	import AbstractGlyphPlotter = weavejs.plot.AbstractGlyphPlotter;
	import GraphicsUtils = weavejs.util.GraphicsUtils;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;

	export class ScatterPlotPlotter extends AbstractGlyphPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			this.fill.color.internalDynamicColumn.globalName = 'defaultColorColumn';
			this.fill.color.internalDynamicColumn.addImmediateCallback(this, this.handleColor, true);
			Weave.getCallbacks(this.colorDataWatcher).addImmediateCallback(this, this.updateKeySources, true);
		}

		get selectableAttributes()
		{
			return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
				.set("X", this.dataX)
				.set("Y", this.dataY)
				.set("Color", this.fill.color)
				.set("Size", this.sizeBy);
		}

		public sizeBy:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public minScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(3, isFinite));
		public maxScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(25, isFinite));
		public defaultScreenRadius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5, isFinite));
		public showSquaresForMissingSize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		public colorBySize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public colorNegative:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x800000));
		public colorPositive:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x008000));
		
		// declare dependency on statistics (for norm values)
		private _sizeByStats:IColumnStatistics = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.sizeBy));
		
		private colorDataWatcher:LinkableWatcher = Weave.disposableChild(this, LinkableWatcher);
		
		private _extraKeyDependencies:IKeySet[];
		private _keyInclusionLogic:(key:IQualifiedKey) => boolean;
		
		public hack_setKeyInclusionLogic(keyInclusionLogic:(key:IQualifiedKey)=>boolean, extraColumnDependencies:IKeySet[]):void
		{
			this._extraKeyDependencies = extraColumnDependencies;
			this._keyInclusionLogic = keyInclusionLogic;
			this.updateKeySources();
		}
		
		private handleColor():void
		{
			var cc:ColorColumn = this.fill.color.getInternalColumn() as ColorColumn;
			var bc:BinnedColumn = cc ? cc.getInternalColumn() as BinnedColumn : null;
			var fc:FilteredColumn = bc ? bc.getInternalColumn() as FilteredColumn : null;
			var dc:DynamicColumn = fc ? fc.internalDynamicColumn : null;
			this.colorDataWatcher.target = dc || fc || bc || cc;
		}
		
		private updateKeySources():void
		{
			var columns:IKeySet[] = [this.sizeBy];
			if (this.colorDataWatcher.target)
				columns.push(Weave.AS(this.colorDataWatcher.target, IAttributeColumn));
			columns.push(this.dataX, this.dataY);
			if (this._extraKeyDependencies)
				columns = columns.concat(this._extraKeyDependencies);
			
			// sort size descending, all others ascending
			var sortDirections = columns.map((c, i) => (i == 0 ? -1 : 1));
			
			this._filteredKeySet.setColumnKeySources(columns, sortDirections, null, this._keyInclusionLogic);
		}
		
		public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
		}
		
		/**
		 * This may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:PIXI.Graphics):void
		{
			// project data coordinates to screen coordinates and draw graphics
			this.getCoordsFromRecordKey(recordKey, this.tempPoint);
			
			dataBounds.projectPointTo(this.tempPoint, screenBounds);

			GraphicsUtils.beginLineStyle(graphics, this.line, recordKey);
			GraphicsUtils.beginFillStyle(graphics, this.fill, recordKey);

			var radius:number;
			if (this.colorBySize.value)
			{
				var sizeData:number = this.sizeBy.getValueFromKey(recordKey, Number);
				var alpha:number = this.fill.alpha.getValueFromKey(recordKey, Number);
				if ( sizeData < 0 )
					graphics.beginFill(this.colorNegative.value, alpha);
				else if ( sizeData > 0 )
					graphics.beginFill(this.colorPositive.value, alpha);
				var min:number = this._sizeByStats.getMin();
				var max:number = this._sizeByStats.getMax();
				var absMax:number = Math.max(Math.abs(min), Math.abs(max));
				var normRadius:number = StandardLib.normalize(Math.abs(sizeData), 0, absMax);
				radius = normRadius * this.maxScreenRadius.value;
			}
			else if (this.sizeBy.internalObject)
			{
				radius = this.minScreenRadius.value + (this._sizeByStats.getNorm(recordKey) * (this.maxScreenRadius.value - this.minScreenRadius.value));
			}
			else
			{
				radius = this.defaultScreenRadius.value;
			}
			
			if (!isFinite(radius))
			{
				// handle undefined radius
				radius = this.defaultScreenRadius.value;
				if (this.colorBySize.value)
				{
					// draw nothing
				}
				else if (this.sizeBy.internalObject)
				{
					// draw square
					if (this.showSquaresForMissingSize.value)
						graphics.drawRect(this.tempPoint.x - radius, this.tempPoint.y - radius, radius * 2, radius * 2);
				}
				else
				{
					// draw default circle
					graphics.drawCircle(this.tempPoint.x, this.tempPoint.y, radius);
				}
			}
			else
			{
				if (this.colorBySize.value && radius == 0)
				{
					// draw nothing
				}
				else
				{
					//trace('circle',this.tempPoint);
					graphics.drawCircle(this.tempPoint.x, this.tempPoint.y, radius);
				}
			}
			graphics.endFill();
		}
		
		get deprecatedStateMapping()
		{
			return {
				absoluteValueColorEnabled: this.colorBySize,
				absoluteValueColorMin: this.colorNegative,
				absoluteValueColorMax: this.colorPositive,
				xColumn: this.dataX,
				yColumn: this.dataY,
				alphaColumn: this.fill.alpha,
				colorColumn: this.fill.color,
				radiusColumn: this.sizeBy
			};
		}
	}

	Weave.registerClass(ScatterPlotPlotter, 'weavejs.plot.ScatterPlotPlotter', [IPlotter, IObjectWithDescription, ISelectableAttributes]);

	weavejs.WeaveAPI.ClassRegistry.registerImplementation(IPlotter, ScatterPlotPlotter, "Scatterplot");
}
