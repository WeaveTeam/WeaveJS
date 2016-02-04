"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _ui = require("../react-ui/ui");

var _ui2 = _interopRequireDefault(_ui);

var _WeaveTool = require("../WeaveTool");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _reactBootstrap = require("react-bootstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);

var DataFilterTool = function (_React$Component) {
    _inherits(DataFilterTool, _React$Component);

    function DataFilterTool(props) {
        _classCallCheck(this, DataFilterTool);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DataFilterTool).call(this, props));

        _this.toolPath = _this.props.toolPath;
        _this.filter = _this.toolPath.push("filter", null);
        _this.editor = _this.toolPath.push("editor", null);
        _this.setupCallbacks();
        return _this;
    }

    _createClass(DataFilterTool, [{
        key: "setupCallbacks",
        value: function setupCallbacks() {
            this.filter.addCallback(this, this.forceUpdate);
            this.editor.addCallback(this, this.forceUpdate);
        }
    }, {
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "render",
        value: function render() {
            var editorType = this.editor.getType();
            if (editorType == DataFilterTool.DISCRETEFILTERCLASS) {
                return React.createElement(DiscreteValuesDataFilterEditor, { editor: this.editor, filter: this.filter });
            } else if (editorType == DataFilterTool.RANGEFILTERCLASS) {
                return React.createElement(NumericRangeDataFilterEditor, { editor: this.editor, filter: this.filter });
            } else {
                return React.createElement("div", null); // blank tool
            }
        }
    }, {
        key: "title",
        get: function get() {
            return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
        }
    }]);

    return DataFilterTool;
}(React.Component);

exports.default = DataFilterTool;

DataFilterTool.DISCRETEFILTERCLASS = "weave.editors::DiscreteValuesDataFilterEditor";
DataFilterTool.RANGEFILTERCLASS = "weave.editors::NumericRangeDataFilterEditor";
(0, _WeaveTool.registerToolImplementation)("weave.ui::DataFilterTool", DataFilterTool);

var NumericRangeDataFilterEditor = function (_React$Component2) {
    _inherits(NumericRangeDataFilterEditor, _React$Component2);

    function NumericRangeDataFilterEditor(props) {
        _classCallCheck(this, NumericRangeDataFilterEditor);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(NumericRangeDataFilterEditor).call(this, props));

        _this2.filter = _this2.props.filter.getObject();
        _this2.values = _this2.filter.values;
        _this2.column = _this2.filter.column;
        _this2.forceDiscreteValues = _this2.props.editor.getObject("forceDiscreteValues");
        _this2.options = [];
        return _this2;
    }

    _createClass(NumericRangeDataFilterEditor, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.filter = this.props.filter.getObject();
            this.values = this.filter.values;
            this.column = this.filter.column;
            this.forceDiscreteValues = this.props.editor.getObject("forceDiscreteValues");
        }
    }, {
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            Weave.getCallbacks(this.forceDiscreteValues).addGroupedCallback(this, this.columnChanged);
            Weave.getCallbacks(this.column).addGroupedCallback(this, this.columnChanged);
        }
    }, {
        key: "onChange",
        value: function onChange(selectedValues) {
            this.values.state = selectedValues;
        }
    }, {
        key: "columnChanged",
        value: function columnChanged() {
            var _this3 = this;

            this.options = _.sortByOrder(_.uniq(this.column.keys.map(function (key) {
                return {
                    value: _this3.column.getValueFromKey(key, Number),
                    label: _this3.column.getValueFromKey(key, String)
                };
            }), "value"), ["value"], ["asc"]);
            this.forceUpdate();
        }
    }, {
        key: "render",
        value: function render() {
            var values = this.values.state;
            if (this.forceDiscreteValues.value) {
                return React.createElement(
                    _ui2.default.HBox,
                    { style: { width: "100%", height: "100%", alignItems: "center", padding: 10 } },
                    React.createElement(_ui2.default.HSlider, { type: "numeric-discrete", values: this.options, selectedValues: values, onChange: this.onChange.bind(this) })
                );
            } else {
                return React.createElement(
                    _ui2.default.HBox,
                    { style: { width: "100%", height: "100%", alignItems: "center", padding: 10 } },
                    React.createElement(_ui2.default.HSlider, { type: "numeric", values: this.options, selectedValues: values, onChange: this.onChange.bind(this) })
                );
            }
        }
    }]);

    return NumericRangeDataFilterEditor;
}(React.Component);

var DiscreteValuesDataFilterEditor = function (_React$Component3) {
    _inherits(DiscreteValuesDataFilterEditor, _React$Component3);

    function DiscreteValuesDataFilterEditor(props) {
        _classCallCheck(this, DiscreteValuesDataFilterEditor);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(DiscreteValuesDataFilterEditor).call(this, props));

        _this4.layoutMode = _this4.props.editor.getObject("layoutMode");
        _this4.showToggle = _this4.props.editor.getObject("showToggle");
        _this4.showToggleLabel = _this4.props.editor.getObject("showToggleLabel");
        _this4.filter = _this4.props.filter.getObject();
        _this4.values = _this4.filter.values;
        _this4.column = _this4.filter.column;
        _this4.enabled = _this4.filter.enabled;
        _this4.options = [];
        return _this4;
    }

    _createClass(DiscreteValuesDataFilterEditor, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.layoutMode = this.props.editor.getObject("layoutMode");
            this.showToggle = this.props.editor.getObject("showToggle");
            this.showToggleLabel = this.props.editor.getObject("showToggleLabel");
            this.filter = this.props.filter.getObject();
            this.values = this.filter.values;
            this.column = this.filter.column;
            this.enabled = this.filter.enabled;
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            Weave.getCallbacks(this.layoutMode).addGroupedCallback(this, this.forceUpdate);
            Weave.getCallbacks(this.showToggle).addGroupedCallback(this, this.forceUpdate);
            Weave.getCallbacks(this.showToggleLabel).addGroupedCallback(this, this.forceUpdate);
            Weave.getCallbacks(this.column).addGroupedCallback(this, this.columnChanged);
        }
    }, {
        key: "columnChanged",
        value: function columnChanged() {
            var _this5 = this;

            this.options = _.sortByOrder(_.uniq(this.column.keys.map(function (key) {
                var val = _this5.column.getValueFromKey(key, String);
                return {
                    value: val,
                    label: val
                };
            }), "value"), ["value"], ["asc"]);
            this.forceUpdate();
        }
    }, {
        key: "onChange",
        value: function onChange(selectedValues) {
            this.values.state = selectedValues;
        }
    }, {
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "render",
        value: function render() {
            var _this6 = this;

            var values = this.values.state;
            switch (this.layoutMode && this.layoutMode.value) {
                case DiscreteValuesDataFilterEditor.LAYOUT_CHECKBOXLIST:
                    return React.createElement(_ui2.default.CheckBoxList, { values: this.options, selectedValues: values, onChange: this.onChange.bind(this) });
                case DiscreteValuesDataFilterEditor.LAYOUT_LIST:
                    return React.createElement(_ui2.default.ListItem, { values: this.options, selectedValues: values, onChange: this.onChange.bind(this) });
                case DiscreteValuesDataFilterEditor.LAYOUT_HSLIDER:
                    return React.createElement(
                        _ui2.default.HBox,
                        { style: { width: "100%", height: "100%", alignItems: "center", padding: 10 } },
                        React.createElement(_ui2.default.HSlider, { type: "categorical", values: this.options, selectedValues: values, onChange: this.onChange.bind(this) })
                    );
                case DiscreteValuesDataFilterEditor.LAYOUT_VSLIDER:
                    return React.createElement(
                        _ui2.default.VBox,
                        { style: { width: "100%", height: "100%", alignItems: "center", padding: 10 } },
                        React.createElement(_ui2.default.VSlider, { type: "categorical", values: this.options, selectedValues: values, onChange: this.onChange.bind(this) })
                    );
                case DiscreteValuesDataFilterEditor.LAYOUT_COMBO:
                    return React.createElement(
                        _ui2.default.VBox,
                        { style: { height: "100%", flex: 1.0, alignItems: "center" } },
                        React.createElement(
                            _reactBootstrap.DropdownButton,
                            { title: values[0], id: "bs.dropdown" },
                            this.options.map(function (option, index) {
                                return React.createElement(
                                    _reactBootstrap.MenuItem,
                                    { active: values.indexOf(option) > -1, key: index, onSelect: function onSelect() {
                                            _this6.values.state = [option];
                                        } },
                                    option
                                );
                            })
                        )
                    );
            }
        }
    }]);

    return DiscreteValuesDataFilterEditor;
}(React.Component);

DiscreteValuesDataFilterEditor.LAYOUT_LIST = "List";
DiscreteValuesDataFilterEditor.LAYOUT_COMBO = "ComboBox";
DiscreteValuesDataFilterEditor.LAYOUT_VSLIDER = "VSlider";
DiscreteValuesDataFilterEditor.LAYOUT_HSLIDER = "HSlider";
DiscreteValuesDataFilterEditor.LAYOUT_CHECKBOXLIST = "CheckBoxList";
//Weave.registerClass("weave.editors.DiscreteValuesDataFilterEditor", {}, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YUZpbHRlclRvb2wuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvRGF0YUZpbHRlclRvb2wudHN4Il0sIm5hbWVzIjpbIkRhdGFGaWx0ZXJUb29sIiwiRGF0YUZpbHRlclRvb2wuY29uc3RydWN0b3IiLCJEYXRhRmlsdGVyVG9vbC5zZXR1cENhbGxiYWNrcyIsIkRhdGFGaWx0ZXJUb29sLmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiRGF0YUZpbHRlclRvb2wudGl0bGUiLCJEYXRhRmlsdGVyVG9vbC5yZW5kZXIiLCJOdW1lcmljUmFuZ2VEYXRhRmlsdGVyRWRpdG9yIiwiTnVtZXJpY1JhbmdlRGF0YUZpbHRlckVkaXRvci5jb25zdHJ1Y3RvciIsIk51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIk51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IuaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMiLCJOdW1lcmljUmFuZ2VEYXRhRmlsdGVyRWRpdG9yLmNvbXBvbmVudERpZE1vdW50IiwiTnVtZXJpY1JhbmdlRGF0YUZpbHRlckVkaXRvci5vbkNoYW5nZSIsIk51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IuY29sdW1uQ2hhbmdlZCIsIk51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IucmVuZGVyIiwiRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yIiwiRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yLmNvbnN0cnVjdG9yIiwiRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3IuY29tcG9uZW50RGlkTW91bnQiLCJEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3IuY29sdW1uQ2hhbmdlZCIsIkRpc2NyZXRlVmFsdWVzRGF0YUZpbHRlckVkaXRvci5vbkNoYW5nZSIsIkRpc2NyZXRlVmFsdWVzRGF0YUZpbHRlckVkaXRvci5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIkRpc2NyZXRlVmFsdWVzRGF0YUZpbHRlckVkaXRvci5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFLWSxBQUFLLEFBQU0sQUFBTyxBQUV2QixBQUFFLEFBQU0sQUFBZ0IsQUFFeEIsQUFBQyxBQUEwQixBQUFDLEFBQU0sQUFBYyxBQUNoRDs7Ozs7Ozs7OztJQUFLLEFBQUMsQUFBTSxBQUFRLEFBQ3BCLEFBQUMsQUFBYyxBQUFFLEFBQVEsQUFBQyxBQUFNLEFBQWlCLEFBbUJ4RCxBQUFzSCxBQUN0SDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVVDLDRCQUFZLEFBQW1COzs7c0dBQ3hCLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksY0FBQyxBQUFRLFdBQUcsQUFBSSxNQUFDLEFBQUssTUFBQyxBQUFRLEFBQUM7QUFDcEMsQUFBSSxjQUFDLEFBQU0sU0FBRyxBQUFJLE1BQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFRLFVBQUUsQUFBSSxBQUFDLEFBQUM7QUFDakQsQUFBSSxjQUFDLEFBQU0sU0FBRyxBQUFJLE1BQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFRLFVBQUUsQUFBSSxBQUFDLEFBQUM7QUFDakQsQUFBSSxjQUFDLEFBQWMsQUFBRSxBQUFDLEFBQ3ZCLEFBQUMsQUFFTyxBQUFjLGlCQVByQjs7Ozs7OztBQVFBLEFBQUksaUJBQUMsQUFBTSxPQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDO0FBQ2hELEFBQUksaUJBQUMsQUFBTSxPQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDLEFBQ2pELEFBQUMsQUFFUyxBQUFtQzs7Ozs0REFBQyxBQUFZLFVBRzFELEFBQUMsQUFFRCxBQUFJLEFBQUs7Ozs7QUFLUixnQkFBSSxBQUFVLGFBQVUsQUFBSSxLQUFDLEFBQU0sT0FBQyxBQUFPLEFBQUUsQUFBQztBQUM5QyxBQUFFLGdCQUFDLEFBQVUsY0FBSSxBQUFjLGVBQUMsQUFBbUIsQUFBQyxxQkFBQyxBQUFDO0FBQ3JELEFBQU0sdUJBQUMsb0JBQUMsQUFBOEIsa0NBQUMsQUFBTSxBQUFDLFFBQUMsQUFBSSxLQUFDLEFBQU0sQUFBQyxRQUFDLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFNLEFBQUMsQUFBRSxBQUNuRixBQUFDLEFBQUMsQUFBSTt1QkFBSyxBQUFVLGNBQUksQUFBYyxlQUFDLEFBQWdCLEFBQUMsa0JBQUEsQUFBQztBQUN6RCxBQUFNLHVCQUFDLG9CQUFDLEFBQTRCLGdDQUFDLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFNLEFBQUMsUUFBQyxBQUFNLEFBQUMsUUFBQyxBQUFJLEtBQUMsQUFBTSxBQUFDLEFBQUUsQUFDakYsQUFBQyxBQUFDLEFBQUk7YUFGQyxBQUFFLEFBQUM7QUFHVCxBQUFNLHVCQUFDLEFBQUMsQUFBRyxBQUFFLEFBQUMsQUFBYSxBQUM1QixBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUM7QUFKUSxBQUFDOzs7OztBQVROLEFBQU0sbUJBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQU8sUUFBQyxBQUFZLEFBQUMsZ0JBQUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBWSxBQUFDLGdCQUFHLEFBQUUsQUFBQyxPQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBTyxBQUFFLFVBQUMsQUFBRyxBQUFFLEFBQUMsQUFDN0gsQUFBQyxBQUVELEFBQU07Ozs7O0VBaENxQyxBQUFLLE1BQUMsQUFBUzs7OztBQU9uRCxlQUFtQixzQkFBVSxBQUErQyxBQUFDO0FBQzdFLGVBQWdCLG1CQUFVLEFBQTZDLEFBa0M5RTtBQUNELEFBQTBCLDJDQUFDLEFBQTBCLDRCQUFFLEFBQWMsQUFBQyxBQUFDLEFBV3ZFOzs7OztBQVlDLDBDQUFZLEFBQXVDOzs7cUhBQzVDLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksZUFBQyxBQUFNLFNBQUcsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxBQUFzQixBQUFDO0FBQ2hFLEFBQUksZUFBQyxBQUFNLFNBQUcsQUFBSSxPQUFDLEFBQU0sT0FBQyxBQUFNLEFBQUM7QUFDakMsQUFBSSxlQUFDLEFBQU0sU0FBRyxBQUFJLE9BQUMsQUFBTSxPQUFDLEFBQU0sQUFBQztBQUNqQyxBQUFJLGVBQUMsQUFBbUIsc0JBQUcsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxVQUFDLEFBQXFCLEFBQUMsQUFBQztBQUM5RSxBQUFJLGVBQUMsQUFBTyxVQUFHLEFBQUUsQUFBQyxBQUNuQixBQUFDLEFBRUQsQUFBeUIsR0FSeEI7Ozs7OztrREFReUIsQUFBNkM7QUFDdEUsQUFBSSxpQkFBQyxBQUFNLFNBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxBQUFzQixBQUFDO0FBQ2hFLEFBQUksaUJBQUMsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBTSxBQUFDO0FBQ2pDLEFBQUksaUJBQUMsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBTSxBQUFDO0FBQ2pDLEFBQUksaUJBQUMsQUFBbUIsc0JBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxVQUFDLEFBQXFCLEFBQUMsQUFBQyxBQUMvRSxBQUFDLEFBRVMsQUFBbUM7Ozs7NERBQUMsQUFBWSxVQUcxRCxBQUFDLEFBRUQsQUFBaUI7Ozs7QUFDaEIsQUFBSyxrQkFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQW1CLEFBQUMscUJBQUMsQUFBa0IsbUJBQUMsQUFBSSxNQUFFLEFBQUksS0FBQyxBQUFhLEFBQUMsQUFBQztBQUMxRixBQUFLLGtCQUFDLEFBQVksYUFBQyxBQUFJLEtBQUMsQUFBTSxBQUFDLFFBQUMsQUFBa0IsbUJBQUMsQUFBSSxNQUFFLEFBQUksS0FBQyxBQUFhLEFBQUMsQUFBQyxBQUM5RSxBQUFDLEFBRUQsQUFBUTs7OztpQ0FBQyxBQUF1QjtBQUMvQixBQUFJLGlCQUFDLEFBQU0sT0FBQyxBQUFLLFFBQUcsQUFBYyxBQUFDLEFBQ3BDLEFBQUMsQUFFRCxBQUFhOzs7Ozs7O0FBQ1osQUFBSSxpQkFBQyxBQUFPLFlBQUssQUFBVyxjQUFHLEFBQUksS0FBQyxBQUFJLEtBQUMsQUFBTSxPQUFDLEFBQUksS0FBQyxBQUFHLGNBQUUsQUFBaUI7QUFDMUUsQUFBTSx1QkFBQztBQUNOLEFBQUssMkJBQUUsQUFBSSxPQUFDLEFBQU0sT0FBQyxBQUFlLGdCQUFDLEFBQUcsS0FBRSxBQUFNLEFBQUM7QUFDL0MsQUFBSywyQkFBRSxBQUFJLE9BQUMsQUFBTSxPQUFDLEFBQWUsZ0JBQUMsQUFBRyxLQUFFLEFBQU0sQUFBQyxBQUMvQyxBQUFDLEFBQ0gsQUFBQyxBQUFDOzthQUx1RCxDQUE1QixBQUFDLEVBSzFCLEFBQU8sQUFBQyxRQUxHLEFBQUMsRUFLRixDQUFDLEFBQU8sQUFBQyxVQUFFLENBQUMsQUFBSyxBQUFDLEFBQUMsQUFBQztBQUNsQyxBQUFJLGlCQUFDLEFBQVcsQUFBRSxBQUFDLEFBQ3BCLEFBQUMsQUFFRCxBQUFNOzs7OztBQUNMLGdCQUFJLEFBQU0sU0FBTyxBQUFJLEtBQUMsQUFBTSxPQUFDLEFBQUssQUFBQztBQUNuQyxBQUFFLEFBQUMsZ0JBQUMsQUFBSSxLQUFDLEFBQW1CLG9CQUFDLEFBQUssQUFBQztBQUVsQyxBQUFNLHVCQUFDLEFBQUMsQUFBRTtpQ0FBQyxBQUFJO3NCQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBSyxPQUFDLEFBQU0sUUFBRSxBQUFNLFFBQUMsQUFBTSxRQUFFLEFBQVUsWUFBQyxBQUFRLFVBQUUsQUFBTyxTQUFFLEFBQUUsQUFBQyxBQUFDLEFBQ3JGO29CQUFBLEFBQUMsQUFBRSxpQ0FBQyxBQUFPLFdBQUMsQUFBSSxNQUFDLEFBQWtCLG9CQUFDLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFjLEFBQUMsZ0JBQUMsQUFBTSxBQUFDLFFBQUMsQUFBUSxBQUFDLFVBQUMsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFDdEgsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFDYixBQUFDLEFBQ0QsQUFBSTtrQkFMSixBQUFDOztBQU9BLEFBQU0sdUJBQUMsQUFBQyxBQUFFO2lDQUFDLEFBQUk7c0JBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFFLEFBQU0sUUFBQyxBQUFNLFFBQUUsQUFBVSxZQUFDLEFBQVEsVUFBRSxBQUFPLFNBQUUsQUFBRSxBQUFDLEFBQUMsQUFDckY7b0JBQUEsQUFBQyxBQUFFLGlDQUFDLEFBQU8sV0FBQyxBQUFJLE1BQUMsQUFBUyxXQUFFLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFjLEFBQUMsZ0JBQUMsQUFBTSxBQUFDLFFBQUMsQUFBUSxBQUFDLFVBQUMsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFDOUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFDYixBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUMsQUFZRDtrQkFsQkUsQUFBQzs7Ozs7O0VBN0R3QyxBQUFLLE1BQUMsQUFBUzs7Ozs7QUFrR3pELDRDQUFZLEFBQXlDOzs7dUhBQzlDLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksZUFBQyxBQUFVLGFBQUcsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxVQUFDLEFBQVksQUFBQyxBQUFDO0FBQzVELEFBQUksZUFBQyxBQUFVLGFBQUcsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxVQUFDLEFBQVksQUFBQyxBQUFDO0FBQzVELEFBQUksZUFBQyxBQUFlLGtCQUFHLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQVMsVUFBQyxBQUFpQixBQUFDLEFBQUM7QUFDdEUsQUFBSSxlQUFDLEFBQU0sU0FBRyxBQUFJLE9BQUMsQUFBSyxNQUFDLEFBQU0sT0FBQyxBQUFTLEFBQXNCLEFBQUM7QUFDaEUsQUFBSSxlQUFDLEFBQU0sU0FBRyxBQUFJLE9BQUMsQUFBTSxPQUFDLEFBQU0sQUFBQztBQUNqQyxBQUFJLGVBQUMsQUFBTSxTQUFHLEFBQUksT0FBQyxBQUFNLE9BQUMsQUFBTSxBQUFDO0FBQ2pDLEFBQUksZUFBQyxBQUFPLFVBQUcsQUFBSSxPQUFDLEFBQU0sT0FBQyxBQUFPLEFBQUM7QUFDbkMsQUFBSSxlQUFDLEFBQU8sVUFBRyxBQUFFLEFBQUMsQUFDbkIsQUFBQyxBQUVELEFBQXlCLEdBWHhCOzs7Ozs7a0RBV3lCLEFBQTZDO0FBQ3RFLEFBQUksaUJBQUMsQUFBVSxhQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQVMsVUFBQyxBQUFZLEFBQUMsQUFBQztBQUM1RCxBQUFJLGlCQUFDLEFBQVUsYUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQU0sT0FBQyxBQUFTLFVBQUMsQUFBWSxBQUFDLEFBQUM7QUFDNUQsQUFBSSxpQkFBQyxBQUFlLGtCQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQVMsVUFBQyxBQUFpQixBQUFDLEFBQUM7QUFDdEUsQUFBSSxpQkFBQyxBQUFNLFNBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFNLE9BQUMsQUFBUyxBQUFzQixBQUFDO0FBQ2hFLEFBQUksaUJBQUMsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBTSxBQUFDO0FBQ2pDLEFBQUksaUJBQUMsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBTSxBQUFDO0FBQ2pDLEFBQUksaUJBQUMsQUFBTyxVQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBTyxBQUFDLEFBQ3BDLEFBQUMsQUFFRCxBQUFpQjs7Ozs7QUFDaEIsQUFBSyxrQkFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQVUsQUFBQyxZQUFDLEFBQWtCLG1CQUFDLEFBQUksTUFBRSxBQUFJLEtBQUMsQUFBVyxBQUFDLEFBQUM7QUFDL0UsQUFBSyxrQkFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQVUsQUFBQyxZQUFDLEFBQWtCLG1CQUFDLEFBQUksTUFBRSxBQUFJLEtBQUMsQUFBVyxBQUFDLEFBQUM7QUFDL0UsQUFBSyxrQkFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQWUsQUFBQyxpQkFBQyxBQUFrQixtQkFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDO0FBQ3BGLEFBQUssa0JBQUMsQUFBWSxhQUFDLEFBQUksS0FBQyxBQUFNLEFBQUMsUUFBQyxBQUFrQixtQkFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQWEsQUFBQyxBQUFDLEFBQzlFLEFBQUMsQUFFRCxBQUFhOzs7Ozs7O0FBQ1osQUFBSSxpQkFBQyxBQUFPLFlBQUssQUFBVyxjQUFHLEFBQUksS0FBQyxBQUFJLEtBQUMsQUFBTSxPQUFDLEFBQUksS0FBQyxBQUFHLGNBQUUsQUFBaUI7QUFDMUUsb0JBQUksQUFBRyxNQUFVLEFBQUksT0FBQyxBQUFNLE9BQUMsQUFBZSxnQkFBQyxBQUFHLEtBQUUsQUFBTSxBQUFDLEFBQUM7QUFDMUQsQUFBTSx1QkFBQztBQUNOLEFBQUssMkJBQUUsQUFBRztBQUNWLEFBQUssMkJBQUUsQUFBRyxBQUNWLEFBQUMsQUFDSCxBQUFDLEFBQUM7O2FBTnVELENBQTVCLEFBQUMsRUFNMUIsQUFBTyxBQUFDLFFBTkcsQUFBQyxFQU1GLENBQUMsQUFBTyxBQUFDLFVBQUUsQ0FBQyxBQUFLLEFBQUMsQUFBQyxBQUFDO0FBQ2xDLEFBQUksaUJBQUMsQUFBVyxBQUFFLEFBQUMsQUFDcEIsQUFBQyxBQUVELEFBQVE7Ozs7aUNBQUMsQUFBdUI7QUFDL0IsQUFBSSxpQkFBQyxBQUFNLE9BQUMsQUFBSyxRQUFHLEFBQWMsQUFBQyxBQUNwQyxBQUFDLEFBRVMsQUFBbUM7Ozs7NERBQUMsQUFBWSxVQUcxRCxBQUFDLEFBRUQsQUFBTTs7Ozs7O0FBQ0wsZ0JBQUksQUFBTSxTQUFPLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBSyxBQUFDO0FBRW5DLEFBQU0sQUFBQyxvQkFBQyxBQUFJLEtBQUMsQUFBVSxjQUFJLEFBQUksS0FBQyxBQUFVLFdBQUMsQUFBSyxBQUFDLEFBQUMsQUFBQztBQUNsRCxxQkFBSyxBQUE4QiwrQkFBQyxBQUFtQjtBQUN0RCxBQUFNLDJCQUFDLEFBQUMsQUFBRSxpQ0FBQyxBQUFZLGdCQUFDLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFjLEFBQUMsZ0JBQUMsQUFBTSxBQUFDLFFBQUMsQUFBUSxBQUFDLFVBQUMsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFBRTtxQkFDdkcsQUFBOEIsK0JBQUMsQUFBVztBQUM5QyxBQUFNLDJCQUFDLEFBQUMsQUFBRSxpQ0FBQyxBQUFRLFlBQUMsQUFBTSxBQUFDLFFBQUMsQUFBSSxLQUFDLEFBQU8sQUFBQyxTQUFDLEFBQWMsQUFBQyxnQkFBQyxBQUFNLEFBQUMsUUFBQyxBQUFRLEFBQUMsVUFBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxBQUFFLFNBRHhHO3FCQUVLLEFBQThCLCtCQUFDLEFBQWM7QUFDakQsQUFBTSwyQkFBQyxBQUFDLEFBQUU7cUNBQUMsQUFBSTswQkFBQyxBQUFLLEFBQUMsT0FBQyxFQUFDLEFBQUssT0FBQyxBQUFNLFFBQUUsQUFBTSxRQUFDLEFBQU0sUUFBRSxBQUFVLFlBQUMsQUFBUSxVQUFFLEFBQU8sU0FBRSxBQUFFLEFBQUMsQUFBQyxBQUNwRjt3QkFBQSxBQUFDLEFBQUUsaUNBQUMsQUFBTyxXQUFDLEFBQUksTUFBQyxBQUFhLGVBQUMsQUFBTSxBQUFDLFFBQUMsQUFBSSxLQUFDLEFBQU8sQUFBQyxTQUFDLEFBQWMsQUFBQyxnQkFBQyxBQUFNLEFBQUMsUUFBQyxBQUFRLEFBQUMsVUFBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxBQUNqSCxBQUFFLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFBQztzQkFIZDtxQkFJSyxBQUE4QiwrQkFBQyxBQUFjO0FBQ2pELEFBQU0sMkJBQUMsQUFBQyxBQUFFO3FDQUFDLEFBQUk7MEJBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFFLEFBQU0sUUFBQyxBQUFNLFFBQUUsQUFBVSxZQUFDLEFBQVEsVUFBRSxBQUFPLFNBQUUsQUFBRSxBQUFDLEFBQUMsQUFDcEY7d0JBQUEsQUFBQyxBQUFFLGlDQUFDLEFBQU8sV0FBQyxBQUFJLE1BQUMsQUFBYSxlQUFDLEFBQU0sQUFBQyxRQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFjLEFBQUMsZ0JBQUMsQUFBTSxBQUFDLFFBQUMsQUFBUSxBQUFDLFVBQUMsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFDakgsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUM7c0JBSGQ7cUJBSUssQUFBOEIsK0JBQUMsQUFBWTtBQUMvQyxBQUFNO3FDQUFLLEFBQUk7MEJBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFNLFFBQUMsQUFBTSxRQUFFLEFBQUksTUFBQyxBQUFHLEtBQUUsQUFBVSxZQUFDLEFBQVEsQUFBQyxBQUFDLEFBQ25FO3dCQUFBLEFBQUMsQUFBYzs7OEJBQUMsQUFBSyxBQUFDLE9BQUMsQUFBTSxPQUFDLEFBQUMsQUFBQyxBQUFDLElBQUMsQUFBRSxJQUFDLEFBQWEsQUFDakQ7NEJBQ0MsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFHLGNBQUUsQUFBYSxRQUFFLEFBQVk7QUFDNUMsQUFBTSx1Q0FBRSxBQUFDLEFBQVE7O3NDQUFDLEFBQU0sQUFBQyxRQUFDLEFBQU0sT0FBQyxBQUFPLFFBQUMsQUFBTSxBQUFDLFVBQUcsQ0FBQyxBQUFDLEFBQUMsR0FBQyxBQUFHLEFBQUMsS0FBQyxBQUFLLEFBQUMsT0FBQyxBQUFRLEFBQUM7QUFBUyxBQUFJLG1EQUFDLEFBQU0sT0FBQyxBQUFLLFFBQUcsQ0FBQyxBQUFNLEFBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUFDO3lDQUF6QztvQ0FBMEMsQUFBTSxBQUFDLEFBQUUsQUFBUSxBQUFDLEFBQzFJLEFBQUMsQUFBQyxBQUVKLEFBQUUsQUFBYyxBQUNqQixBQUFFLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFBQyxBQUNmLEFBQUMsQUFDRixBQUFDLEFBQ0YsQUFBQzs7NkJBUnlCO3lCQUhmLEFBQUMsQUFBRTtzQkFEWDs7Ozs7O0VBcEYwQyxBQUFLLE1BQUMsQUFBUzs7QUFFcEQsK0JBQVcsY0FBVSxBQUFNLEFBQUM7QUFDNUIsK0JBQVksZUFBVSxBQUFVLEFBQUM7QUFDakMsK0JBQWMsaUJBQVUsQUFBUyxBQUFDO0FBQ2xDLCtCQUFjLGlCQUFVLEFBQVMsQUFBQztBQUNsQywrQkFBbUIsc0JBQVUsQUFBYyxBQTBGbEQsQUFDRCxBQUErSCIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0LWJvb3RzdHJhcC9yZWFjdC1ib290c3RyYXAuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge0lWaXNUb29sLCBJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuaW1wb3J0IHVpIGZyb20gXCIuLi9yZWFjdC11aS91aVwiO1xuaW1wb3J0ICogYXMgYnMgZnJvbSBcInJlYWN0LWJvb3RzdHJhcFwiO1xuaW1wb3J0IHtyZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbn0gZnJvbSBcIi4uL1dlYXZlVG9vbFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge0Ryb3Bkb3duQnV0dG9uLCBNZW51SXRlbX0gZnJvbSBcInJlYWN0LWJvb3RzdHJhcFwiO1xuXG5pbXBvcnQgSUNvbHVtblN0YXRpc3RpY3MgPSB3ZWF2ZWpzLmFwaS5kYXRhLklDb2x1bW5TdGF0aXN0aWNzO1xuaW1wb3J0IElRdWFsaWZpZWRLZXkgPSB3ZWF2ZWpzLmFwaS5kYXRhLklRdWFsaWZpZWRLZXk7XG5pbXBvcnQgSUxpbmthYmxlRHluYW1pY09iamVjdCA9IHdlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlRHluYW1pY09iamVjdDtcbmltcG9ydCBMaW5rYWJsZUJvb2xlYW4gPSB3ZWF2ZWpzLmNvcmUuTGlua2FibGVCb29sZWFuO1xuaW1wb3J0IExpbmthYmxlU3RyaW5nID0gd2VhdmVqcy5jb3JlLkxpbmthYmxlU3RyaW5nO1xuaW1wb3J0IExpbmthYmxlVmFyaWFibGUgPSB3ZWF2ZWpzLmNvcmUuTGlua2FibGVWYXJpYWJsZTtcbmltcG9ydCBDb2x1bW5EYXRhRmlsdGVyID0gd2VhdmVqcy5kYXRhLmtleS5Db2x1bW5EYXRhRmlsdGVyO1xuXG5pbnRlcmZhY2UgSURhdGFGaWx0ZXJQYXRocyB7XG5cdGVkaXRvcjpXZWF2ZVBhdGg7XG5cdGZpbHRlcjpXZWF2ZVBhdGg7XG59XG5cbmludGVyZmFjZSBJRGF0YUZpbHRlclN0YXRlIGV4dGVuZHMgSVZpc1Rvb2xTdGF0ZSB7XG5cdGNvbHVtblN0YXRzOklDb2x1bW5TdGF0aXN0aWNzXG59XG5cbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlLnVpLkRhdGFGaWx0ZXJUb29sXCIsIERhdGFGaWx0ZXJUb29sLCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YUZpbHRlclRvb2wgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVZpc1Rvb2xQcm9wcywgSVZpc1Rvb2xTdGF0ZT4gaW1wbGVtZW50cyBJVmlzVG9vbCB7XG5cblx0cHJpdmF0ZSB0b29sUGF0aDpXZWF2ZVBhdGg7XG5cdHByaXZhdGUgcGF0aHM6SURhdGFGaWx0ZXJQYXRocztcblx0cHJpdmF0ZSBmaWx0ZXI6V2VhdmVQYXRoO1xuXHRwcml2YXRlIGVkaXRvcjpXZWF2ZVBhdGg7XG5cblx0c3RhdGljIERJU0NSRVRFRklMVEVSQ0xBU1M6c3RyaW5nID0gXCJ3ZWF2ZS5lZGl0b3JzOjpEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3JcIjtcblx0c3RhdGljIFJBTkdFRklMVEVSQ0xBU1M6c3RyaW5nID0gXCJ3ZWF2ZS5lZGl0b3JzOjpOdW1lcmljUmFuZ2VEYXRhRmlsdGVyRWRpdG9yXCI7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6SVZpc1Rvb2xQcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHR0aGlzLnRvb2xQYXRoID0gdGhpcy5wcm9wcy50b29sUGF0aDtcblx0XHR0aGlzLmZpbHRlciA9IHRoaXMudG9vbFBhdGgucHVzaChcImZpbHRlclwiLCBudWxsKTtcblx0XHR0aGlzLmVkaXRvciA9IHRoaXMudG9vbFBhdGgucHVzaChcImVkaXRvclwiLCBudWxsKTtcblx0XHR0aGlzLnNldHVwQ2FsbGJhY2tzKCk7XG5cdH1cblxuXHRwcml2YXRlIHNldHVwQ2FsbGJhY2tzKCkge1xuXHRcdHRoaXMuZmlsdGVyLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdHRoaXMuZWRpdG9yLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcblx0e1xuXG5cdH1cblxuXHRnZXQgdGl0bGUoKTpzdHJpbmcge1xuXHQgICByZXR1cm4gKHRoaXMudG9vbFBhdGguZ2V0VHlwZSgncGFuZWxUaXRsZScpID8gdGhpcy50b29sUGF0aC5nZXRTdGF0ZSgncGFuZWxUaXRsZScpIDogJycpIHx8IHRoaXMudG9vbFBhdGguZ2V0UGF0aCgpLnBvcCgpO1xuXHR9XG5cblx0cmVuZGVyKCk6SlNYLkVsZW1lbnQge1xuXHRcdHZhciBlZGl0b3JUeXBlOnN0cmluZyA9IHRoaXMuZWRpdG9yLmdldFR5cGUoKTtcblx0XHRpZihlZGl0b3JUeXBlID09IERhdGFGaWx0ZXJUb29sLkRJU0NSRVRFRklMVEVSQ0xBU1MpIHtcblx0XHRcdHJldHVybiA8RGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yIGVkaXRvcj17dGhpcy5lZGl0b3J9IGZpbHRlcj17dGhpcy5maWx0ZXJ9Lz5cblx0XHR9IGVsc2UgaWYgKGVkaXRvclR5cGUgPT0gRGF0YUZpbHRlclRvb2wuUkFOR0VGSUxURVJDTEFTUyl7XG5cdFx0XHRyZXR1cm4gPE51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IgZWRpdG9yPXt0aGlzLmVkaXRvcn0gZmlsdGVyPXt0aGlzLmZpbHRlcn0vPlxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gPGRpdi8+Oy8vIGJsYW5rIHRvb2xcblx0XHR9XG5cdH1cbn1cbnJlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9uKFwid2VhdmUudWk6OkRhdGFGaWx0ZXJUb29sXCIsIERhdGFGaWx0ZXJUb29sKTtcblxuaW50ZXJmYWNlIE51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3JQcm9wcyB7XG5cdGVkaXRvcjpXZWF2ZVBhdGhcblx0ZmlsdGVyOldlYXZlUGF0aFxufVxuXG5pbnRlcmZhY2UgTnVtZXJpY1JhbmdlRGF0YUZpbHRlckVkaXRvclN0YXRlIHtcblxufVxuXG5jbGFzcyBOdW1lcmljUmFuZ2VEYXRhRmlsdGVyRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PE51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3JQcm9wcywgTnVtZXJpY1JhbmdlRGF0YUZpbHRlckVkaXRvclN0YXRlPiB7XG5cblx0cHVibGljIGNvbHVtbjpJQXR0cmlidXRlQ29sdW1uO1xuXHRwdWJsaWMgZW5hYmxlZDpMaW5rYWJsZUJvb2xlYW47XG5cdHB1YmxpYyB2YWx1ZXM6TGlua2FibGVWYXJpYWJsZTtcblx0cHVibGljIGZpbHRlcjpDb2x1bW5EYXRhRmlsdGVyO1xuXHRwdWJsaWMgZm9yY2VEaXNjcmV0ZVZhbHVlczpMaW5rYWJsZUJvb2xlYW47XG5cblx0cHJpdmF0ZSBtaW46bnVtYmVyO1xuXHRwcml2YXRlIG1heDpudW1iZXI7XG5cdHByaXZhdGUgb3B0aW9uczphbnk7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6TnVtZXJpY1JhbmdlRGF0YUZpbHRlckVkaXRvclByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMuZmlsdGVyID0gdGhpcy5wcm9wcy5maWx0ZXIuZ2V0T2JqZWN0KCkgYXMgQ29sdW1uRGF0YUZpbHRlcjtcblx0XHR0aGlzLnZhbHVlcyA9IHRoaXMuZmlsdGVyLnZhbHVlcztcblx0XHR0aGlzLmNvbHVtbiA9IHRoaXMuZmlsdGVyLmNvbHVtbjtcblx0XHR0aGlzLmZvcmNlRGlzY3JldGVWYWx1ZXMgPSB0aGlzLnByb3BzLmVkaXRvci5nZXRPYmplY3QoXCJmb3JjZURpc2NyZXRlVmFsdWVzXCIpO1xuXHRcdHRoaXMub3B0aW9ucyA9IFtdO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6RGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yUHJvcHMpIHtcblx0XHR0aGlzLmZpbHRlciA9IHRoaXMucHJvcHMuZmlsdGVyLmdldE9iamVjdCgpIGFzIENvbHVtbkRhdGFGaWx0ZXI7XG5cdFx0dGhpcy52YWx1ZXMgPSB0aGlzLmZpbHRlci52YWx1ZXM7XG5cdFx0dGhpcy5jb2x1bW4gPSB0aGlzLmZpbHRlci5jb2x1bW47XG5cdFx0dGhpcy5mb3JjZURpc2NyZXRlVmFsdWVzID0gdGhpcy5wcm9wcy5lZGl0b3IuZ2V0T2JqZWN0KFwiZm9yY2VEaXNjcmV0ZVZhbHVlc1wiKTtcblx0fVxuXG5cdHByb3RlY3RlZCBoYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyhuZXdTdGF0ZTphbnkpXG5cdHtcblxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0V2VhdmUuZ2V0Q2FsbGJhY2tzKHRoaXMuZm9yY2VEaXNjcmV0ZVZhbHVlcykuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMuY29sdW1uQ2hhbmdlZCk7XG5cdFx0V2VhdmUuZ2V0Q2FsbGJhY2tzKHRoaXMuY29sdW1uKS5hZGRHcm91cGVkQ2FsbGJhY2sodGhpcywgdGhpcy5jb2x1bW5DaGFuZ2VkKTtcblx0fVxuXG5cdG9uQ2hhbmdlKHNlbGVjdGVkVmFsdWVzOm51bWJlcltdKSB7XG5cdFx0dGhpcy52YWx1ZXMuc3RhdGUgPSBzZWxlY3RlZFZhbHVlcztcblx0fVxuXG5cdGNvbHVtbkNoYW5nZWQoKSB7XG5cdFx0dGhpcy5vcHRpb25zID0gXy5zb3J0QnlPcmRlcihfLnVuaXEodGhpcy5jb2x1bW4ua2V5cy5tYXAoKGtleTpJUXVhbGlmaWVkS2V5KSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR2YWx1ZTogdGhpcy5jb2x1bW4uZ2V0VmFsdWVGcm9tS2V5KGtleSwgTnVtYmVyKSxcblx0XHRcdFx0bGFiZWw6IHRoaXMuY29sdW1uLmdldFZhbHVlRnJvbUtleShrZXksIFN0cmluZylcblx0XHRcdH07XG5cdFx0fSksIFwidmFsdWVcIiksIFtcInZhbHVlXCJdLCBbXCJhc2NcIl0pO1xuXHRcdHRoaXMuZm9yY2VVcGRhdGUoKTtcblx0fVxuXG5cdHJlbmRlcigpOkpTWC5FbGVtZW50IHtcblx0XHRsZXQgdmFsdWVzOmFueSA9IHRoaXMudmFsdWVzLnN0YXRlO1xuXHRcdGlmICh0aGlzLmZvcmNlRGlzY3JldGVWYWx1ZXMudmFsdWUpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIDx1aS5IQm94IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGhlaWdodDpcIjEwMCVcIiwgYWxpZ25JdGVtczpcImNlbnRlclwiLCBwYWRkaW5nOiAxMH19PlxuXHRcdFx0XHRcdDx1aS5IU2xpZGVyIHR5cGU9XCJudW1lcmljLWRpc2NyZXRlXCIgdmFsdWVzPXt0aGlzLm9wdGlvbnN9IHNlbGVjdGVkVmFsdWVzPXt2YWx1ZXN9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyl9Lz5cblx0XHRcdFx0PC91aS5IQm94Pjtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldHVybiA8dWkuSEJveCBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBoZWlnaHQ6XCIxMDAlXCIsIGFsaWduSXRlbXM6XCJjZW50ZXJcIiwgcGFkZGluZzogMTB9fT5cblx0XHRcdFx0XHQ8dWkuSFNsaWRlciB0eXBlPVwibnVtZXJpY1wiICB2YWx1ZXM9e3RoaXMub3B0aW9uc30gc2VsZWN0ZWRWYWx1ZXM9e3ZhbHVlc30gb25DaGFuZ2U9e3RoaXMub25DaGFuZ2UuYmluZCh0aGlzKX0vPlxuXHRcdFx0XHQ8L3VpLkhCb3g+O1xuXHRcdH1cblx0fVxufVxuLy9XZWF2ZS5yZWdpc3RlckNsYXNzKFwid2VhdmUuZWRpdG9ycy5OdW1lcmljUmFuZ2VEYXRhRmlsdGVyRWRpdG9yXCIsIE51bWVyaWNSYW5nZURhdGFGaWx0ZXJFZGl0b3IsIFt3ZWF2ZWpzLmFwaS5jb3JlLklMaW5rYWJsZU9iamVjdFdpdGhOZXdQcm9wZXJ0aWVzXSk7XG5cbmludGVyZmFjZSBEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3JQcm9wcyB7XG5cdGVkaXRvcjpXZWF2ZVBhdGhcblx0ZmlsdGVyOldlYXZlUGF0aFxufVxuXG5pbnRlcmZhY2UgRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yU3RhdGUge1xuXG59XG5cbmNsYXNzIERpc2NyZXRlVmFsdWVzRGF0YUZpbHRlckVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3JQcm9wcywgRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yU3RhdGU+IHtcblxuXHRzdGF0aWMgTEFZT1VUX0xJU1Q6c3RyaW5nID0gXCJMaXN0XCI7XG5cdHN0YXRpYyBMQVlPVVRfQ09NQk86c3RyaW5nID0gXCJDb21ib0JveFwiO1xuXHRzdGF0aWMgTEFZT1VUX1ZTTElERVI6c3RyaW5nID0gXCJWU2xpZGVyXCI7XG5cdHN0YXRpYyBMQVlPVVRfSFNMSURFUjpzdHJpbmcgPSBcIkhTbGlkZXJcIjtcblx0c3RhdGljIExBWU9VVF9DSEVDS0JPWExJU1Q6c3RyaW5nID0gXCJDaGVja0JveExpc3RcIjtcblxuXHRwdWJsaWMgc2hvd1BsYXlCdXR0b246TGlua2FibGVCb29sZWFuO1xuXHRwdWJsaWMgc2hvd1RvZ2dsZTpMaW5rYWJsZUJvb2xlYW47XG5cdHB1YmxpYyBzaG93VG9nZ2xlTGFiZWw6TGlua2FibGVCb29sZWFuO1xuXHRwdWJsaWMgbGF5b3V0TW9kZTpMaW5rYWJsZVN0cmluZztcblx0cHVibGljIGZpbHRlcjpDb2x1bW5EYXRhRmlsdGVyO1xuXHRwdWJsaWMgY29sdW1uOklBdHRyaWJ1dGVDb2x1bW47XG5cdHB1YmxpYyBlbmFibGVkOkxpbmthYmxlQm9vbGVhbjtcblx0cHVibGljIHZhbHVlczpMaW5rYWJsZVZhcmlhYmxlO1xuXG5cdHByaXZhdGUgb3B0aW9uczphbnk7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6RGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yUHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0dGhpcy5sYXlvdXRNb2RlID0gdGhpcy5wcm9wcy5lZGl0b3IuZ2V0T2JqZWN0KFwibGF5b3V0TW9kZVwiKTtcblx0XHR0aGlzLnNob3dUb2dnbGUgPSB0aGlzLnByb3BzLmVkaXRvci5nZXRPYmplY3QoXCJzaG93VG9nZ2xlXCIpO1xuXHRcdHRoaXMuc2hvd1RvZ2dsZUxhYmVsID0gdGhpcy5wcm9wcy5lZGl0b3IuZ2V0T2JqZWN0KFwic2hvd1RvZ2dsZUxhYmVsXCIpO1xuXHRcdHRoaXMuZmlsdGVyID0gdGhpcy5wcm9wcy5maWx0ZXIuZ2V0T2JqZWN0KCkgYXMgQ29sdW1uRGF0YUZpbHRlcjtcblx0XHR0aGlzLnZhbHVlcyA9IHRoaXMuZmlsdGVyLnZhbHVlcztcblx0XHR0aGlzLmNvbHVtbiA9IHRoaXMuZmlsdGVyLmNvbHVtbjtcblx0XHR0aGlzLmVuYWJsZWQgPSB0aGlzLmZpbHRlci5lbmFibGVkO1xuXHRcdHRoaXMub3B0aW9ucyA9IFtdO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6RGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yUHJvcHMpIHtcblx0XHR0aGlzLmxheW91dE1vZGUgPSB0aGlzLnByb3BzLmVkaXRvci5nZXRPYmplY3QoXCJsYXlvdXRNb2RlXCIpO1xuXHRcdHRoaXMuc2hvd1RvZ2dsZSA9IHRoaXMucHJvcHMuZWRpdG9yLmdldE9iamVjdChcInNob3dUb2dnbGVcIik7XG5cdFx0dGhpcy5zaG93VG9nZ2xlTGFiZWwgPSB0aGlzLnByb3BzLmVkaXRvci5nZXRPYmplY3QoXCJzaG93VG9nZ2xlTGFiZWxcIik7XG5cdFx0dGhpcy5maWx0ZXIgPSB0aGlzLnByb3BzLmZpbHRlci5nZXRPYmplY3QoKSBhcyBDb2x1bW5EYXRhRmlsdGVyO1xuXHRcdHRoaXMudmFsdWVzID0gdGhpcy5maWx0ZXIudmFsdWVzO1xuXHRcdHRoaXMuY29sdW1uID0gdGhpcy5maWx0ZXIuY29sdW1uO1xuXHRcdHRoaXMuZW5hYmxlZCA9IHRoaXMuZmlsdGVyLmVuYWJsZWQ7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRXZWF2ZS5nZXRDYWxsYmFja3ModGhpcy5sYXlvdXRNb2RlKS5hZGRHcm91cGVkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG5cdFx0V2VhdmUuZ2V0Q2FsbGJhY2tzKHRoaXMuc2hvd1RvZ2dsZSkuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdFdlYXZlLmdldENhbGxiYWNrcyh0aGlzLnNob3dUb2dnbGVMYWJlbCkuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdFdlYXZlLmdldENhbGxiYWNrcyh0aGlzLmNvbHVtbikuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMuY29sdW1uQ2hhbmdlZCk7XG5cdH1cblxuXHRjb2x1bW5DaGFuZ2VkKCkge1xuXHRcdHRoaXMub3B0aW9ucyA9IF8uc29ydEJ5T3JkZXIoXy51bmlxKHRoaXMuY29sdW1uLmtleXMubWFwKChrZXk6SVF1YWxpZmllZEtleSkgPT4ge1xuXHRcdFx0bGV0IHZhbDpzdHJpbmcgPSB0aGlzLmNvbHVtbi5nZXRWYWx1ZUZyb21LZXkoa2V5LCBTdHJpbmcpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmFsdWU6IHZhbCxcblx0XHRcdFx0bGFiZWw6IHZhbFxuXHRcdFx0fTtcblx0XHR9KSwgXCJ2YWx1ZVwiKSwgW1widmFsdWVcIl0sIFtcImFzY1wiXSk7XG5cdFx0dGhpcy5mb3JjZVVwZGF0ZSgpO1xuXHR9XG5cblx0b25DaGFuZ2Uoc2VsZWN0ZWRWYWx1ZXM6c3RyaW5nW10pIHtcblx0XHR0aGlzLnZhbHVlcy5zdGF0ZSA9IHNlbGVjdGVkVmFsdWVzO1xuXHR9XG5cblx0cHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcblx0e1xuXG5cdH1cblxuXHRyZW5kZXIoKTpKU1guRWxlbWVudCB7XG5cdFx0bGV0IHZhbHVlczphbnkgPSB0aGlzLnZhbHVlcy5zdGF0ZTtcblxuXHRcdHN3aXRjaCAodGhpcy5sYXlvdXRNb2RlICYmIHRoaXMubGF5b3V0TW9kZS52YWx1ZSkge1xuXHRcdFx0Y2FzZSBEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3IuTEFZT1VUX0NIRUNLQk9YTElTVDpcblx0XHRcdFx0cmV0dXJuIDx1aS5DaGVja0JveExpc3QgdmFsdWVzPXt0aGlzLm9wdGlvbnN9IHNlbGVjdGVkVmFsdWVzPXt2YWx1ZXN9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyl9Lz5cblx0XHRcdGNhc2UgRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yLkxBWU9VVF9MSVNUOlxuXHRcdFx0XHRyZXR1cm4gPHVpLkxpc3RJdGVtIHZhbHVlcz17dGhpcy5vcHRpb25zfSBzZWxlY3RlZFZhbHVlcz17dmFsdWVzfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpfS8+XG5cdFx0XHRjYXNlIERpc2NyZXRlVmFsdWVzRGF0YUZpbHRlckVkaXRvci5MQVlPVVRfSFNMSURFUjpcblx0XHRcdFx0cmV0dXJuIDx1aS5IQm94IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGhlaWdodDpcIjEwMCVcIiwgYWxpZ25JdGVtczpcImNlbnRlclwiLCBwYWRkaW5nOiAxMH19PlxuXHRcdFx0XHRcdFx0XHQ8dWkuSFNsaWRlciB0eXBlPVwiY2F0ZWdvcmljYWxcIiB2YWx1ZXM9e3RoaXMub3B0aW9uc30gc2VsZWN0ZWRWYWx1ZXM9e3ZhbHVlc30gb25DaGFuZ2U9e3RoaXMub25DaGFuZ2UuYmluZCh0aGlzKX0vPlxuXHRcdFx0XHRcdFx0PC91aS5IQm94Pjtcblx0XHRcdGNhc2UgRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yLkxBWU9VVF9WU0xJREVSOlxuXHRcdFx0XHRyZXR1cm4gPHVpLlZCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgaGVpZ2h0OlwiMTAwJVwiLCBhbGlnbkl0ZW1zOlwiY2VudGVyXCIsIHBhZGRpbmc6IDEwfX0+XG5cdFx0XHRcdFx0XHRcdDx1aS5WU2xpZGVyIHR5cGU9XCJjYXRlZ29yaWNhbFwiIHZhbHVlcz17dGhpcy5vcHRpb25zfSBzZWxlY3RlZFZhbHVlcz17dmFsdWVzfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpfS8+XG5cdFx0XHRcdFx0XHQ8L3VpLlZCb3g+O1xuXHRcdFx0Y2FzZSBEaXNjcmV0ZVZhbHVlc0RhdGFGaWx0ZXJFZGl0b3IuTEFZT1VUX0NPTUJPOlxuXHRcdFx0XHRyZXR1cm4gPHVpLlZCb3ggc3R5bGU9e3toZWlnaHQ6XCIxMDAlXCIsIGZsZXg6MS4wLCBhbGlnbkl0ZW1zOlwiY2VudGVyXCJ9fT5cblx0XHRcdFx0XHRcdFx0PERyb3Bkb3duQnV0dG9uIHRpdGxlPXt2YWx1ZXNbMF19IGlkPVwiYnMuZHJvcGRvd25cIj5cblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm9wdGlvbnMubWFwKChvcHRpb246c3RyaW5nLCBpbmRleDpudW1iZXIpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuICA8TWVudUl0ZW0gYWN0aXZlPXt2YWx1ZXMuaW5kZXhPZihvcHRpb24pID4gLTF9IGtleT17aW5kZXh9IG9uU2VsZWN0PXsoKSA9PiB7IHRoaXMudmFsdWVzLnN0YXRlID0gW29wdGlvbl07IH19PntvcHRpb259PC9NZW51SXRlbT5cblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQ8L0Ryb3Bkb3duQnV0dG9uPlxuXHRcdFx0XHRcdFx0PC91aS5WQm94Pjtcblx0XHR9XG5cdH1cbn1cbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlLmVkaXRvcnMuRGlzY3JldGVWYWx1ZXNEYXRhRmlsdGVyRWRpdG9yXCIsIHt9LCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuIl19