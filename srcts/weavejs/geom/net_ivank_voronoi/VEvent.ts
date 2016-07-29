namespace weavejs.geom.net_ivank_voronoi
{
	import Point = weavejs.geom.Point;

	export class VEvent // implements Comparable
	{
		public point:Point;
		public pe:boolean;// place event or not
		
		public y:number;
		public key:int;
		
		public arch:VParabola;
		
		public value:int;
		
		public constructor(p:Point, pe:boolean)
		{
			this.point = p;
			this.pe = pe;
			this.y = p.y;
			this.key = Math.random()*100000000000;
		}
		
		public compare(other:VEvent):int
		{
			var b1:boolean = (this.y > other.y);
			return (b1?1:-1);
		}

	}
	
}
