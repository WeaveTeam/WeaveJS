import * as React from "react";
import ResizingDiv from "./ResizingDiv";
import SideBar from "./SideBar";
import SmartComponent from "../ui/SmartComponent";

export interface SideBarContainerProps extends React.Props<SideBarContainer>
{
    barSize:number;
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
            scaleValue = scaleValue - barSize;
            transformOriginValue = "right";
            topOrBottomBarWidth = 1 - barSize;
        }

        if(this.state.openRightSideBar )
        {
            scaleValue = scaleValue - barSize;
            topOrBottomBarWidth = topOrBottomBarWidth - barSize;
            transformOriginValue = this.state.openLeftSideBar?"center":"left";
        }

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


        var wrapperStyle:React.CSSProperties = {
            position: "absolute",
			padding: 1,
            width: "100%",
            height: "100%"
        }

        if(scaleValue != 1)
		{
            wrapperStyle.transform =  `scale(${scaleValue})`;
            wrapperStyle.transformOrigin  = transformOriginValue;
        }


        var sideBars:JSX.Element[] = ["left","right","top","bottom"].map(function(location,index){

            var openStateValue:boolean = this.state["open" + this.capitalizeFirstCharacter(location) + "SideBar"];
            if(!openStateValue) // don't render if sidebar is not open
            {
                return null
            }

            var barStyle:React.CSSProperties = {};

            // important to support both array and Composite Element
            var sideBarChildren:JSX.Element[] | JSX.Element = this.props[ location + "SideBarChildren"];

            var barPercentageSize:string = barSize * 100 + "%";


            if(location == "right" || location == "left")
            {
                barStyle.width = barPercentageSize;
                barStyle.height = "100%";
            }
            else if(location == "top" || location == "bottom")
            {
                barStyle.width = topOrBottomBarWidth * 100  + "%";
                barStyle.height = barPercentageSize;
                barStyle.left = this.state.openLeftSideBar ? barPercentageSize : "0";
            }

            return <SideBar
                        key={ location }
                        style={ barStyle }
                        onClose={ this.sideBarCloseHandler.bind(this, location) }
                        open={ openStateValue }
                        location={ location }
                        children={ sideBarChildren }
                    />;

        },this);

        return (<ResizingDiv style={ {flex: 1, position: "relative"} }>
                    {sideBars}
                    <div style={ wrapperStyle }>
                        {this.props.children}
                    </div>

                </ResizingDiv>);
    }
}
