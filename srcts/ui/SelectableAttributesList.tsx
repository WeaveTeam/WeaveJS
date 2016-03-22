import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface ISelectableAttributesListProps{
    columns : LinkableHashMap;
}

export interface ISelectableAttributesListState{

}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>{
    constructor(props:ISelectableAttributesListProps){
        super(props);
    }

    render(){
        console.log("columns", this.props.columns);

        return(<VBox>

               </VBox>);
    }
}