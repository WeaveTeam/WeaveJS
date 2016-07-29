namespace weavejs.geom.net_ivank_voronoi
{
	import Point = weavejs.geom.Point;

	export class VEdge
	{		
		public start:Point;
		public end:Point;
		
		public direction:Point;
		
		public left:Point;
		public right:Point;
		public f:number;
		public g:number;
		
		public neighbour:VEdge;
		
		public constructor(s:Point, a:Point, b:Point) // start, left, right
		{
			this.left = a;
			this.right = b;
			this.start = s;
			this.f = (b.x - a.x) / (a.y - b.y);
			this.g = s.y - this.f*s.x;
			this.direction = new Point(b.y-a.y, -(b.x - a.x));
		}
		
	}
}
