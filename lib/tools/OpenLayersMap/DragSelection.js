"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

var _FeatureLayer = require("./Layers/FeatureLayer");

var _FeatureLayer2 = _interopRequireDefault(_FeatureLayer);

var _ProbeInteraction = require("./ProbeInteraction");

var _ProbeInteraction2 = _interopRequireDefault(_ProbeInteraction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

var DragSelectionMode;
(function (DragSelectionMode) {
    DragSelectionMode[DragSelectionMode["SUBTRACT"] = -1] = "SUBTRACT";
    DragSelectionMode[DragSelectionMode["SET"] = 0] = "SET";
    DragSelectionMode[DragSelectionMode["ADD"] = 1] = "ADD";
})(DragSelectionMode || (DragSelectionMode = {}));
;

var DragSelection = function (_ol$interaction$DragB) {
    _inherits(DragSelection, _ol$interaction$DragB);

    function DragSelection() {
        _classCallCheck(this, DragSelection);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DragSelection).call(this, { boxEndCondition: function boxEndCondition() {
                return true;
            } }));

        _this.debouncedUpdateSelection = lodash.debounce(DragSelection.prototype.updateSelection, 25);
        _this.on('boxstart', DragSelection.prototype.onBoxStart, _this);
        _this.on('boxdrag', DragSelection.prototype.onBoxDrag, _this);
        _this.on('boxend', DragSelection.prototype.onBoxEnd, _this);
        return _this;
    }

    _createClass(DragSelection, [{
        key: "onBoxStart",
        value: function onBoxStart(event) {
            if (this.probeInteraction) this.probeInteraction.setActive(false);
            var dragBoxEvent = event;
            var browserEvent = dragBoxEvent.mapBrowserEvent.originalEvent;
            if (browserEvent.ctrlKey && browserEvent.shiftKey) {
                this.mode = DragSelectionMode.SUBTRACT;
            } else if (browserEvent.ctrlKey) {
                this.mode = DragSelectionMode.ADD;
            } else {
                this.mode = DragSelectionMode.SET;
            }
        }
    }, {
        key: "updateSelection",
        value: function updateSelection(extent) {
            var selectedFeatures = new Set();
            var selectFeature = function selectFeature(feature) {
                selectedFeatures.add(feature.getId());
            };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.getMap().getLayers().getArray()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var olLayer = _step.value;

                    var selectable = olLayer.get("selectable");
                    var weaveLayer = olLayer.get("layerObject");
                    if (weaveLayer instanceof _FeatureLayer2.default && selectable) {
                        var source = olLayer.getSource();
                        source.forEachFeatureIntersectingExtent(extent, selectFeature);
                        var keys = Array.from(selectedFeatures);
                        switch (this.mode) {
                            case DragSelectionMode.SET:
                                weaveLayer.selectionKeySet.replaceKeys(keys);
                                break;
                            case DragSelectionMode.ADD:
                                weaveLayer.selectionKeySet.addKeys(keys);
                                break;
                            case DragSelectionMode.SUBTRACT:
                                weaveLayer.selectionKeySet.removeKeys(keys);
                                break;
                        }
                    }
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
        }
    }, {
        key: "onBoxDrag",
        value: function onBoxDrag(event) {
            var extent = this.getGeometry().getExtent();
            this.debouncedUpdateSelection(extent);
        }
    }, {
        key: "onBoxEnd",
        value: function onBoxEnd(event) {
            var extent = this.getGeometry().getExtent();
            this.debouncedUpdateSelection(extent);
            if (this.probeInteraction) this.probeInteraction.setActive(true);
        }
    }, {
        key: "probeInteraction",
        get: function get() {
            if (!this._probeInteraction) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.getMap().getInteractions().getArray()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var interaction = _step2.value;

                        if (interaction instanceof _ProbeInteraction2.default) {
                            this._probeInteraction = interaction;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
            return this._probeInteraction;
        }
    }]);

    return DragSelection;
}(ol.interaction.DragBox);

exports.default = DragSelection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhZ1NlbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvRHJhZ1NlbGVjdGlvbi50cyJdLCJuYW1lcyI6WyJEcmFnU2VsZWN0aW9uTW9kZSIsIkRyYWdTZWxlY3Rpb24iLCJEcmFnU2VsZWN0aW9uLmNvbnN0cnVjdG9yIiwiRHJhZ1NlbGVjdGlvbi5wcm9iZUludGVyYWN0aW9uIiwiRHJhZ1NlbGVjdGlvbi5vbkJveFN0YXJ0IiwiRHJhZ1NlbGVjdGlvbi51cGRhdGVTZWxlY3Rpb24iLCJEcmFnU2VsZWN0aW9uLm9uQm94RHJhZyIsIkRyYWdTZWxlY3Rpb24ub25Cb3hFbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFLWSxBQUFFLEFBQU0sQUFBWSxBQUN6Qjs7OztJQUFLLEFBQU0sQUFBTSxBQUFRLEFBQ3pCLEFBQVksQUFBTSxBQUF1QixBQUV6QyxBQUFnQixBQUFNLEFBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlqRCxJQUFLLEFBSUo7QUFKRCxXQUFLLEFBQWlCO0FBQ3JCLDREQUFhO0FBQ2Isc0RBQU87QUFDUCxzREFBTyxBQUNSLEFBQUM7R0FKSSxBQUFpQixzQkFBakIsQUFBaUIsb0JBSXJCO0FBQUEsQUFBQyxBQUVGOzs7OztBQU1DOzs7cUdBRU8sRUFBRSxBQUFlO3VCQUFRLEFBQUksQUFBRSxBQUFDLEFBQUM7YUFBZCxLQUF6Qjs7QUFFQSxBQUFJLGNBQUMsQUFBd0IsMkJBQUcsQUFBTSxPQUFDLEFBQVEsU0FBQyxBQUFhLGNBQUMsQUFBUyxVQUFDLEFBQWUsaUJBQUUsQUFBRSxBQUFDLEFBQUM7QUFDN0YsQUFBSSxjQUFDLEFBQUUsR0FBQyxBQUFVLFlBQUUsQUFBYSxjQUFDLEFBQVMsVUFBQyxBQUFVLEFBQUUsQUFBSSxBQUFDLEFBQUM7QUFDOUQsQUFBSSxjQUFDLEFBQUUsR0FBQyxBQUFTLFdBQUUsQUFBYSxjQUFDLEFBQVMsVUFBQyxBQUFTLEFB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LEFBQUksaUJBQUMsQUFBd0IseUJBQUMsQUFBTSxBQUFDLEFBQUMsQUFDdkMsQUFBQyxBQUVELEFBQVE7Ozs7aUNBQUMsQUFBUztBQUVqQixnQkFBSSxBQUFNLFNBQUcsQUFBSSxLQUFDLEFBQVcsQUFBRSxjQUFDLEFBQVMsQUFBRSxBQUFDO0FBRTVDLEFBQUksaUJBQUMsQUFBd0IseUJBQUMsQUFBTSxBQUFDLEFBQUM7QUFDdEMsQUFBRSxBQUFDLGdCQUFDLEFBQUksS0FBQyxBQUFnQixBQUFDLGtCQUN6QixBQUFJLEtBQUMsQUFBZ0IsaUJBQUMsQUFBUyxVQUFDLEFBQUksQUFBQyxBQUFDLEFBQ3hDLEFBQUMsQUFDRixBQUFDOzs7OztBQWhGQyxBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBaUIsQUFBQzs7Ozs7O0FBQzNCLEFBQUcsQUFBQyxBQUFDLEFBQUcsMENBQWdCLEFBQUksS0FBQyxBQUFNLEFBQUUsU0FBQyxBQUFlLEFBQUUsa0JBQUMsQUFBUSxBQUFFLEFBQUM7NEJBQTFELEFBQVcsMkJBQWdELEFBQUM7O0FBQ3BFLEFBQUUsQUFBQyw0QkFBQyxBQUFXLEFBQVksQUFBZ0IsQUFBQztBQUMzQyxBQUFJLGlDQUFDLEFBQWlCLG9CQUFHLEFBQVcsQUFBQztBQUNyQyxBQUFLLEFBQUMsQUFDUCxBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUMsa0NBTDhDLEFBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7aUJBRm5CLEFBQUM7O0FBUzlCLEFBQU0sbUJBQUMsQUFBSSxLQUFDLEFBQWlCLEFBQUMsQUFDL0IsQUFBQyxBQUVELEFBQVU7Ozs7O0VBOUJnQyxBQUFFLEdBQUMsQUFBVyxZQUFDLEFBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2pxdWVyeS9qcXVlcnkuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBGZWF0dXJlTGF5ZXIgZnJvbSBcIi4vTGF5ZXJzL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0IExheWVyIGZyb20gXCIuL0xheWVycy9MYXllclwiO1xuaW1wb3J0IFByb2JlSW50ZXJhY3Rpb24gZnJvbSBcIi4vUHJvYmVJbnRlcmFjdGlvblwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcblxuZW51bSBEcmFnU2VsZWN0aW9uTW9kZSB7XG5cdFNVQlRSQUNUID0gLTEsXG5cdFNFVCA9IDAsXG5cdEFERCA9IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyYWdTZWxlY3Rpb24gZXh0ZW5kcyBvbC5pbnRlcmFjdGlvbi5EcmFnQm94XG57XG5cdHByaXZhdGUgbW9kZTogRHJhZ1NlbGVjdGlvbk1vZGU7XG5cdHByaXZhdGUgX3Byb2JlSW50ZXJhY3Rpb246IFByb2JlSW50ZXJhY3Rpb247XG5cdHByaXZhdGUgZGVib3VuY2VkVXBkYXRlU2VsZWN0aW9uOiBGdW5jdGlvbjtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcih7IGJveEVuZENvbmRpdGlvbjogKCkgPT4gdHJ1ZSB9KTtcblxuXHRcdHRoaXMuZGVib3VuY2VkVXBkYXRlU2VsZWN0aW9uID0gbG9kYXNoLmRlYm91bmNlKERyYWdTZWxlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGlvbiwgMjUpO1xuXHRcdHRoaXMub24oJ2JveHN0YXJ0JywgRHJhZ1NlbGVjdGlvbi5wcm90b3R5cGUub25Cb3hTdGFydCwgdGhpcyk7XG5cdFx0dGhpcy5vbignYm94ZHJhZycsIERyYWdTZWxlY3Rpb24ucHJvdG90eXBlLm9uQm94RHJhZywgdGhpcyk7XG5cdFx0dGhpcy5vbignYm94ZW5kJywgRHJhZ1NlbGVjdGlvbi5wcm90b3R5cGUub25Cb3hFbmQsIHRoaXMpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXQgcHJvYmVJbnRlcmFjdGlvbigpOlByb2JlSW50ZXJhY3Rpb25cblx0e1xuXHRcdGlmICghdGhpcy5fcHJvYmVJbnRlcmFjdGlvbikge1xuXHRcdFx0Zm9yIChsZXQgaW50ZXJhY3Rpb24gb2YgdGhpcy5nZXRNYXAoKS5nZXRJbnRlcmFjdGlvbnMoKS5nZXRBcnJheSgpKSB7XG5cdFx0XHRcdGlmIChpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIFByb2JlSW50ZXJhY3Rpb24pIHtcblx0XHRcdFx0XHR0aGlzLl9wcm9iZUludGVyYWN0aW9uID0gaW50ZXJhY3Rpb247XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fcHJvYmVJbnRlcmFjdGlvbjtcblx0fVxuXG5cdG9uQm94U3RhcnQoZXZlbnQ6IGFueSkge1xuXHRcdGlmICh0aGlzLnByb2JlSW50ZXJhY3Rpb24pXG5cdFx0XHR0aGlzLnByb2JlSW50ZXJhY3Rpb24uc2V0QWN0aXZlKGZhbHNlKTtcblxuXHRcdGxldCBkcmFnQm94RXZlbnQ6IG9sLkRyYWdCb3hFdmVudCA9IDxvbC5EcmFnQm94RXZlbnQ+ZXZlbnQ7XG5cblx0XHRsZXQgYnJvd3NlckV2ZW50OiBNb3VzZUV2ZW50ID0gPE1vdXNlRXZlbnQ+ZHJhZ0JveEV2ZW50Lm1hcEJyb3dzZXJFdmVudC5vcmlnaW5hbEV2ZW50O1xuXG5cdFx0aWYgKGJyb3dzZXJFdmVudC5jdHJsS2V5ICYmIGJyb3dzZXJFdmVudC5zaGlmdEtleSlcblx0XHR7XG5cdFx0XHR0aGlzLm1vZGUgPSBEcmFnU2VsZWN0aW9uTW9kZS5TVUJUUkFDVDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoYnJvd3NlckV2ZW50LmN0cmxLZXkpXG5cdFx0e1xuXHRcdFx0dGhpcy5tb2RlID0gRHJhZ1NlbGVjdGlvbk1vZGUuQUREO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5tb2RlID0gRHJhZ1NlbGVjdGlvbk1vZGUuU0VUO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZVNlbGVjdGlvbihleHRlbnQpXG5cdHtcblx0XHRsZXQgc2VsZWN0ZWRGZWF0dXJlczogU2V0PElRdWFsaWZpZWRLZXk+ID0gbmV3IFNldCgpO1xuXHRcdGxldCBzZWxlY3RGZWF0dXJlOiBGdW5jdGlvbiA9IChmZWF0dXJlOiBvbC5GZWF0dXJlKSA9PiB7IHNlbGVjdGVkRmVhdHVyZXMuYWRkKDxJUXVhbGlmaWVkS2V5PmZlYXR1cmUuZ2V0SWQoKSk7IH07XG5cblx0XHRmb3IgKGxldCBvbExheWVyIG9mIHRoaXMuZ2V0TWFwKCkuZ2V0TGF5ZXJzKCkuZ2V0QXJyYXkoKSkge1xuXHRcdFx0bGV0IHNlbGVjdGFibGU6IGJvb2xlYW4gPSA8Ym9vbGVhbj5vbExheWVyLmdldChcInNlbGVjdGFibGVcIik7XG5cdFx0XHRsZXQgd2VhdmVMYXllcjogTGF5ZXIgPSBvbExheWVyLmdldChcImxheWVyT2JqZWN0XCIpO1xuXG5cdFx0XHRpZiAod2VhdmVMYXllciBpbnN0YW5jZW9mIEZlYXR1cmVMYXllciAmJiBzZWxlY3RhYmxlKSB7XG5cdFx0XHRcdGxldCBzb3VyY2U6IG9sLnNvdXJjZS5WZWN0b3IgPSA8b2wuc291cmNlLlZlY3Rvcj4oPG9sLmxheWVyLlZlY3Rvcj5vbExheWVyKS5nZXRTb3VyY2UoKTtcblxuXHRcdFx0XHRzb3VyY2UuZm9yRWFjaEZlYXR1cmVJbnRlcnNlY3RpbmdFeHRlbnQoZXh0ZW50LCBzZWxlY3RGZWF0dXJlKTtcblxuXHRcdFx0XHRsZXQga2V5czpBcnJheTxJUXVhbGlmaWVkS2V5PiA9IEFycmF5LmZyb20oc2VsZWN0ZWRGZWF0dXJlcyk7XG5cblx0XHRcdFx0c3dpdGNoICh0aGlzLm1vZGUpIHtcblx0XHRcdFx0XHRjYXNlIERyYWdTZWxlY3Rpb25Nb2RlLlNFVDpcblx0XHRcdFx0XHRcdHdlYXZlTGF5ZXIuc2VsZWN0aW9uS2V5U2V0LnJlcGxhY2VLZXlzKGtleXMpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBEcmFnU2VsZWN0aW9uTW9kZS5BREQ6XG5cdFx0XHRcdFx0XHR3ZWF2ZUxheWVyLnNlbGVjdGlvbktleVNldC5hZGRLZXlzKGtleXMpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBEcmFnU2VsZWN0aW9uTW9kZS5TVUJUUkFDVDpcblx0XHRcdFx0XHRcdHdlYXZlTGF5ZXIuc2VsZWN0aW9uS2V5U2V0LnJlbW92ZUtleXMoa2V5cyk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdG9uQm94RHJhZyhldmVudDphbnkpXG5cdHtcblx0XHRsZXQgZXh0ZW50ID0gdGhpcy5nZXRHZW9tZXRyeSgpLmdldEV4dGVudCgpO1xuXG5cdFx0dGhpcy5kZWJvdW5jZWRVcGRhdGVTZWxlY3Rpb24oZXh0ZW50KTtcblx0fVxuXG5cdG9uQm94RW5kKGV2ZW50OmFueSlcblx0e1xuXHRcdGxldCBleHRlbnQgPSB0aGlzLmdldEdlb21ldHJ5KCkuZ2V0RXh0ZW50KCk7XG5cblx0XHR0aGlzLmRlYm91bmNlZFVwZGF0ZVNlbGVjdGlvbihleHRlbnQpO1xuXHRcdGlmICh0aGlzLnByb2JlSW50ZXJhY3Rpb24pXG5cdFx0XHR0aGlzLnByb2JlSW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpO1xuXHR9XG59Il19