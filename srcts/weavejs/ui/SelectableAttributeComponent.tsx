namespace weavejs.ui
{
	import ReactUtils = weavejs.util.ReactUtils;
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
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
	import IColumnReference = weavejs.api.data.IColumnReference;
	import ReferencedColumn = weavejs.data.column.ReferencedColumn;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
	import ControlPanel = weavejs.editor.ControlPanel;
	import AttributeSelector = weavejs.ui.AttributeSelector;
	import ComboBox = weavejs.ui.ComboBox;
	import Button = weavejs.ui.Button;
	import DynamicComponent = weavejs.ui.DynamicComponent;

	export interface ISelectableAttributeComponentProps extends IColumnSelectorProps
	{
	}

	export interface ISelectableAttributeComponentState
	{
	}

	export class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState>
	{
		constructor (props:ISelectableAttributeComponentProps)
		{
			super(props);
		}

		launchAttributeSelector=(attributeName:string):ControlPanel=>
		{
			if (this.props.pushCrumb)
			{
				this.props.pushCrumb("Attributes", <AttributeSelector attributeName={ attributeName } attributes={ this.props.attributes }/>, null);
				return null;
			}
			else
			{
				return AttributeSelector.openInstance(this, attributeName, this.props.attributes);
			}

		};
		
		render():JSX.Element
		{
			return (
				<HBox overflow style={_.merge({flex: 1}, this.props.style)}>
					<ColumnSelector {...this.props}/>
					<Button
						onClick={ () => this.launchAttributeSelector(this.props.attributeName) }
						style={{
							borderBottomLeftRadius: 0,
							borderTopLeftRadius: 0,
							borderLeft: "none"
						}}
						title={Weave.lang("Click to explore other DataSources for " + this.props.attributeName) }
					>
						<i className="fa fa-angle-right" aria-hidden="true" style={ { fontWeight: "bold" } }/>
					</Button>
				</HBox>
			);
		}
	}
}