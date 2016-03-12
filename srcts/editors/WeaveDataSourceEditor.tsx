import * as React from "react";
import * as lodash from "lodash";
import LinkableTextField from "../ui/LinkableTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";

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

	onHierarchySelected=(selectedItems:Array<IWeaveTreeNode>):void=>{
		let item = selectedItems[0] as EntityNode;
		if (this.props.dataSource && item instanceof EntityNode)
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = item.getEntity().id;
		}
		else
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = null;
		}
	}

	private tree: WeaveTree;
	setHierarchySelection=():void=>{
		if (this.tree && this.props.dataSource)
		{
			let id:number = (this.props.dataSource as WeaveDataSource).rootId.state as number;
			let node = this.props.dataSource.findHierarchyNode(id) as EntityNode;
			if (node != null && node.id > -1)
			{
				this.tree.setSelected([node]);	
			}
			else
			{
				this.tree.setSelected([]);
			}
		}
	}

	render():JSX.Element
	{
		let dataSource: WeaveDataSource;
		let root: IWeaveTreeNode;
		if (this.props.dataSource)
		{
			Weave.getCallbacks(this.props.dataSource).addGroupedCallback(this, this.forceUpdate, false);
			dataSource = this.props.dataSource as WeaveDataSource;

			let cache = (dataSource as WeaveDataSource).entityCache;
			root = new EntityNode(cache, EntityType.HIERARCHY);
			dataSource.rootId.addGroupedCallback(this, this.setHierarchySelection, false);
		}
		else
		{
			return <VBox/>;
		}

		let margins: React.CSSProperties = { marginLeft: "0.5em", marginRight: "0.5em" };

		return <VBox style={{ flex: 1 }}>
					<label>{Weave.lang("Source display name") }
						<LinkableTextField style={margins}/>
					</label>
					<label>{Weave.lang("Service URL")}
						<LinkableTextField ref={linkReactStateRef(this, {content: dataSource.url}, 500) }
							style={margins} placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL}/>
					</label>
					<label>{Weave.lang("Root hierarchy ID")}
						<LinkableTextField ref={linkReactStateRef(this, { content: dataSource.rootId }, 500) }
							style={margins} placeholder={Weave.lang("Hierarchy ID") }/>
						<button type="button" onClick={ () => { dataSource && (dataSource.rootId.state = null) } }>{Weave.lang("Reset")}</button>
					</label>
					<WeaveTree hideRoot={true} root={root} onSelect={this.onHierarchySelected} ref={ (c) => { this.tree = c; } }/>
			</VBox>;
	}
}

Weave.registerClass("weavejs.editors.WeaveDataSourceEditor", WeaveDataSourceEditor, []);