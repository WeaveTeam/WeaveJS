import * as React from "react";
import {IOpenFileProps, IOpenFileState} from "FileDialog";
import Dropzone from "../modules/Dropzone";
import {HBox, VBox} from "../react-ui/FlexBox";

export default class LocalFileOpenComponent extends React.Component<IOpenFileProps, IOpenFileState> {

	constructor(props:IOpenFileProps)
	{
		super(props);
		this.state = {
			rejected:false
		}
	}

	handleFileChange=(event:React.FormEvent)=>
	{
		let file = (event.target as HTMLInputElement).files[0] as File;
		if (file)
			this.props.openHandler(file, this.props.openFileHandler);
	};

	render():JSX.Element
	{
		return (
			<VBox className="weave-file-picker-container" style={{flex: 1, alignItems: "center", padding: 10}}>
				<VBox style={{flex: 1, alignItems: "center"}}>
					<Dropzone
						style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1, fontSize: 24}}
						className={this.state.rejected ? "weave-dropzone-file-error":"weave-dropzone-file"}
						activeStyle={{border: "8px solid #CCC"}}
						onDropAccepted={(files:File[]) => {
							files.map((file) => {
								this.props.openHandler(file,this.props.openFileHandler);
							});
						}}
						onDropRejected={(files:File[]) => {
							this.setState({
								rejected: true
							})
						}}
						accept=".weave"
						disableClick={false}
					>
						<span>{Weave.lang("Click to open a .weave file")}</span>
						<div className="ui horizontal divider" style={{width: "50%"}}>{Weave.lang("Or")}</div>
						<VBox style={{alignItems: "center"}}>
							<span>{Weave.lang("Drag it here")}</span>
							{this.state.rejected ? <span>{Weave.lang("The specified file could not be uploaded. Only files with the following extensions are allowed: weave")}</span>:""}
						</VBox>
					</Dropzone>
				</VBox>
			</VBox>
		);
	}
}