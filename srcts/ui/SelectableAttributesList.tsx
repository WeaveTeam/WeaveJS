import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import classNames from "../modules/classnames";

export interface ISelectableAttributesListProps{
    columns : LinkableHashMap;
    label:string;
}

export interface ISelectableAttributesListState{

}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>{
    constructor(props:ISelectableAttributesListProps){
        super(props);
    }

    render(){
        var labelStyle = {textAlign : 'center',alignSelf :'flex-start', fontSize : 'smaller'};
        var columnsList = classNames({'weave-columns-list' : true});
        var columnItem = classNames({'weave-column-listItem': true});

        var colObjs = this.props.columns.getObjects();
        var columns= colObjs.map((column:IAttributeColumn, index:number)=>{
            let label = ColumnUtils.getColumnListLabel(column);
            return(<li className={ columnItem } key={ index }>{label}</li>);
        });

        return(<VBox>
                    <button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>
                    <ul className= { columnsList} style={{background: 'white'}}>
                        {columns}
                    </ul>
               </VBox>);
    }
}