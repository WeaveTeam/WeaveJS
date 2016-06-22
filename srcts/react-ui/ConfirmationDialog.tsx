import * as React from "react";
import PopupWindow from "./PopupWindow";
import {VBox, HBox} from "./FlexBox";

export default class ConfirmationDialog
{

	static open(context:React.ReactInstance, message:string, onOk?:()=>void, onCancel?:()=>void)
	{
		PopupWindow.open({
			context,
			title: Weave.lang("Load Session"),
			content: (
				<VBox style={{ flex: 1, justifyContent: "center" }}>
					<HBox style={{ flex: 1, alignItems: "center" }}>
						<i style={{ fontSize: 50, marginLeft: 15 }} className="fa fa-exclamation-triangle weave-exclamation-triangle"></i>
						<div style={{ margin: 0, marginLeft: 5 }} className="ui basic segment">
							<div className="ui basic header">
								{message}
							</div>
						</div>
					</HBox>
				</VBox>
			),
			resizable: false,
			modal: true,
			width: 480,
			height: 230,
			onOk: onOk,
			onCancel: onCancel
		});
	}
}
