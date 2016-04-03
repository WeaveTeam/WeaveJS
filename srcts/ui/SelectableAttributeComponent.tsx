import * as React from "react";
import {VBox, HBox} from '../react-ui/FlexBox';
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import PopupWindow from "../react-ui/PopupWindow";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import StatefulComboBox from '../ui/StatefulComboBox';
import ColumnUtils = weavejs.data.ColumnUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import IDataSource = weavejs.api.data.IDataSource;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;

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

    /* getColumnListLabel = (node:IWeaveTreeNode):void =>{
         var ref = Weave.AS(node, weavejs.api.data.IColumnReference);
         var meta = ref.getColumnMetadata();
         var label = (meta as Object).title.concat(meta.keyType);
         console.log('label', label);
         return label;
     };*/

     siblings= (attribute:IColumnWrapper|LinkableHashMap): {label: string, value: IWeaveTreeNode}[]  =>{
         var siblings:{label: string, value: IWeaveTreeNode}[];
         var label = ColumnUtils.getColumnListLabel(attribute as IColumnWrapper);//TODO figure out how to use this
         var dc = ColumnUtils.hack_findInternalDynamicColumn(attribute as IColumnWrapper);

         var meta = ColumnMetadata.getAllMetadata(dc);//gets metadata for a column

         var dataSources = ColumnUtils.getDataSources(dc) as IDataSource[];
         var dataSource = dataSources.length && dataSources[0];

        //var columnNode = dataSource && dataSource.findHierarchyNode(meta);

         if(dataSource){//if a column has not been set, datasource is not returned
            var siblingNodes = HierarchyUtils.findParentNode(this.rootTreeNode, dataSource, meta).getChildren();

            siblings = siblingNodes.map((value:IWeaveTreeNode, index:number)=>{
                var label:string = value.getLabel();
                return({label, value});
            });
        }

         return siblings;
     };


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

               let siblings = this.siblings(attribute);

               //check for siblings
               if(!siblings){//TODO Statefulcombobox should handle null option
                   siblings = []; disabled = true;
               }

               let elem =  <VBox key={ label }>

                                   <HBox className="weave-padded-hbox" style={{justifyContent: 'space-around', alignItems: 'center'}}>
                                       { this.props.showLabel ? <span style={ labelStyle }>{ Weave.lang(label) }</span> : null }
                                       <StatefulComboBox disabled={ disabled } style={{flex: 1}} options={ siblings }/>
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