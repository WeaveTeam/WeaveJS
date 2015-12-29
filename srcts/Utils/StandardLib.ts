/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as _ from "lodash";

/**
 * This provides a set of useful static functions.
 * All the functions defined in this class are pure functions, meaning they always return the same result with the same arguments, and they have no side-effects.
 *
 * @author fkamayou
 */
export default class StandardLib {

  /**
	 * Searches for the first nested object with matching properties
	 * @param roo The root Object.
	 * @param match Either an Object with properties to match, or a Function that checks for a match.
   *
   * @returns returns an object with the matching properties
	 */
   static findDeep(root: any, match: any ):any {
     if(typeof match !== "function") {
        match = _.matches(match);
     }

     if(match(root)) {
      return root;
    }

    if(typeof root == "object") {
      var key: string;
      for (key in root) {
        var found:any = this.findDeep(root[key], match);
        if(found)
          return found;
      }
    }
   }

   /**
     * Adds undefined values to new state for properties in
     * current state not found in new state.
     */
   static includeMissingPropertyPlaceholders(currentState:any, newState:any) {
     var key: string;
     for (key in currentState) {
       if(!newState.hasOwnProperty(key)) {
         newState[key] = undefined;
       }
     }
     return newState;
   }

   /**
     * Calculates an interpolated color for a normalized value.
     * @param normValue A Number between 0 and 1.
     * @param colors An Array or list of colors to interpolate between.  Normalized values of 0 and 1 will be mapped to the first and last colors.
     * @return An interpolated color associated with the given normValue based on the list of color values.
     */
     static interpolateColor(normValue:number, ...colors:any[]): number {
        // handle an array of colors as the second parameter
        if (colors.length === 1 && Array.isArray(colors[0])) {
            colors = colors[0];
        }

        // handle invalid parameters
        if (normValue < 0 || normValue > 1 || colors.length === 0) {
            return NaN;
        }

        // find the min and max colors we want to interpolate between

        var maxIndex: number = Math.floor(colors.length - 1);
        var leftIndex: number = Math.floor(maxIndex * normValue);
        var rightIndex: number = Math.floor(leftIndex + 1);

        // handle boundary condition
        if (rightIndex === colors.length) {
            return parseInt(colors[leftIndex], 16);
        }

        var minColor: number = colors[leftIndex];
        var maxColor: number = colors[rightIndex];

        // normalize the norm value between the two norm values associated with the surrounding colors
        normValue = normValue * maxIndex - leftIndex;

        var percentLeft: number = 1 - normValue; // relevance of minColor
        var percentRight: number = normValue; // relevance of maxColor
        const R: number = 0xFF0000;
        const G: number = 0x00FF00;
        const B: number = 0x0000FF;
        return (
            ((percentLeft * (minColor & R) + percentRight * (maxColor & R)) & R) |
            ((percentLeft * (minColor & G) + percentRight * (maxColor & G)) & G) |
            ((percentLeft * (minColor & B) + percentRight * (maxColor & B)) & B)
        );
    }

    /**
    * This function converts a decimal number to a 6 digit hexadecimal string
    * @param dec A decimal number
    * @return the hexadecimal value of the decimal number
    */
   static decimalToHex(dec: number): string {
       return _.padLeft(dec.toString(16), 6, "0");
   }

   /**
    * This function return the normalized value between a range
    * if no range is provided, the default range will be 0 and 1
    *
    * @param value The value to be normalized
    * @param min the range min value
    * @param max the range max value
    */
   static normalize(value: number, min: number, max: number): number {

       if(!min) {
           min = 0;
       }
       if(!max) {
           max = 1;
       }
       return (value - min) / (max - min);
   }

   /**
    *  This function takes merges an object into another
    *
    * @param into {object} the object to merge into
    * @param obj {obj} the object to merge from
    */
   static merge(into:any, obj:any) {
     var attr:string;
     for(attr in obj) {
       into[attr] = obj[attr];
     }
   }

   /**
    * Temporary polyfill workaround for String.startsWith
    * for projects that are targetting es5
    *
    *  determines whether a string begins with the characters of another string, returning true or false as appropriate.
    *
    * @param str {string} the str string in which to search for in str.startsWith
    * @param searchString {string} The characters to be searched for at the start of this string.
    * @param position {number?} Optional. The position in this string at which to begin searching for searchString; defaults to 0.
    *
    * @returns true or false
    *
    */
   static startsWith(str:string, searchString:string, position?:number):boolean {
       position = position || 0;
       return str.indexOf(searchString, position) === position;
   }


   static resolveRelative(path:string, base:string):string {
    	// Upper directory
    	if (StandardLib.startsWith(path, "../")) {
    		return StandardLib.resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ""));
    	}
    	// Relative to the root
    	if (StandardLib.startsWith(path, "/")) {
    		var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
    		return match[0] + path.slice(1);
    	}
    	//relative to the current directory
	    return base.replace(/\/[^\/]*$/, "") + "/" + path;
    }

   static getDataBounds(column: number[]) {
       return {
           min: _.min(column),
           max: _.max(column)
       };
   }

   /**
    *
    *   This function return and object whose keys are url
    *   parameters and value
    */
   static getUrlParams():any {

       var queryParams:any = {};
       var query:string = window.location.search.substring(1);
       if(!query) {
           return {};
       }
       var vars:string[] = query.split("&");
       for (var i:number = 0; i < vars.length; i++) {
           var pair:string[] = vars[i].split("=");
           if (typeof queryParams[pair[0]] === "undefined") {
               queryParams[pair[0]] = decodeURIComponent(pair[1]);
               // If second entry with this name
           } else if (typeof queryParams[pair[0]] === "string") {
               var arr:string[] = [ queryParams[pair[0]], decodeURIComponent(pair[1]) ];
               queryParams[pair[0]] = arr;
               // If third or later entry with this name
           } else {
               queryParams[pair[0]].push(decodeURIComponent(pair[1]));
           }
       }
       return queryParams;
   }
}
