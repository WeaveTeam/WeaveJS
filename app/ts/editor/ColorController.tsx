namespace weavejs.editor
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import Tabs = weavejs.ui.Tabs;
	import Checkbox = weavejs.ui.Checkbox;
	import SelectableAttributeComponent = weavejs.ui.SelectableAttributeComponent;
	import BinningDefinitionEditor = weavejs.editor.BinningDefinitionEditor;
	import ColorRampEditor = weavejs.editor.ColorRampEditor;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils
	import PopupWindow = weavejs.dialog.PopupWindow;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;

	export interface ColorControllerProps extends React.Props<ColorController>
	{
		colorColumn:ColorColumn;
	}

	export interface ColorControllerState
	{
		
	}

	export class ColorController extends React.Component<ColorControllerProps, ColorControllerState>
	{
		
		tabLabels = ["Color theme", "Binning"]; // , "Color Specific Records"]
		attributes = new Map<string, IColumnWrapper>();

		constructor(props:ColorControllerProps)
		{
			super(props);
			this.attributes.set("Color data", this.props.colorColumn);
		}
		
		get binnedColumn():BinnedColumn { return this.props.colorColumn && this.props.colorColumn.getInternalColumn() as BinnedColumn };
		get dataColumn():FilteredColumn { return this.binnedColumn && this.binnedColumn.internalDynamicColumn.target as FilteredColumn };

		handleFilterCheck = (value:boolean) =>
		{
			if (value)
				this.dataColumn.filter.targetPath = ["defaultSubsetKeyFilter"];
			else
				this.dataColumn.filter.targetPath = null;
		}
		
		render():JSX.Element
		{
			return (
				<VBox overflow style={{flex: 1}}>
					<Tabs
						initialActiveTabIndex={0}
						labels={this.tabLabels}
						tabs={[
							<VBox key={this.tabLabels[1]} style={ {flex: 1, padding: 8} } className="weave-padded-vbox">
								<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, {value: this.props.colorColumn.rampCenterAtZero})} label={Weave.lang("Center color ramp at zero (when binning is disabled)")}/>
								<ColorRampEditor colorRamp={this.props.colorColumn.ramp}/>
							</VBox>,
							<VBox overflow className="weave-padded-vbox" key={this.tabLabels[0]} style={{flex: 1, padding: 8}}>
								<HBox overflow className="weave-padded-hbox" style={ {alignItems: "center"} }>
									{Weave.lang("Color data")}
									<SelectableAttributeComponent attributes={this.attributes} attributeName="Color data"/>
								</HBox>
								<BinningDefinitionEditor binnedColumn={this.binnedColumn}/>
								<Checkbox onChange={this.handleFilterCheck} label={Weave.lang("Filter records prior to binning")}/>
							</VBox>
						]}
					/>
				</VBox>
			);
		}
	}
}
