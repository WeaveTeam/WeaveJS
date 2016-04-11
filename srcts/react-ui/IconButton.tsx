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
        var className:string = "weave-icon-button";
        // important to set border color in rgba mode with alpha to 0
        // to ensure border is used in layout Calculation (CSS BOX  Model),
        // but not visible at same time
        // this will avoid the flickering in the screen when border gets visible
        var iconStyle:React.CSSProperties = { //must properties
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            border: this.props.style && this.props.style.border ? this.props.style.border : "1px solid",
            borderColor:this.props.style && this.props.style.borderColor ? this.props.style.borderColor : "rgba(0, 0, 0, 0)",
            cursor:"pointer"
        };


        if(this.props.style)
        {
            // the order of merge ensures iconStyle overrider props style
            // empty object required  to copy the props style as they are read-only
            iconStyle = _.merge({},this.props.style,iconStyle);
        }

        if(this.state.mouseOver)
        {
            className = "weave-icon-button-mouse-over";
            if(this.props.mouseOverStyle)
            {
                iconStyle = _.merge({},this.props.mouseOverStyle,iconStyle);
                // preference given to border and border color of user defined
                iconStyle.border = this.props.mouseOverStyle.border ? this.props.mouseOverStyle.border : iconStyle.border
                iconStyle.borderColor = this.props.mouseOverStyle.borderColor ? this.props.mouseOverStyle.borderColor : iconStyle.borderColor
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

        return  <span className= {className}
                      title={ Weave.lang(this.props.toolTip) }
                      style={ prefixer(iconStyle) }
                      onClick={ this.clickHandler }
                      onMouseOver={ this.mouseOverHandler }
                      onMouseOut={ this.mouseOutHandler }>
                    {iconUI}
                    {Weave.lang(this.props.children as string)}
                </span>;
    }
}
