import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

import prefixer from "../react-ui/VendorPrefixer";
import SmartComponent from "../ui/SmartComponent";
import ReactNode = __React.ReactNode;

export interface IconButtonProps extends React.HTMLProps<IconButton>
{
    clickHandler:(event:React.MouseEvent)=>void;
    mouseOverStyle?: any;
    iconName?:string;
    toolTip?:string;
    useDefaultStyle?:boolean;
}

export interface IconButtonState
{
    mouseOver?:boolean
}

export default class IconButton extends SmartComponent<IconButtonProps, IconButtonState>
{
    constructor(props:IconButtonProps)
    {
        super(props);

        this.state = {
            mouseOver:false
        };

    }

    clickHandler=(event:React.MouseEvent)=>{
        if(this.props.clickHandler)this.props.clickHandler(event);
    }

    mouseOverHandler=()=>{
        this.setState({
            mouseOver: true
        });
    }

    mouseOutHandler=()=>{
        this.setState({
            mouseOver: false
        });
    }


    render()
    {
        // important to set border color in rgba mode with alpha to 0 - to ensure border is used in layout Calculation (CSS BOX  Model),
        // but not visible at same time
        // this will avoid the flickering in the screen when border gets visible
        var iconStyle:React.CSSProperties = {
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            border:"1px solid",
            borderColor:"rgba(0, 0, 0, 0)",
            cursor:"pointer"
        };


        if(this.props.style)
        {
            _.merge(iconStyle,this.props.style);

        }

        if(this.state.mouseOver)
        {
            if(this.props.mouseOverStyle)
            {
                var mouseOverStyleCopy:React.CSSProperties = _.merge({},this.props.mouseOverStyle);//make copy
                iconStyle = _.merge(mouseOverStyleCopy,iconStyle); // override borderColor to set transparency
            }

            if(this.props.useDefaultStyle) //default icon mouseOver style values
            {
                iconStyle = _.merge({
                    margin:"4px",
                    padding:"4px",
                    borderColor:"grey",
                    borderRadius:"4px"
                },iconStyle);
            }
        }
        else
        {
            if(this.props.useDefaultStyle)
            {
                iconStyle = _.merge({
                    margin:"4px",
                    padding:"4px",
                    borderRadius:"4px"
                },iconStyle);
            }
        }

        var iconUI:JSX.Element | string = null;
        if(this.props.iconName)
        {
            if(this.props.iconName.indexOf("&") == -1 && this.props.iconName.indexOf("fa ") != -1 ) //font-awesome icons
            {
                iconUI = <i className={ this.props.iconName }></i>
            }
            else if(this.props.iconName.indexOf("&") != -1)//entity
            {
                iconUI = <span dangerouslySetInnerHTML={{__html: this.props.iconName}}/>
            }

        }

        return  <span title={ Weave.lang(this.props.toolTip) }
                      style={ prefixer(iconStyle) }
                      onClick={ this.clickHandler }
                      onMouseOver={ this.mouseOverHandler }
                      onMouseOut={ this.mouseOutHandler }>
                    {iconUI}
                    {Weave.lang(this.props.children as string)}
                </span>;
    }
}
