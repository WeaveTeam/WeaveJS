"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /// <reference path="../../typings/lodash/lodash.d.ts"/>

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StandardLib = function () {
    function StandardLib() {
        _classCallCheck(this, StandardLib);
    }

    _createClass(StandardLib, null, [{
        key: "rgba",

        /**
         * Generates an "rgba()" string for CSS.
         *
         * @param r   A number between 0 and 255.
         * @param g   A number between 0 and 255.
         * @param b   A number between 0 and 255.
         * @param a   A number between 0 and 1.
         */
        value: function rgba(r, g, b, a) {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
        /**
         * Generates an "rgba()" string for CSS.
         *
         * @param hex  A hexidecimal between 000000 and FFFFFF.
         * @param a   A number between 0 and 1.
         */

    }, {
        key: "hex2rgba",
        value: function hex2rgba(hex, a) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + a + ")";
        }
        /**
         * Use this as a temporary solution before we use Weave.registerClass().
         */

    }, {
        key: "debounce",
        value: function debounce(target, methodName) {
            var delay = arguments.length <= 2 || arguments[2] === undefined ? 20 : arguments[2];

            if (target[methodName] === Object.getPrototypeOf(target)[methodName]) target[methodName] = _.debounce(target[methodName].bind(target), delay);
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

    }, {
        key: "findDeep",
        value: function findDeep(root, match) {
            if (typeof match !== "function") match = _.matches(match);
            if (match(root)) return root;
            if ((typeof root === "undefined" ? "undefined" : _typeof(root)) == "object") {
                var key;
                for (key in root) {
                    var found = this.findDeep(root[key], match);
                    if (found) return found;
                }
            }
        }
        /**
         * Adds undefined values to new state for properties in current state not
         * found in new state.
         */

    }, {
        key: "includeMissingPropertyPlaceholders",
        value: function includeMissingPropertyPlaceholders(currentState, newState) {
            var key;
            for (key in currentState) {
                if (!newState.hasOwnProperty(key)) newState[key] = undefined;
            }return newState;
        }
        /**
         * Calculates an interpolated color for a normalized value.
         *
         * @param normValue A Number between 0 and 1.
         * @param colors An Array or list of colors to interpolate between. Normalized
         *               values of 0 and 1 will be mapped to the first and last colors.
         * @return An interpolated color associated with the given normValue based
         *         on the list of color values.
         */

    }, {
        key: "interpolateColor",
        value: function interpolateColor(normValue) {
            for (var _len = arguments.length, colors = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                colors[_key - 1] = arguments[_key];
            }

            // handle an array of colors as the second parameter
            if (colors.length === 1 && Array.isArray(colors[0])) colors = colors[0];
            // handle invalid parameters
            if (normValue < 0 || normValue > 1 || colors.length === 0) return NaN;
            // find the min and max colors we want to interpolate between
            var maxIndex = Math.floor(colors.length - 1);
            var leftIndex = Math.floor(maxIndex * normValue);
            var rightIndex = Math.floor(leftIndex + 1);
            // handle boundary condition
            if (rightIndex === colors.length) return parseInt(colors[leftIndex], 16);
            var minColor = colors[leftIndex];
            var maxColor = colors[rightIndex];
            // normalize the norm value between the two norm values associated with
            // the surrounding colors
            normValue = normValue * maxIndex - leftIndex;
            var percentLeft = 1 - normValue; // relevance of minColor
            var percentRight = normValue; // relevance of maxColor
            var R = 0xFF0000;
            var G = 0x00FF00;
            var B = 0x0000FF;
            return percentLeft * (minColor & R) + percentRight * (maxColor & R) & R | percentLeft * (minColor & G) + percentRight * (maxColor & G) & G | percentLeft * (minColor & B) + percentRight * (maxColor & B) & B;
        }
        /**
         * This function converts a decimal number to a 6 digit hexadecimal string
         *
         * @param dec
         *            A decimal number
         * @return the hexadecimal value of the decimal number
         */

    }, {
        key: "decimalToHex",
        value: function decimalToHex(dec) {
            return _.padLeft(dec.toString(16), 6, "0");
        }
        /**
         * This function return the normalized value between a range if no range is
         * provided, the default range will be 0 and 1
         *
         * @param value The value to be normalized
         * @param min the range min value
         * @param max the range max value
         */

    }, {
        key: "normalize",
        value: function normalize(value, min, max) {
            if (!min) min = 0;
            if (!max) max = 1;
            return (value - min) / (max - min);
        }
        /**
         * This function takes merges an object into another
         *
         * @param into the object to merge into
         * @param obj the object to merge from
         */

    }, {
        key: "merge",
        value: function merge(into, obj) {
            var attr;
            for (attr in obj) {
                into[attr] = obj[attr];
            }return into;
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

    }, {
        key: "startsWith",
        value: function startsWith(str, searchString, position) {
            position = position || 0;
            return str.indexOf(searchString, position) === position;
        }
    }, {
        key: "resolveRelative",
        value: function resolveRelative(path, base) {
            // Upper directory
            if (StandardLib.startsWith(path, "../")) return StandardLib.resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ""));
            // Relative to the root
            if (StandardLib.startsWith(path, "/")) {
                var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
                return match[0] + path.slice(1);
            }
            // relative to the current directory
            return base.replace(/\/[^\/]*$/, "") + "/" + path;
        }
    }, {
        key: "getDataBounds",
        value: function getDataBounds(column) {
            return {
                min: _.min(column),
                max: _.max(column)
            };
        }
        /**
         *
         * This function return and object whose keys are url parameters and value
         */

    }, {
        key: "getUrlParams",
        value: function getUrlParams() {
            var queryParams = {};
            var query = window.location.search.substring(1);
            if (!query) return {};
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (typeof queryParams[pair[0]] === "undefined") {
                    queryParams[pair[0]] = decodeURIComponent(pair[1]);
                } else if (typeof queryParams[pair[0]] === "string") {
                    var arr = [queryParams[pair[0]], decodeURIComponent(pair[1])];
                    queryParams[pair[0]] = arr;
                } else {
                    queryParams[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return queryParams;
        }
        /**
         * This function returns the width of a text string, in pixels, based on its font style
         */

    }, {
        key: "getTextWidth",
        value: function getTextWidth(text, font) {
            // create a dummy canvas element to perform the calculation
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }
    }, {
        key: "getTextHeight",
        value: function getTextHeight(text, font) {
            var body = document.getElementsByTagName("body")[0];
            var dummy = document.createElement("div");
            var dummyText = document.createTextNode("M");
            dummy.appendChild(dummyText);
            dummy.setAttribute("style", font);
            body.appendChild(dummy);
            var result = dummy.offsetHeight;
            body.removeChild(dummy);
            return result;
        }
    }, {
        key: "addPointClickListener",
        value: function addPointClickListener(target, listener) {
            listener['onMouseDown'] = function (event) {
                listener['mouseDownEvent'] = event;
            };
            listener['onClick'] = function (event) {
                var mde = listener['mouseDownEvent'];
                if (mde.clientX === event.clientX && mde.clientY === event.clientY) listener(event);
            };
            target.addEventListener('mousedown', listener['onMouseDown']);
            target.addEventListener('click', listener['onClick']);
        }
    }, {
        key: "removePointClickListener",
        value: function removePointClickListener(target, listener) {
            target.removeEventListener('mousedown', listener['onMouseDown']);
            target.removeEventListener('click', listener['onClick']);
        }
    }]);

    return StandardLib;
}();

exports.default = StandardLib;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhbmRhcmRMaWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy91dGlscy9TdGFuZGFyZExpYi50cyJdLCJuYW1lcyI6WyJTdGFuZGFyZExpYiIsIlN0YW5kYXJkTGliLnJnYmEiLCJTdGFuZGFyZExpYi5oZXgycmdiYSIsIlN0YW5kYXJkTGliLmRlYm91bmNlIiwiU3RhbmRhcmRMaWIuZmluZERlZXAiLCJTdGFuZGFyZExpYi5pbmNsdWRlTWlzc2luZ1Byb3BlcnR5UGxhY2Vob2xkZXJzIiwiU3RhbmRhcmRMaWIuaW50ZXJwb2xhdGVDb2xvciIsIlN0YW5kYXJkTGliLmRlY2ltYWxUb0hleCIsIlN0YW5kYXJkTGliLm5vcm1hbGl6ZSIsIlN0YW5kYXJkTGliLm1lcmdlIiwiU3RhbmRhcmRMaWIuc3RhcnRzV2l0aCIsIlN0YW5kYXJkTGliLnJlc29sdmVSZWxhdGl2ZSIsIlN0YW5kYXJkTGliLmdldERhdGFCb3VuZHMiLCJTdGFuZGFyZExpYi5nZXRVcmxQYXJhbXMiLCJTdGFuZGFyZExpYi5nZXRUZXh0V2lkdGgiLCJTdGFuZGFyZExpYi5nZXRUZXh0SGVpZ2h0IiwiU3RhbmRhcmRMaWIuYWRkUG9pbnRDbGlja0xpc3RlbmVyIiwiU3RhbmRhcmRMaWIucmVtb3ZlUG9pbnRDbGlja0xpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFFWSxBQUFDLEFBQU0sQUFBUSxBQUUzQjs7Ozs7O0lBRUMsQUFPRyxBQUNILEFBQU8sQUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFBQyxBQUFRLEdBQUUsQUFBUSxHQUFFLEFBQVEsR0FBRSxBQUFRO0FBRWpELEFBQU0sQUFBQyw2QkFBUSxBQUFDLFVBQUksQUFBQyxVQUFJLEFBQUMsVUFBSSxBQUFDLEFBQUcsQUFBQyxBQUNwQyxBQUFDLEFBRUQsQUFLRyxBQUNILEFBQU8sQUFBUTs7Ozs7Ozs7Ozs7aUNBQUMsQUFBVSxLQUFFLEFBQVE7QUFFbkMsZ0JBQUksQUFBYyxpQkFBRyxBQUFr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QUFtQixvQkFBQyxBQUFPLFNBQUUsQUFBUSxTQUFDLEFBQVMsQUFBQyxBQUFDLEFBQUMsQUFDMUQsQUFBQyxBQUNGLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFuZGFyZExpYlxue1xuXHQvKipcblx0ICogR2VuZXJhdGVzIGFuIFwicmdiYSgpXCIgc3RyaW5nIGZvciBDU1MuXG5cdCAqIFxuXHQgKiBAcGFyYW0gciAgIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuXHQgKiBAcGFyYW0gZyAgIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuXHQgKiBAcGFyYW0gYiAgIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxuXHQgKiBAcGFyYW0gYSAgIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cblx0ICovXG5cdHN0YXRpYyByZ2JhKHI6bnVtYmVyLCBnOm51bWJlciwgYjpudW1iZXIsIGE6bnVtYmVyKVxuXHR7XG5cdFx0cmV0dXJuIGByZ2JhKCR7cn0sJHtnfSwke2J9LCR7YX0pYDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgYW4gXCJyZ2JhKClcIiBzdHJpbmcgZm9yIENTUy5cblx0ICpcblx0ICogQHBhcmFtIGhleCAgQSBoZXhpZGVjaW1hbCBiZXR3ZWVuIDAwMDAwMCBhbmQgRkZGRkZGLlxuXHQgKiBAcGFyYW0gYSAgIEEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMS5cblx0ICovXG5cdHN0YXRpYyBoZXgycmdiYShoZXg6c3RyaW5nLCBhOm51bWJlcilcblx0e1xuXHRcdHZhciBzaG9ydGhhbmRSZWdleCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG5cdFx0aGV4ID0gaGV4LnJlcGxhY2Uoc2hvcnRoYW5kUmVnZXgsIGZ1bmN0aW9uKG0sIHIsIGcsIGIpIHtcblx0XHRcdHJldHVybiByICsgciArIGcgKyBnICsgYiArIGI7XG5cdFx0fSk7XG5cblx0XHR2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG5cblx0XHRyZXR1cm4gYHJnYmEoJHtwYXJzZUludChyZXN1bHRbMV0sIDE2KX0sJHtwYXJzZUludChyZXN1bHRbMl0sIDE2KX0sJHtwYXJzZUludChyZXN1bHRbM10sIDE2KX0sJHthfSlgO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVzZSB0aGlzIGFzIGEgdGVtcG9yYXJ5IHNvbHV0aW9uIGJlZm9yZSB3ZSB1c2UgV2VhdmUucmVnaXN0ZXJDbGFzcygpLlxuXHQgKi9cblx0c3RhdGljIGRlYm91bmNlKHRhcmdldDphbnksIG1ldGhvZE5hbWU6c3RyaW5nLCBkZWxheTpudW1iZXIgPSAyMCk6dm9pZFxuXHR7XG5cdFx0aWYgKHRhcmdldFttZXRob2ROYW1lXSA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldClbbWV0aG9kTmFtZV0pXG5cdFx0XHR0YXJnZXRbbWV0aG9kTmFtZV0gPSBfLmRlYm91bmNlKHRhcmdldFttZXRob2ROYW1lXS5iaW5kKHRhcmdldCksIGRlbGF5KTtcblx0XHR0YXJnZXRbbWV0aG9kTmFtZV0oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZWFyY2hlcyBmb3IgdGhlIGZpcnN0IG5lc3RlZCBvYmplY3Qgd2l0aCBtYXRjaGluZyBwcm9wZXJ0aWVzXG5cdCAqIFxuXHQgKiBAcGFyYW0gcm9vIFRoZSByb290IE9iamVjdC5cblx0ICogQHBhcmFtIG1hdGNoIEVpdGhlciBhbiBPYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHRvIG1hdGNoLCBvciBhIEZ1bmN0aW9uIHRoYXQgY2hlY2tzIGZvciBhIG1hdGNoLlxuXHQgKiBcblx0ICogQHJldHVybnMgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgbWF0Y2hpbmcgcHJvcGVydGllc1xuXHQgKi9cblx0c3RhdGljIGZpbmREZWVwKHJvb3Q6YW55LCBtYXRjaDphbnkpOmFueVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKVxuXHRcdFx0bWF0Y2ggPSBfLm1hdGNoZXMobWF0Y2gpO1xuXG5cdFx0aWYgKG1hdGNoKHJvb3QpKVxuXHRcdFx0cmV0dXJuIHJvb3Q7XG5cblx0XHRpZiAodHlwZW9mIHJvb3QgPT0gXCJvYmplY3RcIilcblx0XHR7XG5cdFx0XHR2YXIga2V5OnN0cmluZztcblx0XHRcdGZvciAoa2V5IGluIHJvb3QpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBmb3VuZDphbnkgPSB0aGlzLmZpbmREZWVwKHJvb3Rba2V5XSwgbWF0Y2gpO1xuXHRcdFx0XHRpZiAoZm91bmQpXG5cdFx0XHRcdFx0cmV0dXJuIGZvdW5kO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIHVuZGVmaW5lZCB2YWx1ZXMgdG8gbmV3IHN0YXRlIGZvciBwcm9wZXJ0aWVzIGluIGN1cnJlbnQgc3RhdGUgbm90XG5cdCAqIGZvdW5kIGluIG5ldyBzdGF0ZS5cblx0ICovXG5cdHN0YXRpYyBpbmNsdWRlTWlzc2luZ1Byb3BlcnR5UGxhY2Vob2xkZXJzKGN1cnJlbnRTdGF0ZTphbnksIG5ld1N0YXRlOmFueSlcblx0e1xuXHRcdHZhciBrZXk6c3RyaW5nO1xuXHRcdGZvciAoa2V5IGluIGN1cnJlbnRTdGF0ZSlcblx0XHRcdGlmICghbmV3U3RhdGUuaGFzT3duUHJvcGVydHkoa2V5KSlcblx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gbmV3U3RhdGU7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyBhbiBpbnRlcnBvbGF0ZWQgY29sb3IgZm9yIGEgbm9ybWFsaXplZCB2YWx1ZS5cblx0ICogXG5cdCAqIEBwYXJhbSBub3JtVmFsdWUgQSBOdW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxuXHQgKiBAcGFyYW0gY29sb3JzIEFuIEFycmF5IG9yIGxpc3Qgb2YgY29sb3JzIHRvIGludGVycG9sYXRlIGJldHdlZW4uIE5vcm1hbGl6ZWRcblx0ICogICAgICAgICAgICAgICB2YWx1ZXMgb2YgMCBhbmQgMSB3aWxsIGJlIG1hcHBlZCB0byB0aGUgZmlyc3QgYW5kIGxhc3QgY29sb3JzLlxuXHQgKiBAcmV0dXJuIEFuIGludGVycG9sYXRlZCBjb2xvciBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIG5vcm1WYWx1ZSBiYXNlZFxuXHQgKiAgICAgICAgIG9uIHRoZSBsaXN0IG9mIGNvbG9yIHZhbHVlcy5cblx0ICovXG5cdHN0YXRpYyBpbnRlcnBvbGF0ZUNvbG9yKG5vcm1WYWx1ZTpudW1iZXIsIC4uLmNvbG9yczphbnlbXSk6bnVtYmVyXG5cdHtcblx0XHQvLyBoYW5kbGUgYW4gYXJyYXkgb2YgY29sb3JzIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyXG5cdFx0aWYgKGNvbG9ycy5sZW5ndGggPT09IDEgJiYgQXJyYXkuaXNBcnJheShjb2xvcnNbMF0pKVxuXHRcdFx0Y29sb3JzID0gY29sb3JzWzBdO1xuXG5cdFx0Ly8gaGFuZGxlIGludmFsaWQgcGFyYW1ldGVyc1xuXHRcdGlmIChub3JtVmFsdWUgPCAwIHx8IG5vcm1WYWx1ZSA+IDEgfHwgY29sb3JzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBOYU47XG5cblx0XHQvLyBmaW5kIHRoZSBtaW4gYW5kIG1heCBjb2xvcnMgd2Ugd2FudCB0byBpbnRlcnBvbGF0ZSBiZXR3ZWVuXG5cblx0XHR2YXIgbWF4SW5kZXg6bnVtYmVyID0gTWF0aC5mbG9vcihjb2xvcnMubGVuZ3RoIC0gMSk7XG5cdFx0dmFyIGxlZnRJbmRleDpudW1iZXIgPSBNYXRoLmZsb29yKG1heEluZGV4ICogbm9ybVZhbHVlKTtcblx0XHR2YXIgcmlnaHRJbmRleDpudW1iZXIgPSBNYXRoLmZsb29yKGxlZnRJbmRleCArIDEpO1xuXG5cdFx0Ly8gaGFuZGxlIGJvdW5kYXJ5IGNvbmRpdGlvblxuXHRcdGlmIChyaWdodEluZGV4ID09PSBjb2xvcnMubGVuZ3RoKVxuXHRcdFx0cmV0dXJuIHBhcnNlSW50KGNvbG9yc1tsZWZ0SW5kZXhdLCAxNik7XG5cblx0XHR2YXIgbWluQ29sb3I6bnVtYmVyID0gY29sb3JzW2xlZnRJbmRleF07XG5cdFx0dmFyIG1heENvbG9yOm51bWJlciA9IGNvbG9yc1tyaWdodEluZGV4XTtcblxuXHRcdC8vIG5vcm1hbGl6ZSB0aGUgbm9ybSB2YWx1ZSBiZXR3ZWVuIHRoZSB0d28gbm9ybSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoXG5cdFx0Ly8gdGhlIHN1cnJvdW5kaW5nIGNvbG9yc1xuXHRcdG5vcm1WYWx1ZSA9IG5vcm1WYWx1ZSAqIG1heEluZGV4IC0gbGVmdEluZGV4O1xuXG5cdFx0dmFyIHBlcmNlbnRMZWZ0Om51bWJlciA9IDEgLSBub3JtVmFsdWU7IC8vIHJlbGV2YW5jZSBvZiBtaW5Db2xvclxuXHRcdHZhciBwZXJjZW50UmlnaHQ6bnVtYmVyID0gbm9ybVZhbHVlOyAvLyByZWxldmFuY2Ugb2YgbWF4Q29sb3Jcblx0XHRjb25zdCBSOm51bWJlciA9IDB4RkYwMDAwO1xuXHRcdGNvbnN0IEc6bnVtYmVyID0gMHgwMEZGMDA7XG5cdFx0Y29uc3QgQjpudW1iZXIgPSAweDAwMDBGRjtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KChwZXJjZW50TGVmdCAqIChtaW5Db2xvciAmIFIpICsgcGVyY2VudFJpZ2h0ICogKG1heENvbG9yICYgUikpICYgUikgfFxuXHRcdFx0KChwZXJjZW50TGVmdCAqIChtaW5Db2xvciAmIEcpICsgcGVyY2VudFJpZ2h0ICogKG1heENvbG9yICYgRykpICYgRykgfFxuXHRcdFx0KChwZXJjZW50TGVmdCAqIChtaW5Db2xvciAmIEIpICsgcGVyY2VudFJpZ2h0ICogKG1heENvbG9yICYgQikpICYgQilcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY29udmVydHMgYSBkZWNpbWFsIG51bWJlciB0byBhIDYgZGlnaXQgaGV4YWRlY2ltYWwgc3RyaW5nXG5cdCAqIFxuXHQgKiBAcGFyYW0gZGVjXG5cdCAqICAgICAgICAgICAgQSBkZWNpbWFsIG51bWJlclxuXHQgKiBAcmV0dXJuIHRoZSBoZXhhZGVjaW1hbCB2YWx1ZSBvZiB0aGUgZGVjaW1hbCBudW1iZXJcblx0ICovXG5cdHN0YXRpYyBkZWNpbWFsVG9IZXgoZGVjOm51bWJlcik6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gXy5wYWRMZWZ0KGRlYy50b1N0cmluZygxNiksIDYsIFwiMFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybiB0aGUgbm9ybWFsaXplZCB2YWx1ZSBiZXR3ZWVuIGEgcmFuZ2UgaWYgbm8gcmFuZ2UgaXNcblx0ICogcHJvdmlkZWQsIHRoZSBkZWZhdWx0IHJhbmdlIHdpbGwgYmUgMCBhbmQgMVxuXHQgKiBcblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBub3JtYWxpemVkXG5cdCAqIEBwYXJhbSBtaW4gdGhlIHJhbmdlIG1pbiB2YWx1ZVxuXHQgKiBAcGFyYW0gbWF4IHRoZSByYW5nZSBtYXggdmFsdWVcblx0ICovXG5cdHN0YXRpYyBub3JtYWxpemUodmFsdWU6bnVtYmVyLCBtaW46bnVtYmVyLCBtYXg6bnVtYmVyKTpudW1iZXJcblx0e1xuXHRcdGlmICghbWluKVxuXHRcdFx0bWluID0gMDtcblx0XHRpZiAoIW1heClcblx0XHRcdG1heCA9IDE7XG5cdFx0cmV0dXJuICh2YWx1ZSAtIG1pbikgLyAobWF4IC0gbWluKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHRha2VzIG1lcmdlcyBhbiBvYmplY3QgaW50byBhbm90aGVyXG5cdCAqIFxuXHQgKiBAcGFyYW0gaW50byB0aGUgb2JqZWN0IHRvIG1lcmdlIGludG9cblx0ICogQHBhcmFtIG9iaiB0aGUgb2JqZWN0IHRvIG1lcmdlIGZyb21cblx0ICovXG5cdHN0YXRpYyBtZXJnZShpbnRvOmFueSwgb2JqOmFueSk6YW55XG5cdHtcblx0XHR2YXIgYXR0cjpzdHJpbmc7XG5cdFx0Zm9yIChhdHRyIGluIG9iailcblx0XHRcdGludG9bYXR0cl0gPSBvYmpbYXR0cl07XG5cdFx0cmV0dXJuIGludG87XG5cdH1cblxuXHQvKipcblx0ICogVGVtcG9yYXJ5IHBvbHlmaWxsIHdvcmthcm91bmQgZm9yIFN0cmluZy5zdGFydHNXaXRoIGZvciBwcm9qZWN0cyB0aGF0IGFyZVxuXHQgKiB0YXJnZXR0aW5nIGVzNVxuXHQgKiBcblx0ICogZGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGJlZ2lucyB3aXRoIHRoZSBjaGFyYWN0ZXJzIG9mIGFub3RoZXIgc3RyaW5nLFxuXHQgKiByZXR1cm5pbmcgdHJ1ZSBvciBmYWxzZSBhcyBhcHByb3ByaWF0ZS5cblx0ICogXG5cdCAqIEBwYXJhbSBzdHJcblx0ICogICAgICAgICAgICB7c3RyaW5nfSB0aGUgc3RyIHN0cmluZyBpbiB3aGljaCB0byBzZWFyY2ggZm9yIGluXG5cdCAqICAgICAgICAgICAgc3RyLnN0YXJ0c1dpdGhcblx0ICogQHBhcmFtIHNlYXJjaFN0cmluZ1xuXHQgKiAgICAgICAgICAgIHtzdHJpbmd9IFRoZSBjaGFyYWN0ZXJzIHRvIGJlIHNlYXJjaGVkIGZvciBhdCB0aGUgc3RhcnQgb2Zcblx0ICogICAgICAgICAgICB0aGlzIHN0cmluZy5cblx0ICogQHBhcmFtIHBvc2l0aW9uXG5cdCAqICAgICAgICAgICAge251bWJlcj99IE9wdGlvbmFsLiBUaGUgcG9zaXRpb24gaW4gdGhpcyBzdHJpbmcgYXQgd2hpY2ggdG9cblx0ICogICAgICAgICAgICBiZWdpbiBzZWFyY2hpbmcgZm9yIHNlYXJjaFN0cmluZzsgZGVmYXVsdHMgdG8gMC5cblx0ICogXG5cdCAqIEByZXR1cm5zIHRydWUgb3IgZmFsc2Vcblx0ICogXG5cdCAqL1xuXHRzdGF0aWMgc3RhcnRzV2l0aChzdHI6c3RyaW5nLCBzZWFyY2hTdHJpbmc6c3RyaW5nLCBwb3NpdGlvbj86bnVtYmVyKTpib29sZWFuXG5cdHtcblx0XHRwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IDA7XG5cdFx0cmV0dXJuIHN0ci5pbmRleE9mKHNlYXJjaFN0cmluZywgcG9zaXRpb24pID09PSBwb3NpdGlvbjtcblx0fVxuXG5cblx0c3RhdGljIHJlc29sdmVSZWxhdGl2ZShwYXRoOnN0cmluZywgYmFzZTpzdHJpbmcpOnN0cmluZ1xuXHR7XG5cdFx0Ly8gVXBwZXIgZGlyZWN0b3J5XG5cdFx0aWYgKFN0YW5kYXJkTGliLnN0YXJ0c1dpdGgocGF0aCwgXCIuLi9cIikpXG5cdFx0XHRyZXR1cm4gU3RhbmRhcmRMaWIucmVzb2x2ZVJlbGF0aXZlKHBhdGguc2xpY2UoMyksIGJhc2UucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIlwiKSk7XG5cdFx0Ly8gUmVsYXRpdmUgdG8gdGhlIHJvb3Rcblx0XHRpZiAoU3RhbmRhcmRMaWIuc3RhcnRzV2l0aChwYXRoLCBcIi9cIikpXG5cdFx0e1xuXHRcdFx0dmFyIG1hdGNoID0gYmFzZS5tYXRjaCgvKFxcdyo6XFwvXFwvKT9bXlxcL10qXFwvLykgfHwgW2Jhc2VdO1xuXHRcdFx0cmV0dXJuIG1hdGNoWzBdICsgcGF0aC5zbGljZSgxKTtcblx0XHR9XG5cdFx0Ly8gcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0cmV0dXJuIGJhc2UucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIlwiKSArIFwiL1wiICsgcGF0aDtcblx0fVxuXG5cdHN0YXRpYyBnZXREYXRhQm91bmRzKGNvbHVtbjpudW1iZXJbXSk6YW55XG5cdHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bWluOiBfLm1pbihjb2x1bW4pLFxuXHRcdFx0bWF4OiBfLm1heChjb2x1bW4pXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm4gYW5kIG9iamVjdCB3aG9zZSBrZXlzIGFyZSB1cmwgcGFyYW1ldGVycyBhbmQgdmFsdWVcblx0ICovXG5cdHN0YXRpYyBnZXRVcmxQYXJhbXMoKTphbnlcblx0e1xuXG5cdFx0dmFyIHF1ZXJ5UGFyYW1zOiBhbnkgPSB7fTtcblx0XHR2YXIgcXVlcnk6c3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSk7XG5cdFx0aWYgKCFxdWVyeSlcblx0XHRcdHJldHVybiB7fTtcblx0XHR2YXIgdmFyczpzdHJpbmdbXSA9IHF1ZXJ5LnNwbGl0KFwiJlwiKTtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBwYWlyOnN0cmluZ1tdID0gdmFyc1tpXS5zcGxpdChcIj1cIik7XG5cdFx0XHRpZiAodHlwZW9mIHF1ZXJ5UGFyYW1zW3BhaXJbMF1dID09PSBcInVuZGVmaW5lZFwiKVxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeVBhcmFtc1twYWlyWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKTtcblx0XHRcdFx0Ly8gSWYgc2Vjb25kIGVudHJ5IHdpdGggdGhpcyBuYW1lXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcXVlcnlQYXJhbXNbcGFpclswXV0gPT09IFwic3RyaW5nXCIpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBhcnI6c3RyaW5nW10gPSBbcXVlcnlQYXJhbXNbcGFpclswXV0sIGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKV07XG5cdFx0XHRcdHF1ZXJ5UGFyYW1zW3BhaXJbMF1dID0gYXJyO1xuXHRcdFx0XHQvLyBJZiB0aGlyZCBvciBsYXRlciBlbnRyeSB3aXRoIHRoaXMgbmFtZVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRxdWVyeVBhcmFtc1twYWlyWzBdXS5wdXNoKGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeVBhcmFtcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHdpZHRoIG9mIGEgdGV4dCBzdHJpbmcsIGluIHBpeGVscywgYmFzZWQgb24gaXRzIGZvbnQgc3R5bGVcblx0ICovXG5cdHN0YXRpYyBnZXRUZXh0V2lkdGgodGV4dDpzdHJpbmcsIGZvbnQ6c3RyaW5nKTpudW1iZXJcblx0e1xuXHRcdC8vIGNyZWF0ZSBhIGR1bW15IGNhbnZhcyBlbGVtZW50IHRvIHBlcmZvcm0gdGhlIGNhbGN1bGF0aW9uXG5cdFx0dmFyIGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0dmFyIGNvbnRleHQ6Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRjb250ZXh0LmZvbnQgPSBmb250O1xuXHRcdHZhciBtZXRyaWNzOlRleHRNZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KTtcblx0XHRyZXR1cm4gbWV0cmljcy53aWR0aDtcblx0fVxuXG5cdHN0YXRpYyBnZXRUZXh0SGVpZ2h0KHRleHQ6c3RyaW5nLCBmb250OnN0cmluZyk6bnVtYmVyXG5cdHtcblx0XHR2YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcblx0XHR2YXIgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdHZhciBkdW1teVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk1cIik7XG5cdFx0ZHVtbXkuYXBwZW5kQ2hpbGQoZHVtbXlUZXh0KTtcblx0XHRkdW1teS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBmb250KTtcblx0XHRib2R5LmFwcGVuZENoaWxkKGR1bW15KTtcblx0XHR2YXIgcmVzdWx0ID0gZHVtbXkub2Zmc2V0SGVpZ2h0O1xuXHRcdGJvZHkucmVtb3ZlQ2hpbGQoZHVtbXkpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRzdGF0aWMgYWRkUG9pbnRDbGlja0xpc3RlbmVyKHRhcmdldDpIVE1MRWxlbWVudCwgbGlzdGVuZXI6RXZlbnRMaXN0ZW5lcik6dm9pZFxuXHR7XG5cdFx0bGlzdGVuZXJbJ29uTW91c2VEb3duJ10gPSBmdW5jdGlvbihldmVudDpNb3VzZUV2ZW50KTp2b2lkIHtcblx0XHRcdGxpc3RlbmVyWydtb3VzZURvd25FdmVudCddID0gZXZlbnQ7XG5cdFx0fTtcblx0XHRsaXN0ZW5lclsnb25DbGljayddID0gZnVuY3Rpb24oZXZlbnQ6TW91c2VFdmVudCk6dm9pZCB7XG5cdFx0XHR2YXIgbWRlOk1vdXNlRXZlbnQgPSBsaXN0ZW5lclsnbW91c2VEb3duRXZlbnQnXTtcblx0XHRcdGlmIChtZGUuY2xpZW50WCA9PT0gZXZlbnQuY2xpZW50WCAmJiBtZGUuY2xpZW50WSA9PT0gZXZlbnQuY2xpZW50WSlcblx0XHRcdFx0bGlzdGVuZXIoZXZlbnQpO1xuXHRcdH07XG5cdFx0dGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGxpc3RlbmVyWydvbk1vdXNlRG93biddKTtcblx0XHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBsaXN0ZW5lclsnb25DbGljayddKTtcblx0fVxuXG5cdHN0YXRpYyByZW1vdmVQb2ludENsaWNrTGlzdGVuZXIodGFyZ2V0OkhUTUxFbGVtZW50LCBsaXN0ZW5lcjpFdmVudExpc3RlbmVyKTp2b2lkXG5cdHtcblx0XHR0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgbGlzdGVuZXJbJ29uTW91c2VEb3duJ10pO1xuXHRcdHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGxpc3RlbmVyWydvbkNsaWNrJ10pO1xuXHR9XG59XG4iXX0=