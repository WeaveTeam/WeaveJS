import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import {HSpacer, VSpacer} from "../react-ui/Spacer";
import StatefulTextField from "../ui/StatefulTextField";
import HelpIcon from "../react-ui/HelpIcon";
import Input from "../semantic-ui/Input";
import Checkbox from "../semantic-ui/Checkbox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkableWatcher = weavejs.core.LinkableWatcher;
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
}

export interface BinningDefinitionEditorState
{
	
}
// stub
export default class BinningDefinitionEditor extends React.Component<any, any>
{
	
	public setTarget(object:ILinkableObject):void
	{
		this._binnedColumnWatcher.target = object as BinnedColumn;
	}
	public  hasPendingChanges():boolean { return false; }
	public  applyChanges():void { }

	private  _binnedColumnWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(BinnedColumn, null, this.forceUpdate.bind(this)));

	private  get binnedColumn():BinnedColumn { return this._binnedColumnWatcher.target as BinnedColumn; }

	private  gridSource:any[] = [];
	public  _simple:SimpleBinningDefinition = Weave.disposableChild(this, SimpleBinningDefinition);
	private  _customSplit:CustomSplitBinningDefinition = Weave.disposableChild(this, CustomSplitBinningDefinition);
	private  _quantile:QuantileBinningDefinition = Weave.disposableChild(this, QuantileBinningDefinition);
	private  _equalInterval:EqualIntervalBinningDefinition = Weave.disposableChild(this, EqualIntervalBinningDefinition);
	private  _stdDev:StandardDeviationBinningDefinition = Weave.disposableChild(this, StandardDeviationBinningDefinition);
	private  _category:CategoryBinningDefinition = Weave.disposableChild(this, CategoryBinningDefinition);
	private  _jenks:NaturalJenksBinningDefinition = Weave.disposableChild(this, NaturalJenksBinningDefinition);

	constructor(props:BinningDefinitionEditorProps)
	{
		super(props);
		this._binnedColumnWatcher.target = props.binnedColumn;
	}

	private linkOverrideMin(ref:StatefulTextField)
	{
		for(var def of [this._simple, this._customSplit, this._quantile, this._equalInterval, this._stdDev, this._category, this._jenks])
		{
			var abd:AbstractBinningDefinition = def;
			if(abd && abd.overrideInputMin)
			{
				linkReactStateRef(ref, {value: abd.overrideInputMin})
			}
		}
	}
	
	/* can be merged into single function with second argument */
	private linkOverrideMax(ref:StatefulTextField)
	{
		for(var def of [this._simple, this._customSplit, this._quantile, this._equalInterval, this._stdDev, this._category, this._jenks])
		{
			var abd:AbstractBinningDefinition = def;
			if(abd && abd.overrideInputMin)
			{
				linkReactStateRef(ref, {value: abd.overrideInputMax})
			}
		}
	}
	
	handleRadioChange(value:boolean, binDef:AbstractBinningDefinition)
	{
		if(value && binDef)
		{
			console.log(binDef, this.binnedColumn);
			//this.binnedColumn.binningDefinition.requestLocalObjectCopy(binDef);
		}
	}

	isBinSelected(def:AbstractBinningDefinition):boolean
	{
		console.log(def, this.binnedColumn.binningDefinition);
		return true;
	}

	componentWillReceiveProps(nextProps:BinningDefinitionEditorProps)
	{
		this._binnedColumnWatcher.target = nextProps.binnedColumn;
	}

	render()
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
											  value={this.isBinSelected(this._customSplit)}
											  onChange={(value) => this.handleRadioChange(value, this._equalInterval)} 
											  className="toggle"/> 
									<span style={textStyle}>{Weave.lang("Equally spaced")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<StatefulTextField disabled={this.isBinSelected(this._equalInterval)}
													   style={inputStyle}
													   type="number"
													   ref={linkReactStateRef(this, {value: this._simple.numberOfBins})}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" 
											  className="toggle"
											  value={this.isBinSelected(this._customSplit)}
											  onChange={(value) => this.handleRadioChange(value, this._equalInterval)}/> 
									<span style={textStyle}>{Weave.lang("Custom breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<StatefulTextField type="text" 
													   ref={linkReactStateRef(this, {value: this._customSplit.splitValues})}
													   disabled={this.isBinSelected(this._customSplit)}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
									 		  className="toggle"
											  value={this.isBinSelected(this._quantile)}
											  onChange={(value) => this.handleRadioChange(value, this._equalInterval)}/> 
									<span style={textStyle}>{Weave.lang("Quantile")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Reference quantile:")}</span>
									<StatefulTextField style={inputStyle} 
													   type="text"
													   disabled={this.isBinSelected(this._quantile)}
													   ref={linkReactStateRef(this, {value: this._quantile.refQuantile})}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  value={this.isBinSelected(this._equalInterval)}
											  onChange={(value) => this.handleRadioChange(value, this._equalInterval)}
									 		  className="toggle"/> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<StatefulTextField style={inputStyle}
													   disabled={this.isBinSelected(this._equalInterval)}
													   type="text"
													   ref={linkReactStateRef(this, {value: this._equalInterval.dataInterval})}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  className="toggle"
											  value={this.isBinSelected(this._stdDev)}
											  onChange={(value) => this.handleRadioChange(value, this._stdDev)}/> 
									<span style={textStyle}>{Weave.lang("Standard deviations")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"
											  className="toggle"
											  value={this.isBinSelected(this._jenks)}
											  onChange={(value) => this.handleRadioChange(value, this._jenks)}/> 
									<span style={textStyle}>{Weave.lang("Natural breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<StatefulTextField style={inputStyle}
													   type="number"
													   disabled={this.isBinSelected(this._jenks)}
													   ref={linkReactStateRef(this, {value: this._jenks.numOfBins})}/>
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle"/> 
									<span style={textStyle}>{Weave.lang("None")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
						</VBox>
					</HBox>
				</VBox>
				<VBox className="weave-container" style={{flex: 1, minWidth: 350}}>
					<HBox className="weave-padded-hbox" style={{alignItems: "center", height: 50}}> {/* temporary hack */}
						<span style={{whiteSpace: "nowrap"}}> {Weave.lang("Override data range:")}</span>
						<div style={{flex: 1, height: "100%", position: "relative"}}>
							<div style={{position: "absolute", width: "100%", height: "100%"}}>
								<HBox style={{fontSize: "smaller", position: "relative", width: "100%", height: "100%"}}>
									<StatefulTextField style={{width: "50%"}} ref={() => this.linkOverrideMin} placeholder="min"/>
									<StatefulTextField style={{width: "50%", marginLeft: 8}} ref={() => this.linkOverrideMax} placeholder="max"/>
								</HBox>
							</div>
						</div>
					</HBox>
					<HBox style={{flex: 1}}>
					</HBox>
				</VBox>
			</HBox>
		)
	}
}
