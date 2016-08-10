;(function (root, factory) {
  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.ol = factory();
  }
}(this, function () {
  var goog = this.goog = {};
  this.CLOSURE_NO_DEPS = true;
  var weavejs = this.weavejs = {};
  var org = this.org = {};
  var WEAVE = {};
