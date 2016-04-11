import * as React from 'react';
import {HBox, VBox} from "../react-ui/FlexBox";
import IconButton from "../react-ui/IconButton";
import SmartComponent from "../ui/SmartComponent";

//TODO make a general component by extracting style and accomodate only buttons without click handlers

export interface IButtonGroupProps extends React.HTMLProps<ButtonGroupBar>{
    items:{
        [label:string] : Function;//label of button : function to call when the button is clicked
    };
    activeButton?:number|string;
}

export interface IButtonGroupState{
    activeButton:number|string;
}

export class ButtonGroupBar extends SmartComponent<IButtonGroupProps, IButtonGroupState> {

    constructor(props :IButtonGroupProps){
        super(props);
        this.state = {
            activeButton :  this.props.activeButton ? this.props.activeButton : 0
        }
    }

    componentWillReceiveProps(nextProps:IButtonGroupProps)
    {
        if(this.props.activeButton != nextProps.activeButton)
        {
            this.setState({
                activeButton :  nextProps.activeButton
            })
        }
    }

    private clickHandler = (label:string,index:number,event:React.MouseEvent):void=>
    {
        if(this.props.items[label])
            this.props.items[label](event,label,index);

        this.setState({
            activeButton :  index
        })
    };



    render():JSX.Element {
        var barStyle:React.CSSProperties = {
            justifyContent :'center'
        };



        let keys = Object.keys(this.props.items);
        let buttons:JSX.Element[];

        buttons = keys.map(function (label:string, index:number) {
            var iconButtonStyle:React.CSSProperties = {
                borderLeftColor: '#E6E6E6',
                borderTopColor: '#E6E6E6',
                borderBottomColor: '#E6E6E6',
                borderRightColor:"rgba(0, 0, 0, 0)", //set alpha to 0
                fontSize:'smaller',
                backgroundColor:"#F8F8F8"
            };

            if(index == 0)//first child
            {
                iconButtonStyle.borderTopLeftRadius = 8;
                iconButtonStyle.borderBottomLeftRadius = 8;
                iconButtonStyle.borderTopRightRadius = 0;
                iconButtonStyle.borderBottomRightRadius = 0;
            }
            else if(index == keys.length - 1) //last child
            {
                iconButtonStyle.borderTopRightRadius = 8;
                iconButtonStyle.borderBottomRightRadius = 8;
                iconButtonStyle.borderTopLeftRadius = 0;
                iconButtonStyle.borderBottomLeftRadius = 0;
                iconButtonStyle.borderRightColor ="#E6E6E6";
            }
            else {
                iconButtonStyle["borderRadius"] = 0;
            }
            if(index == this.state.activeButton || label == this.state.activeButton)
            {
                iconButtonStyle.color = "black";
                iconButtonStyle.backgroundColor = "#C1C1C1";
            }
            return (<IconButton style={ iconButtonStyle } mouseOverStyle= { {color:"grey"} }
                                clickHandler={ this.clickHandler.bind(this,label,index) }
                                key={ index }> {label} </IconButton>)
        }, this);
        return ( <HBox style={ barStyle }>{buttons}</HBox>);
    }
}