import * as React from "react";
import * as _ from "lodash";
import {VBox, HBox} from '../react-ui/FlexBox';
import Button from "../semantic-ui/Button";
import AttributeSelector from "../ui/AttributeSelector";
import classNames from "../modules/classnames";
import PopupWindow from "../react-ui/PopupWindow";
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
	showAsList?:boolean;
}

export interface ISelectableAttributeComponentState
{
}

export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>
{
	constructor (props:ISelectableAttributeComponentProps)
	{
		super(props);
	}
	private comboBox: ComboBox;
	private lastActiveNode:IWeaveTreeNode & IColumnReference;

	componentDidMount()
	{
		Weave.getCallbacks(this.props.attributes.get(this.props.attributeName)).addGroupedCallback(this, this.forceUpdate);
	}
	
	launchAttributeSelector=(attributeName:string):ControlPanel=>
	{
		if (this.props.linkToToolEditorCrumb)
		{
			this.props.linkToToolEditorCrumb(
				"Attributes",
				<AttributeSelector
					attributeName={ attributeName }
					attributes={ this.props.attributes }
				/>
			);
			return null;
		}
		else
		{
			return AttributeSelector.openInstance(attributeName, this.props.attributes);
		}

	};
	
	private setColumn=(columnReference:IColumnReference)=> 
	{
		if (this.comboBox && ReactUtils.hasFocus(this.comboBox))
		{
			var dynamicColumn = ColumnUtils.hack_findInternalDynamicColumn(this.props.attributes.get(this.props.attributeName) as IColumnWrapper);
			
			if (columnReference)
			{
				let internalReferencedColumn = dynamicColumn.requestLocalObject(ReferencedColumn) as ReferencedColumn;
				internalReferencedColumn.setColumnReference(columnReference.getDataSource(), columnReference.getColumnMetadata());
			}
			else
			{
				dynamicColumn.removeObject();
			}
		}
	}
	
	setColumnInHashmap=(selectedOptions:IWeaveTreeNode[]):void=>
	{
		ColumnUtils.replaceColumnsInHashMap(this.columnsHashmap, selectedOptions);
	};
	
	private get columnsHashmap()
	{
		return this.props.attributes.get(this.props.attributeName) as ILinkableHashMap;
	}
	
	render():JSX.Element
	{
		let attribute_ilhm_or_icw = this.props.attributes.get(this.props.attributeName);

		if (Weave.IS(attribute_ilhm_or_icw, IColumnWrapper))
		{
			let attribute = attribute_ilhm_or_icw as IColumnWrapper;

			let dropDownStyle:React.CSSProperties = {
				borderBottomRightRadius:0,
				borderTopRightRadius:0
			};

			let buttonStyle:React.CSSProperties = {
				borderBottomLeftRadius:0,
				borderTopLeftRadius:0,
				borderLeft:"none"
			};
			
			let node = ColumnUtils.hack_findHierarchyNode(attribute);
	
			if(node) {
				this.lastActiveNode = node;
			}
	
			let options:{value:IWeaveTreeNode, label: string}[] = [];
			
			let rootNode = node && node.getDataSource().getHierarchyRoot();
			let parentNode = rootNode && HierarchyUtils.findParentNode(rootNode, node.getDataSource(), node.getColumnMetadata());
			let header = <span style={{ fontWeight: "bold", fontSize: "small" }}>{ parentNode && parentNode.getLabel() }</span>;

			if(this.lastActiveNode)
			{
				options = HierarchyUtils.findSiblingNodes(this.lastActiveNode.getDataSource(), this.lastActiveNode.getColumnMetadata()).map((node) => {
					return {
						value: node,
						label: node.getLabel()
					}
				});
			}
			options.push({ value: null, label: "(None)"});
			return (
				
				<HBox style={ {flex: 1} }>
					<ComboBox
						ref={(c:ComboBox) => this.comboBox = c}
						title={Weave.lang("Change column")}
						style={dropDownStyle}
						valueIncludesLabel={true}
						value={node ? {label: node.getLabel(), value: node} : {label: "(None)", value: null}}
						options={options}
						onChange={this.setColumn}
						optionStyle={{marginLeft:10}}
						header={header}
					/>
					<Button
						onClick={ () => this.launchAttributeSelector(this.props.attributeName) }
						style={buttonStyle}
						title={"Click to explore other DataSources for " + this.props.attributeName}
					>
						<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
					</Button>
				</HBox>
			);
		}
		else if (Weave.IS(attribute_ilhm_or_icw, ILinkableHashMap))
		{
			let attribute = attribute_ilhm_or_icw as ILinkableHashMap;
			var value: {label: string, value: IWeaveTreeNode}[] = [];
			var options: {label:string, value:IWeaveTreeNode&IColumnReference}[] = [];
			let siblings:IWeaveTreeNode[] = [];
			var columns = this.columnsHashmap.getObjects(IColumnWrapper); // TODO - this does not consider if hash map contains non-IColumnWrapper columns
			
			columns.forEach((column:IColumnWrapper)=>{
				let node = ColumnUtils.hack_findHierarchyNode(column);
				if (!node)
					return;
				value.push({label: node.getLabel(), value: node});
				
				var columnSiblings = HierarchyUtils.findSiblingNodes(node.getDataSource(), node.getColumnMetadata());
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
				var listStyle:React.CSSProperties = {
		            minHeight: '200px',
		            overflow: 'auto',
		            flex:1
		        };
				
				// <VBox style={listStyle} className="weave-padded-vbox">
				// 	<List selectedValues={value.map((option) => option.value)} options={options}/>
				// 	<HBox className="weave-padded-hbox" style={controllerStyle}>
				// 		<Button onClick={ this.handleSelectAll }>{Weave.lang("Select all")}</Button>
				// 		<Button onClick={ this.removeSelected }>{Weave.lang("Remove selected")}</Button>
				// 	</HBox>
				// </VBox>

				return (
					<div/>
				);
			}
			else
			{
				return (
					<HBox style={{flex: 1}}>
						<ComboBox 
							type="multiple"
							valueIncludesLabel={true}
							style={{
							  borderBottomRightRadius: 0,
							  borderTopRightRadius: 0
							}}
		                    value={value}
	                        placeholder={Weave.lang("(None)")}
		                    options={ options }
		                    onChange={this.setColumnInHashmap}
						/>
						<Button
							onClick={ () => this.launchAttributeSelector(this.props.attributeName) }
							style={{
								borderBottomLeftRadius: 0,
								borderTopLeftRadius: 0,
								borderLeft: "none"
							}}
					        title={Weave.lang("Click to explore other DataSources for " + this.props.attributeName)}
						>
							<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
						</Button>
					</HBox>
				);
			}
		}
	}
}
