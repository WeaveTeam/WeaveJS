namespace weavejs.api.ui
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;

	export class IPlotter extends ILinkableObject
	{
		/**
		 * This is an interface for adding callbacks that get called when any spatial properties of the plotter change.
		 * Spatial properties are those that affect the data bounds of visual elements.  Whenever these callbacks get
		 * called, data bounds values previously returned from getDataBoundsFromRecordKey() become invalid.
		 */
		spatialCallbacks:ICallbackCollection;
		
		/**
		 * This is the set of record keys relevant to this IPlotter.
		 * An optional filter can be applied to filter the records before the plotter generates graphics for them.
		 * @return The set of record keys that can be passed to the drawPlot() and getDataBoundsFromRecordKey() functions.
		 */
		filteredKeySet:IFilteredKeySet;
		
		//TODO - remove filteredKeySet and add these:
		//function get keySet():IKeySet;
		//function get dynamicToolGroup():IDynamicToolGroup;
		
		/**
		 * This function provides a mapping from a record key to an Array of bounds objects, specified
		 * in data coordinates, that cover the bounds associated with that record key.
		 * The simplest geometric object supported is Bounds2D.  Other objects may be supported in future versions.
		 * @param key The key of a data record.
		 * @param output An Array which may or may not be already populated with Bounds2D objects.
		 *               If there are existing Bounds2D objects in this Array, they will be used as output buffers.
		 *               New Bounds2D objects will be added to the Array as needed.
		 * @return An Array of geometric objects, in data coordinates, that cover the bounds associated with the record key.
		 */
		getDataBoundsFromRecordKey(key:IQualifiedKey, output:Bounds2D[]):void { }

		/**
		 * This function will perform one iteration of an asynchronous rendering task.
		 * This function will be called multiple times across several frames until its return value is 1.0.
		 * This function may be defined with override by classes that extend AbstractPlotter.
		 * @param task An object containing the rendering parameters.
		 * @return A number between 0 and 1 indicating the progress that has been made so far in the asynchronous rendering.
		 */
		drawPlotAsyncIteration(task:IPlotTask):number { return undefined; }
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @return The data bounds associated with the background of the plotter.
		 */
		getBackgroundDataBounds(output:Bounds2D):void { }
		
		/**
		 * This function draws the background graphics for this plotter, if there are any.
		 * An example background would be the origin lines of an axis.
		 * @param dataBounds The data coordinates that correspond to the given screenBounds.
		 * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
		 * @param destination The sprite to draw the graphics onto.
		 */
		drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void { }
	}

	Weave.registerClass(IPlotter, 'weavejs.api.ui.IPlotter');
}
