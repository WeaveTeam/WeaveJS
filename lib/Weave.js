"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _swfobject = require("./swfobject");

var _swfobject2 = _interopRequireDefault(_swfobject);

var _WeaveTool = require("./WeaveTool");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../typings/react/react.d.ts"/>

var Weave = function (_React$Component) {
    _inherits(Weave, _React$Component);

    function Weave(props) {
        _classCallCheck(this, Weave);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Weave).call(this, props));
    }

    _createClass(Weave, [{
        key: "onSwfLoaded",
        value: function onSwfLoaded(event) {
            event.ref.weaveReady = this.weaveReady.bind(this);
        }
    }, {
        key: "weaveReady",
        value: function weaveReady(weave) {
            this.weave = weave;
            this.props.onWeaveReady(weave);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(_swfobject2.default, { swfUrl: "../weave.swf", attributes: { id: "weave" }, onLoad: this.onSwfLoaded.bind(this), style: { height: this.props.height, maxHeight: this.props.height, width: this.props.width } });
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {}
    }, {
        key: "destroy",
        value: function destroy() {}
    }, {
        key: "resize",
        value: function resize() {}
    }, {
        key: "title",
        get: function get() {
            return "Weave";
        }
    }]);

    return Weave;
}(React.Component);

exports.default = Weave;

(0, _WeaveTool.registerToolImplementation)("Weave", Weave);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2VhdmUuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjdHMvV2VhdmUudHN4Il0sIm5hbWVzIjpbIldlYXZlIiwiV2VhdmUuY29uc3RydWN0b3IiLCJXZWF2ZS5vblN3ZkxvYWRlZCIsIldlYXZlLndlYXZlUmVhZHkiLCJXZWF2ZS5yZW5kZXIiLCJXZWF2ZS5jb21wb25lbnREaWRVcGRhdGUiLCJXZWF2ZS5jb21wb25lbnRXaWxsVW5tb3VudCIsIldlYXZlLnRpdGxlIiwiV2VhdmUuZGVzdHJveSIsIldlYXZlLnJlc2l6ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUVZLEFBQUssQUFBTSxBQUFPLEFBQ3ZCLEFBQVMsQUFBTSxBQUFhLEFBRTVCLEFBQUMsQUFBMEIsQUFBQyxBQUFNLEFBQWEsQUFjdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlJLG1CQUFZLEFBQWlCLE9BQ3pCOzs7d0ZBQU0sQUFBSyxBQUFDLEFBQUMsQUFDakIsQUFBQyxBQUVELEFBQVc7Ozs7O29DQUFFLEFBQWtCO0FBQzFCLEFBQUssa0JBQUMsQUFBVyxJQUFDLEFBQVUsYUFBRyxBQUFJLEtBQUMsQUFBVSxXQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxBQUMvRCxBQUFDLEFBRUQsQUFBVTs7OzttQ0FBRSxBQUFpQjtBQUN6QixBQUFJLGlCQUFDLEFBQUssUUFBRyxBQUFLLEFBQUM7QUFDbkIsQUFBSSxpQkFBQyxBQUFLLE1BQUMsQUFBWSxhQUFDLEFBQUssQUFBQyxBQUFDLEFBQ25DLEFBQUMsQUFFRCxBQUFNOzs7OztBQUNGLEFBQU0sQUFBQyxtQkFBQyxBQUFDLEFBQVMsMkNBQUMsQUFBTSxRQUFDLEFBQWMsZ0JBQUMsQUFBVSxBQUFDLFlBQUMsRUFBQyxBQUFFLElBQUUsQUFBTyxBQUFDLEFBQUMsV0FBQyxBQUFNLEFBQUMsUUFBQyxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxRQUFFLEFBQVMsV0FBRSxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQU0sUUFBRSxBQUFLLE9BQUUsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFFLEFBQUMsQUFBQyxBQUMzTSxBQUFDLEFBRUQsQUFBa0I7Ozs7NkNBRWxCLEFBQUMsQUFFRCxBQUFvQjs7OytDQUVwQixBQUFDLEFBRUQsQUFBSSxBQUFLOzs7a0NBTVQsQUFBQyxBQUVELEFBQU07OztpQ0FFTixBQUFDLEFBQ0wsQUFBQyxBQUVEOzs7O0FBWlEsQUFBTSxtQkFBQyxBQUFPLEFBQUMsQUFDbkIsQUFBQyxBQUVELEFBQU87Ozs7O0VBakNTLEFBQUssTUFBQyxBQUFTOztrQkEwQ3BCLEFBQUssQUFBQzs7QUFFckIsQUFBMEIsMkNBQUMsQUFBTyxTQUFFLEFBQUssQUFBQyxBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBTd2ZPYmplY3QgZnJvbSBcIi4vc3dmb2JqZWN0XCI7XG5pbXBvcnQge0lDYWxsYmFja09ian0gZnJvbSBcInN3Zm9iamVjdC1hbWRcIjtcbmltcG9ydCB7cmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb259IGZyb20gXCIuL1dlYXZlVG9vbFwiO1xuXG5kZWNsYXJlIHR5cGUgV2VhdmVPYmplY3QgPSBhbnk7XG5cbmludGVyZmFjZSBJV2VhdmVQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzIDxXZWF2ZT4ge1xuICAgIG9uV2VhdmVSZWFkeTogRnVuY3Rpb247XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIElXZWF2ZVN0YXRlIHtcblxufVxuXG5jbGFzcyBXZWF2ZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCA8SVdlYXZlUHJvcHMsIElXZWF2ZVN0YXRlPiB7XG5cbiAgICBwcml2YXRlIHdlYXZlOldlYXZlT2JqZWN0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SVdlYXZlUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cblxuICAgIG9uU3dmTG9hZGVkIChldmVudDpJQ2FsbGJhY2tPYmopIHtcbiAgICAgICAgKGV2ZW50LnJlZiBhcyBhbnkpLndlYXZlUmVhZHkgPSB0aGlzLndlYXZlUmVhZHkuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICB3ZWF2ZVJlYWR5ICh3ZWF2ZTpXZWF2ZU9iamVjdCkge1xuICAgICAgICB0aGlzLndlYXZlID0gd2VhdmU7XG4gICAgICAgIHRoaXMucHJvcHMub25XZWF2ZVJlYWR5KHdlYXZlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoPFN3Zk9iamVjdCBzd2ZVcmw9XCIuLi93ZWF2ZS5zd2ZcIiBhdHRyaWJ1dGVzPXt7aWQ6IFwid2VhdmVcIn19IG9uTG9hZD17dGhpcy5vblN3ZkxvYWRlZC5iaW5kKHRoaXMpfSBzdHlsZT17e2hlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsIG1heEhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsIHdpZHRoOiB0aGlzLnByb3BzLndpZHRofX0vPik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkgOiB2b2lkIHtcblxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkgOiB2b2lkIHtcblxuICAgIH1cblxuICAgIGdldCB0aXRsZSgpIDogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiV2VhdmVcIjtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkgOiB2b2lkIHtcblxuICAgIH1cblxuICAgIHJlc2l6ZSgpIDogdm9pZCB7XG5cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYXZlO1xuXG5yZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbihcIldlYXZlXCIsIFdlYXZlKTsiXX0=