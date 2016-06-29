import * as React from "react";
import * as ReactDOM from "react-dom";
import {IOpenFileProps, IOpenFileState} from "FileDialog";
import SmartComponent from "./SmartComponent";
import ServiceLogin from "../ui/admin/ServiceLogin";
import {HBox, VBox, Label} from "../react-ui/FlexBox";
import FixedDataTable from "../tools/FixedDataTable";
import {ObjectFixedDataTable, IRow} from "../tools/FixedDataTable";
import FileInfoView from "./FileInfoView";
import Button from "../semantic-ui/Button";
import CenteredIcon from "../react-ui/CenteredIcon";
import {ListOption} from "../react-ui/List";
import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export default class WeaveServerFileOpenComponent extends SmartComponent<IOpenFileProps, IOpenFileState>
{
	element:Element;
	dimmerSelector:any;
	login:ServiceLogin;
	
	constructor(props:IOpenFileProps)
	{
		super(props);
		this.state = {
			fileInfo:null,
			fileNames:[],
			allFiles:true
		}
		this.login = new ServiceLogin(this.props.context, weavejs.net.Admin.service);
	}

	handleSuccess=(fields:any) =>
	{
		this.getWeaveFiles();
	};

	getWeaveFiles=() => {
		weavejs.net.Admin.service.getWeaveFileNames(this.state.allFiles).then( (fileNames:string[]) => {
			this.setState({
				fileNames
			});
		},(error:any) => {
			this.setState({
				fileNames: [],
				fileInfo: null
			});
			this.openLogin();
		});
	};

	openLogin=()=>
	{
		if (this.element)
		this.login.open(this.handleSuccess, this.handleCancel);
	};

	handleCancel=() =>
	{
		this.setState({
			fileNames: [],
			fileInfo: null
		});
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		this.getWeaveFiles();
	}

	componentDidUpdate()
	{
	}
	
	componentWillUnmount()
	{
		this.element = null;
	}

	render():JSX.Element
	{
		this.dimmerSelector = this.element;

		let fileList:ListOption[] = this.state.fileNames.map((file:any) => {
			return {
				label: <Label style={{flex: 1}}>{file}</Label>,
				value: file
			};
		});

		let rows:IRow[] = fileList.map((file:ListOption) => {
			return {
				filename: file.value,
				filelabel: (
					<HBox className="weave-padded-hbox" style={{alignItems: 'center'}}>
						<CenteredIcon iconProps={{className: "fa fa-file-text-o fa-fw"}}/>
						<Label style={{flex: 1}}>{file.value}</Label>
					</HBox>
				)
			} as IRow
		});
		let columnIds = ["filelabel"];
		let columnTitles: {[columnId: string]: string|JSX.Element} = {};

		let fileLocationForm:JSX.Element = (
			<div className="ui form" style={{paddingLeft: "1rem"}}>
				<div className="inline fields">
					<div className="ui grid" style={{flex: 1}}>
						<div className="two column row">
							<div className="right floated column">
								<div className="field">
									<div className="ui radio checkbox">
										<input type="radio" checked={!this.state.allFiles} onChange={(e:any) => {
										this.setState({
											allFiles: false
										});
									}}/>
										<Label>{Weave.lang("My files")}</Label>
									</div>
								</div>
							</div>
							<div className="column">
								<div className="field">
									<div className="ui radio checkbox">
										<input type="radio" checked={this.state.allFiles} onChange={(e:any) => {
										this.setState({
											allFiles: true
										});
									}}/>
										<Label>{Weave.lang("All files")}</Label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);

		return (
			<VBox className="weave-file-picker-container" style={{flex: 1, padding: 10}}>
				<HBox className="weave-server-file-view" style={{flex: 1}}>
					<VBox style={{flex: 1}}>
						{fileLocationForm}
						<VBox style={{flex: 1, border: "1px solid #D6D6D6"}}>
							<ObjectFixedDataTable rows={rows}
							                columnIds={columnIds}
							                idProperty="filename"
							                columnTitles={columnTitles}
											onCellDoubleClick={(fileName) => {this.props.openHandler("/" + fileName)}}
							                multiple={false}
							                disableSort={true}
							                headerHeight={0}
							                rowHeight={40}
							                onSelection={(selectedFiles:string[]) => {
							                    if (selectedFiles[0])
													weavejs.net.Admin.service.getWeaveFileInfo(selectedFiles[0]).then(
														(fileInfo:WeaveFileInfo) => {
															if (this.element)
																this.setState({
																	fileInfo
																});
														},
														this.openLogin
													);
							                }}
							/>
						</VBox>
					</VBox>
					<VBox style={ {flex: 1, paddingLeft: 20} }>
						<span style={{alignSelf: "flex-end"}}>{weavejs.net.Admin.instance.userHasAuthenticated ? Weave.lang("Signed in as {0}", weavejs.net.Admin.instance.activeConnectionName) : Weave.lang("Not signed in")}</span>
						<Button
							colorClass="primary"
							onClick={() => {
								if (weavejs.net.Admin.instance.userHasAuthenticated)
								{
									weavejs.net.Admin.service.authenticate("","").then(() => {
										this.setState({
											fileNames: [],
											fileInfo: null
										});
									},
									() => {
										this.setState({
											fileNames: [],
											fileInfo: null
										});
									});
								} else {
									this.openLogin();
								}
							}}
						    style={{alignSelf: "flex-end"}}
						>
							{weavejs.net.Admin.instance.userHasAuthenticated ? Weave.lang("Sign Out") : Weave.lang("Sign in")}
						</Button>
						<FileInfoView fileInfo={this.state.fileInfo}>
							{this.state.fileInfo ?
								<Button
									onClick={() => {
					                    this.props.openHandler("/" + this.state.fileInfo.fileName);
									}}
									style={{marginLeft: 8}}
								>
									{Weave.lang("Load Session")}
								</Button>:null}
						</FileInfoView>
					</VBox>
				</HBox>
			</VBox>
		);
	}
}