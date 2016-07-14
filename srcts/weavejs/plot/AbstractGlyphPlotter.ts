import AbstractPlotter from "./AbstractPlotter";
import Point = weavejs.geom.Point;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import Bounds2D = weavejs.geom.Bounds2D;
import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import ProxyColumn = weavejs.data.column.ProxyColumn;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import LinkableString = weavejs.core.LinkableString;
import IProjector = weavejs.api.data.IProjector;
import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
import DataType = weavejs.api.data.DataType;
import IKeySet = weavejs.api.data.IKeySet;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;

/**
 * A glyph represents a point of data at an X and Y coordinate.
 */
export default class AbstractGlyphPlotter extends AbstractPlotter implements IObjectWithDescription
{
	constructor()
	{
		super();

		this.setColumnKeySources([this.dataX, this.dataY]);
		this.addSpatialDependencies(this.dataX, this.dataY, this.zoomToSubset, this.statsX, this.statsY, this.sourceProjection, this.destinationProjection);
	}

	getDescription():string
	{
		var titleX:string = this.dataX.getMetadata(ColumnMetadata.TITLE);
		if (this.dataX.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.GEOMETRY)
		{
			if (this.destinationProjection.value && this.sourceProjection.value != this.destinationProjection.value)
				return Weave.lang('{0} ({1} -> {2})', titleX, this.sourceProjection.value || '?', this.destinationProjection.value);
			else if (this.sourceProjection.value)
				return Weave.lang('{0} ({1})', titleX, this.sourceProjection.value);
			return titleX;
		}
		var titleY:string = this.dataY.getMetadata(ColumnMetadata.TITLE);
		return Weave.lang('{0} vs. {1}', titleX, titleY);
	}

	public dataX:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	public dataY:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

	public zoomToSubset:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

	protected statsX:IColumnStatistics = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.dataX));
	protected statsY:IColumnStatistics = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.dataY));

	hack_setSingleKeySource(keySet:IKeySet):void
	{
		this.setSingleKeySource(keySet);
	}

	public sourceProjection:LinkableString = Weave.linkableChild(this, LinkableString);
	public destinationProjection:LinkableString = Weave.linkableChild(this, LinkableString);

	public tempPoint:Point = new Point();
	private _projector:IProjector;
	private _xCoordCache:WeakMap<IQualifiedKey, number>;
	private _yCoordCache:WeakMap<IQualifiedKey, number>;

	/**
	 * This gets called whenever any of the following change: dataX, dataY, sourceProjection, destinationProjection
	 */
	private updateProjector=():void=>
	{
		this._xCoordCache = new WeakMap();
		this._yCoordCache = new WeakMap();

		var sourceSRS:string = this.sourceProjection.value;
		var destinationSRS:string = this.destinationProjection.value;

		// if sourceSRS is missing and both X and Y projections are the same, use that.
		if (!sourceSRS)
		{
			var projX:string = this.dataX.getMetadata(ColumnMetadata.PROJECTION);
			var projY:string = this.dataY.getMetadata(ColumnMetadata.PROJECTION);
			if (projX == projY)
				sourceSRS = projX;
		}

		if (sourceSRS && destinationSRS)
		{
			console.log('TODO: this._projector = weavejs.WeaveAPI.ProjectionManager.getProjector(sourceSRS, destinationSRS);');
		}
		else
			this._projector = null;
	}

	getCoordsFromRecordKey(recordKey:IQualifiedKey, output:Point):void
	{
		if (Weave.detectChange(this.updateProjector, this.dataX, this.dataY, this.sourceProjection, this.destinationProjection))
			this.updateProjector();

		if (this._xCoordCache.has(recordKey))
		{
			output.x = this._xCoordCache.get(recordKey);
			output.y = this._yCoordCache.get(recordKey);
			return;
		}

		for (var i:number  = 0; i < 2; i++)
		{
			var result:number = NaN;
			var dataCol:IAttributeColumn = i == 0 ? this.dataX : this.dataY;
			if (dataCol.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.GEOMETRY)
			{
				var geoms:GeneralizedGeometry[] = dataCol.getValueFromKey(recordKey, Array);
				var geom:GeneralizedGeometry;
				if (geoms && geoms.length)
					geom = geoms[0] as GeneralizedGeometry;
				if (geom)
				{
					if (i == 0)
						result = geom.bounds.getXCenter();
					else
						result = geom.bounds.getYCenter();
				}
			}
			else
			{
				result = dataCol.getValueFromKey(recordKey, Number);
			}

			if (i == 0)
			{
				output.x = result;
				this._xCoordCache.set(recordKey, result);
			}
			else
			{
				output.y = result;
				this._yCoordCache.set(recordKey, result);
			}
		}
		if (this._projector)
		{
			this._projector.reproject(output);
			this._xCoordCache.set(recordKey, output.x);
			this._yCoordCache.set(recordKey, output.y);
		}
	}

	/**
	 * The data bounds for a glyph has width and height equal to zero.
	 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
	 * @param recordKey The key of a data record.
	 * @param output An Array of Bounds2D objects to store the result in.
	 */
	getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
	{
		this.getCoordsFromRecordKey(recordKey, this.tempPoint);

		var bounds:Bounds2D = this.initBoundsArray(output);
		bounds.includePoint(this.tempPoint);
		if (isNaN(this.tempPoint.x))
			bounds.setXRange(-Infinity, Infinity);
		if (isNaN(this.tempPoint.y))
			bounds.setYRange(-Infinity, Infinity);
	}

	/**
	 * This function returns a Bounds2D object set to the data bounds associated with the background.
	 * @param output A Bounds2D object to store the result in.
	 */
	getBackgroundDataBounds(output:Bounds2D):void
	{
		// use filtered data so data bounds will not include points that have been filtered out.
		if (this.zoomToSubset.value)
		{
			output.reset();
		}
		else
		{
			output.setBounds(
				this.statsX.getMin(),
				this.statsY.getMin(),
				this.statsX.getMax(),
				this.statsY.getMax()
			);
		}
	}
}
