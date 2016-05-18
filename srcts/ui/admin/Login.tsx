import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export interface ILoginProps extends React.Props<Login>
{
	onSuccess?:(event:any,fields:any) => void;
	onFailure?:(formErrors:any,fields:any) => void;
}

export interface ILoginState
{

}

export default class Login extends React.Component<ILoginProps, ILoginState> {

	element:Element;
	static window:PopupWindow;
	constructor(props:ILoginProps)
	{
		super(props);
	}

	static close(window:PopupWindow)
	{
		Login.window = null;
	}

	static open(onSuccess:(event:any,fields:any) => void, onFailure:(formErrors:any,fields:any) => void)
	{
		if (Login.window)
			PopupWindow.close(Login.window);

		Login.window = PopupWindow.open({
			title: Weave.lang("Weave Server Login"),
			content: <Login onSuccess={onSuccess} onFailure={onFailure}/>,
			resizable: true,
			width: 400,
			height: 400,
			onClose: Login.close
		});
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		selector.form({
			onSuccess: (event:any,fields:any) => {
				this.props.onSuccess && this.props.onSuccess(event,fields);
			},
			onFailure: (formErrors:any,fields:any) => {
				this.props.onFailure && this.props.onFailure(formErrors,fields);
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
			<form className="ui large form">
				<div className="ui stacked segment">
					<div className="field">
						<div className="ui left icon input">
							<i className="user icon"></i>
							<input type="text" name="username" placeholder="User Name"/>
						</div>
					</div>
					<div className="field">
						<div className="ui left icon input">
							<i className="lock icon"></i>
							<input type="password" name="password" placeholder="Password"/>
						</div>
					</div>
					<div className="ui fluid large submit button">Login</div>
				</div>
				<div className="ui error message"></div>
			</form>
		)
	}
}



