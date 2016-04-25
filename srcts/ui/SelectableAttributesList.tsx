// import * as React from "react";
// import * as _ from "lodash";
// import {HBox, VBox} from "../react-ui/FlexBox";
// import List from "../react-ui/List";
// import AttributeSelector from "../ui/AttributeSelector";
// import IAttributeColumn = weavejs.api.data.IAttributeColumn;
// import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
// import ColumnUtils = weavejs.data.ColumnUtils;
// import IColumnWrapper = weavejs.api.data.IColumnWrapper;
// import ControlPanel from "./ControlPanel";
// import Button from "../semantic-ui/Button";
// import ComboBox from "../semantic-ui/ComboBox";
// import {ComboBoxOption} from "../semantic-ui/ComboBox";
// import ReferencedColumn = weavejs.data.column.ReferencedColumn;
// import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
// import IColumnReference = weavejs.api.data.IColumnReference;
// import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
// 
// export interface ISelectableAttributesListProps
// {
// 	attributeName:string;
// 	attributes: Map<string, (IColumnWrapper|ILinkableHashMap)>;
// 	showAsList?: boolean;
//     linkToToolEditorCrumb?:Function;
// 	style?:React.CSSProperties;
// }
// 
// export interface ISelectableAttributesListState
// {
//     selectAll:boolean;
// }
// 
// export default class SelectableAttributesList extends React.Component<ISelectableAttributesListProps, ISelectableAttributesListState>
// {
//     constructor(props:ISelectableAttributesListProps)
// 	{
//         super(props);
//         this.state = {
//             selectAll :false
//         };
// 
//         Weave.getCallbacks(this.props.attributes.get(this.props.attributeName)).addGroupedCallback(this, this.forceUpdate);
//     }
// 	
//     private selectedColumn:IAttributeColumn;
// 
// 	
//     
// 
// 	
// 
//     handleSelectAll =():void =>
// 	{
//         this.setState({selectAll : true});
//     };
// 
//     select =(selectedItems:Array<IAttributeColumn>): void =>
// 	{
//         if (this.state.selectAll)
//             this.setState({selectAll :false});
//         this.selectedColumn = selectedItems[0];
//     };
// 
//     launchAttributeSelector=():ControlPanel=>
// 	{
//         if (this.props.linkToToolEditorCrumb)
//         {
//             this.props.linkToToolEditorCrumb( "Attribute Selector", <AttributeSelector attributeName={this.props.attributeName} attributes={this.props.attributes}/>);
//             return null;
//         }
//         return AttributeSelector.openInstance(this.props.attributeName, this.props.attributes);
//     };
// 
// 	// private static nodeEqualityFunc(a:IColumnReference&IWeaveTreeNode, b:IColumnReference&IWeaveTreeNode):boolean
// 	// {
// 	// 	if (a && b)
// 	// 		return a.equals(b)
// 	// 	else
// 	// 		return (a === b);
// 	// }
// 
//     componentWillUnmount()
// 	{
//         Weave.getCallbacks(this.columns).removeCallback(this, this.forceUpdate);
//     }
// 
//     render(): JSX.Element {
// 
//         
// 
//         let controllerStyle:React.CSSProperties = {
//             justifyContent:'flex-end',
//             background:"#F8F8F8"
//         };
// 
// 
//         var selectedObjects:IAttributeColumn[];
//         var columnList: {label: string, value: IWeaveTreeNode}[] = [];
// 	    var options: {label:string, value:IWeaveTreeNode&IColumnReference}[] = [];
// 	    let siblings:IWeaveTreeNode[] = [];
//         var columns = this.columns.getObjects(IColumnWrapper); // TODO - this does not consider if hash map contains non-IColumnWrapper columns
// 
//         //When all options are selected, needed only for restyling the list and re-render
//         if (this.state.selectAll)
//             selectedObjects = columns;
// 
//         columns.forEach((column:IColumnWrapper)=>{
// 			let node = ColumnUtils.hack_findHierarchyNode(column);
// 			if (!node)
// 				return;
// 			columnList.push({label: node.getLabel(), value: node});
// 			var columnSiblings = HierarchyUtils.findSiblingNodes(node.getDataSource(), node.getColumnMetadata());
// 	        columnSiblings.forEach( (siblingNode:IWeaveTreeNode&IColumnReference) => {
// 		        if (!_.includes(siblings, siblingNode))
// 				{
// 			        siblings.push(siblingNode);
// 			        options.push({label:siblingNode.getLabel(), value: siblingNode});
// 		        }
// 	        });
//         });
// 		
// 		
//         // var labelUI:JSX.Element = null;
//         // if (this.props.showLabelAsButton)
//         // {
//         //     labelStyle.borderColor = '#E6E6E6';
//         //     labelUI = <Button style={ labelStyle } onClick={ this.launchAttributeSelector }>{ Weave.lang(this.props.label) }</Button>;
//         // }else
//         // {
//         //     labelUI = <span style={ labelStyle }>{this.props.label}</span>
//         // }
// 		// 
//         // let listUI:JSX.Element = <VBox className="weave-padded-vbox">
// 	    //                              {/*<HBox style={listStyle}>
//         //                                 <List selectedValues= { selectedObjects } options={ columnList }  onChange={ this.select }/>
//         //                             </HBox>*/}
//         //                             <ComboBox type="multiple"
//         //                                       value={ columnList }
//         //                                       options={ options }
//         //                                       valueEqualityFunc={SelectableAttributesList.nodeEqualityFunc}
//         //                                       onChange={this.setSelected}
//         //                             />
//         //                             <HBox className="weave-padded-hbox" style={controllerStyle}>
//         //                                 <Button onClick={ this.removeAll }>Remove All</Button>
//         //                             </HBox>
//         //                         </VBox>
// 		// 
//         // let ui:JSX.Element = ReactUtils.generateGridLayout(["four","twelve"],[[labelUI,listUI]])
//     }
// }
