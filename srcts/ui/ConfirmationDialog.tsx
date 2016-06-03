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
	static element:Element;

	constructor(props:IConfirmationDialogProps)
	{
		super(props);
	}

	static close()
	{
		($(ConfirmationDialog.element) as any).modal('hide');
	}

	static open(onOk:Function, onCancel:Function, context:any)
	{
		($(ConfirmationDialog.element) as any)
			.modal({
				detachable: false,
				transition: "fade",
				context,
				onApprove: onOk,
				onDeny: onCancel
			})
			.modal('show');
	}

	componentDidMount()
	{
		ConfirmationDialog.element = ReactDOM.findDOMNode(this);
	}

	render():JSX.Element
	{
		return (
			<div className="ui modal">
				<i className="close icon"/>
				<div className="header">
					{Weave.lang(this.props.title)}
				</div>
				<div className="content">
					{this.props.content}
				</div>
				<div className="actions">
					<div className="ui buttons">
						{this.props.okButtonContent ? <Button className="primary approve">
							{this.props.okButtonContent}
						</Button>:null}
						{this.props.cancelButtonContent ? <Button className="secondary deny">
							{this.props.cancelButtonContent}
						</Button>:null}
					</div>
				</div>
			</div>
		)
	}
}