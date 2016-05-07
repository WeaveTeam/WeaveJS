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
import DynamicComponent from "./DynamicComponent";

import ColumnUtils = weavejs.data.ColumnUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import IDataSource = weavejs.api.data.IDataSource;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
import ILinkableObject = weavejs.api.core.ILinkableObject;
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
	pushCrumb?:Function
	showAsList?:boolean;
	style?: React.CSSProperties;
	hideButton?: boolean;
}

export interface ISelectableAttributeComponentState
{
}

export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>
{
	constructor (props:ISelectableAttributeComponentProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}
	private comboBox: ComboBox;
	private lastActiveNode:IWeaveTreeNode & IColumnReference;
	
	static findSelectableAttributes(attribute:IColumnWrapper|ILinkableHashMap, defaultLabel:string = "Data"):[string, Map<string, IColumnWrapper|ILinkableHashMap>]
	{
		var SA = 'selectableAttributes';
	
		var ancestor:ILinkableObject = attribute;
		while (ancestor && !((ancestor as any)[SA] instanceof Map)) // HACK
			ancestor = Weave.getOwner(ancestor);
		
		if (ancestor)
		{
			var map = (ancestor as any)[SA] as Map<string, IColumnWrapper|ILinkableHashMap>;
			if (map)
				for (var [key, value] of map.entries())
					if (value === attribute)
						return [key, map];
		}
		
		return [defaultLabel, new Map<string, IColumnWrapper|ILinkableHashMap>().set(defaultLabel, attribute)];
	}

	private static getDataSourceDependencies(attribute:IColumnWrapper|ILinkableHashMap):IDataSource[]
	{
		let dataSources: IDataSource[];

		let ilhm = Weave.AS(attribute, ILinkableHashMap);
		let icw = Weave.AS(attribute, IColumnWrapper);

		if (icw)
		{
			dataSources = ColumnUtils.getDataSources(icw);
		}
		else if (ilhm)
		{
			dataSources =
				_.flatten(
					(ilhm.getObjects(IColumnWrapper) as IColumnWrapper[]).map(SelectableAttributeComponent.getDataSourceDependencies)
				).filter(_.identity);
		}
		return dataSources;
	}

	launchAttributeSelector=(attributeName:string):ControlPanel=>
	{
		if (this.props.pushCrumb)
		{
			this.props.pushCrumb(
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
		if (this.comboBox && ReactUtils.hasFocus(this.comboBox))
		{
			ColumnUtils.replaceColumnsInHashMap(this.columnsHashmap, selectedOptions);
		}
	};
	
	private get columnsHashmap()
	{
		return this.props.attributes.get(this.props.attributeName) as ILinkableHashMap;
	}
	
	render():JSX.Element
	{
		// set dependencies to make sure we re-render when necessary
		let attribute = nextProps.attributes.get(nextProps.attributeName);
		let dependencies = SelectableAttributeComponent.getDataSourceDependencies(attribute) as ILinkableObject[];
		dependencies.push(attribute);
		DynamicComponent.setDependencies(this, dependencies);
		
		let attribute_ilhm_or_icw = this.props.attributes.get(this.props.attributeName);

		let dropDownStyle: React.CSSProperties = this.props.hideButton ? {} : {
			borderBottomRightRadius: 0,
			borderTopRightRadius: 0
		};

		let buttonStyle: React.CSSProperties = {
			borderBottomLeftRadius: 0,
			borderTopLeftRadius: 0,
			borderLeft: "none"
		};

		if (Weave.IS(attribute_ilhm_or_icw, IColumnWrapper))
		{
			let attribute = attribute_ilhm_or_icw as IColumnWrapper;
			
			let node = ColumnUtils.hack_findHierarchyNode(attribute, true);
	
			if (node)
				this.lastActiveNode = node;
	
			let options:{value:IWeaveTreeNode, label: string}[] = [];
			
			let rootNode = node && node.getDataSource().getHierarchyRoot();
			let parentNode = rootNode && HierarchyUtils.findParentNode(rootNode, node.getDataSource(), node.getColumnMetadata());
			let header = <span style={{ fontWeight: "bold", fontSize: "small" }}>{ parentNode && parentNode.getLabel() }</span>;

			if (this.lastActiveNode)
			{
				options = HierarchyUtils.findSiblingNodes(this.lastActiveNode.getDataSource(), this.lastActiveNode.getColumnMetadata()).map((node) => {
					return {
						value: node,
						label: node.getLabel()
					}
				});
			}
			options.push({
				value: null,
				label: "(None)"
			});

			return (
				<HBox style={ _.merge({ flex: 1 }, this.props.style) } >
					<ComboBox
						ref={(c:ComboBox) => this.comboBox = c}
						title={Weave.lang("Change column")}
						style={dropDownStyle}
						valueIncludesLabel={true}
						value={node ? {label: node.getLabel(), value: node} : {label: "(None)", value: null}}
						options={options}
						onChange={this.setColumn}
						header={header}
					/>
					{this.props.hideButton ? null : <Button
						onClick={ () => this.launchAttributeSelector(this.props.attributeName) }
						style={buttonStyle}
						title={"Click to explore other DataSources for " + this.props.attributeName}
						>
						<i className="fa fa-angle-right" aria-hidden="true" style={ { fontWeight: "bold" } }/>
					</Button>}
				</HBox>
			);
		}
		else if (Weave.IS(attribute_ilhm_or_icw, ILinkableHashMap))
		{
			let attribute = attribute_ilhm_or_icw as ILinkableHashMap;
			
			var value: {label: string, value: IWeaveTreeNode}[] = [];

			var nodes = new Set<IWeaveTreeNode>();

			let siblings:IWeaveTreeNode[] = [];
			var columns = this.columnsHashmap.getObjects(IAttributeColumn);
			
			if (columns.length)
			{
				columns.forEach((column:IAttributeColumn, index:number)=>{
					let node = ColumnUtils.hack_findHierarchyNode(column, true);
					if (node)
					{
						this.lastActiveNode = node;
						value.push({label: node.getLabel(), value: node});
					}
					if (!this.lastActiveNode)
						return;
					var columnSiblings = HierarchyUtils.findSiblingNodes(this.lastActiveNode.getDataSource(), node.getColumnMetadata());
					columnSiblings.forEach( (siblingNode:IWeaveTreeNode&IColumnReference) => {
						nodes.add(siblingNode);
					});
				});
			}
			else if (this.lastActiveNode)
			{
				HierarchyUtils.findSiblingNodes(this.lastActiveNode.getDataSource(), this.lastActiveNode.getColumnMetadata()).forEach((node) => {
					nodes.add(node);
				});
			}
			
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
					<HBox style={_.merge({flex: 1}, this.props.style)}>
						<ComboBox 
							ref={(c:ComboBox) => this.comboBox = c}
							type="multiple"
							valueIncludesLabel={true}
							style={dropDownStyle}
		                    value={value}
	                        placeholder={Weave.lang("(None)")}
		                    options={ Array.from(nodes.keys()).map( (node) => {
		                        return {label: node.getLabel(), value: node}
                            })}
		                    onChange={this.setColumnInHashmap}
						/>
						{ this.props.hideButton ? null : <Button
							onClick={ () => this.launchAttributeSelector(this.props.attributeName) }
							style={buttonStyle}
							title={Weave.lang("Click to explore other DataSources for " + this.props.attributeName) }
							>
							<i className="fa fa-angle-right" aria-hidden="true" style={ { fontWeight: "bold" } }/>
						</Button>}
					</HBox>
				);
			}
		}
	}
}
