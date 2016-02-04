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

var InteractionModeCluster = function (_ol$control$Control) {
    _inherits(InteractionModeCluster, _ol$control$Control);

    function InteractionModeCluster(optOptions) {
        _classCallCheck(this, InteractionModeCluster);

        var interactionModePath = optOptions.interactionModePath;
        var options = optOptions || {};
        var buttonTable = (0, _jquery2.default)("\n\t\t\t<table class=\"ol-unselectable ol-control iModeCluster\">\n\t\t\t\t<tr style=\"font-size: 80%\">\n\t\t\t\t\t<td><button class=\"iModeCluster pan fa fa-hand-grab-o\"></button></td>\n\t\t\t\t\t<td><button class=\"iModeCluster select fa fa-mouse-pointer\"></button></td>\n\t\t\t\t\t<td><button class=\"iModeCluster zoom fa fa-search-plus\"></button></td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t");
        buttonTable.find("button.iModeCluster.pan").click(function () {
            return interactionModePath.state("pan");
        }).css({ "font-weight": "normal" });
        buttonTable.find("button.iModeCluster.select").click(function () {
            return interactionModePath.state("select");
        }).css({ "font-weight": "normal" });
        buttonTable.find("button.iModeCluster.zoom").click(function () {
            return interactionModePath.state("zoom");
        }).css({ "font-weight": "normal" });

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InteractionModeCluster).call(this, { element: buttonTable[0], target: options.target }));

        interactionModePath.addCallback(_this, function () {
            buttonTable.find("button.iModeCluster").removeClass("active");
            buttonTable.find("button.iModeCluster." + interactionModePath.getState()).addClass("active");
        }, true);
        return _this;
    }

    return InteractionModeCluster;
}(ol.control.Control);

exports.default = InteractionModeCluster;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3Rpb25Nb2RlQ2x1c3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvSW50ZXJhY3Rpb25Nb2RlQ2x1c3Rlci50cyJdLCJuYW1lcyI6WyJJbnRlcmFjdGlvbk1vZGVDbHVzdGVyIiwiSW50ZXJhY3Rpb25Nb2RlQ2x1c3Rlci5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFLWSxBQUFFLEFBQU0sQUFBWSxBQUN6QixBQUFNLEFBQU0sQUFBUSxBQUUzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNDLG9DQUFZLEFBQVU7OztBQUNyQixZQUFJLEFBQW1CLHNCQUFHLEFBQVUsV0FBQyxBQUFtQixBQUFDO0FBQ3pELFlBQUksQUFBTyxVQUFHLEFBQVUsY0FBSSxBQUFFLEFBQUM7QUFDL0IsWUFBSSxBQUFXLGNBQUcsQUFBTSxBQUFDLEFBUXhCLEFBQUMsQUFBQztBQUVILEFBQVcsb0JBQUMsQUFBSSxLQUFDLEFBQXlCLEFBQUMsMkJBQUMsQUFBSzttQkFBTyxBQUFtQixvQkFBQyxBQUFLLE1BQUMsQUFBSyxBQUFDLEFBQUM7U0FBdkMsRUFBd0MsQUFBRyxJQUFDLEVBQUUsQUFBYSxlQUFFLEFBQVEsQUFBRSxBQUFDLEFBQUM7QUFDM0gsQUFBVyxvQkFBQyxBQUFJLEtBQUMsQUFBNEIsQUFBQyw4QkFBQyxBQUFLO21CQUFPLEFBQW1CLG9CQUFDLEFBQUssTUFBQyxBQUFRLEFBQUMsQUFBQztTQUExQyxFQUEyQyxBQUFHLElBQUMsRUFBRSxBQUFhLGVBQUUsQUFBUSxBQUFFLEFBQUMsQUFBQztBQUNqSSxBQUFXLG9CQUFDLEFBQUksS0FBQyxBQUEwQixBQUFDLDRCQUFDLEFBQUs7bUJBQU8sQUFBbUIsb0JBQUMsQUFBSyxNQUFDLEFBQU0sQUFBQyxBQUFDO1NBQXhDLEVBQXlDLEFBQUcsSUFBQyxFQUFDLEFBQWEsZUFBRSxBQUFRLEFBQUMsQUFBQyxBQUFDLEFBRTNIOzs4R0FBTSxFQUFFLEFBQU8sU0FBRSxBQUFXLFlBQUMsQUFBQyxBQUFDLElBQUUsQUFBTSxRQUFFLEFBQU8sUUFBQyxBQUFNLEFBQUUsQUFBQyxBQUFDOztBQUUzRCxBQUFtQiw0QkFBQyxBQUFXLEFBQUMsQUFBSTtBQUNuQyxBQUFXLHdCQUFDLEFBQUksS0FBQyxBQUFxQixBQUFDLHVCQUFDLEFBQVcsWUFBQyxBQUFRLEFBQUMsQUFBQztBQUM5RCxBQUFXLHdCQUFDLEFBQUksS0FBQyxBQUFzQix5QkFBRyxBQUFtQixvQkFBQyxBQUFRLEFBQUUsQUFBQyxZQUFDLEFBQVEsU0FBQyxBQUFRLEFBQUMsQUFBQyxBQUM5RixBQUFDO1NBSHFDLEVBR25DLEFBQUksQUFBQyxBQUFDLEFBQ1YsQUFBQyxBQUNGLEFBQUM7Ozs7O0VBekJtRCxBQUFFLEdBQUMsQUFBTyxRQUFDLEFBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2pxdWVyeS9qcXVlcnkuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0IGpxdWVyeSBmcm9tIFwianF1ZXJ5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyYWN0aW9uTW9kZUNsdXN0ZXIgZXh0ZW5kcyBvbC5jb250cm9sLkNvbnRyb2wge1xuXHRjb25zdHJ1Y3RvcihvcHRPcHRpb25zKSB7XG5cdFx0dmFyIGludGVyYWN0aW9uTW9kZVBhdGggPSBvcHRPcHRpb25zLmludGVyYWN0aW9uTW9kZVBhdGg7XG5cdFx0dmFyIG9wdGlvbnMgPSBvcHRPcHRpb25zIHx8IHt9O1xuXHRcdHZhciBidXR0b25UYWJsZSA9IGpxdWVyeShgXG5cdFx0XHQ8dGFibGUgY2xhc3M9XCJvbC11bnNlbGVjdGFibGUgb2wtY29udHJvbCBpTW9kZUNsdXN0ZXJcIj5cblx0XHRcdFx0PHRyIHN0eWxlPVwiZm9udC1zaXplOiA4MCVcIj5cblx0XHRcdFx0XHQ8dGQ+PGJ1dHRvbiBjbGFzcz1cImlNb2RlQ2x1c3RlciBwYW4gZmEgZmEtaGFuZC1ncmFiLW9cIj48L2J1dHRvbj48L3RkPlxuXHRcdFx0XHRcdDx0ZD48YnV0dG9uIGNsYXNzPVwiaU1vZGVDbHVzdGVyIHNlbGVjdCBmYSBmYS1tb3VzZS1wb2ludGVyXCI+PC9idXR0b24+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PGJ1dHRvbiBjbGFzcz1cImlNb2RlQ2x1c3RlciB6b29tIGZhIGZhLXNlYXJjaC1wbHVzXCI+PC9idXR0b24+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdDwvdGFibGU+XG5cdFx0YCk7XG5cblx0XHRidXR0b25UYWJsZS5maW5kKFwiYnV0dG9uLmlNb2RlQ2x1c3Rlci5wYW5cIikuY2xpY2soKCkgPT4gaW50ZXJhY3Rpb25Nb2RlUGF0aC5zdGF0ZShcInBhblwiKSkuY3NzKHsgXCJmb250LXdlaWdodFwiOiBcIm5vcm1hbFwiIH0pO1xuXHRcdGJ1dHRvblRhYmxlLmZpbmQoXCJidXR0b24uaU1vZGVDbHVzdGVyLnNlbGVjdFwiKS5jbGljaygoKSA9PiBpbnRlcmFjdGlvbk1vZGVQYXRoLnN0YXRlKFwic2VsZWN0XCIpKS5jc3MoeyBcImZvbnQtd2VpZ2h0XCI6IFwibm9ybWFsXCIgfSk7XG5cdFx0YnV0dG9uVGFibGUuZmluZChcImJ1dHRvbi5pTW9kZUNsdXN0ZXIuem9vbVwiKS5jbGljaygoKSA9PiBpbnRlcmFjdGlvbk1vZGVQYXRoLnN0YXRlKFwiem9vbVwiKSkuY3NzKHtcImZvbnQtd2VpZ2h0XCI6IFwibm9ybWFsXCJ9KTtcblxuXHRcdHN1cGVyKHsgZWxlbWVudDogYnV0dG9uVGFibGVbMF0sIHRhcmdldDogb3B0aW9ucy50YXJnZXQgfSk7XG5cblx0XHRpbnRlcmFjdGlvbk1vZGVQYXRoLmFkZENhbGxiYWNrKHRoaXMsICgpID0+IHtcblx0XHRcdGJ1dHRvblRhYmxlLmZpbmQoXCJidXR0b24uaU1vZGVDbHVzdGVyXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdFx0YnV0dG9uVGFibGUuZmluZChcImJ1dHRvbi5pTW9kZUNsdXN0ZXIuXCIgKyBpbnRlcmFjdGlvbk1vZGVQYXRoLmdldFN0YXRlKCkpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdH0sIHRydWUpO1xuXHR9XG59Il19
