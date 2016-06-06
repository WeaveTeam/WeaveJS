import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import {ComboBoxOption} from "../../semantic-ui/ComboBox";
import ComboBox from "../../semantic-ui/ComboBox";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";
import List from "../../react-ui/List";
import HelpIcon from "../../react-ui/HelpIcon";

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;
import WeavePromise = weavejs.util.WeavePromise;
import StandardLib = weavejs.util.StandardLib;

export interface IErrorLogComponentProps {
	errors?: string[];
	clearFunc: () => void;
}

export default class ErrorLogComponent extends React.Component<IErrorLogComponentProps, Object>
{
	constructor(props:IErrorLogComponentProps)
	{
		super(props);
	}

	render():JSX.Element {
		if (this.props.errors.length) {
			return <div className="ui warning message">
				<i className="close icon" onClick={this.props.clearFunc}></i>
				<div className="header">
					{Weave.lang("Server Error") }
				</div>
				<ul className="list">
					{this.props.errors.map((message, idx) => (<li key={idx}>{message}</li>)) }
				</ul>
			</div>;
		}
		else {
			return <div/>;
		}
	}
}