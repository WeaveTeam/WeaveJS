import * as React from "react";

/**
 * A SmartComponent knows when it should update.
 */
export default class SmartComponent<P,S> extends React.Component<P, S>
{
	shouldComponentUpdate(nextProps:P, nextState:S, nextContext:any):boolean
	{
		return !!weavejs.util.StandardLib.compare(this.state, nextState)
			|| !!weavejs.util.StandardLib.compare(this.props, nextProps)
			|| !!weavejs.util.StandardLib.compare(this.context, nextContext);
	}
}
