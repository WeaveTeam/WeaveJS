import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "../../react-ui/FlexBox";
import PopupWindow from "../../react-ui/PopupWindow";
import Button from "../../semantic-ui/Button";
import Login from "./Login";

import WeaveAdminService = weavejs.net.WeaveAdminService;

export default class ServiceLogin
{
	service: WeaveAdminService;
	context: React.ReactInstance;
	login:Login;

	constructor(context: React.ReactInstance, service: WeaveAdminService)
	{
		this.context = context;
		this.service = service;
	}

	open=(onSuccess?: (username: string) => void, onCancel?: () => void)=>
	{
		this.generateOpener(onSuccess, onCancel)();
	}

	generateOpener(onSuccess?: (username: string) => void, onCancel?: () => void)
	{
		return PopupWindow.generateOpener(() => ({
			context: this.context,
			title: Weave.lang("Weave Server Sign-In"),
			content: <Login ref={(c:Login) => this.login = c} onLogin={(fields: { username: string, password: string })=>this.handleLogin(fields, onSuccess)}/>,
			footerContent: <div/>,
			resizable: false,
			draggable: false,
			modal: true,
			suspendEnter: true,
			width: 400
		}));
	}

	handleLogin = (fields: { username: string, password: string }, onSuccess: (username: string) => void): void => {
		this.service.authenticate(fields.username, fields.password).then(
			() => {
				PopupWindow.close(this.login);
				if (onSuccess) onSuccess(fields.username);
			},
			(error: any) => {
				this.login.invalid();
			}
		);
	};

	/* Only open if needed */
	conditionalOpen(onSuccess?: (username:string)=>void, onCancel?:()=>void)
	{
		this.service.getAuthenticatedUser().then(
			(username: string) => {
				if (username) {
					onSuccess && onSuccess(username);
				}
				else {
					this.generateOpener(onSuccess, onCancel);
				}
			}
		);
	}
}

