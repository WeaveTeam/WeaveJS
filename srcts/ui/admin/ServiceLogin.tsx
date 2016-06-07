import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";
import Button from "../../semantic-ui/Button";
import Login from "./Login";

import WeaveAdminService = weavejs.net.WeaveAdminService;

export interface IServiceLoginProps extends React.Props<ServiceLogin> {
	onSuccess?: (username:string) => void;
	onCancel?: () => void;
	context?: React.ReactInstance;
	detachable?: boolean;
	service?: WeaveAdminService;
}


export default class ServiceLogin extends React.Component<IServiceLoginProps, Object> {

	defaultProps:IServiceLoginProps = {
		detachable: false
	};
	
	constructor(props:IServiceLoginProps)
	{
		super(props);
	}

	login: Login;

	open=():void => {
		Login.open(this.props.context,this.handleLogin,this.handleCancel);
	};

	handleLogin=(fields:{username:string, password:string}):void=>
	{
		this.props.service.authenticate(fields.username, fields.password).then(
			() => {
				if (this.props.onSuccess) this.props.onSuccess(fields.username);
				Login.close();
			},
			(error: any) => {
				Login.invalid();
			}
		);
	};

	handleCancel=():void=>
	{
		Login.close();
		if (this.props.onCancel) this.props.onCancel();
	};

	render():JSX.Element
	{
		return <div/>;
	}
}

