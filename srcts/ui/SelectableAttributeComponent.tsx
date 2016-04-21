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

export interface ISelectableAttributeComponentState
{
}

export default class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>
{
	constructor (props:ISelectableAttributeComponentProps)
	{
		super(props);
	}

	static defaultProps = { showLabel: true };

	componentWillReceiveProps(props:ISelectableAttributeComponentProps)
	{
	}

	componentDidMount()
	{
		this.props.attributes.forEach((value, label)=>{
			//TODO Do we add a check for value being an ILinkableObject?
			Weave.getCallbacks(value).addGroupedCallback(this, this.forceUpdate);
		});
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

	private clearColumn =( attr:IColumnWrapper,event:MouseEvent):void =>
	{
		var dc:any;//TODO assign right type
		if (Weave.IS(attr, AlwaysDefinedColumn))
			dc = ColumnUtils.hack_findInternalDynamicColumn(attr);
		else
			dc = attr;
		dc.target = null;

	};
	

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

			return (
				<HBox style={ {flex: 1} }>
					<AttributeDropdown
						title="Change column" style={ dropDownStyle }
						attribute={ ColumnUtils.hack_findInternalDynamicColumn(attribute) }
						clickHandler={ this.launchAttributeSelector.bind(this, this.props.attributeName, attribute) }
					/>
					
					<Button
						onClick={ this.launchAttributeSelector.bind(this, this.props.attributeName, attribute) }
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
			return (
				<SelectableAttributesList
					attributeName={this.props.attributeName} 
					attributes={this.props.attributes}
					linkToToolEditorCrumb={this.props.linkToToolEditorCrumb}
				/>
			);
		}
	}
}


//Custom component to handle drop down selection of columns as well as when selection from attribute selector
//ComboBox allows selection only from drop down, Does not handle case of attribute selector
interface IAttributeDropdownProps extends React.HTMLProps<AttributeDropdown>
{
	attribute:DynamicColumn;
	clickHandler:(event:React.MouseEvent)=>PopupWindow;
}

interface IAttributeDropdownState
{
}

class AttributeDropdown extends React.Component<IAttributeDropdownProps, IAttributeDropdownState>
{
	constructor(props:IAttributeDropdownProps)
	{
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

	componentWillUnmount()
	{
		this.props.attribute.removeCallback(this, this.forceUpdate);//forceUpdate keeps being called when component is unmounted
	}

	state: IAttributeDropdownState = {};
	private click:(event:React.MouseEvent)=>PopupWindow = null;

	onChange = (columnReference: IColumnReference & IWeaveTreeNode) => 
	{
		if (this.comboBox && ReactUtils.hasFocus(this.comboBox))
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
	}

	private static nodeEqualityFunc(a:IColumnReference&IWeaveTreeNode, b:IColumnReference&IWeaveTreeNode):boolean
	{
		if (a && b)
			return a.equals(b)
		else
			return (a === b);
	}

	private comboBox: ComboBox;
	private lastActiveParentNode:IWeaveTreeNode;

	getColumnReferenceDropdownOptions(nodes:IWeaveTreeNode[]):{value: IColumnReference, label: string}[]
	{
		return(
			nodes.map(
				(node) => {
					let colRef = Weave.AS(node, IColumnReference);
					if (!colRef)
						return null;
					let metadata = colRef.getColumnMetadata() as any;
					if (!metadata)
						return null;
					let title:string = metadata[ColumnMetadata.TITLE];
					return {value: colRef, label: Weave.lang(title)};
				}
			).filter(_.identity)
		);
	}

	render():JSX.Element
	{
		let node = ColumnUtils.hack_findHierarchyNode(this.props.attribute);
		let options:{value: IColumnReference, label: string}[] = [];
		let clickHandler = this.props.clickHandler;
		let header:JSX.Element;
		
		let rootNode = node && node.getDataSource().getHierarchyRoot();
		let parentNode = rootNode && HierarchyUtils.findParentNode(rootNode, node.getDataSource(), node.getColumnMetadata());
		if (parentNode)
			this.lastActiveParentNode = parentNode;
		else
			parentNode = this.lastActiveParentNode;
		let siblingNodes = parentNode && parentNode.getChildren();	
		if (siblingNodes)
		{
			header = <span style={{ fontWeight: "bold", fontSize: "small" }}>{ parentNode.getLabel() }</span>;
			clickHandler = null;
			options = this.getColumnReferenceDropdownOptions(siblingNodes);
		}
		else if (node)
		{
			options = this.getColumnReferenceDropdownOptions([node]);
		}

		options.unshift({ value: null, label: "(None)"});

		return (
			<ComboBox 
				ref={(c:ComboBox) => this.comboBox = c}
				valueEqualityFunc={AttributeDropdown.nodeEqualityFunc}
				style={ this.props.style }
				valueIncludesLabel={true}
				value={node ? {label: node.getLabel(), value: node} : {label: "(None)", value: null}}
				onClick={clickHandler}
				options={options}
				onChange={this.onChange}
				header={header}
				optionStyle={{marginLeft:10}}
			/>
		);
	}
}
