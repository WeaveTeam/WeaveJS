new WeaveJS().start();
//console.log(weavejs);
var weavejs = weavejs || {};
weavejs.util = weavejs.util || {};
weavejs.util.DateUtils = weavejs.util.DateUtils || {};
weavejs.util.StandardLib = weavejs.util.StandardLib || {};
weavejs.util.DateUtils.moment = moment;
weavejs.util.StandardLib.lodash = _;
