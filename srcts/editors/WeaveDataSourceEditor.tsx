import * as React from "react";
import * as lodash from "lodash";
import ui from "../react-ui/ui";
import LinkableTextField from "../ui/LinkableTextField";

import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;

export default class WeaveDataSourceEditor extends React.Component<IDataSourceEditorProps,IDataSourceEditorState>
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		let dataSource: WeaveDataSource;
		if (this.state && this.state.dataSource)
		{
			Weave.getCallbacks(this.state.dataSource).addGroupedCallback(this, this.forceUpdate, false);
			dataSource = this.state.dataSource as WeaveDataSource;
		}
		let margins: React.CSSProperties = { marginLeft: "0.5em", marginRight: "0.5em" };

		return <ui.VBox style={{ width: "100%", height: "100%" }}>
					<label>{Weave.lang("Source display name") }
						<LinkableTextField style={margins} target={null}/>
					</label>
					<label>{Weave.lang("Service URL")}
						<LinkableTextField style={margins} placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL} target={dataSource && dataSource.url}/>
					</label>
					<label>{Weave.lang("Root hierarchy ID")}
						<LinkableTextField style={margins} placeholder={Weave.lang("Hierarchy ID")} target={dataSource && dataSource.rootId}/>
						<button type="button">{Weave.lang("Choose")}</button>
						<button type="button" onClick={ () => { dataSource && (dataSource.rootId.state = null) } }>{Weave.lang("Reset")}</button>
					</label>
			</ui.VBox>;
	}
}

Weave.registerClass("weavejs.editors.WeaveDataSourceEditor", WeaveDataSourceEditor, []);