"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactDom = require("react-dom");

var ReactDOM = _interopRequireWildcard(_reactDom);

var _swfobjectAmd = require("swfobject-amd");

var swfobject = _interopRequireWildcard(_swfobjectAmd);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/swfobject/swfobject.d.ts"/>

var Swfobject = function (_React$Component) {
    _inherits(Swfobject, _React$Component);

    function Swfobject(props) {
        _classCallCheck(this, Swfobject);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Swfobject).call(this, props));
    }

    _createClass(Swfobject, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            swfobject.embedSWF(this.props.swfUrl, ReactDOM.findDOMNode(this.refs["swfobject"]), "100%", "100%", this.props.swfVersionStr, this.props.xiSwfUrlStr, this.props.flashvars, this.props.params, this.props.attributes, this.props.onLoad);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { style: this.props.style },
                React.createElement(
                    "div",
                    { ref: "swfobject" },
                    React.createElement(
                        "p",
                        null,
                        "To view this page ensure that Adobe Flash Player version 10.2.0 or greater is installed."
                    ),
                    React.createElement(
                        "a",
                        { href: "http://www.adobe.com/go/getflashplayer" },
                        React.createElement("img", { src: "http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player" })
                    )
                )
            );
        }
    }]);

    return Swfobject;
}(React.Component);

exports.default = Swfobject;

Swfobject.defaultProps = {
    swfUrl: "",
    xiSwfUrlStr: "playerProductInstall.swf",
    swfVersionStr: "10.2.0",
    params: {
        quality: "high",
        bgcolor: "#ffffff",
        allowscriptaccess: "sameDomain",
        allowfullscreen: "true",
        base: window.location.protocol + "//" + window.location.host
    },
    flashvars: {},
    attributes: {
        id: "flash",
        name: "flash",
        align: "middle"
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dmb2JqZWN0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyY3RzL3N3Zm9iamVjdC50c3giXSwibmFtZXMiOlsiU3dmb2JqZWN0IiwiU3dmb2JqZWN0LmNvbnN0cnVjdG9yIiwiU3dmb2JqZWN0LmNvbXBvbmVudERpZE1vdW50IiwiU3dmb2JqZWN0LnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQUssQUFBTSxBQUFPLEFBQ3ZCOzs7O0lBQUssQUFBUSxBQUFNLEFBQVcsQUFDOUI7Ozs7SUFBSyxBQUFTLEFBQU0sQUFBZSxBQXVCMUM7Ozs7Ozs7Ozs7Ozs7OztBQXVCSSx1QkFBWSxBQUFxQixPQUM3Qjs7OzRGQUFNLEFBQUssQUFBQyxBQUFDLEFBQ2pCLEFBQUMsQUFFRCxBQUFpQjs7Ozs7O0FBRWIsQUFBUyxzQkFBQyxBQUFRLFNBQ2QsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFNLFFBQUUsQUFBUSxTQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDLGVBQy9ELEFBQU0sUUFBRSxBQUFNLFFBQ2QsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFhLGVBQUUsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFXLGFBQ2hELEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBUyxXQUFFLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVSxZQUFFLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxBQUFDLEFBQUMsQUFDM0YsQUFBQyxBQUVELEFBQU07Ozs7O0FBQ0YsQUFBTSxBQUFDOztrQkFDRSxBQUFLLEFBQUMsT0FBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssQUFBQyxBQUN6QjtnQkFBQSxBQUFDLEFBQUc7O3NCQUFDLEFBQUcsS0FBQyxBQUFXLEFBQ2hCO29CQUFBLEFBQUMsQUFBQyxBQUNFLEFBRUosQUFBRSxBQUFDLEFBQ0g7Ozs7O29CQUFBLEFBQUMsQUFBQzs7MEJBQUMsQUFBSSxNQUFDLEFBQXdDO3dCQUFDLEFBQUMsQUFBRyw2QkFBQyxBQUFHLEtBQUMsQUFBdUcsQUFDakssQUFBRSxBQUFDLEFBQ1AsQUFBRSxBQUFHLEFBQ1QsQUFBRSxBQUFHLEFBQUMsQUFDVCxBQUFDLEFBQ04sQUFBQyxBQUNMLEFBQUM7O2lCQVpXLEFBQUMsQUFBRzs7Ozs7O0VBdEN1QixBQUFLLE1BQUMsQUFBUzs7OztBQUUzQyxVQUFZLGVBQW1CO0FBQ2xDLEFBQU0sWUFBRSxBQUFFO0FBQ1YsQUFBVyxpQkFBRSxBQUEwQjtBQUN2QyxBQUFhLG1CQUFFLEFBQVE7QUFDdkIsQUFBTSxZQUFFO0FBQ0osQUFBTyxpQkFBRSxBQUFNO0FBQ2YsQUFBTyxpQkFBRSxBQUFTO0FBQ2xCLEFBQWlCLDJCQUFFLEFBQVk7QUFDL0IsQUFBZSx5QkFBRSxBQUFNO0FBQ3ZCLEFBQUksY0FBRSxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVEsV0FBRyxBQUFJLE9BQUcsQUFBTSxPQUFDLEFBQVEsU0FBQyxBQUFJLEFBQy9EOztBQUNELEFBQVMsZUFBRSxBQUVWO0FBQ0QsQUFBVSxnQkFBRTtBQUNSLEFBQUUsWUFBRSxBQUFPO0FBQ1gsQUFBSSxjQUFFLEFBQU87QUFDYixBQUFLLGVBQUUsQUFBUSxBQUNsQixBQUNKLEFBNkJKIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3Mvc3dmb2JqZWN0L3N3Zm9iamVjdC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCAqIGFzIFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCAqIGFzIHN3Zm9iamVjdCBmcm9tIFwic3dmb2JqZWN0LWFtZFwiO1xuXG5pbnRlcmZhY2UgSVN3Zk9iamVjdFByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8U3dmb2JqZWN0PiB7XG4gICAgc3dmVXJsOnN0cmluZztcbiAgICB4aVN3ZlVybFN0cj86c3RyaW5nO1xuICAgIHN3ZlZlcnNpb25TdHI/OnN0cmluZztcbiAgICBmbGFzaHZhcnM/Ok9iamVjdDtcbiAgICBwYXJhbXM/OiB7XG4gICAgICAgIHF1YWxpdHk/OnN0cmluZztcbiAgICAgICAgYmdjb2xvcj86c3RyaW5nO1xuICAgICAgICBhbGxvd3NjcmlwdGFjY2Vzcz86c3RyaW5nO1xuICAgICAgICBhbGxvd2Z1bGxzY3JlZW4/OnN0cmluZztcbiAgICAgICAgYmFzZT86c3RyaW5nO1xuICAgIH0sXG4gICAgYXR0cmlidXRlczoge1xuICAgICAgICBpZDpzdHJpbmc7XG4gICAgICAgIG5hbWU/OnN0cmluZztcbiAgICAgICAgYWxpZ24/OnN0cmluZztcbiAgICB9LFxuICAgIHN0eWxlPzphbnksXG4gICAgb25Mb2FkPzogKGNhbGxiYWNrT2JqOiBzd2ZvYmplY3QuSUNhbGxiYWNrT2JqKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN3Zm9iamVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJU3dmT2JqZWN0UHJvcHMsIGFueT4ge1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wczpJU3dmT2JqZWN0UHJvcHMgPSB7XG4gICAgICAgIHN3ZlVybDogXCJcIixcbiAgICAgICAgeGlTd2ZVcmxTdHI6IFwicGxheWVyUHJvZHVjdEluc3RhbGwuc3dmXCIsXG4gICAgICAgIHN3ZlZlcnNpb25TdHI6IFwiMTAuMi4wXCIsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgcXVhbGl0eTogXCJoaWdoXCIsXG4gICAgICAgICAgICBiZ2NvbG9yOiBcIiNmZmZmZmZcIixcbiAgICAgICAgICAgIGFsbG93c2NyaXB0YWNjZXNzOiBcInNhbWVEb21haW5cIixcbiAgICAgICAgICAgIGFsbG93ZnVsbHNjcmVlbjogXCJ0cnVlXCIsXG4gICAgICAgICAgICBiYXNlOiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdFxuICAgICAgICB9LFxuICAgICAgICBmbGFzaHZhcnM6IHtcblxuICAgICAgICB9LFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBpZDogXCJmbGFzaFwiLFxuICAgICAgICAgICAgbmFtZTogXCJmbGFzaFwiLFxuICAgICAgICAgICAgYWxpZ246IFwibWlkZGxlXCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklTd2ZPYmplY3RQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG5cbiAgICAgICAgc3dmb2JqZWN0LmVtYmVkU1dGKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zd2ZVcmwsIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1tcInN3Zm9iamVjdFwiXSksXG4gICAgICAgICAgICBcIjEwMCVcIiwgXCIxMDAlXCIsXG4gICAgICAgICAgICB0aGlzLnByb3BzLnN3ZlZlcnNpb25TdHIsIHRoaXMucHJvcHMueGlTd2ZVcmxTdHIsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZsYXNodmFycywgdGhpcy5wcm9wcy5wYXJhbXMsIHRoaXMucHJvcHMuYXR0cmlidXRlcywgdGhpcy5wcm9wcy5vbkxvYWQpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9PlxuICAgICAgICAgICAgICAgIDxkaXYgcmVmPVwic3dmb2JqZWN0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgVG8gdmlldyB0aGlzIHBhZ2UgZW5zdXJlIHRoYXQgQWRvYmUgRmxhc2ggUGxheWVyIHZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDEwLjIuMCBvciBncmVhdGVyIGlzIGluc3RhbGxlZC5cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPSdodHRwOi8vd3d3LmFkb2JlLmNvbS9nby9nZXRmbGFzaHBsYXllcic+PGltZyBzcmM9XCJodHRwOi8vd3d3LmFkb2JlLmNvbS9pbWFnZXMvc2hhcmVkL2Rvd25sb2FkX2J1dHRvbnMvZ2V0X2ZsYXNoX3BsYXllci5naWYnIGFsdD0nR2V0IEFkb2JlIEZsYXNoIHBsYXllclwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==