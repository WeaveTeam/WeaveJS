	import * as PIXI from "pixi.js";
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;

	export default class GraphicsUtils
	{
		static beginLineStyle(graphics:PIXI.Graphics, lineStyle:SolidLineStyle, key:IQualifiedKey)
		{
			var style = lineStyle.getStyle(key);
			graphics.lineStyle(style.weight, style.color, style.alpha);
		}
		static beginFillStyle(graphics:PIXI.Graphics, fillStyle:SolidFillStyle, key:IQualifiedKey)
		{
			var style = fillStyle.getStyle(key);
			graphics.beginFill(style.color, style.alpha);
		}
	}
