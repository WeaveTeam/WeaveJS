import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import classNames from "../modules/classnames";
import List from "../react-ui/List";
import {OverlayTrigger, Popover} from "react-bootstrap";
import AttributeSelector from "../ui/AttributeSelector";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import {ListOption} from "../react-ui/List";

export interface ISelectableAttributesListProps{
    columns : LinkableHashMap;
    label:string;
    button:boolean;//if button is true it will render button else string//TODO fix this use JSX.Element |boolean
    attributeNames?:string[];
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

    componentDidMount(){
        Weave.getCallbacks(this.props.columns).addGroupedCallback(this, this.forceUpdate);
    }

    render(): JSX.Element {
        var labelStyle = {textAlign : 'center',alignSelf :'flex-start', fontSize : 'smaller'};
        var listStyle = {maxHeight: '100px',minHeight: '70px', overflowY: 'auto', border:'1px solid #dcdcdc'};

        var selectedObjects:IAttributeColumn[];
        var columnList: ListOption[] = [];
        var columns = this.props.columns.getObjects();

        if(this.state.selectAll)selectedObjects = columns;

        columns.forEach((column:IAttributeColumn, index:number)=>{
            let label = ColumnUtils.getColumnListLabel(column);
            columnList.push({label:label, value : column});
        });

        var title = "Attribute Selector for " + this.props.label;
        var buttonUI = <button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>;
        var labelUI =<span>{this.props.label}</span> ;
        return(<VBox >
                    <OverlayTrigger trigger="click" placement="bottom"
                                overlay={ <Popover id="AttributeSelector" title={ title }>
                                               <AttributeSelector attributeNames={ this.props.attributeNames } label={ this.props.label } attribute={ this.props.columns }/>
                                         </Popover>}>
                        {this.props.button ? buttonUI : labelUI}
                    </OverlayTrigger>

                    <div >
                        <div style={listStyle}>
                            <List style={ {flex : 1, fontSize: 'smaller'}} selectedValues= { selectedObjects } options={ columnList }  onChange={ this.select }/>
                        </div>

                        <HBox>
                            <button onClick={ this.handleSelectAll }>Select All</button>
                            <button onClick={ this.removeSelected }>Remove Selected</button>
                        </HBox>
                    </div>
               </VBox>);
    }
}
