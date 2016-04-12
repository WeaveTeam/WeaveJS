import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import IconButton from '../react-ui/IconButton';
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import PopupWindow from "../react-ui/PopupWindow";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import Dropdown from '../semantic-ui/Dropdown';
import List from '../react-ui/List';
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
import ControlPanel from "./ControlPanel";

export interface ISelectableAttributeComponentProps{
    attributes : Map<string, IColumnWrapper|LinkableHashMap>
    showLabel? : boolean
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
    launchAttributeSelector=(label:string, attribute:IColumnWrapper|LinkableHashMap):ControlPanel=>{
        return AttributeSelector.openInstance(label, attribute, this.props.attributes);
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
        //styles
        var clearStyle = classNames({ 'fa fa-times-circle' : true, 'weave-icon' : true});
        var labelStyle:React.CSSProperties = {
            textAlign: 'center',
            flex: 0.35,
            fontSize: 'smaller'
        };
        var btnStyle:React.CSSProperties = {
            fontSize: 'smaller',
            padding:"2px"
        };

        var cleanBtnStyle:React.CSSProperties = {
            fontSize: 'smaller',
            padding:"2px"
        };


        var selectableUI:JSX.Element[] = [];
        let alwaysDefinedCol:boolean;
        let defaultValue:any;

        //loop through selectable attributes
        this.props.attributes.forEach((value, label)=>{
            let attribute_lhm_or_icw = this.props.attributes.get(label);

            if(Weave.IS(attribute_lhm_or_icw, IColumnWrapper)){
                let attribute = attribute_lhm_or_icw as IColumnWrapper;

                //check for always defined column
                if(Weave.IS(attribute, AlwaysDefinedColumn)){
                    alwaysDefinedCol = true;
                    defaultValue = (attribute as AlwaysDefinedColumn).defaultValue.state;
                }

                let elem =  <VBox key={ label }>

                    <HBox className="weave-padded-hbox" style={{justifyContent: 'space-around', alignItems: 'center'}}>
                        { this.props.showLabel ? <span style={ labelStyle }>{ Weave.lang(label) }</span> : null }
                        <AttributeDropdown title="click to change column"
                                           style={ {flex:1} }
                                           attribute={ ColumnUtils.hack_findInternalDynamicColumn(attribute) }
                                           clickHandler={ this.launchAttributeSelector.bind(this,label,attribute) }/>
                        <IconButton style={ cleanBtnStyle }
                                    title={"click to remove the column from " + label }
                                    iconName='fa fa-times'
                                    clickHandler={ this.clearColumn.bind( this, attribute) }/>
                        <IconButton style={ btnStyle }
                                    toolTip={"Click to explore data sources for " + label}
                                    clickHandler={ this.launchAttributeSelector.bind(this,label,attribute) }>...</IconButton>
                    </HBox>

                    { alwaysDefinedCol ? <input type="text" defaultValue={defaultValue}/> : null }
                </VBox>;
                selectableUI.push(elem);
            }
            else{//LinkableHashMap
                let attribute = attribute_lhm_or_icw as LinkableHashMap;
                let elem= <SelectableAttributesList key={ label } label={ label } columns={ attribute } showLabelAsButton={ true } selectableAttributes={ this.props.attributes }/>;
                selectableUI.push(elem);
            }
        });

        return (<VBox>{selectableUI}</VBox>);
    }
}



//Custom component to handle drop down selection of columns as well as when selection from attribute selector
//Dropdown allows selection only from drop down, Does not handle case of attribute selector
interface IAttributeDropdownProps extends React.HTMLProps<AttributeDropdown> {
    attribute:DynamicColumn;
    clickHandler:(event:React.MouseEvent)=>PopupWindow;
}

interface IAttributeDropdownState {
}

type LocalColumnMetadata = {[attr:string]: string};

type JSONColumnReference = {
    dataSource: string;
    metadata: LocalColumnMetadata;
}

class AttributeDropdown extends React.Component<IAttributeDropdownProps, IAttributeDropdownState>{
    constructor(props:IAttributeDropdownProps){
        super(props);
        this.componentWillReceiveProps(props);
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

    state: IAttributeDropdownState = {selectedOption: null};
    private click:(event:React.MouseEvent)=>PopupWindow = null;

    siblings=(attribute:IColumnWrapper): {label: string, id:string}[] =>
    {
        var siblings:{label: string, id:string}[];
        var colRef = ColumnUtils.hack_findHierarchyNode(attribute);
        if (!colRef)
            return [];
        var siblingNodes = HierarchyUtils.findSiblingNodes(colRef.getDataSource(), colRef.getColumnMetadata());
        return siblingNodes.filter((node:IWeaveTreeNode) => Weave.IS(node, IColumnReference)).map((node:IWeaveTreeNode) => {
            return {label: node.getLabel(), id: this.getColumnReferenceString(node)};
        });
    };

    getColumnReferenceString=(node:IWeaveTreeNode|IColumnWrapper):string=>
    {
        var metadata:{[attr:string]:string};
        // get IWeaveTreeNode from IColumnWrapper
        if (Weave.IS(node, IColumnWrapper))
            node = ColumnUtils.hack_findHierarchyNode(node as IColumnWrapper);

        if (!node)
            return null;
        let colRef = Weave.AS(node as IWeaveTreeNode, weavejs.api.data.IColumnReference);
        if (!colRef)
            return null;
        let dataSource = colRef.getDataSource();
        let dataSourceName = (Weave.getOwner(dataSource) as ILinkableHashMap).getName(dataSource);

        return Weave.stringify({dataSource: dataSourceName, metadata: colRef.getColumnMetadata()});
    };

    getColumnReference = (columnReferenceString: string):IColumnReference=>
    {
        let jsonColumnReference = JSON.parse(columnReferenceString) as JSONColumnReference;
        let dataSource = Weave.getRoot(this.props.attribute).getObject(jsonColumnReference.dataSource) as IDataSource;
        return Weave.AS(dataSource.findHierarchyNode(jsonColumnReference.metadata), IColumnReference);
    };

    onChange=(event:React.FormEvent)=>
    {
        let columnString = (event.target as HTMLSelectElement).value;
        let columnReference = this.getColumnReference(columnString);
        this.props.attribute
            .requestLocalObject(ReferencedColumn)
            .setColumnReference(columnReference.getDataSource(), columnReference.getColumnMetadata());
    };

    render():JSX.Element{
        var options:JSX.Element[];
        var disabled:boolean = false;

        let currentColumnEntryId = this.getColumnReferenceString(this.props.attribute);
        let columnEntry = {label: this.props.attribute.getMetadata(ColumnMetadata.TITLE), id: currentColumnEntryId};

        let siblings = this.siblings(this.props.attribute);
        if(siblings)
            options = siblings.map((option:{label:string, id:string}, index:number)=>{
                return(<option value={ option.id } key={ option.id }>{ option.label }</option>);
            });

        //register the click handler only when options are absent
        if(!options || options.length ==0 ){
            var defaultEntry = <option key={ 'def' }>Click here to select</option>;
            options = [defaultEntry];
            //disabled = true;
            this.click = this.props.clickHandler;
        }
        else{//once siblings retrieved , unregister it
            this.click = null;
        }

        return(<VBox style={ this.props.style }>
            <select disabled={ disabled } value={ columnEntry.id } onClick={ this.click } onChange={ this.onChange } >
                { options }</select>
        </VBox>);
    }
}