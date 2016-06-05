import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";
import Button from "../../semantic-ui/Button";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export interface ILoginProps extends React.Props<Login>
{
	onLogin?:(fields:any) => void;
	onCancel?: () => void;
}

export interface ILoginState
{

}

export default class Login extends React.Component<ILoginProps, ILoginState> {

	element:Element;
	username:HTMLInputElement;
	password:HTMLInputElement;
	form:HTMLDivElement;

	constructor(props:ILoginProps)
	{
		super(props);
	}

	close()
	{
		($(this.element) as any).modal('hide');
	}

	open(context:Element, detachable:boolean = false)
	{
		let selector = $(this.form) as any;
		let loginSelector = ($(this.element) as any);
		loginSelector.modal({
				closable: false,
				onDeny    : () => {
					this.props.onCancel && this.props.onCancel();
					false;
				},
				onApprove : () => {
					selector.submit();
					return false;
				},
				detachable,
				transition: "fade",
				context,
			});
		if(context)
			loginSelector.modal({
				context
			});
		loginSelector.modal('show');
	}
	
	invalid()
	{
		let selector = $(this.form) as any;
		selector.form('clear');
		selector.form('add errors', {
			username: Weave.lang("Incorrect Login Credentials")
		});
		this.username.focus()
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = $(this.form) as any;
		selector.form({
			onSuccess: (event:any,fields:any) => {
				let user:string = this.username.value;
				let password:string = this.password.value;
				this.props.onLogin && this.props.onLogin({username: user, password});
			},
			fields: {
				username : {
					identifier: 'username',
					rules: [
						{
							type   : 'empty',
							prompt : Weave.lang("Please enter your User Name")
						}
					]
				},
				password : {
					identifier: 'password',
					rules: [
						{
							type   : 'empty',
							prompt : Weave.lang("Please enter your password")
						}
					]
				}
			}
		});
		selector.submit(function(e:any){
			//e.preventDefault(); usually use this, but below works best here.
			return false;
		});
	}

	render():JSX.Element
	{
		return (
			<div className="ui mini modal">
				<i className="close icon"/>
				<div className="dividing header">{Weave.lang("Weave Server Login")}</div>
				<div className="content">
					<div className="ui header">
						<div className="sub header">{Weave.lang("Enter your credentials to access files on the Weave Server")}</div>
					</div>
					<div ref={(c) => this.form = c} className="ui form">
						<div className="field">
							<div className="ui fluid left icon input">
								<i className="user icon"/>
								<input ref={(c) => this.username = c} type="text" name="username" placeholder={Weave.lang("User Name")}/>
							</div>
						</div>
						<div className="field">
							<div className="ui fluid left icon input">
								<i className="lock icon"/>
								<input ref={(c) => this.password = c} type="password" name="password" placeholder={Weave.lang("Password")}/>
							</div>
						</div>
						<Button colorClass="primary" className="right floated submit" style={{ marginBottom: 10}}>
							{Weave.lang("Login")}
						</Button>
						<div className="ui error message" style={{marginTop: 60}}></div>
					</div>
				</div>
			</div>
		)
	}
}



