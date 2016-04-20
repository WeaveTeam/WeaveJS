import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "../react-ui/FlexBox";
import IconButton from "../react-ui/IconButton";
import List from "../react-ui/List";
import AttributeSelector from "../ui/AttributeSelector";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import {ListOption} from "../react-ui/List";
import PopupWindow from "../react-ui/PopupWindow";
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ControlPanel from "./ControlPanel";
import ReactUtils from "../utils/ReactUtils";
import Button from "../semantic-ui/Button";
import ComboBox from "../semantic-ui/ComboBox";
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import IColumnReference = weavejs.api.data.IColumnReference;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;

export interface ISelectableAttributesListProps{
    columns : ILinkableHashMap;
	showAsList: boolean;
    label:string;
    linkToToolEditorCrumb?:Function;
    selectableAttributes? : Map<string, (IColumnWrapper|ILinkableHashMap)>;
}

export interface ISelectableAttributesListState{
    selectAll:boolean;
}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>{
    constructor(props:ISelectableAttributesListProps){
        super(props);
        this.state = {
            selectAll :false
        };

        Weave.getCallbacks(this.props.columns).addGroupedCallback(this, this.forceUpdate);
    }
    private selectedColumn:IAttributeColumn;

    removeSelected = ():void =>{
        if(this.state.selectAll)
            this.props.columns.removeAllObjects();
        else{
            var colName = this.props.columns.getName(this.selectedColumn);
            this.props.columns.removeObject(colName);
        }
    };

	addSelected =(value:IWeaveTreeNode):void=>
	{
		var ref:IColumnReference = Weave.AS(value, weavejs.api.data.IColumnReference);
		var meta = ref && ref.getColumnMetadata();
		if (meta)
		{
			var lhm = Weave.AS(this.props.columns, ILinkableHashMap);
			if (lhm){
				lhm.requestObject(null, weavejs.data.column.ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
			}
		}
	};

	removeAll =():void=>
	{
		this.props.columns.removeAllObjects();
	};

	setSelected =(values:IWeaveTreeNode[]):void=>
	{
		ColumnUtils.replaceColumnsInHashMap(this.props.columns, values);
	};

    handleSelectAll =():void =>{
            this.setState({selectAll : true});
    };

    select =(selectedItems:Array<IAttributeColumn>): void =>{
        if(this.state.selectAll)
            this.setState({selectAll :false});
        this.selectedColumn = selectedItems[0];
    };

    launchAttributeSelector=():ControlPanel=>{
        if(this.props.linkToToolEditorCrumb)
        {
            this.props.linkToToolEditorCrumb( "Attribute Selector",<AttributeSelector label={  this.props.label }
                                                                             selectedAttribute={ this.props.columns }
                                                                             selectableAttributes = { this.props.selectableAttributes }/>)
            return null;
        }
      return AttributeSelector.openInstance(this.props.label, this.props.columns, this.props.selectableAttributes);
    };

	private static nodeEqualityFunc(a:IColumnReference&IWeaveTreeNode, b:IColumnReference&IWeaveTreeNode):boolean
	{
		if (a && b)
			return a.equals(b);
		else
			return (a === b);
	}

    componentWillUnmount(){
        Weave.getCallbacks(this.props.columns).removeCallback(this,this.forceUpdate);
    }

    render(): JSX.Element {
        var labelStyle:React.CSSProperties = {
            textAlign: 'right',
            display:"flex",
            justifyContent: "flex-end"
        };

        var listStyle:React.CSSProperties = {
            minHeight: '70px',
            overflow: 'auto',
            flex:1,
            border:'1px solid lightgrey'
        };

        let constrollerStyle:React.CSSProperties = {
            justifyContent:'flex-end',
            background:"#F8F8F8"
        }


        var selectedObjects:IAttributeColumn[];
        var columnList: IWeaveTreeNode[] = [];
	    var options: ComboBoxOption[] = [];
	    let siblings:IWeaveTreeNode[] = [];
        var columns = this.props.columns.getObjects(IAttributeColumn);

        //When all options are selected, needed only for restyling the list and re-render
        if(this.state.selectAll)
            selectedObjects = columns;

        columns.forEach((column:ReferencedColumn, index:number)=>{
	        let node:IWeaveTreeNode&IColumnReference = column.getHierarchyNode();
            columnList.push(node);
	        HierarchyUtils.findSiblingNodes(column.getDataSource(),node.getColumnMetadata()).forEach( (siblingNode:IWeaveTreeNode,index:number) => {
		        if(!_.includes(siblings,siblingNode)){
			        siblings.push(siblingNode);
			        options.push({label:siblingNode.getLabel(), value: siblingNode});
		        }
	        });
        });
		
		if(this.props.showAsList)
		{
			return (
				<VBox style={listStyle} className="weave-padded-vbox">
					<List selectedValues= { selectedObjects } options={options as any}  onChange={ this.select }/>
					<HBox className="weave-padded-hbox" style={constrollerStyle}>
				    	<Button>{Weave.lang("Add All")}</Button>
						<Button onClick={ this.removeAll }>{Weave.lang("Remove All")}</Button>
					</HBox>
				</VBox>
			);
		}
		else
		{
			return (
				<HBox style={{flex: 1}}>
					<ComboBox type="multiple"
	                      value={ columnList }
	                      options={ options }
	                      valueEqualityFunc={SelectableAttributesList.nodeEqualityFunc}
	                      onChange={this.setSelected}
					/>
					<Button onClick={ this.launchAttributeSelector }>{ ">" }</Button>
				</HBox>
			);
		}
        // var labelUI:JSX.Element = null;
        // if(this.props.showLabelAsButton)
        // {
        //     labelStyle.borderColor = '#E6E6E6';
        //     labelStyle.fontSize = "smaller";
        //     labelUI = <Button style={ labelStyle } onClick={ this.launchAttributeSelector }>{ Weave.lang(this.props.label) }</Button>;
        // }else
        // {
        //     labelUI = <span style={ labelStyle }>{this.props.label}</span>
        // }
		// 
        // let listUI:JSX.Element = <VBox className="weave-padded-vbox">
	    //                              {/*<HBox style={listStyle}>
        //                                 <List style={ {fontSize: 'smaller'}} selectedValues= { selectedObjects } options={ columnList }  onChange={ this.select }/>
        //                             </HBox>*/}
        //                             <ComboBox type="multiple"
        //                                       value={ columnList }
        //                                       options={ options }
        //                                       valueEqualityFunc={SelectableAttributesList.nodeEqualityFunc}
        //                                       onChange={this.setSelected}
        //                             />
        //                             <HBox className="weave-padded-hbox" style={constrollerStyle}>
        //                                 <Button style={ {fontSize:"smaller"} } onClick={ this.removeAll }>Remove All</Button>
        //                             </HBox>
        //                         </VBox>
		// 
        // let ui:JSX.Element = ReactUtils.generateGridLayout(["four","twelve"],[[labelUI,listUI]])
    }
}
