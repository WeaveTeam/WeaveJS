import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "../react-ui/FlexBox";
import List from "../react-ui/List";
import AttributeSelector from "../ui/AttributeSelector";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ControlPanel from "./ControlPanel";
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
	style?:React.CSSProperties;
}

export interface ISelectableAttributesListState{
    selectAll:boolean;
}

export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>
{
    constructor(props:ISelectableAttributesListProps)
	{
        super(props);
        this.state = {
            selectAll :false
        };

        Weave.getCallbacks(this.props.columns).addGroupedCallback(this, this.forceUpdate);
    }
	
    private selectedColumn:IAttributeColumn;

    removeSelected = ():void =>
	{
        if (this.state.selectAll)
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
			if (lhm)
			{
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

    handleSelectAll =():void =>
	{
        this.setState({selectAll : true});
    };

    select =(selectedItems:Array<IAttributeColumn>): void =>
	{
        if (this.state.selectAll)
            this.setState({selectAll :false});
        this.selectedColumn = selectedItems[0];
    };

    launchAttributeSelector=():ControlPanel=>
	{
        if (this.props.linkToToolEditorCrumb)
        {
            this.props.linkToToolEditorCrumb( "Attribute Selector",<AttributeSelector label={  this.props.label }
                                                                             selectedAttribute={ this.props.columns }
                                                                             selectableAttributes = { this.props.selectableAttributes }/>);
            return null;
        }
        return AttributeSelector.openInstance(this.props.label, this.props.columns, this.props.selectableAttributes);
    };

	private static nodeEqualityFunc(a:IColumnReference & IWeaveTreeNode, b:IColumnReference & IWeaveTreeNode):boolean
	{
		if (a && b)
			return a.equals(b);
		else
			return (a === b);
	}

    componentWillUnmount()
	{
        Weave.getCallbacks(this.props.columns).removeCallback(this,this.forceUpdate);
    }

    render(): JSX.Element {

        var listStyle:React.CSSProperties = {
            minHeight: '200px',
            overflow: 'auto',
            flex:1
        };

        let controllerStyle:React.CSSProperties = {
            justifyContent:'flex-end',
            background:"#F8F8F8"
        };


        var selectedObjects:IAttributeColumn[];
        var columnList: IWeaveTreeNode[] = [];
	    var options: {label:string, value:IWeaveTreeNode&IColumnReference}[] = [];
	    let siblings:IWeaveTreeNode[] = [];
        var columns = this.props.columns.getObjects(IAttributeColumn);

        //When all options are selected, needed only for restyling the list and re-render
        if (this.state.selectAll)
            selectedObjects = columns;

        columns.forEach((column:ReferencedColumn)=>{
	        let node:IWeaveTreeNode&IColumnReference = column.getHierarchyNode();
			if (!node)
				return;
            columnList.push(node);
			var columnSiblings = HierarchyUtils.findSiblingNodes(column.getDataSource(), node.getColumnMetadata());
	        columnSiblings.forEach( (siblingNode:IWeaveTreeNode&IColumnReference) => {
		        if (!_.includes(siblings, siblingNode))
				{
			        siblings.push(siblingNode);
			        options.push({label:siblingNode.getLabel(), value: siblingNode});
		        }
	        });
        });
		
		if (this.props.showAsList)
		{
			return (
				<VBox style={listStyle} className="weave-padded-vbox">
					<List selectedValues={columnList} options={options} onChange={ this.select }/>
					<HBox className="weave-padded-hbox" style={controllerStyle}>
				    	<Button onClick={ this.handleSelectAll }>{Weave.lang("Select all")}</Button>
						<Button onClick={ this.removeSelected }>{Weave.lang("Remove selected")}</Button>
					</HBox>
				</VBox>
			);
		}
		else
		{
			return (
				<HBox style={_.merge({flex: 1}, this.props.style)}>
					<ComboBox
						type="multiple"
						style={{
							borderBottomRightRadius: 0,
							borderTopRightRadius: 0
						}}
	                    value={ columnList }
                        placeholder="(None)"
	                    options={ options }
	                    valueEqualityFunc={SelectableAttributesList.nodeEqualityFunc}
	                    onChange={this.setSelected}
					/>
					<Button
						onClick={ this.launchAttributeSelector }
						style={{
							borderBottomLeftRadius: 0,
							borderTopLeftRadius: 0,
							borderLeft: "none"
						}}
				        title={"Click to explore other DataSources for " + this.props.label}
					>
						<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
					</Button>
				</HBox>
			);
		}
        // var labelUI:JSX.Element = null;
        // if (this.props.showLabelAsButton)
        // {
        //     labelStyle.borderColor = '#E6E6E6';
        //     labelUI = <Button style={ labelStyle } onClick={ this.launchAttributeSelector }>{ Weave.lang(this.props.label) }</Button>;
        // }else
        // {
        //     labelUI = <span style={ labelStyle }>{this.props.label}</span>
        // }
		// 
        // let listUI:JSX.Element = <VBox className="weave-padded-vbox">
	    //                              {/*<HBox style={listStyle}>
        //                                 <List selectedValues= { selectedObjects } options={ columnList }  onChange={ this.select }/>
        //                             </HBox>*/}
        //                             <ComboBox type="multiple"
        //                                       value={ columnList }
        //                                       options={ options }
        //                                       valueEqualityFunc={SelectableAttributesList.nodeEqualityFunc}
        //                                       onChange={this.setSelected}
        //                             />
        //                             <HBox className="weave-padded-hbox" style={controllerStyle}>
        //                                 <Button onClick={ this.removeAll }>Remove All</Button>
        //                             </HBox>
        //                         </VBox>
		// 
        // let ui:JSX.Element = ReactUtils.generateGridLayout(["four","twelve"],[[labelUI,listUI]])
    }
}
