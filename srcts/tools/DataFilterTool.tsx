/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import ui from "../react-ui/ui";
import * as bs from "react-bootstrap";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";

var IColumnStatistics = weavejs.api.data.IColumnStatistics;
var LinkableString = weavejs.core.LinkableString;
var ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
var ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
var LinkableBoolean = weavejs.core.LinkableBoolean;
var LinkableVariable = weavejs.core.LinkableVariable;
var IQualifiedKey = weavejs.api.data.IQualifiedKey;

interface IDataFilterPaths {
    editor:WeavePath;
    filter:WeavePath;
}

interface IDataFilterState extends IVisToolState {
    columnStats:IColumnStatistics
}

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    private toolPath:WeavePath;
    private paths:IDataFilterPaths;
    private filter:WeavePath;
    private editor:WeavePath;

    static DISCRETEFILTERCLASS:string = "weave.editors::DiscreteValuesDataFilterEditor";
    static RANGEFILTERCLASS:string = "weave.editors::NumericRangeDataFilterEditor";

    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = this.props.toolPath;
        this.filter = this.toolPath.push("filter", null);
        this.editor = this.toolPath.push("editor", null);
        this.setupCallbacks();
    }

    private setupCallbacks() {
        this.filter.addCallback(this, this.forceUpdate);
        this.editor.addCallback(this, this.forceUpdate);
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    get title():string {
        return "";
    }

    render():JSX.Element {
        var editorType:string = this.editor.getType();
        if(editorType == DataFilterTool.DISCRETEFILTERCLASS) {
            return <DiscreteValuesDataFilterEditor editor={this.editor} filter={this.filter}/>;//React.createElement(this.editor.getSessionState()[0].className, {filter: this.filter.target})
        } else if (editorType == DataFilterTool.RANGEFILTERCLASS){
            return <NumericRangeDataFilterEditor editor={this.editor} filter={this.filter}/>;
        } else {
            return <div/>;// blank tool
        }
    }
}
registerToolImplementation("weave.ui::DataFilterTool", DataFilterTool);

interface NumericRangeDataFilterEditorProps {
    editor:WeavePath
    filter:WeavePath
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
//Weave.registerClass("weave.editors.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);

interface DiscreteValuesDataFilterEditorProps {
    editor:WeavePath
    filter:WeavePath
}

interface DiscreteValuesDataFilterEditorState {

}

class DiscreteValuesDataFilterEditor extends React.Component<DiscreteValuesDataFilterEditorProps, DiscreteValuesDataFilterEditorState> {

    static LAYOUT_LIST:string = "List";
    static LAYOUT_COMBO:string = "ComboBox";
    static LAYOUT_VSLIDER:string = "VSlider";
    static LAYOUT_HSLIDER:string = "HSlider";
    static LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

    public showPlayButton:LinkableBoolean;
    public showToggle:LinkableBoolean;
    public showToggleLabel:LinkableBoolean;
    public layoutMode:LinkableString;
    public filter:ColumnDataFilter;
    public column:IAttributeColumn;
    public enabled:LinkableBoolean;
    public values:LinkableVariable;

    private options:string[];

    constructor(props:DiscreteValuesDataFilterEditorProps) {
        super(props);
        this.layoutMode = this.props.editor.getObject("layoutMode");
        this.showToggle = this.props.editor.getObject("showToggle");
        this.showToggleLabel = this.props.editor.getObject("showToggleLabel");
        this.filter = this.props.filter.getObject() as ColumnDataFilter;
        this.values = this.filter.values;
        this.column = this.filter.column;
        this.enabled = this.filter.enabled;
        this.options = [];
    }

    componentWillReceiveProps(nextProps:DiscreteValuesDataFilterEditorProps) {
        this.layoutMode = this.props.editor.getObject("layoutMode");
        this.showToggle = this.props.editor.getObject("showToggle");
        this.showToggleLabel = this.props.editor.getObject("showToggleLabel");
        this.filter = this.props.filter.getObject() as ColumnDataFilter;
        this.values = this.filter.values;
        this.column = this.filter.column;
        this.enabled = this.filter.enabled;
    }

    componentDidMount() {
        this.layoutMode.addGroupedCallback(this, this.forceUpdate);
        this.showToggle.addGroupedCallback(this, this.forceUpdate);
        this.showToggleLabel.addGroupedCallback(this, this.forceUpdate);
        this.column.addGroupedCallback(this, this.columnChanged);
    }

    columnChanged() {
        this.options = _.sortBy(_.uniq(this.column.keys.map((key:IQualifiedKey) => {
            return this.column.getValueFromKey(key, String);
        }) as string));
        this.forceUpdate();
    }

    onChange(selectedValues:string[]) {
        this.values.setSessionState(selectedValues);
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    render():JSX.Element {
        //if(this.layout)
        console.log("render");
        switch (this.layoutMode && this.layoutMode.value) {
            case DiscreteValuesDataFilterEditor.LAYOUT_CHECKBOXLIST:
                return <ui.CheckBoxList values={this.options} selectedValues={this.values.getSessionState()} onChange={this.onChange.bind(this)}/>
            case DiscreteValuesDataFilterEditor.LAYOUT_LIST:
                return <ui.ListItem values={this.options} selectedValues={this.values.getSessionState()} onChange={this.onChange.bind(this)}/>
            case DiscreteValuesDataFilterEditor.LAYOUT_HSLIDER:
                return <div>HSlider</div>
            case DiscreteValuesDataFilterEditor.LAYOUT_VSLIDER:
                return <div>VSlider</div>
            case DiscreteValuesDataFilterEditor.LAYOUT_COMBO:
                return <div>ComboBox</div>
        }
    }
}
//Weave.registerClass("weave.editors.DiscreteValuesDataFilterEditor", {}, [weavejs.api.core.ILinkableObjectWithNewProperties]);
