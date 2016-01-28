///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import jquery from "jquery";

class Map2D<K1,K2,D> {
	private _map:Map<K1,Map<K2,D>>;
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
	private baseImageElements:Map<string,HTMLImageElement>;
	private canvasMap:Map2D<string,string,HTMLCanvasElement>;
	private imageMap:Map2D<string,string,HTMLImageElement>;
	private context: any /* ILinkableObject, context for URL request */

	constructor(context)
	{
		this.context = context;
		this.baseImageElements = new Map();
		this.canvasMap = new Map2D<string,string,HTMLCanvasElement>();
		this.imageMap = new Map2D<string,string,HTMLImageElement>();
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
			weavejs.WeaveAPI.URLRequestUtils.request(this.context, {url, responseType: "datauri", mimeType: ""}).then(
				(dataUri) =>
				{
					this.requestDataUrl(dataUri, color, function (dataUrl) {
						image.src = dataUrl;
					})
				}
			)
			this.imageMap.set(url, color, image);
		}

		return image;
	}
}

export default ImageGlyphCache;
