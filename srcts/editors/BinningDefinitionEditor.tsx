import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import {HSpacer, VSpacer} from "../react-ui/Spacer";
import StatefulTextField from "../ui/StatefulTextField";
import HelpIcon from "../react-ui/HelpIcon";
import Input from "../semantic-ui/Input";
import Checkbox from "../semantic-ui/Checkbox";

// stub
export default class BinningDefinitionEditor extends React.Component<any, any>
{

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
		
		var iconStyle:React.CSSProperties = {
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
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Equally spaced")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<Input style={inputStyle} type="number"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Custom breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<Input type="text"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Quantile")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Reference quantile:")}</span>
									<Input style={inputStyle} type="text"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<Input style={inputStyle} type="text"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<Input style={inputStyle} type="text"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Standard deviations")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio"className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("Natural breaks")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									
									<Input style={inputStyle} type="number"/>
									<HelpIcon style={iconStyle}>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox className="weave-padded-hbox" style={HBoxJustify}>
								<HBox style={leftItemsStyle}>
									<Checkbox type="radio" className="toggle slider"/> 
									<span style={textStyle}>{Weave.lang("None")}</span>
								</HBox>
								<HBox style={rightItemsStyle} className="weave-padded-hbox">
									<HelpIcon style={iconStyle}>
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
									<StatefulTextField style={{width: "50%"}} placeholder="min"/>
									<StatefulTextField style={{width: "50%", marginLeft: 8}} placeholder="max"/>
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
