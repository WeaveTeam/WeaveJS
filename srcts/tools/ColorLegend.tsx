import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import MiscUtils from "../utils/MiscUtils";
import ReactUtils from "../utils/ReactUtils";
import * as ReactDOM from "react-dom";
import {CSSProperties} from "react";
import prefixer from "../react-ui/VendorPrefixer";
import ToolTip from "./ToolTip";
import AbstractVisTool from "./AbstractVisTool";
import {HBox, VBox} from "../react-ui/FlexBox";
import Menu from "../react-ui/Menu";
import {MenuItemProps, IGetMenuItems} from "../react-ui/Menu";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import ColorRampComponent from "../react-ui/ColorRampComponent";
import Input from "../semantic-ui/Input";
import ComboBox from "../semantic-ui/ComboBox";
import ColorRampEditor from "../editors/ColorRampEditor";
import Button from "../semantic-ui/Button";
import ColorController from "../editors/ColorController";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import StatefulTextField from "../ui/StatefulTextField";
import BinNamesList from "../ui/BinNamesList";
import {BinningDefinitionSelector} from "../editors/BinningDefinitionEditor";
import PrintUtils from "../utils/PrintUtils";
import Accordion from "../semantic-ui/Accordion";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import IBinningDefinition = weavejs.api.data.IBinningDefinition;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import KeySet = weavejs.data.key.KeySet;
import LinkableNumber = weavejs.core.LinkableNumber;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import IColumnReference = weavejs.api.data.IColumnReference;
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import ColorRamp = weavejs.util.ColorRamp;
import StandardLib = weavejs.util.StandardLib;

import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import CustomSplitBinningDefinition = weavejs.data.bin.CustomSplitBinningDefinition;
import QuantileBinningDefinition = weavejs.data.bin.QuantileBinningDefinition;
import EqualIntervalBinningDefinition = weavejs.data.bin.EqualIntervalBinningDefinition;
import StandardDeviationBinningDefinition = weavejs.data.bin.StandardDeviationBinningDefinition;
import CategoryBinningDefinition = weavejs.data.bin.CategoryBinningDefinition;
import NaturalJenksBinningDefinition = weavejs.data.bin.NaturalJenksBinningDefinition;
import ColumnUtils = weavejs.data.ColumnUtils;

const SHAPE_TYPE_CIRCLE:string = "circle";
const SHAPE_TYPE_SQUARE:string = "square";
const SHAPE_TYPE_LINE:string = "line";
const SHAPE_TYPE_BOX:string = "box";
const SHAPE_MODES:{label:string, value:any}[] = [
	{label: "Circle", value: SHAPE_TYPE_CIRCLE},
	{label: "Line", value: SHAPE_TYPE_LINE},
	{label: "Square", value: SHAPE_TYPE_SQUARE},
	{label: "Box", value: SHAPE_TYPE_BOX}
];

export default class ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements weavejs.api.core.ILinkableObjectWithNewProperties, IVisTool, IInitSelectableAttributes
{
	panelTitle = Weave.linkableChild(this, LinkableString);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	dynamicColorColumn = Weave.linkableChild(this, DynamicColumn);
	maxColumns = Weave.linkableChild(this, new LinkableNumber(1));
	shapeSize = Weave.linkableChild(this, new LinkableNumber(25));
	shapeType = Weave.linkableChild(this, new LinkableString(SHAPE_TYPE_CIRCLE));
	showLegendName = Weave.linkableChild(this, new LinkableBoolean(true));
	//lineStyle = Weave.linkableChild(this, SolidLineStyle);
	altText:LinkableString = Weave.linkableChild(this, new LinkableString(this.panelTitle.value));

	element:HTMLElement;
	
	private get colorColumn() { return this.dynamicColorColumn.target as ColorColumn; }
	private get binnedColumn() { var cc = this.colorColumn; return cc ? cc.getInternalColumn() as BinnedColumn : null; }
	private get binningDefinition() { var bc = this.binnedColumn ; return bc ? bc.binningDefinition.target as IBinningDefinition : null; }
	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }

	private toolTip:ToolTip;

	constructor(props:IVisToolProps)
	{
		super(props);
		
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		
		this.filteredKeySet.setSingleKeySource(this.dynamicColorColumn);
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];
		this.dynamicColorColumn.targetPath = ['defaultColorColumn'];

		this.state = {
			selected:[],
			probed:[]
		};


	}
	
	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;;
	}

	get defaultPanelTitle():string
	{
		var column = this.colorColumn;
		var title = this.colorColumn.getMetadata("title");
		if(title == null)
			return Weave.lang('Color Legend');

		return Weave.lang("Color Legend of {0}", title);
	}
	
	get numberOfBins():number
	{
		var bc = this.binnedColumn;
		return bc ? bc.numberOfBins : 0;
	}


	getSelectedBins():number[]
	{
		return _.unique(this.selectionKeySet.keys.map((key:IQualifiedKey) => this.binnedColumn.getValueFromKey(key, Number)));
	}

	getProbedBins():number[]
	{
		return _.unique(this.probeKeySet.keys.map((key:IQualifiedKey) => this.binnedColumn.getValueFromKey(key, Number)));
	}

	handleClick(bin:number, event:React.MouseEvent):void
	{
		var selectedBins:number[] = this.getSelectedBins();
		var _binnedKeysArray:IQualifiedKey[][] = (this.binnedColumn as any)['_binnedKeysArray'];
		if (_.contains(selectedBins, bin))
		{
			var currentSelection:IQualifiedKey[] = this.selectionKeySet.keys;
			currentSelection = _.difference(currentSelection, _binnedKeysArray[bin]);
			this.selectionKeySet.replaceKeys(currentSelection);
			_.remove(selectedBins, (value:number) => value == bin);
		}
		else
		{
			if ((event.ctrlKey || event.metaKey))
				this.selectionKeySet.addKeys(_binnedKeysArray[bin]);
			else
				this.selectionKeySet.replaceKeys(_binnedKeysArray[bin]);
		}
	}

	handleProbe(bin:number, mouseOver:boolean, event:MouseEvent):void
	{
		if (mouseOver)
		{
			var keys:IQualifiedKey[] = this.binnedColumn.getKeysFromBinIndex(bin);
			if (!keys)
				return;
			this.probeKeySet.replaceKeys(keys);
		}
		else
		{
			this.probeKeySet.replaceKeys([]);
		}
		this.toolTip.show(this, event, this.probeKeySet.keys, [this.binnedColumn.internalDynamicColumn]);
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
		this.toolTip = ReactUtils.openPopup(this, <ToolTip/>) as ToolTip;
	}
	
	componentWillUnmount()
	{
		ReactUtils.closePopup(this.toolTip);
	}

	getMenuItems():MenuItemProps[]
	{
		let menuItems:MenuItemProps[] = AbstractVisTool.getMenuItems(this);

		if(Weave.beta)
			menuItems.push({
				label: Weave.lang("Print Tool (Beta)"),
				click: PrintUtils.printTool.bind(null, ReactDOM.findDOMNode(this))
			});

		return menuItems;
	}

	private cellBorderWidth:number = 1;
	private cellPadding:number = 2;
	getInteractionStyle(bin:number):CSSProperties
	{
		var probed:boolean = this.getProbedBins().indexOf(bin) >= 0;
		var selected:boolean = this.getSelectedBins().indexOf(bin) >= 0;
		
		var borderAlpha:number;
		if (probed)
			borderAlpha = 1;
		else if (selected)
			borderAlpha = 0.5;
		else
			borderAlpha = 0;

		// important to have flexShrink  = 0 for flexItem
		// else the scrollbar won't appear when user choose fixed value for Size
		return {
			borderColor: MiscUtils.rgba(0, 0, 0, borderAlpha),
			borderStyle: "solid",
			borderWidth: this.cellBorderWidth,
			padding: this.cellPadding,
			overflow: "hidden",
			alignItems: "center",
			flexShrink: isNaN(this.shapeSize.value) ? 1 : 0,
			minWidth:0
		};
	}

	render()
	{
		if (this.numberOfBins)
		{
			//Binned plot case
			var shapeSize:number = this.shapeSize.value;
			var shapeType:string = this.shapeType.value;
			var maxColumns:number = this.maxColumns.value;
			var columnFlex:number = 1.0/maxColumns;

			// empty  cells to match the Column division
			var extraCells:number = this.numberOfBins % maxColumns == 0 ? 0 :  maxColumns - (this.numberOfBins % maxColumns);
			var totalCells:number = this.numberOfBins + extraCells;

			if(isNaN(shapeSize))
			{
				// shape size dynamically grow with container resize
				shapeSize = _.max( [1, _.min([shapeSize, this.element.clientHeight / this.numberOfBins]) ] ) ;
				shapeSize = (shapeSize - (2 * this.cellBorderWidth + 2 * this.cellPadding )) / 2;
			}


			var textLabelFunction:Function = this.binnedColumn.deriveStringFromNumber.bind(this.binnedColumn);
			var textStyle:{} = prefixer({
				paddingLeft: 4,
				userSelect: "none",
				textOverflow: "ellipsis",
				overflow: "hidden",
				whiteSpace: "nowrap",
				minWidth:0, /* important to give min-width / width/ max-width else flex item won't go behind intrinsic width */
				flex:"0.8 0" /* important to give flex value for text, else text width will alter the shape size */

			});

			// Array of Legend Container based on number of Columns in Session
			let columns:JSX.Element[] = [];


			for (var colIndex:number = 0; colIndex < maxColumns; colIndex++)
			{
				// Array of Legend UI based on number of bins
				var rows:JSX.Element[] = [];


				// on each column loop - respective cells are picked
				for (var cellIndex = 0; cellIndex < totalCells; cellIndex++)
				{
					// respective cells for col index are picked here
					// for example say there are 8 cells and maxColumns 3,
					// col[0] gets cells - 0,3 and 6,
					// col[1] gets cells - 1,4 and 7,
					// col[2] gets cells - 2,5 and 8
					if (cellIndex % maxColumns == colIndex)
					{
						// Legend UI are created only for cell-index which are less that bins count
						if (cellIndex < this.numberOfBins)
						{
							// get the shape Element
							var shapeElement:JSX.Element[] = null;
							let shapeColor:string = MiscUtils.rgb_a( this.colorColumn.ramp.getColor(cellIndex, 0, this.numberOfBins - 1), 1.0 );
							let shapeStyle:React.CSSProperties = {
								backgroundColor:shapeColor
							};


							if(shapeType == SHAPE_TYPE_BOX)
							{
								_.merge(shapeStyle, { flex:"1 0", alignItems:"center", justifyContent:"center", height:shapeSize } );
								shapeElement =  [
													<HBox key={"box"} style={shapeStyle}>
														<div style={ {stroke: "black",strokeOpacity: 0.5,backgroundColor: "#FFF"} }>
															<span style={textStyle}> { Weave.lang(textLabelFunction(cellIndex)) } </span>
														</div>
													</HBox>
												];
							}
							else //handle different cases for circle/square/line
							{
								let shapeContainerStyle:React.CSSProperties = {
									width:shapeSize,
									height:shapeSize
								};

								shapeStyle.width = "100%";

								switch (shapeType)
								{
									case SHAPE_TYPE_CIRCLE :
										_.merge(shapeStyle,{ paddingTop:"100%", borderRadius:"50%" });
										break;
									case SHAPE_TYPE_SQUARE :
										_.merge(shapeStyle,{ paddingTop:"100%" });
										break;
									case SHAPE_TYPE_LINE :
										shapeContainerStyle.display = "flex";
										shapeContainerStyle.alignItems = "center";
										_.merge(shapeStyle,{ height:4 });
										break;
								}



								// shape needs wrapper to enusure the shape maintains an aspect ratio = 1
								// container gets absolute values
								// shape is set to use 100percent using width and padding-top
								shapeElement =  [
													<div key={shapeType} style={shapeContainerStyle}>
														<div style={shapeStyle}></div>
													</div>,
													<span key={"label"} style={textStyle}>{ Weave.lang(textLabelFunction(cellIndex)) }</span>
												];

							}

							rows.push(
										<HBox key={cellIndex}
										      style={this.getInteractionStyle(cellIndex)}
										      onClick={this.handleClick.bind(this, cellIndex)}
										      onMouseMove={this.handleProbe.bind(this, cellIndex, true)}
										      onMouseOut={this.handleProbe.bind(this, cellIndex, false)}>
											{shapeElement}
										</HBox>
									);
						}
						else
						{
							// pushing empty row is important
							// we kept column Vbox Justify-content value = space-around
							// if number of flexItem in each column aren't equal cell wont align row wise
							// setting height value is important to match the other cell height
							var cellHeight:number = shapeSize + (2 * this.cellPadding) + (2 * this.cellBorderWidth);
							rows.push(<HBox key={cellIndex} style={ {height:cellHeight} } />)
						}

					}


				}

				// min width value is required
				// flex items will refuse to go below the minimum intrinsic width
				// unless we specify either width /minwidth /maxwidth
				columns[colIndex] = <VBox key={colIndex} style={ { flex:columnFlex  , minWidth:0, padding: "4px", justifyContent:"space-around"} }>
										{ rows }
									</VBox> ;

			}

			// if user specifies fixed Size, scrollbar has to be provided
			var overflowValue:string = isNaN(this.shapeSize.value)  ? "hidden": "auto";

			return (<VBox style={ {flex: 1, padding: "0px 5px 0px 5px", overflow: "hidden"} } ref={(vbox:VBox) => this.element = ReactDOM.findDOMNode(vbox) as HTMLElement}>
						{
							this.showLegendName.value
							?	<HBox style={{flex: 0.1, alignItems:"center"}}>
									<span style={ textStyle }>{ Weave.lang(this.dynamicColorColumn.getMetadata('title')) }</span>
								</HBox>
							:	null
						}
						<HBox style={ {flex: this.showLegendName.value ? 0.9 : 1.0 ,  overflowY: overflowValue, overflowX:"hidden"} }>
							{ columns }
						</HBox>
					</VBox> );
		}
		else
		{
			//Continuous plot case
			if (this.colorColumn)
			{
				var dataColumn = this.colorColumn.internalDynamicColumn;
				
				return (
					<VBox style={{flex: 1, marginLeft: 20, marginBottom: 8}} className="weave-padded-vbox">
						<label style={{marginTop: 5, fontWeight: "bold"}}>{Weave.lang(this.dynamicColorColumn.getMetadata('title'))}</label>
						<HBox style={{flex: 1, overflow: "auto"}} className="weave-padded-hbox">
							<ColorRampComponent style={{width: 30}} direction="bottom" ramp={this.colorColumn ? this.colorColumn.ramp.getHexColors():[]}/>
							<VBox style={{justifyContent: "space-between"}}>
								{ColumnUtils.deriveStringFromNumber(dataColumn, this.colorColumn.getDataMax())}
								{this.colorColumn.rampCenterAtZero.value ? ColumnUtils.deriveStringFromNumber(dataColumn, 0) : null}
								{ColumnUtils.deriveStringFromNumber(dataColumn, this.colorColumn.getDataMin())}
							</VBox>
						</HBox>
					</VBox>
				);
			}
			return <div/>;
		}
	}

	get selectableAttributes()
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
			.set("Color data", this.dynamicColorColumn);
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}
	
	renderEditor = (pushCrumb:Function = null):JSX.Element =>
	{
		return Accordion.render(
			[
				Weave.lang("Data"),
				<BinningDefinitionSelector
					insertTableRows={[
						[
							Weave.lang("Color theme"),
							<ColorRampEditor
								compact={true}
								colorRamp={this.colorColumn.ramp}
								pushCrumb={ pushCrumb }
							/>
						]
					]}
					attributeName="Color data"
					attributes={this.selectableAttributes}
					pushCrumb={ pushCrumb }
				/>
			],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("Chart title"),
						<StatefulTextField ref={ linkReactStateRef(this, {value: this.panelTitle})} placeholder={this.defaultPanelTitle}/>
					],
					[
						Weave.lang("Shape type"),
						<ComboBox ref={linkReactStateRef(this, { value: this.shapeType })} options={SHAPE_MODES}/> 
					],
					[
						Weave.lang("Shape Size"),
						<StatefulTextField type="number" style={{textAlign: "center", width:50}} ref={linkReactStateRef(this, {value: this.shapeSize})}/>
					],
					[ 
						Weave.lang("Number of columns"),
						<StatefulTextField type="number" style={{textAlign: "center", width:50}} ref={linkReactStateRef(this, {value: this.maxColumns})}/>
					]
				]
			]
		);
	}

	get deprecatedStateMapping():Object
	{
		return {
			children: {
				visualization: {
					plotManager: {
						marginTop: (str:string) => this.showLegendName.value = str != '0',
						plotters: {
							plot: this
						}
					}
				}
			}
		};
	}
}

Weave.registerClass(
	ColorLegend,
	["weavejs.tool.ColorLegend", "weave.visualization.tools::ColorBinLegendTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Color Legend"
);
