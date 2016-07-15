namespace weavejs.plot
{
	import Bounds2D = weavejs.geom.Bounds2D;
	import Graphics = PIXI.Graphics;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import Bounds2D = weavejs.geom.Bounds2D;
	import AsyncSort = weavejs.util.AsyncSort;

	import ZoomBounds = weavejs.geom.ZoomBounds;
	import StandardLib = weavejs.util.StandardLib;
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import AsyncSort = weavejs.util.AsyncSort;
	import StreamedGeometryColumn = weavejs.data.column.StreamedGeometryColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import WeaveAPI = weavejs.WeaveAPI;
	import IDisposableObject = weavejs.api.core.IDisposableObject;

	/**
	 * Callbacks are triggered when the rendering task completes, or the plotter becomes busy during rendering.
	 * Busy status should be checked when callbacks trigger.
	 */
	export default  class PlotTask implements IPlotTask, ILinkableObject, IDisposableObject
	{
		public static debug:Boolean = false;
		// public static debugMouseDownPause:Boolean = false;
		public static debugIgnoreSpatialIndex:Boolean = false;

		public toString():string
		{
			var type:string = ['subset','selection','probe'][this._taskType];
			if (PlotTask.debug)
			{
				var str:string = [
					Weave.id(this._plotter),
					Weave.id(this),
					type
				].join('-');

				if (Weave.isBusy(this))
					str += '(busy)';
				return str;
			}
			return StandardLib.substitute('PlotTask({0}, {1})', type, Weave.className(this._plotter).split('.').pop());
		}

		public static TASK_TYPE_SUBSET:number = 0;
		public static TASK_TYPE_SELECTION:number = 1;
		public static TASK_TYPE_PROBE:number = 2;

		/**
		 * @param plotter
		 * @param taskType One of PlotTask.TASK_TYPE_SUBSET, PlotTask.TASK_TYPE_SELECTION, PlotTask.TASK_TYPE_PROBE
		 * @param spatialIndex
		 * @param zoomBounds
		 * @param layerSettings
		 */
		public PlotTask(taskType:number, plotter:IPlotter, spatialIndex:SpatialIndex, zoomBounds:ZoomBounds, layerSettings:LayerSettings)
		{
			this._taskType = taskType;
			this._plotter = plotter;
			this._spatialIndex = spatialIndex;
			this._zoomBounds = zoomBounds;
			this._layerSettings = layerSettings;

			// TEMPORARY SOLUTION until we start using VisToolGroup
			var subsetFilter:IDynamicKeyFilter = this._plotter.filteredKeySet.keyFilter;

			var keyFilters:IKeyFilter[] = [subsetFilter, this._layerSettings.selectionFilter, this._layerSettings.probeFilter];
			var keyFilter:ILinkableObject = keyFilters[this._taskType];

			// _dependencies is used as the parent so we can check its busy status with a single function call.
			var list = [this._plotter, this._spatialIndex, this._zoomBounds, this._layerSettings, keyFilter];
			for (var dependency of list)
				Weave.linkableChild(this._dependencies, dependency);

			this._dependencies.addImmediateCallback(this, this.asyncStart, true);
		}

		public dispose():void
		{
			this._plotter = null;
			this._spatialIndex = null;
			this._zoomBounds = null;
			this._layerSettings = null;
			WeaveAPI.SessionManager.disposeObject(this.completedGraphics);
			WeaveAPI.SessionManager.disposeObject(this.buffer);
		}

		public get taskType():number { return this._taskType; }

		public get progress():number { return this._progress; }

		/**
		 * This Bitmap contains the BitmapData that was last generated completely by the plotter.
		 */
		public completedGraphics:Graphics = new Graphics();
		/**
		 * This is the dataBounds that was used to generate the completedBitmap.
		 */
		public completedDataBounds:Bounds2D = new Bounds2D();

		/**
		 * This is the screenBounds corresponding to the dataBounds that was used to generate the completedBitmap.
		 */
		public completedScreenBounds:Bounds2D = new Bounds2D();

		/**
		 * When this is set to true, the async task will be paused.
		 */
		delayAsyncTask:Boolean = false;
		private _dependencies:CallbackCollection = Weave.disposableChild(this, CallbackCollection);

		private _prevBusyGroupTriggerCounter:number = 0;
		private _unscaledWidth:number = 0;

		private _unscaledHeight:number = 0;
		private _taskType:number = -1;
		private _plotter:IPlotter = null;
		private _spatialIndex:SpatialIndex;
		private _zoomBounds:ZoomBounds;

		private _layerSettings:LayerSettings;
		private _keyFilter:IKeyFilter;
		private _pendingKeys:IQualifiedKey[];
		private _iPendingKey:number;
		private _asyncSort:AsyncSort = Weave.disposableChild(this, AsyncSort);
		private _progress:number = 0;
		private _delayInit:Boolean = false;
		private _pendingInit:Boolean = false;

		/**
		 * This function must be called to set the size of the BitmapData buffer.
		 * @param width New width of the buffer, in pixels
		 * @param height New height of the buffer, in pixels
		 */
		public setBitmapDataSize(width:number, height:number):void
		{
			if (this._unscaledWidth != width || this._unscaledHeight != height)
			{
				this._unscaledWidth = width;
				this._unscaledHeight = height;
				this._dependencies.triggerCallbacks();
			}
		}

		/**
		 * This returns true if the layer should be rendered and selectable/probeable
		 * @return true if the layer should be rendered and selectable/probeable
		 */
		private shouldBeRendered():Boolean
		{
			var visible:Boolean = true;
			if (!this._layerSettings.visible.value)
			{
				if (PlotTask.debug)
					console.log(this, 'visible=false');
				visible = false;
			}
			else if (!this._layerSettings.selectable.value && this._taskType != PlotTask.TASK_TYPE_SUBSET && !this._layerSettings.alwaysRenderSelection.value)
			{
				if (PlotTask.debug)
					console.log(this, 'selection disabled');
				visible = false;
			}
			else
			{
				// HACK - begin validating spatial index if necessary, because this may affect zoomBounds
				if (Weave.detectChange(this._spatialIndex.createIndex, this._plotter.spatialCallbacks))
					this._spatialIndex.createIndex(this._plotter, this._layerSettings.hack_includeMissingRecordBounds);

				// if scale is undefined, request geometry detail because this may affect zoomBounds
				if (isNaN(this._zoomBounds.getXScale()))
					this.hack_requestGeometryDetail();

				visible = this._layerSettings.isZoomBoundsWithinVisibleScale(this._zoomBounds);
			}

			if (!visible && Weave.isBusy(this))
			{
				WeaveAPI.SessionManager.unassignBusyTask(this._dependencies);
				
				this.buffer.clear();
				this.completedGraphics.clear();
				this.completedDataBounds.reset();
				this.completedScreenBounds.reset();
			}
			return visible;
		}

		private asyncStart():void
		{
			if (this.asyncInit())
			{
				var plotterName = Weave.className(this._plotter).split('.').pop();
				if (PlotTask.debug)
				{
					console.log(this, 'begin async rendering');
					plotterName = Weave.id(this._plotter);
				}
				// normal priority because rendering is not often a prerequisite for other tasks
				WeaveAPI.Scheduler.startTask(
					this,
					this.asyncIterate,
					WeaveAPI.TASK_PRIORITY_NORMAL,
					this.asyncComplete,
					Weave.lang("Plotting {0} for {1}", ['subset', 'selection', 'mouseover'][this._taskType], plotterName)
				);

				// assign secondary busy task in case async task gets cancelled due to busy dependencies
				WeaveAPI.SessionManager.assignBusyTask(this._dependencies, this);
			}
			else
			{
				if (PlotTask.debug)
					console.log(this, 'should not be rendered');
			}
		}

		/**
		 * @return true if shouldBeRendered() returns true.
		 */
		private asyncInit():Boolean
		{
			var shouldRender:Boolean = this.shouldBeRendered();
			if (this._delayInit)
			{
				this._pendingInit = true;
				return shouldRender;
			}
			this._pendingInit = false;

			this._progress = 0;
			this.iteration = 0;
			this._iPendingKey = 0;
			if (shouldRender)
			{
				this._pendingKeys = this._plotter.filteredKeySet.keys;
				this.recordKeys = [];
				this._zoomBounds.getDataBounds(this.dataBounds);
				this._zoomBounds.getScreenBounds(this.screenBounds);
				if (this._taskType == PlotTask.TASK_TYPE_SUBSET)
				{
					// TEMPORARY SOLUTION until we start using VisToolGroup
					this._keyFilter = this._plotter.filteredKeySet.keyFilter.getInternalKeyFilter();
					//_keyFilter = _layerSettings.subsetFilter.getInternalKeyFilter();
				}
				else if (this._taskType == PlotTask.TASK_TYPE_SELECTION)
					this._keyFilter = this._layerSettings.selectionFilter.getInternalKeyFilter();
				else if (this._taskType == PlotTask.TASK_TYPE_PROBE)
					this._keyFilter = this._layerSettings.probeFilter.getInternalKeyFilter();

				if (PlotTask.debug)
					console.log(this, 'clear');
				// clear bitmap and resize if necessary
				PlotterUtils.setBitmapDataSize(this.buffer, this._unscaledWidth, this._unscaledHeight);
			}
			else
			{
				// clear graphics if not already cleared
				this.buffer.clear();
				this.completedGraphics.clear();
				this.completedDataBounds.reset();
				this.completedScreenBounds.reset();
				this._pendingKeys = null;
				this.recordKeys = null;
			}
			return shouldRender;
		}

		private asyncIterate(stopTime:number):number
		{
			// if (PlotTask.debugMouseDownPause && WeaveAPI.StageUtils.mouseButtonDown)
			// 	return 0;

			if (this.delayAsyncTask)
				return 0;

			// if plotter is busy, stop immediately
			if (WeaveAPI.SessionManager.linkableObjectIsBusy(this._dependencies))
			{
				if (PlotTask.debug)
					console.log(this, 'dependencies are busy');
				if (!PlotTask.debugIgnoreSpatialIndex)
					return 1;

				// only spend half the time rendering when dependencies are busy
				stopTime = (Date.now() + stopTime) / 2;
			}

			/***** initialize *****/

			// restart if necessary, initializing variables
			if (this._prevBusyGroupTriggerCounter != this._dependencies.triggerCounter)
			{
				this._prevBusyGroupTriggerCounter = this._dependencies.triggerCounter;

				// stop immediately if we shouldn't be rendering
				if (!this.asyncInit())
					return 1;

				// stop immediately if the bitmap is invalid
				if (PlotterUtils.bitmapDataIsEmpty(this.buffer))
				{
					if (PlotTask.debug)
						console.log(this, 'bitmap is empty');
					return 1;
				}

				// hacks
				this.hack_requestGeometryDetail();

				// hack - draw background on subset layer
				if (this._taskType == PlotTask.TASK_TYPE_SUBSET)
					this._plotter.drawBackground(this.dataBounds, this.screenBounds, this.buffer);
			}

			/***** prepare keys *****/

			// if keys aren't ready yet, prepare keys
			if (this._pendingKeys)
			{
				for (; this._iPendingKey < this._pendingKeys.length; this._iPendingKey++)
				{
					// avoid doing too little or too much work per iteration
					if (Date.now() > stopTime)
						return 0; // not done yet

					// next key iteration - add key if included in filter and on screen
					var key:IQualifiedKey = this._pendingKeys[this._iPendingKey] as IQualifiedKey;
					if (!this._keyFilter || this._keyFilter.containsKey(key)) // accept all keys if _keyFilter is null
					{
						for (var keyBounds of this._spatialIndex.getBoundsFromKey(key))
						{
							if (keyBounds.overlaps(this.dataBounds))
							{
								if (!keyBounds.isUndefined() || this._layerSettings.hack_includeMissingRecordBounds)
								{
									this.recordKeys.push(key);
									break;
								}
							}
						}
					}
				}
				if (PlotTask.debug)
					console.log(this, 'recordKeys', this.recordKeys.length);

				// done with keys
				this._pendingKeys = null;
			}

			/***** draw *****/

			// next draw iteration
			this.iterationStopTime = stopTime;

			while (this._progress < 1 && Date.now() < stopTime)
			{
				// delay asyncInit() while calling plotter function in case it triggers callbacks
				this._delayInit = true;

				if (PlotTask.debug)
					console.log(this, 'before iteration', this.iteration, 'recordKeys', this.recordKeys.length);
				this._progress = this._plotter.drawPlotAsyncIteration(this);
				if (PlotTask.debug)
					console.log(this, 'after iteration', this.iteration, 'progress', this._progress, 'recordKeys', this.recordKeys.length);

				this._delayInit = false;

				if (this._pendingInit)
				{
					// if we get here it means the plotter draw function triggered callbacks
					// and we need to restart the async task.
					if (this.asyncInit())
						return this.asyncIterate(stopTime);
					else
						return 1;
				}
				else
					this.iteration++; // prepare for next iteration
			}

			return this._progress;
		}

		private asyncComplete():void
		{
			if (PlotTask.debug)
				console.log(this, 'rendering completed');
			this._progress = 0;
			// don't do anything else if dependencies are busy
			if (WeaveAPI.SessionManager.linkableObjectIsBusy(this._dependencies))
				return;

			// busy task gets unassigned when the render completed successfully
			WeaveAPI.SessionManager.unassignBusyTask(this._dependencies);

			if (this.shouldBeRendered())
			{
				// BitmapData has been completely rendered, so update completedBitmap and completedDataBounds
				[this.completedGraphics, this.buffer] = [this.buffer, this.completedGraphics];
				this.buffer.clear();
				this.completedDataBounds.copyFrom(this.dataBounds);
				this.completedScreenBounds.copyFrom(this.screenBounds);

				Weave.getCallbacks(this).triggerCallbacks();
			}
		}


		/*************
		 **  hacks  **
		 *************/

		private hack_requestGeometryDetail():void
		{
			this._zoomBounds.getDataBounds(this.dataBounds);
			this._zoomBounds.getScreenBounds(this.screenBounds);
			var minImportance:number = this.dataBounds.getArea() / this.screenBounds.getArea();

			// find nested StreamedGeometryColumn objects
			var descendants = WeaveAPI.SessionManager.getLinkableDescendants(this._dependencies, StreamedGeometryColumn);
			// request the required detail
			for (var streamedColumn of descendants)
			{
				var requestedDataBounds:Bounds2D = this.dataBounds;
				var requestedMinImportance:number = minImportance;
				if (requestedDataBounds.isUndefined())// if data bounds is empty
				{
					// use the collective bounds from the geometry column and re-calculate the min importance
					requestedDataBounds = streamedColumn.collectiveBounds;
					requestedMinImportance = requestedDataBounds.getArea() / this.screenBounds.getArea();
				}
				// only request more detail if requestedDataBounds is defined
				if (!requestedDataBounds.isUndefined())
					streamedColumn.requestGeometryDetail(requestedDataBounds, requestedMinImportance);
			}
		}


		/***************************
		 **  IPlotTask interface  **
		 ***************************/

		public buffer:Graphics = new Graphics();
		public dataBounds:Bounds2D = new Bounds2D();
		public screenBounds:Bounds2D = new Bounds2D();
		public recordKeys:IQualifiedKey[];
		public iteration:number = 0;
		public iterationStopTime:number;
		public asyncState:any = {};
	}

	Weave.registerClass(PlotTask, "weavejs.plot.PlotTask");
}