namespace weavejs.mvc
{
	export class Model
	{
		public subscribe(context:Object, onChange:Function) {
			Weave.getCallbacks(this).addGroupedCallback(context, onChange);
		}

		public unsubscribe(context:Object, onChange:Function) {
			Weave.getCallbacks(this).removeCallback(context, onChange);
		}
	}
}