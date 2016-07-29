namespace weavejs.geom.net_ivank_voronoi
{
	import Point = weavejs.geom.Point;

	export class VParabola
	{		
		public site:Point;
		public cEvent:VEvent;
		
		public parent:VParabola;
		private _left:VParabola;
		private _right:VParabola;
		public isLeaf:boolean;

		public edge:VEdge;
		
		public constructor(s:Point = null)
		{
			this.site = s;
			this.isLeaf = (this.site!=null);
		}
		
		public set left(p:VParabola)
		{
			this._left = p;
			p.parent = this;
		}	
		public set right(p:VParabola)
		{
			this._right = p;
			p.parent = this;
		}
		public get left():VParabola{ return this._left; }
		public get right():VParabola{ return this._right; }
		
	}
}
