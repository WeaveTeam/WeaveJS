import * as React from "react";
import * as _ from "lodash";
import * as Prefixer from "react-vendor-prefix";
import {HBox, VBox} from "../FlexBox";

export interface SliderProps extends React.Props<Slider>
{
    min:number;
    max:number;
    step:number;
    value:number;
    direction:string;
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export interface SliderState
{
    value:number;
}

export default class Slider extends React.Component<SliderProps, SliderState>
{
    constructor(props:SliderProps)
	{
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    componentWillReceiveProps(nextProps:SliderProps)
	{
        this.setState({
            value: nextProps.value
        });
    }

    onChange(event:React.FormEvent)
	{
        this.setState({
            value: (event.target as any).value
        });
        if (this.props.onChange)
            this.props.onChange(event);
    }

    static VERTICAL:string = "vertical";
    static HORIZONTAL:string ="horizontal";

    render()
    {
        var sliderStyle:React.CSSProperties = _.clone(this.props.style) || {};

        var otherProps:any = {};

        for (var key in this.props)
        {
            if (key !== "style")
            {
                otherProps[key] = (this.props as any)[key];
            }
        }

        if (this.props.direction == Slider.VERTICAL)
        {
            sliderStyle.writingMode = "bt-lr";
            sliderStyle.appearance = "slider-vertical";
        }

        sliderStyle = Prefixer.prefix({styles: sliderStyle}).styles;

        var sliderContent:JSX.Element[] = [<span key="span">{this.props.label}</span>,
                                           <input key="slider" type="range" min={this.props.min}
                                                                            max={this.props.max}
                                                                            value={String(this.state.value)}
                                                                            step={this.props.step} style={sliderStyle}
                                                                            onChange={this.onChange.bind(this)}/>
                                       ]

        if (this.props.direction == Slider.VERTICAL)
        {
            return (<HBox style={{
                                    width: this.props.style ? this.props.style.width : null,
                                    height: this.props.style ? this.props.style.height : null
                                }}
                                {...otherProps}>
                {
                    sliderContent
                }
            </HBox>);
        }
        else
        {
            return (<VBox style={{
                                    width: this.props.style ? this.props.style.width : null,
                                    height: this.props.style ? this.props.style.height : null
                                }}
                                {...otherProps}>
                {
                    sliderContent
                }
            </VBox>);
        }
    }
}
