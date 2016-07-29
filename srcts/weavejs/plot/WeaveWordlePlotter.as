/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.plot
{
	import Point = weavejs.geom.Point;

	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import Graphics = PIXI.Graphics;

	export class WeaveWordlePlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			// default fill color
			this.fillStyle.color.defaultValue.setSessionState(0x808080);
			
			// set up session state
			this.setColumnKeySources([this.wordColumn], [-1]);
			
			Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.wordColumn));
			this.addSpatialDependencies(this.wordColumn);
		}	
		
		public wordColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			var words = this.wordColumn.keys;
			var i:int;
			var bounds:Bounds2D = output as Bounds2D;
			for ( i = 0; i < words.length; i++ ){
				//This sets the intial points of every word.
				if ( this.randPoints.get(words[i]) == undefined ){
					this.randPoints.set(words[i], [ Math.random(), Math.random() ]);
				}
				else if ( this.randPoints.get(words[i]) != undefined ) {
					if ( i == 0 ){
						bounds.xMin = this.randPoints.get(words[i])[0];
						bounds.xMax = this.randPoints.get(words[i])[0];
						bounds.yMin = this.randPoints.get(words[i])[1];
						bounds.yMax = this.randPoints.get(words[i])[1];					
					}
					if ( bounds.xMin > this.randPoints.get(words[i])[0] )
						bounds.xMin = this.randPoints.get(words[i])[0];
					if ( bounds.xMax < this.randPoints.get(words[i])[0] )
						bounds.xMax = this.randPoints.get(words[i])[0];
					if ( bounds.yMin > this.randPoints.get(words[i])[1] )
						bounds.yMin = this.randPoints.get(words[i])[1];
					if ( bounds.yMax < this.randPoints.get(words[i])[1] )
						bounds.yMax = this.randPoints.get(words[i])[1];				
				}
			}
		}
		
		/**
		 * This gets the data bounds of the histogram bin that a record key falls into.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			if ( this.randPoints.get(recordKey) != undefined )
				this.initBoundsArray(output).setBounds(0, 0, 1, 1);
			else
				this.initBoundsArray(output, 0);
		}
		/**
		 * This function retrieves a max and min value from the keys to later be used for sizing purposes.
		 */
		
		/**
		 * This draws the words to the screen and sized based on count.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			this.drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var normalized:number;
			var j:int;
			var maxDisplay:uint;
			this.screenBoundaries = screenBounds;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(this.wordColumn);
			var lowest:number = stats.getMin();
			var highest:number = stats.getMax();
			if ( highest == lowest )
				highest = highest + 1;
			//maxDisplay is used for putting a word limit if necessary, 200 seems to fill the screen.
			maxDisplay = recordKeys.length;
			
			if ( maxDisplay > 200 )
				maxDisplay = 200;
			
			for (var i:int = 0; i < maxDisplay; i++)
			{
				var recordKey:IQualifiedKey = recordKeys[i] as IQualifiedKey;
				
				normalized = this.wordColumn.getValueFromKey(recordKey, Number);
				
				this.tempPoint.x = this.randPoints.get(recordKey)[0] * screenBounds.getWidth() + screenBounds.getXMin();
				this.tempPoint.y = this.randPoints.get(recordKey)[1] * screenBounds.getHeight() + screenBounds.getYMin();
				
				var tf:TextFormat = new TextFormat("Arial", null, Math.random() * 0xFFFFFF);
				tf.size = ( 50 * ( ( normalized - lowest ) / ( highest - lowest ) ) ) + 20;
				this.bitMapper.textFormat = tf;
				this.bitMapper.text = recordKey.localName;
				this.bitMapper.x = this.tempPoint.x;
				this.bitMapper.y = this.tempPoint.y;
				this.bitMapper.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
				this.bitMapper.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
				this.bitMapper.getUnrotatedBounds( this.tempBounds );
				//findOpeningLeft will check to make sure there is no overlapping, and adjust as necessary.
				this.findOpeningLeft();
				this.increment = 4;
				this.orientation = 0;
				this.count = 1;
				this.flag = false;
				if ( this.tooLong == false ) {
					this.boundaries[this.added++] = new Bounds2D(this.tempBounds.xMin, this.tempBounds.yMin, this.tempBounds.xMax, this.tempBounds.yMax);
					//destination.fillRect( new Rectangle( tempBounds.xMin, tempBounds.yMin, tempBounds.width, tempBounds.height ), 0x80ff0000 );
					this.bitMapper.draw(destination);
				}
				else
					this.tooLong = false;
			}
			this.added = 0;
			this.boundaries.length = 0;
		}

		/**
		 * This function will look for an possible overlapping and adjust as necessary.
		 */
		private findOpeningLeft():void
		{
			var i:int;
			var j:int;
			
			for ( i = 0; i < this.boundaries.length; i++ ){
				if ( this.tempBounds.overlaps( this.boundaries[i] ) ){
					while( this.flag == false ) {
						for ( j = 0; j < this.count; j++ ){
							if ( this.orientation == 0 )
								this.bitMapper.x = this.bitMapper.x - this.increment;
							if ( this.orientation == 1 )
								this.bitMapper.y = this.bitMapper.y - this.increment;
							if ( this.orientation == 2 )
								this.bitMapper.x = this.bitMapper.x + this.increment;
							if ( this.orientation == 3 )
								this.bitMapper.y = this.bitMapper.y + this.increment;
							this.bitMapper.getUnrotatedBounds( this.tempBounds );
							this.checkBounds();
							if ( this.flag == true )
								return;
							if ( this.tooLong == true )
								return;
						}
						this.orientation++;
						if ( this.orientation > 3 )
							this.orientation = 0;
						this.count++;
					}
				}
			}
		}
		/*
		These are all the functions from a previous recursive attempt at plotting.
		
		private findOpeningDown():void
		{
			var i:int;
			var j:int;
			
			for ( i = 0; i < boundaries.length; i++ ){
				if ( tempBounds.overlaps( boundaries[i] ) ){
					for ( j = 0; j < count; j++ ){
						bitMapper.y = bitMapper.y - 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if ( flag == true )
							return;
					}
					if ( flag == true )
						return;
					count++;
					findOpeningRight();
					if ( flag == true )
						return;
				}
			}
			checkBounds();
			if ( flag == false ){
				for ( j = 0; j < count; j++ ){
					bitMapper.y = bitMapper.y - 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if ( flag == true )
						return;
				}
				count++;
				findOpeningRight();
				return;
			}
			else
				return;
		}
		
		private findOpeningRight():void
		{
			var i:int;
			var j:int;
			
			for ( i = 0; i < boundaries.length; i++ ){
				if ( tempBounds.overlaps( boundaries[i] ) ){
					for ( j = 0; j < count; j++ ){
						bitMapper.x = bitMapper.x + 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if ( flag == true )
							return;
					}
					if ( flag == true )
						return;
					count++;
					findOpeningUp();
					if ( flag == true )
						return;
				}
			}
			checkBounds();
			if ( flag == false ){
				for ( j = 0; j < count; j++ ){
					bitMapper.x = bitMapper.x + 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if ( flag == true )
						return;
				}
				count++;
				findOpeningUp();
				return;
			}
			else
				return;
		}
		
		private findOpeningUp():void
		{
			var i:int;
			var j:int;
			
			for ( i = 0; i < boundaries.length; i++ ){
				if ( tempBounds.overlaps( boundaries[i] ) ){
					for ( j = 0; j < count; j++ ){
						bitMapper.y = bitMapper.y + 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if ( flag == true )
							return;
					}
					if ( flag == true )
						return;
					count++;
					findOpeningLeft();
					if ( flag == true )
						return;
				}
			}
			checkBounds();
			if ( flag == false ){
				for ( j = 0; j < count; j++ ){
					bitMapper.y = bitMapper.y + 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if ( flag == true )
						return;
				}
				count++;
				findOpeningLeft();
				return;
			}
			else
				return;
		}
		
		*/
		/**
		 * This function preforms a brute force approach to checking if the current bounds intersect any previously placed bounds. 
		 */
		private checkBounds():void
		{
			var i:int;
			
			/*
			if ( count > 150 )
				increment = 15;
			else if ( count > 100 )
				increment = 12;
			else if ( count > 50 )
				increment = 8;
			*/
			if ( this.count > 150 ){
				this.tooLong = true;
				this.flag = true;
				return;
			}
			/*
			if ( !( screenBoundaries.containsBounds( tempBounds ) ) ){
				flag = false;
				return;
			}
			
			if ( screenBoundaries.equals( tempBounds ) ){
				flag = false;
				return;
			}
			*/
			for ( i = 0; i < this.boundaries.length; i++ )
				if ( this.tempBounds.overlaps( this.boundaries[i] ) ){
					this.flag = false;
					return;
				}
	
			this.flag = true;						
		}
		
		private count:number = 1;
		private flag:boolean = false;
		private bitMapper:BitmapText = new BitmapText();
		private tempPoint:Point = new Point();
		private tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object	
		private randPoints:Map<any, [number, number]> = new Map();
		private boundaries:Bounds2D[] = [];
		private screenBoundaries:Bounds2D = new Bounds2D();
		private tooLong:boolean = false;
		private added:int = 0;
		private orientation:int = 0;
		private increment:int = 4;
	}
}

