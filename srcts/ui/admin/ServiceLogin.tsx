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

	constructor(context: React.ReactInstance, service: WeaveAdminService)
	{
		this.context = context;
		this.service = service;
	}

	open(onSuccess?: (username: string) => void, onCancel?: () => void)
	{
		Login.open(this.context,
			(fields: { username: string, password: string }): void => {
				this.service.authenticate(fields.username, fields.password).then(
					() => {
						Login.close();
						if (onSuccess) onSuccess(fields.username);
					},
					(error: any) => {
						Login.invalid();
					}
				);
			},
			() => {
				Login.close();
				if (onCancel) onCancel();
			}
		);
	}

	/* Only open if needed */
	conditionalOpen(onSuccess?: (username:string)=>void, onCancel?:()=>void)
	{
		this.service.getAuthenticatedUser().then(
			(username: string) => {
				if (username) {
					onSuccess && onSuccess(username);
				}
				else {
					this.open(onSuccess, onCancel);
				}
			}
		);
	}
}

