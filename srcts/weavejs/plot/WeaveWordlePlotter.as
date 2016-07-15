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
	import BitmapData = flash.display.BitmapData;
	import Point = weavejs.geom.Point;
	import TextFormat = flash.text.TextFormat;
	
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import ObjectPool = weavejs.util.ObjectPool;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class WeaveWordlePlotter extends AbstractPlotter
	{
		
		public constructor()
		{
			
			// default fill color
			fillStyle.color.defaultValue.setSessionState(0x808080);
			
			// set up session state
			setColumnKeySources([wordColumn], [-1]);
			
			Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(wordColumn));
			this.addSpatialDependencies(this.wordColumn);
		}	
		
		public wordColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			var words:Array = wordColumn.keys;
			var i:int;
			var bounds:Bounds2D = output as Bounds2D;
			for( i = 0; i < words.length; i++ ){
				//This sets the intial points of every word.
				if( randPoints[words[i]] == undefined ){
					randPoints[words[i]] = [ Math.random(), Math.random() ];
				}
				else if( randPoints[words[i]] != undefined ) {
					if( i == 0 ){
						bounds.xMin = randPoints[words[i]][0];
						bounds.xMax = randPoints[words[i]][0];
						bounds.yMin = randPoints[words[i]][1];
						bounds.yMax = randPoints[words[i]][1];					
					}
					if( bounds.xMin > randPoints[words[i]][0] )
						bounds.xMin = randPoints[words[i]][0];
					if( bounds.xMax < randPoints[words[i]][0] )
						bounds.xMax = randPoints[words[i]][0];
					if( bounds.yMin > randPoints[words[i]][1] )
						bounds.yMin = randPoints[words[i]][1];
					if( bounds.yMax < randPoints[words[i]][1] )
						bounds.yMax = randPoints[words[i]][1];				
				}
			}
		}
		
		/**
		 * This gets the data bounds of the histogram bin that a record key falls into.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			if( randPoints[recordKey] != undefined )
				initBoundsArray(output).setBounds(0, 0, 1, 1);
			else
				initBoundsArray(output, 0);
		}
		/**
		 * This function retrieves a max and min value from the keys to later be used for sizing purposes.
		 */
		
		/**
		 * This draws the words to the screen and sized based on count.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			var normalized:number;
			var j:int;
			var maxDisplay:uint;
			screenBoundaries = screenBounds;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(wordColumn);
			var lowest:number = stats.getMin();
			var highest:number = stats.getMax();
			if( highest == lowest )
				highest = highest + 1;
			//maxDisplay is used for putting a word limit if necessary, 200 seems to fill the screen.
			maxDisplay = recordKeys.length;
			
			if( maxDisplay > 200 )
				maxDisplay = 200;
			
			for (var i:int = 0; i < maxDisplay; i++)
			{
				
				var recordKey:IQualifiedKey = recordKeys[i] as IQualifiedKey;
				
				normalized = wordColumn.getValueFromKey(recordKey, Number);
				
				tempPoint.x = randPoints[recordKey][0] * screenBounds.getWidth() + screenBounds.getXMin();
				tempPoint.y = randPoints[recordKey][1] * screenBounds.getHeight() + screenBounds.getYMin();
				
				var tf:TextFormat = new TextFormat("Arial", null ,Math.random() * uint.MAX_VALUE );
				tf.size = ( 50 * ( ( normalized - lowest ) / ( highest - lowest ) ) ) + 20;
				bitMapper.textFormat = tf;
				bitMapper.text = recordKey.localName;
				bitMapper.x = tempPoint.x;
				bitMapper.y = tempPoint.y;
				bitMapper.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
				bitMapper.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
				bitMapper.getUnrotatedBounds( tempBounds );
				//findOpeningLeft will check to make sure there is no overlapping, and adjust as necessary.
				findOpeningLeft();
				increment = 4;
				orientation = 0;
				count = 1;
				flag = false;
				if( tooLong == false ) {
					(boundaries[added++] = ObjectPool.borrowObject(Bounds2D) as Bounds2D).setBounds( tempBounds.xMin, tempBounds.yMin, tempBounds.xMax, tempBounds.yMax );
					//destination.fillRect( new Rectangle( tempBounds.xMin, tempBounds.yMin, tempBounds.width, tempBounds.height ), 0x80ff0000 );
					bitMapper.draw(destination);
				}
				else
					tooLong = false;
			}
			added = 0;
			boundaries.length = 0;
		}
		/**
		 * This function will look for an possible overlapping and adjust as necessary.
		 */
		
		private findOpeningLeft():void
		{
			var i:int;
			var j:int;
			
			for( i = 0; i < boundaries.length; i++ ){
				if( tempBounds.overlaps( boundaries[i] ) ){
					while( flag == false ) {
						for( j = 0; j < count; j++ ){
							if( orientation == 0 )
								bitMapper.x = bitMapper.x - increment;
							if( orientation == 1 )
								bitMapper.y = bitMapper.y - increment;
							if( orientation == 2 )
								bitMapper.x = bitMapper.x + increment;
							if( orientation == 3 )
								bitMapper.y = bitMapper.y + increment;
							bitMapper.getUnrotatedBounds( tempBounds );
							checkBounds();
							if( flag == true )
								return;
							if( tooLong == true )
								return;
						}
						orientation++;
						if( orientation > 3 )
							orientation = 0;
						count++;
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
			
			for( i = 0; i < boundaries.length; i++ ){
				if( tempBounds.overlaps( boundaries[i] ) ){
					for( j = 0; j < count; j++ ){
						bitMapper.y = bitMapper.y - 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if( flag == true )
							return;
					}
					if( flag == true )
						return;
					count++;
					findOpeningRight();
					if( flag == true )
						return;
				}
			}
			checkBounds();
			if( flag == false ){
				for( j = 0; j < count; j++ ){
					bitMapper.y = bitMapper.y - 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if( flag == true )
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
			
			for( i = 0; i < boundaries.length; i++ ){
				if( tempBounds.overlaps( boundaries[i] ) ){
					for( j = 0; j < count; j++ ){
						bitMapper.x = bitMapper.x + 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if( flag == true )
							return;
					}
					if( flag == true )
						return;
					count++;
					findOpeningUp();
					if( flag == true )
						return;
				}
			}
			checkBounds();
			if( flag == false ){
				for( j = 0; j < count; j++ ){
					bitMapper.x = bitMapper.x + 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if( flag == true )
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
			
			for( i = 0; i < boundaries.length; i++ ){
				if( tempBounds.overlaps( boundaries[i] ) ){
					for( j = 0; j < count; j++ ){
						bitMapper.y = bitMapper.y + 4;
						bitMapper.getBounds( tempBounds );
						checkBounds();
						if( flag == true )
							return;
					}
					if( flag == true )
						return;
					count++;
					findOpeningLeft();
					if( flag == true )
						return;
				}
			}
			checkBounds();
			if( flag == false ){
				for( j = 0; j < count; j++ ){
					bitMapper.y = bitMapper.y + 4;
					bitMapper.getBounds( tempBounds );
					checkBounds();
					if( flag == true )
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
			if( count > 150 )
				increment = 15;
			else if( count > 100 )
				increment = 12;
			else if( count > 50 )
				increment = 8;
			*/
			if( count > 150 ){
				tooLong = true;
				flag = true;
				return;
			}
			/*
			if( !( screenBoundaries.containsBounds( tempBounds ) ) ){
				flag = false;
				return;
			}
			
			if( screenBoundaries.equals( tempBounds ) ){
				flag = false;
				return;
			}
			*/
			for( i = 0; i < boundaries.length; i++ )
				if( tempBounds.overlaps( boundaries[i] ) ){
					flag = false;
					return;
				}
	
			flag = true;						
		}
		
		private count:number = 1;
		private flag:boolean = false;
		private bitMapper:BitmapText = new BitmapText();
		private tempPoint:Point = new Point();
		private tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object	
		private static randPoints:Object = new Object();
		private boundaries:Array = new Array();
		private screenBoundaries:Bounds2D = new Bounds2D();
		private tooLong:boolean = false;
		private added:int = 0;
		private orientation:int = 0;
		private increment:int = 4;
	}
}