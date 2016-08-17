namespace weavejs.geom.net_ivank_voronoi
{
	import Point = weavejs.geom.Point;

	export class VQueue
	{
		private q:Array<VEvent> = new Array();
		private i:int;
		
		public sortOnY(a:VEvent, b:VEvent):number
		{
			//var bigger:boolean = (a.y > b.y);
			return(a.y > b.y)?1:-1;
		}
		
		public enqueue(p:VEvent):void
		{
			this.q.push(p);
		}
		
		public dequeue():VEvent
		{
			this.q.sort(this.sortOnY);
			return this.q.pop();
		}
		public remove(e:VEvent):void
		{
			var index:int = -1;
			for(this.i=0; this.i<this.q.length; this.i++)
			{
				if(this.q[this.i]==e){ index = this.i; break; }
			}
			this.q.splice(index, 1);
		}
		
		public isEmpty():boolean
		{
			return (this.q.length==0);
		}
		public clear(b:boolean):void
		{
			this.q = [];
		}
	}
	
}
