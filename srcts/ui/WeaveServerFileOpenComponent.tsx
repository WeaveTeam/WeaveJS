import * as React from "react";
import * as ReactDOM from "react-dom";
import {IOpenFileProps, IOpenFileState} from "FileDialog";
import SmartComponent from "./SmartComponent";
import ServiceLogin from "../ui/admin/ServiceLogin";
import {HBox, VBox} from "../react-ui/FlexBox";
import FixedDataTable from "../tools/FixedDataTable";
import {IRow, IColumnTitles} from "../tools/FixedDataTable";
import FileInfoView from "./FileInfoView";
import Button from "../semantic-ui/Button";
import CenteredIcon from "../react-ui/CenteredIcon";
import {ListOption} from "../react-ui/List";
import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

export default class WeaveServerFileOpenComponent extends SmartComponent<IOpenFileProps, IOpenFileState> {

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

	handleSuccess=(fields:any) => {
		this.getWeaveFiles();
	};

	getWeaveFiles=() => {
		weavejs.net.Admin.service.getWeaveFileNames(this.state.allFiles).then( (fileNames:string[]) => {
			this.setState({
				fileNames
			});
		},(error:any) => {
			this.login.open(this.handleSuccess, this.handleCancel);
		});
	};

	handleCancel=() => {
		this.setState({
			fileNames: []
		});
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		this.forceUpdate();
	}

	componentDidUpdate()
	{
		this.getWeaveFiles();
	}

	render():JSX.Element
	{
		this.dimmerSelector = this.element;

		let fileList:ListOption[] = this.state.fileNames.map((file:any) => {
			return {
				label: (
					<HBox style={{justifyContent: "space-between", alignItems:"center"}}>
						<span style={{overflow: "hidden"}}>{file}</span>
					</HBox>
				),
				value: file
			};
		});

		let rows:IRow[] = fileList.map((file:ListOption) => {
			return {
				filename: file.value,
				filelabel: (
					<HBox className="weave-padded-hbox" >
						<CenteredIcon iconProps={{className: "fa fa-file-text-o fa-fw"}}/>
						{file.value}
					</HBox>
				)
			} as IRow
		});
		let columnIds = ["filename","filelabel"];
		let columnTitles:IColumnTitles = {};

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
										<label>{Weave.lang("My files")}</label>
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
										<label>{Weave.lang("All files")}</label>
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
							<FixedDataTable rows={rows}
							                columnIds={columnIds}
							                idProperty="filename"
							                showIdColumn={false}
							                columnTitles={columnTitles}
											onCellDoubleClick={(fileName) => {this.props.openHandler("/" + fileName, this.props.openUrlHandler)}}
							                multiple={false}
							                disableSort={true}
							                headerHeight={0}
							                rowHeight={40}
							                onSelection={(selectedFiles:string[]) => {
						                    if(selectedFiles[0])
												weavejs.net.Admin.service.getWeaveFileInfo(selectedFiles[0]).then(
													(fileInfo:WeaveFileInfo) => {
														this.setState({
															fileInfo
														});
													},
													(error:any) => {
														this.login.open(this.handleSuccess, this.handleCancel);
													}
												);
						                }}
							/>
						</VBox>
					</VBox>
					<VBox style={ {flex: 1, paddingLeft: 20} }>
						<FileInfoView fileInfo={this.state.fileInfo}>
							{this.state.fileInfo ?
								<Button
									onClick={() => {
					                    this.props.openHandler("/" + this.state.fileInfo.fileName,this.props.openUrlHandler);
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