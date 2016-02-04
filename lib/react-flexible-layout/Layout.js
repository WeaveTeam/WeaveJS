"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactDom = require("react-dom");

var ReactDOM = _interopRequireWildcard(_reactDom);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _reactVendorPrefix = require("react-vendor-prefix");

var VendorPrefix = _interopRequireWildcard(_reactVendorPrefix);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _Resizer = require("./Resizer");

var _Resizer2 = _interopRequireDefault(_Resizer);

var _ResizerOverlay = require("./ResizerOverlay");

var _ResizerOverlay2 = _interopRequireDefault(_ResizerOverlay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

var RESIZEROVERLAY = "resizer";
var HORIZONTAL = "horizontal";

var Layout = function (_React$Component) {
    _inherits(Layout, _React$Component);

    function Layout(props, state) {
        _classCallCheck(this, Layout);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Layout).call(this, props, state));

        _this.panelDragging = false;
        var ps = props.state || {};
        _this.state = { id: ps.id, direction: ps.direction, children: ps.children, flex: ps.flex };
        _this.minSize = 16;
        _this.dragging = false;
        return _this;
    }

    _createClass(Layout, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            document.addEventListener("mouseup", this.boundMouseUp = this.onMouseUp.bind(this));
            document.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
            document.addEventListener("mousemove", this.boundMouseMove = this.onMouseMove.bind(this));
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState(_StandardLib2.default.includeMissingPropertyPlaceholders(this.state, nextProps.state));
        }
    }, {
        key: "compoenentWillUnmount",
        value: function compoenentWillUnmount() {
            document.removeEventListener("mousedown", this.boundMouseDown);
            document.removeEventListener("mouseup", this.boundMouseUp);
            document.removeEventListener("mouseMove", this.boundMouseMove);
        }
    }, {
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            return !_.isEqual(this.state, nextState) || !_.isEqual(this.state, nextProps.state);
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.props.onStateChange && this.state) this.props.onStateChange(this.state);
        }
    }, {
        key: "getDOMNodeFromId",
        value: function getDOMNodeFromId(id) {
            var component = this.getComponentFromId(id);
            if (component) return component.element;
        }
    }, {
        key: "getComponentFromId",
        value: function getComponentFromId(id) {
            if (this.state.id && _.isEqual(this.state.id, id)) {
                return this;
            } else {
                for (var i = 0; i < this.childNames.length; i++) {
                    var component = this.refs[this.childNames[i]].getComponentFromId(id);
                    if (component) return component;
                }
            }
        }
    }, {
        key: "onMouseDown",
        value: function onMouseDown(event) {
            var _this2 = this;

            this.resizerNames.forEach(function (resizerName) {
                var resizer = _this2.refs[resizerName];
                if (resizer && resizer.state && resizer.state.active) {
                    var overlayRange = _this2.getResizerRange(resizer);
                    overlayRange[0] += _this2.minSize;
                    overlayRange[1] -= _this2.minSize;
                    _this2.refs[RESIZEROVERLAY].setState({
                        active: true,
                        range: overlayRange
                    });
                }
            });
        }
    }, {
        key: "onMouseMove",
        value: function onMouseMove(event) {}
    }, {
        key: "getResizerRange",
        value: function getResizerRange(resizer) {
            var direction = resizer.props.direction;
            var pane1 = this.refs[resizer.props.pane1];
            var pane2 = this.refs[resizer.props.pane2];
            var element1 = ReactDOM.findDOMNode(pane1);
            var element2 = ReactDOM.findDOMNode(pane2);
            var rect = this.element.getBoundingClientRect();
            var pageLeft = window.pageXOffset + rect.left;
            var pageTop = window.pageYOffset + rect.top;
            if (direction === HORIZONTAL) return [element1.offsetLeft + pageLeft, element2.offsetLeft + element2.clientWidth + pageLeft];else return [element1.offsetTop + pageTop, element2.offsetTop + element2.clientHeight + pageTop];
        }
    }, {
        key: "onMouseUp",
        value: function onMouseUp(event) {
            var _this3 = this;

            var newState = _.cloneDeep(this.state);
            this.resizerNames.forEach(function (resizerName) {
                var resizer = _this3.refs[resizerName];
                var resizerOverlay = _this3.refs[RESIZEROVERLAY];
                if (resizer && resizer.state && resizer.state.active) {
                    var range = _this3.getResizerRange(resizer);
                    var begin = range[0];
                    var end = range[1];
                    var mousePos = _this3.state.direction === HORIZONTAL ? event.pageX : event.pageY;
                    var size = _this3.state.direction === HORIZONTAL ? _this3.element.clientWidth : _this3.element.clientHeight;
                    mousePos = Math.max(begin + _this3.minSize, Math.min(mousePos, end - _this3.minSize));
                    var ref1 = resizer.props.pane1;
                    var ref2 = resizer.props.pane2;
                    var pane1 = _this3.refs[ref1];
                    var pane2 = _this3.refs[ref2];
                    var index1 = _this3.childNames.indexOf(ref1);
                    var index2 = _this3.childNames.indexOf(ref2);
                    var flex1 = (mousePos - begin) / size;
                    var flex2 = (end - mousePos) / size;
                    newState.children[index1].flex = flex1;
                    newState.children[index2].flex = flex2;
                    pane1.setState({
                        flex: flex1
                    });
                    pane2.setState({
                        flex: flex2
                    });
                    resizer.setState({
                        active: false
                    });
                    resizerOverlay.setState({
                        active: false
                    });
                    _this3.setState(newState);
                }
            });
            this.panelDragging = false;
        }
    }, {
        key: "handleStateChange",
        value: function handleStateChange(childRef, newState) {
            var stateCopy = _.cloneDeep(this.state);
            var index = this.childNames.indexOf(childRef);
            stateCopy.children[index] = newState;
            this.setState(stateCopy);
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            this.childNames = [];
            this.resizerNames = [];
            var style = {
                display: "flex",
                flex: this.state.flex,
                position: "relative",
                outline: "none",
                overflow: "hidden",
                userSelect: "none",
                flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
            };
            if (this.state.direction === HORIZONTAL) style.height = "100%";else style.width = "100%";
            if (this.state.children && this.state.children.length > 0) {
                var newChildren = new Array(this.state.children.length * 2 - 1);
                this.state.children.forEach(function (childState, i) {
                    var ref = "child" + i;
                    _this4.childNames[i] = ref;
                    newChildren[i * 2] = React.createElement(Layout, { onStateChange: _this4.handleStateChange.bind(_this4, ref), ref: ref, state: childState, key: i * 2 });
                });
                if (this.state.direction === HORIZONTAL && weavejs.WeaveAPI.Locale.reverseLayout) newChildren.reverse();
                var i;
                for (i = 1; i < newChildren.length - 1; i += 2) {
                    var resizerName = "resizer" + i / 2;
                    this.resizerNames.push(resizerName);
                    var resizer = React.createElement(_Resizer2.default, { ref: resizerName, key: i, direction: this.state.direction, pane1: newChildren[i - 1].ref, pane2: newChildren[i + 1].ref });
                    newChildren[i] = resizer;
                }
            }
            var prefixed = VendorPrefix.prefix({ styles: style });
            return React.createElement(
                "div",
                { ref: function ref(elt) {
                        _this4.element = elt;
                    }, style: prefixed.styles },
                newChildren,
                React.createElement(_ResizerOverlay2.default, { ref: RESIZEROVERLAY, key: RESIZEROVERLAY, direction: this.state.direction })
            );
        }
    }]);

    return Layout;
}(React.Component);

exports.default = Layout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF5b3V0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3JlYWN0LWZsZXhpYmxlLWxheW91dC9MYXlvdXQudHN4Il0sIm5hbWVzIjpbIkxheW91dCIsIkxheW91dC5jb25zdHJ1Y3RvciIsIkxheW91dC5jb21wb25lbnREaWRNb3VudCIsIkxheW91dC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiTGF5b3V0LmNvbXBvZW5lbnRXaWxsVW5tb3VudCIsIkxheW91dC5zaG91bGRDb21wb25lbnRVcGRhdGUiLCJMYXlvdXQuY29tcG9uZW50RGlkVXBkYXRlIiwiTGF5b3V0LmdldERPTU5vZGVGcm9tSWQiLCJMYXlvdXQuZ2V0Q29tcG9uZW50RnJvbUlkIiwiTGF5b3V0Lm9uTW91c2VEb3duIiwiTGF5b3V0Lm9uTW91c2VNb3ZlIiwiTGF5b3V0LmdldFJlc2l6ZXJSYW5nZSIsIkxheW91dC5vbk1vdXNlVXAiLCJMYXlvdXQuaGFuZGxlU3RhdGVDaGFuZ2UiLCJMYXlvdXQucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBS1ksQUFBSyxBQUFNLEFBQU8sQUFDdkI7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBVyxBQUM5Qjs7OztJQUFLLEFBQUMsQUFBTSxBQUFRLEFBQ3BCOzs7O0lBQUssQUFBWSxBQUFNLEFBQXFCLEFBQzVDLEFBQVcsQUFBTSxBQUFzQixBQUN2QyxBQUFPLEFBQU0sQUFBVyxBQUN4QixBQUFjLEFBQU0sQUFBa0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUU3QyxJQUFNLEFBQWMsaUJBQVUsQUFBUyxBQUFDO0FBQ3hDLElBQU0sQUFBVSxhQUFVLEFBQVksQUFBQyxBQW1CdkM7Ozs7O0FBa0JDLG9CQUFZLEFBQWlCLE9BQUUsQUFBaUI7Ozs4RkFFekMsQUFBSyxPQUFFLEFBQUssQUFBQyxBQUFDOztBQVRiLGNBQWEsZ0JBQVcsQUFBSyxBQUFDO0FBVXJDLFlBQUksQUFBRSxLQUFHLEFBQUssTUFBQyxB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QUFDLEtBQUMsQUFBSyxBQUFDLE9BQUMsQUFBVyxZQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsR0FBQyxBQUFhLEFBQUMsQUFBRSxBQUFDO0FBQ2xMLEFBQVcsZ0NBQUMsQUFBQyxBQUFDLEtBQUcsQUFBTyxBQUFDLEFBQzFCLEFBQUMsQUFDRixBQUFDLFFBTkEsQUFBQzs7O0FBUUYsZ0JBQUksQUFBUSxXQUFPLEFBQVksYUFBQyxBQUFNLE9BQUMsRUFBQyxBQUFNLFFBQUUsQUFBSyxBQUFDLEFBQUMsQUFBQztBQUV4RCxBQUFNLEFBQUMsbUJBQ04sQUFBQyxBQUFHOztrQkFBQyxBQUFHLEFBQUMsa0JBQUUsQUFBVztBQUFPLEFBQUksK0JBQUMsQUFBTyxVQUFHLEFBQUcsQUFBQyxBQUFDLEFBQUMsQUFBQztxQkFBekMsRUFBMEMsQUFBSyxBQUFDLE9BQUMsQUFBUSxTQUFDLEFBQU0sQUFBQyxBQUMxRTtnQkFBQyxBQUFXLEFBQ1o7Z0JBQUEsQUFBQyxBQUFjLGdEQUFDLEFBQUcsQUFBQyxLQUFDLEFBQWMsQUFBQyxnQkFBQyxBQUFHLEFBQUMsS0FBQyxBQUFjLEFBQUMsZ0JBQUMsQUFBUyxBQUFDLFdBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFTLEFBQUMsQUFDM0YsQUFBRSxBQUFHLEFBQUMsQUFDTixBQUFDLEFBQ0gsQUFBQyxBQUNGLEFBQUM7Ozs7OztFQTdPbUMsQUFBSyxNQUFDLEFBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QtdmVuZG9yLXByZWZpeC9yZWFjdC12ZW5kb3ItcHJlZml4LmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBWZW5kb3JQcmVmaXggZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCBTdGFuZGFyZExpYiBmcm9tIFwiLi4vdXRpbHMvU3RhbmRhcmRMaWJcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBSZXNpemVyT3ZlcmxheSBmcm9tIFwiLi9SZXNpemVyT3ZlcmxheVwiO1xuXG5jb25zdCBSRVNJWkVST1ZFUkxBWTpzdHJpbmcgPSBcInJlc2l6ZXJcIjtcbmNvbnN0IEhPUklaT05UQUw6c3RyaW5nID0gXCJob3Jpem9udGFsXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGF5b3V0U3RhdGVcbntcblx0aWQ/OiBzdHJpbmdbXTtcblx0Y2hpbGRyZW4/OiBMYXlvdXRTdGF0ZVtdO1xuXHRkaXJlY3Rpb24/OiBzdHJpbmc7XG5cdGZsZXg/OiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXlvdXRQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPExheW91dD5cbntcblx0c3RhdGU6IExheW91dFN0YXRlO1xuXHRvblN0YXRlQ2hhbmdlOiBGdW5jdGlvbjtcblx0cGFuZTE/OiBzdHJpbmc7XG5cdHBhbmUyPzogc3RyaW5nO1xuXHR3ZWF2ZT86IGFueVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXlvdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8TGF5b3V0UHJvcHMsIExheW91dFN0YXRlPlxue1xuXHRwdWJsaWMgc3RhdGU6TGF5b3V0U3RhdGU7XG5cblx0cHJpdmF0ZSBtaW5TaXplOm51bWJlcjtcblx0cHJpdmF0ZSBkcmFnZ2luZzpib29sZWFuO1xuXG5cdHByaXZhdGUgYm91bmRNb3VzZVVwOmFueTtcblx0cHJpdmF0ZSBib3VuZE1vdXNlRG93bjphbnk7XG5cdHByaXZhdGUgYm91bmRNb3VzZU1vdmU6YW55O1xuXG5cdHByaXZhdGUgcGFuZWxEcmFnZ2luZzpib29sZWFuID0gZmFsc2U7XG5cblx0cHJpdmF0ZSBlbGVtZW50OkVsZW1lbnQ7XG5cblx0cHJpdmF0ZSBjaGlsZE5hbWVzOnN0cmluZ1tdO1xuXHRwcml2YXRlIHJlc2l6ZXJOYW1lczpzdHJpbmdbXTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczpMYXlvdXRQcm9wcywgc3RhdGU6TGF5b3V0U3RhdGUpXG5cdHtcblx0XHRzdXBlcihwcm9wcywgc3RhdGUpO1xuXHRcdHZhciBwcyA9IHByb3BzLnN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuc3RhdGUgPSB7aWQ6IHBzLmlkLCBkaXJlY3Rpb246IHBzLmRpcmVjdGlvbiwgY2hpbGRyZW46IHBzLmNoaWxkcmVuLCBmbGV4OiBwcy5mbGV4fTtcblx0XHR0aGlzLm1pblNpemUgPSAxNjtcblx0XHR0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpOnZvaWRcblx0e1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMuYm91bmRNb3VzZVVwID0gdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLmJvdW5kTW91c2VEb3duID0gdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMuYm91bmRNb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6TGF5b3V0UHJvcHMpOnZvaWRcblx0e1xuXHRcdHRoaXMuc2V0U3RhdGUoU3RhbmRhcmRMaWIuaW5jbHVkZU1pc3NpbmdQcm9wZXJ0eVBsYWNlaG9sZGVycyh0aGlzLnN0YXRlLCBuZXh0UHJvcHMuc3RhdGUpKTtcblx0fVxuXG5cdGNvbXBvZW5lbnRXaWxsVW5tb3VudCgpOnZvaWRcblx0e1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5ib3VuZE1vdXNlRG93bik7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5ib3VuZE1vdXNlVXApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZU1vdmVcIiwgdGhpcy5ib3VuZE1vdXNlTW92ZSk7XG5cdH1cblxuXHRzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOkxheW91dFByb3BzLCBuZXh0U3RhdGU6TGF5b3V0U3RhdGUpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiAhXy5pc0VxdWFsKHRoaXMuc3RhdGUsIG5leHRTdGF0ZSkgfHwgIV8uaXNFcXVhbCh0aGlzLnN0YXRlLCBuZXh0UHJvcHMuc3RhdGUpO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlKCk6dm9pZFxuXHR7XG5cdFx0aWYgKHRoaXMucHJvcHMub25TdGF0ZUNoYW5nZSAmJiB0aGlzLnN0YXRlKVxuXHRcdFx0dGhpcy5wcm9wcy5vblN0YXRlQ2hhbmdlKHRoaXMuc3RhdGUpO1xuXHR9XG5cblx0cHVibGljIGdldERPTU5vZGVGcm9tSWQoaWQ6c3RyaW5nW10pOkVsZW1lbnRcblx0e1xuXHRcdHZhciBjb21wb25lbnQgPSB0aGlzLmdldENvbXBvbmVudEZyb21JZChpZCk7XG5cdFx0aWYgKGNvbXBvbmVudClcblx0XHRcdHJldHVybiBjb21wb25lbnQuZWxlbWVudDtcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q29tcG9uZW50RnJvbUlkKGlkOnN0cmluZ1tdKTpMYXlvdXRcblx0e1xuXHRcdGlmICh0aGlzLnN0YXRlLmlkICYmIF8uaXNFcXVhbCh0aGlzLnN0YXRlLmlkLCBpZCkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmNoaWxkTmFtZXMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjb21wb25lbnQ6TGF5b3V0ID0gKHRoaXMucmVmc1t0aGlzLmNoaWxkTmFtZXNbaV1dIGFzIExheW91dCkuZ2V0Q29tcG9uZW50RnJvbUlkKGlkKTtcblx0XHRcdFx0aWYgKGNvbXBvbmVudClcblx0XHRcdFx0XHRyZXR1cm4gY29tcG9uZW50O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5yZXNpemVyTmFtZXMuZm9yRWFjaCgocmVzaXplck5hbWU6c3RyaW5nKSA9PiB7XG5cdFx0XHR2YXIgcmVzaXplcjpSZXNpemVyID0gdGhpcy5yZWZzW3Jlc2l6ZXJOYW1lXSBhcyBSZXNpemVyO1xuXHRcdFx0aWYgKHJlc2l6ZXIgJiYgcmVzaXplci5zdGF0ZSAmJiByZXNpemVyLnN0YXRlLmFjdGl2ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIG92ZXJsYXlSYW5nZTpudW1iZXJbXSA9IHRoaXMuZ2V0UmVzaXplclJhbmdlKHJlc2l6ZXIpO1xuXHRcdFx0XHRvdmVybGF5UmFuZ2VbMF0gKz0gdGhpcy5taW5TaXplO1xuXHRcdFx0XHRvdmVybGF5UmFuZ2VbMV0gLT0gdGhpcy5taW5TaXplO1xuXHRcdFx0XHQodGhpcy5yZWZzW1JFU0laRVJPVkVSTEFZXSBhcyBSZXNpemVyT3ZlcmxheSkuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdGFjdGl2ZTogdHJ1ZSxcblx0XHRcdFx0XHRyYW5nZTogb3ZlcmxheVJhbmdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRvbk1vdXNlTW92ZShldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblxuXHR9XG5cblx0Z2V0UmVzaXplclJhbmdlKHJlc2l6ZXI6UmVzaXplcik6bnVtYmVyW11cblx0e1xuXHRcdHZhciBkaXJlY3Rpb246c3RyaW5nID0gcmVzaXplci5wcm9wcy5kaXJlY3Rpb247XG5cdFx0dmFyIHBhbmUxOkxheW91dCA9IHRoaXMucmVmc1tyZXNpemVyLnByb3BzLnBhbmUxXSBhcyBMYXlvdXQ7XG5cdFx0dmFyIHBhbmUyOkxheW91dCA9IHRoaXMucmVmc1tyZXNpemVyLnByb3BzLnBhbmUyXSBhcyBMYXlvdXQ7XG5cdFx0XG5cdFx0dmFyIGVsZW1lbnQxOkhUTUxFbGVtZW50ID0gUmVhY3RET00uZmluZERPTU5vZGUocGFuZTEpIGFzIEhUTUxFbGVtZW50O1xuXHRcdHZhciBlbGVtZW50MjpIVE1MRWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHBhbmUyKSBhcyBIVE1MRWxlbWVudDtcblx0XHRcblx0XHR2YXIgcmVjdDpDbGllbnRSZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHZhciBwYWdlTGVmdDpudW1iZXIgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyByZWN0LmxlZnQ7XG5cdFx0dmFyIHBhZ2VUb3A6bnVtYmVyID0gd2luZG93LnBhZ2VZT2Zmc2V0ICsgcmVjdC50b3A7XG5cdFx0XG5cdFx0aWYgKGRpcmVjdGlvbiA9PT0gSE9SSVpPTlRBTClcblx0XHRcdHJldHVybiBbZWxlbWVudDEub2Zmc2V0TGVmdCArIHBhZ2VMZWZ0LCBlbGVtZW50Mi5vZmZzZXRMZWZ0ICsgZWxlbWVudDIuY2xpZW50V2lkdGggKyBwYWdlTGVmdF07XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIFtlbGVtZW50MS5vZmZzZXRUb3AgKyBwYWdlVG9wLCBlbGVtZW50Mi5vZmZzZXRUb3AgKyBlbGVtZW50Mi5jbGllbnRIZWlnaHQgKyBwYWdlVG9wXTtcblx0fVxuXG5cdG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR2YXIgbmV3U3RhdGU6TGF5b3V0U3RhdGUgPSBfLmNsb25lRGVlcCh0aGlzLnN0YXRlKTtcblxuXHRcdHRoaXMucmVzaXplck5hbWVzLmZvckVhY2gocmVzaXplck5hbWUgPT4ge1xuXHRcdFx0dmFyIHJlc2l6ZXI6UmVzaXplciA9IHRoaXMucmVmc1tyZXNpemVyTmFtZV0gYXMgUmVzaXplcjtcblx0XHRcdHZhciByZXNpemVyT3ZlcmxheTpSZXNpemVyT3ZlcmxheSA9IHRoaXMucmVmc1tSRVNJWkVST1ZFUkxBWV0gYXMgUmVzaXplck92ZXJsYXk7XG5cblx0XHRcdGlmIChyZXNpemVyICYmIHJlc2l6ZXIuc3RhdGUgJiYgcmVzaXplci5zdGF0ZS5hY3RpdmUpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByYW5nZTpudW1iZXJbXSA9IHRoaXMuZ2V0UmVzaXplclJhbmdlKHJlc2l6ZXIpO1xuXHRcdFx0XHR2YXIgYmVnaW46bnVtYmVyID0gcmFuZ2VbMF07XG5cdFx0XHRcdHZhciBlbmQ6bnVtYmVyID0gcmFuZ2VbMV07XG5cdFx0XHRcdHZhciBtb3VzZVBvczpudW1iZXIgPSB0aGlzLnN0YXRlLmRpcmVjdGlvbiA9PT0gSE9SSVpPTlRBTCA/IGV2ZW50LnBhZ2VYIDogZXZlbnQucGFnZVk7XG5cdFx0XHRcdHZhciBzaXplOm51bWJlciA9IHRoaXMuc3RhdGUuZGlyZWN0aW9uID09PSBIT1JJWk9OVEFMID8gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoIDogdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodDtcblxuXHRcdFx0XHRtb3VzZVBvcyA9IE1hdGgubWF4KGJlZ2luICsgdGhpcy5taW5TaXplLCBNYXRoLm1pbihtb3VzZVBvcywgZW5kIC0gdGhpcy5taW5TaXplKSk7XG5cblx0XHRcdFx0dmFyIHJlZjE6c3RyaW5nID0gcmVzaXplci5wcm9wcy5wYW5lMTtcblx0XHRcdFx0dmFyIHJlZjI6c3RyaW5nID0gcmVzaXplci5wcm9wcy5wYW5lMjtcblxuXHRcdFx0XHR2YXIgcGFuZTE6TGF5b3V0ID0gdGhpcy5yZWZzW3JlZjFdIGFzIExheW91dDtcblx0XHRcdFx0dmFyIHBhbmUyOkxheW91dCA9IHRoaXMucmVmc1tyZWYyXSBhcyBMYXlvdXQ7XG5cblxuXHRcdFx0XHR2YXIgaW5kZXgxOm51bWJlciA9IHRoaXMuY2hpbGROYW1lcy5pbmRleE9mKHJlZjEpO1xuXHRcdFx0XHR2YXIgaW5kZXgyOm51bWJlciA9IHRoaXMuY2hpbGROYW1lcy5pbmRleE9mKHJlZjIpO1xuXG5cdFx0XHRcdHZhciBmbGV4MTpudW1iZXIgPSAobW91c2VQb3MgLSBiZWdpbikgLyBzaXplO1xuXHRcdFx0XHR2YXIgZmxleDI6bnVtYmVyID0gKGVuZCAtIG1vdXNlUG9zKSAvIHNpemU7XG5cblx0XHRcdFx0bmV3U3RhdGUuY2hpbGRyZW5baW5kZXgxXS5mbGV4ID0gZmxleDE7XG5cdFx0XHRcdG5ld1N0YXRlLmNoaWxkcmVuW2luZGV4Ml0uZmxleCA9IGZsZXgyO1xuXG5cdFx0XHRcdHBhbmUxLnNldFN0YXRlKHtcblx0XHRcdFx0XHRmbGV4OiBmbGV4MVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRwYW5lMi5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0ZmxleDogZmxleDJcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmVzaXplci5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXNpemVyT3ZlcmxheS5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5wYW5lbERyYWdnaW5nID0gZmFsc2U7XG5cdH1cblxuXHRoYW5kbGVTdGF0ZUNoYW5nZShjaGlsZFJlZjpzdHJpbmcsIG5ld1N0YXRlOkxheW91dFN0YXRlKTp2b2lkXG5cdHtcblx0XHR2YXIgc3RhdGVDb3B5OkxheW91dFN0YXRlID0gXy5jbG9uZURlZXAodGhpcy5zdGF0ZSk7XG5cdFx0dmFyIGluZGV4ID0gdGhpcy5jaGlsZE5hbWVzLmluZGV4T2YoY2hpbGRSZWYpO1xuXG5cdFx0c3RhdGVDb3B5LmNoaWxkcmVuW2luZGV4XSA9IG5ld1N0YXRlO1xuXHRcdHRoaXMuc2V0U3RhdGUoc3RhdGVDb3B5KTtcblx0fVxuXG5cdHJlbmRlcigpOkpTWC5FbGVtZW50XG5cdHtcblx0XHR0aGlzLmNoaWxkTmFtZXMgPSBbXTtcblx0XHR0aGlzLnJlc2l6ZXJOYW1lcyA9IFtdO1xuXHRcdHZhciBzdHlsZTphbnkgPSB7XG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdGZsZXg6IHRoaXMuc3RhdGUuZmxleCxcblx0XHRcdHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG5cdFx0XHRvdXRsaW5lOiBcIm5vbmVcIixcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0dXNlclNlbGVjdDogXCJub25lXCIsXG5cdFx0XHRmbGV4RGlyZWN0aW9uOiB0aGlzLnN0YXRlLmRpcmVjdGlvbiA9PT0gSE9SSVpPTlRBTCA/IFwicm93XCIgOiBcImNvbHVtblwiXG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLnN0YXRlLmRpcmVjdGlvbiA9PT0gSE9SSVpPTlRBTClcblx0XHRcdHN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuXHRcdGVsc2Vcblx0XHRcdHN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5jaGlsZHJlbiAmJiB0aGlzLnN0YXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApXG5cdFx0e1xuXHRcdFx0dmFyIG5ld0NoaWxkcmVuOkpTWC5FbGVtZW50W10gPSBuZXcgQXJyYXkodGhpcy5zdGF0ZS5jaGlsZHJlbi5sZW5ndGggKiAyIC0gMSk7XG5cblx0XHRcdHRoaXMuc3RhdGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGRTdGF0ZTpMYXlvdXRTdGF0ZSwgaTpudW1iZXIpID0+IHtcblx0XHRcdFx0dmFyIHJlZjpzdHJpbmcgPSBcImNoaWxkXCIgKyBpO1xuXHRcdFx0XHR0aGlzLmNoaWxkTmFtZXNbaV0gPSByZWY7XG5cdFx0XHRcdG5ld0NoaWxkcmVuW2kgKiAyXSA9IDxMYXlvdXQgb25TdGF0ZUNoYW5nZT17dGhpcy5oYW5kbGVTdGF0ZUNoYW5nZS5iaW5kKHRoaXMsIHJlZil9IHJlZj17cmVmfSBzdGF0ZT17Y2hpbGRTdGF0ZX0ga2V5PXtpICogMn0vPjtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5kaXJlY3Rpb24gPT09IEhPUklaT05UQUwgJiYgd2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dClcblx0XHRcdFx0bmV3Q2hpbGRyZW4ucmV2ZXJzZSgpO1xuXG5cdFx0XHR2YXIgaTpudW1iZXI7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbmV3Q2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSArPSAyKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzaXplck5hbWU6c3RyaW5nID0gXCJyZXNpemVyXCIgKyAoaSAvIDIpO1xuXHRcdFx0XHR0aGlzLnJlc2l6ZXJOYW1lcy5wdXNoKHJlc2l6ZXJOYW1lKTtcblx0XHRcdFx0dmFyIHJlc2l6ZXI6SlNYLkVsZW1lbnQgPSA8UmVzaXplciByZWY9e3Jlc2l6ZXJOYW1lfSBrZXk9e2l9IGRpcmVjdGlvbj17dGhpcy5zdGF0ZS5kaXJlY3Rpb259IHBhbmUxPXtuZXdDaGlsZHJlbltpIC0gMV0ucmVmIGFzIHN0cmluZ30gcGFuZTI9e25ld0NoaWxkcmVuW2kgKyAxXS5yZWYgYXMgc3RyaW5nfS8+O1xuXHRcdFx0XHRuZXdDaGlsZHJlbltpXSA9IHJlc2l6ZXI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHByZWZpeGVkOmFueSA9IFZlbmRvclByZWZpeC5wcmVmaXgoe3N0eWxlczogc3R5bGV9KTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj17KGVsdDpFbGVtZW50KSA9PiB7IHRoaXMuZWxlbWVudCA9IGVsdDsgfX0gc3R5bGU9e3ByZWZpeGVkLnN0eWxlc30+XG5cdFx0XHRcdHtuZXdDaGlsZHJlbn1cblx0XHRcdFx0PFJlc2l6ZXJPdmVybGF5IHJlZj17UkVTSVpFUk9WRVJMQVl9IGtleT17UkVTSVpFUk9WRVJMQVl9IGRpcmVjdGlvbj17dGhpcy5zdGF0ZS5kaXJlY3Rpb259Lz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==
