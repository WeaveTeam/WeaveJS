import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import {HSpacer, VSpacer} from "../react-ui/Spacer";
import StatefulTextField from "../ui/StatefulTextField";
import HelpIcon from "../react-ui/HelpIcon";
import Input from "../semantic-ui/Input";
import Checkbox from "../semantic-ui/Checkbox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import FixedDataTable from "../tools/FixedDataTable";
import {IRow} from "../tools/FixedDataTable";
import {IColumnTitles} from "../tools/FixedDataTable";
import BinNamesList from "../ui/BinNamesList";
import ReactUtils from "../utils/ReactUtils";
import Button from "../semantic-ui/Button";
import ComboBox from "../semantic-ui/ComboBox";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import LinkableString = weavejs.core.LinkableString;
import LinkableNumber = weavejs.core.LinkableNumber;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import IBinningDefinition = weavejs.api.data.IBinningDefinition;
import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import CustomSplitBinningDefinition = weavejs.data.bin.CustomSplitBinningDefinition;
import QuantileBinningDefinition = weavejs.data.bin.QuantileBinningDefinition;
import EqualIntervalBinningDefinition = weavejs.data.bin.EqualIntervalBinningDefinition;
import StandardDeviationBinningDefinition = weavejs.data.bin.StandardDeviationBinningDefinition;
import CategoryBinningDefinition = weavejs.data.bin.CategoryBinningDefinition;
import NaturalJenksBinningDefinition = weavejs.data.bin.NaturalJenksBinningDefinition;

export interface BinningDefinitionEditorProps
{
	binnedColumn:BinnedColumn;
	compact?:boolean;
}

export interface BinningDefinitionEditorState
{
	
}

export default class BinningDefinitionEditor extends React.Component<any, any>
{
	
	public setTarget(object:ILinkableObject):void
	{
		this._binnedColumnWatcher.target = object as BinnedColumn;
	}
	public  hasPendingChanges():boolean { return false; }
	public  applyChanges():void { }

	private  _binnedColumnWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(BinnedColumn, null, this.handleBinnedColumnChange.bind(this)));

	private  get binnedColumn():BinnedColumn { return this._binnedColumnWatcher.target as BinnedColumn; }
	public  _simple:SimpleBinningDefinition = Weave.disposableChild(this, SimpleBinningDefinition);
	private  _customSplit:CustomSplitBinningDefinition = Weave.disposableChild(this, CustomSplitBinningDefinition);
	private  _quantile:QuantileBinningDefinition = Weave.disposableChild(this, QuantileBinningDefinition);
	private  _equalInterval:EqualIntervalBinningDefinition = Weave.disposableChild(this, EqualIntervalBinningDefinition);
	private  _stdDev:StandardDeviationBinningDefinition = Weave.disposableChild(this, StandardDeviationBinningDefinition);
	private  _category:CategoryBinningDefinition = Weave.disposableChild(this, CategoryBinningDefinition);
	private  _jenks:NaturalJenksBinningDefinition = Weave.disposableChild(this, NaturalJenksBinningDefinition);

	// TODO should Dictionary 2D be used ?
	static binClassToBinLabel = new Map<typeof AbstractBinningDefinition, string>()
								   .set(SimpleBinningDefinition, "Equally spaced")
								   .set(CustomSplitBinningDefinition, "Custom breaks")
								   .set(QuantileBinningDefinition, "Quantile")
								   .set(EqualIntervalBinningDefinition, "Equal interval")
								   .set(StandardDeviationBinningDefinition, "Standard deviations")
								   .set(NaturalJenksBinningDefinition, "Natural breaks")
								   .set(CategoryBinningDefinition, "All Categories(string values)");

   binLabelToBin = new Map<string, AbstractBinningDefinition>()
							   .set("Equally spaced", this._simple)
							   .set("Custom breaks", this._customSplit)
							   .set("Quantile", this._quantile)
							   .set("Equal interval", this._equalInterval)
							   .set("Standard deviations", this._stdDev)
							   .set("Natural breaks", this._jenks)
							   .set("All Categories(string values)", this._category)
							   .set("None", null);
	
	constructor(props:BinningDefinitionEditorProps)
	{
		super(props);
		this._binnedColumnWatcher.target = props.binnedColumn;
	}
	
	handleBinnedColumnChange()
	{
		var binDef = this.binnedColumn.binningDefinition.target;
		if(binDef)
		{
			for(var localDef of [this._simple, this._customSplit, this._quantile, this._equalInterval, this._stdDev, this._category, this._jenks])
			{
				if(this.isRadioSelected(localDef))
				{
					Weave.linkState(binDef, localDef);
				}
			}
		}
		this.forceUpdate();
	}

	private linkOverride(property:"overrideInputMin"|"overrideInputMax")
	{
		for(var def of [this._simple, this._customSplit, this._quantile, this._equalInterval, this._stdDev, this._category, this._jenks])
		{
			var abd:any = def;
			if(abd[property] && this.isRadioSelected(def))
			{
				return linkReactStateRef(this, {value: abd[property]}, 500);
			}
		}
	}
	
	private linkBinningDefinition(value:LinkableString|LinkableNumber)
	{
		return linkReactStateRef(this, {value}, 500);
	}
	
	private hasOverrideMinAndMax()
	{
		var binDef:AbstractBinningDefinition = this.binnedColumn.binningDefinition.target as AbstractBinningDefinition;
		return binDef && binDef.overrideInputMin && binDef.overrideInputMax;
	}

	setBinningDefinition(value:boolean, localDef:AbstractBinningDefinition)
	{
		// if we are clicking on the already selected binning definition
		// we keep it selected
		var binDef = this.binnedColumn.binningDefinition.target;
		
		if(!value && binDef && localDef && localDef.constructor == binDef.constructor)
		{
				this.forceUpdate(); // trigger a render because no session state change
				return;				// and we need to update the checkboxes to reflect correct value
		}

		else if(value && binDef && localDef && localDef.constructor != binDef.constructor)
		{
			this.binnedColumn.binningDefinition.requestLocalObjectCopy(localDef);
			binDef = this.binnedColumn.binningDefinition.target;
			Weave.linkState(binDef, localDef);
		}
		
		if(value && !localDef)
		{
			this.binnedColumn.binningDefinition.target = null;
		}
	}

	isRadioSelected(binDef:AbstractBinningDefinition):boolean
	{
		var binnedColumnBinDef = this.binnedColumn.binningDefinition.target
		if(binDef && binnedColumnBinDef)
			return binDef.constructor == binnedColumnBinDef.constructor;
		return false; // can only get here if the binDef is null
	}

	componentWillReceiveProps(nextProps:BinningDefinitionEditorProps)
	{
		this._binnedColumnWatcher.target = nextProps.binnedColumn;
	}
	
	renderCompactView()
	{
		var binDef = this.binnedColumn.binningDefinition.target as AbstractBinningDefinition;
		var binLabel:string = binDef ? BinningDefinitionEditor.binClassToBinLabel.get(binDef.constructor as typeof AbstractBinningDefinition) : "None";

		var options = Array.from(this.binLabelToBin.keys()) as string[];
		
		return (
			ReactUtils.generateTable(
				null,
				[
					[
						Weave.lang("Binning Method"),
						<HBox className="weave-padded-hbox" style={{padding: 0}}>
							<ComboBox style={{flex: 1}} 
									  options={options} 
									  value={binLabel}
									  onChange={(binLabel) => this.setBinningDefinition(true, this.binLabelToBin.get(binLabel))}/>
							<Button onClick={this.props.onButtonClick}>{Weave.lang("Edit")}</Button>
						</HBox>
					],
					[
						Weave.lang("Bin names"),
						<VBox style={{height: 150}}><BinNamesList showHeaderRow={false} binningDefinition={binDef}/></VBox>
					]
				],
				{
					table: {width: "100%"},
					td: [{whiteSpace: "nowrap", fontSize: "smaller"}, {padding: 5, width: "100%"}]
				}
			)
		);
	}

	renderFullView()
	{
		var textStyle:React.CSSProperties = {
			whiteSpace: "nowrap"
		};

		var HBoxJustify:React.CSSProperties = {
			justifyContent: "space-between",
			alignItems: "center",
			padding: 0,
			flex: 1
		};
		
		var leftItemsStyle:React.CSSProperties = {
			justifyContent: "flex-start",
			alignItems: "center"
		}

		var rightItemsStyle:React.CSSProperties = {
			justifyContent: "flex-end",
			alignItems: "center",
			fontSize: "smaller"
		};
		
		var iyle:React.CSSProperties = {
			fontSize: "initial"
		};
		
		var inputStyle:React.CSSProperties = {
			width: 60
		}

		return (
			<HBox className="weave-padded-hbox" style={{padding: 0}}>
				<VBox style={{width: 430, minWidth: 430, maxWidth: 430, overflow: "auto"}} className="weave-container"> {/*fixed height for binning option spacing*/}
					{Weave.lang("Binning type:")}
					<HBox style={{minHeight: 400, maxHeight: 400}}> {/*fixed height for binning option spacing*/}
						<VBox className="weave-padded-vbox" style={{flex: 1}}>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" 
											  value={this.isRadioSelected(this._simple)}
											  onChange={(value) => this.setBinningDefinition(value, this._simple)} 
											  /> 
									<span style={textStyle}>{Weave.lang("Equally spaced")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<StatefulTextField disabled={!this.isRadioSelected(this._simple)}
													   style={inputStyle}
													   type="number"
													   ref={this.linkBinningDefinition(this._simple.numberOfBins)}/>
								<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" 
											  value={this.isRadioSelected(this._customSplit)}
											  onChange={(value) => this.setBinningDefinition(value, this._customSplit)}/> 
									<span style={textStyle}>{Weave.lang("Custom breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<StatefulTextField type="text" 
													   ref={this.linkBinningDefinition(this._customSplit.splitValues)}
													   disabled={!this.isRadioSelected(this._customSplit)}
									                   fluid={false}
									/>
									<HelpIcon style={iyle}>
										{Weave.lang('Enter comma-separated custom break values for dividing the data into bins. Example: 0,50,100 will create two bins: [0,50] and [50,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isRadioSelected(this._quantile)}
											  onChange={(value) => this.setBinningDefinition(value, this._quantile)}/> 
									<span style={textStyle}>{Weave.lang("Quantile")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Reference quantile:")}</span>
									<StatefulTextField style={inputStyle} 
													   type="text"
													   disabled={!this.isRadioSelected(this._quantile)}
													   ref={linkReactStateRef(this, {value: this._quantile.refQuantile}, 500)}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If you specify 0.25, four bins will be created that each contain 25% of your data in sorted order')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isRadioSelected(this._equalInterval)}
											  onChange={(value) => this.setBinningDefinition(value, this._equalInterval)}
									 		  /> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<StatefulTextField style={inputStyle}
													   disabled={!this.isRadioSelected(this._equalInterval)}
													   type="text"
													   ref={this.linkBinningDefinition(this._equalInterval.dataInterval)}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify an interval of 25, four bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isRadioSelected(this._stdDev)}
											  onChange={(value) => this.setBinningDefinition(value, this._stdDev)}/> 
									<span style={textStyle}>{Weave.lang("Standard deviations")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iyle}>
										{Weave.lang('Six bins will be created for standard deviations above and below the mean value.')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isRadioSelected(this._jenks)}
											  onChange={(value) => this.setBinningDefinition(value, this._jenks)}/> 
									<span style={textStyle}>{Weave.lang("Natural breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<StatefulTextField style={inputStyle}
													   type="number"
													   disabled={!this.isRadioSelected(this._jenks)}
													   ref={this.linkBinningDefinition(this._jenks.numOfBins)}/>
									<HelpIcon style={iyle}>
										{Weave.lang('The Jenks optimization method, also called the Jenks natural breaks classification method, is a data classification method designed to determine the best arrangement of values into different classes. See http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isRadioSelected(this._category)}
											  onChange={(value) => this.setBinningDefinition(value, this._category)}/> 
									<span style={textStyle}>{Weave.lang("All Categories (string values)")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iyle}>
										{Weave.lang('One bin will be created for each unique string value in the column.')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={!this.binnedColumn.binningDefinition.target}
											  onChange={(value) => this.setBinningDefinition(value, null)}/> 
									<span style={textStyle}>{Weave.lang("None")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iyle}>
										{Weave.lang('The data will not be binned.')}
									</HelpIcon>
								</HBox>
							</HBox>
						</VBox>
					</HBox>
				</VBox>
				<VBox className="weave-container weave-padded-vbox" style={{flex: 1, minWidth: 350, padding: 8}}>
					{
						this.hasOverrideMinAndMax() ?
						<HBox className="weave-padded-hbox" style={{alignItems: "center", height: 50}}> {/* temporary hack */}
							<span style={{whiteSpace: "nowrap"}}> {Weave.lang("Override data range:")}</span>
							<div style={{flex: 1, height: "100%", position: "relative"}}>
								<div style={{position: "absolute", width: "100%", height: "100%"}}>
									<HBox style={{fontSize: "smaller", position: "relative", width: "100%", height: "100%"}}>
										<StatefulTextField type="number" style={{width: "50%"}} ref={this.linkOverride( "overrideInputMin")} placeholder="min"/>
										<StatefulTextField type="number" style={{width: "50%", marginLeft: 8}} ref={this.linkOverride("overrideInputMax")} placeholder="max"/>
									</HBox>
								</div>
							</div>
						</HBox> : null
					}
					<HBox style={{flex: 1}}>
						<BinNamesList binningDefinition={this.binnedColumn.binningDefinition.target as AbstractBinningDefinition}/>
					</HBox>
					{/*<HBox style={{alignItems: "center"}}>
						<Checkbox/>
						<span style={textStyle}>{Weave.lang("Edit and override names")}</span>
					</HBox>*/}
				</VBox>
			</HBox>
		)
	}
	
	render() {
		return this.props.compact ? this.renderCompactView() : this.renderFullView();
	}
}
