import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import Button from "../semantic-ui/Button";

export interface IConfirmationDialogProps extends React.Props<ConfirmationDialog>
{
	title:string;
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

	static open(title:string, content:React.ReactChild, okButtonContent:React.ReactChild, onOk:Function, cancelButtonContent:React.ReactChild, onCancel:Function)
	{
		ConfirmationDialog.window = PopupWindow.open({
			content: <ConfirmationDialog title={title}
			                             content={content}
			                             onOk={onOk}
			                             onCancel={onCancel}
			                             okButtonContent={okButtonContent}
			                             cancelButtonContent={cancelButtonContent}
			/>,
			resizable: false,
			draggable: false,
			width: 600,
			modal: true,
			footerContent: <div/>,
			onClose: ConfirmationDialog.close
		});
	}

	componentDidMount()
	{

	}

	render():JSX.Element
	{
		return (
			<VBox className="weave-padded-vbox" style={{flex: 1, justifyContent: "space-between"}}>
				<div className="ui basic segment" style={{padding: 0, marginBottom: 0}}>
					<Button className="mini circular right floated basic icon"
					        onClick={(e) => {
						        this.props.onCancel && this.props.onCancel();
						        PopupWindow.close(ConfirmationDialog.window);
							}}
					>
						<i className="ui remove icon"/>
					</Button>
					<div className="ui medium dividing header">
						{Weave.lang(this.props.title)}
					</div>
				</div>
				{this.props.content}
				<div className="ui buttons">
					{this.props.okButtonContent ? <Button className="positive approve"
					        onClick={(e) => {
					        this.props.onOk && this.props.onOk();
					        PopupWindow.close(ConfirmationDialog.window);
						}}
					>
						{this.props.okButtonContent}
					</Button>:null}
					{this.props.cancelButtonContent ? <Button className="negative deny"
					        onClick={(e) => {
					        this.props.onCancel && this.props.onCancel();
					        PopupWindow.close(ConfirmationDialog.window);
						}}
					>
						{this.props.cancelButtonContent}
					</Button>:null}
				</div>
			</VBox>
		)
	}
}



