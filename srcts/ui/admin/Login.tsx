import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";
import Button from "../../semantic-ui/Button";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export interface ILoginProps extends React.Props<Login>
{
	onLogin?:(fields:any) => void;
}

export interface ILoginState
{

}

export default class Login extends React.Component<ILoginProps, ILoginState> {

	static element:Element;

	constructor(props:ILoginProps)
	{
		super(props);
	}

	static close()
	{
		($(Login.element) as any).modal('hide');
	}

	static open(context:Element, onLogin:Function, onCancel:Function)
	{
		($(Login.element) as any)
			.modal({
				closable: false,
				onDeny    : () => {
					onCancel && onCancel();
				},
				onApprove : () => {
					let selector = $(Login.element).find(".ui.form") as any;
					selector.submit();
					return false;
				},
				transition: "fade"
			});
		if (context)
			($(Login.element) as any)
				.modal({
					detachable: false,
					context: $(context)
				});
		($(Login.element) as any).modal('show');
	}

	componentDidMount()
	{
		Login.element = ReactDOM.findDOMNode(this);
		let selector = $(Login.element).find(".ui.form") as any;
		selector.form({
			onSuccess: (event:any,fields:any) => {
				let user = ($(Login.element).find("input[type='text'][name='username']") as any).val();
				let password = ($(Login.element).find("input[type='password'][name='password']") as any).val();
				this.props.onLogin && this.props.onLogin({username: user, password});
			},
			fields: {
				username : 'empty',
				password : 'empty'
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
					<div className="ui form">
						<div className="field">
							<div className="ui fluid left icon input">
								<i className="user icon"/>
								<input type="text" name="username" placeholder={Weave.lang("User Name")}/>
							</div>
						</div>
						<div className="field">
							<div className="ui fluid left icon input">
								<i className="lock icon"/>
								<input type="password" name="password" placeholder={Weave.lang("Password")}/>
							</div>
						</div>
					</div>
				</div>
				<div className="actions">
					<button className="ui primary approve button">
						{Weave.lang("Login")}
					</button>
				</div>
			</div>
		)
	}
}



