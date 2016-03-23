import * as _ from "lodash";
import * as React from "react";

/**
 * A SmartComponent knows when it should update.
 */
export default class SmartComponent<P,S> extends React.Component<P, S>
{
	shouldComponentUpdate(nextProps:P, nextState:S, nextContext:any):boolean
	{
		return !_.isEqual(this.state, nextState)
			|| !_.isEqual(this.props, nextProps)
			|| !_.isEqual(this.context, nextContext);
	}
}
