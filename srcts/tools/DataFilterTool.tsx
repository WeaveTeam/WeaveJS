/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import ui from "../react-ui/ui";
import * as bs from "react-bootstrap";
import {registerToolImplementation} from "../WeaveTool";


var IColumnStatistics = weavejs.api.data.IColumnStatistics;
var LinkableString = weavejs.core.LinkableString;
var ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
var ColumnDataFilter = weavejs.data.key.ColumnDataFilter;

interface IDataFilterPaths {
    layoutMode:WeavePath;
    showPlayButton:WeavePath;
    showToggle:WeavePath;
    filter:WeavePath;
    column:WeavePath;
}

interface IDataFilterState extends IVisToolState {
    columnStats:IColumnStatistics
}

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    private toolPath:WeavePath;
    private paths:IDataFilterPaths;

    static LAYOUT_LIST:string = "List";
    static LAYOUT_COMBO:string = "ComboBox";
    static LAYOUT_VSLIDER:string = "VSlider";
    static LAYOUT_HSLIDER:string = "HSlider";
    static LAYOUT_CHECKBOXLIST:string = "CheckBoxList"

    private filter:ILinkableDynamicObject;
    private editor:ILinkableDynamicObject;

    //private paths:WeavePath[];
    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = this.props.toolPath.addCallback(this, this.init);
        this.init();
    }

    private init() {
        this.filter = this.toolPath.getObject("filter");
        this.editor = this.toolPath.getObject("editor");
        this.forceUpdate();
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    get title():string {
        return "";
    }

    render():JSX.Element {
        return this.editor.target;//React.createElement(this.editor.getSessionState()[0].className, {filter: this.filter.target})
    }
}
registerToolImplementation("weave.ui::DataFilterTool", DataFilterTool);

interface NumericRangeDataFilterEditorProps {
    filter: ColumnDataFilter
}

interface NumericRangeDataFilterEditorState {

}

class NumericRangeDataFilterEditor extends React.Component<NumericRangeDataFilterEditorProps, NumericRangeDataFilterEditorState> {

    constructor(props:NumericRangeDataFilterEditorProps) {
        super(props);
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }


    render():JSX.Element {
        return <div>Numeric Filter</div>;
    }
}
Weave.registerClass("weave.editors.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);

interface DiscreteValuesDataFilterEditorProps {
    filter: ColumnDataFilter
}

interface DiscreteValuesDataFilterEditorState {

}

class DiscreteValuesDataFilterEditor extends React.Component<DiscreteValuesDataFilterEditorProps, DiscreteValuesDataFilterEditorState> {

    constructor(props:DiscreteValuesDataFilterEditorProps) {
        super(props);
        console.log(this.props.filter);
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    render():JSX.Element {
        return <div>Discrete Filter</div>;
    }
}
Weave.registerClass("weave.editors.DiscreteValuesDataFilterEditor", DiscreteValuesDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);
