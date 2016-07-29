namespace weavejs.geom.net_ivank_voronoi
{
	import Point = weavejs.geom.Point;

	export class Voronoi
	{	
		private places:Array<Point>;
		private edges: Array<VEdge>;
		//private queue:PriorityQueue = new PriorityQueue(true);
		private queue:VQueue = new VQueue();
		//private queue:Heap = new Heap(true);
		private i:int;
		private width:number;
		private height:number;
		
		private root:VParabola;
		
		private ly:number;// line y
		private lasty:number;// last y
		
		private fp:Point; // first point
		
		public GetEdges(p:Array<Point>, width:int, height:int):Array<VEdge>
		{
			this.root = null;
			this.places = p;
			this.edges = new Array<VEdge>();
			this.width = width;
			this.height = height;
			
			this.queue.clear(true);
			for(this.i=0; this.i<this.places.length; this.i++)
			{
				var ev:VEvent = new VEvent(this.places[this.i], true);
				this.queue.enqueue(ev);
			}
			
			var lasty:number = Number.MAX_VALUE;
			var num:int = 0;
			while(!this.queue.isEmpty())
			{
				var e:VEvent = this.queue.dequeue();  
				this.ly = e.point.y;
				if(e.pe) this.InsertParabola(e.point);
				else this.RemoveParabola(e);
				
				if(e.y > lasty) 
				{
					//trace("!!!!! chyba řazení. "+e.y + " < " + lasty);
				} 
				
				lasty = e.y;
				//num++;
			}
			//trace(num);
			this.FinishEdge(this.root);
			
			for(this.i=0; this.i<this.edges.length; this.i++)
			{
				if(this.edges[this.i].neighbour) this.edges[this.i].start = this.edges[this.i].neighbour.end;
			}
			
			return this.edges;
		}
		
		
		// M E T H O D S   F O R   W O R K   W I T H   T R E E -------
		
		private InsertParabola(p:Point):void
		{
			if(!this.root){this.root = new VParabola(p); this.fp = p; return;}
			
			if(this.root.isLeaf && this.root.site.y - p.y <1)	// degenerovaný případ - první dvě místa ve stejné výšce
			{
				this.root.isLeaf = false;
				this.root.left = new VParabola(this.fp);
				this.root.right = new VParabola(p);
				var s:Point = new Point((p.x+this.fp.x)/2, this.height);
				if(p.x>this.fp.x) this.root.edge = new VEdge(s, this.fp, p);
				else this.root.edge = new VEdge(s, p, this.fp);
				this.edges.push(this.root.edge);
				return;
			}
			
			var par:VParabola = this.GetParabolaByX(p.x);
			
			if(par.cEvent)
			{
				this.queue.remove(par.cEvent);
				par.cEvent = null;
			}
			
			var start:Point = new Point(p.x, this.GetY(par.site, p.x));
			
			var el:VEdge = new VEdge(start, par.site, p);
			var er:VEdge = new VEdge(start, p, par.site);
			
			el.neighbour = er;
			this.edges.push(el);
			
			par.edge = er;
			par.isLeaf = false;
			
			var p0:VParabola = new VParabola(par.site);
			var p1:VParabola = new VParabola(p);
			var p2:VParabola = new VParabola(par.site);
			
			par.right = p2;
			par.left = new VParabola();
			par.left.edge = el;
			
			par.left.left = p0;
			par.left.right = p1;
			
			this.CheckCircle(p0);
			this.CheckCircle(p2);
		}
		
		private RemoveParabola(e:VEvent):void
		{						
			var p1:VParabola = e.arch;
			
			var xl:VParabola = this.GetLeftParent(p1);
			var xr:VParabola = this.GetRightParent(p1);
			
			var p0:VParabola = this.GetLeftChild(xl);
			var p2:VParabola = this.GetRightChild(xr);
			
			if(p0.cEvent){this.queue.remove(p0.cEvent); p0.cEvent = null;}
			if(p2.cEvent){this.queue.remove(p2.cEvent); p2.cEvent = null;}
						
			var p:Point = new Point(e.point.x, this.GetY(p1.site, e.point.x));
			
			this.lasty = e.point.y;
			
			xl.edge.end = p;
			xr.edge.end = p;
			
			var higher:VParabola;
			var par:VParabola = p1;
			while(par != this.root)
			{
				par = par.parent;
				if(par == xl) {higher = xl;}
				if(par == xr) {higher = xr;}
			}
			
			higher.edge = new VEdge(p, p0.site, p2.site);
			
			this.edges.push(higher.edge);
			
			var gparent:VParabola = p1.parent.parent;
			if(p1.parent.left == p1)
			{
				if(gparent.left  == p1.parent) gparent.left  = p1.parent.right;
				else p1.parent.parent.right = p1.parent.right;
			}
			else
			{
				if(gparent.left  == p1.parent) gparent.left  = p1.parent.left;
				else gparent.right = p1.parent.left;
			}
			
			this.CheckCircle(p0);
			this.CheckCircle(p2);
		}
		
		private FinishEdge(n:VParabola):void
		{
			var mx:number;
			if(n.edge.direction.x > 0.0)
			{
				mx = Math.max(this.width, n.edge.start.x + 10 );
			}
			else
			{
				mx = Math.min(0.0, n.edge.start.x - 10);
			}
			n.edge.end = new Point(mx, n.edge.f*mx + n.edge.g);
			
			if(!n.left.isLeaf)  this.FinishEdge(n.left);
			if(!n.right.isLeaf) this.FinishEdge(n.right);
		}
		
		private GetXOfEdge(par:VParabola, y:number):number // počítá průsečík parabol v daném uzlu
		{
			var left:VParabola = this.GetLeftChild(par);
			var right:VParabola = this.GetRightChild(par);
			
			var p:Point = left.site;
			var r:Point = right.site;
			
			var dp:number = 2*(p.y - y);
			var a1:number = 1/dp;
			var b1:number = -2*p.x/dp;
			var c1:number = y+dp/4 + p.x*p.x/dp;
			
			dp = 2*(r.y - y);
			var a2:number = 1/dp;
			var b2:number = -2*r.x/dp;
			var c2:number = y+dp/4 + r.x*r.x/dp;
			
			var a:number = a1 - a2;
			var b:number = b1 - b2;
			var c:number = c1 - c2;
			
			var disc:number = b*b - 4 * a * c;
			var x1:number = (-b + Math.sqrt(disc)) / (2*a);
			var x2:number = (-b - Math.sqrt(disc)) / (2*a);

			var ry:number;
			if(p.y < r.y ) ry =  Math.max(x1, x2);
			else ry = Math.min(x1, x2);

			return ry;
		}
		
		public GetParabolaByX(xx:number):VParabola
		{
			var par:VParabola = this.root;
			var x:number = 0;
			
			while(!par.isLeaf)
			{
				x = this.GetXOfEdge(par, this.ly);
				if(x>xx) par = par.left;
				else par = par.right;				
			}
			return par;
		}
		
		private GetY(p:Point, x:number):number // ohnisko, x-souřadnice, řídící přímka
		{
			var dp:number = 2*(p.y - this.ly);
			var b1:number = -2*p.x/dp;
			var c1:number = this.ly+dp/4 + p.x*p.x/dp;
			
			return(x*x/dp + b1*x + c1);
		}
		
		
		private CheckCircle(b:VParabola):void
		{
			var lp:VParabola = this.GetLeftParent(b);
			var rp:VParabola = this.GetRightParent(b);
			
			var a:VParabola = this.GetLeftChild(lp);
			var c:VParabola = this.GetRightChild(rp);
			
			if(!a || !c || a.site == c.site) return;
			
			var s:Point = this.GetEdgeIntersection(lp.edge, rp.edge);
			if(!s) return;
			
			var d:number = Point.distance(a.site, s);
			//if(d > 5000) return;
			if(s.y - d  >= this.ly) return;
			
			var e:VEvent = new VEvent(new Point(s.x, s.y - d), false);
			
			b.cEvent = e;
			e.arch = b;
			this.queue.enqueue(e);
		}
		
		private GetEdgeIntersection(a:VEdge, b:VEdge):Point
		{
			
			var x:number = (b.g-a.g) / (a.f - b.f);
			var y:number = a.f * x + a.g;
			
			// test rovnoběžnosti
			if(Math.abs(x) + Math.abs(y) > 20*this.width) { return null;} // parallel
			if(Math.abs(a.direction.x)<0.01 && Math.abs(b.direction.x) <0.01) { return null;} 
			
			if((x - a.start.x)/a.direction.x<0) {return null};
			if((y - a.start.y)/a.direction.y<0) {return null};
			
			if((x - b.start.x)/b.direction.x<0) {return null};
			if((y - b.start.y)/b.direction.y<0) {return null};			
						
			return new Point(x, y);
		}
		
		/*
		private GetCircumcenter(a:Point, b:Point, c:Point):Point
		{
			// line: y = f*x + g
			var f1 = (b.x - a.x) / (a.y - b.y);
			var m1 = new Point((a.x + b.x)/2, (a.y + b.y)/2);
			var g1 = m1.y - f1*m1.x;
			
			var f2 = (c.x - b.x) / (b.y - c.y);
			var m2 = new Point((b.x + c.x)/2, (b.y + c.y)/2);
			var g2 = m2.y - f2*m2.x;
			
			var x:number = (g2-g1) / (f1 - f2);
			return new Point(x, f1*x + g1);
		}
		*/
		
		private GetLeft(n:VParabola):VParabola
		{
			return this.GetLeftChild(this.GetLeftParent(n));
		}
		
		private GetRight(n:VParabola):VParabola
		{
			return this.GetRightChild(this.GetRightParent(n));
		}	
		
		private GetLeftParent(n:VParabola):VParabola
		{
			var par:VParabola = n.parent;
			var pLast:VParabola = n;
			while(par.left == pLast) 
			{ 
				if(!par.parent) return null;
				pLast = par; par = par.parent; 
			}
			return par;
		}
		private GetRightParent(n:VParabola):VParabola
		{
			var par:VParabola = n.parent;
			var pLast:VParabola = n;
			while(par.right == pLast) 
			{	
				if(!par.parent) return null;
				pLast = par; par = par.parent;	
			}
			return par;
		}
		private GetLeftChild(n:VParabola):VParabola
		{
			if(!n) return null;
			var par:VParabola = n.left;
			while(!par.isLeaf) par = par.right;
			return par;
		}
		private GetRightChild(n:VParabola):VParabola
		{
			if(!n) return null;
			var par:VParabola = n.right;
			while(!par.isLeaf) par = par.left;
			return par;
		}
		
		/*
		private drawParabola(p:Point, y:number):void
		{
			var dp = 2*(p.y - y);
			var a1 = 1/dp;
			var b1 = -2*p.x/dp;
			var c1 = y+dp/4 + p.x*p.x/dp;
			
			gr.lineStyle(2, 0x000000);
			for(var i:int = -500; i<1000; i+=5)
			{
				gr.moveTo(i, a1*i*i + b1*i + c1);
				gr.lineTo(i+5, a1*(i+5)*(i+5) + b1*(i+5) + c1);
			}
			
		}
		
		private drawGraph(p:VParabola, x:int, y:int, w:int):void
		{
			gr.lineStyle(3, p.color);
			gr.drawCircle(x, y, 5);
			gr.lineStyle(2, 0x000000);
			if(!p.isLeaf)
			{
				gr.moveTo(x, y);
				gr.lineTo(x-w/4, y+10);
				gr.moveTo(x, y);
				gr.lineTo(x+w/4, y+10);
				drawGraph(p.left, x-w/4, y+10, w/2);
				drawGraph(p.right, x+w/4, y+10, w/2);
			}
			else
			{
				//gr.lineStyle(3, p.color);
				//gr.moveTo(x, y);
				//gr.lineTo(p.site.x, p.site.y);
			}
			
		}
		
		private drawBeachLine(n:VParabola, y:number,from:number,to:number)
		{
			if(!n) return;
			if(n.isLeaf)
			{
				var dp = 2*(n.site.y - y);
				var a1 = 1/dp;
				var b1 = -2*n.site.x/dp;
				var c1 = y+dp/4 + n.site.x * n.site.x/dp;
				for(var i:int = from; i<to; i++)
				{
					gr.lineStyle(2, n.color);
					gr.moveTo(i, a1*i*i + b1*i + c1);
					gr.lineTo(i+1, a1*(i+1)*(i+1) + b1*(i+1) + c1);
					gr.moveTo(i, y);
					gr.lineTo(i+1, y);
				}
			}
			else
			{
				var m:number = GetXOfEdge(n, y);
				var ny:number = GetY(GetRightChild(n).site, m);
				
				gr.lineStyle(1, 0x000000);
				gr.moveTo(m, ny);
				gr.lineTo(m + n.edge.direction.x, ny + n.edge.direction.y);
				//trace(n.edge.direction.y);
				
				gr.moveTo(m, 0);
				gr.lineTo(m, 1000);
				drawBeachLine(n.left, y, from, m);
				drawBeachLine(n.right, y, m, to);
			}
			
			
		}
		*/
	}
}
