import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import {HSpacer, VSpacer} from "../react-ui/Spacer";
import StatefulTextField from "../ui/StatefulTextField";
import HelpIcon from "../react-ui/HelpIcon";

// stub
export default class BinningDefinitionEditor extends React.Component<any, any>
{

	render()
	{
		var radioStyle:React.CSSProperties = {
			marginLeft: 5,
			marginRight: 5
		};
		
		var textStyle:React.CSSProperties = {
			whiteSpace: "nowrap"
		};

		var HBoxJustify:React.CSSProperties = {
			justifyContent: "space-between"
		};

		return (
			<HBox style={{flex: 1}}>
				<VBox style={{flex: 2}}>
					{Weave.lang("Binning type:")}
					<HBox>
						<VSpacer/>
						<VBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Equally spaced")}</span>
								</HBox>
								<HBox>
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<VSpacer/>
									<input type="number"/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Custom breaks")}</span>
								</HBox>
								<HBox>
									<input type="text"/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Quantile")}</span>
								</HBox>
								<HBox>
									<span style={textStyle}>{Weave.lang("Reference quantile:")}</span>
									<VSpacer/>
									<input type="text"/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox>
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<VSpacer/>
									<input type="text" style={radioStyle}/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Equally interval")}</span>
								</HBox>
								<HBox>
									<span style={textStyle}>{Weave.lang("Data interval:")}</span>
									<VSpacer/>
									<input type="text" style={radioStyle}/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Standard deviations")}</span>
								</HBox>
								<HBox>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("Natural breaks")}</span>
								</HBox>
								<HBox>
									<span style={textStyle}>{Weave.lang("Number of bins:")}</span>
									<VSpacer/>
									<input type="number" style={radioStyle}/>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
							<HBox style={HBoxJustify}>
								<HBox>
									<input type="radio" style={radioStyle}/> 
									<span style={textStyle}>{Weave.lang("None")}</span>
								</HBox>
								<HBox>
									<HelpIcon>
										{Weave.lang('Example: If your data is between 0 and 100 and you specify 4 bins, the following bins will be created: [0,25] [25,50] [50,75] [75,100]')}
									</HelpIcon>
								</HBox>
							</HBox>
						</VBox>
					</HBox>
				</VBox>
				<VBox style={{flex: 1}}>
					<HBox>
						<span style={{whiteSpace: "nowrap"}}> {Weave.lang("Override data range:")}</span>
						<VSpacer/>
						<StatefulTextField/>
						<VSpacer/>
						<StatefulTextField/>
					</HBox>
				</VBox>
			</HBox>
		)
	}
}
