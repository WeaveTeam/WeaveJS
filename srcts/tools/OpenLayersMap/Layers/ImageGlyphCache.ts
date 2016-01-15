///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import * as jquery from "jquery";

class Map2D {
	constructor()
	{
		this._map = new Map();
	}

	get(firstKey, secondKey)
	{
		let secondMap = this._map.get(firstKey);
		return secondMap && secondMap.get(secondKey);
	}

	set(firstKey, secondKey, value)
	{
		let secondMap = this._map.get(firstKey);
		if (!secondMap)
		{
			secondMap = new Map();
			this._map.set(firstKey, secondMap);
		}

		secondMap.set(secondKey, value);
	}
}
class ImageGlyphCache {
	constructor()
	{
		this.baseImageElements = new Map();
		this.canvasMap = new Map2D();
		this.imageMap = new Map2D();
	}

	requestBaseImageElement(url, callback)
	{
		let imageElement = this.baseImageElements.get(url);

		if (!imageElement)
		{
			imageElement = new Image();
			imageElement.src = url;
			this.baseImageElements.set(url, imageElement);
		}

		if (imageElement.complete)
		{
			callback(imageElement);
		}
		else
		{
			jquery(imageElement).one("load", () => callback(imageElement));
		}
	}

	getCachedCanvas(url, color)
	{
		let canvas = this.canvasMap.get(url, color);
		let freshCanvas = false;

		if (!canvas)
		{
			freshCanvas = true;
			canvas = document.createElement("canvas");
			this.canvasMap.set(url, color, canvas);
		}

		return {canvas, freshCanvas};
	}

	requestDataUrl(url, color, callback)
	{
		let {canvas, freshCanvas} = this.getCachedCanvas(url, color);
		/* If freshCanvas is true, this means that we just created the canvas and haven't rendered to it. Time to do that. */
		if (freshCanvas)
		{
			this.requestBaseImageElement(url, function (imageElement) {
				[canvas.height, canvas.width] = [imageElement.naturalHeight, imageElement.naturalWidth];
				let ctx = canvas.getContext("2d");
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.globalCompositeOperation = "destination-atop";
				ctx.drawImage(imageElement, 0, 0);

				ctx.globalCompositeOperation = "multiply";
				ctx.drawImage(imageElement, 0, 0);

				callback(canvas.toDataURL());
			});
		}
		else
		{
			callback(canvas.toDataURL());
		}
	}

	getImage(url, color)
	{
		let image = this.imageMap.get(url, color);

		if (!image)
		{
			image = new Image();
			this.requestDataUrl(url, color, function (dataUrl) {
				image.src = dataUrl;
			});
		}

		return image;
	}
}

export default ImageGlyphCache;
