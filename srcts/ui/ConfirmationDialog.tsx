import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import Button from "../semantic-ui/Button";

export interface IConfirmationDialogProps extends React.Props<ConfirmationDialog>
{
	content:React.ReactChild;
	okButtonContent:React.ReactChild;
	cancelButtonContent:React.ReactChild;
	onOk?:Function;
	onCancel?:Function;
}

export interface IConfirmationDialogState
{

}

export default class ConfirmationDialog extends React.Component<IConfirmationDialogProps, IConfirmationDialogState> {

	static window:PopupWindow;

	constructor(props:IConfirmationDialogProps)
	{
		super(props);
	}

	static close()
	{
		ConfirmationDialog.window = null;
	}

	static open(context:React.ReactInstance, title:string, content:any, okButtonContent:any, onOk:Function, cancelButtonContent:any, onCancel:Function)
	{
		if (ConfirmationDialog.window)
			PopupWindow.close(ConfirmationDialog.window);

		ConfirmationDialog.window = PopupWindow.open(context, {
			title,
			content:
				<ConfirmationDialog content={content}
				                    okButtonContent={okButtonContent}
				                    cancelButtonContent={cancelButtonContent}/>,
			footerContent:
					<div className="ui buttons">
						{okButtonContent ? <Button className="primary approve" onClick={onOk as any}>
							{okButtonContent}
						</Button>:null}
						{cancelButtonContent ? <Button className="secondary deny" onClick={onCancel as any}>
							{cancelButtonContent}
						</Button>:null}
					</div>,
			resizable: true,
			modal: true,
			width: 920,
			height: 675,
			onClose: ConfirmationDialog.close,
			onOk: onOk,
			onCancel: onCancel
		});
	}

	componentDidMount()
	{

	}

	render():JSX.Element
	{
		return (
			<VBox style={{flex: 1}}>
				{this.props.content}
			</VBox>
		)
	}
}