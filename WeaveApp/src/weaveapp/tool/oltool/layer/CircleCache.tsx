import * as ol from "openlayers";

export default class CircleCache {
	static cache = new Map<string,ol.style.Circle>();

	static circleDefToString(fillStyle:ol.style.Fill, strokeStyle:ol.style.Stroke, radius:number)
	{
		let fillColor:number[] = fillStyle ? ol.color.asArray(fillStyle.getColor()) : null;

		let strokeColor:number[] = strokeStyle ? ol.color.asArray(strokeStyle.getColor()) : null;

		let strokeWidth:number = strokeStyle ? strokeStyle.getWidth() : null;
		return JSON.stringify([fillColor, strokeColor, strokeWidth, radius]);
	}

	static getCircle(options:{fill?:ol.style.Fill, stroke?:ol.style.Stroke, radius:number})
	{
		let circleString:string = CircleCache.circleDefToString(options.fill, options.stroke, options.radius);

		let circle:ol.style.Circle;

		if (!CircleCache.cache.has(circleString))
		{
			circle = new ol.style.Circle(options);
			CircleCache.cache.set(circleString, circle);
		}
		else
		{
			circle = CircleCache.cache.get(circleString);
		}

		return circle;
	}
}