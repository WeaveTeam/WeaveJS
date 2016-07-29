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
	import URLRequest = weavejs.net.URLRequest;
	
	import FaultEvent = mx.rpc.events.FaultEvent;
	import ResultEvent = mx.rpc.events.ResultEvent;
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	
	/**
	 * ImagePlotter
	 */
	export class ImageGlyphPlotter extends AbstractGlyphPlotter
	{
		public static debug:boolean = false;
		
		public constructor()
		{
			super();
			
			this.color.internalDynamicColumn.target = WeaveProperties.defaultColorColumn;
			this.alpha.defaultValue.value = 1;
			
			this.color.internalDynamicColumn.addImmediateCallback(this, this.handleColor, true);
			Weave.getCallbacks(this.colorDataWatcher).addImmediateCallback(this, this.updateKeySources, true);
		}
		
		public color:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		public alpha:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		
		public imageURL:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		public imageSize:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		
		public rotation:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public rotationOffset:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, isFinite));
		public dataInDegrees:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public reverseRotation:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		private _urlToImageMap:Object = new Object(); // maps a url to a BitmapData
		private tempMatrix:Matrix = new Matrix(); // reusable object

		[Embed(source="/weave/resources/images/missing.png")]
		private static _missingImageClass:Class;
		private static _missingImage:BitmapData = Bitmap(new ImageGlyphPlotter._missingImageClass()).bitmapData;

		private colorDataWatcher:LinkableWatcher = Weave.disposableChild(this, LinkableWatcher);
		
		private handleColor():void
		{
			var cc:ColorColumn = Weave.AS(this.color.getInternalColumn(), ColorColumn);
			var bc:BinnedColumn = cc ? Weave.AS(cc.getInternalColumn(), BinnedColumn) : null;
			var fc:FilteredColumn = bc ? Weave.AS(bc.getInternalColumn(), FilteredColumn) : null;
			var dc:DynamicColumn = fc ? fc.internalDynamicColumn : null;
			this.colorDataWatcher.target = dc || fc || bc || cc;
		}
		
		private updateKeySources():void
		{
			var columns:Array = [this.imageSize];
			var sortDirections:Array = [-1];
			
			if (this.colorDataWatcher.target)
			{
				columns.push(this.colorDataWatcher.target);
				sortDirections.push(1);
			}
			
			columns.push(this.dataX, this.dataY);
			sortDirections.push(1, 1);
			
			this.setColumnKeySources(columns, sortDirections);
		}
		
		/**
		 * Draws the graphics onto BitmapData.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (task.iteration < task.recordKeys.length)
			{
				var recordKey:IQualifiedKey = task.recordKeys[task.iteration];
				
				var _imageURL:string = this.imageURL.getValueFromKey(recordKey, String) as string;
				
				// stop if there is no url
				if  (!_imageURL)
					return task.iteration / task.recordKeys.length;
				
				var image:BitmapData = this._urlToImageMap[_imageURL] as BitmapData;
				if (!image) // if there is no image yet...
				{
					// set a placeholder so it doesn't get downloaded again
					this._urlToImageMap[_imageURL] = image = ImageGlyphPlotter._missingImage;
					
					// download the image - this triggers callbacks when download completes or fails
					WeaveAPI.URLRequestUtils.getContent(this, new URLRequest(_imageURL), this.handleImageDownload, this.handleImageFault, _imageURL);
				}
				
				// center the image at 0,0
				this.tempMatrix.identity();
				this.tempMatrix.translate(-image.width / 2, -image.height / 2);
				
				// scale the image
				var _imageSize:number = this.imageSize.getValueFromKey(recordKey, Number);
				if (isFinite(_imageSize))
				{
					var _scale:number = _imageSize / Math.max(image.width, image.height);
					if (isFinite(_scale))
						this.tempMatrix.scale(_scale, _scale);
					else
						_scale = 1;
				}
				
				// rotate the image around 0,0
				// undefined rotation = no rotation
				var _rotation:number = this.rotation.getValueFromKey(recordKey, Number);
				if (!isFinite(_rotation))
					_rotation = 0;
				_rotation += this.rotationOffset.value;
				if (this.dataInDegrees.value)
					_rotation = _rotation * Math.PI / 180;
				var direction:number = task.screenBounds.getYDirection() < 0 ? -1 : 1;
				if (this.reverseRotation.value)
					direction = -direction;
				if (_rotation != 0)
					this.tempMatrix.rotate(_rotation * direction);
				
				// translate the image
				// if there is no rotation, adjust to pixel coordinates to get a sharper image
				this.getCoordsFromRecordKey(recordKey, this.tempPoint);
				task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
				var dx:number = Math.round(this.tempPoint.x) + (_rotation == 0 && image.width % 2 ? 0.5 : 0);
				var dy:number = Math.round(this.tempPoint.y) + (_rotation == 0 && image.height % 2 ? 0.5 : 0);
				this.tempMatrix.translate(dx, dy);
				
				var ct:ColorTransform = this.tempColorTransform;
				var color:number = this.color.getValueFromKey(recordKey, Number);
				if (isFinite(color))
				{
					const R = 0xFF0000;
					const G = 0x00FF00;
					const B = 0x0000FF;

					ct.redMultiplier = ((color & R) >> 16) / 255;
					ct.greenMultiplier = ((color & G) >> 8) / 255;
					ct.blueMultiplier = (color & B) / 255;
				}
				else
				{
					ct.redMultiplier = 1;
					ct.greenMultiplier = 1;
					ct.blueMultiplier = 1;
				}
				ct.alphaMultiplier = this.alpha.getValueFromKey(recordKey, Number);
				if (isNaN(ct.alphaMultiplier))
					ct.alphaMultiplier = 1;
				
				// draw image
				task.buffer.draw(image, this.tempMatrix, ct, null, null, true);
				
				return task.iteration / task.recordKeys.length;
			}
			return 1;
		}
		
		private tempColorTransform:ColorTransform = new ColorTransform();
		
		/**
		 * This function will save a downloaded image into the image cache.
		 */
		private handleImageDownload(event:ResultEvent, url:string):void
		{
			var bitmap:Bitmap = event.result as Bitmap;
			this._urlToImageMap[url] = bitmap.bitmapData;
			if (ImageGlyphPlotter.debug)
				trace(debugId(this), 'received', url, debugId(bitmap.bitmapData));
		}
		private handleImageFault(event:FaultEvent, url:string):void
		{
			event.fault.content = url;
			console.error(event);
		}
		
		/*[Deprecated] public set xColumn(value:Object):void
		{
			Weave.setState(dataX, value);
		}
		[Deprecated] public set yColumn(value:Object):void
		{
			Weave.setState(dataY, value);
		}*/
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, ImageGlyphPlotter, "Image glyphs");
}

