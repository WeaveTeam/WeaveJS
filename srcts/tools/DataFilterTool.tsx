/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import ui from "../react-ui/ui";
import * as bs from "react-bootstrap";

interface IDataFilterPaths {
    layoutMode:WeavePath;
    showPlayButton:WeavePath;
    showToggle:WeavePath;
    filter:WeavePath
}

export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    private toolPath:WeavePath;
    private paths:IDataFilterPaths;

    static LAYOUT_LIST:string = "List";
    static LAYOUT_COMBO:string = "ComboBox";
    static LAYOUT_VSLIDER:string = "VSlider";
    static LAYOUT_HSLIDER:string = "HSlider";
    static LAYOUT_CHECKBOXLIST:string = "CheckBoxList"
    //priavate paths:WeavePath[];
    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = this.props.toolPath;
        this.paths.filter = this.toolPath.push("filter", "null");
    }

    setupCallbacks() {
        this.paths.filter.addCallback(this, this.forceUpdate);
    }

    get title():string {
        return "";
    }

    render():JSX.Element {
        console.log(this.paths)
        return <div/>;
    }
}
