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

var _Layout = require("./react-flexible-layout/Layout");

var _Layout2 = _interopRequireDefault(_Layout);

var _weaveC3Barchart = require("./tools/weave-c3-barchart");

var _weaveC3Barchart2 = _interopRequireDefault(_weaveC3Barchart);

var _weaveC3Scatterplot = require("./tools/weave-c3-scatterplot");

var _weaveC3Scatterplot2 = _interopRequireDefault(_weaveC3Scatterplot);

var _weaveC3Colorlegend = require("./tools/weave-c3-colorlegend");

var _weaveC3Colorlegend2 = _interopRequireDefault(_weaveC3Colorlegend);

var _weaveC3Barchartlegend = require("./tools/weave-c3-barchartlegend");

var _weaveC3Barchartlegend2 = _interopRequireDefault(_weaveC3Barchartlegend);

var _weaveC3Linechart = require("./tools/weave-c3-linechart");

var _weaveC3Linechart2 = _interopRequireDefault(_weaveC3Linechart);

var _weaveC3Piechart = require("./tools/weave-c3-piechart");

var _weaveC3Piechart2 = _interopRequireDefault(_weaveC3Piechart);

var _weaveC3Histogram = require("./tools/weave-c3-histogram");

var _weaveC3Histogram2 = _interopRequireDefault(_weaveC3Histogram);

var _weaveSessionStateMenu = require("./tools/weave-session-state-menu");

var _weaveSessionStateMenu2 = _interopRequireDefault(_weaveSessionStateMenu);

var _OpenLayersMapTool = require("./tools/OpenLayersMapTool");

var _OpenLayersMapTool2 = _interopRequireDefault(_OpenLayersMapTool);

var _weaveReactTable = require("./tools/weave-react-table");

var _weaveReactTable2 = _interopRequireDefault(_weaveReactTable);

var _DataFilterTool = require("./tools/DataFilterTool");

var _DataFilterTool2 = _interopRequireDefault(_DataFilterTool);

var _WeaveTool = require("./WeaveTool");

var _ToolOverlay = require("./ToolOverlay");

var _ToolOverlay2 = _interopRequireDefault(_ToolOverlay);

var _StandardLib = require("./utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

// Temporary solution
// because typescript removes
// unused imports
var v1 = [_weaveC3Barchart2.default, _weaveC3Scatterplot2.default, _weaveC3Colorlegend2.default, _weaveC3Barchartlegend2.default, _weaveC3Linechart2.default, _weaveC3Piechart2.default, _weaveC3Histogram2.default, _weaveSessionStateMenu2.default, _OpenLayersMapTool2.default, _weaveReactTable2.default, _DataFilterTool2.default];

var LAYOUT = "Layout";
var LEFT = "left";
var RIGHT = "right";
var TOP = "top";
var BOTTOM = "bottom";
var VERTICAL = "vertical";
var HORIZONTAL = "horizontal";
var TOOLOVERLAY = "tooloverlay";

var WeaveLayoutManager = function (_React$Component) {
    _inherits(WeaveLayoutManager, _React$Component);

    function WeaveLayoutManager(props) {
        _classCallCheck(this, WeaveLayoutManager);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveLayoutManager).call(this, props));

        _this.weave = _this.props.weave || new Weave();
        _this.weave.path(LAYOUT).request("FlexibleLayout");
        _this.margin = 8;
        _this.throttledForceUpdate = _.throttle(function () {
            _this.forceUpdate();
        }, 30);
        _this.throttledForceUpdateTwice = _.throttle(function () {
            _this.dirty = true;_this.forceUpdate();
        }, 30);
        return _this;
    }

    _createClass(WeaveLayoutManager, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.savePrevClientSize();
            window.addEventListener("resize", this.throttledForceUpdateTwice);
            this.weave.root.childListCallbacks.addGroupedCallback(this, this.throttledForceUpdate, true);
            this.weave.path(LAYOUT).addCallback(this, this.throttledForceUpdate, true);
            this.weave.path(LAYOUT).state(this.simplifyState(this.weave.path(LAYOUT).getState()));
            weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            window.removeEventListener("resize", this.throttledForceUpdate);
            Weave.dispose(this);
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.savePrevClientSize();
            if (Weave.detectChange(this, this.weave.getObject(LAYOUT)) || this.dirty) {
                // dirty flag to trigger render on window resize
                this.dirty = false;
                this.throttledForceUpdate();
            }
        }
    }, {
        key: "frameHandler",
        value: function frameHandler() {
            var node = ReactDOM.findDOMNode(this);
            if (this.prevClientWidth != node.clientWidth || this.prevClientHeight != node.clientHeight) this.throttledForceUpdateTwice();
            this.savePrevClientSize();
        }
    }, {
        key: "savePrevClientSize",
        value: function savePrevClientSize() {
            var node = ReactDOM.findDOMNode(this);
            this.prevClientWidth = node.clientWidth;
            this.prevClientHeight = node.clientHeight;
        }
    }, {
        key: "saveState",
        value: function saveState(newState) {
            newState = this.simplifyState(newState);
            newState.flex = 1;
            this.weave.path(LAYOUT).state(newState);
        }
    }, {
        key: "onDragStart",
        value: function onDragStart(id, event) {
            this.toolDragged = id;
            var toolRef = id[0]; // toolName as used in the ref for the weave tool.
            var element = ReactDOM.findDOMNode(this.refs[toolRef]);
            // hack because dataTransfer doesn't exist on type event
            event.dataTransfer.setDragImage(element, 0, 0);
            event.dataTransfer.setData('text/html', null);
        }
    }, {
        key: "hideOverlay",
        value: function hideOverlay() {
            var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);
            toolOverlayStyle.visibility = "hidden";
            toolOverlayStyle.left = toolOverlayStyle.top = toolOverlayStyle.width = toolOverlayStyle.height = 0;
            this.refs[TOOLOVERLAY].setState({
                style: toolOverlayStyle
            });
        }
    }, {
        key: "onDragEnd",
        value: function onDragEnd() {
            if (this.toolDragged && this.toolOver) {
                this.updateLayout(this.toolDragged, this.toolOver, this.dropZone);
                this.toolDragged = null;
                this.dropZone = null;
                this.hideOverlay();
            }
        }
    }, {
        key: "onDragOver",
        value: function onDragOver(toolOver, event) {
            if (!this.toolDragged) {
                return;
            }
            if (_.isEqual(this.toolDragged, toolOver)) {
                // hide the overlay if hovering over the tool being dragged
                this.toolOver = null;
                this.hideOverlay();
                return;
            }
            var toolNode = this.refs[LAYOUT].getDOMNodeFromId(toolOver);
            var toolNodePosition = toolNode.getBoundingClientRect();
            var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);
            var dropZone = this.getDropZone(toolOver, event);
            toolOverlayStyle.left = toolNodePosition.left;
            toolOverlayStyle.top = toolNodePosition.top;
            toolOverlayStyle.width = toolNodePosition.width;
            toolOverlayStyle.height = toolNodePosition.height;
            toolOverlayStyle.visibility = "visible";
            if (dropZone === LEFT) {
                toolOverlayStyle.width = toolNodePosition.width / 2;
            } else if (dropZone === RIGHT) {
                toolOverlayStyle.left = toolNodePosition.left + toolNodePosition.width / 2;
                toolOverlayStyle.width = toolNodePosition.width / 2;
            } else if (dropZone === BOTTOM) {
                toolOverlayStyle.top = toolNodePosition.top + toolNodePosition.height / 2;
                toolOverlayStyle.height = toolNodePosition.height / 2;
            } else if (dropZone === TOP) {
                toolOverlayStyle.height = toolNodePosition.height / 2;
            }
            if (dropZone !== this.dropZone || !_.isEqual(toolOver, this.toolOver)) {
                this.refs[TOOLOVERLAY].setState({
                    style: toolOverlayStyle
                });
            }
            this.dropZone = dropZone;
            this.toolOver = toolOver;
        }
    }, {
        key: "getDropZone",
        value: function getDropZone(id, event) {
            if (this.toolDragged) {
                if (!_.isEqual(this.toolDragged, id)) {
                    var toolNode = this.refs[LAYOUT].getDOMNodeFromId(id);
                    var toolNodePosition = toolNode.getBoundingClientRect();
                    var center = {
                        x: (toolNodePosition.right - toolNodePosition.left) / 2,
                        y: (toolNodePosition.bottom - toolNodePosition.top) / 2
                    };
                    var mousePosRelativeToCenter = {
                        x: event.clientX - (toolNodePosition.left + center.x),
                        y: event.clientY - (toolNodePosition.top + center.y)
                    };
                    var mouseNorm = {
                        x: mousePosRelativeToCenter.x / (toolNodePosition.width / 2),
                        y: mousePosRelativeToCenter.y / (toolNodePosition.height / 2)
                    };
                    var mousePolarCoord = {
                        r: Math.sqrt(mouseNorm.x * mouseNorm.x + mouseNorm.y * mouseNorm.y),
                        theta: Math.atan2(mouseNorm.y, mouseNorm.x)
                    };
                    var zones = [RIGHT, BOTTOM, LEFT, TOP];
                    var zoneIndex = Math.round(mousePolarCoord.theta / (2 * Math.PI) * 4 + 4) % 4;
                    if (mousePolarCoord.r < 0.34) return "center";else return zones[zoneIndex];
                }
            }
        }
    }, {
        key: "simplifyState",
        value: function simplifyState(state) {
            if (!state) return {};
            var children = state.children;
            if (!children) return state;
            if (children.length === 1) return this.simplifyState(children[0]);
            var simpleChildren = [];
            for (var i = 0; i < children.length; i++) {
                var child = this.simplifyState(children[i]);
                if (child.children && child.direction === state.direction) {
                    var childChildren = child.children;
                    for (var ii = 0; ii < childChildren.length; ii++) {
                        var childChild = childChildren[ii];
                        childChild.flex *= child.flex;
                        simpleChildren.push(childChild);
                    }
                } else {
                    simpleChildren.push(child);
                }
            }
            state.children = simpleChildren;
            var totalSizeChildren = _.sum(_.map(state.children, "flex"));
            //Scale flex values between 0 and 1 so they sum to 1, avoiding an apparent
            //flex bug where space is lost if sum of flex values is less than 1.
            for (var i = 0; i < state.children.length; i++) {
                state.children[i].flex = _StandardLib2.default.normalize(state.children[i].flex, 0, totalSizeChildren);
            }return state;
        }
    }, {
        key: "updateLayout",
        value: function updateLayout(toolDragged, toolDroppedOn, dropZone) {
            if (!this.toolDragged || !this.toolOver || !this.dropZone) return;
            var newState = _.cloneDeep(this.weave.path(LAYOUT).getState());
            var src = _StandardLib2.default.findDeep(newState, { id: toolDragged });
            var dest = _StandardLib2.default.findDeep(newState, { id: toolDroppedOn });
            if (_.isEqual(src.id, dest.id)) return;
            if (dropZone === "center") {
                var srcId = src.id;
                src.id = dest.id;
                dest.id = srcId;
            } else {
                if (weavejs.WeaveAPI.Locale.reverseLayout) {
                    if (dropZone === LEFT) dropZone = RIGHT;else if (dropZone === RIGHT) dropZone = LEFT;
                }
                var srcParentArray = _StandardLib2.default.findDeep(newState, function (obj) {
                    return Array.isArray(obj) && obj.indexOf(src) >= 0;
                });
                srcParentArray.splice(srcParentArray.indexOf(src), 1);
                delete dest.id;
                dest.direction = dropZone === TOP || dropZone === BOTTOM ? VERTICAL : HORIZONTAL;
                dest.children = [{
                    id: toolDragged,
                    flex: 0.5
                }, {
                    id: toolDroppedOn,
                    flex: 0.5
                }];
                if (dropZone === BOTTOM || dropZone === RIGHT) {
                    dest.children.reverse();
                }
            }
            this.saveState(newState);
        }
    }, {
        key: "getIdPaths",
        value: function getIdPaths(state, output) {
            if (!output) output = [];
            if (state && state.id) output.push(this.weave.path(state.id));
            if (state && state.children) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = state.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        this.getIdPaths(child, output);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }return output;
        }
    }, {
        key: "generateLayoutState",
        value: function generateLayoutState(paths) {
            // temporary solution - needs improvement
            return this.simplifyState({
                flex: 1,
                direction: HORIZONTAL,
                children: paths.map(function (path) {
                    return { id: path.getPath(), flex: 1 };
                })
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var newState = this.weave.path(LAYOUT).getState();
            var children = [];
            var paths;
            var path;
            if (!newState) {
                newState = this.generateLayoutState(this.weave.path().getChildren().filter(function (path) {
                    return (0, _WeaveTool.getToolImplementation)(path);
                }));
                //TODO - generate layout state from
                this.weave.path(LAYOUT).state(newState);
            }
            paths = this.getIdPaths(newState);
            var rect;
            if (this.element) rect = this.element.getBoundingClientRect();
            for (var i = 0; i < paths.length; i++) {
                path = paths[i];
                var toolName = path.getPath()[0];
                var node;
                var toolRect;
                var toolPosition;
                if (this.refs[LAYOUT] && rect) {
                    node = this.refs[LAYOUT].getDOMNodeFromId(path.getPath());
                    if (node) {
                        toolRect = node.getBoundingClientRect();
                        toolPosition = {
                            top: toolRect.top - rect.top,
                            left: toolRect.left - rect.left,
                            width: toolRect.right - toolRect.left,
                            height: toolRect.bottom - toolRect.top,
                            position: "absolute"
                        };
                    }
                }
                children.push(React.createElement(_WeaveTool.WeaveTool, { ref: toolName, key: toolName, toolPath: path, style: toolPosition, onDragOver: this.onDragOver.bind(this, path.getPath()), onDragStart: this.onDragStart.bind(this, path.getPath()), onDragEnd: this.onDragEnd.bind(this) }));
            }
            return React.createElement(
                "div",
                { ref: function ref(elt) {
                        _this2.element = elt;
                    }, style: _StandardLib2.default.merge({ display: "flex", position: "relative", overflow: "hidden" }, this.props.style) },
                React.createElement(_Layout2.default, { key: LAYOUT, ref: LAYOUT, state: _.cloneDeep(newState), onStateChange: this.saveState.bind(this) }),
                children,
                React.createElement(_ToolOverlay2.default, { ref: TOOLOVERLAY })
            );
        }
    }]);

    return WeaveLayoutManager;
}(React.Component);

exports.default = WeaveLayoutManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2VhdmVMYXlvdXRNYW5hZ2VyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyY3RzL1dlYXZlTGF5b3V0TWFuYWdlci50c3giXSwibmFtZXMiOlsiV2VhdmVMYXlvdXRNYW5hZ2VyIiwiV2VhdmVMYXlvdXRNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiV2VhdmVMYXlvdXRNYW5hZ2VyLmNvbXBvbmVudERpZE1vdW50IiwiV2VhdmVMYXlvdXRNYW5hZ2VyLmNvbXBvbmVudFdpbGxVbm1vdW50IiwiV2VhdmVMYXlvdXRNYW5hZ2VyLmNvbXBvbmVudERpZFVwZGF0ZSIsIldlYXZlTGF5b3V0TWFuYWdlci5mcmFtZUhhbmRsZXIiLCJXZWF2ZUxheW91dE1hbmFnZXIuc2F2ZVByZXZDbGllbnRTaXplIiwiV2VhdmVMYXlvdXRNYW5hZ2VyLnNhdmVTdGF0ZSIsIldlYXZlTGF5b3V0TWFuYWdlci5vbkRyYWdTdGFydCIsIldlYXZlTGF5b3V0TWFuYWdlci5oaWRlT3ZlcmxheSIsIldlYXZlTGF5b3V0TWFuYWdlci5vbkRyYWdFbmQiLCJXZWF2ZUxheW91dE1hbmFnZXIub25EcmFnT3ZlciIsIldlYXZlTGF5b3V0TWFuYWdlci5nZXREcm9wWm9uZSIsIldlYXZlTGF5b3V0TWFuYWdlci5zaW1wbGlmeVN0YXRlIiwiV2VhdmVMYXlvdXRNYW5hZ2VyLnVwZGF0ZUxheW91dCIsIldlYXZlTGF5b3V0TWFuYWdlci5nZXRJZFBhdGhzIiwiV2VhdmVMYXlvdXRNYW5hZ2VyLmdlbmVyYXRlTGF5b3V0U3RhdGUiLCJXZWF2ZUxheW91dE1hbmFnZXIucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBS1ksQUFBSyxBQUFNLEFBQU8sQUFDdkI7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBVyxBQUM5Qjs7OztJQUFLLEFBQUMsQUFBTSxBQUFRLEFBQ3BCLEFBQU0sQUFBTSxBQUFnQyxBQUU1QyxBQUFlLEFBQU0sQUFBMkIsQUFDaEQsQUFBa0IsQUFBTSxBQUE4QixBQUN0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QUFBQyxPQUFDLEFBQUMsRUFBQyxBQUFTLFVBQUMsQUFBUSxBQUFDLEFBQUMsV0FBQyxBQUFhLEFBQUMsZUFBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxBQUN6RztnQkFBQyxBQUFRLEFBQ1Q7Z0JBQUEsQUFBQyxBQUFXLDZDQUFDLEFBQUcsQUFBQyxLQUFDLEFBQVcsQUFBQyxBQUMvQixBQUFFLEFBQUcsQUFBQyxBQUNOLEFBQUMsQUFDSCxBQUFDLEFBQ0YsQUFBQyxBQUNEOzs7Ozs7RUE5WGlDLEFBQUssTUFBQyxBQUFTOztrQkE4WGpDLEFBQWtCLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvcmVhY3QvcmVhY3QtZG9tLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgTGF5b3V0IGZyb20gXCIuL3JlYWN0LWZsZXhpYmxlLWxheW91dC9MYXlvdXRcIjtcbmltcG9ydCB7TGF5b3V0U3RhdGV9IGZyb20gXCIuL3JlYWN0LWZsZXhpYmxlLWxheW91dC9MYXlvdXRcIjtcbmltcG9ydCBXZWF2ZUMzQmFyY2hhcnQgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtYmFyY2hhcnRcIjtcbmltcG9ydCBXZWF2ZUMzU2NhdHRlclBsb3QgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtc2NhdHRlcnBsb3RcIjtcbmltcG9ydCBXZWF2ZUMzQ29sb3JMZWdlbmQgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtY29sb3JsZWdlbmRcIjtcbmltcG9ydCBXZWF2ZUMzQmFyQ2hhcnRMZWdlbmQgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtYmFyY2hhcnRsZWdlbmRcIlxuaW1wb3J0IFdlYXZlQzNMaW5lQ2hhcnQgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtbGluZWNoYXJ0XCI7XG5pbXBvcnQgV2VhdmVDM1BpZUNoYXJ0IGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLXBpZWNoYXJ0XCI7XG5pbXBvcnQgV2VhdmVDM0hpc3RvZ3JhbSBmcm9tIFwiLi90b29scy93ZWF2ZS1jMy1oaXN0b2dyYW1cIjtcbmltcG9ydCBTZXNzaW9uU3RhdGVNZW51VG9vbCBmcm9tIFwiLi90b29scy93ZWF2ZS1zZXNzaW9uLXN0YXRlLW1lbnVcIjtcbmltcG9ydCBXZWF2ZU9wZW5MYXllcnNNYXAgZnJvbSBcIi4vdG9vbHMvT3BlbkxheWVyc01hcFRvb2xcIjtcbmltcG9ydCBXZWF2ZVJlYWN0VGFibGUgZnJvbSBcIi4vdG9vbHMvd2VhdmUtcmVhY3QtdGFibGVcIjtcbmltcG9ydCBEYXRhRmlsdGVyVG9vbCBmcm9tIFwiLi90b29scy9EYXRhRmlsdGVyVG9vbFwiO1xuXG4vLyBUZW1wb3Jhcnkgc29sdXRpb25cbi8vIGJlY2F1c2UgdHlwZXNjcmlwdCByZW1vdmVzXG4vLyB1bnVzZWQgaW1wb3J0c1xudmFyIHYxOmFueSA9IFtcblx0V2VhdmVDM0JhcmNoYXJ0LFxuXHRXZWF2ZUMzU2NhdHRlclBsb3QsXG5cdFdlYXZlQzNDb2xvckxlZ2VuZCxcblx0V2VhdmVDM0JhckNoYXJ0TGVnZW5kLFxuXHRXZWF2ZUMzTGluZUNoYXJ0LFxuXHRXZWF2ZUMzUGllQ2hhcnQsXG5cdFdlYXZlQzNIaXN0b2dyYW0sXG5cdFNlc3Npb25TdGF0ZU1lbnVUb29sLFxuXHRXZWF2ZU9wZW5MYXllcnNNYXAsXG5cdFdlYXZlUmVhY3RUYWJsZSxcblx0RGF0YUZpbHRlclRvb2xcbl07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5pbXBvcnQge1dlYXZlVG9vbCwgZ2V0VG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi9XZWF2ZVRvb2xcIjtcbmltcG9ydCBUb29sT3ZlcmxheSBmcm9tIFwiLi9Ub29sT3ZlcmxheVwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5jb25zdCBMQVlPVVQ6c3RyaW5nID0gXCJMYXlvdXRcIjtcblxuY29uc3QgTEVGVDpzdHJpbmcgPSBcImxlZnRcIjtcbmNvbnN0IFJJR0hUOnN0cmluZyA9IFwicmlnaHRcIjtcbmNvbnN0IFRPUDpzdHJpbmcgPSBcInRvcFwiO1xuY29uc3QgQk9UVE9NOnN0cmluZyA9IFwiYm90dG9tXCI7XG5jb25zdCBWRVJUSUNBTDpzdHJpbmcgPSBcInZlcnRpY2FsXCI7XG5jb25zdCBIT1JJWk9OVEFMOnN0cmluZyA9IFwiaG9yaXpvbnRhbFwiO1xuXG5jb25zdCBUT09MT1ZFUkxBWTpzdHJpbmcgPSBcInRvb2xvdmVybGF5XCI7XG5cbmRlY2xhcmUgdHlwZSBQb2ludCA9IHtcblx0eD86IG51bWJlcjtcblx0eT86IG51bWJlcjtcblx0cj86IG51bWJlcjtcblx0dGhldGE/OiBudW1iZXI7XG59O1xuXG5kZWNsYXJlIHR5cGUgUG9sYXJQb2ludCA9IHtcblx0eDogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG59O1xuXG5pbnRlcmZhY2UgSVdlYXZlTGF5b3V0TWFuYWdlclByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8V2VhdmVMYXlvdXRNYW5hZ2VyPlxue1xuXHR3ZWF2ZTogV2VhdmUsXG5cdHN0eWxlPzogYW55XG59XG5cbmludGVyZmFjZSBJV2VhdmVMYXlvdXRNYW5hZ2VyU3RhdGVcbntcblxufVxuXG5jbGFzcyBXZWF2ZUxheW91dE1hbmFnZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVdlYXZlTGF5b3V0TWFuYWdlclByb3BzLCBJV2VhdmVMYXlvdXRNYW5hZ2VyU3RhdGU+XG57XG5cdHByaXZhdGUgZWxlbWVudDpIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSB3ZWF2ZTpXZWF2ZTtcblx0cHJpdmF0ZSBtYXJnaW46bnVtYmVyO1xuXHRwcml2YXRlIGRpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgdG9vbERyYWdnZWQ6c3RyaW5nW107XG5cdHByaXZhdGUgdG9vbE92ZXI6c3RyaW5nW107XG5cdHByaXZhdGUgZHJvcFpvbmU6c3RyaW5nO1xuXHRwcml2YXRlIHByZXZDbGllbnRXaWR0aDpudW1iZXI7XG5cdHByaXZhdGUgcHJldkNsaWVudEhlaWdodDpudW1iZXI7XG5cdHByaXZhdGUgdGhyb3R0bGVkRm9yY2VVcGRhdGU6KCkgPT4gdm9pZDtcblx0cHJpdmF0ZSB0aHJvdHRsZWRGb3JjZVVwZGF0ZVR3aWNlOigpID0+IHZvaWQ7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6SVdlYXZlTGF5b3V0TWFuYWdlclByb3BzKVxuXHR7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMud2VhdmUgPSB0aGlzLnByb3BzLndlYXZlIHx8IG5ldyBXZWF2ZSgpO1xuXHRcdHRoaXMud2VhdmUucGF0aChMQVlPVVQpLnJlcXVlc3QoXCJGbGV4aWJsZUxheW91dFwiKTtcblx0XHR0aGlzLm1hcmdpbiA9IDg7XG5cdFx0dGhpcy50aHJvdHRsZWRGb3JjZVVwZGF0ZSA9IF8udGhyb3R0bGUoKCkgPT4geyB0aGlzLmZvcmNlVXBkYXRlKCk7IH0sIDMwKTtcblx0XHR0aGlzLnRocm90dGxlZEZvcmNlVXBkYXRlVHdpY2UgPSBfLnRocm90dGxlKCgpID0+IHsgdGhpcy5kaXJ0eSA9IHRydWU7IHRoaXMuZm9yY2VVcGRhdGUoKTsgfSwgMzApO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnNhdmVQcmV2Q2xpZW50U2l6ZSgpO1xuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy50aHJvdHRsZWRGb3JjZVVwZGF0ZVR3aWNlKTtcblx0XHR0aGlzLndlYXZlLnJvb3QuY2hpbGRMaXN0Q2FsbGJhY2tzLmFkZEdyb3VwZWRDYWxsYmFjayh0aGlzLCB0aGlzLnRocm90dGxlZEZvcmNlVXBkYXRlLCB0cnVlKTtcblx0XHR0aGlzLndlYXZlLnBhdGgoTEFZT1VUKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnRocm90dGxlZEZvcmNlVXBkYXRlLCB0cnVlKTtcblx0XHR0aGlzLndlYXZlLnBhdGgoTEFZT1VUKS5zdGF0ZSh0aGlzLnNpbXBsaWZ5U3RhdGUodGhpcy53ZWF2ZS5wYXRoKExBWU9VVCkuZ2V0U3RhdGUoKSkpO1xuXHRcdHdlYXZlanMuV2VhdmVBUEkuU2NoZWR1bGVyLmZyYW1lQ2FsbGJhY2tzLmFkZEdyb3VwZWRDYWxsYmFjayh0aGlzLCB0aGlzLmZyYW1lSGFuZGxlciwgdHJ1ZSk7XG5cdH1cblxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpOnZvaWRcblx0e1xuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMudGhyb3R0bGVkRm9yY2VVcGRhdGUpO1xuXHRcdFdlYXZlLmRpc3Bvc2UodGhpcyk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnNhdmVQcmV2Q2xpZW50U2l6ZSgpO1xuXG5cdFx0aWYgKFdlYXZlLmRldGVjdENoYW5nZSh0aGlzLCB0aGlzLndlYXZlLmdldE9iamVjdChMQVlPVVQpKSB8fCB0aGlzLmRpcnR5KVxuXHRcdHtcblx0XHRcdC8vIGRpcnR5IGZsYWcgdG8gdHJpZ2dlciByZW5kZXIgb24gd2luZG93IHJlc2l6ZVxuXHRcdFx0dGhpcy5kaXJ0eSA9IGZhbHNlO1xuXHRcdFx0dGhpcy50aHJvdHRsZWRGb3JjZVVwZGF0ZSgpO1xuXHRcdH1cblx0fVxuXG5cdGZyYW1lSGFuZGxlcigpOnZvaWRcblx0e1xuXHRcdHZhciBub2RlOkVsZW1lbnQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcblx0XHRpZiAodGhpcy5wcmV2Q2xpZW50V2lkdGggIT0gbm9kZS5jbGllbnRXaWR0aCB8fCB0aGlzLnByZXZDbGllbnRIZWlnaHQgIT0gbm9kZS5jbGllbnRIZWlnaHQpXG5cdFx0XHR0aGlzLnRocm90dGxlZEZvcmNlVXBkYXRlVHdpY2UoKTtcblx0XHR0aGlzLnNhdmVQcmV2Q2xpZW50U2l6ZSgpO1xuXHR9XG5cblx0c2F2ZVByZXZDbGllbnRTaXplKCk6dm9pZFxuXHR7XG5cdFx0dmFyIG5vZGU6RWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuXHRcdHRoaXMucHJldkNsaWVudFdpZHRoID0gbm9kZS5jbGllbnRXaWR0aDtcblx0XHR0aGlzLnByZXZDbGllbnRIZWlnaHQgPSBub2RlLmNsaWVudEhlaWdodDtcblx0fVxuXG5cdHNhdmVTdGF0ZShuZXdTdGF0ZTpMYXlvdXRTdGF0ZSk6dm9pZFxuXHR7XG5cdFx0bmV3U3RhdGUgPSB0aGlzLnNpbXBsaWZ5U3RhdGUobmV3U3RhdGUpO1xuXHRcdG5ld1N0YXRlLmZsZXggPSAxO1xuXHRcdHRoaXMud2VhdmUucGF0aChMQVlPVVQpLnN0YXRlKG5ld1N0YXRlKTtcblx0fVxuXG5cdG9uRHJhZ1N0YXJ0KGlkOnN0cmluZ1tdLCBldmVudDpSZWFjdC5Nb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLnRvb2xEcmFnZ2VkID0gaWQ7XG5cdFx0dmFyIHRvb2xSZWYgPSBpZFswXTsgLy8gdG9vbE5hbWUgYXMgdXNlZCBpbiB0aGUgcmVmIGZvciB0aGUgd2VhdmUgdG9vbC5cblx0XHR2YXIgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1t0b29sUmVmXSk7XG5cblx0XHQvLyBoYWNrIGJlY2F1c2UgZGF0YVRyYW5zZmVyIGRvZXNuJ3QgZXhpc3Qgb24gdHlwZSBldmVudFxuXHRcdChldmVudCBhcyBhbnkpLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoZWxlbWVudCwgMCwgMCk7XG5cdFx0KGV2ZW50IGFzIGFueSkuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvaHRtbCcsIG51bGwpO1xuXHR9XG5cblx0aGlkZU92ZXJsYXkoKTp2b2lkXG5cdHtcblx0XHR2YXIgdG9vbE92ZXJsYXlTdHlsZSA9IF8uY2xvbmUoKHRoaXMucmVmc1tUT09MT1ZFUkxBWV0gYXMgVG9vbE92ZXJsYXkpLnN0YXRlLnN0eWxlKTtcblx0XHR0b29sT3ZlcmxheVN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXHRcdHRvb2xPdmVybGF5U3R5bGUubGVmdCA9IHRvb2xPdmVybGF5U3R5bGUudG9wID0gdG9vbE92ZXJsYXlTdHlsZS53aWR0aCA9IHRvb2xPdmVybGF5U3R5bGUuaGVpZ2h0ID0gMDtcblx0XHQodGhpcy5yZWZzW1RPT0xPVkVSTEFZXSBhcyBUb29sT3ZlcmxheSkuc2V0U3RhdGUoe1xuXHRcdFx0c3R5bGU6IHRvb2xPdmVybGF5U3R5bGVcblx0XHR9KTtcblx0fVxuXG5cdG9uRHJhZ0VuZCgpOnZvaWRcblx0e1xuXHRcdGlmICh0aGlzLnRvb2xEcmFnZ2VkICYmIHRoaXMudG9vbE92ZXIpXG5cdFx0e1xuXHRcdFx0dGhpcy51cGRhdGVMYXlvdXQodGhpcy50b29sRHJhZ2dlZCwgdGhpcy50b29sT3ZlciwgdGhpcy5kcm9wWm9uZSk7XG5cdFx0XHR0aGlzLnRvb2xEcmFnZ2VkID0gbnVsbDtcblx0XHRcdHRoaXMuZHJvcFpvbmUgPSBudWxsO1xuXHRcdFx0dGhpcy5oaWRlT3ZlcmxheSgpO1xuXHRcdH1cblx0fVxuXG5cdG9uRHJhZ092ZXIodG9vbE92ZXI6c3RyaW5nW10sIGV2ZW50OlJlYWN0Lk1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdGlmICghdGhpcy50b29sRHJhZ2dlZClcblx0XHR7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChfLmlzRXF1YWwodGhpcy50b29sRHJhZ2dlZCwgdG9vbE92ZXIpKVxuXHRcdHtcblx0XHRcdC8vIGhpZGUgdGhlIG92ZXJsYXkgaWYgaG92ZXJpbmcgb3ZlciB0aGUgdG9vbCBiZWluZyBkcmFnZ2VkXG5cdFx0XHR0aGlzLnRvb2xPdmVyID0gbnVsbDtcblx0XHRcdHRoaXMuaGlkZU92ZXJsYXkoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdG9vbE5vZGUgPSAodGhpcy5yZWZzW0xBWU9VVF0gYXMgTGF5b3V0KS5nZXRET01Ob2RlRnJvbUlkKHRvb2xPdmVyKTtcblx0XHR2YXIgdG9vbE5vZGVQb3NpdGlvbiA9IHRvb2xOb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0dmFyIHRvb2xPdmVybGF5U3R5bGUgPSBfLmNsb25lKCh0aGlzLnJlZnNbVE9PTE9WRVJMQVldIGFzIFRvb2xPdmVybGF5KS5zdGF0ZS5zdHlsZSk7XG5cdFx0dmFyIGRyb3Bab25lID0gdGhpcy5nZXREcm9wWm9uZSh0b29sT3ZlciwgZXZlbnQpO1xuXHRcdHRvb2xPdmVybGF5U3R5bGUubGVmdCA9IHRvb2xOb2RlUG9zaXRpb24ubGVmdDtcblx0XHR0b29sT3ZlcmxheVN0eWxlLnRvcCA9IHRvb2xOb2RlUG9zaXRpb24udG9wO1xuXHRcdHRvb2xPdmVybGF5U3R5bGUud2lkdGggPSB0b29sTm9kZVBvc2l0aW9uLndpZHRoO1xuXHRcdHRvb2xPdmVybGF5U3R5bGUuaGVpZ2h0ID0gdG9vbE5vZGVQb3NpdGlvbi5oZWlnaHQ7XG5cdFx0dG9vbE92ZXJsYXlTdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG5cblx0XHRpZiAoZHJvcFpvbmUgPT09IExFRlQpXG5cdFx0e1xuXHRcdFx0dG9vbE92ZXJsYXlTdHlsZS53aWR0aCA9IHRvb2xOb2RlUG9zaXRpb24ud2lkdGggLyAyO1xuXHRcdH1cblx0XHRlbHNlIGlmIChkcm9wWm9uZSA9PT0gUklHSFQpXG5cdFx0e1xuXHRcdFx0dG9vbE92ZXJsYXlTdHlsZS5sZWZ0ID0gdG9vbE5vZGVQb3NpdGlvbi5sZWZ0ICsgdG9vbE5vZGVQb3NpdGlvbi53aWR0aCAvIDI7XG5cdFx0XHR0b29sT3ZlcmxheVN0eWxlLndpZHRoID0gdG9vbE5vZGVQb3NpdGlvbi53aWR0aCAvIDI7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGRyb3Bab25lID09PSBCT1RUT00pXG5cdFx0e1xuXHRcdFx0dG9vbE92ZXJsYXlTdHlsZS50b3AgPSB0b29sTm9kZVBvc2l0aW9uLnRvcCArIHRvb2xOb2RlUG9zaXRpb24uaGVpZ2h0IC8gMjtcblx0XHRcdHRvb2xPdmVybGF5U3R5bGUuaGVpZ2h0ID0gdG9vbE5vZGVQb3NpdGlvbi5oZWlnaHQgLyAyO1xuXHRcdH1cblx0XHRlbHNlIGlmIChkcm9wWm9uZSA9PT0gVE9QKVxuXHRcdHtcblx0XHRcdHRvb2xPdmVybGF5U3R5bGUuaGVpZ2h0ID0gdG9vbE5vZGVQb3NpdGlvbi5oZWlnaHQgLyAyO1xuXHRcdH1cblxuXHRcdGlmIChkcm9wWm9uZSAhPT0gdGhpcy5kcm9wWm9uZSB8fCAhXy5pc0VxdWFsKHRvb2xPdmVyLCB0aGlzLnRvb2xPdmVyKSlcblx0XHR7XG5cdFx0XHQodGhpcy5yZWZzW1RPT0xPVkVSTEFZXSBhcyBUb29sT3ZlcmxheSkuc2V0U3RhdGUoe1xuXHRcdFx0XHRzdHlsZTogdG9vbE92ZXJsYXlTdHlsZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5kcm9wWm9uZSA9IGRyb3Bab25lO1xuXHRcdHRoaXMudG9vbE92ZXIgPSB0b29sT3Zlcjtcblx0fVxuXG5cdGdldERyb3Bab25lKGlkOnN0cmluZ1tdLCBldmVudDpSZWFjdC5Nb3VzZUV2ZW50KTpzdHJpbmdcblx0e1xuXHRcdGlmICh0aGlzLnRvb2xEcmFnZ2VkKVxuXHRcdHtcblx0XHRcdGlmICghXy5pc0VxdWFsKHRoaXMudG9vbERyYWdnZWQsIGlkKSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRvb2xOb2RlID0gKHRoaXMucmVmc1tMQVlPVVRdIGFzIExheW91dCkuZ2V0RE9NTm9kZUZyb21JZChpZCk7XG5cdFx0XHRcdHZhciB0b29sTm9kZVBvc2l0aW9uID0gdG9vbE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0dmFyIGNlbnRlcjpQb2ludCA9IHtcblx0XHRcdFx0XHR4OiAodG9vbE5vZGVQb3NpdGlvbi5yaWdodCAtIHRvb2xOb2RlUG9zaXRpb24ubGVmdCkgLyAyLFxuXHRcdFx0XHRcdHk6ICh0b29sTm9kZVBvc2l0aW9uLmJvdHRvbSAtIHRvb2xOb2RlUG9zaXRpb24udG9wKSAvIDJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgbW91c2VQb3NSZWxhdGl2ZVRvQ2VudGVyOlBvaW50ID0ge1xuXHRcdFx0XHRcdHg6IGV2ZW50LmNsaWVudFggLSAodG9vbE5vZGVQb3NpdGlvbi5sZWZ0ICsgY2VudGVyLngpLFxuXHRcdFx0XHRcdHk6IGV2ZW50LmNsaWVudFkgLSAodG9vbE5vZGVQb3NpdGlvbi50b3AgKyBjZW50ZXIueSlcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgbW91c2VOb3JtOlBvaW50ID0ge1xuXHRcdFx0XHRcdHg6IChtb3VzZVBvc1JlbGF0aXZlVG9DZW50ZXIueCkgLyAodG9vbE5vZGVQb3NpdGlvbi53aWR0aCAvIDIpLFxuXHRcdFx0XHRcdHk6IChtb3VzZVBvc1JlbGF0aXZlVG9DZW50ZXIueSkgLyAodG9vbE5vZGVQb3NpdGlvbi5oZWlnaHQgLyAyKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBtb3VzZVBvbGFyQ29vcmQ6UG9pbnQgPSB7XG5cdFx0XHRcdFx0cjogTWF0aC5zcXJ0KG1vdXNlTm9ybS54ICogbW91c2VOb3JtLnggKyBtb3VzZU5vcm0ueSAqIG1vdXNlTm9ybS55KSxcblx0XHRcdFx0XHR0aGV0YTogTWF0aC5hdGFuMihtb3VzZU5vcm0ueSwgbW91c2VOb3JtLngpXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIHpvbmVzOnN0cmluZ1tdID0gW1JJR0hULCBCT1RUT00sIExFRlQsIFRPUF07XG5cblx0XHRcdFx0dmFyIHpvbmVJbmRleDpudW1iZXIgPSBNYXRoLnJvdW5kKChtb3VzZVBvbGFyQ29vcmQudGhldGEgLyAoMiAqIE1hdGguUEkpICogNCkgKyA0KSAlIDQ7XG5cblx0XHRcdFx0aWYgKG1vdXNlUG9sYXJDb29yZC5yIDwgMC4zNClcblx0XHRcdFx0XHRyZXR1cm4gXCJjZW50ZXJcIjtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJldHVybiB6b25lc1t6b25lSW5kZXhdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNpbXBsaWZ5U3RhdGUoc3RhdGU6TGF5b3V0U3RhdGUpOkxheW91dFN0YXRlXG5cdHtcblx0XHRpZiAoIXN0YXRlKVxuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdHZhciBjaGlsZHJlbjpMYXlvdXRTdGF0ZVtdID0gc3RhdGUuY2hpbGRyZW47XG5cblx0XHRpZiAoIWNoaWxkcmVuKVxuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXG5cdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSlcblx0XHRcdHJldHVybiB0aGlzLnNpbXBsaWZ5U3RhdGUoY2hpbGRyZW5bMF0pO1xuXG5cdFx0dmFyIHNpbXBsZUNoaWxkcmVuOkxheW91dFN0YXRlW10gPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGNoaWxkOkxheW91dFN0YXRlID0gdGhpcy5zaW1wbGlmeVN0YXRlKGNoaWxkcmVuW2ldKTtcblx0XHRcdGlmIChjaGlsZC5jaGlsZHJlbiAmJiBjaGlsZC5kaXJlY3Rpb24gPT09IHN0YXRlLmRpcmVjdGlvbilcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNoaWxkQ2hpbGRyZW46TGF5b3V0U3RhdGVbXSA9IGNoaWxkLmNoaWxkcmVuO1xuXHRcdFx0XHRmb3IgKHZhciBpaSA9IDA7IGlpIDwgY2hpbGRDaGlsZHJlbi5sZW5ndGg7IGlpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgY2hpbGRDaGlsZDpMYXlvdXRTdGF0ZSA9IGNoaWxkQ2hpbGRyZW5baWldO1xuXHRcdFx0XHRcdGNoaWxkQ2hpbGQuZmxleCAqPSBjaGlsZC5mbGV4O1xuXHRcdFx0XHRcdHNpbXBsZUNoaWxkcmVuLnB1c2goY2hpbGRDaGlsZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0c2ltcGxlQ2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHN0YXRlLmNoaWxkcmVuID0gc2ltcGxlQ2hpbGRyZW47XG5cdFx0dmFyIHRvdGFsU2l6ZUNoaWxkcmVuOm51bWJlciA9IF8uc3VtKF8ubWFwKHN0YXRlLmNoaWxkcmVuLCBcImZsZXhcIikpO1xuXG5cdFx0Ly9TY2FsZSBmbGV4IHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDEgc28gdGhleSBzdW0gdG8gMSwgYXZvaWRpbmcgYW4gYXBwYXJlbnRcblx0XHQvL2ZsZXggYnVnIHdoZXJlIHNwYWNlIGlzIGxvc3QgaWYgc3VtIG9mIGZsZXggdmFsdWVzIGlzIGxlc3MgdGhhbiAxLlxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG5cdFx0XHRzdGF0ZS5jaGlsZHJlbltpXS5mbGV4ID0gU3RhbmRhcmRMaWIubm9ybWFsaXplKHN0YXRlLmNoaWxkcmVuW2ldLmZsZXgsIDAsIHRvdGFsU2l6ZUNoaWxkcmVuKTtcblxuXHRcdHJldHVybiBzdGF0ZTtcblx0fVxuXG5cdHVwZGF0ZUxheW91dCh0b29sRHJhZ2dlZDpzdHJpbmdbXSwgdG9vbERyb3BwZWRPbjpzdHJpbmdbXSwgZHJvcFpvbmU6c3RyaW5nKTp2b2lkXG5cdHtcblx0XHRpZiAoIXRoaXMudG9vbERyYWdnZWQgfHwgIXRoaXMudG9vbE92ZXIgfHwgIXRoaXMuZHJvcFpvbmUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR2YXIgbmV3U3RhdGU6TGF5b3V0U3RhdGUgPSBfLmNsb25lRGVlcCh0aGlzLndlYXZlLnBhdGgoTEFZT1VUKS5nZXRTdGF0ZSgpKTtcblx0XHR2YXIgc3JjOkxheW91dFN0YXRlID0gU3RhbmRhcmRMaWIuZmluZERlZXAobmV3U3RhdGUsIHtpZDogdG9vbERyYWdnZWR9KTtcblx0XHR2YXIgZGVzdDpMYXlvdXRTdGF0ZSA9IFN0YW5kYXJkTGliLmZpbmREZWVwKG5ld1N0YXRlLCB7aWQ6IHRvb2xEcm9wcGVkT259KTtcblx0XHRpZiAoXy5pc0VxdWFsKHNyYy5pZCwgZGVzdC5pZCkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAoZHJvcFpvbmUgPT09IFwiY2VudGVyXCIpXG5cdFx0e1xuXHRcdFx0dmFyIHNyY0lkID0gc3JjLmlkO1xuXHRcdFx0c3JjLmlkID0gZGVzdC5pZDtcblx0XHRcdGRlc3QuaWQgPSBzcmNJZDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGlmICh3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZHJvcFpvbmUgPT09IExFRlQpXG5cdFx0XHRcdFx0ZHJvcFpvbmUgPSBSSUdIVDtcblx0XHRcdFx0ZWxzZSBpZiAoZHJvcFpvbmUgPT09IFJJR0hUKVxuXHRcdFx0XHRcdGRyb3Bab25lID0gTEVGVDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNyY1BhcmVudEFycmF5OkxheW91dFN0YXRlW10gPSBTdGFuZGFyZExpYi5maW5kRGVlcChuZXdTdGF0ZSwgKG9iajpMYXlvdXRTdGF0ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShvYmopICYmIG9iai5pbmRleE9mKHNyYykgPj0gMDtcblx0XHRcdH0pO1xuXG5cdFx0XHRzcmNQYXJlbnRBcnJheS5zcGxpY2Uoc3JjUGFyZW50QXJyYXkuaW5kZXhPZihzcmMpLCAxKTtcblxuXHRcdFx0ZGVsZXRlIGRlc3QuaWQ7XG5cdFx0XHRkZXN0LmRpcmVjdGlvbiA9IChkcm9wWm9uZSA9PT0gVE9QIHx8IGRyb3Bab25lID09PSBCT1RUT00pID8gVkVSVElDQUwgOiBIT1JJWk9OVEFMO1xuXG5cdFx0XHRkZXN0LmNoaWxkcmVuID0gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IHRvb2xEcmFnZ2VkLFxuXHRcdFx0XHRcdGZsZXg6IDAuNVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IHRvb2xEcm9wcGVkT24sXG5cdFx0XHRcdFx0ZmxleDogMC41XG5cdFx0XHRcdH1cblx0XHRcdF07XG5cdFx0XHRpZiAoZHJvcFpvbmUgPT09IEJPVFRPTSB8fCBkcm9wWm9uZSA9PT0gUklHSFQpXG5cdFx0XHR7XG5cdFx0XHRcdGRlc3QuY2hpbGRyZW4ucmV2ZXJzZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNhdmVTdGF0ZShuZXdTdGF0ZSk7XG5cdH1cblxuXHRnZXRJZFBhdGhzKHN0YXRlOmFueSwgb3V0cHV0PzpXZWF2ZVBhdGhbXSk6V2VhdmVQYXRoW11cblx0e1xuXHRcdGlmICghb3V0cHV0KVxuXHRcdFx0b3V0cHV0ID0gW107XG5cdFx0aWYgKHN0YXRlICYmIHN0YXRlLmlkKVxuXHRcdFx0b3V0cHV0LnB1c2godGhpcy53ZWF2ZS5wYXRoKHN0YXRlLmlkKSk7XG5cdFx0aWYgKHN0YXRlICYmIHN0YXRlLmNoaWxkcmVuKVxuXHRcdFx0Zm9yICh2YXIgY2hpbGQgb2Ygc3RhdGUuY2hpbGRyZW4pXG5cdFx0XHRcdHRoaXMuZ2V0SWRQYXRocyhjaGlsZCwgb3V0cHV0KTtcblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0Z2VuZXJhdGVMYXlvdXRTdGF0ZShwYXRoczpXZWF2ZVBhdGhbXSk6T2JqZWN0XG5cdHtcblx0XHQvLyB0ZW1wb3Jhcnkgc29sdXRpb24gLSBuZWVkcyBpbXByb3ZlbWVudFxuXHRcdHJldHVybiB0aGlzLnNpbXBsaWZ5U3RhdGUoe1xuXHRcdFx0ZmxleDogMSxcblx0XHRcdGRpcmVjdGlvbjogSE9SSVpPTlRBTCxcblx0XHRcdGNoaWxkcmVuOiBwYXRocy5tYXAocGF0aCA9PiB7IHJldHVybiB7aWQ6IHBhdGguZ2V0UGF0aCgpLCBmbGV4OiAxfSB9KVxuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyKCk6SlNYLkVsZW1lbnRcblx0e1xuXHRcdHZhciBuZXdTdGF0ZTpMYXlvdXRTdGF0ZSA9IHRoaXMud2VhdmUucGF0aChMQVlPVVQpLmdldFN0YXRlKCk7XG5cdFx0dmFyIGNoaWxkcmVuOkxheW91dFN0YXRlW10gPSBbXTtcblx0XHR2YXIgcGF0aHM6V2VhdmVQYXRoW107XG5cdFx0dmFyIHBhdGg6V2VhdmVQYXRoO1xuXG5cdFx0aWYgKCFuZXdTdGF0ZSlcblx0XHR7XG5cdFx0XHRuZXdTdGF0ZSA9IHRoaXMuZ2VuZXJhdGVMYXlvdXRTdGF0ZSh0aGlzLndlYXZlLnBhdGgoKS5nZXRDaGlsZHJlbigpLmZpbHRlcihwYXRoID0+IGdldFRvb2xJbXBsZW1lbnRhdGlvbihwYXRoKSkpO1xuXHRcdFx0Ly9UT0RPIC0gZ2VuZXJhdGUgbGF5b3V0IHN0YXRlIGZyb21cblx0XHRcdHRoaXMud2VhdmUucGF0aChMQVlPVVQpLnN0YXRlKG5ld1N0YXRlKTtcblx0XHR9XG5cblx0XHRwYXRocyA9IHRoaXMuZ2V0SWRQYXRocyhuZXdTdGF0ZSk7XG5cblx0XHR2YXIgcmVjdDpDbGllbnRSZWN0O1xuXHRcdGlmICh0aGlzLmVsZW1lbnQpXG5cdFx0XHRyZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRwYXRoID0gcGF0aHNbaV07XG5cdFx0XHR2YXIgdG9vbE5hbWU6c3RyaW5nID0gcGF0aC5nZXRQYXRoKClbMF07XG5cdFx0XHR2YXIgbm9kZTpFbGVtZW50O1xuXHRcdFx0dmFyIHRvb2xSZWN0OkNsaWVudFJlY3Q7XG5cdFx0XHR2YXIgdG9vbFBvc2l0aW9uOlJlYWN0LkNTU1Byb3BlcnRpZXM7XG5cdFx0XHRpZiAodGhpcy5yZWZzW0xBWU9VVF0gJiYgcmVjdClcblx0XHRcdHtcblx0XHRcdFx0bm9kZSA9ICh0aGlzLnJlZnNbTEFZT1VUXSBhcyBMYXlvdXQpLmdldERPTU5vZGVGcm9tSWQocGF0aC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRpZiAobm9kZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRvb2xSZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0XHR0b29sUG9zaXRpb24gPSB7XG5cdFx0XHRcdFx0XHR0b3A6IHRvb2xSZWN0LnRvcCAtIHJlY3QudG9wLFxuXHRcdFx0XHRcdFx0bGVmdDogdG9vbFJlY3QubGVmdCAtIHJlY3QubGVmdCxcblx0XHRcdFx0XHRcdHdpZHRoOiB0b29sUmVjdC5yaWdodCAtIHRvb2xSZWN0LmxlZnQsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IHRvb2xSZWN0LmJvdHRvbSAtIHRvb2xSZWN0LnRvcCxcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCJcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjaGlsZHJlbi5wdXNoKFxuXHRcdFx0XHQ8V2VhdmVUb29sXG5cdFx0XHRcdFx0cmVmPXt0b29sTmFtZX0ga2V5PXt0b29sTmFtZX0gdG9vbFBhdGg9e3BhdGh9IHN0eWxlPXt0b29sUG9zaXRpb259XG5cdFx0XHRcdFx0b25EcmFnT3Zlcj17dGhpcy5vbkRyYWdPdmVyLmJpbmQodGhpcywgcGF0aC5nZXRQYXRoKCkpfVxuXHRcdFx0XHRcdG9uRHJhZ1N0YXJ0PXt0aGlzLm9uRHJhZ1N0YXJ0LmJpbmQodGhpcywgcGF0aC5nZXRQYXRoKCkpfVxuXHRcdFx0XHRcdG9uRHJhZ0VuZD17dGhpcy5vbkRyYWdFbmQuYmluZCh0aGlzKX0gLz5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYgcmVmPXsoZWx0KSA9PiB7IHRoaXMuZWxlbWVudCA9IGVsdDsgfX0gc3R5bGU9e1N0YW5kYXJkTGliLm1lcmdlKHtkaXNwbGF5OiBcImZsZXhcIiwgcG9zaXRpb246IFwicmVsYXRpdmVcIiwgb3ZlcmZsb3c6IFwiaGlkZGVuXCJ9LCB0aGlzLnByb3BzLnN0eWxlKX0+XG5cdFx0XHRcdDxMYXlvdXQga2V5PXtMQVlPVVR9IHJlZj17TEFZT1VUfSBzdGF0ZT17Xy5jbG9uZURlZXAobmV3U3RhdGUpfSBvblN0YXRlQ2hhbmdlPXt0aGlzLnNhdmVTdGF0ZS5iaW5kKHRoaXMpfS8+XG5cdFx0XHRcdHtjaGlsZHJlbn1cblx0XHRcdFx0PFRvb2xPdmVybGF5IHJlZj17VE9PTE9WRVJMQVl9Lz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFdlYXZlTGF5b3V0TWFuYWdlcjtcbiJdfQ==