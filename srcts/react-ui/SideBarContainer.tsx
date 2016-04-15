import * as React from "react";
import ResizingDiv from "./ResizingDiv";
import SideBar from "./SideBar";
import {HBox,VBox,HDividedBox} from "./FlexBox";
import SmartComponent from "../ui/SmartComponent";

export interface SideBarContainerProps extends React.Props<SideBarContainer>
{
    barSize:number;
    mode?:string;
    topSideBarChildren?:JSX.Element | JSX.Element[]; // important to support both Array and composite element
    bottomSideBarChildren?:JSX.Element | JSX.Element[];
    leftSideBarChildren?:JSX.Element | JSX.Element[];
    rightSideBarChildren?:JSX.Element | JSX.Element[];
}

export interface SideBarContainerState
{
    openLeftSideBar?:boolean;
    openRightSideBar?:boolean;
    openTopSideBar?:boolean;
    openBottomSideBar?:boolean;
}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class SideBarContainer extends SmartComponent<SideBarContainerProps, SideBarContainerState>
{

    constructor(props:SideBarContainerProps)
    {
        super(props);

        // side bars has to remain closed by default
        // props values are not passed here
        this.state = {
            openLeftSideBar:false,
            openRightSideBar:false,
            openTopSideBar:false,
            openBottomSideBar:false
        }
    }

    sideBarCloseHandler(location:string, isOpen:boolean):void
	{
        var stateObj:any = {}
        var loc:string = this.capitalizeFirstCharacter(location);
        stateObj["open" + loc + "SideBar"] = isOpen;
        this.setState(stateObj);
    }


    // util function to make first charter capitalized
    private capitalizeFirstCharacter=(str:string):string=>
	{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
	componentWillReceiveProps(nextProps:SideBarContainerProps)
	{
        var stateObject:SideBarContainerState = {};
        stateObject.openLeftSideBar = nextProps.leftSideBarChildren ? true :false
        stateObject.openRightSideBar = nextProps.rightSideBarChildren ? true :false
        stateObject.openTopSideBar = nextProps.topSideBarChildren ? true :false
        stateObject.openBottomSideBar = nextProps.bottomSideBarChildren ? true :false
        this.setState(stateObject);
    }


    render()
    {
        var barSize:number = this.props.barSize;
        var scaleValue:number = 1;
        var transformOriginValue:string = "";
        var topOrBottomBarWidth:number = 1;

        if(this.state.openLeftSideBar )
        {
            if(this.props.mode == "scale")
            {
                scaleValue = scaleValue - barSize;
                transformOriginValue = "right";
            }
            topOrBottomBarWidth = 1 - barSize;
        }

        if(this.state.openRightSideBar )
        {
            if(this.props.mode == "scale")
            {
                scaleValue = scaleValue - barSize;
                transformOriginValue = this.state.openLeftSideBar?"center":"left";
            }
            topOrBottomBarWidth = topOrBottomBarWidth - barSize;

        }

        if(this.props.mode == "scale")
        {
            if(this.state.openTopSideBar)
            {

                scaleValue = scaleValue < 1 ? scaleValue:scaleValue - barSize;
                if(transformOriginValue != "center" ) // either left or right or none is opened
                {
                    if(transformOriginValue == "") //none is opened
                    {
                        transformOriginValue = "bottom";
                    }
                    else //left or right opened
                    {
                        transformOriginValue = transformOriginValue + " bottom";
                    }
                }


            }
            if(this.state.openBottomSideBar)
            {
                scaleValue = this.state.openTopSideBar ? 1 - 2 * barSize : scaleValue;

                if(transformOriginValue != "center") // either left or right or top or none is opened
                {
                    if(transformOriginValue == "") //none is opened
                    {
                        transformOriginValue = "top";
                    }
                    else
                    {
                        if(this.state.openTopSideBar) // top is opened
                            transformOriginValue = "center";
                        else //left or right opened
                        {
                            transformOriginValue = transformOriginValue + " top";
                        }
                    }

                }
            }

        }


        var wrapperStyle:React.CSSProperties = {
            position:this.props.mode == "scale"?"absolute":"relative",
            flex:1,
            display:"flex"
        }

        if(this.props.mode == "scale" && scaleValue != 1  )
		{
            wrapperStyle.transform =  `scale(${scaleValue})`;
            wrapperStyle.transformOrigin  = transformOriginValue;
        }


        let leftSideBar:JSX.Element = null;
        let rightSideBar:JSX.Element = null;
        let topSideBar:JSX.Element = null;
        let bottomSideBar:JSX.Element = null;
        let sideBars:JSX.Element[] = [];

        ["left","right","top","bottom"].map(function(location,index){

            var openStateValue:boolean = this.state["open" + this.capitalizeFirstCharacter(location) + "SideBar"];
            if(!openStateValue) // don't render if sidebar is not open
            {
                return null
            }

            var barStyle:React.CSSProperties = {
                position:this.props.mode == "scale"?"absolute":"relative"
            };

            // important to support both array and Composite Element
            var sideBarChildren:JSX.Element[] | JSX.Element = this.props[ location + "SideBarChildren"];

            var barPercentageSize:string = barSize * 100 + "%";

            let sideBarUI:JSX.Element = <SideBar
                                            key={ location }
                                            style={ barStyle }
                                            onClose={ this.sideBarCloseHandler.bind(this, location) }
                                            open={ openStateValue }
                                            location={ location }
                                            children={ sideBarChildren }
                                        />;

            if(location == "right" || location == "left")
            {
                if(this.props.mode == "resize")
                    barStyle.maxWidth = barPercentageSize;
                else
                    barStyle.width = barPercentageSize;

                barStyle.height = "100%";
                if(this.props.mode != "scale")
                {
                    if ( location == "right")
                    {
                        rightSideBar = sideBarUI;
                    }
                    else
                    {
                        leftSideBar = sideBarUI;

                    }

                }
                else
                {
                    sideBars.push(sideBarUI);
                }

            }
            else if(location == "top" || location == "bottom")
            {
                barStyle.width = topOrBottomBarWidth * 100  + "%";
                if(this.props.mode == "resize")
                    barStyle.maxHeight = barPercentageSize;
                else
                    barStyle.height = barPercentageSize;
                barStyle.left = this.state.openLeftSideBar ? barPercentageSize : "0";

                if(this.props.mode != "scale")
                {
                    if(location == "top")
                    {
                        topSideBar = sideBarUI
                    }
                    else
                    {
                        bottomSideBar = sideBarUI;

                    }
                }
                else
                {
                    sideBars.push(sideBarUI);
                }

            }

        },this);

        let containerUI:JSX.Element = null;

        if(this.props.mode == "scale")
        {
            // important to set " style={ {width:"100%",height:"100%"} }" ensures calculated size values are passed on
            // wrapperStyle passed the width height values here
            containerUI = (<ResizingDiv style={ {display:"flex",flex: 1, position: "relative", background: "#e0e0e0"} }>
                                {sideBars}
                                <div style={ wrapperStyle }>
                                    {this.props.children}
                                </div>

                            </ResizingDiv>);
        }
        else if(this.props.mode == "resize")
        {
            // important to set " style={ {width:"100%",height:"100%"} }" ensures calculated size values are passed on
            containerUI = (<ResizingDiv style={ {background: "#e0e0e0"} }>
                                <VBox style={ {width:"100%",height:"100%"} } >
                                    {topSideBar}
                                    <HDividedBox style={ {flex:1} }>
                                        {leftSideBar}
                                        <Wrapper style={ wrapperStyle }>
                                            {this.props.children}
                                        </Wrapper>
                                        {rightSideBar}
                                    </HDividedBox>
                                    {bottomSideBar}
                                </VBox>
                            </ResizingDiv>);

        }
        else
        {
            // important to set " style={ {width:"100%",height:"100%"} }" ensures calculated size values are passed on
            // HBox takes value from VBox through its width and height which in turn takes from resizing div
            containerUI = (<ResizingDiv style={ {background: "#e0e0e0"} }>
                                <VBox style={ {width:"100%",height:"100%"} }>
                                    {topSideBar}
                                    <HBox style={ {flex:1} }>
                                        {leftSideBar}
                                        <div style={ wrapperStyle }>
                                            {this.props.children}
                                        </div>
                                        {rightSideBar}
                                    </HBox>
                                    {bottomSideBar}
                                </VBox>
                            </ResizingDiv>);

        }

        return (containerUI);
    }
}

class Wrapper extends React.Component<React.HTMLProps<Wrapper>,{}>
{
    shouldComponentUpdate()
    {
        return false
    }
    
    render(){
        return <div className={this.props.className} style={this.props.style}>
                    {this.props.children}
                </div>
    }

}