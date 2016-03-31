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

export interface ISelectableAttributeComponentProps{
    attributes : Map<string, IColumnWrapper|LinkableHashMap>
}

export interface ISelectableAttributeComponentState{

}
export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>{
    constructor (props:ISelectableAttributeComponentProps){
        super(props);
        let attrs = props.attributes.values();//using one selectable attribute to get the Weave root hashmap

        //TODO find better way to get the root hashmap
        props.attributes.forEach((value, key)=>{
            this.weaveRoot = Weave.getRoot(value); return;
        });
        this.rootTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
    }

    private weaveRoot:ILinkableHashMap;
    private rootTreeNode:IWeaveTreeNode;
    columnString: string;

  /*  launchAttributeSelector=():PopupWindow=>{
        return AttributeSelector.openInstance(this.props.label, this.props.attribute, this.props.attributeNames);
    };*/

     componentWillReceiveProps(props:ISelectableAttributeComponentProps){

     }

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



    render():JSX.Element
    {
        //styles
        var clearStyle = classNames({ 'fa fa-times-circle' : true, 'weave-icon' : true});
        var labelStyle = {textAlign: 'center', flex: 0.35, fontSize: 'smaller'};
        var btnStyle = {textAlign: 'center', flex: 0.05, fontSize: 'smaller'};

        var selectableUI:JSX.Element[] = [];
        let disabled:boolean = false;

       //loop through selectable attributes
       this.props.attributes.forEach((value, label)=>{
           let attribute_lhm_or_icw = this.props.attributes.get(label);

           if(Weave.IS(attribute_lhm_or_icw, IColumnWrapper)){
               let attribute = attribute_lhm_or_icw as IColumnWrapper;

               let siblings = this.siblings(attribute);
               if(!siblings){//if no siblings are returned then disable combobox TODO Statefulcombobox should handle null option
                   siblings = []; disabled = true;
               }

               let elem =      <HBox key={ label } className="weave-padded-hbox" style={{justifyContent: 'space-around', alignItems: 'center'}}>
                                        <span style={ labelStyle }>{ Weave.lang(label) }</span>
                                        <StatefulComboBox disabled={ disabled } style={{flex: 1}} options={ siblings }/>
                                        <span className={clearStyle}/>
                                        <button style={ btnStyle }>...</button>
                               </HBox>;

               selectableUI.push(elem);
           }
           else{//LinkableHashMap
               let attribute = attribute_lhm_or_icw as LinkableHashMap;
               let elem= <SelectableAttributesList key={ label } label={ label } columns={ attribute } showLabelAsButton={ true }/>;
               selectableUI.push(elem);
           }
       });

       return (<VBox>{selectableUI}</VBox>);
    }
}