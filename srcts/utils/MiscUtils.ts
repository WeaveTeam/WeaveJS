import * as _ from "lodash";

import Dictionary2D = weavejs.util.Dictionary2D;

export default class MiscUtils
{
	/**
	 * Generates an "rgba()" string for CSS.
	 *
	 * @param r A number between 0 and 255.
	 * @param g A number between 0 and 255.
	 * @param b A number between 0 and 255.
	 * @param a A number between 0 and 1.
	 * @return an "rgba()" string for CSS
	 */
	static rgba(r:number, g:number, b:number, a:number)
	{
		return `rgba(${r},${g},${b},${a})`;
	}
	
	/**
	 * Generates an "rgba()" string for CSS.
	 *
	 * @param rgb A number between 0x000000 and 0xFFFFFF.
	 * @param a A number between 0 and 1.
	 * @return an "rgba()" string for CSS
	 */
	static rgb_a(rgb:number, a:number)
	{
		return `rgba(${(rgb & 0xFF0000) >> 16},${(rgb & 0x00FF00) >> 8},${rgb & 0x0000FF},${a})`;
	}

	/**
	 * Generates an "rgba()" string for CSS.
	 *
	 * @param hex  A hexidecimal between 000000 and FFFFFF.
	 * @param a   A number between 0 and 1.
	 */
	static hex2rgba(hex:string, a:number)
	{
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

		return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${a})`;
	}

	/**
	 * Use this as a temporary solution before we use Weave.registerClass().
	 */
	static debounce(target:any, methodName:string, delay:number = 20):void
	{
		if (target[methodName] === Object.getPrototypeOf(target)[methodName])
			target[methodName] = _.debounce(target[methodName].bind(target), delay);
		target[methodName]();
	}

	/**
	 * Searches for the first nested object with matching properties
	 *
	 * @param roo The root Object.
	 * @param match Either an Object with properties to match, or a Function that checks for a match.
	 *
	 * @returns returns an object with the matching properties
	 */
	static findDeep(root:any, match:any):any
	{
		if (typeof match !== "function")
			match = _.matches(match);

		if (match(root))
			return root;

		if (typeof root == "object")
		{
			var key:string;
			for (key in root)
			{
				var found:any = this.findDeep(root[key], match);
				if (found)
					return found;
			}
		}
	}

	/**
	 * Temporary polyfill workaround for String.startsWith for projects that are
	 * targetting es5
	 *
	 * determines whether a string begins with the characters of another string,
	 * returning true or false as appropriate.
	 *
	 * @param str
	 *            {string} the str string in which to search for in
	 *            str.startsWith
	 * @param searchString
	 *            {string} The characters to be searched for at the start of
	 *            this string.
	 * @param position
	 *            {number?} Optional. The position in this string at which to
	 *            begin searching for searchString; defaults to 0.
	 *
	 * @returns true or false
	 *
	 */
	static startsWith(str:string, searchString:string, position?:number):boolean
	{
		position = position || 0;
		return str.indexOf(searchString, position) === position;
	}

	static resolveRelative(path:string, base:string):string
	{
		// Upper directory
		if (MiscUtils.startsWith(path, "../"))
			return MiscUtils.resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ""));
		// Relative to the root
		if (MiscUtils.startsWith(path, "/"))
		{
			var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
			return match[0] + path.slice(1);
		}
		// relative to the current directory
		return base.replace(/\/[^\/]*$/, "") + "/" + path;
	}

	/**
	 *
	 * This function return and object whose keys are url parameters and value
	 */
	static getUrlParams():any
	{
		var queryParams: any = {};
		var query:string = window.location.search.substring(1);
		if (!query)
			return {};
		var vars:string[] = query.split("&");
		for (var i:number = 0; i < vars.length; i++)
		{
			var pair:string[] = vars[i].split("=");
			if (typeof queryParams[pair[0]] === "undefined")
			{
				queryParams[pair[0]] = decodeURIComponent(pair[1]);
				// If second entry with this name
			}
			else if (typeof queryParams[pair[0]] === "string")
			{
				var arr:string[] = [queryParams[pair[0]], decodeURIComponent(pair[1])];
				queryParams[pair[0]] = arr;
				// If third or later entry with this name
			}
			else
			{
				queryParams[pair[0]].push(decodeURIComponent(pair[1]));
			}
		}
		return queryParams;
	}
}
