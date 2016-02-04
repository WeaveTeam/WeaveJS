"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/c3/c3.d.ts"/>

var AbstractC3Tool = function (_React$Component) {
    _inherits(AbstractC3Tool, _React$Component);

    function AbstractC3Tool(props) {
        _classCallCheck(this, AbstractC3Tool);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AbstractC3Tool).call(this, props));

        _this.toolPath = props.toolPath;
        _this.plotManagerPath = _this.toolPath.push(["children", "visualization", "plotManager"]);
        _this.xAxisClass = "c3-axis-x";
        _this.yAxisClass = "c3-axis-y";
        _this.y2AxisClass = "c3-axis-y2";
        _this.paths = {
            plotter: {},
            marginTop: {},
            marginBottom: {},
            marginLeft: {},
            marginRight: {},
            xAxis: {},
            yAxis: {},
            filteredKeySet: {},
            selectionKeySet: {},
            probeKeySet: {}
        };
        return _this;
    }

    _createClass(AbstractC3Tool, [{
        key: "cullAxis",
        value: function cullAxis(axisSize, axisClass) {
            var intervalForCulling = this.getCullingInterval(axisSize, axisClass);
            d3.select(this.element).selectAll('.' + axisClass + ' .tick text').each(function (e, index) {
                if (index >= 0) {
                    d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
                }
            });
        }
    }, {
        key: "cullAxes",
        value: function cullAxes() {
            //cull axes
            var width = this.internalWidth;
            var height = this.internalHeight;
            this.cullAxis(width, this.xAxisClass);
            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                this.cullAxis(height, this.y2AxisClass);
            } else {
                this.cullAxis(height, this.yAxisClass);
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
                this.c3Config.size = { width: this.props.style.width, height: this.props.style.height };
                this.chart.resize({ width: this.props.style.width, height: this.props.style.height });
            }
        }
        // this function accepts an arry of path configurations
        // a path config is an object with a path object name, the weave path and an
        // optional callback or array of callbacks

    }, {
        key: "initializePaths",
        value: function initializePaths(properties) {
            var _this2 = this;

            properties.forEach(function (pathConf) {
                _this2.paths[pathConf.name] = pathConf.path;
                if (pathConf.callbacks) {
                    var callbacks = Array.isArray(pathConf.callbacks) ? pathConf.callbacks : [pathConf.callbacks];
                    callbacks.forEach(function (callback) {
                        _this2.paths[pathConf.name].addCallback(_this2, callback, true);
                    });
                }
            });
        }
    }, {
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "customStyle",
        value: function customStyle(array, type, filter, style) {
            var _this3 = this;

            array.forEach(function (index) {
                var filtered = d3.select(_this3.element).selectAll(type).filter(filter);
                if (filtered.length) d3.select(filtered[0][index]).style(style);
            });
        }
    }, {
        key: "customSelectorStyle",
        value: function customSelectorStyle(array, selector, style) {
            array.forEach(function (index) {
                if (selector.length) d3.select(selector[0][index]).style(style);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            return React.createElement("div", { ref: function ref(c) {
                    _this4.element = c;
                }, style: { width: "100%", height: "100%", maxHeight: "100%" } });
        }
    }, {
        key: "detectChange",
        value: function detectChange() {
            var _this5 = this;

            for (var _len = arguments.length, pathNames = Array(_len), _key = 0; _key < _len; _key++) {
                pathNames[_key] = arguments[_key];
            }

            return Weave.detectChange.apply(Weave, [this].concat(pathNames.map(function (name) {
                return _this5.paths[name].getObject();
            })));
        }
    }, {
        key: "getCullingInterval",
        value: function getCullingInterval(size, axisClass) {
            var textHeight = _StandardLib2.default.getTextHeight("test", this.getFontString());
            var labelsToShow = Math.floor(size / textHeight);
            labelsToShow = Math.max(2, labelsToShow);
            var tickValues = d3.select(this.element).selectAll('.' + axisClass + ' .tick text').size();
            var intervalForCulling;
            for (var i = 1; i < tickValues; i++) {
                if (tickValues / i < labelsToShow) {
                    intervalForCulling = i;
                    break;
                }
            }
            return intervalForCulling;
        }
    }, {
        key: "getFontString",
        value: function getFontString() {
            return this.props.fontSize + "pt " + this.props.font;
        }
    }, {
        key: "title",
        get: function get() {
            return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
        }
    }, {
        key: "internalWidth",
        get: function get() {
            return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
        }
    }, {
        key: "internalHeight",
        get: function get() {
            return this.props.style.height - this.c3Config.padding.top - Number(this.paths.marginBottom.getState());
        }
    }]);

    return AbstractC3Tool;
}(React.Component);

exports.default = AbstractC3Tool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RDM1Rvb2wuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvQWJzdHJhY3RDM1Rvb2wudHN4Il0sIm5hbWVzIjpbIkFic3RyYWN0QzNUb29sIiwiQWJzdHJhY3RDM1Rvb2wuY29uc3RydWN0b3IiLCJBYnN0cmFjdEMzVG9vbC50aXRsZSIsIkFic3RyYWN0QzNUb29sLmludGVybmFsV2lkdGgiLCJBYnN0cmFjdEMzVG9vbC5pbnRlcm5hbEhlaWdodCIsIkFic3RyYWN0QzNUb29sLmN1bGxBeGlzIiwiQWJzdHJhY3RDM1Rvb2wuY3VsbEF4ZXMiLCJBYnN0cmFjdEMzVG9vbC5jb21wb25lbnREaWRVcGRhdGUiLCJBYnN0cmFjdEMzVG9vbC5pbml0aWFsaXplUGF0aHMiLCJBYnN0cmFjdEMzVG9vbC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIkFic3RyYWN0QzNUb29sLmN1c3RvbVN0eWxlIiwiQWJzdHJhY3RDM1Rvb2wuY3VzdG9tU2VsZWN0b3JTdHlsZSIsIkFic3RyYWN0QzNUb29sLnJlbmRlciIsIkFic3RyYWN0QzNUb29sLmRldGVjdENoYW5nZSIsIkFic3RyYWN0QzNUb29sLmdldEN1bGxpbmdJbnRlcnZhbCIsIkFic3RyYWN0QzNUb29sLmdldEZvbnRTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFTWSxBQUFLLEFBQU0sQUFBTyxBQUV2Qjs7OztJQUFLLEFBQUUsQUFBTSxBQUFJLEFBQ2pCLEFBQVcsQUFBTSxBQUFzQixBQXVCOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZUksNEJBQVksQUFBbUI7OztzR0FDckIsQUFBSyxBQUFDLEFBQUM7O0FBQ2IsQUFBSSxjQUFDLEFBQVEsV0FBRyxBQUFLLE1BQUMsQUFBUSxBQUFDO0FBQy9CLEFBQUksY0FBQyxBQUFlLGtCQUFHLEFBQUksTUFBQyxBQUFRLFNBQUMsQUFBSSxLQUFDLENBQUMsQUFBVSxZQUFDLEFBQWUsaUJB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QUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFPLFFBQUMsQUFBSSxPQUFHLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBTyxRQUFDLEFBQUssQUFBQyxBQUM3RixBQUFDLEFBRUQsQUFBSSxBQUFjOzs7OztBQUNkLEFBQU0sbUJBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFLLE1BQUMsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBTyxRQUFDLEFBQUcsTUFBRyxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFZLGFBQUMsQUFBUSxBQUFFLEFBQUMsQUFBQyxBQUM1RyxBQUFDLEFBRU8sQUFBUTs7Ozs7RUFoRHdCLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC1kb20uZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9kMy9kMy5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvYzMvYzMuZC50c1wiLz5cblxuaW1wb3J0IHtJVmlzVG9vbCwgSVZpc1Rvb2xQcm9wcywgSVZpc1Rvb2xTdGF0ZX0gZnJvbSBcIi4vSVZpc1Rvb2xcIjtcbmltcG9ydCB7Q2hhcnRBUEksIENoYXJ0Q29uZmlndXJhdGlvbn0gZnJvbSBcImMzXCI7XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0ICogYXMgZDMgZnJvbSBcImQzXCI7XG5pbXBvcnQgU3RhbmRhcmRMaWIgZnJvbSBcIi4uL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRvb2xQYXRocyB7XG4gICAgW25hbWU6c3RyaW5nXSA6IFdlYXZlUGF0aDtcbiAgICBwbG90dGVyOiBXZWF2ZVBhdGg7XG4gICAgbWFyZ2luVG9wOiBXZWF2ZVBhdGg7XG4gICAgbWFyZ2luQm90dG9tOiBXZWF2ZVBhdGg7XG4gICAgbWFyZ2luTGVmdDogV2VhdmVQYXRoO1xuICAgIG1hcmdpblJpZ2h0OiBXZWF2ZVBhdGg7XG4gICAgeEF4aXM6IFdlYXZlUGF0aDtcbiAgICB5QXhpczogV2VhdmVQYXRoO1xuICAgIGZpbHRlcmVkS2V5U2V0OiBXZWF2ZVBhdGg7XG4gICAgc2VsZWN0aW9uS2V5U2V0OiBXZWF2ZVBhdGg7XG4gICAgcHJvYmVLZXlTZXQ6IFdlYXZlUGF0aDtcbn1cblxuXG5pbnRlcmZhY2UgUGF0aENvbmZpZyB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHBhdGg6IFdlYXZlUGF0aDtcbiAgICBjYWxsYmFja3M/OiBGdW5jdGlvbnxGdW5jdGlvbltdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYnN0cmFjdEMzVG9vbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlPiBpbXBsZW1lbnRzIElWaXNUb29sIHtcblxuICAgIHByb3RlY3RlZCB0b29sUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJvdGVjdGVkIHBsb3RNYW5hZ2VyUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJvdGVjdGVkIGVsZW1lbnQ6SFRNTEVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIHBhdGhzOklUb29sUGF0aHM7XG4gICAgcHJvdGVjdGVkIGNoYXJ0OkNoYXJ0QVBJO1xuICAgIHByb3RlY3RlZCBjM0NvbmZpZzpDaGFydENvbmZpZ3VyYXRpb247XG4gICAgcHJpdmF0ZSB4QXhpc0NsYXNzOnN0cmluZztcbiAgICBwcml2YXRlIHlBeGlzQ2xhc3M6c3RyaW5nO1xuICAgIHByaXZhdGUgeTJBeGlzQ2xhc3M6c3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBwcmV2aW91c1dpZHRoOm51bWJlcjtcbiAgICBwcml2YXRlIHByZXZpb3VzSGVpZ2h0Om51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklWaXNUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoID0gcHJvcHMudG9vbFBhdGg7XG4gICAgICAgIHRoaXMucGxvdE1hbmFnZXJQYXRoID0gdGhpcy50b29sUGF0aC5wdXNoKFtcImNoaWxkcmVuXCIsXCJ2aXN1YWxpemF0aW9uXCIsXCJwbG90TWFuYWdlclwiXSk7XG4gICAgICAgIHRoaXMueEF4aXNDbGFzcyA9IFwiYzMtYXhpcy14XCI7XG4gICAgICAgIHRoaXMueUF4aXNDbGFzcyA9IFwiYzMtYXhpcy15XCI7XG4gICAgICAgIHRoaXMueTJBeGlzQ2xhc3MgPSBcImMzLWF4aXMteTJcIjtcbiAgICAgICAgdGhpcy5wYXRocyA9IHtcbiAgICAgICAgICAgIHBsb3R0ZXI6IHt9LFxuICAgICAgICAgICAgbWFyZ2luVG9wOiB7fSxcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbToge30sXG4gICAgICAgICAgICBtYXJnaW5MZWZ0OiB7fSxcbiAgICAgICAgICAgIG1hcmdpblJpZ2h0OiB7fSxcbiAgICAgICAgICAgIHhBeGlzOiB7fSxcbiAgICAgICAgICAgIHlBeGlzOiB7fSxcbiAgICAgICAgICAgIGZpbHRlcmVkS2V5U2V0OiB7fSxcbiAgICAgICAgICAgIHNlbGVjdGlvbktleVNldDoge30sXG4gICAgICAgICAgICBwcm9iZUtleVNldDoge31cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXQgdGl0bGUoKTpzdHJpbmcge1xuICAgICAgIHJldHVybiAodGhpcy50b29sUGF0aC5nZXRUeXBlKCdwYW5lbFRpdGxlJykgPyB0aGlzLnRvb2xQYXRoLmdldFN0YXRlKCdwYW5lbFRpdGxlJykgOiAnJykgfHwgdGhpcy50b29sUGF0aC5nZXRQYXRoKCkucG9wKCk7XG4gICAgfVxuXG4gICAgZ2V0IGludGVybmFsV2lkdGgoKTpudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5zdHlsZS53aWR0aCAtIHRoaXMuYzNDb25maWcucGFkZGluZy5sZWZ0IC0gdGhpcy5jM0NvbmZpZy5wYWRkaW5nLnJpZ2h0O1xuICAgIH1cblxuICAgIGdldCBpbnRlcm5hbEhlaWdodCgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCAtIHRoaXMuYzNDb25maWcucGFkZGluZy50b3AgLSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Cb3R0b20uZ2V0U3RhdGUoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjdWxsQXhpcyhheGlzU2l6ZTpudW1iZXIsIGF4aXNDbGFzczpzdHJpbmcpOnZvaWQge1xuICAgICAgICB2YXIgaW50ZXJ2YWxGb3JDdWxsaW5nOm51bWJlciA9IHRoaXMuZ2V0Q3VsbGluZ0ludGVydmFsKGF4aXNTaXplLGF4aXNDbGFzcyk7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbCgnLicgKyBheGlzQ2xhc3MgKyAnIC50aWNrIHRleHQnKS5lYWNoKGZ1bmN0aW9uIChlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc3R5bGUoJ2Rpc3BsYXknLCBpbmRleCAlIGludGVydmFsRm9yQ3VsbGluZyA/ICdub25lJyA6ICdibG9jaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3VsbEF4ZXMoKSB7XG4gICAgICAgIC8vY3VsbCBheGVzXG4gICAgICAgIHZhciB3aWR0aDpudW1iZXIgPSB0aGlzLmludGVybmFsV2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQ6bnVtYmVyID0gdGhpcy5pbnRlcm5hbEhlaWdodDtcbiAgICAgICAgdGhpcy5jdWxsQXhpcyh3aWR0aCwgdGhpcy54QXhpc0NsYXNzKTtcbiAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCkge1xuICAgICAgICAgICAgdGhpcy5jdWxsQXhpcyhoZWlnaHQsIHRoaXMueTJBeGlzQ2xhc3MpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuY3VsbEF4aXMoaGVpZ2h0LCB0aGlzLnlBeGlzQ2xhc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCk6dm9pZCB7XG4gICAgICAgIGlmKHRoaXMuYzNDb25maWcuc2l6ZS53aWR0aCAhPSB0aGlzLnByb3BzLnN0eWxlLndpZHRoIHx8IHRoaXMuYzNDb25maWcuc2l6ZS5oZWlnaHQgIT0gdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcuc2l6ZSA9IHt3aWR0aDogdGhpcy5wcm9wcy5zdHlsZS53aWR0aCwgaGVpZ2h0OiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodH07XG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnJlc2l6ZSh7d2lkdGg6dGhpcy5wcm9wcy5zdHlsZS53aWR0aCwgaGVpZ2h0OnRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzIGZ1bmN0aW9uIGFjY2VwdHMgYW4gYXJyeSBvZiBwYXRoIGNvbmZpZ3VyYXRpb25zXG4gICAgLy8gYSBwYXRoIGNvbmZpZyBpcyBhbiBvYmplY3Qgd2l0aCBhIHBhdGggb2JqZWN0IG5hbWUsIHRoZSB3ZWF2ZSBwYXRoIGFuZCBhblxuICAgIC8vIG9wdGlvbmFsIGNhbGxiYWNrIG9yIGFycmF5IG9mIGNhbGxiYWNrc1xuICAgIGluaXRpYWxpemVQYXRocyhwcm9wZXJ0aWVzOlBhdGhDb25maWdbXSk6dm9pZCB7XG4gICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgocGF0aENvbmY6UGF0aENvbmZpZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXRoc1twYXRoQ29uZi5uYW1lXSA9IHBhdGhDb25mLnBhdGg7XG4gICAgICAgICAgICBpZihwYXRoQ29uZi5jYWxsYmFja3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tzOkZ1bmN0aW9uW10gPSBBcnJheS5pc0FycmF5KHBhdGhDb25mLmNhbGxiYWNrcykgPyBwYXRoQ29uZi5jYWxsYmFja3MgYXMgRnVuY3Rpb25bXSA6IFtwYXRoQ29uZi5jYWxsYmFja3MgYXMgRnVuY3Rpb25dO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjazpGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGhzW3BhdGhDb25mLm5hbWVdLmFkZENhbGxiYWNrKHRoaXMsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcbiAgICB7XG5cbiAgICB9XG5cbiAgICBjdXN0b21TdHlsZShhcnJheTpBcnJheTxudW1iZXI+LCB0eXBlOnN0cmluZywgZmlsdGVyOnN0cmluZywgc3R5bGU6YW55KSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goIChpbmRleCkgPT4ge1xuICAgICAgICBcdHZhciBmaWx0ZXJlZCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbCh0eXBlKS5maWx0ZXIoZmlsdGVyKTtcbiAgICAgICAgXHRpZiAoZmlsdGVyZWQubGVuZ3RoKVxuICAgICAgICBcdFx0ZDMuc2VsZWN0KGZpbHRlcmVkWzBdW2luZGV4XSkuc3R5bGUoc3R5bGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjdXN0b21TZWxlY3RvclN0eWxlKGFycmF5OkFycmF5PG51bWJlcj4sIHNlbGVjdG9yLCBzdHlsZTphbnkpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaCggKGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvclswXVtpbmRleF0pLnN0eWxlKHN0eWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6SlNYLkVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyhjOkhUTUxFbGVtZW50KSA9PiB7dGhpcy5lbGVtZW50ID0gYzt9fSBzdHlsZT17e3dpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiBcIjEwMCVcIiwgbWF4SGVpZ2h0OiBcIjEwMCVcIn19Lz47XG4gICAgfVxuXG4gICAgZGV0ZWN0Q2hhbmdlKC4uLnBhdGhOYW1lcyk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiBXZWF2ZS5kZXRlY3RDaGFuZ2UuYXBwbHkoV2VhdmUsIFt0aGlzXS5jb25jYXQocGF0aE5hbWVzLm1hcChuYW1lID0+IHRoaXMucGF0aHNbbmFtZV0uZ2V0T2JqZWN0KCkpKSk7XG4gICAgfVxuXG4gICAgZ2V0Q3VsbGluZ0ludGVydmFsKHNpemU6bnVtYmVyLGF4aXNDbGFzczpzdHJpbmcpOm51bWJlciB7XG4gICAgICAgIHZhciB0ZXh0SGVpZ2h0Om51bWJlciA9IFN0YW5kYXJkTGliLmdldFRleHRIZWlnaHQoXCJ0ZXN0XCIsIHRoaXMuZ2V0Rm9udFN0cmluZygpKTtcbiAgICAgICAgdmFyIGxhYmVsc1RvU2hvdzpudW1iZXIgPSBNYXRoLmZsb29yKHNpemUgLyB0ZXh0SGVpZ2h0KTtcbiAgICAgICAgbGFiZWxzVG9TaG93ID0gTWF0aC5tYXgoMixsYWJlbHNUb1Nob3cpO1xuXG4gICAgICAgIHZhciB0aWNrVmFsdWVzOm51bWJlciA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbCgnLicgKyBheGlzQ2xhc3MgKyAnIC50aWNrIHRleHQnKS5zaXplKCk7XG4gICAgICAgIHZhciBpbnRlcnZhbEZvckN1bGxpbmc6bnVtYmVyO1xuICAgICAgICBmb3IgKHZhciBpOm51bWJlciA9IDE7IGkgPCB0aWNrVmFsdWVzOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aWNrVmFsdWVzIC8gaSA8IGxhYmVsc1RvU2hvdykge1xuICAgICAgICAgICAgICAgIGludGVydmFsRm9yQ3VsbGluZyA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGludGVydmFsRm9yQ3VsbGluZztcbiAgICB9XG5cbiAgICBnZXRGb250U3RyaW5nKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZm9udFNpemUgKyBcInB0IFwiICsgdGhpcy5wcm9wcy5mb250O1xuICAgIH1cbn1cbiJdfQ==
