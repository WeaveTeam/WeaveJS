"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /// <reference path="../../typings/d3/d3.d.ts"/>

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormatUtils = function () {
    function FormatUtils() {
        _classCallCheck(this, FormatUtils);
    }

    _createClass(FormatUtils, null, [{
        key: "defaultNumberFormatting",

        // this function returns the default number formating.
        // for number values, we round them to at most 4 decimal places
        // unless the number is very small, in which case we just return it
        value: function defaultNumberFormatting(x) {
            if (x < 0.0001) {
                return x;
            } else {
                return d3.format(",")(d3.round(x, 4));
            }
        }
    }]);

    return FormatUtils;
}();

exports.default = FormatUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybWF0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy91dGlscy9Gb3JtYXRVdGlscy50cyJdLCJuYW1lcyI6WyJGb3JtYXRVdGlscyIsIkZvcm1hdFV0aWxzLmRlZmF1bHROdW1iZXJGb3JtYXR0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBRVksQUFBRSxBQUFNLEFBQUksQUFFeEI7Ozs7OztJQUVFLEFBQXNELEFBQ3ZELEFBQStELEFBQy9ELEFBQW1FLEFBQ2xFLEFBQU8sQUFBdUI7Ozs7Ozs7Ozs7O2dEQUFDLEFBQVE7QUFDckMsQUFBRSxnQkFBQyxBQUFDLElBQUcsQUFBTSxBQUFDO0FBQ1osQUFBTSx1QkFBQyxBQUFDLEFBQUMsQUFDWCxBQUFDLEFBQUMsQUFBSSxFQUZTLEFBQUM7bUJBRVQsQUFBQztBQUNOLEFBQU0sdUJBQUMsQUFBRSxHQUFDLEFBQU0sT0FBQyxBQUFHLEFBQUMsS0FBQyxBQUFFLEdBQUMsQUFBSyxNQUFDLEFBQUMsR0FBRSxBQUFDLEFBQUMsQUFBQyxBQUFDLEFBQ3hDLEFBQUMsQUFDSCxBQUFDLEFBQ0gsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2QzL2QzLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXRVdGlscyB7XG5cbiAgLy8gdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBkZWZhdWx0IG51bWJlciBmb3JtYXRpbmcuXG5cdC8vIGZvciBudW1iZXIgdmFsdWVzLCB3ZSByb3VuZCB0aGVtIHRvIGF0IG1vc3QgNCBkZWNpbWFsIHBsYWNlc1xuXHQvLyB1bmxlc3MgdGhlIG51bWJlciBpcyB2ZXJ5IHNtYWxsLCBpbiB3aGljaCBjYXNlIHdlIGp1c3QgcmV0dXJuIGl0XG4gIHN0YXRpYyBkZWZhdWx0TnVtYmVyRm9ybWF0dGluZyh4Om51bWJlcik6bnVtYmVyfHN0cmluZyB7XG4gICAgaWYoeCA8IDAuMDAwMSkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkMy5mb3JtYXQoXCIsXCIpKGQzLnJvdW5kKHgsIDQpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
