namespace weavejs.plot
{
	import Bounds2D = weavejs.geom.Bounds2D;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotter = weavejs.api.ui.IPlotter;
	import Rectangle = weavejs.geom.Rectangle;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IKeySet = weavejs.api.data.IKeySet;
	import FilteredKeySet = weavejs.data.key.FilteredKeySet;
	import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
	import IPlotTask = weavejs.api.ui.IPlotTask;

	/**
	 * This is a base implementation for an IPlotter.
	 */
	export class AbstractPlotter implements IPlotter
	{
		constructor()
		{
			this.addSpatialDependencies(this.filteredKeySet);
		}

		/**
		 * Registers dependencies that affect data bounds and should trigger spatial callbacks.
		 */
		protected addSpatialDependencies(...dependencies:ILinkableObject[])
		{
			for (var child of dependencies)
			{
				var thisCC:ICallbackCollection = Weave.getCallbacks(this);
				var childCC:ICallbackCollection = Weave.getCallbacks(child);
				// instead of triggering parent callbacks, trigger spatialCallbacks which will in turn trigger parent callbacks.
				childCC.removeCallback(thisCC, thisCC.triggerCallbacks);
				Weave.linkableChild(this.spatialCallbacks, child);
			}
		}

		/**
		 * This variable should not be set manually.  It cannot be made constant because we cannot guarantee that it will be initialized
		 * before other properties are initialized, which means it may be null when someone wants to call registerSpatialProperty().
		 */
		private _spatialCallbacks:ICallbackCollection = null;

		/**
		 * This is an interface for adding callbacks that get called when any spatial properties of the plotter change.
		 * Spatial properties are those that affect the data bounds of visual elements.
		 */
		public get spatialCallbacks():ICallbackCollection
		{
			if (this._spatialCallbacks == null)
				this._spatialCallbacks = Weave.linkableChild(this, CallbackCollection);
			return this._spatialCallbacks;
		}

		/**
		 * This will set up the keySet so it provides keys in sorted order based on the values in a list of columns.
		 * @param columns An Array of IAttributeColumns to use for comparing IQualifiedKeys.
		 * @param sortDirections Array of sort directions corresponding to the columns and given as integers (1=ascending, -1=descending, 0=none).
		 * @see weave.data.KeySets.FilteredKeySet#setColumnKeySources()
		 */
		protected setColumnKeySources(columns:IAttributeColumn[], sortDirections:number[] = null):void
		{
			this._filteredKeySet.setColumnKeySources(columns, sortDirections);
		}
		
		/**
		 * This function sets the base IKeySet that is being filtered.
		 * @param keySet A new IKeySet to use as the base for this FilteredKeySet.
		 */
		protected setSingleKeySource(keySet:IKeySet):void
		{
			this._filteredKeySet.setSingleKeySource(keySet);
		}
		
		/** 
		 * This variable is returned by get keySet().
		 */
		protected _filteredKeySet:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);
		
		/**
		 * @return An IKeySet interface to the record keys that can be passed to the drawRecord() and getDataBoundsFromRecordKey() functions.
		 */
		public get filteredKeySet():IFilteredKeySet
		{
			return this._filteredKeySet;
		}
		
		/**
		 * This function must be implemented by classes that extend AbstractPlotter.
		 * When you implement this function, you may use initBoundsArray() for convenience.
		 * 
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param recordKey The key of a data record.
		 * @param output An Array of Bounds2D objects to store the result in.
		 * @return An Array of Bounds2D objects that make up the bounds for the record.
		 */
		public /* abstract */ getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output, 0);
		}
		
		/**
		 * variables for template code
		 */
		protected clipRectangle:Rectangle = new Rectangle();

		/**
		 * This function will perform one iteration of an asynchronous rendering task.
		 * This function will be called multiple times across several frames until its return value is 1.0.
		 * This function may be defined with override by classes that extend AbstractPlotter.
		 * @param task An object containing the rendering parameters.
		 * @return A number between 0 and 1 indicating the progress that has been made so far in the asynchronous rendering.
		 */
		public drawPlotAsyncIteration(task:IPlotTask):number
		{
			// this template will draw one record per iteration
			if (task.iteration < task.recordKeys.length)
			{
				//------------------------
				// draw one record
				var key:IQualifiedKey = task.recordKeys[task.iteration] as IQualifiedKey;
				this.addRecordGraphics(key, task.dataBounds, task.screenBounds, task.buffer);
				//------------------------
				
				// report progress
				return task.iteration / task.recordKeys.length;
			}
			
			// report progress
			return 1; // avoids division by zero in case task.recordKeys.length == 0
		}

		protected /* abstract */ addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:PIXI.Graphics):void
		{
		}
		
		/**
		 * This function draws the background graphics for this plotter, if applicable.
		 * An example background would be the origin lines of an axis.
		 * @param dataBounds The data coordinates that correspond to the given screenBounds.
		 * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
		 * @param destination The sprite to draw the graphics onto.
		 */
		public /* abstract */ drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
		}

		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @return A Bounds2D object specifying the background data bounds.
		 */
		public /* abstract */ getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
		}
		
		/**
		 * This is a convenience function for use inside getDataBoundsFromRecordKey().
		 * @param output An output Array, which may already contain any number of Bounds2D objects.
		 * @param desiredLength The desired number of output Bounds2D objects to appear in the output Array.
		 * @return The first Bounds2D item in the Array, or null if desiredLength is zero.
		 */
		public initBoundsArray(output:Bounds2D[], desiredLength:number = 1):Bounds2D
		{
			while (output.length < desiredLength)
				output.push(new Bounds2D());
			output.length = desiredLength;
			for (var bounds of output)
				bounds.reset();
			return output[0] as Bounds2D;
		}
	}
}


