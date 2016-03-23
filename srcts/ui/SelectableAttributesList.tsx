import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import classNames from "../modules/classnames";
import {OverlayTrigger, Popover} from "react-bootstrap";
import AttributeSelector from "../ui/AttributeSelector";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;

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

        var title = "Attribute Selector for " + this.props.label;

        return(<VBox>
                    <OverlayTrigger trigger="click" placement="bottom"
                                overlay={ <Popover id="AttributeSelector" title={ title }>
                                               <AttributeSelector label={ this.props.label } attribute={ this.props.columns }/>
                                         </Popover>}>
                        <button style={ labelStyle }>{ Weave.lang(this.props.label) }</button>
                    </OverlayTrigger>

                    <ul className= { columnsList} style={{background: 'white'}}>
                        {columns}
                    </ul>
               </VBox>);
    }
}
