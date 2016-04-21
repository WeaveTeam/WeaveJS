import * as React from 'react';
import * as _ from "lodash";

import {HBox} from "../react-ui/FlexBox";
import Button from "../semantic-ui/Button";
import SmartComponent from "../ui/SmartComponent";

//TODO support vertical direction

export interface IButtonGroupProps extends React.HTMLProps<ButtonGroupBar>{
    items:string[]; //  array of string labels
    activeButton?:number|string; // when called from parent either label or index can be sent
    buttonStyle?:React.CSSProperties;
    activeButtonStyle?:React.CSSProperties;
    clickHandler?:Function;
}

export interface IButtonGroupState{
    activeButton:number|string;
}

export class ButtonGroupBar extends SmartComponent<IButtonGroupProps, IButtonGroupState> {

    constructor(props :IButtonGroupProps)
    {
        super(props);
        // if there is no default active button set first button as Active Button
        this.state = {
            activeButton :  this.props.activeButton ? this.props.activeButton : 0
        }
    }

    componentWillReceiveProps(nextProps:IButtonGroupProps)
    {
        if(this.props.activeButton != nextProps.activeButton)
        {
            // if active button changed by parent , update the internal state
            this.setState({
                activeButton :  nextProps.activeButton
            })
        }
    }

    private clickHandler = (label:string,index:number,event:React.MouseEvent):void=>
    {
        // cant use onClick as we cant send the binded this from arrow function ot this binded manaually
        /*if(this.props.onClick)
        {
            this.props.onClick.apply(null,[event,label,index])
        }*/

        if(this.props.clickHandler)
         {
            this.props.clickHandler(event,label,index)
         }

        this.setState({
            activeButton :  index
        })


    };



    render():JSX.Element {

        // order in merge is important as props style is read only
        var barStyle:React.CSSProperties = _.merge({},this.props.style,{
            display:"inline-flex",
            overflow:"hidden"
        });


        let buttons:JSX.Element[];

        buttons = this.props.items.map(function (label:string, index:number) {

            var buttonStyle:React.CSSProperties =  {
                borderRadius: 0,
                border:"none"
            };
            buttonStyle = this.props.buttonStyle ? _.merge({},this.props.buttonStyle,buttonStyle):buttonStyle ;
            

            if(index == this.state.activeButton || label == this.state.activeButton)
            {
                if(this.props.activeButtonStyle)
                {
                    buttonStyle = _.merge(buttonStyle,this.props.activeButtonStyle)
                }
                else
                {
                    buttonStyle.color = "white";
                    buttonStyle.backgroundColor = "grey";
                }

                

            }

            return (<Button  style={ buttonStyle }
                             onClick={ this.clickHandler.bind(this,label,index) }
                             key={ index }>
                        {label}
                    </Button>)
        }, this);

        return ( <HBox style={ {justifyContent:"center"} }>
                    <div className="weave-buttonGroupBar" style={ barStyle }>
                        {buttons}
                    </div>
                </HBox>);
    }
}