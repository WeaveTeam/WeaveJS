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
    btn:boolean;//if btn is true it will render button else string
}

export interface ISelectableAttributesListState{
    selectedItems: ListOption[];
}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>{
    constructor(props:ISelectableAttributesListProps){
        super(props);
    }

    private columnList:ListOption[] =[];
    private selectedColumn:IAttributeColumn;

    removeSelected = ():void =>{
        var colName = this.props.columns.getName(this.selectedColumn);
        this.props.columns.removeObject(colName);
    };

    selectAll =():void =>{

    };

    select =(selectedItems:Array<IAttributeColumn>): void =>{
        this.selectedColumn = selectedItems[0];
    };

    componentDidMount(){
        Weave.getCallbacks(this.props.columns).addGroupedCallback(this, this.forceUpdate);
    }

    render(): JSX.Element {
        var labelStyle = {textAlign : 'center',alignSelf :'flex-start', fontSize : 'smaller'};
        var columnsList = classNames({'weave-columns-list' : true});
        var columnItem = classNames({'weave-column-listItem': true});

        var colObjs = this.props.columns.getObjects();
        let listItems : ListOption[] = [];
        colObjs.forEach((column:IAttributeColumn, index:number)=>{
            let label = ColumnUtils.getColumnListLabel(column);
            listItems.push({label:label, value : column});

        });
        this.columnList = listItems;

        var title = "Attribute Selector for " + this.props.label;
        var buttonUI = <button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>;
        var labelUI =<span>{this.props.label}</span> ;
        return(<VBox >
                    <OverlayTrigger trigger="click" placement="bottom"
                                overlay={ <Popover id="AttributeSelector" title={ title }>
                                               <AttributeSelector label={ this.props.label } attribute={ this.props.columns }/>
                                         </Popover>}>
                        {this.props.btn ? buttonUI : labelUI}
                    </OverlayTrigger>

                    <div >
                        <List style={ {flex : 1, fontSize: 'smaller'}}  options={ this.columnList }  onChange={ this.select }/>

                        <HBox>
                            <button>Select All</button>
                            <button onClick={ this.removeSelected }>Remove Selected</button>
                        </HBox>
                    </div>
               </VBox>);
    }
}
