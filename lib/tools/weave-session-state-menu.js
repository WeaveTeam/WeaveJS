"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _WeaveTool = require("../WeaveTool");

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _ui = require("../react-ui/ui");

var _ui2 = _interopRequireDefault(_ui);

var _reactBootstrap = require("react-bootstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../utils/StandardLib.ts"/>

//TODO: This is a hack to allow react to be imported in generated JSX. Without this, import is missing and render encounters an exception
var stub = React;
var sessionStateMenuStyle = { display: "flex", flex: 1, height: "100%", flexDirection: "column", overflow: "auto" };
var sessionStateComboBoxStyle = { display: "flex", flex: 1, height: "100%", flexDirection: "column" };

var SessionStateMenuTool = function (_React$Component) {
    _inherits(SessionStateMenuTool, _React$Component);

    function SessionStateMenuTool(props) {
        _classCallCheck(this, SessionStateMenuTool);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SessionStateMenuTool).call(this, props));

        _this.toolPath = _this.props.toolPath;
        _this.toolPath.push("choices").addCallback(_this, _this.forceUpdate);
        _this.toolPath.push("selectedChoice").addCallback(_this, _this.forceUpdate);
        _this.toolPath.push("layoutMode").addCallback(_this, _this.forceUpdate);
        return _this;
    }

    _createClass(SessionStateMenuTool, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "handleItemClick",
        value: function handleItemClick(index, event) {
            this.toolPath.state("selectedChoice", this.choices.getNames()[index]);
            var targets = this.toolPath.push("targets");
            var choice = this.choices.getState(index);
            targets.forEach(choice, function (value, key) {
                this.push(key, null).state(value);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            this.choices = this.toolPath.push("choices");
            var selectedChoice = this.toolPath.getState("selectedChoice");
            var layoutMode = this.toolPath.getState("layoutMode");
            var menus = this.choices.getNames().map(function (choice, index) {
                if (layoutMode === "ComboBox") {
                    return choice === selectedChoice ? React.createElement(
                        _reactBootstrap.MenuItem,
                        { active: true, key: index, onSelect: _this2.handleItemClick.bind(_this2, index) },
                        choice
                    ) : React.createElement(
                        _reactBootstrap.MenuItem,
                        { key: index, onSelect: _this2.handleItemClick.bind(_this2, index) },
                        choice
                    );
                } else {
                    return choice === selectedChoice ? React.createElement(
                        _reactBootstrap.ListGroupItem,
                        { active: true, key: index, onClick: _this2.handleItemClick.bind(_this2, index) },
                        choice
                    ) : React.createElement(
                        _reactBootstrap.ListGroupItem,
                        { key: index, onClick: _this2.handleItemClick.bind(_this2, index) },
                        choice
                    );
                }
            });
            var container;
            if (layoutMode === "ComboBox") {
                container = React.createElement(
                    _ui2.default.VBox,
                    { style: { height: "100%", flex: 1.0, alignItems: "center" } },
                    React.createElement(
                        _reactBootstrap.DropdownButton,
                        { title: selectedChoice, id: "dropdown-" + this.toolPath.getState("class") },
                        menus
                    )
                );
            } else {
                container = React.createElement(
                    _reactBootstrap.ListGroup,
                    null,
                    menus
                );
            }
            return React.createElement(
                "div",
                { style: layoutMode === "ComboBox" ? sessionStateComboBoxStyle : sessionStateMenuStyle },
                container
            );
        }
    }]);

    return SessionStateMenuTool;
}(React.Component);

exports.default = SessionStateMenuTool;

(0, _WeaveTool.registerToolImplementation)("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
//Weave.registerClass("weavejs.tools.SessionStateMenuTool", SessionStateMenuTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtc2Vzc2lvbi1zdGF0ZS1tZW51LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3Rvb2xzL3dlYXZlLXNlc3Npb24tc3RhdGUtbWVudS50c3giXSwibmFtZXMiOlsiU2Vzc2lvblN0YXRlTWVudVRvb2wiLCJTZXNzaW9uU3RhdGVNZW51VG9vbC5jb25zdHJ1Y3RvciIsIlNlc3Npb25TdGF0ZU1lbnVUb29sLmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiU2Vzc2lvblN0YXRlTWVudVRvb2wuY29tcG9uZW50RGlkTW91bnQiLCJTZXNzaW9uU3RhdGVNZW51VG9vbC5oYW5kbGVJdGVtQ2xpY2siLCJTZXNzaW9uU3RhdGVNZW51VG9vbC5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVVZLEFBQUssQUFBTSxBQUFPLEFBQ3ZCLEFBQUUsQUFBTSxBQUFnQixBQUN4QixBQUFDLEFBQWEsQUFBRSxBQUFTLEFBQUUsQUFBYyxBQUFFLEFBQVEsQUFBQyxBQUFNLEFBQWlCLEFBS2xGLEFBQXlJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUN6SSxJQUFJLEFBQUksT0FBTyxBQUFLLEFBQUM7QUFDckIsSUFBTSxBQUFxQix3QkFBaUIsRUFBQyxBQUFPLFNBQUMsQUFBTSxRQUFFLEFBQUksTUFBQyxBQUFDLEdBQUUsQUFBTSxRQUFDLEFBQU0sUUFBRSxBQUFhLGVBQUMsQUFBUSxVQUFFLEFBQVEsVUFBQyxBQUFNLEFBQUMsQUFBQztBQUM3SCxJQUFNLEFBQXlCLDRCQUFpQixFQUFDLEFBQU8sU0FBQyxBQUFNLFFBQUUsQUFBSSxNQUFDLEFBQUMsR0FBRSxBQUFNLFFBQUMsQUFBTSxRQUFFLEFBQWEsZUFBQyxBQUFRLEFBQUMsQUFBQyxBQUVoSDs7Ozs7QUFJSSxrQ0FBWSxBQUFtQixPQUMzQjs7OzRHQUFNLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksY0FBQyxBQUFRLFdBQUcsQUFBSSxNQUFDLEFB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QUEwQiwyQ0FBQyxBQUFnQyxrQ0FBRSxBQUFvQixBQUFDLEFBQUMsQUFDbkYsQUFBdUkiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QtYm9vdHN0cmFwL3JlYWN0LWJvb3RzdHJhcC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlscy9TdGFuZGFyZExpYi50c1wiLz5cblxuaW1wb3J0IHtJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuaW1wb3J0IHtJVmlzVG9vbH0gZnJvbSBcIi4vSVZpc1Rvb2xcIjtcblxuaW1wb3J0IHtyZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbn0gZnJvbSBcIi4uL1dlYXZlVG9vbFwiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdWkgZnJvbSBcIi4uL3JlYWN0LXVpL3VpXCI7XG5pbXBvcnQge0xpc3RHcm91cEl0ZW0sIExpc3RHcm91cCwgRHJvcGRvd25CdXR0b24sIE1lbnVJdGVtfSBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7TW91c2VFdmVudH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge0NTU1Byb3BlcnRpZXN9IGZyb20gXCJyZWFjdFwiO1xuXG4vL1RPRE86IFRoaXMgaXMgYSBoYWNrIHRvIGFsbG93IHJlYWN0IHRvIGJlIGltcG9ydGVkIGluIGdlbmVyYXRlZCBKU1guIFdpdGhvdXQgdGhpcywgaW1wb3J0IGlzIG1pc3NpbmcgYW5kIHJlbmRlciBlbmNvdW50ZXJzIGFuIGV4Y2VwdGlvblxudmFyIHN0dWI6YW55ID0gUmVhY3Q7XG5jb25zdCBzZXNzaW9uU3RhdGVNZW51U3R5bGU6Q1NTUHJvcGVydGllcyA9IHtkaXNwbGF5OlwiZmxleFwiLCBmbGV4OjEsIGhlaWdodDpcIjEwMCVcIiwgZmxleERpcmVjdGlvbjpcImNvbHVtblwiLCBvdmVyZmxvdzpcImF1dG9cIn07XG5jb25zdCBzZXNzaW9uU3RhdGVDb21ib0JveFN0eWxlOkNTU1Byb3BlcnRpZXMgPSB7ZGlzcGxheTpcImZsZXhcIiwgZmxleDoxLCBoZWlnaHQ6XCIxMDAlXCIsIGZsZXhEaXJlY3Rpb246XCJjb2x1bW5cIn07XG5cbmNsYXNzIFNlc3Npb25TdGF0ZU1lbnVUb29sIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElWaXNUb29sUHJvcHMsIElWaXNUb29sU3RhdGU+IHtcbiAgICBwcml2YXRlIGNob2ljZXM6V2VhdmVQYXRoO1xuICAgIHByb3RlY3RlZCB0b29sUGF0aDpXZWF2ZVBhdGg7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJVmlzVG9vbFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy50b29sUGF0aCA9IHRoaXMucHJvcHMudG9vbFBhdGg7XG4gICAgICAgIHRoaXMudG9vbFBhdGgucHVzaChcImNob2ljZXNcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMudG9vbFBhdGgucHVzaChcInNlbGVjdGVkQ2hvaWNlXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoLnB1c2goXCJsYXlvdXRNb2RlXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyhuZXdTdGF0ZTphbnkpXG5cdHtcblxuXHR9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB9XG5cbiAgICBoYW5kbGVJdGVtQ2xpY2soaW5kZXg6bnVtYmVyLCBldmVudDpNb3VzZUV2ZW50KTp2b2lkIHtcbiAgICAgICAgdGhpcy50b29sUGF0aC5zdGF0ZShcInNlbGVjdGVkQ2hvaWNlXCIsIHRoaXMuY2hvaWNlcy5nZXROYW1lcygpW2luZGV4XSk7XG4gICAgICAgIHZhciB0YXJnZXRzOldlYXZlUGF0aCA9IHRoaXMudG9vbFBhdGgucHVzaChcInRhcmdldHNcIik7XG4gICAgICAgIHZhciBjaG9pY2U6YW55ID0gdGhpcy5jaG9pY2VzLmdldFN0YXRlKGluZGV4KTtcbiAgICAgICAgdGFyZ2V0cy5mb3JFYWNoKGNob2ljZSwgZnVuY3Rpb24gKHZhbHVlOmFueSwga2V5OnN0cmluZykge1xuICAgICAgICAgICAgdGhpcy5wdXNoKGtleSwgbnVsbCkuc3RhdGUodmFsdWUpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5jaG9pY2VzID0gdGhpcy50b29sUGF0aC5wdXNoKFwiY2hvaWNlc1wiKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkQ2hvaWNlOnN0cmluZyA9IHRoaXMudG9vbFBhdGguZ2V0U3RhdGUoXCJzZWxlY3RlZENob2ljZVwiKTtcbiAgICAgICAgdmFyIGxheW91dE1vZGU6c3RyaW5nID0gdGhpcy50b29sUGF0aC5nZXRTdGF0ZShcImxheW91dE1vZGVcIik7XG5cbiAgICAgICAgdmFyIG1lbnVzOkpTWC5FbGVtZW50W10gPSB0aGlzLmNob2ljZXMuZ2V0TmFtZXMoKS5tYXAoKGNob2ljZTpzdHJpbmcsIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgaWYobGF5b3V0TW9kZSA9PT0gXCJDb21ib0JveFwiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hvaWNlID09PSBzZWxlY3RlZENob2ljZSA/PE1lbnVJdGVtIGFjdGl2ZSBrZXk9e2luZGV4fSBvblNlbGVjdD17dGhpcy5oYW5kbGVJdGVtQ2xpY2suYmluZCh0aGlzLCBpbmRleCl9PntjaG9pY2V9PC9NZW51SXRlbT5cbiAgICAgICAgICAgICAgICAgICAgOjxNZW51SXRlbSBrZXk9e2luZGV4fSBvblNlbGVjdD17dGhpcy5oYW5kbGVJdGVtQ2xpY2suYmluZCh0aGlzLCBpbmRleCl9PntjaG9pY2V9PC9NZW51SXRlbT47XG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNob2ljZSA9PT0gc2VsZWN0ZWRDaG9pY2UgPzxMaXN0R3JvdXBJdGVtIGFjdGl2ZSBrZXk9e2luZGV4fSBvbkNsaWNrPXt0aGlzLmhhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMsIGluZGV4KX0+e2Nob2ljZX08L0xpc3RHcm91cEl0ZW0+XG4gICAgICAgICAgICAgICAgICAgIDo8TGlzdEdyb3VwSXRlbSBrZXk9e2luZGV4fSBvbkNsaWNrPXt0aGlzLmhhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMsIGluZGV4KX0+e2Nob2ljZX08L0xpc3RHcm91cEl0ZW0+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29udGFpbmVyOkpTWC5FbGVtZW50O1xuXG4gICAgICAgIGlmKGxheW91dE1vZGUgPT09IFwiQ29tYm9Cb3hcIil7XG4gICAgICAgICAgICBjb250YWluZXIgPVxuICAgICAgICAgICAgICAgIDx1aS5WQm94IHN0eWxlPXt7aGVpZ2h0OlwiMTAwJVwiLCBmbGV4OjEuMCwgYWxpZ25JdGVtczpcImNlbnRlclwifX0+XG4gICAgICAgICAgICAgICAgICAgIDxEcm9wZG93bkJ1dHRvbiB0aXRsZT17c2VsZWN0ZWRDaG9pY2V9IGlkPXtgZHJvcGRvd24tJHt0aGlzLnRvb2xQYXRoLmdldFN0YXRlKFwiY2xhc3NcIil9YH0gPlxuICAgICAgICAgICAgICAgICAgICAgICAge21lbnVzfVxuICAgICAgICAgICAgICAgICAgICA8L0Ryb3Bkb3duQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdWkuVkJveD5cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb250YWluZXIgPVxuICAgICAgICAgICAgICAgIDxMaXN0R3JvdXA+XG4gICAgICAgICAgICAgICAgICAgIHttZW51c31cbiAgICAgICAgICAgICAgICA8L0xpc3RHcm91cD5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoPGRpdiBzdHlsZT17bGF5b3V0TW9kZSA9PT0gXCJDb21ib0JveFwiID8gc2Vzc2lvblN0YXRlQ29tYm9Cb3hTdHlsZSA6IHNlc3Npb25TdGF0ZU1lbnVTdHlsZX0+XG4gICAgICAgICAgICB7Y29udGFpbmVyfVxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2Vzc2lvblN0YXRlTWVudVRvb2w7XG5cbnJlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9uKFwid2VhdmUudWk6OlNlc3Npb25TdGF0ZU1lbnVUb29sXCIsIFNlc3Npb25TdGF0ZU1lbnVUb29sKTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuU2Vzc2lvblN0YXRlTWVudVRvb2xcIiwgU2Vzc2lvblN0YXRlTWVudVRvb2wsIFt3ZWF2ZWpzLmFwaS5jb3JlLklMaW5rYWJsZU9iamVjdFdpdGhOZXdQcm9wZXJ0aWVzXSk7XG4iXX0=