import React from "react";
// import ReactDOM from "react-dom";
import {Weave, weavejs} from "../weave-shim.js";


export default class Barchart extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div></div>;
  }

}

/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
Barchart.prototype.FLEXJS_CLASS_INFO = { names: [{ name: 'Barchart', qName: 'weavejs.tools.Barchart'}], interfaces: [weavejs.api.core.ILinkableObject] };
Weave.registerClass('weavejs.tools.Barchart', Barchart);
