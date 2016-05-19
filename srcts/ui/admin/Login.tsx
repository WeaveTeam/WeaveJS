import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";
import Button from "../../semantic-ui/Button";

import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export interface ILoginProps extends React.Props<Login>
{
	onLogin?:(event:any,fields:any) => void;
	onFailure?:(formErrors:any,fields:any) => void;
	onCancel?:() => void;
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

	static open(context:any)
	{
		($(Login.element) as any)
			.modal({
				closable: false,
				detachable: false,
				context,
				transition: "fade"
			})
			.modal('show');
	}

	componentDidMount()
	{
		Login.element = ReactDOM.findDOMNode(this);
		let selector = ($(Login.element) as any);
		selector.form({
			onSuccess: (event:any,fields:any) => {
				this.props.onLogin && this.props.onLogin(event,fields);
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
			<div className="ui basic small modal">
				<form className="ui large form">
					<div className="ui stacked segment" style={{paddingTop: 0}}>
						<div className="ui compact right floated segment" style={{border: "none", background: "transparent", boxShadow: "none"}}>
							<Button className="mini circular basic icon cancel"
							     onClick={(e) => {
							         console.log(e);
							        this.props.onCancel && this.props.onCancel();
								}}
							>
								<i className="ui remove icon"/>
							</Button>
						</div>
						<div className="ui medium dividing header">{Weave.lang("Weave Server Login")}</div>
						<div className="field">
							<div className="ui left icon input">
								<i className="user icon"/>
								<input type="text" name="username" placeholder="User Name"/>
							</div>
						</div>
						<div className="field">
							<div className="ui left icon input">
								<i className="lock icon"/>
								<input type="password" name="password" placeholder="Password"/>
							</div>
						</div>
						<div className="ui fluid large primary submit button">Login</div>
					</div>
				</form>
			</div>
		)
	}
}



