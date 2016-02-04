"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _Hbox = require("./Hbox");

var _Hbox2 = _interopRequireDefault(_Hbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/react-swf/react-swf.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

var CheckBoxList = function (_React$Component) {
    _inherits(CheckBoxList, _React$Component);

    function CheckBoxList(props) {
        _classCallCheck(this, CheckBoxList);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CheckBoxList).call(this, props));

        if (_this.props.selectedValues) {
            _this.state = {
                checkboxStates: props.values.map(function (value) {
                    return props.selectedValues.indexOf(value) > -1;
                })
            };
        } else {
            _this.state = {
                checkboxStates: props.values.map(function (value) {
                    return false;
                })
            };
        }
        return _this;
    }

    _createClass(CheckBoxList, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.selectedValues) {
                var checkboxStates = nextProps.values.map(function (value) {
                    return nextProps.selectedValues.indexOf(value) > -1;
                });
                this.setState({
                    checkboxStates: checkboxStates
                });
            }
        }
    }, {
        key: "handleChange",
        value: function handleChange(index, event) {
            var _this2 = this;

            var checkboxState = event.target["checked"];
            var checkboxStates = this.state.checkboxStates.splice(0);
            checkboxStates[index] = checkboxState;
            var selectedValues = [];
            checkboxStates.forEach(function (checkboxState, index) {
                if (checkboxState) {
                    selectedValues.push(_this2.props.values[index]);
                }
            });
            if (this.props.onChange) this.props.onChange(selectedValues);
            this.setState({
                checkboxStates: checkboxStates
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var labelPosition = this.props.labelPosition || "right";
            return React.createElement(
                "div",
                { style: { height: "100%", width: "100%", overflow: "scroll" } },
                this.state.checkboxStates.map(function (checkBoxState, index) {
                    var checkboxItem = [React.createElement("input", { type: "checkbox", checked: checkBoxState, value: _this3.props.values[index], onChange: _this3.handleChange.bind(_this3, index) }), React.createElement(
                        "span",
                        { style: { paddingLeft: 5 } },
                        _this3.props.labels ? _this3.props.labels[index] : _this3.props.values[index]
                    )];
                    return React.createElement(
                        _Hbox2.default,
                        { key: index, style: { height: 30, paddingLeft: 10 } },
                        labelPosition == "right" ? checkboxItem : checkboxItem.reverse()
                    );
                })
            );
        }
    }]);

    return CheckBoxList;
}(React.Component);

exports.default = CheckBoxList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tCb3hMaXN0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3JlYWN0LXVpL0NoZWNrQm94TGlzdC50c3giXSwibmFtZXMiOlsiQ2hlY2tCb3hMaXN0IiwiQ2hlY2tCb3hMaXN0LmNvbnN0cnVjdG9yIiwiQ2hlY2tCb3hMaXN0LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJDaGVja0JveExpc3QuaGFuZGxlQ2hhbmdlIiwiQ2hlY2tCb3hMaXN0LnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUtZLEFBQUssQUFBTSxBQUFPLEFBS3ZCLEFBQUksQUFBTSxBQUFRLEFBYXpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUksMEJBQVksQUFBd0I7OztvR0FDMUIsQUFBSyxBQUFDLEFBQUM7O0FBRWIsQUFBRSxZQUFDLEFBQUksTUFBQyxBQUFLLE1BQUMsQUFBYyxBQUFDO0FBQ3pCLEFBQUksa0JBQUMsQUFBSyxRQUFHO0FBQ1QsQUFBYyxnQ0FBRSxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQUcsY0FBRSxBQUFLO0FBQ25DLEFBQU0sMkJBQUMsQUFBSyxNQUFDLEFBQWMsZUFBQyxBQUFPLFFBQUMsQUFBSyxBQUFDLFNBQUcsQ0FBQyxBQUFDLEFBQUMsQUFDcEQsQUFBQyxBQUFDLEFBQ0wsQUFDTCxBQUFDLEFBQUMsQUFBSTtpQkFKbUM7Y0FGWCxBQUFDOztBQU8zQixBQUFJLGtCQUFDLEFBQUssUUFBRztBQUNULEFBQWMsZ0NBQUUsQUFBSyxNQUFDLEFBQU0sT0FBQyxBQUFHLGNBQUUsQUFBSztBQUNuQyxBQUFNLDJCQUFDLEFBQUssQUFBQyxBQUNqQixBQUFDLEFBQUMsQUFDTCxBQUNMLEFBQUMsQUFDTCxBQUFDLEFBRUQsQUFBeUI7aUJBUG9CO2NBRmxDLEFBQUM7O3FCQVJSOzs7OztrREFpQnNCLEFBQTRCO0FBQ2xELEFBQUUsZ0JBQUMsQUFBUyxVQUFDLEFBQWMsQUFBQztBQUN4QixxQ0FBK0IsQUFBUyxVQUFD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RSxBQUFHLEFBQUMsQUFDVCxBQUFDLEFBQ04sQUFBQyxBQUNMLEFBQUM7O2lCQWpCaUQsQ0FGdEMsQUFBQyxBQUFHOzs7Ozs7RUExRDBCLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0LWJvb3RzdHJhcC9yZWFjdC1ib290c3RyYXAuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0LXN3Zi9yZWFjdC1zd2YuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgKiBhcyBicyBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBWQm94IGZyb20gXCIuL1ZCb3hcIjtcbmltcG9ydCBIQm94IGZyb20gXCIuL0hib3hcIjtcblxuaW50ZXJmYWNlIElDaGVja0JveExpc3RQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPENoZWNrQm94TGlzdD4ge1xuICAgIHZhbHVlczphbnlbXTtcbiAgICBsYWJlbHM/OnN0cmluZ1tdO1xuICAgIG9uQ2hhbmdlPzooc2VsZWN0ZWRWYWx1ZXM6c3RyaW5nW10pID0+IHZvaWQ7XG4gICAgc2VsZWN0ZWRWYWx1ZXM/OnN0cmluZ1tdO1xuICAgIGxhYmVsUG9zaXRpb24/OnN0cmluZztcbn1cblxuaW50ZXJmYWNlIElDaGVja0JveExpc3RTdGF0ZSB7XG4gICAgY2hlY2tib3hTdGF0ZXM6Ym9vbGVhbltdO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tCb3hMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElDaGVja0JveExpc3RQcm9wcywgSUNoZWNrQm94TGlzdFN0YXRlPiB7XG5cbiAgICBwcml2YXRlIGNoZWNrYm94ZXM6SFRNTEVsZW1lbnRbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklDaGVja0JveExpc3RQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgaWYodGhpcy5wcm9wcy5zZWxlY3RlZFZhbHVlcykge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBjaGVja2JveFN0YXRlczogcHJvcHMudmFsdWVzLm1hcCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3BzLnNlbGVjdGVkVmFsdWVzLmluZGV4T2YodmFsdWUpID4gLTE7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgY2hlY2tib3hTdGF0ZXM6IHByb3BzLnZhbHVlcy5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6SUNoZWNrQm94TGlzdFByb3BzKSB7XG4gICAgICAgIGlmKG5leHRQcm9wcy5zZWxlY3RlZFZhbHVlcykge1xuICAgICAgICAgICAgdmFyIGNoZWNrYm94U3RhdGVzOmJvb2xlYW5bXSA9IG5leHRQcm9wcy52YWx1ZXMubWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0UHJvcHMuc2VsZWN0ZWRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgPiAtMTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjaGVja2JveFN0YXRlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDaGFuZ2UoaW5kZXg6bnVtYmVyLCBldmVudDpFdmVudCkge1xuICAgICAgICB2YXIgY2hlY2tib3hTdGF0ZTpib29sZWFuID0gZXZlbnQudGFyZ2V0W1wiY2hlY2tlZFwiXTtcbiAgICAgICAgdmFyIGNoZWNrYm94U3RhdGVzOmJvb2xlYW5bXSA9IHRoaXMuc3RhdGUuY2hlY2tib3hTdGF0ZXMuc3BsaWNlKDApO1xuICAgICAgICBjaGVja2JveFN0YXRlc1tpbmRleF0gPSBjaGVja2JveFN0YXRlO1xuXG4gICAgICAgIHZhciBzZWxlY3RlZFZhbHVlczpzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjaGVja2JveFN0YXRlcy5mb3JFYWNoKChjaGVja2JveFN0YXRlOmJvb2xlYW4sIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgaWYoY2hlY2tib3hTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmFsdWVzLnB1c2godGhpcy5wcm9wcy52YWx1ZXNbaW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYodGhpcy5wcm9wcy5vbkNoYW5nZSlcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uoc2VsZWN0ZWRWYWx1ZXMpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY2hlY2tib3hTdGF0ZXNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6SlNYLkVsZW1lbnQge1xuICAgICAgICB2YXIgbGFiZWxQb3NpdGlvbjpzdHJpbmcgPSB0aGlzLnByb3BzLmxhYmVsUG9zaXRpb24gfHwgXCJyaWdodFwiO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7aGVpZ2h0OiBcIjEwMCVcIiwgd2lkdGg6IFwiMTAwJVwiLCBvdmVyZmxvdzogXCJzY3JvbGxcIn19PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5jaGVja2JveFN0YXRlcy5tYXAoKGNoZWNrQm94U3RhdGU6Ym9vbGVhbiwgaW5kZXg6bnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hlY2tib3hJdGVtOkpTWC5FbGVtZW50W10gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2NoZWNrQm94U3RhdGV9IHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlc1tpbmRleF19IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsIGluZGV4KX0vPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e3BhZGRpbmdMZWZ0OiA1fX0+e3RoaXMucHJvcHMubGFiZWxzID8gdGhpcy5wcm9wcy5sYWJlbHNbaW5kZXhdIDogdGhpcy5wcm9wcy52YWx1ZXNbaW5kZXhdfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIQm94IGtleT17aW5kZXh9IHN0eWxlPXt7aGVpZ2h0OiAzMCwgcGFkZGluZ0xlZnQ6IDEwfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb24gPT0gXCJyaWdodFwiID8gY2hlY2tib3hJdGVtIDogY2hlY2tib3hJdGVtLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9IQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=