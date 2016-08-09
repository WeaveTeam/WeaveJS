namespace weavejs.flux
{
	export class WeaveStore
	{
		public addChangeListener(callback:Function)
		{
			Weave.getCallbacks(this).addGroupedCallback(this, callback);
		}

		public removeChangeListener(callback:Function)
		{
			Weave.getCallbacks(this).removeCallback(this, callback);
		}
	}
}