"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactBootstrap = require("react-bootstrap");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _TableHead = require("./TableHead");

var _TableHead2 = _interopRequireDefault(_TableHead);

var _TableBody = require("./TableBody");

var _TableBody2 = _interopRequireDefault(_TableBody);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

var ReactBootstrapTable = function (_React$Component) {
    _inherits(ReactBootstrapTable, _React$Component);

    function ReactBootstrapTable(props) {
        _classCallCheck(this, ReactBootstrapTable);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ReactBootstrapTable).call(this, props));

        _this.state = {
            selectedIds: props.selectedIds,
            probedIds: props.probedIds
        };
        _this.lastClicked = props.selectedIds[props.selectedIds.length - 1];
        return _this;
    }

    _createClass(ReactBootstrapTable, [{
        key: "onMouseOver",
        value: function onMouseOver(id, status) {
            var probedIds = this.state.probedIds.slice(0);
            // find the selected record location
            var keyLocation = probedIds.indexOf(id);
            if (!status && keyLocation > -1) {
                probedIds.splice(keyLocation, 1);
            } else {
                probedIds.push(id);
            }
            if (this.props.onProbe) {
                this.props.onProbe(probedIds);
            }
            this.setState({
                probedIds: probedIds
            });
        }
    }, {
        key: "onClick",
        value: function onClick(id, event) {
            var _this2 = this;

            var selectedIds = this.state.selectedIds.slice(0);
            // in single selection mode,
            // or ctrl/cmd selcection mode
            // already selected keys get unselected
            // find the selected record location
            var keyLocation = selectedIds.indexOf(id);
            // multiple selection
            if (event.ctrlKey || event.metaKey) {
                // if the record is already in the selection
                // we remove it
                if (keyLocation > -1) {
                    selectedIds.splice(keyLocation, 1);
                } else {
                    selectedIds.push(id);
                }
                this.lastClicked = id;
            } else if (event.shiftKey) {
                selectedIds = [];
                if (this.lastClicked == null) {} else {
                    var start = _.findIndex(this.props.rows, function (row) {
                        return row["id"] == _this2.lastClicked;
                    });
                    var end = _.findIndex(this.props.rows, function (row) {
                        return row["id"] == id;
                    });
                    if (start > end) {
                        var temp = start;
                        start = end;
                        end = temp;
                    }
                    for (var i = start; i <= end; i++) {
                        selectedIds.push(this.props.rows[i]["id"]);
                    }
                }
            } else {
                // if there was only one record selected
                // and we are clicking on it again, then we want to
                // clear the selection.
                if (selectedIds.length == 1 && selectedIds[0] == id) {
                    selectedIds = [];
                    this.lastClicked = null;
                } else {
                    selectedIds = [id];
                    this.lastClicked = id;
                }
            }
            if (this.props.onSelection) {
                this.props.onSelection(selectedIds);
            }
            this.setState({
                selectedIds: selectedIds
            });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState({
                selectedIds: nextProps.selectedIds,
                probedIds: nextProps.probedIds
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var tableContainer = {
                overflow: "auto",
                height: this.props.height
            };
            var selectedIds;
            var probedIds;
            // if(this.props.selectedIds) {
            //     selectedIds = this.props.selectedIds;
            // } else {
            //     selectedIds = this.state.selectedIds;
            // }
            //
            // if(this.props.probedIds) {
            //     probedIds = this.props.probedIds;
            // } else {
            //     probedIds = this.state.probedIds;
            // }
            return React.createElement(
                "div",
                { style: tableContainer },
                React.createElement(
                    _reactBootstrap.Table,
                    { key: "table", ref: "table", striped: this.props.striped, bordered: this.props.bordered, condensed: this.props.condensed, hover: true },
                    React.createElement(_TableHead2.default, { key: "head", ref: function ref(c) {
                            _this3.tableHead = c;
                        }, columnTitles: this.props.columnTitles, idProperty: this.props.idProperty, showIdColumn: this.props.showIdColumn }),
                    React.createElement(_TableBody2.default, { key: "body", ref: function ref(c) {
                            _this3.tableBody = c;
                        }, idProperty: this.props.idProperty, onMouseOver: this.onMouseOver.bind(this), onClick: this.onClick.bind(this), rows: this.props.rows, selectedIds: this.state.selectedIds, probedIds: this.state.probedIds, showIdColumn: this.props.showIdColumn })
                )
            );
        }
    }]);

    return ReactBootstrapTable;
}(React.Component);

exports.default = ReactBootstrapTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhY3RCb290U3RyYXBUYWJsZS5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy9yZWFjdC1ib290c3RyYXAtZGF0YXRhYmxlL1JlYWN0Qm9vdFN0cmFwVGFibGUudHN4Il0sIm5hbWVzIjpbIlJlYWN0Qm9vdHN0cmFwVGFibGUiLCJSZWFjdEJvb3RzdHJhcFRhYmxlLmNvbnN0cnVjdG9yIiwiUmVhY3RCb290c3RyYXBUYWJsZS5vbk1vdXNlT3ZlciIsIlJlYWN0Qm9vdHN0cmFwVGFibGUub25DbGljayIsIlJlYWN0Qm9vdHN0cmFwVGFibGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIlJlYWN0Qm9vdHN0cmFwVGFibGUucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBSVksQUFBSyxBQUFNLEFBQU8sQUFDdkIsQUFBQyxBQUFLLEFBQUMsQUFBTSxBQUFpQixBQUM5Qjs7Ozs7O0lBQUssQUFBQyxBQUFNLEFBQVEsQUFDcEIsQUFBUyxBQUFNLEFBQWEsQUFDNUIsQUFBUyxBQUFNLEFBQWEsQUEwQm5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVUksaUNBQVksQUFBK0I7OzsyR0FDakMsQUFBSyxBQUFDLEFBQUM7O0FBQ2IsQUFBSSxjQUFDLEFBQUssUUFBRztBQUNULEFBQVcseUJBQUUsQUFBSyxNQUFDLEFBQVc7QUFDOUIsQUFBUyx1QkFBRSxBQUFLLE1BQUMsQUFBUyxBQUM3QjtVQUpEO0FBS0EsQUFBSSxjQUFDLEFBQVcsY0FBRyxBQUFLLE1BQUMsQUFBVyxZQUFDLEFBQUssTUFBQyxBQUFXLFlBQUMsQUFBTSxTQUFHLEFBQUMsQUFBQyxBQUFDLEFBQ3ZFLEFBQUMsQUFFRCxBQUFXOzs7Ozs7b0NBQUMsQUFBUyxJQUFFLEFBQWM7QUFFakMsZ0JBQUksQUFBUyxZQUFZLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFDLEFBQUMsQUFBQyxBQUV2RCxBQUFvQyxBQUNwQzs7Z0JB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QyxBQUFDLE9BQ3pDLEFBQU8sQUFBQyxTQUFDLEFBQUksS0FBQyxBQUFPLFFBQUMsQUFBSSxLQUFDLEFBQUksQUFBQyxBQUFDLE9BQ2pDLEFBQUksQUFBQyxNQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLE1BQ3RCLEFBQVcsQUFBQyxhQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVyxBQUFDLGFBQ3BDLEFBQVMsQUFBQyxXQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBUyxBQUFDLFdBQ2hDLEFBQVksQUFBQyxjQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBWSxBQUFDLEFBQ3JELEFBQUUsQUFBSyxBQUNYLEFBQUUsQUFBRyxBQUFDLEFBQ1QsQUFBQyxBQUNOLEFBQUMsQUFDTCxBQUFDO2lCQW5CVyxBQUFDLEFBQUc7YUFEUixBQUFNLEFBQUM7Ozs7O0VBckprQyxBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC1ib290c3RyYXAvcmVhY3QtYm9vdHN0cmFwLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtUYWJsZX0gZnJvbSBcInJlYWN0LWJvb3RzdHJhcFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgVGFibGVIZWFkIGZyb20gXCIuL1RhYmxlSGVhZFwiO1xuaW1wb3J0IFRhYmxlQm9keSBmcm9tIFwiLi9UYWJsZUJvZHlcIjtcbmltcG9ydCB7SVJvd30gZnJvbSBcIi4vVGFibGVSb3dcIjtcbmltcG9ydCB7SUNvbHVtblRpdGxlc30gZnJvbSBcIi4vVGFibGVIZWFkXCI7XG5cbmludGVyZmFjZSBJUmVhY3RCb290c3RyYXBUYWJsZVByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8UmVhY3RCb290c3RyYXBUYWJsZT4ge1xuICAgIHN0cmlwZWQ/OmJvb2xlYW47XG4gICAgYm9yZGVyZWQ/OmJvb2xlYW47XG4gICAgY29uZGVuc2VkPzpib29sZWFuO1xuICAgIGhvdmVyPzpib29sZWFuO1xuICAgIHJvd3M6SVJvd1tdO1xuICAgIGNvbHVtblRpdGxlczpJQ29sdW1uVGl0bGVzO1xuICAgIGhlaWdodDpudW1iZXJ8c3RyaW5nO1xuICAgIHNvcnRhYmxlPzpib29sZWFuO1xuICAgIGlkUHJvcGVydHk6c3RyaW5nO1xuICAgIHNlbGVjdGVkSWRzOnN0cmluZ1tdO1xuICAgIHByb2JlZElkczpzdHJpbmdbXTtcbiAgICBvblByb2JlPzooaWQ6c3RyaW5nW10pID0+IHZvaWQ7XG4gICAgb25TZWxlY3Rpb24/OihpZDpzdHJpbmdbXSkgPT4gdm9pZDtcbiAgICBzaG93SWRDb2x1bW46Ym9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElSZWFjdEJvb3RTdHJhcFRhYmxlU3RhdGUge1xuICAgIHByb2JlZElkcz86c3RyaW5nW107XG4gICAgc2VsZWN0ZWRJZHM/OnN0cmluZ1tdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFjdEJvb3RzdHJhcFRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElSZWFjdEJvb3RzdHJhcFRhYmxlUHJvcHMsIElSZWFjdEJvb3RTdHJhcFRhYmxlU3RhdGU+IHtcblxuICAgIHByaXZhdGUgdGFibGVIZWFkOlRhYmxlSGVhZDtcbiAgICBwcml2YXRlIHRhYmxlQm9keTpUYWJsZUJvZHk7XG4gICAgcHJpdmF0ZSBrZXlEb3duOmJvb2xlYW47XG4gICAgcHJpdmF0ZSBzaGlmdERvd246Ym9vbGVhbjtcbiAgICBwcml2YXRlIGZpcnN0SW5kZXg6bnVtYmVyO1xuICAgIHByaXZhdGUgc2Vjb25kSW5kZXg6bnVtYmVyO1xuICAgIHByaXZhdGUgbGFzdENsaWNrZWQ6c3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SVJlYWN0Qm9vdHN0cmFwVGFibGVQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZElkczogcHJvcHMuc2VsZWN0ZWRJZHMsXG4gICAgICAgICAgICBwcm9iZWRJZHM6IHByb3BzLnByb2JlZElkc1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdENsaWNrZWQgPSBwcm9wcy5zZWxlY3RlZElkc1twcm9wcy5zZWxlY3RlZElkcy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBvbk1vdXNlT3ZlcihpZDpzdHJpbmcsIHN0YXR1czpib29sZWFuKSB7XG5cbiAgICAgICAgdmFyIHByb2JlZElkczpzdHJpbmdbXSA9IHRoaXMuc3RhdGUucHJvYmVkSWRzLnNsaWNlKDApO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIHNlbGVjdGVkIHJlY29yZCBsb2NhdGlvblxuICAgICAgICB2YXIga2V5TG9jYXRpb246bnVtYmVyID0gcHJvYmVkSWRzLmluZGV4T2YoaWQpO1xuICAgICAgICBpZighc3RhdHVzICYmIGtleUxvY2F0aW9uID4gLTEpIHtcbiAgICAgICAgICAgIHByb2JlZElkcy5zcGxpY2Uoa2V5TG9jYXRpb24sIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvYmVkSWRzLnB1c2goaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5wcm9wcy5vblByb2JlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUHJvYmUocHJvYmVkSWRzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByb2JlZElkc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkNsaWNrKGlkOnN0cmluZywgZXZlbnQ6UmVhY3QuTW91c2VFdmVudCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRJZHM6c3RyaW5nW10gPSB0aGlzLnN0YXRlLnNlbGVjdGVkSWRzLnNsaWNlKDApO1xuXG5cbiAgICAgICAgLy8gaW4gc2luZ2xlIHNlbGVjdGlvbiBtb2RlLFxuICAgICAgICAvLyBvciBjdHJsL2NtZCBzZWxjZWN0aW9uIG1vZGVcbiAgICAgICAgLy8gYWxyZWFkeSBzZWxlY3RlZCBrZXlzIGdldCB1bnNlbGVjdGVkXG5cbiAgICAgICAgLy8gZmluZCB0aGUgc2VsZWN0ZWQgcmVjb3JkIGxvY2F0aW9uXG4gICAgICAgIHZhciBrZXlMb2NhdGlvbjpudW1iZXIgPSBzZWxlY3RlZElkcy5pbmRleE9mKGlkKTtcblxuICAgICAgICAvLyBtdWx0aXBsZSBzZWxlY3Rpb25cbiAgICAgICAgaWYoKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSByZWNvcmQgaXMgYWxyZWFkeSBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgICAgICAvLyB3ZSByZW1vdmUgaXRcbiAgICAgICAgICAgIGlmKGtleUxvY2F0aW9uID4gLTEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJZHMuc3BsaWNlKGtleUxvY2F0aW9uLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZElkcy5wdXNoKGlkKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXN0Q2xpY2tlZCA9IGlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hpZnQgc2VsZWN0aW9uXG4gICAgICAgIGVsc2UgaWYoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSWRzID0gW107XG4gICAgICAgICAgICBpZih0aGlzLmxhc3RDbGlja2VkID09IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydDpudW1iZXIgPSBfLmZpbmRJbmRleCh0aGlzLnByb3BzLnJvd3MsIChyb3c6SVJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm93W1wiaWRcIl0gPT0gdGhpcy5sYXN0Q2xpY2tlZDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBlbmQ6bnVtYmVyID0gXy5maW5kSW5kZXgodGhpcy5wcm9wcy5yb3dzLCAocm93OklSb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvd1tcImlkXCJdID09IGlkO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXA6bnVtYmVyID0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSB0ZW1wO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcih2YXIgaTpudW1iZXIgPSBzdGFydDsgaSA8PSBlbmQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZElkcy5wdXNoKHRoaXMucHJvcHMucm93c1tpXVtcImlkXCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNpbmdsZSBzZWxlY3Rpb25cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSB3YXMgb25seSBvbmUgcmVjb3JkIHNlbGVjdGVkXG4gICAgICAgICAgICAvLyBhbmQgd2UgYXJlIGNsaWNraW5nIG9uIGl0IGFnYWluLCB0aGVuIHdlIHdhbnQgdG9cbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBzZWxlY3Rpb24uXG4gICAgICAgICAgICBpZihzZWxlY3RlZElkcy5sZW5ndGggPT0gMSAmJiBzZWxlY3RlZElkc1swXSA9PSBpZClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZElkcyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdENsaWNrZWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkSWRzID0gW2lkXTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDbGlja2VkID0gaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnByb3BzLm9uU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2VsZWN0aW9uKHNlbGVjdGVkSWRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRJZHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6SVJlYWN0Qm9vdHN0cmFwVGFibGVQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkSWRzOiBuZXh0UHJvcHMuc2VsZWN0ZWRJZHMsXG4gICAgICAgICAgICBwcm9iZWRJZHM6IG5leHRQcm9wcy5wcm9iZWRJZHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciB0YWJsZUNvbnRhaW5lcjpSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiBcImF1dG9cIixcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNlbGVjdGVkSWRzOnN0cmluZ1tdO1xuICAgICAgICB2YXIgcHJvYmVkSWRzOnN0cmluZ1tdO1xuXG4gICAgICAgIC8vIGlmKHRoaXMucHJvcHMuc2VsZWN0ZWRJZHMpIHtcbiAgICAgICAgLy8gICAgIHNlbGVjdGVkSWRzID0gdGhpcy5wcm9wcy5zZWxlY3RlZElkcztcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAgIHNlbGVjdGVkSWRzID0gdGhpcy5zdGF0ZS5zZWxlY3RlZElkcztcbiAgICAgICAgLy8gfVxuICAgICAgICAvL1xuICAgICAgICAvLyBpZih0aGlzLnByb3BzLnByb2JlZElkcykge1xuICAgICAgICAvLyAgICAgcHJvYmVkSWRzID0gdGhpcy5wcm9wcy5wcm9iZWRJZHM7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICBwcm9iZWRJZHMgPSB0aGlzLnN0YXRlLnByb2JlZElkcztcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt0YWJsZUNvbnRhaW5lcn0+XG4gICAgICAgICAgICAgICAgPFRhYmxlIGtleT1cInRhYmxlXCIgcmVmPVwidGFibGVcIiBzdHJpcGVkPXt0aGlzLnByb3BzLnN0cmlwZWR9IGJvcmRlcmVkPXt0aGlzLnByb3BzLmJvcmRlcmVkfSBjb25kZW5zZWQ9e3RoaXMucHJvcHMuY29uZGVuc2VkfSBob3Zlcj17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQga2V5PVwiaGVhZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXsoYzpUYWJsZUhlYWQpID0+IHt0aGlzLnRhYmxlSGVhZCA9IGM7fX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5UaXRsZXM9e3RoaXMucHJvcHMuY29sdW1uVGl0bGVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkUHJvcGVydHk9e3RoaXMucHJvcHMuaWRQcm9wZXJ0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93SWRDb2x1bW49e3RoaXMucHJvcHMuc2hvd0lkQ29sdW1ufS8+XG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUJvZHkga2V5PVwiYm9keVwiIHJlZj17KGM6VGFibGVCb2R5KSA9PiB7dGhpcy50YWJsZUJvZHkgPSBjO319XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRQcm9wZXJ0eT17dGhpcy5wcm9wcy5pZFByb3BlcnR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93cz17dGhpcy5wcm9wcy5yb3dzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSWRzPXt0aGlzLnN0YXRlLnNlbGVjdGVkSWRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2JlZElkcz17dGhpcy5zdGF0ZS5wcm9iZWRJZHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0lkQ29sdW1uPXt0aGlzLnByb3BzLnNob3dJZENvbHVtbn0vPlxuICAgICAgICAgICAgICAgIDwvVGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=