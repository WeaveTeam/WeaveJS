import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import List from "../react-ui/List";
import {OverlayTrigger, Popover} from "react-bootstrap";
import AttributeSelector from "../ui/AttributeSelector";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import {ListOption} from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";

export interface ISelectableAttributesListProps{
    columns : LinkableHashMap;
    label:string;
    attributeNames?:string[];
    showLabelAsButton?:boolean;
}

export interface ISelectableAttributesListState{
    selectAll:boolean;
}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>{
    constructor(props:ISelectableAttributesListProps){
        super(props);
        this.state = {selectAll :false};
    }
    private selectedColumn:IAttributeColumn;

    removeSelected = ():void =>{
        if(this.state.selectAll)
            this.props.columns.removeAllObjects();
        else{
            var colName = this.props.columns.getName(this.selectedColumn);
            this.props.columns.removeObject(colName);
        }
    };

    handleSelectAll =():void =>{
            this.setState({selectAll : true});
    };

    select =(selectedItems:Array<IAttributeColumn>): void =>{
        if(this.state.selectAll)
            this.setState({selectAll :false});
        this.selectedColumn = selectedItems[0];
    };

    launchAttributeSelector=():PopupWindow=>{
      return AttributeSelector.openInstance(this.props.label, this.props.columns, this.props.attributeNames);
    };

    componentDidMount(){
        Weave.getCallbacks(this.props.columns).addGroupedCallback(this, this.forceUpdate);
    }

    render(): JSX.Element {
        var labelStyle = {textAlign : 'center',alignSelf :'flex-start', fontSize : 'smaller'};
        var listStyle = {maxHeight: '100px',minHeight: '70px', overflowY: 'auto', border:'1px solid #dcdcdc'};

        var selectedObjects:IAttributeColumn[];
        var columnList: ListOption[] = [];
        var columns = this.props.columns.getObjects();

        //When all options are selected, needed only for restyling the list and re-render
        if(this.state.selectAll)selectedObjects = columns;

        columns.forEach((column:IAttributeColumn, index:number)=>{
            let label = ColumnUtils.getColumnListLabel(column);
            columnList.push({label:label, value : column});
        });

        var buttonUI = <button style={ labelStyle } onClick={ this.launchAttributeSelector }>{ Weave.lang(this.props.label) }</button>;
        var labelUI =<span>{this.props.label}</span> ;
        return(<VBox >
                    {this.props.showLabelAsButton ? buttonUI : labelUI}

                    <div >
                        <div style={listStyle}>
                            <List style={ {fontSize: 'smaller'}} selectedValues= { selectedObjects } options={ columnList }  onChange={ this.select }/>
                        </div>

                        <HBox>
                            <button onClick={ this.handleSelectAll }>Select All</button>
                            <button onClick={ this.removeSelected }>Remove Selected</button>
                        </HBox>
                    </div>
               </VBox>);
    }
}
