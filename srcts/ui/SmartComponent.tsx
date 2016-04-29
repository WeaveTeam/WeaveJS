import * as _ from "lodash";
import * as React from "react";

/**
 * A SmartComponent knows when it should update and when it's ok to setState().
 */
export default class SmartComponent<P,S> extends React.Component<P, S>
{
	constructor(props:P)
	{
		super(props);
		
		if (!this.state)
			this.state = {} as S;
	}
	
	setState(newState: S | ((prevState: S, props: P) => S), callback?: () => any):void
	{
		if (this.context)
		{
			super.setState(newState as S, callback);
			return;
		}
		
		if (typeof newState === 'function')
			newState = (newState as (prevState: S, props: P) => S)(this.state, this.props);

		this.state = _.merge(this.state, newState) as S;

		if (callback)
			callback();
	}
	
	shouldComponentUpdate(nextProps:P, nextState:S, nextContext:any):boolean
	{
		return !_.isEqual(this.state, nextState)
			|| !_.isEqual(this.props, nextProps)
			|| !_.isEqual(this.context, nextContext);
	}
}
