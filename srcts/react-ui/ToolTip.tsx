import * as React from "react";
import {HBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import * as _ from "lodash";

export default class ToolTip {
	
	static popup:React.ReactInstance;

	static open(content:React.ReactNode, event:React.MouseEvent, toolTipProps?:React.HTMLProps<HBox>)
	{
		var style:React.CSSProperties = _.merge({}, toolTipProps && toolTipProps.style, {
			position: "absolute",
			top: event.pageY + 10,
			left: event.pageX + 10,
		});
		
		ToolTip.popup = ReactUtils.openPopup(
			<HBox {...toolTipProps} style={style} className={"weave-tooltip " + (toolTipProps && toolTipProps.className)}>
				{content}
			</HBox>
		);
		
	}
	
	static close()
	{
		ReactUtils.closePopup(ToolTip.popup);
	}
}
