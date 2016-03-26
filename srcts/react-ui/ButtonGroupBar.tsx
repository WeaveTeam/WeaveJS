import * as React from 'react';
import {HBox, VBox} from "../react-ui/FlexBox";

export interface IButtonGroupProps{
    items:{
        [label:string] : Function;//label of button : function to call when the button is clicked
    }
}

export interface IButtonGroupState{

}

export class ButtonGroupBar extends React.Component<IButtonGroupProps, IButtonGroupState> {

    constructor(props :IButtonGroupProps){
        super(props);
    }

    render():JSX.Element {
        var labelStyle = {textAlign: 'center', fontSize: 'smaller'}; var barStyle= {justifyContent :'center'};

        let keys = Object.keys(this.props.items);
        let buttons:JSX.Element[];

        buttons = keys.map(function (label:string, index:number) {
            return (<button style={ labelStyle } onClick={ this.props.items[label]} key={ index }>{label}</button>)
        }, this);
        return ( <HBox style={ barStyle }>{buttons}</HBox>);
    }
}