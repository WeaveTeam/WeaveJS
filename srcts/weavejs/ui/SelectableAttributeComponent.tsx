namespace weavejs.ui
{
	import ReactUtils = weavejs.util.ReactUtils;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils;
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
	import ColorColumn = weavejs.data.column.ColorColumn;
	import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
	import ControlPanel = weavejs.editor.ControlPanel;
	import AttributeSelector = weavejs.ui.AttributeSelector;
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import ComboBox = weavejs.ui.ComboBox;
	import Button = weavejs.ui.Button;
	import ColorPicker = weavejs.ui.ColorPicker;
	import StandardLib = weavejs.util.StandardLib;
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

		renderAttributeSelectorForEditor=(attributeName:string):React.ReactChild =>
		{
			return <AttributeSelector attributeName={ attributeName } attributes={ this.props.attributes }/>
		};

		launchAttributeSelector=(attributeName:string):ControlPanel=>
		{
			if (this.props.pushCrumb)
			{
				this.props.pushCrumb("Attributes", this.renderAttributeSelectorForEditor.bind(this,attributeName),null);
				return null;
			}
			else
			{
				return AttributeSelector.openInstance(this, attributeName, this.props.attributes);
			}

		};
		
		render():JSX.Element
		{
			let mainSelector = <HBox overflow style={_.merge({flex: 1}, this.props.style)}>
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
					</HBox>;

			let column = this.props.attributes.get(this.props.attributeName);
			let adc = Weave.AS(column, AlwaysDefinedColumn);
			let defaultSelector:JSX.Element = null;

			if (adc)
			{
				let isColorColumn = adc && Weave.IS(adc.internalDynamicColumn.target, ColorColumn);
				if (isColorColumn)
				{
					defaultSelector = <DynamicComponent dependencies={[adc.defaultValue]} render={
						()=>
						{
							let value = adc.defaultValue.state;
							let hexColor:string;
							if (typeof value == typeof 0)
							{
								hexColor = StandardLib.getHexColor(value as number);
							}
							else if (typeof value == typeof "")
							{
								hexColor = (value as string);
							}
							else
							{
								hexColor = "000000";
							}
							return <HBox>
								<ColorPicker style={{width: "45px", height: "initial", borderBottomRightRadius: 0, borderTopRightRadius: 0}} hexColor={hexColor} onChange={(value)=>{adc.defaultValue.state = value;}}/>
								<Button style={{borderBottomLeftRadius:0, borderTopLeftRadius: 0, borderLeft: "none"}} onClick={ () => {adc.defaultValue.state = null;}} title={Weave.lang("Clear color")}>
									<i className="fa fa-remove" aria-hidden="true"/>
								</Button>
							</HBox>
						}
					}/>
				}
				else
				{
					defaultSelector = <StatefulTextField style={{flex: 1}} ref={WeaveReactUtils.linkReactStateRef(this, { value: adc.defaultValue })}/>;
				}
			}
			return (
				<VBox overflow padded>
					{mainSelector}
					{defaultSelector ? <HBox padded><div style={{alignSelf: "center"}}>{Weave.lang("Default value")}</div>{defaultSelector}</HBox> : null}
				</VBox>
			);
		}
	}
}