import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import ReactUtils from "../utils/ReactUtils";

export interface SideBarProps extends React.HTMLProps<SideBar>
{
    closeHandler:(open:boolean)=>void;
    direction?:string;
    open?:boolean;
}

export interface SideBarState
{
    open:boolean
}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class SideBar extends React.Component<SideBarProps, SideBarState>
{
    constructor(props:any)
    {
        super(props);

        this.state = {
            open:this.props.open === undefined? false:this.props.open
        };

        this.onCloseClick = this.onCloseClick.bind(this);
    }

    onCloseClick(){
        this.setState({open: !this.state.open});
        if(this.props.closeHandler)this.props.closeHandler(!this.state.open);
    }

    componentWillReceiveProps(nextProps:any){
        if(this.props.open != nextProps.open){
            this.setState({open:nextProps.open});
        }
    }

    render()
    {
        if(!this.state.open)
            return <div/>;

        var defaultStyle:React.CSSProperties = {
            position: "absolute",
            display:"flex",
            overflow:"auto",

        };

        var closeIconStyle:React.CSSProperties = {
            order: -1,
            fontSize:"24",
            color:"grey",
            margin:"4px"
        };

        if(this.props.direction == "left" || this.props.direction == "right" || !this.props.direction)
        {
            defaultStyle["width"] = "20%";
            defaultStyle["height"] = "100%";
            defaultStyle["flexDirection"] = "column";
            if(this.props.direction == "right")
            {
                defaultStyle["right"]= 0;
                defaultStyle["borderLeft"]= "1px solid lightGrey";
            }
            else
            {
                defaultStyle["left"]= 0;
                defaultStyle["borderRight"]= "1px solid lightGrey";
            }
            closeIconStyle["alignSelf"] = this.props.direction == "right"? "flex-start":"flex-end";
        }
        else if(this.props.direction == "top" || this.props.direction == "bottom")
        {
            defaultStyle["width"] = "100%";
            defaultStyle["height"] = "20%";
            defaultStyle["flexDirection"] = "row-reverse"; // this makes close icon on right
            if(this.props.direction == "top")
            {
                defaultStyle["top"]= 0;
                defaultStyle["borderBottom"]= "1px solid lightGrey";
            }
            else
            {
                defaultStyle["bottom"]= 0;
                defaultStyle["borderTop"]= "1px solid lightGrey";
            }
            closeIconStyle["alignSelf"] = this.props.direction == "bottom"? "flex-start":"flex-end";
        }

        var style:React.CSSProperties = this.props.style ? _.merge(this.props.style,defaultStyle): defaultStyle;

        return (<div className={this.props.className} style={style}>
                    <span style={closeIconStyle} onClick={this.onCloseClick}><i className="fa fa-times-circle"/></span>
                    <div style={{padding:"8px",display:"inherit",flexDirection:"inherit"}}>
                        {this.props.children}
                    </div>

                </div>);
    }
}
