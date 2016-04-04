import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import PopupWindow from "../react-ui/PopupWindow";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import StatefulComboBox from '../ui/StatefulComboBox';
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

export interface ISelectableAttributeComponentProps{
    attributes : Map<string, IColumnWrapper|LinkableHashMap>
    showLabel? : boolean
}

export interface ISelectableAttributeComponentState{

}
export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>{
    constructor (props:ISelectableAttributeComponentProps){
        super(props);

        //TODO find better way to get the root hashmap
        props.attributes.forEach((value, key)=>{
            this.weaveRoot = Weave.getRoot(value); return;
        });
        this.rootTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
    }
    private weaveRoot:ILinkableHashMap;
    private rootTreeNode:IWeaveTreeNode;
    columnString: string;

    static defaultProps = { showLabel: true };
	
    componentWillReceiveProps(props:ISelectableAttributeComponentProps){

    }

    componentDidMount(){
        this.props.attributes.forEach((value, label)=>{
            //TODO Do we add a check for value being an ILinkableObject?
            Weave.getCallbacks(value).addGroupedCallback(this, this.forceUpdate);
        });
    }
    launchAttributeSelector=(label:string, attribute:IColumnWrapper|LinkableHashMap):PopupWindow=>{
         return AttributeSelector.openInstance(label, attribute, this.props.attributes);
    };

    render():JSX.Element
    {
        //styles
        var clearStyle = classNames({ 'fa fa-times-circle' : true, 'weave-icon' : true});
        var labelStyle = {textAlign: 'center', flex: 0.35, fontSize: 'smaller'};
        var btnStyle = {textAlign: 'center', flex: 0.05, fontSize: 'smaller'};

        var selectableUI:JSX.Element[] = [];
        let disabled:boolean = false;
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
                            <AttributeSetter style={{flex:1}} node={ attribute } rootTreeNode={ this.rootTreeNode }></AttributeSetter>
                            <span className={clearStyle}/>
                            <button style={ btnStyle } onClick={ this.launchAttributeSelector.bind(this,label,attribute) }>...</button>
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
//StatefulCombobox allows selection only from drop down, Does not handle case of attribute selector
interface IAttributeSetterProps {
    node:IColumnWrapper|LinkableHashMap;
    rootTreeNode:IWeaveTreeNode;
    style :React.CSSProperties;
}

interface IAttributeSetterState {
    selectedNode?:IColumnWrapper|LinkableHashMap;
}

//TODO find better name
class AttributeSetter extends React.Component<IAttributeSetterProps, IAttributeSetterState>{
    constructor(props:IAttributeSetterProps){
        super(props);
        this.state= {selectedNode : this.props.node};
    }

    siblings=(attribute:IColumnWrapper|LinkableHashMap): {label: string, value: IWeaveTreeNode}[] =>
    {
        var siblings:{label: string, value: IWeaveTreeNode}[];
        var dc = ColumnUtils.hack_findInternalDynamicColumn(attribute as IColumnWrapper);

        var meta = ColumnMetadata.getAllMetadata(dc);//gets metadata for a column

        var dataSources = ColumnUtils.getDataSources(dc) as IDataSource[];
        var dataSource = dataSources.length && dataSources[0];

        //if a column has not been set, datasource is not returned
        if (dataSource)
        {
            var parentNode = HierarchyUtils.findParentNode(this.props.rootTreeNode, dataSource, meta);
            var siblingNodes = parentNode ? parentNode.getChildren() : [];
            if (siblingNodes)
                siblings = siblingNodes.map((value:IWeaveTreeNode, index:number)=>{
                    var label:string = value.getLabel();
                    return({label, value});
                });
        }

        return siblings;
    };

    render():JSX.Element{
        let columnString = ColumnUtils.getColumnListLabel(this.props.node as IColumnWrapper);//TODO how o display this
        let siblings = this.siblings(this.props.node);

        var options:JSX.Element[] = siblings.map((option:{label:string, value:IWeaveTreeNode})=>{
            return(<option>{ option.label }</option>);
        });

        return(<VBox style={ this.props.style }>
                <select>{ options }</select>
            </VBox>);
    }
}