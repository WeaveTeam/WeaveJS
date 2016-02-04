"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

var CustomZoomToExtent = function (_ol$control$Control) {
    _inherits(CustomZoomToExtent, _ol$control$Control);

    function CustomZoomToExtent(opt_options) {
        _classCallCheck(this, CustomZoomToExtent);

        var options = opt_options ? opt_options : {};
        var className = options.className ? options.className : 'ol-zoom-extent';
        var label = options.label ? options.label : 'E';
        var tipLabel = options.tipLabel ? options.tipLabel : 'Fit to extent';
        var button = (0, _jquery2.default)("<button>").addClass(className).prop("title", tipLabel).append(label);
        var div = (0, _jquery2.default)("<div>").addClass("ol-unselectable ol-control ol-zoom-extent").append(button);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CustomZoomToExtent).call(this, { target: options.target, element: div[0] }));

        _this.extent = options.extent ? options.extent : null;
        button.click(_this.handleClick.bind(_this));
        return _this;
    }

    _createClass(CustomZoomToExtent, [{
        key: "handleClick",
        value: function handleClick(event) {
            event.preventDefault();
            this.handleZoomToExtent();
        }
    }, {
        key: "handleZoomToExtent",
        value: function handleZoomToExtent() {
            var map = this.getMap();
            var view = map.getView();
            var extent = this.extent || view.get("extent") || view.getProjection().getExtent();
            view.fit(extent, map.getSize());
        }
    }]);

    return CustomZoomToExtent;
}(ol.control.Control);

exports.default = CustomZoomToExtent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tWm9vbVRvRXh0ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcC9DdXN0b21ab29tVG9FeHRlbnQudHMiXSwibmFtZXMiOlsiQ3VzdG9tWm9vbVRvRXh0ZW50IiwiQ3VzdG9tWm9vbVRvRXh0ZW50LmNvbnN0cnVjdG9yIiwiQ3VzdG9tWm9vbVRvRXh0ZW50LmhhbmRsZUNsaWNrIiwiQ3VzdG9tWm9vbVRvRXh0ZW50LmhhbmRsZVpvb21Ub0V4dGVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUtZLEFBQUUsQUFBTSxBQUFZLEFBQ3pCLEFBQU0sQUFBTSxBQUFRLEFBRTNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUMsZ0NBQVksQUFBNkM7OztBQUN4RCxZQUFJLEFBQU8sVUFBb0MsQUFBVyxjQUFHLEFBQVcsY0FBRyxBQUFFLEFBQUM7QUFFOUUsWUFBSSxBQUFTLFlBQVcsQUFBTyxRQUFDLEFBQVMsWUFBRyxBQUFPLFFBQUMsQUFBUyxZQUFHLEFBQWdCLEFBQUM7QUFFakYsWUFBSSxBQUFLLFFBQXVCLEFBQU8sUUFBQyxBQUFLLFFBQUcsQUFBTyxRQUFDLEFBQUssUUFBRyxBQUFHLEFBQUM7QUFFcEUsWUFBSSxBQUFRLFdBQVcsQUFBTyxRQUFDLEFBQVEsV0FBRyxBQUFPLFFBQUMsQUFBUSxXQUFHLEFBQWUsQUFBQztBQUU3RSxZQUFJLEFBQU0sU0FBRyxBQUFNLHNCQUFDLEFBQVUsQUFBQyxZQUFDLEFBQVEsU0FBQyxBQUFTLEFBQUMsV0FBQyxBQUFJLEtBQUMsQUFBTyxTQUFFLEFBQVEsQUFBQyxVQUFDLEFBQU0sT0FBQyxBQUFLLEFBQUMsQUFBQztBQUMxRixZQUFJLEFBQUcsTUFBRyxBQUFNLHNCQUFDLEFBQU8sQUFBQyxTQUFDLEFBQVEsU0FBQyxBQUEyQyxBQUFDLDZDQUFDLEFBQU0sT0FBQyxBQUFNLEFBQUMsQUFBQyxBQUMvRjs7MEdBQU0sRUFBRSxBQUFNLFFBQUUsQUFBTyxRQUFDLEFBQU0sUUFBRSxBQUFPLFNBQUUsQUFBRyxJQUFDLEFBQUMsQUFBQyxBQUFFLEFBQUMsQUFBQzs7QUFFbkQsQUFBSSxjQUFDLEFBQU0sU0FBRyxBQUFPLFFBQUMsQUFBTSxTQUFHLEFBQU8sUUFBQyxBQUFNLFNBQUcsQUFBSSxBQUFDO0FBRXJELEFBQU0sZUFBQyxBQUFLLE1BQUMsQUFBSSxNQUFDLEFBQVcsWUFBQyxBQUFJLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFBQyxBQUczQyxBQUFDLEFBRU8sQUFBVzs7Ozs7O29DQUFDLEFBQWdCO0FBQ25DLEFBQUssa0JBQUMsQUFBYyxBQUFFLEFBQUM7QUFDdkIsQUFBSSxpQkFBQyxBQUFrQixBQUFFLEFBQUMsQUFDM0IsQUFBQyxBQUVPLEFBQWtCOzs7OztBQUN6QixnQkFBSSxBQUFHLE1BQVcsQUFBSSxLQUFDLEFBQU0sQUFBRSxBQUFDO0FBQ2hDLGdCQUFJLEFBQUksT0FBWSxBQUFHLElBQUMsQUFBTyxBQUFFLEFBQUM7QUFDbEMsZ0JBQUksQUFBTSxTQUFjLEFBQUksS0FBQyxBQUFNLFVBQUksQUFBSSxLQUFDLEFBQUcsSUFBQyxBQUFRLEFBQUMsYUFBSSxBQUFJLEtBQUMsQUFBYSxBQUFFLGdCQUFDLEFBQVMsQUFBRSxBQUFDO0FBQzlGLEFBQUksaUJBQUMsQUFBRyxJQUFDLEFBQU0sUUFBRSxBQUFHLElBQUMsQUFBTyxBQUFFLEFBQUMsQUFBQyxBQUNqQyxBQUFDLEFBRUYsQUFBQzs7Ozs7RUFsQytDLEFBQUUsR0FBQyxBQUFPLFFBQUMsQUFBTyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy9vcGVubGF5ZXJzL29wZW5sYXllcnMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvanF1ZXJ5L2pxdWVyeS5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIG9sIGZyb20gXCJvcGVubGF5ZXJzXCI7XG5pbXBvcnQganF1ZXJ5IGZyb20gXCJqcXVlcnlcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tWm9vbVRvRXh0ZW50IGV4dGVuZHMgb2wuY29udHJvbC5Db250cm9sIHtcblx0cHJpdmF0ZSBleHRlbnQ6IG9sLkV4dGVudDtcblx0Y29uc3RydWN0b3Iob3B0X29wdGlvbnM/OiBvbHguY29udHJvbC5ab29tVG9FeHRlbnRPcHRpb25zKSB7XG5cdFx0bGV0IG9wdGlvbnM6IG9seC5jb250cm9sLlpvb21Ub0V4dGVudE9wdGlvbnMgPSBvcHRfb3B0aW9ucyA/IG9wdF9vcHRpb25zIDoge307XG5cblx0XHRsZXQgY2xhc3NOYW1lOiBzdHJpbmcgPSBvcHRpb25zLmNsYXNzTmFtZSA/IG9wdGlvbnMuY2xhc3NOYW1lIDogJ29sLXpvb20tZXh0ZW50JztcblxuXHRcdGxldCBsYWJlbDogc3RyaW5nfEhUTUxFbGVtZW50ID0gb3B0aW9ucy5sYWJlbCA/IG9wdGlvbnMubGFiZWwgOiAnRSc7XG5cblx0XHRsZXQgdGlwTGFiZWw6IHN0cmluZyA9IG9wdGlvbnMudGlwTGFiZWwgPyBvcHRpb25zLnRpcExhYmVsIDogJ0ZpdCB0byBleHRlbnQnO1xuXG5cdFx0bGV0IGJ1dHRvbiA9IGpxdWVyeShcIjxidXR0b24+XCIpLmFkZENsYXNzKGNsYXNzTmFtZSkucHJvcChcInRpdGxlXCIsIHRpcExhYmVsKS5hcHBlbmQobGFiZWwpO1xuXHRcdGxldCBkaXYgPSBqcXVlcnkoXCI8ZGl2PlwiKS5hZGRDbGFzcyhcIm9sLXVuc2VsZWN0YWJsZSBvbC1jb250cm9sIG9sLXpvb20tZXh0ZW50XCIpLmFwcGVuZChidXR0b24pO1xuXHRcdHN1cGVyKHsgdGFyZ2V0OiBvcHRpb25zLnRhcmdldCwgZWxlbWVudDogZGl2WzBdIH0pO1xuXG5cdFx0dGhpcy5leHRlbnQgPSBvcHRpb25zLmV4dGVudCA/IG9wdGlvbnMuZXh0ZW50IDogbnVsbDtcblxuXHRcdGJ1dHRvbi5jbGljayh0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuXG5cdFx0XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUNsaWNrKGV2ZW50Ok1vdXNlRXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuaGFuZGxlWm9vbVRvRXh0ZW50KCk7XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZVpvb21Ub0V4dGVudCgpIHtcblx0XHRsZXQgbWFwOiBvbC5NYXAgPSB0aGlzLmdldE1hcCgpO1xuXHRcdGxldCB2aWV3OiBvbC5WaWV3ID0gbWFwLmdldFZpZXcoKTtcblx0XHRsZXQgZXh0ZW50OiBvbC5FeHRlbnQgPSB0aGlzLmV4dGVudCB8fCB2aWV3LmdldChcImV4dGVudFwiKSB8fCB2aWV3LmdldFByb2plY3Rpb24oKS5nZXRFeHRlbnQoKTtcblx0XHR2aWV3LmZpdChleHRlbnQsIG1hcC5nZXRTaXplKCkpO1xuXHR9XG5cbn0iXX0=