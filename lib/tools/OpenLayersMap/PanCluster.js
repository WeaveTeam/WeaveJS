"use strict";

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

var PanCluster = function (_ol$control$Control) {
    _inherits(PanCluster, _ol$control$Control);

    function PanCluster(optOptions) {
        _classCallCheck(this, PanCluster);

        var options = optOptions || {};
        var parent = (0, _jquery2.default)("\n\t\t<div style=\"background-color: rgba(0,0,0,0)\" class=\"ol-unselectable ol-control panCluster\">\n\t\t\t<table style=\"font-size:75%\">\n\t\t\t\t<tr>\n\t\t\t\t\t<td></td><td class=\"ol-control\" style=\"position:relative\"><button class=\"panCluster N\">N</button></td><td></td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td class=\"ol-control\" style=\"position:relative\"><button class=\"panCluster W\">W</button></td>\n\t\t\t\t\t<td class=\"ol-control\" style=\"position:relative\"><button class=\"panCluster X fa fa-arrows-alt\"></button></td>\n\t\t\t\t\t<td class=\"ol-control\" style=\"position:relative\"><button class=\"panCluster E\">E</button></td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td></td><td class=\"ol-control\" style=\"position:relative\"><button class=\"panCluster S\">S</button></td><td></td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</div>");
        var directions = {
            N: [0, 1],
            E: [1, 0],
            S: [0, -1],
            W: [-1, 0],
            X: [null, null]
        };

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PanCluster).call(this, { element: parent[0], target: options.target }));

        var self = _this;
        var pan = function pan(xSign, ySign) {
            var panPercent = 0.3;
            var map = self.getMap();
            var view = map.getView();
            var extent = view.calculateExtent(map.getSize());
            var extentWidth = Math.abs(extent[0] - extent[2]);
            var extentHeight = Math.abs(extent[1] - extent[3]);
            var center = view.getCenter();
            center[0] += extentWidth * xSign * panPercent;
            center[1] += extentHeight * ySign * panPercent;
            view.setCenter(center);
        };
        var zoomExtent = function zoomExtent() {
            var map = self.getMap();
            var view = map.getView();
            var extent = view.get("extent") || view.getProjection().getExtent();
            var size = map.getSize();
            view.fit(extent, size);
        };
        for (var direction in directions) {
            var xSign = directions[direction][0];
            var ySign = directions[direction][1];
            var button = parent.find(".panCluster." + direction);
            if (xSign !== null) {
                button.click(pan.bind(_this, xSign, ySign));
            } else {
                button.click(zoomExtent.bind(_this));
            }
        }
        return _this;
    }

    return PanCluster;
}(ol.control.Control);

exports.default = PanCluster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFuQ2x1c3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvUGFuQ2x1c3Rlci50cyJdLCJuYW1lcyI6WyJQYW5DbHVzdGVyIiwiUGFuQ2x1c3Rlci5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFLWSxBQUFFLEFBQU0sQUFBWSxBQUN6QixBQUFNLEFBQU0sQUFBUSxBQUUzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNDLHdCQUFZLEFBQVc7OztBQUN0QixZQUFJLEFBQU8sVUFBRyxBQUFVLGNBQUksQUFBRSxBQUFDO0FBQy9CLFlBQUksQUFBTSxTQUFHLEFBQU0sQUFBQyxBQWViLEFBQUMsQUFBQztBQUVULHlCQUFpQjtBQUNoQixBQUFDLGVBQUUsQ0FBQyxBQUFDLEdBQUUsQUFBQyxBQUFDO0FBQ1QsQUFBQyxlQUFFLENBQUMsQUFBQyxHQUFFLEFBQUMsQUFBQztBQUNULEFBQUMsZUFBRSxDQUFDLEFBQUMsR0FBRSxDQUFDLEFBQUMsQUFBQztBQUNWLEFBQUMsZUFBRSxDQUFDLENBQUMsQUFBQyxHQUFFLEFBQUMsQUFBQztBQUNWLEFBQUMsZUFBRSxDQUFDLEFBQUksTUFBRSxBQUFJLEFBQUMsQUFDZixBQUFDLEFBRUY7U0FSSSxBQUFVOztrR0FRUixFQUFFLEFBQU8sU0FBRSxBQUFNLE9BQUMsQUFBQyxBQUFDLElBQUUsQUFBTSxRQUFFLEFBQU8sUUFBQyxBQUFNLEFBQUUsQUFBQyxBQUFDOztBQUV0RCxZQUFJLEFBQUksQUFBRyxBQUFJLEFBQUM7QUFFaEIsWUFBSSxBQUFHLG1CQUFZLEFBQUssT0FBRSxBQUFLO0FBQzlCLGdCQUFJLEFBQVUsYUFBRyxBQUFHLEFBQUM7QUFDckIsZ0JBQUksQUFBRyxNQUFHLEFBQUksS0FBQyxBQUFNLEFBQUUsQUFBQztBQUN4QixnQkFBSSxBQUFJLE9BQUcsQUFBRyxJQUFDLEFBQU8sQUFBRSxBQUFDO0FBQ3pCLGdCQUFJLEFBQU0sU0FBRyxBQUFJLEtBQUMsQUFBZSxnQkFBQyxBQUFHLElBQUMsQUFBTyxBQUFFLEFBQUMsQUFBQztBQUVqRCxnQkFBSSxBQUFXLGNBQUcsQUFBSSxLQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBQyxBQUFDLEtBQUcsQUFBTSxPQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDbEQsZ0JBQUksQUFBWSxlQUFHLEFBQUksS0FBQyxBQUFHLElBQUMsQUFBTSxPQUFDLEFBQUMsQUFBQyxLQUFHLEFBQU0sT0FBQyxBQUFDLEFBQUMsQUFBQyxBQUFDO0FBRW5ELGdCQUFJLEFBQU0sU0FBRyxBQUFJLEtBQUMsQUFBUyxBQUFFLEFBQUM7QUFFOUIsQUFBTSxtQkFBQyxBQUFDLEFBQUMsTUFBSSxBQUFXLGNBQUcsQUFBSyxRQUFHLEFBQVUsQUFBQztBQUM5QyxBQUFNLG1CQUFDLEFBQUMsQUFBQyxNQUFJLEFBQVksZUFBRyxBQUFLLFFBQUcsQUFBVSxBQUFDO0FBRS9DLEFBQUksaUJBQUMsQUFBUyxVQUFDLEFBQU0sQUFBQyxBQUFDLEFBQ3hCLEFBQUMsQUFBQztTQWZRO0FBaUJWLFlBQUksQUFBVTtBQUNiLGdCQUFJLEFBQUcsTUFBRyxBQUFJLEtBQUMsQUFBTSxBQUFFLEFBQUM7QUFDeEIsZ0JBQUksQUFBSSxPQUFHLEFBQUcsSUFBQyxBQUFPLEFBQUUsQUFBQztBQUN6QixnQkFBSSxBQUFNLFNBQUcsQUFBSSxLQUFDLEFBQUcsSUFBQyxBQUFRLEFBQUMsYUFBSSxBQUFJLEtBQUMsQUFBYSxBQUFFLGdCQUFDLEFBQVMsQUFBRSxBQUFDO0FBQ3BFLGdCQUFJLEFBQUksT0FBRyxBQUFHLElBQUMsQUFBTyxBQUFFLEFBQUM7QUFDekIsQUFBSSxpQkFBQyxBQUFHLElBQUMsQUFBTSxRQUFFLEFBQUksQUFBQyxBQUFDLEFBQ3hCLEFBQUMsQUFBQztTQU5lO0FBUWpCLEFBQUcsQUFBQyxhQUFDLEFBQUcsSUFBQyxBQUFTLGFBQUksQUFBVSxBQUFDLFlBQUMsQUFBQztBQUNsQyxnQkFBSSxBQUFLLFFBQUcsQUFBVSxXQUFDLEFBQVMsQUFBQyxXQUFDLEFBQUMsQUFBQyxBQUFDO0FBQ3JDLGdCQUFJLEFBQUssUUFBRyxBQUFVLFdBQUMsQUFBUyxBQUFDLFdBQUMsQUFBQyxBQUFDLEFBQUM7QUFFckMsZ0JBQUksQUFBTSxTQUFHLEFBQU0sT0FBQyxBQUFJLEtBQUMsQUFBYyxpQkFBRyxBQUFTLEFBQUMsQUFBQztBQUVyRCxBQUFFLEFBQUMsZ0JBQUMsQUFBSyxVQUFLLEFBQUksQUFBQyxNQUFDLEFBQUM7QUFDcEIsQUFBTSx1QkFBQyxBQUFLLE1BQUMsQUFBRyxJQUFDLEFBQUksQUFBQyxBQUFJLFlBQUUsQUFBSyxPQUFFLEFBQUssQUFBQyxBQUFDLEFBQUMsQUFDNUMsQUFBQyxBQUNELEFBQUk7bUJBQUMsQUFBQztBQUNMLEFBQU0sdUJBQUMsQUFBSyxNQUFDLEFBQVUsV0FBQyxBQUFJLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFBQyxBQUNyQyxBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDOzs7Ozs7O0VBdkV1QyxBQUFFLEdBQUMsQUFBTyxRQUFDLEFBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2pxdWVyeS9qcXVlcnkuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0IGpxdWVyeSBmcm9tIFwianF1ZXJ5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhbkNsdXN0ZXIgZXh0ZW5kcyBvbC5jb250cm9sLkNvbnRyb2wge1xuXHRjb25zdHJ1Y3RvcihvcHRPcHRpb25zPykge1xuXHRcdHZhciBvcHRpb25zID0gb3B0T3B0aW9ucyB8fCB7fTtcblx0XHRsZXQgcGFyZW50ID0ganF1ZXJ5KGBcblx0XHQ8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDAsMCwwKVwiIGNsYXNzPVwib2wtdW5zZWxlY3RhYmxlIG9sLWNvbnRyb2wgcGFuQ2x1c3RlclwiPlxuXHRcdFx0PHRhYmxlIHN0eWxlPVwiZm9udC1zaXplOjc1JVwiPlxuXHRcdFx0XHQ8dHI+XG5cdFx0XHRcdFx0PHRkPjwvdGQ+PHRkIGNsYXNzPVwib2wtY29udHJvbFwiIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmVcIj48YnV0dG9uIGNsYXNzPVwicGFuQ2x1c3RlciBOXCI+TjwvYnV0dG9uPjwvdGQ+PHRkPjwvdGQ+XG5cdFx0XHRcdDwvdHI+XG5cdFx0XHRcdDx0cj5cblx0XHRcdFx0XHQ8dGQgY2xhc3M9XCJvbC1jb250cm9sXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZVwiPjxidXR0b24gY2xhc3M9XCJwYW5DbHVzdGVyIFdcIj5XPC9idXR0b24+PC90ZD5cblx0XHRcdFx0XHQ8dGQgY2xhc3M9XCJvbC1jb250cm9sXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZVwiPjxidXR0b24gY2xhc3M9XCJwYW5DbHVzdGVyIFggZmEgZmEtYXJyb3dzLWFsdFwiPjwvYnV0dG9uPjwvdGQ+XG5cdFx0XHRcdFx0PHRkIGNsYXNzPVwib2wtY29udHJvbFwiIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmVcIj48YnV0dG9uIGNsYXNzPVwicGFuQ2x1c3RlciBFXCI+RTwvYnV0dG9uPjwvdGQ+XG5cdFx0XHRcdDwvdHI+XG5cdFx0XHRcdDx0cj5cblx0XHRcdFx0XHQ8dGQ+PC90ZD48dGQgY2xhc3M9XCJvbC1jb250cm9sXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZVwiPjxidXR0b24gY2xhc3M9XCJwYW5DbHVzdGVyIFNcIj5TPC9idXR0b24+PC90ZD48dGQ+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdDwvdGFibGU+XG5cdFx0PC9kaXY+YCk7XG5cblx0XHR2YXIgZGlyZWN0aW9ucyA9IHtcblx0XHRcdE46IFswLCAxXSxcblx0XHRcdEU6IFsxLCAwXSxcblx0XHRcdFM6IFswLCAtMV0sXG5cdFx0XHRXOiBbLTEsIDBdLFxuXHRcdFx0WDogW251bGwsIG51bGxdXG5cdFx0fTtcblxuXHRcdHN1cGVyKHsgZWxlbWVudDogcGFyZW50WzBdLCB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0IH0pO1xuXG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHBhbiA9IGZ1bmN0aW9uKHhTaWduLCB5U2lnbikge1xuXHRcdFx0bGV0IHBhblBlcmNlbnQgPSAwLjM7XG5cdFx0XHRsZXQgbWFwID0gc2VsZi5nZXRNYXAoKTtcblx0XHRcdGxldCB2aWV3ID0gbWFwLmdldFZpZXcoKTtcblx0XHRcdGxldCBleHRlbnQgPSB2aWV3LmNhbGN1bGF0ZUV4dGVudChtYXAuZ2V0U2l6ZSgpKTtcblxuXHRcdFx0bGV0IGV4dGVudFdpZHRoID0gTWF0aC5hYnMoZXh0ZW50WzBdIC0gZXh0ZW50WzJdKTtcblx0XHRcdGxldCBleHRlbnRIZWlnaHQgPSBNYXRoLmFicyhleHRlbnRbMV0gLSBleHRlbnRbM10pO1xuXG5cdFx0XHRsZXQgY2VudGVyID0gdmlldy5nZXRDZW50ZXIoKTtcblxuXHRcdFx0Y2VudGVyWzBdICs9IGV4dGVudFdpZHRoICogeFNpZ24gKiBwYW5QZXJjZW50O1xuXHRcdFx0Y2VudGVyWzFdICs9IGV4dGVudEhlaWdodCAqIHlTaWduICogcGFuUGVyY2VudDtcblxuXHRcdFx0dmlldy5zZXRDZW50ZXIoY2VudGVyKTtcblx0XHR9O1xuXG5cdFx0bGV0IHpvb21FeHRlbnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBtYXAgPSBzZWxmLmdldE1hcCgpO1xuXHRcdFx0bGV0IHZpZXcgPSBtYXAuZ2V0VmlldygpO1xuXHRcdFx0bGV0IGV4dGVudCA9IHZpZXcuZ2V0KFwiZXh0ZW50XCIpIHx8IHZpZXcuZ2V0UHJvamVjdGlvbigpLmdldEV4dGVudCgpO1xuXHRcdFx0bGV0IHNpemUgPSBtYXAuZ2V0U2l6ZSgpO1xuXHRcdFx0dmlldy5maXQoZXh0ZW50LCBzaXplKTtcblx0XHR9O1xuXG5cdFx0Zm9yIChsZXQgZGlyZWN0aW9uIGluIGRpcmVjdGlvbnMpIHtcblx0XHRcdGxldCB4U2lnbiA9IGRpcmVjdGlvbnNbZGlyZWN0aW9uXVswXTtcblx0XHRcdGxldCB5U2lnbiA9IGRpcmVjdGlvbnNbZGlyZWN0aW9uXVsxXTtcblxuXHRcdFx0bGV0IGJ1dHRvbiA9IHBhcmVudC5maW5kKFwiLnBhbkNsdXN0ZXIuXCIgKyBkaXJlY3Rpb24pO1xuXG5cdFx0XHRpZiAoeFNpZ24gIT09IG51bGwpIHtcblx0XHRcdFx0YnV0dG9uLmNsaWNrKHBhbi5iaW5kKHRoaXMsIHhTaWduLCB5U2lnbikpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGJ1dHRvbi5jbGljayh6b29tRXh0ZW50LmJpbmQodGhpcykpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSJdfQ==
