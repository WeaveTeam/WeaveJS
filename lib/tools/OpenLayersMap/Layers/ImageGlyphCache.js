"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>
var Dictionary2D = weavejs.util.Dictionary2D;

var ImageGlyphCache = function () {
    function ImageGlyphCache(context) {
        _classCallCheck(this, ImageGlyphCache);

        this.context = context;
        this.baseImageElements = new Map();
        this.canvasMap = new Dictionary2D();
        this.imageMap = new Dictionary2D();
    }

    _createClass(ImageGlyphCache, [{
        key: "requestBaseImageElement",
        value: function requestBaseImageElement(url, callback) {
            var imageElement = this.baseImageElements.get(url);
            if (!imageElement) {
                imageElement = new Image();
                imageElement.src = url;
                this.baseImageElements.set(url, imageElement);
            }
            if (imageElement.complete) {
                callback(imageElement);
            } else {
                (0, _jquery2.default)(imageElement).one("load", function () {
                    return callback(imageElement);
                });
            }
        }
    }, {
        key: "getCachedCanvas",
        value: function getCachedCanvas(url, color) {
            var canvas = this.canvasMap.get(url, color);
            var freshCanvas = false;
            if (!canvas) {
                freshCanvas = true;
                canvas = document.createElement("canvas");
                this.canvasMap.set(url, color, canvas);
            }
            return { canvas: canvas, freshCanvas: freshCanvas };
        }
    }, {
        key: "requestDataUrl",
        value: function requestDataUrl(url, color, callback) {
            var _getCachedCanvas = this.getCachedCanvas(url, color);

            var canvas = _getCachedCanvas.canvas;
            var freshCanvas = _getCachedCanvas.freshCanvas;
            /* If freshCanvas is true, this means that we just created the canvas and haven't rendered to it. Time to do that. */

            if (freshCanvas) {
                this.requestBaseImageElement(url, function (imageElement) {
                    var _ref = [imageElement.naturalHeight, imageElement.naturalWidth];
                    canvas.height = _ref[0];
                    canvas.width = _ref[1];

                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = "destination-atop";
                    ctx.drawImage(imageElement, 0, 0);
                    ctx.globalCompositeOperation = "multiply";
                    ctx.drawImage(imageElement, 0, 0);
                    callback(canvas.toDataURL());
                });
            } else {
                callback(canvas.toDataURL());
            }
        }
    }, {
        key: "getImage",
        value: function getImage(url, color) {
            var _this = this;

            var image = this.imageMap.get(url, color);
            if (!image) {
                image = new Image();
                weavejs.WeaveAPI.URLRequestUtils.request(this.context, { url: url, responseType: "datauri", mimeType: "" }).then(function (dataUri) {
                    _this.requestDataUrl(dataUri, color, function (dataUrl) {
                        image.src = dataUrl;
                    });
                });
                this.imageMap.set(url, color, image);
            }
            return image;
        }
    }]);

    return ImageGlyphCache;
}();

exports.default = ImageGlyphCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2VHbHlwaENhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcC9MYXllcnMvSW1hZ2VHbHlwaENhY2hlLnRzIl0sIm5hbWVzIjpbIkltYWdlR2x5cGhDYWNoZSIsIkltYWdlR2x5cGhDYWNoZS5jb25zdHJ1Y3RvciIsIkltYWdlR2x5cGhDYWNoZS5yZXF1ZXN0QmFzZUltYWdlRWxlbWVudCIsIkltYWdlR2x5cGhDYWNoZS5nZXRDYWNoZWRDYW52YXMiLCJJbWFnZUdseXBoQ2FjaGUucmVxdWVzdERhdGFVcmwiLCJJbWFnZUdseXBoQ2FjaGUuZ2V0SW1hZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQSxJQUFPLEFBQVksZUFBRyxBQUFPLFFBQUMsQUFBSSxLQUFDLEFBQVksQUFBQyxBQUV6QyxBQUFNLEFBQU0sQUFBUSxBQUUzQjs7O0FBTUMsNkJBQVksQUFBTzs7O0FBRWxCLEFBQUksYUFBQyxBQUFPLFVBQUcsQUFBTyxBQUFDO0FBQ3ZCLEFBQUksYUFBQyxBQUFpQixvQkFBRyxJQUFJLEFBQUcsQUFBRSxBQUFDO0FBQ25DLEFBQUksYUFBQyxBQUFTLFlBQUcsSUFBSSxBQUFZLEFBQW1DLEFBQUM7QUFDckUsQUFBSSxhQUFDLEFBQVEsV0FBRyxJQUFJLEFBQVksQUFBa0MsQUFBQyxBQUNwRSxBQUFDLEFBRUQsQUFBdUI7Ozs7O2dEQUFDLEFBQUcsS0FBRSxBQUFRO0FBRXBDLGdCQUFJLEFBQVksZUFBRyxBQUFJLEtBQUMsQUFBaUIsa0JBQUMsQUFBRyxJQUFDLEFBQUcsQUFBQyxBQUFDO0FBRW5ELEFBQUUsQUFBQyxnQkFBQyxDQUFDLEFBQVksQUFBQyxjQUNsQixBQUFDO0FBQ0EsQUFBWSwrQkFBRyxJQUFJLEFBQUssQUFBRSxBQUFDO0FBQzNCLEFBQVksNkJBQUMsQUFBRyxNQUFHLEFBQUcsQUFBQztBQUN2QixBQUFJLHFCQUFDLEFBQWlCLGtCQUFD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USxTQUFDLEFBQWUsZ0JBQUMsQUFBTyxRQUFDLEFBQUksS0FBQyxBQUFPLFNBQUUsRUFBQyxBQUFHLFVBQUUsQUFBWSxjQUFFLEFBQVMsV0FBRSxBQUFRLFVBQUUsQUFBRSxBQUFDLEFBQUMsTUFBQyxBQUFJLGVBQ3ZHLEFBQU87QUFFUCxBQUFJLDBCQUFDLEFBQWMsZUFBQyxBQUFPLFNBQUUsQUFBSyxpQkFBWSxBQUFPO0FBQ3BELEFBQUssOEJBQUMsQUFBRyxNQUFHLEFBQU8sQUFBQyxBQUNyQixBQUFDLEFBQUMsQUFDSCxBQUFDLEFBQ0Q7cUJBSnFDO2lCQUZyQyxFQUhGLEFBQUM7QUFVQSxBQUFJLHFCQUFDLEFBQVEsU0FBQyxBQUFHLElBQUMsQUFBRyxLQUFFLEFBQUssT0FBRSxBQUFLLEFBQUMsQUFBQyxBQUN0QyxBQUFDOztBQUVELEFBQU0sbUJBQUMsQUFBSyxBQUFDLEFBQ2QsQUFBQyxBQUNGLEFBQUMsQUFFRDs7Ozs7OztrQkFBZSxBQUFlLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0IERpY3Rpb25hcnkyRCA9IHdlYXZlanMudXRpbC5EaWN0aW9uYXJ5MkQ7XG5cbmltcG9ydCBqcXVlcnkgZnJvbSBcImpxdWVyeVwiO1xuXG5jbGFzcyBJbWFnZUdseXBoQ2FjaGUge1xuXHRwcml2YXRlIGJhc2VJbWFnZUVsZW1lbnRzOk1hcDxzdHJpbmcsSFRNTEltYWdlRWxlbWVudD47XG5cdHByaXZhdGUgY2FudmFzTWFwOkRpY3Rpb25hcnkyRDxzdHJpbmcsc3RyaW5nLEhUTUxDYW52YXNFbGVtZW50Pjtcblx0cHJpdmF0ZSBpbWFnZU1hcDpEaWN0aW9uYXJ5MkQ8c3RyaW5nLHN0cmluZyxIVE1MSW1hZ2VFbGVtZW50Pjtcblx0cHJpdmF0ZSBjb250ZXh0OiBhbnkgLyogSUxpbmthYmxlT2JqZWN0LCBjb250ZXh0IGZvciBVUkwgcmVxdWVzdCAqL1xuXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQpXG5cdHtcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXHRcdHRoaXMuYmFzZUltYWdlRWxlbWVudHMgPSBuZXcgTWFwKCk7XG5cdFx0dGhpcy5jYW52YXNNYXAgPSBuZXcgRGljdGlvbmFyeTJEPHN0cmluZyxzdHJpbmcsSFRNTENhbnZhc0VsZW1lbnQ+KCk7XG5cdFx0dGhpcy5pbWFnZU1hcCA9IG5ldyBEaWN0aW9uYXJ5MkQ8c3RyaW5nLHN0cmluZyxIVE1MSW1hZ2VFbGVtZW50PigpO1xuXHR9XG5cblx0cmVxdWVzdEJhc2VJbWFnZUVsZW1lbnQodXJsLCBjYWxsYmFjaylcblx0e1xuXHRcdGxldCBpbWFnZUVsZW1lbnQgPSB0aGlzLmJhc2VJbWFnZUVsZW1lbnRzLmdldCh1cmwpO1xuXG5cdFx0aWYgKCFpbWFnZUVsZW1lbnQpXG5cdFx0e1xuXHRcdFx0aW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG5cdFx0XHRpbWFnZUVsZW1lbnQuc3JjID0gdXJsO1xuXHRcdFx0dGhpcy5iYXNlSW1hZ2VFbGVtZW50cy5zZXQodXJsLCBpbWFnZUVsZW1lbnQpO1xuXHRcdH1cblxuXHRcdGlmIChpbWFnZUVsZW1lbnQuY29tcGxldGUpXG5cdFx0e1xuXHRcdFx0Y2FsbGJhY2soaW1hZ2VFbGVtZW50KTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGpxdWVyeShpbWFnZUVsZW1lbnQpLm9uZShcImxvYWRcIiwgKCkgPT4gY2FsbGJhY2soaW1hZ2VFbGVtZW50KSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0Q2FjaGVkQ2FudmFzKHVybCwgY29sb3IpXG5cdHtcblx0XHRsZXQgY2FudmFzID0gdGhpcy5jYW52YXNNYXAuZ2V0KHVybCwgY29sb3IpO1xuXHRcdGxldCBmcmVzaENhbnZhcyA9IGZhbHNlO1xuXG5cdFx0aWYgKCFjYW52YXMpXG5cdFx0e1xuXHRcdFx0ZnJlc2hDYW52YXMgPSB0cnVlO1xuXHRcdFx0Y2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdHRoaXMuY2FudmFzTWFwLnNldCh1cmwsIGNvbG9yLCBjYW52YXMpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7Y2FudmFzLCBmcmVzaENhbnZhc307XG5cdH1cblxuXHRyZXF1ZXN0RGF0YVVybCh1cmwsIGNvbG9yLCBjYWxsYmFjaylcblx0e1xuXHRcdGxldCB7Y2FudmFzLCBmcmVzaENhbnZhc30gPSB0aGlzLmdldENhY2hlZENhbnZhcyh1cmwsIGNvbG9yKTtcblx0XHQvKiBJZiBmcmVzaENhbnZhcyBpcyB0cnVlLCB0aGlzIG1lYW5zIHRoYXQgd2UganVzdCBjcmVhdGVkIHRoZSBjYW52YXMgYW5kIGhhdmVuJ3QgcmVuZGVyZWQgdG8gaXQuIFRpbWUgdG8gZG8gdGhhdC4gKi9cblx0XHRpZiAoZnJlc2hDYW52YXMpXG5cdFx0e1xuXHRcdFx0dGhpcy5yZXF1ZXN0QmFzZUltYWdlRWxlbWVudCh1cmwsIGZ1bmN0aW9uIChpbWFnZUVsZW1lbnQpIHtcblx0XHRcdFx0W2NhbnZhcy5oZWlnaHQsIGNhbnZhcy53aWR0aF0gPSBbaW1hZ2VFbGVtZW50Lm5hdHVyYWxIZWlnaHQsIGltYWdlRWxlbWVudC5uYXR1cmFsV2lkdGhdO1xuXHRcdFx0XHRsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXHRcdFx0XHRjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuXHRcdFx0XHRjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJkZXN0aW5hdGlvbi1hdG9wXCI7XG5cdFx0XHRcdGN0eC5kcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LCAwLCAwKTtcblxuXHRcdFx0XHRjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJtdWx0aXBseVwiO1xuXHRcdFx0XHRjdHguZHJhd0ltYWdlKGltYWdlRWxlbWVudCwgMCwgMCk7XG5cblx0XHRcdFx0Y2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgpKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Y2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgpKTtcblx0XHR9XG5cdH1cblxuXHRnZXRJbWFnZSh1cmwsIGNvbG9yKVxuXHR7XG5cdFx0bGV0IGltYWdlID0gdGhpcy5pbWFnZU1hcC5nZXQodXJsLCBjb2xvcik7XG5cblx0XHRpZiAoIWltYWdlKVxuXHRcdHtcblx0XHRcdGltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0XHR3ZWF2ZWpzLldlYXZlQVBJLlVSTFJlcXVlc3RVdGlscy5yZXF1ZXN0KHRoaXMuY29udGV4dCwge3VybCwgcmVzcG9uc2VUeXBlOiBcImRhdGF1cmlcIiwgbWltZVR5cGU6IFwiXCJ9KS50aGVuKFxuXHRcdFx0XHQoZGF0YVVyaSkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMucmVxdWVzdERhdGFVcmwoZGF0YVVyaSwgY29sb3IsIGZ1bmN0aW9uIChkYXRhVXJsKSB7XG5cdFx0XHRcdFx0XHRpbWFnZS5zcmMgPSBkYXRhVXJsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdClcblx0XHRcdHRoaXMuaW1hZ2VNYXAuc2V0KHVybCwgY29sb3IsIGltYWdlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW1hZ2U7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VHbHlwaENhY2hlO1xuIl19