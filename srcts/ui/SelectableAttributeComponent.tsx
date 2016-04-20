import * as React from "react";
import * as _ from "lodash";
import {VBox, HBox} from '../react-ui/FlexBox';
import Button from "../semantic-ui/Button";
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import PopupWindow from "../react-ui/PopupWindow";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import ComboBox from '../semantic-ui/ComboBox';
import List from '../react-ui/List';
import ControlPanel from "./ControlPanel";
import ReactUtils from "../utils/ReactUtils";

import ColumnUtils = weavejs.data.ColumnUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import IDataSource = weavejs.api.data.IDataSource;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import ListOption from "../react-ui/List";
import IColumnReference = weavejs.api.data.IColumnReference;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;

export interface ISelectableAttributeComponentProps
{
	attributeName: string;
    attributes: Map<string, IColumnWrapper|ILinkableHashMap>
    linkToToolEditorCrumb?:Function
}

export interface ISelectableAttributeComponentState{

}
export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>{
    constructor (props:ISelectableAttributeComponentProps){
        super(props);
    }

    static defaultProps = { showLabel: true };

    componentWillReceiveProps(props:ISelectableAttributeComponentProps){

    }

    componentDidMount(){
        this.props.attributes.forEach((value, label)=>{
            //TODO Do we add a check for value being an ILinkableObject?
            Weave.getCallbacks(value).addGroupedCallback(this, this.forceUpdate);
        });
    }
    
	launchAttributeSelector=(label:string, attribute:IColumnWrapper|ILinkableHashMap):ControlPanel=>{
        if(this.props.linkToToolEditorCrumb)
        {
            this.props.linkToToolEditorCrumb("Attributes", <AttributeSelector label={ label }
                                                                             selectedAttribute={ attribute }
                                                                             selectableAttributes = { this.props.attributes }/> )
            return null;
        }
        else
        {
            return AttributeSelector.openInstance(label, attribute, this.props.attributes);
        }

    };

    private clearColumn =( attr:IColumnWrapper,event:MouseEvent):void =>{
        var dc:any;//TODO assign right type
        if(Weave.IS(attr, AlwaysDefinedColumn))
            dc = ColumnUtils.hack_findInternalDynamicColumn(attr);
        else
            dc = attr;
        dc.target = null;

    };
    

    render():JSX.Element
    {
        
        var selectableUI:JSX.Element[][] = [];
        var listUI:JSX.Element[] = [];
        let alwaysDefinedCol:boolean;
        let defaultValue:any;

		let attribute_ilhm_or_icw = this.props.attributes.get(this.props.attributeName);

        if(Weave.IS(attribute_ilhm_or_icw, IColumnWrapper)){
            let attribute = attribute_ilhm_or_icw as IColumnWrapper;

            return (
				<HBox style={{flex: 1}}>
					<AttributeDropdown title="Change column"
									   attribute={ ColumnUtils.hack_findInternalDynamicColumn(attribute) }
									   clickHandler={ this.launchAttributeSelector.bind(this, this.props.attributeName, attribute) }/>
					<Button onClick={ this.launchAttributeSelector.bind(this, this.props.attributeName, attribute)}
                            title={"Click to explore other DataSources for " + this.props.attributeName}>
                        <i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
					</Button>
				</HBox>
			)
        }

        else if(Weave.IS(attribute_ilhm_or_icw, ILinkableHashMap)){//LinkableHashMap
            let attribute = attribute_ilhm_or_icw as ILinkableHashMap;
            return (
				<SelectableAttributesList key={this.props.attributeName} 
													showAsList={false}
													label={this.props.attributeName} 
	                                                columns={attribute} 
	                                                linkToToolEditorCrumb={this.props.linkToToolEditorCrumb}
	                                                selectableAttributes={ this.props.attributes }/>
			);
        }
    }
}



//Custom component to handle drop down selection of columns as well as when selection from attribute selector
//ComboBox allows selection only from drop down, Does not handle case of attribute selector
interface IAttributeDropdownProps extends React.HTMLProps<AttributeDropdown> {
    attribute:DynamicColumn;
    clickHandler:(event:React.MouseEvent)=>PopupWindow;
}

interface IAttributeDropdownState {
}

class AttributeDropdown extends React.Component<IAttributeDropdownProps, IAttributeDropdownState>{
    constructor(props:IAttributeDropdownProps){
        super(props);
    }

    componentWillReceiveProps(nextProps:IAttributeDropdownProps)
    {
        if (!this.props || (this.props.attribute != nextProps.attribute))
        {
            //this.props.attribute.removeCallback(this, this.forceUpdate);//when props are replaced, old callbacks removed
            //nextProps.attribute.addGroupedCallback(this, this.forceUpdate);
        }
    }

    componentWillUnmount(){
        this.props.attribute.removeCallback(this, this.forceUpdate);//forceUpdate keeps being called when component is unmounted
    }

    state: IAttributeDropdownState = {};
    private click:(event:React.MouseEvent)=>PopupWindow = null;

    onChange = (columnReference: IColumnReference & IWeaveTreeNode) => 
    {
        if (columnReference)
        {
            let internalReferencedColumn = this.props.attribute.requestLocalObject(ReferencedColumn) as ReferencedColumn;
            internalReferencedColumn.setColumnReference(columnReference.getDataSource(), columnReference.getColumnMetadata());
        }
        else
        {
            this.props.attribute.removeObject();
        }
    }

    private static nodeEqualityFunc(a:IColumnReference&IWeaveTreeNode, b:IColumnReference&IWeaveTreeNode):boolean
    {
        if (a && b)
            return a.equals(b)
        else
            return (a === b);
    }

    render():JSX.Element{

        let currentColumnNode = ColumnUtils.hack_findHierarchyNode(this.props.attribute);
        let options:{value: IColumnReference, label: string}[] = [];
        let clickHandler = this.props.clickHandler;
        let header:JSX.Element;
        if (currentColumnNode)
        {
            clickHandler = null;
            options = 
                HierarchyUtils.findSiblingNodes(currentColumnNode.getDataSource(), currentColumnNode.getColumnMetadata())
                .map((node) =>
                {
                    let colRef = Weave.AS(node, IColumnReference);
                    if (!colRef) return null;
                    let metadata = colRef.getColumnMetadata() as any;
                    if (!metadata) return null;
                    let title:string = metadata[ColumnMetadata.TITLE];
                    return {value: colRef, label: title};
                }).filter(_.identity);

            header = (<span style={{fontWeight: "bold", fontSize: "small"}}>{HierarchyUtils.findParentNode(currentColumnNode.getDataSource().getHierarchyRoot(),currentColumnNode.getDataSource(),currentColumnNode.getColumnMetadata()).getLabel()}</span>)
        }

        options.push({ value: null, label: Weave.lang("(None)") });

        return <ComboBox valueEqualityFunc={AttributeDropdown.nodeEqualityFunc}
                         style={ this.props.style }
                         value={currentColumnNode}
                         onClick={clickHandler}
                         options={options}
                         onChange={this.onChange}
                         header={header}
                         optionStyle={{marginLeft:10}}
        />;
    }
}
