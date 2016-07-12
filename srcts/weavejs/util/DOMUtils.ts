namespace weavejs.util
{
	import Dictionary2D = weavejs.util.Dictionary2D;

	export class DOMUtils
	{
		static getWindow(element:Element):Window
		{
			var node = element as any;
			return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
		}
		
		/**
		 * This function returns the width of a text string, in pixels, based on its font style
		 */
		static getTextWidth(text:string, font:string):number
		{
			// create a dummy canvas element to perform the calculation
			var canvas:HTMLCanvasElement = document.createElement("canvas");
			var context:CanvasRenderingContext2D = canvas.getContext("2d");
			context.font = font;
			var metrics:TextMetrics = context.measureText(text);
			return metrics.width;
		}

		static textHeightCache = new Dictionary2D<string,string,number>();

		static textHeightForClassCache = new Dictionary2D<string, string, number>();

		static getTextHeightForClasses(text:string, classNames:string)
		{
			var result = this.textHeightForClassCache.get(text, classNames);
			if (result !== undefined)
				return result;

			var body = document.getElementsByTagName("body")[0];
			var dummy = document.createElement("div");
			var dummyText = document.createTextNode("M");
			dummy.appendChild(dummyText);
			dummy.setAttribute("class", classNames);
			body.appendChild(dummy);
			result = dummy.offsetHeight;
			body.removeChild(dummy);

			this.textHeightForClassCache.set(text, classNames, result);

			return result;
		}

		static getTextHeight(text:string, font:string):number
		{
			var result = this.textHeightCache.get(text, font);
			if (result !== undefined)
				return result;

			var body = document.getElementsByTagName("body")[0];
			var dummy = document.createElement("div");
			var dummyText = document.createTextNode("M");
			dummy.appendChild(dummyText);
			dummy.setAttribute("style", font);
			body.appendChild(dummy);
			result = dummy.offsetHeight;
			body.removeChild(dummy);

			this.textHeightCache.set(text, font, result);

			return result;
		}
		
		static eventFire(el:HTMLElement|Document, etype:string):void {
			var elt:any = el as any;
			if (elt.fireEvent)
			{
				elt.fireEvent('on' + etype);
			}
			else
			{
				var evObj:Event = document.createEvent('Events');
				evObj.initEvent(etype, true, false);
				el.dispatchEvent(evObj);
			}
		}
		
		static getOffsetRect(ancestor:HTMLElement, descendant:HTMLElement):ClientRect
		{
			var rect:ClientRect = { left: 0, top: 0, width: descendant.offsetWidth, height: descendant.offsetHeight, bottom: NaN, right: NaN };
			while (descendant)
			{
				if (descendant == ancestor)
					return rect;
				
				rect.left += descendant.offsetLeft;
				rect.top += descendant.offsetTop;
				descendant = descendant.offsetParent as HTMLElement;
			}
			return null;
		}

		/**
		 * Detects if an element overflows with respect to its container.
		 * @param element the element to check.
		 * @param container an optional element container or the window by default.
		 * @returns {{left: boolean, top: boolean, bottom: boolean, right: boolean}}
		 */
		static detectOverflow(element:HTMLElement, container?:HTMLElement|Window)
		{
			var overflow = {
				left: false,
				right: false,
				top: false,
				bottom: false
			};
			if(!element)
				return overflow;

			if(!container)
				container = DOMUtils.getWindow(element);
			
			var elementRect = element.getBoundingClientRect();

			if(container instanceof Window)
			{
				overflow.left = elementRect.left < 0;
				overflow.right = elementRect.right > container.innerWidth;
				overflow.bottom = elementRect.bottom > container.innerHeight;
				overflow.top = elementRect.top < 0;
			}
			else
			{
				var containerRect = container.getBoundingClientRect();
				overflow.left = elementRect.left < containerRect.left;
				overflow.right = elementRect.right > containerRect.right;
				overflow.top = elementRect.top < containerRect.top;
				overflow.bottom = elementRect.bottom > containerRect.bottom;
			}
			return overflow;
		}
	}
}
