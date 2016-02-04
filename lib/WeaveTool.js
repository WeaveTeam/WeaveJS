"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WeaveTool = undefined;
exports.registerToolImplementation = registerToolImplementation;
exports.getToolImplementation = getToolImplementation;

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _ui = require("./react-ui/ui");

var _ui2 = _interopRequireDefault(_ui);

var _StandardLib = require("./utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _tooltip = require("./tools/tooltip");

var _tooltip2 = _interopRequireDefault(_tooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../typings/react/react.d.ts"/>
///<reference path="../typings/react/react-dom.d.ts"/>
///<reference path="../typings/lodash/lodash.d.ts"/>
///<reference path="../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
///<reference path="../typings/react-bootstrap/react-bootstrap.d.ts"/>

var toolRegistry = {};
var grabberStyle = {
    width: "16",
    height: "16",
    cursor: "move",
    background: "url(http://placehold.it/32x32)"
};
function registerToolImplementation(asClassName, jsClass) {
    toolRegistry[asClassName] = jsClass;
}
function getToolImplementation(param) {
    var type;
    if (typeof param === 'string') {
        type = param;
    } else {
        var path = param;
        type = path.getType();
        if (type === "weave.visualization.tools::ExternalTool" && path.getType("toolClass")) type = path.getState("toolClass");
        if (type === "weavejs.core.LinkableHashMap" && path.getType("class")) type = path.getState("class");
    }
    return toolRegistry[type];
}

var WeaveTool = exports.WeaveTool = function (_React$Component) {
    _inherits(WeaveTool, _React$Component);

    function WeaveTool(props) {
        _classCallCheck(this, WeaveTool);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveTool).call(this, props));

        _this.toolPath = _this.props.toolPath;
        _this.ToolClass = getToolImplementation(_this.toolPath || _this.props.toolClass);
        _this.titleBarHeight = 25;
        return _this;
    }

    _createClass(WeaveTool, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            // if (this.toolPath) {
            //     this.toolPath.addCallback(this, this.forceUpdate);
            // }
        }
    }, {
        key: "render",

        //TODO - we shouldn't have to render twice to set the tooltip of the tool
        value: function render() {
            var _this2 = this;

            var toolHeight = this.props.style ? this.props.style.height - this.titleBarHeight : 320;
            var toolWidth = this.props.style ? this.props.style.width : 320;
            var reactTool;
            if (React.Component.isPrototypeOf(this.ToolClass)) {
                reactTool = React.createElement(this.ToolClass, {
                    key: "tool",
                    ref: function ref(c) {
                        _this2.tool = c;
                    },
                    toolPath: this.toolPath,
                    style: { height: toolHeight, width: toolWidth },
                    toolTip: this.toolTip
                });
            }
            var toolStyle = {
                width: toolWidth,
                height: toolHeight
            };
            return React.createElement(
                _ui2.default.VBox,
                { style: this.props.style, onMouseEnter: function onMouseEnter() {
                        _this2.titleBar.setState({ showControls: true });
                    }, onMouseLeave: function onMouseLeave() {
                        _this2.titleBar.setState({ showControls: false });_this2.toolTip.setState({ showToolTip: false });
                    }, onDragOver: this.props.onDragOver, onDragEnd: this.props.onDragEnd },
                React.createElement(TitleBar, { ref: function ref(c) {
                        _this2.titleBar = c;
                    }, onDragStart: this.props.onDragStart, titleBarHeight: this.titleBarHeight, title: this.title }),
                React.createElement(
                    "div",
                    { style: toolStyle, className: "weave-tool" },
                    React.createElement(
                        "div",
                        { style: { width: "100%", height: "100%", maxHeight: "100%" } },
                        reactTool
                    )
                ),
                React.createElement(_tooltip2.default, { ref: function ref(c) {
                        _this2.toolTip = c;
                    } })
            );
        }
    }, {
        key: "title",
        get: function get() {
            return this.tool ? this.tool.title : this.toolPath.getPath().pop();
        }
    }]);

    return WeaveTool;
}(React.Component);

var TitleBar = function (_React$Component2) {
    _inherits(TitleBar, _React$Component2);

    function TitleBar(props) {
        _classCallCheck(this, TitleBar);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(TitleBar).call(this, props));

        _this3.state = {
            showControls: false
        };
        return _this3;
    }

    _createClass(TitleBar, [{
        key: "render",
        value: function render() {
            var windowBar = {
                width: "100%",
                height: this.props.titleBarHeight,
                backgroundColor: this.state.showControls ? "#f8f8f8" : ""
            };
            var titleStyle = {
                cursor: "move",
                height: this.props.titleBarHeight,
                textAlign: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
                flex: 1,
                textOverflow: "ellipsis",
                paddingTop: "3"
            };
            var transitions = {
                visibility: this.state.showControls ? "visible" : "hidden",
                opacity: this.state.showControls ? 0.7 : 0,
                transition: this.state.showControls ? "visibiliy 0s 0.1s, opacity 0.1s linear" : "visibility 0s 0.1s, opacity 0.1s linear"
            };
            var leftControls = {
                marginLeft: 5,
                marginTop: 2,
                width: 20
            };
            var rightControls = {
                marginTop: 2,
                width: 38
            };
            _StandardLib2.default.merge(leftControls, transitions);
            _StandardLib2.default.merge(rightControls, transitions);
            return React.createElement(
                _ui2.default.HBox,
                { ref: "header", style: windowBar, draggable: true, onDragStart: this.props.onDragStart },
                React.createElement(
                    "span",
                    { style: titleStyle, className: "weave-panel" },
                    this.props.title
                )
            );
        }
    }]);

    return TitleBar;
}(React.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2VhdmVUb29sLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyY3RzL1dlYXZlVG9vbC50c3giXSwibmFtZXMiOlsicmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24iLCJnZXRUb29sSW1wbGVtZW50YXRpb24iLCJXZWF2ZVRvb2wiLCJXZWF2ZVRvb2wuY29uc3RydWN0b3IiLCJXZWF2ZVRvb2wuY29tcG9uZW50RGlkTW91bnQiLCJXZWF2ZVRvb2wudGl0bGUiLCJXZWF2ZVRvb2wucmVuZGVyIiwiVGl0bGVCYXIiLCJUaXRsZUJhci5jb25zdHJ1Y3RvciIsIlRpdGxlQmFyLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQU9ZLEFBQUssQUFBTSxBQUFPLEFBRXZCLEFBQUUsQUFBTSxBQUFlLEFBRXZCLEFBQVcsQUFBTSxBQUFxQixBQUl0QyxBQUFPLEFBQU0sQUFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHckMsSUFBTSxBQUFZLGVBQTZCLEFBQUUsQUFBQztBQUlsRCxtQkFBbUM7QUFDL0IsQUFBSyxXQUFFLEFBQUk7QUFDWCxBQUFNLFlBQUUsQUFBSTtBQUNaLEFBQU0sWUFBRSxBQUFNO0FBQ2QsQUFBVSxnQkFBRSxBQUFnQyxBQUMvQyxBQUFDLEFBRUY7Q0FQTSxBQUFZO29DQU95QixBQUFrQixhQUFFLEFBQWdCO0FBRTNFLEFBQVksaUJBQUMsQUFBVyxBQUFDLGVBQUcsQUFBTyxBQUFDLEFBQ3hDLEFBQUMsQUFFRDs7K0JBQXNDLEFBQXNCO0FBRTNELFFBQUksQUFBVyxBQUFDO0FBQ2hCLEFBQUUsQUFBQyxRQUFDLE9BQU8sQUFBSyxVQUFLLEFBQVEsQUFBQztBQUU3QixBQUFJLGVBQUcsQUFBSyxBQUFDLEFBQ2QsQUFBQyxBQUNELEFBQUksTUFISixBQUFDO1dBSUQsQUFBQztBQUNBLFlBQUksQUFBSSxPQUFhLEFBQWtCLEFBQUM7QUFDeEMsQUFBSSxlQUFHLEFBQUksS0FBQyxBQUFPLEFBQUUsQUFBQztB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QzthQUhFLEFBQWE7QUFLakIsQUFBVyxrQ0FBQyxBQUFLLE1BQUMsQUFBWSxjQUFFLEFBQVcsQUFBQyxBQUFDO0FBQzdDLEFBQVcsa0NBQUMsQUFBSyxNQUFDLEFBQWEsZUFBRSxBQUFXLEFBQUMsQUFBQztBQUU5QyxBQUFNOzZCQUNFLEFBQUk7a0JBQUMsQUFBRyxLQUFDLEFBQVEsVUFBQyxBQUFLLEFBQUMsT0FBQyxBQUFTLEFBQUMsV0FBQyxBQUFTLEFBQUMsV0FBQyxBQUFJLEFBQUMsTUFBQyxBQUFXLEFBQUMsYUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsQUFBQyxBQUM3RixBQUdBO2dCQUFBLEFBQUMsQUFBSTs7c0JBQUMsQUFBSyxBQUFDLE9BQUMsQUFBVSxBQUFDLFlBQUMsQUFBUyxXQUFDLEFBQWEsQUFBQztvQkFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssQUFBQyxBQUFFLEFBQUksQUFDekUsQUFRQSxBQUFFLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFDYixBQUFDLEFBQ04sQUFBQyxBQUNMLEFBQUM7aUJBaEJXLEFBQUMsQUFBRTs7Ozs7O0VBL0NRLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC1kb20uZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC12ZW5kb3ItcHJlZml4L3JlYWN0LXZlbmRvci1wcmVmaXguZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvcmVhY3QtYm9vdHN0cmFwL3JlYWN0LWJvb3RzdHJhcC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IHVpIGZyb20gXCIuL3JlYWN0LXVpL3VpXCI7XG5pbXBvcnQgKiBhcyBWZW5kb3JQcmVmaXggZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCBTdGFuZGFyZExpYiBmcm9tIFwiLi91dGlscy9TdGFuZGFyZExpYlwiO1xuaW1wb3J0IHtHbHlwaGljb259IGZyb20gXCJyZWFjdC1ib290c3RyYXBcIjtcbmltcG9ydCB7Q1NTUHJvcGVydGllc30gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge0lWaXNUb29sLCBJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlfSBmcm9tIFwiLi90b29scy9JVmlzVG9vbFwiO1xuaW1wb3J0IFRvb2xUaXAgZnJvbSBcIi4vdG9vbHMvdG9vbHRpcFwiO1xuaW1wb3J0IHtJVG9vbFRpcFByb3BzLCBJVG9vbFRpcFN0YXRlfSBmcm9tIFwiLi90b29scy90b29sdGlwXCI7XG5cbmNvbnN0IHRvb2xSZWdpc3RyeTp7W25hbWU6c3RyaW5nXTogRnVuY3Rpb259ID0ge307XG5cbmRlY2xhcmUgdHlwZSBJVG9vbFRpcCA9IFJlYWN0LkNvbXBvbmVudDxJVG9vbFRpcFByb3BzLCBJVG9vbFRpcFN0YXRlPjtcblxuY29uc3QgZ3JhYmJlclN0eWxlOkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgd2lkdGg6IFwiMTZcIixcbiAgICBoZWlnaHQ6IFwiMTZcIixcbiAgICBjdXJzb3I6IFwibW92ZVwiLFxuICAgIGJhY2tncm91bmQ6IFwidXJsKGh0dHA6Ly9wbGFjZWhvbGQuaXQvMzJ4MzIpXCJcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbihhc0NsYXNzTmFtZTpzdHJpbmcsIGpzQ2xhc3M6RnVuY3Rpb24pXG57XG4gICAgdG9vbFJlZ2lzdHJ5W2FzQ2xhc3NOYW1lXSA9IGpzQ2xhc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb29sSW1wbGVtZW50YXRpb24ocGFyYW06c3RyaW5nfFdlYXZlUGF0aCk6RnVuY3Rpb25cbntcblx0dmFyIHR5cGU6c3RyaW5nO1xuXHRpZiAodHlwZW9mIHBhcmFtID09PSAnc3RyaW5nJylcblx0e1xuXHRcdHR5cGUgPSBwYXJhbTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHR2YXIgcGF0aDpXZWF2ZVBhdGggPSBwYXJhbSBhcyBXZWF2ZVBhdGg7XG5cdFx0dHlwZSA9IHBhdGguZ2V0VHlwZSgpO1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpFeHRlcm5hbFRvb2xcIiAmJiBwYXRoLmdldFR5cGUoXCJ0b29sQ2xhc3NcIikpXG4gICAgICAgICAgICB0eXBlID0gcGF0aC5nZXRTdGF0ZShcInRvb2xDbGFzc1wiKTtcbiAgICAgICAgaWYgKHR5cGUgPT09IFwid2VhdmVqcy5jb3JlLkxpbmthYmxlSGFzaE1hcFwiICYmIHBhdGguZ2V0VHlwZShcImNsYXNzXCIpKVxuICAgICAgICAgICAgdHlwZSA9IHBhdGguZ2V0U3RhdGUoXCJjbGFzc1wiKTtcblx0fVxuICAgIHJldHVybiB0b29sUmVnaXN0cnlbdHlwZV07XG59XG5cbmludGVyZmFjZSBJV2VhdmVUb29sUHJvcHMgZXh0ZW5kcyBSZWFjdC5Qcm9wczxXZWF2ZVRvb2w+IHtcbiAgICB0b29sUGF0aDpXZWF2ZVBhdGg7XG4gICAgdG9vbENsYXNzPzpzdHJpbmc7XG4gICAgc3R5bGU6Q1NTUHJvcGVydGllcztcbiAgICBvbkRyYWdTdGFydDpSZWFjdC5Nb3VzZUV2ZW50O1xuICAgIG9uRHJhZ0VuZDpSZWFjdC5Nb3VzZUV2ZW50O1xuICAgIG9uRHJhZ092ZXI6UmVhY3QuTW91c2VFdmVudDtcbn1cblxuaW50ZXJmYWNlIElXZWF2ZVRvb2xTdGF0ZSB7XG5cbn1cblxuZXhwb3J0IGNsYXNzIFdlYXZlVG9vbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJV2VhdmVUb29sUHJvcHMsIElXZWF2ZVRvb2xTdGF0ZT4ge1xuXG4gICAgcHJpdmF0ZSB0b29sUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSBUb29sQ2xhc3M6YW55O1xuICAgIHByaXZhdGUgdG9vbDpJVmlzVG9vbDtcbiAgICBwcml2YXRlIHRvb2xXaWR0aDpudW1iZXI7XG4gICAgcHJpdmF0ZSB0b29sSGVpZ2h0Om51bWJlcjtcbiAgICBwcml2YXRlIHRvb2xUaXA6SVRvb2xUaXA7XG4gICAgcHJpdmF0ZSB0aXRsZUJhckhlaWdodDogbnVtYmVyO1xuICAgIHByaXZhdGUgdGl0bGVCYXI6UmVhY3QuQ29tcG9uZW50PElUaXRsZUJhclByb3BzLCBJVGl0bGVCYXJTdGF0ZT47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJV2VhdmVUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoID0gdGhpcy5wcm9wcy50b29sUGF0aDtcbiAgICAgICAgdGhpcy5Ub29sQ2xhc3MgPSBnZXRUb29sSW1wbGVtZW50YXRpb24odGhpcy50b29sUGF0aCB8fCB0aGlzLnByb3BzLnRvb2xDbGFzcyk7XG4gICAgICAgIHRoaXMudGl0bGVCYXJIZWlnaHQgPSAyNTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOnZvaWQge1xuICAgICAgICAvLyBpZiAodGhpcy50b29sUGF0aCkge1xuICAgICAgICAvLyAgICAgdGhpcy50b29sUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmZvcmNlVXBkYXRlKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIGdldCB0aXRsZSgpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvb2wgPyB0aGlzLnRvb2wudGl0bGUgOiB0aGlzLnRvb2xQYXRoLmdldFBhdGgoKS5wb3AoKTtcbiAgICB9XG5cblx0Ly9UT0RPIC0gd2Ugc2hvdWxkbid0IGhhdmUgdG8gcmVuZGVyIHR3aWNlIHRvIHNldCB0aGUgdG9vbHRpcCBvZiB0aGUgdG9vbFxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHRvb2xIZWlnaHQ6bnVtYmVyID0gdGhpcy5wcm9wcy5zdHlsZSA/IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0IC0gdGhpcy50aXRsZUJhckhlaWdodCA6IDMyMDtcbiAgICAgICAgdmFyIHRvb2xXaWR0aDpudW1iZXIgPSB0aGlzLnByb3BzLnN0eWxlID8gdGhpcy5wcm9wcy5zdHlsZS53aWR0aCA6IDMyMDtcblxuICAgICAgICB2YXIgcmVhY3RUb29sOmFueTtcbiAgICAgICAgaWYgKFJlYWN0LkNvbXBvbmVudC5pc1Byb3RvdHlwZU9mKHRoaXMuVG9vbENsYXNzKSkge1xuICAgICAgICAgICAgcmVhY3RUb29sID0gUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLlRvb2xDbGFzcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwidG9vbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IChjOklWaXNUb29sKSA9PiB7IHRoaXMudG9vbCA9IGM7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYXRoOiB0aGlzLnRvb2xQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBoZWlnaHQ6IHRvb2xIZWlnaHQsIHdpZHRoOiB0b29sV2lkdGggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogdGhpcy50b29sVGlwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0b29sU3R5bGU6Q1NTUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0b29sV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRvb2xIZWlnaHRcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHVpLlZCb3ggc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4geyB0aGlzLnRpdGxlQmFyLnNldFN0YXRlKHsgc2hvd0NvbnRyb2xzOiB0cnVlIH0pOyB9fVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHsgdGhpcy50aXRsZUJhci5zZXRTdGF0ZSh7IHNob3dDb250cm9sczogZmFsc2UgfSk7IHRoaXMudG9vbFRpcC5zZXRTdGF0ZSh7IHNob3dUb29sVGlwOiBmYWxzZSB9KTsgfX1cbiAgICAgICAgICAgICAgICAgICAgb25EcmFnT3Zlcj17dGhpcy5wcm9wcy5vbkRyYWdPdmVyfVxuICAgICAgICAgICAgICAgICAgICBvbkRyYWdFbmQ9e3RoaXMucHJvcHMub25EcmFnRW5kfT5cbiAgICAgICAgICAgICAgICA8VGl0bGVCYXIgcmVmPXsoYzpSZWFjdC5Db21wb25lbnQ8SVRpdGxlQmFyUHJvcHMsIElUaXRsZUJhclN0YXRlPikgPT4geyB0aGlzLnRpdGxlQmFyID0gYzsgfSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uRHJhZ1N0YXJ0PXt0aGlzLnByb3BzLm9uRHJhZ1N0YXJ0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZUJhckhlaWdodD17dGhpcy50aXRsZUJhckhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt0b29sU3R5bGV9IGNsYXNzTmFtZT1cIndlYXZlLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3t3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIsIG1heEhlaWdodDogXCIxMDAlXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWN0VG9vbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPFRvb2xUaXAgcmVmPXsoYzpSZWFjdC5Db21wb25lbnQ8SVRvb2xUaXBQcm9wcywgSVRvb2xUaXBTdGF0ZT4pID0+IHsgdGhpcy50b29sVGlwID0gYyB9fS8+XG4gICAgICAgICAgICA8L3VpLlZCb3g+KTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJVGl0bGVCYXJQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFRpdGxlQmFyPiB7XG4gICAgb25EcmFnU3RhcnQ6UmVhY3QuTW91c2VFdmVudDtcbiAgICB0aXRsZUJhckhlaWdodDpudW1iZXI7XG4gICAgdGl0bGU6c3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVRpdGxlQmFyU3RhdGUge1xuICAgIHNob3dDb250cm9sczogYm9vbGVhbjtcbn1cblxuY2xhc3MgVGl0bGVCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVRpdGxlQmFyUHJvcHMsIElUaXRsZUJhclN0YXRlPiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJVGl0bGVCYXJQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93Q29udHJvbHM6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHdpbmRvd0JhcjpDU1NQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnRpdGxlQmFySGVpZ2h0LFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLnNob3dDb250cm9scyA/IFwiI2Y4ZjhmOFwiOiBcIlwiXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHRpdGxlU3R5bGU6Q1NTUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIGN1cnNvcjogXCJtb3ZlXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMudGl0bGVCYXJIZWlnaHQsXG4gICAgICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBvdmVyZmxvdzogXCJoaWRkZW5cIixcbiAgICAgICAgICAgIHdoaXRlU3BhY2U6IFwibm93cmFwXCIsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgdGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIsXG4gICAgICAgICAgICBwYWRkaW5nVG9wOiBcIjNcIlxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0cmFuc2l0aW9uczpDU1NQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgdmlzaWJpbGl0eTogdGhpcy5zdGF0ZS5zaG93Q29udHJvbHMgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCIsXG4gICAgICAgICAgICBvcGFjaXR5OiB0aGlzLnN0YXRlLnNob3dDb250cm9scyA/IDAuNyA6IDAsXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnN0YXRlLnNob3dDb250cm9scyA/IFwidmlzaWJpbGl5IDBzIDAuMXMsIG9wYWNpdHkgMC4xcyBsaW5lYXJcIiA6IFwidmlzaWJpbGl0eSAwcyAwLjFzLCBvcGFjaXR5IDAuMXMgbGluZWFyXCJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGVmdENvbnRyb2xzOkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICBtYXJnaW5MZWZ0OiA1LFxuICAgICAgICAgICAgbWFyZ2luVG9wOiAyLFxuICAgICAgICAgICAgd2lkdGg6IDIwXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHJpZ2h0Q29udHJvbHM6Q1NTUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIG1hcmdpblRvcDogMixcbiAgICAgICAgICAgIHdpZHRoOiAzOFxuICAgICAgICB9O1xuXG4gICAgICAgIFN0YW5kYXJkTGliLm1lcmdlKGxlZnRDb250cm9scywgdHJhbnNpdGlvbnMpO1xuICAgICAgICBTdGFuZGFyZExpYi5tZXJnZShyaWdodENvbnRyb2xzLCB0cmFuc2l0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPHVpLkhCb3ggcmVmPVwiaGVhZGVyXCIgc3R5bGU9e3dpbmRvd0Jhcn0gZHJhZ2dhYmxlPXt0cnVlfSBvbkRyYWdTdGFydD17dGhpcy5wcm9wcy5vbkRyYWdTdGFydH0+XG4gICAgICAgICAgICB7Lyo8dWkuSEJveCBzdHlsZT17VmVuZG9yUHJlZml4LnByZWZpeCh7c3R5bGVzOiBsZWZ0Q29udHJvbHN9KS5zdHlsZXN9PlxuICAgICAgICAgICAgPEdseXBoaWNvbiBnbHlwaD1cImNvZ1wiLz5cbiAgICAgICAgICAgIDwvdWkuSEJveD4qL31cbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt0aXRsZVN0eWxlfSBjbGFzc05hbWU9XCJ3ZWF2ZS1wYW5lbFwiPnt0aGlzLnByb3BzLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIHsvKjx1aS5IQm94IHN0eWxlPXtWZW5kb3JQcmVmaXgucHJlZml4KHtzdHlsZXM6IHJpZ2h0Q29udHJvbHN9KS5zdHlsZXN9PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17e21hcmdpblJpZ2h0OiA1fX0+XG4gICAgICAgICAgICA8R2x5cGhpY29uIGdseXBoPVwidW5jaGVja2VkXCIvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7bWFyZ2luUmlnaHQ6IDV9fT5cbiAgICAgICAgICAgIDxHbHlwaGljb24gZ2x5cGg9XCJyZW1vdmVcIi8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvdWkuSEJveD4qL31cbiAgICAgICAgICAgIDwvdWkuSEJveD5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=