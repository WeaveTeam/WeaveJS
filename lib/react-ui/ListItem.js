"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _Hbox = require("./Hbox");

var _Hbox2 = _interopRequireDefault(_Hbox);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _reactVendorPrefix = require("react-vendor-prefix");

var Prefixer = _interopRequireWildcard(_reactVendorPrefix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/react-swf/react-swf.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

var ListItem = function (_React$Component) {
    _inherits(ListItem, _React$Component);

    function ListItem(props) {
        _classCallCheck(this, ListItem);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ListItem).call(this, props));

        _this.state = {
            selectedValues: props.selectedValues || []
        };
        if (props.selectedValues) {
            _this.lastIndexClicked = props.selectedValues.length - 1;
        }
        return _this;
    }

    _createClass(ListItem, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.selectedValues) {
                this.setState({
                    selectedValues: nextProps.selectedValues
                });
            }
        }
    }, {
        key: "handleChange",
        value: function handleChange(value, event) {
            var selectedValues = this.state.selectedValues.splice(0);
            // new state of the item in the list
            var currentIndexClicked = selectedValues.indexOf(value);
            // ctrl selection
            if (event.ctrlKey || event.metaKey) {
                if (currentIndexClicked > -1) {
                    selectedValues.splice(currentIndexClicked, 1);
                } else {
                    selectedValues.push(value);
                }
                this.lastIndexClicked = currentIndexClicked;
            } else if (event.shiftKey) {
                selectedValues = [];
                if (this.lastIndexClicked == null) {} else {
                    var start = this.lastIndexClicked;
                    var end = this.props.values.indexOf(value);
                    if (start > end) {
                        var temp = start;
                        start = end;
                        end = temp;
                    }
                    for (var i = start; i <= end; i++) {
                        selectedValues.push(this.props.values[i]);
                    }
                }
            } else {
                // if there was only one record selected
                // and we are clicking on it again, then we want to
                // clear the selection.
                if (selectedValues.length == 1 && selectedValues[0] == value) {
                    selectedValues = [];
                    this.lastIndexClicked = null;
                } else {
                    selectedValues = [value];
                    this.lastIndexClicked = this.props.values.indexOf(value);
                }
            }
            if (this.props.onChange) this.props.onChange(selectedValues);
            this.setState({
                selectedValues: selectedValues
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var values = this.props.values || [];
            var spanStyle = {
                width: "100%",
                height: "100%",
                userSelect: "none"
            };
            spanStyle = Prefixer.prefix({ styles: spanStyle }).styles;
            return React.createElement(
                "div",
                { style: { height: "100%", width: "100%", overflow: "auto" } },
                values.map(function (value, index) {
                    var hovered = _this2.state.hovered == index;
                    var selected = _this2.state.selectedValues.indexOf(value) > -1;
                    var style = {
                        padding: 5,
                        height: 30,
                        width: "100%"
                    };
                    if (selected && hovered) {
                        style["backgroundColor"] = "#99D6FF";
                    }
                    if (selected && !hovered) {
                        style["backgroundColor"] = "#80CCFF";
                    }
                    if (!selected && hovered) {
                        style["backgroundColor"] = _StandardLib2.default.rgba(153, 214, 255, 0.4);
                    }
                    if (!selected && !hovered) {
                        style["backgroundColor"] = "#FFFFFF";
                    }
                    return React.createElement(
                        _Hbox2.default,
                        { key: index, style: style, onMouseOver: function onMouseOver(event) {
                                _this2.setState({ hovered: index });
                            }, onClick: _this2.handleChange.bind(_this2, values[index]) },
                        React.createElement(
                            "span",
                            { style: spanStyle },
                            _this2.props.labels ? _this2.props.labels[index] : value
                        )
                    );
                })
            );
        }
    }]);

    return ListItem;
}(React.Component);

exports.default = ListItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdEl0ZW0uanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvcmVhY3QtdWkvTGlzdEl0ZW0udHN4Il0sIm5hbWVzIjpbIkxpc3RJdGVtIiwiTGlzdEl0ZW0uY29uc3RydWN0b3IiLCJMaXN0SXRlbS5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiTGlzdEl0ZW0uaGFuZGxlQ2hhbmdlIiwiTGlzdEl0ZW0ucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBTVksQUFBSyxBQUFNLEFBQU8sQUFLdkIsQUFBSSxBQUFNLEFBQVEsQUFDbEIsQUFBVyxBQUFNLEFBQXNCLEFBQ3ZDOzs7Ozs7Ozs7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBcUIsQUFhL0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNSSxzQkFBWSxBQUFvQjs7O2dHQUN0QixBQUFLLEFBQUMsQUFBQzs7QUFDYixBQUFJLGNBQUMsQUFBSyxRQUFHO0FBQ1QsQUFBYyw0QkFBRSxBQUFLLE1BQUMsQUFBYyxrQkFBSSxBQUFFLEFBQzdDLEFBQUM7VUFIRjtBQUlBLEFBQUUsWUFBQyxBQUFLLE1BQUMsQUFBYyxBQUFDLGdCQUFDLEFBQUM7QUFDdEIsQUFBSSxrQkFBQyxBQUFnQixtQkFBRyxBQUFLLE1BQUMsQUFBYyxlQUFDLEFBQU0sU0FBRyxBQUFDLEFBQUMsQUFDNUQsQUFBQyxBQUNMLEFBQUMsQUFFRCxBQUF5Qjs7Ozs7OztrREFBQyxBQUF3QjtBQUM5QyxBQUFFLGdCQUFDLEFBQVMsVUFBQyxBQUFjLEFBQUM7QUFDeEIsQUFBSSxxQkFBQyxBQUFRLFNBQUM7QUFDVixBQUFjLG9DQUFFLEFBQVMsVUFBQyxBQUFjLEFBQzNDLEFBQUMsQUFBQyxBQUNQLEFBQUMsQUFDTCxBQUFDLEFBRUQsQUFBWTttQkFQcUIsQUFBQzs7Ozs7cUNBT3JCLEFBQVksT0FBRSxBQUFzQjtBQUM3QyxnQkFBSSxBQUFjLGlCQUFZLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBYyxlQUFDLEFBQU0sT0FB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QUFpQixBQUFDLHFCQUFHLEFBQVMsQUFBQyxBQUN6QyxBQUFDOztBQUVELEFBQU0sQUFBQzs7MEJBQ0csQUFBRyxBQUFDLEtBQUMsQUFBSyxBQUFDLE9BQUMsQUFBSyxBQUFDLE9BQUMsQUFBSyxBQUFDLE9BQUMsQUFBVyxBQUFDLGtDQUFFLEFBQXNCO0FBQU8sQUFBSSx1Q0FBQyxBQUFRLFNBQUMsRUFBQyxBQUFPLFNBQUUsQUFBSyxBQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7NkJBQWhFLEVBQWlFLEFBQU8sQUFBQyxTQUFDLEFBQUksT0FBQyxBQUFZLGFBQUMsQUFBSSxBQUFDLEFBQUksYUFBRSxBQUFNLE9BQUMsQUFBSyxBQUFDLEFBQUMsQUFBQyxBQUNoSzt3QkFBQSxBQUFDLEFBQUk7OzhCQUFDLEFBQUssQUFBQyxPQUFDLEFBQVMsQUFBQyxBQUFDOzRCQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBTSxTQUFHLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQUssQUFBQyxTQUFHLEFBQUssQUFBQyxBQUFFLEFBQUksQUFDdkYsQUFBRSxBQUFJLEFBQUMsQUFDVixBQUFDLEFBQ04sQUFBQyxBQUFDLEFBRVYsQUFBRSxBQUFHLEFBQUMsQUFDVCxBQUFDLEFBQ04sQUFBQyxBQUNMLEFBQUM7eUJBVDJCLEFBQUMsQUFBSTs7aUJBM0JGLENBRm5CLEFBQUMsQUFBRzs7Ozs7O0VBdEdzQixBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC1ib290c3RyYXAvcmVhY3QtYm9vdHN0cmFwLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC1zd2YvcmVhY3Qtc3dmLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC12ZW5kb3ItcHJlZml4L3JlYWN0LXZlbmRvci1wcmVmaXguZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgKiBhcyBicyBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBWQm94IGZyb20gXCIuL1ZCb3hcIjtcbmltcG9ydCBIQm94IGZyb20gXCIuL0hib3hcIjtcbmltcG9ydCBTdGFuZGFyZExpYiBmcm9tIFwiLi4vdXRpbHMvU3RhbmRhcmRMaWJcIjtcbmltcG9ydCAqIGFzIFByZWZpeGVyIGZyb20gXCJyZWFjdC12ZW5kb3ItcHJlZml4XCI7XG5cbmludGVyZmFjZSBJTGlzdEl0ZW1Qcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPExpc3RJdGVtPiB7XG4gICAgdmFsdWVzOmFueVtdO1xuICAgIGxhYmVscz86c3RyaW5nW107XG4gICAgb25DaGFuZ2U/OihzZWxlY3RlZFZhbHVlczpzdHJpbmdbXSkgPT4gdm9pZDtcbiAgICBzZWxlY3RlZFZhbHVlcz86c3RyaW5nW107XG59XG5cbmludGVyZmFjZSBJTGlzdEl0ZW1zdGF0ZSB7XG4gICAgc2VsZWN0ZWRWYWx1ZXM/OnN0cmluZ1tdO1xuICAgIGhvdmVyZWQ/Om51bWJlcjtcbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3RJdGVtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElMaXN0SXRlbVByb3BzLCBJTGlzdEl0ZW1zdGF0ZT4ge1xuXG4gICAgcHJpdmF0ZSBjaGVja2JveGVzOkhUTUxFbGVtZW50W107XG4gICAgcHJpdmF0ZSBsYXN0SW5kZXhDbGlja2VkOm51bWJlcjtcbiAgICBwcml2YXRlIHNlbGVjdGVkVmFsdWVzOnN0cmluZ1tdO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SUxpc3RJdGVtUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZXM6IHByb3BzLnNlbGVjdGVkVmFsdWVzIHx8IFtdXG4gICAgICAgIH07XG4gICAgICAgIGlmKHByb3BzLnNlbGVjdGVkVmFsdWVzKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleENsaWNrZWQgPSBwcm9wcy5zZWxlY3RlZFZhbHVlcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6SUxpc3RJdGVtUHJvcHMpIHtcbiAgICAgICAgaWYobmV4dFByb3BzLnNlbGVjdGVkVmFsdWVzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlczogbmV4dFByb3BzLnNlbGVjdGVkVmFsdWVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNoYW5nZSh2YWx1ZTpzdHJpbmcsIGV2ZW50OlJlYWN0Lk1vdXNlRXZlbnQpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkVmFsdWVzOnN0cmluZ1tdID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFZhbHVlcy5zcGxpY2UoMCk7XG4gICAgICAgIC8vIG5ldyBzdGF0ZSBvZiB0aGUgaXRlbSBpbiB0aGUgbGlzdFxuXG4gICAgICAgIHZhciBjdXJyZW50SW5kZXhDbGlja2VkOm51bWJlciA9IHNlbGVjdGVkVmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgICAgICAvLyBjdHJsIHNlbGVjdGlvblxuICAgICAgICBpZihldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmKGN1cnJlbnRJbmRleENsaWNrZWQgPiAtMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlcy5zcGxpY2UoY3VycmVudEluZGV4Q2xpY2tlZCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxhc3RJbmRleENsaWNrZWQgPSBjdXJyZW50SW5kZXhDbGlja2VkO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNoaWZ0IHNlbGVjdGlvblxuICAgICAgICBlbHNlIGlmKGV2ZW50LnNoaWZ0S2V5KVxuICAgICAgICB7XG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgaWYodGhpcy5sYXN0SW5kZXhDbGlja2VkID09IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQ6bnVtYmVyID0gdGhpcy5sYXN0SW5kZXhDbGlja2VkO1xuICAgICAgICAgICAgICAgIHZhciBlbmQ6bnVtYmVyID0gdGhpcy5wcm9wcy52YWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZihzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcDpudW1iZXIgPSBzdGFydDtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBlbmQ7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRlbXA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpOm51bWJlciA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVmFsdWVzLnB1c2godGhpcy5wcm9wcy52YWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzaW5nbGUgc2VsZWN0aW9uXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgd2FzIG9ubHkgb25lIHJlY29yZCBzZWxlY3RlZFxuICAgICAgICAgICAgLy8gYW5kIHdlIGFyZSBjbGlja2luZyBvbiBpdCBhZ2FpbiwgdGhlbiB3ZSB3YW50IHRvXG4gICAgICAgICAgICAvLyBjbGVhciB0aGUgc2VsZWN0aW9uLlxuICAgICAgICAgICAgaWYoc2VsZWN0ZWRWYWx1ZXMubGVuZ3RoID09IDEgJiYgc2VsZWN0ZWRWYWx1ZXNbMF0gPT0gdmFsdWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RJbmRleENsaWNrZWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmFsdWVzID0gW3ZhbHVlXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RJbmRleENsaWNrZWQgPSB0aGlzLnByb3BzLnZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucHJvcHMub25DaGFuZ2UpXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHNlbGVjdGVkVmFsdWVzKTtcblxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHNlbGVjdGVkVmFsdWVzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpOkpTWC5FbGVtZW50IHtcbiAgICAgICAgdmFyIHZhbHVlczpzdHJpbmdbXSA9IHRoaXMucHJvcHMudmFsdWVzIHx8IFtdO1xuXG4gICAgICAgIHZhciBzcGFuU3R5bGU6UmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiLFxuICAgICAgICAgICAgaGVpZ2h0OlwiMTAwJVwiLFxuICAgICAgICAgICAgdXNlclNlbGVjdDogXCJub25lXCJcbiAgICAgICAgfVxuXG4gICAgICAgIHNwYW5TdHlsZSA9IFByZWZpeGVyLnByZWZpeCh7c3R5bGVzOiBzcGFuU3R5bGV9KS5zdHlsZXM7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3toZWlnaHQ6IFwiMTAwJVwiLCB3aWR0aDogXCIxMDAlXCIsIG92ZXJmbG93OiBcImF1dG9cIn19PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLm1hcCgodmFsdWU6c3RyaW5nLCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3ZlcmVkOmJvb2xlYW4gPSB0aGlzLnN0YXRlLmhvdmVyZWQgPT0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQ6Ym9vbGVhbiA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgPiAtMTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlOlJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDMwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNlbGVjdGVkICYmIGhvdmVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVtcImJhY2tncm91bmRDb2xvclwiXSA9IFwiIzk5RDZGRlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzZWxlY3RlZCAmJiAhaG92ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlW1wiYmFja2dyb3VuZENvbG9yXCJdID0gXCIjODBDQ0ZGXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFzZWxlY3RlZCAmJiBob3ZlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVbXCJiYWNrZ3JvdW5kQ29sb3JcIl0gPSBTdGFuZGFyZExpYi5yZ2JhKDE1MywgMjE0LCAyNTUsIDAuNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFzZWxlY3RlZCAmJiAhaG92ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlW1wiYmFja2dyb3VuZENvbG9yXCJdID0gXCIjRkZGRkZGXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEhCb3gga2V5PXtpbmRleH0gc3R5bGU9e3N0eWxlfSBvbk1vdXNlT3Zlcj17KGV2ZW50OlJlYWN0Lk1vdXNlRXZlbnQpID0+IHsgdGhpcy5zZXRTdGF0ZSh7aG92ZXJlZDogaW5kZXh9KSB9fSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsIHZhbHVlc1tpbmRleF0pfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17c3BhblN0eWxlfT57dGhpcy5wcm9wcy5sYWJlbHMgPyB0aGlzLnByb3BzLmxhYmVsc1tpbmRleF0gOiB2YWx1ZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9IQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=