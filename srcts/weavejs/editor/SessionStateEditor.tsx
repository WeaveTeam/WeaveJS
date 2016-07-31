namespace weavejs.editor
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import HDividedBox = weavejs.ui.HDividedBox;
	import SessionStateTree = weavejs.ui.SessionStateTree;
	import IconButton = weavejs.ui.IconButton;
	import LinkableDynamicObjectComponent = weavejs.ui.LinkableDynamicObjectComponent;

	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import WeaveTreeItem = weavejs.util.WeaveTreeItem;
	import SessionManager = weavejs.core.SessionManager;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableString = weavejs.core.LinkableString;
	import SmartComponent = weavejs.ui.SmartComponent;
	import WeaveTree = weavejs.ui.WeaveTree;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import DynamicComponent = weavejs.ui.DynamicComponent;

	export interface ISessionStateEditorProps extends React.Props<SessionStateEditor>
	{
		rootObject:ILinkableObject;
		initialSelectedObject?:ILinkableObject;
	}

	export interface ISessionStateEditorState
	{
		selectedNode:IWeaveTreeNode & WeaveTreeItem;
	}

	export class SessionStateEditor extends SmartComponent<ISessionStateEditorProps, ISessionStateEditorState>
	{
		static getTreeNode(rootObject:ILinkableObject)
		{
			var name:string = null;
			if (rootObject == Weave.getRoot(rootObject))
				name = "Weave";
			return (WeaveAPI.SessionManager as SessionManager).getSessionStateTree(rootObject, name);
		}

		static openInstance(context:React.ReactInstance, selectedObject:ILinkableObject):ControlPanel
		{
			var weave = Weave.getWeave(selectedObject);
			return ControlPanel.openInstance<ISessionStateEditorProps>(
				weave,
				SessionStateEditor,
				{context, title: Weave.lang('Session State Editor')},
				{
					rootObject: weave.root,
					initialSelectedObject: selectedObject
				}
			);
		}

		constructor(props:ISessionStateEditorProps)
		{
			super(props);
		}

		get selectedObject():ILinkableObject
		{
			return (
				this.state.selectedNode
				?	this.state.selectedNode.data
				:	this.props.initialSelectedObject || this.props.rootObject
			);
		}

		componentWillReceiveProps(props:ISessionStateEditorProps)
		{
		}

		private onSelect=(items:IWeaveTreeNode[]):void=>
		{
			this.setState({
				selectedNode: items[0] as IWeaveTreeNode & WeaveTreeItem
			});
		}

		private onDoubleClick=(item:IWeaveTreeNode):void=>
		{
		}

		render():JSX.Element
		{
			var rootNode = SessionStateEditor.getTreeNode(this.props.rootObject);
			var initialSelectedNode = SessionStateEditor.getTreeNode(this.props.initialSelectedObject);
			var targetNode = this.state.selectedNode || initialSelectedNode || rootNode;
			var initialOpenItems = [rootNode, initialSelectedNode].filter(n => !!n);
			return (
				<HDividedBox
					style={ {flex: 1} }
					resizerStyle={ {background: "black"} }
				>
					<VBox style={ {width: "50%"} }>
						<DynamicComponent dependencies={[this.props.rootObject]} render={() =>
							<WeaveTree
								root={rootNode}
								initialOpenItems={initialOpenItems}
								initialSelectedItems={[initialSelectedNode]}
								multipleSelection={false}
								onSelect={this.onSelect}
								onDoubleClick={this.onDoubleClick}
							/>
						}/>
					</VBox>
					<VBox style={ {width: "50%"} }>
						<JSONEditor ref={WeaveReactUtils.linkReactStateRef(this, {value: this.selectedObject})}/>
					</VBox>
				</HDividedBox>
			);
		}
	}
}
