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
	static username:HTMLInputElement;
	static password:HTMLInputElement;
	static form:HTMLDivElement;

	static window:PopupWindow;

	constructor(props:ILoginProps)
	{
		super(props);
	}

	static close()
	{
		PopupWindow.close(Login.window);
		Login.window = null;
	}

	static open(context:React.ReactInstance, handleLogin:(fields:{username:string, password:string})=>void, handleCancel:()=>void)
	{
		if (Login.window)
			PopupWindow.close(Login.window);

		Login.window = PopupWindow.open(context, {
			title: Weave.lang("Weave Server Sign-In"),
			content:
				<Login onLogin={handleLogin} onCancel={handleCancel}/>,
			footerContent: <div/>,
			resizable: false,
			draggable: false,
			modal: true,
			suspendEnter: true,
			width: 400,
			onClose: Login.close
		});
	}
	
	static invalid()
	{
		let selector = $(Login.form) as any;
		selector.form('clear');
		selector.form('add errors', {
			username: Weave.lang("Incorrect username or password")
		});
		Login.username.focus()
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = $(Login.form) as any;
		selector.form({
			onSuccess: (event:any,fields:any) => {
				let user:string = Login.username.value;
				let password:string = Login.password.value;
				this.props.onLogin && this.props.onLogin({username: user, password});
			},
			fields: {
				username : {
					identifier: 'username',
					rules: [
						{
							type   : 'empty',
							prompt : Weave.lang("Please enter your username")
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
			e.preventDefault();
			return false;
		});
	}

	render():JSX.Element
	{
		return (
			<VBox style={{ flex: 1, padding: "1.5em" }}>
				<div className="ui header">
					<div className="sub header">{Weave.lang("Enter your credentials to access files on the Weave server")}</div>
				</div>
				<div ref={(c) => Login.form = c} className="ui form">
					<div className="field">
						<div className="ui fluid left icon input">
							<i className="user icon"/>
							<input ref={(c) => Login.username = c} type="text" name="username" placeholder={Weave.lang("User name")}/>
						</div>
					</div>
					<div className="field">
						<div className="ui fluid left icon input">
							<i className="lock icon"/>
							<input ref={(c) => Login.password = c} type="password" name="password" placeholder={Weave.lang("Password")}/>
						</div>
					</div>
					<Button colorClass="primary" className="right floated submit">
						{Weave.lang("Sign in")}
					</Button>
					<div className="ui error message" style={{marginTop: 60}}></div>
				</div>
			</VBox>
		)
	}
}



