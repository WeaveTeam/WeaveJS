import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import CenteredIcon from "./CenteredIcon";
import ReactUtils from "../utils/ReactUtils";

export interface SideBarProps extends React.HTMLProps<HTMLDivElement>
{
	onClose:React.MouseEventHandler;
    location:string;
}

export interface SideBarState
{

}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class SideBar extends React.Component<SideBarProps, SideBarState>
{
    constructor(props:SideBarProps)
    {
        super(props);
    }

    render()
    {

        var defaultStyle:React.CSSProperties = {
            overflow:"auto",
            background:"#f8f8f8"/* move to css */
        };
		
		var closeIconStyle:React.CSSProperties = {
			justifyContent: (this.props.location == "right" || this.props.location == "bottom") ? "flex-start":"flex-end"
		}

        if(this.props.location == "left" || this.props.location == "right")
        {
            defaultStyle.flexDirection = "column";
            if(this.props.location == "right")
            {
                defaultStyle.right = 0;
                defaultStyle.borderLeft = "1px solid lightGrey";
            }
            else
            {
                defaultStyle.left = 0;
                defaultStyle.borderRight = "1px solid lightGrey";
            }
        }
        else if(this.props.location == "top" || this.props.location == "bottom")
        {

            defaultStyle.flexDirection = "row-reverse"; // this makes close icon on right
            
			if(this.props.location == "top")
            {
                defaultStyle.top = 0;
                defaultStyle["borderBottom"] = "1px solid lightGrey";
            }
            
			else
            {
                defaultStyle.bottom = 0;
                defaultStyle.borderTop = "1px solid lightGrey";
            }
        }

        var style:React.CSSProperties =  _.merge(defaultStyle, this.props.style);

        return (
			<div {...this.props} style={style}>
                <HBox style={closeIconStyle}>
					<CenteredIcon onClick={ this.props.onClose } iconProps={{className: "fa fa-times"}}/>
				</HBox>
                <VBox style={{margin: 8}}>
                    {this.props.children}
                </VBox>
            </div>
		);
    }
}
