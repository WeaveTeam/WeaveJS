import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import Tabs from "../react-ui/Tabs";
import Checkbox from "../semantic-ui/Checkbox";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import BinningDefinitionEditor from "./BinningDefinitionEditor";
import ColorRampEditor from "./ColorRampEditor";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import PopupWindow from "../react-ui/PopupWindow";
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

export default class ColorController extends React.Component<ColorControllerProps, ColorControllerState>
{
	
	tabLabels = ["Binning", "Color Scale"]; // , "Color Specific Records"]
	attributes = new Map<string, IColumnWrapper>();
	static window:PopupWindow;
	static activeTabIndex:number = 0;

	constructor(props:ColorControllerProps)
	{
		super(props);
		this.attributes.set("Color Data", this.props.colorColumn);
	}
	
	static close(window:PopupWindow)
	{
		ColorController.window = null;
	}

	static open(colorColumn:ColorColumn)
	{
		if (ColorController.window)
			PopupWindow.close(ColorController.window);

		ColorController.window = PopupWindow.open({
			title: Weave.lang("Color Controller"),
			content: <ColorController colorColumn={colorColumn}/>,
			resizable: true,
			width: 920,
			height: 675,
			onClose: ColorController.close
		});
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
			<VBox style={{flex: 1}}>
				<Tabs
					activeTabIndex={ColorController.activeTabIndex}
					onViewChange={(index) => ColorController.activeTabIndex = index}
					labels={this.tabLabels}
					tabs={[
						<VBox className="weave-container weave-padded-vbox" key={this.tabLabels[0]} style={{flex: 1}}>
							<HBox>
								{Weave.lang("Color data")}
								<SelectableAttributeComponent attributes={this.attributes} attributeName="Color Data"/>
							</HBox>
							<BinningDefinitionEditor binnedColumn={this.binnedColumn}/>
							<HBox>
								<Checkbox style={{marginRight: 5}} onChange={this.handleFilterCheck}/>
								<span style={{alignSelf: "center"}}>
									 {Weave.lang("Filter records prior to binning")}
								</span>
							</HBox>
						</VBox>,
						<VBox key={this.tabLabels[1]} style={{flex: 1, padding: 5}} className="weave-padded-vbox">
							<HBox>
								<Checkbox style={{marginRight: 5}} ref={linkReactStateRef(this, {value: this.props.colorColumn.rampCenterAtZero})}/>
								<span>
									{Weave.lang("Center color ramp at zero (when binning is disabled)")}
								</span>
							</HBox>
							<ColorRampEditor colorRamp={this.props.colorColumn.ramp}/>
						</VBox>
					]}
				/>
			</VBox>
		);
	}
}
