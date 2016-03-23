import * as React from "react";
import ResizingDiv from "./ResizingDiv";
import SideBar from "./SideBar";

export interface SideBarContainerProps extends React.Props<SideBarContainer>
{
    barSize:number;
    topSideBarChildren?:JSX.Element[] | JSX.Element;
    bottomSideBarChildren?:JSX.Element[] | JSX.Element;
    leftSideBarChildren?:JSX.Element[] | JSX.Element;
    rightSideBarChildren?:JSX.Element[] | JSX.Element;
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
export default class SideBarContainer extends React.Component<SideBarContainerProps, SideBarContainerState>
{

    constructor(props:SideBarContainerProps)
    {
        super(props);

        this.state = {
            openLeftSideBar:false,
            openRightSideBar:false,
            openTopSideBar:false,
            openBottomSideBar:false
        }
    }

    sideBarCloseHandler(direction:string,isOpen:boolean):void
	{
        var stateObj:any = {}
        var dir = this.capitalizeFirstCharacter(direction);
        stateObj["open" + dir + "SideBar"] = isOpen;
        this.setState(stateObj);
    }

    capitalizeFirstCharacter(str:string){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    componentWillReceiveProps(nextProps:SideBarContainerProps){
        var stateObject:SideBarContainerState = {};
        if(nextProps.leftSideBarChildren){
            stateObject["openLeftSideBar"] = true;
        }
        if(nextProps.rightSideBarChildren){
            stateObject["openRightSideBar"] = true;
        }
        if(nextProps.topSideBarChildren){
            stateObject["openTopSideBar"] = true;
        }
        if(nextProps.bottomSideBarChildren){
            stateObject["openBottomSideBar"] = true;
        }
        this.setState(stateObject);
    }


    render()
    {
        var barSize:number = this.props.barSize;
        var scaleValue:number = 1;
        var transformOriginValue:string = "";
        var topOrBottomBarWidth:number = 1;

        if(this.state.openLeftSideBar)
        {
            scaleValue = scaleValue - barSize;
            transformOriginValue = "right";
            topOrBottomBarWidth = 1 - barSize;
        }

        if(this.state.openRightSideBar)
        {
            scaleValue = scaleValue - barSize;
            topOrBottomBarWidth = topOrBottomBarWidth - barSize;
            transformOriginValue = this.state.openLeftSideBar?"center":"left";
        }

        if(this.state.openTopSideBar)
        {
            scaleValue = scaleValue < 1 ? scaleValue:scaleValue - barSize;

            if(transformOriginValue != "center" ){// either left or right or none is opened
                if(transformOriginValue == ""){//none is opened
                    transformOriginValue = "bottom";
                }else{//left or right opened
                    transformOriginValue = transformOriginValue + " bottom";
                }
            }
        }

        if(this.state.openBottomSideBar)
        {
            scaleValue = this.state.openTopSideBar ? 1 - 2 * barSize : scaleValue;

            if(transformOriginValue != "center"){// either left or right or top or none is opened
                if(transformOriginValue == ""){//none is opened
                    transformOriginValue = "top";
                }else{
                    if(this.state.openTopSideBar)// top is opened
                        transformOriginValue = "center";
                    else{//left or right opened
                        transformOriginValue = transformOriginValue + " top";
                    }
                }

            }
        }


        var wrapperStyle:React.CSSProperties = {
            position: "absolute",
            width: "100%",
            height: "100%"
        }

        if(scaleValue != 1){
            wrapperStyle["transform"] =  `scale(${scaleValue})`;
            wrapperStyle["transformOrigin"]  = transformOriginValue;
        }

        var sideBars:JSX.Element[] = ["left","right","top","bottom"].map(function(direction,index){

            var openStateValue:boolean = this.state["open" + this.capitalizeFirstCharacter(direction) + "SideBar"];
            var sideBarChildren:JSX.Element[] = this.props[ direction + "SideBarChildren"];
            var barPercentageSize:string = barSize * 100 + "%";
            var barStyle:React.CSSProperties = {}

            if(direction == "left" || direction == "right")
            {
                barStyle["width"] = barPercentageSize;
                barStyle["height"] = "100%";
            }
            else if(direction == "top" || direction == "bottom")
            {
                barStyle["width"] = topOrBottomBarWidth * 100  + "%";
                barStyle["height"] = barPercentageSize;
                barStyle["left"] = this.state.openLeftSideBar ? barPercentageSize : "0";
            }

            return <SideBar
                        key={direction}
                        style={barStyle}
                        closeHandler={this.sideBarCloseHandler.bind(this, direction)}
                        open={openStateValue}
                        direction={direction}
                        children={sideBarChildren}
                    />;

        },this);

        return (<ResizingDiv style={{flex: 1, position: "relative"}}>
                    <div style={wrapperStyle}>
                        {this.props.children}
                    </div>
                    {sideBars}
                </ResizingDiv>);
    }
}
