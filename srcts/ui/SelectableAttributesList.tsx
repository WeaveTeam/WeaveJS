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
    removeSelected = ():void =>{

    };

    select =():void =>{

    };

    render(): JSX.Element {
        var labelStyle = {textAlign : 'center',alignSelf :'flex-start', fontSize : 'smaller'};
        var columnsList = classNames({'weave-columns-list' : true});
        var columnItem = classNames({'weave-column-listItem': true});

        var colObjs = this.props.columns.getObjects();
        colObjs.forEach((column:IAttributeColumn, index:number)=>{
            let label = ColumnUtils.getColumnListLabel(column);
            this.columnList.push({label:label, value : column});

        });

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

                    <div style={ {flex : 1, fontSize: 'smaller'} }>
                        <List options={ this.columnList }/>

                        <HBox>
                            <button>Select All</button>
                            <button onClick={ this.removeSelected }>Remove Selected</button>
                        </HBox>
                    </div>
               </VBox>);
    }
}
