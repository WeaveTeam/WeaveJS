namespace weavejs.api.ui
{
	import Bounds2D = weavejs.geom.Bounds2D;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Graphics = PIXI.Graphics;

	/**
	 * An IPlotTask provides information for an IPlotter for rendering a plot asynchronously.
	 */
	export class IPlotTask
	{
		static WEAVE_INFO = Weave.classInfo(IPlotTask, {id: 'weavejs.api.ui.IPlotTask', linkable: false});

		/**
		 * This is the off-screen buffer, which may change
		 */
		buffer:Graphics;

		/**
		 * This specifies the range of data to be rendered
		 */
		dataBounds:Bounds2D;

		/**
		 * This specifies the pixel range where the graphics should be rendered
		 */
		screenBounds:Bounds2D;

		/**
		 * These are the IQualifiedKey objects identifying which records should be rendered
		 */
		recordKeys:IQualifiedKey[];

		/**
		 * This counter is incremented after each iteration.  When the task parameters change, this counter is reset to zero.
		 */
		iteration:number;

		/**
		 * This is the time at which the current iteration should be stopped, if possible.  This value can be compared to getTimer().
		 * Ignore this value if an iteration cannot be ended prematurely.
		 */
		iterationStopTime:number;

		/**
		 * This object can be used to optionally store additional state variables for resuming an asynchronous task where it previously left off.
		 * Setting this will not reset the iteration counter.
		 */
		asyncState:any;
	}
}
