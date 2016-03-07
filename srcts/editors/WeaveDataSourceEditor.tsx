import * as React from "react";
import * as lodash from "lodash";
import ui from "../react-ui/ui";
import LinkableTextField from "../ui/LinkableTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import Tree from "../ui/Tree";

import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export default class WeaveDataSourceEditor extends React.Component<IDataSourceEditorProps,IDataSourceEditorState>
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}

	state:IDataSourceEditorState = {dataSource: null};

	onHierarchySelected=(tree:Tree):void=>{
		let item = tree.state.selectedItems[0] as EntityNode;

		if (this.state.dataSource && item instanceof EntityNode)
		{
			(this.state.dataSource as WeaveDataSource).rootId.state = item.getEntity().id;
		}
	}

	render():JSX.Element
	{
		let dataSource: WeaveDataSource;
		let root: IWeaveTreeNode;
		if (this.state.dataSource)
		{
			Weave.getCallbacks(this.state.dataSource).addGroupedCallback(this, this.forceUpdate, false);
			dataSource = this.state.dataSource as WeaveDataSource;

			let cache = (this.state.dataSource as WeaveDataSource).entityCache;
			root = new EntityNode(cache, EntityType.HIERARCHY);
		}
		else
		{
			return <ui.VBox/>;
		}

		let margins: React.CSSProperties = { marginLeft: "0.5em", marginRight: "0.5em" };

		return <ui.VBox style={{ width: "100%", height: "100%" }}>
					<label>{Weave.lang("Source display name") }
						<LinkableTextField style={margins}/>
					</label>
					<label>{Weave.lang("Service URL")}
						<LinkableTextField ref={linkReactStateRef(this, {content: dataSource.url}) }
							style={margins} placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL}/>
					</label>
					<label>{Weave.lang("Root hierarchy ID")}
						<LinkableTextField ref={linkReactStateRef(this, { content: dataSource.rootId }) }
							style={margins} placeholder={Weave.lang("Hierarchy ID") }/>
						<button type="button" onClick={ () => { dataSource && (dataSource.rootId.state = null) } }>{Weave.lang("Reset")}</button>
						<Tree hideRoot={true} root={root} ref={(c: Tree) => ReactUtils.onComponentDidUpdate(c, this.onHierarchySelected)}/>
					</label>
			</ui.VBox>;
	}
}

Weave.registerClass("weavejs.editors.WeaveDataSourceEditor", WeaveDataSourceEditor, []);