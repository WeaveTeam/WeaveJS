import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as c3 from "c3";
import SmartComponent from "../ui/SmartComponent";

export interface C3ChartProps
{
	config:c3.ChartConfiguration;
}

export default class C3Chart extends SmartComponent<C3ChartProps, {}>
{
    constructor(props:C3ChartProps)
	{
        super(props);
    }

	private key:number = 0;
    public chart:c3.ChartAPI;
	
    render():JSX.Element
    {
        return <div key={this.key}/>;
    }

	componentDidMount():void
	{
		this.updateChart();
	}
	
    componentDidUpdate():void
	{
		this.updateChart();
	}

	componentWillReceiveProps(props:C3ChartProps):void
	{
		this.key++;
	}
	
	componentWillUnmount():void
	{
		this.destroyChart();
	}
	
	updateChart():void
	{
		var bindto = ReactDOM.findDOMNode(this) as HTMLElement;
		if (this.chart && this.chart.internal.config.bindto == bindto)
			return;
		
		this.destroyChart();
		this.chart = c3.generate(_.merge({bindto}, this.props.config) as c3.ChartConfiguration);
	}
	
	destroyChart():void
	{
		if (this.chart)
			weavejs.WeaveAPI.Scheduler.callLater(null, (chart:c3.ChartAPI) => chart.destroy(), [this.chart]);
		this.chart = null;
	}
}
