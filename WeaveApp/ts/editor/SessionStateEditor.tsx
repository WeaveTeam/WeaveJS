import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import {WeaveAPI} from "weavejs";
import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeaveTreeItem = weavejs.util.WeaveTreeItem;
import SmartComponent = weavejs.ui.SmartComponent;
import SessionManager = weavejs.core.SessionManager;
import HDividedBox = weavejs.ui.HDividedBox;
import VBox = weavejs.ui.flexbox.VBox;
import DynamicComponent = weavejs.ui.DynamicComponent;
import WeaveReactUtils = weavejs.util.WeaveReactUtils;
import MenuItemProps = weavejs.ui.menu.MenuItemProps;
import ILinkableCompositeObject = weavejs.api.core.ILinkableCompositeObject;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import DebugUtils = weavejs.util.DebugUtils;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
import WeaveProperties from "../app/WeaveProperties";
import IGetMenuItems = weavejs.ui.menu.IGetMenuItems;
import Menu = weavejs.ui.menu.Menu;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
import StandardLib = weavejs.util.StandardLib;
import ControlPanel from "./ControlPanel";
import JSONEditor from "./JSONEditor";
import AttributeSelector from "../ui/AttributeSelector";
import {WeaveTree, BasicTreeDescriptor} from "../ui/WeaveTree";

export interface ISessionStateEditorProps extends React.Props<SessionStateEditor>
{
	rootObject:ILinkableObject;
	initialSelectedObject?:ILinkableObject;
}

export interface ISessionStateEditorState
{
	selectedNode:WeaveTreeItem;
}

export default class SessionStateEditor extends SmartComponent<ISessionStateEditorProps, ISessionStateEditorState> implements IGetMenuItems
{
	static getTreeNode(object:ILinkableObject)
	{
		let root = Weave.getRoot(object);
		let path = Weave.findPath(root, object);
		let name:string = WeaveAPI.ClassRegistry.getDisplayName(object.constructor as Class);
		if (path)
			name = path.length ? path.pop() : "Weave";
		return (WeaveAPI.SessionManager as SessionManager).getSessionStateTree(object, name);
	}

	static openInstance(context:React.ReactInstance, selectedObject:ILinkableObject):ControlPanel
	{
		var weave = Weave.getWeave(selectedObject);
		return ControlPanel.openInstance<ISessionStateEditorProps>(
			weave,
			SessionStateEditor,
			{
				context,
				title: Weave.lang('Session State Editor')
			},
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

	get selectedTreeNode()
	{
		return SessionStateEditor.getTreeNode(this.selectedObject);
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
	}

	componentWillReceiveProps(props:ISessionStateEditorProps)
	{
	}

	private onSelect=(items:WeaveTreeItem[]):void=>
	{
		this.setState({
			selectedNode: items[0]
		});
	}

	private onDoubleClick=(item:WeaveTreeItem):void=>
	{
	}

	getMenuItems():MenuItemProps[]
	{
		return [
			/*{
				shown: !!this.selectedObject,
				label: Weave.lang('Copy path to selected object'),
				click: this.copyPathToClipboard
			}, {
				shown: !!this.selectedObject,
				label: Weave.lang('Link session state with another object'),
				click: this.linkStatePath
			},
			{},*/
			{
				shown: !!this.selectedObject,
				label: Weave.lang('New object...'),
				enabled: Weave.IS(this.selectedObject, ILinkableCompositeObject),
				click: () => {
					var parent:ILinkableObject = this.selectedObject;
					this.showInputDialog(
						Weave.lang("Create new object"),
						Weave.lang("Enter the object type"),
						"",
						(className:string) => {
							try {
								return Weave.getDefinition(className) != null;
							} catch (e) { }
							return false;
						},
						(className:string) => {
							WeaveAPI.Scheduler.callLater(this, this.newObject, [parent, Weave.getDefinition(className)]);
						}
					);
				}
			},
			{
				shown: !!this.selectedObject,
				label: Weave.lang('Rename object...'),
				enabled: Weave.IS(Weave.getOwner(this.selectedObject), ILinkableHashMap),
				click: () => {
					var object:ILinkableObject = this.selectedObject;
					var parent:ILinkableHashMap = Weave.getOwner(object) as ILinkableHashMap;
					this.showInputDialog(
						Weave.lang("Rename object"),
						Weave.lang("Enter a new name"),
						parent.getName(object),
						(name:string) => {
							return !parent.getObject(name);
						},
						(name:string) => {
							parent.renameObject(parent.getName(object), name);
						}
					);
				}
			},
			{
				shown: !!this.selectedObject,
				label: Weave.lang('Delete selected object'),
				enabled: this.canDeleteSelectedItem(),
				click: this.deleteSelectedItem
			},
			{},
			{
				shown: !!this.selectedObject,
				label: Weave.lang('Open attribute selector'),
				enabled: (
					Weave.IS(this.selectedObject, ILinkableHashMap)
					|| Weave.IS(this.selectedObject, IColumnWrapper)
				),
				click: () => {
					var selectedNode = this.selectedTreeNode
					var selectableAttribute = this.selectedObject as IColumnWrapper|ILinkableHashMap;
					AttributeSelector.openInstance(this, selectedNode.label, new Map([[selectedNode.label, selectableAttribute]]));
				}
			},
			{},
			{
				shown: !!this.selectedObject,
				label: Weave.lang('Watch selected object in console'),
				click: () => DebugUtils.watchState(this.selectedObject)
			},
			{
				shown: !!this.selectedObject,
				label: Weave.lang('Unwatch selected object'),
				click: () => DebugUtils.unwatch(this.selectedObject)
			}
		];
	}

	/**
	 * Displays a modal dialog and requests user input with OK/Cancel buttons
	 * @param title dialog window title text
	 * @param message dialog content text
	 * @param defaultInput default value for text input box
	 * @param inputValidator checked every time user modifies input and boolean result determines if the OK button should be enabled
	 * @param inputHandler Called when user clicks OK button
	 */
	private showInputDialog(title:string, message:string, defaultInput:string = "", inputValidator:(input:string)=>boolean = null, inputHandler:(input:string)=>void = null)
	{
		this.reportError("TODO - implement SessionStateEditor.prototype.showInputDialog()");
	}

	private newObject(parent:ILinkableObject, classDef:Class):void
	{
		var className:string = Weave.className(classDef).split('.').pop();

		if (Weave.IS(parent, ILinkableDynamicObject))
		{
			var newObject:ILinkableObject = Weave.AS(parent, ILinkableDynamicObject).requestLocalObject(classDef, false);
			if (newObject)
				this.onSelect([SessionStateEditor.getTreeNode(newObject)]);
			else
				this.reportError("Unable to create new " + className);
			return;
		}

		var ilh:ILinkableHashMap = Weave.AS(parent, ILinkableHashMap);
		if (!ilh)
		{
			this.reportError("Cannot create object under parent of type " + Weave.className(parent));
			return;
		}

		this.showInputDialog(
			Weave.lang("Create new object"),
			Weave.lang("Enter the name of the new {0}", className),
			ilh.generateUniqueName(className),
			null,
			(name:string) => {
				var newObject:ILinkableObject = ilh.requestObject(name, classDef, false);
				if (newObject)
				{
					this.onSelect([SessionStateEditor.getTreeNode(newObject)]);
					//sessionNav.scrollToAndSelectMatchingItem(sessionNav.selectedItem);
				}
				else
					this.reportError("Unable to create new " + className);
			}
		);
	}

	private canDeleteSelectedItem=():boolean=>
	{
		var item = SessionStateEditor.getTreeNode(this.selectedObject);
		var parent = Weave.getOwner(item && item.data as ILinkableObject);
		var hashMap = Weave.AS(parent, ILinkableHashMap);
		var dynamicObject = Weave.AS(parent, ILinkableDynamicObject);
		return !!(hashMap || dynamicObject);
	}

	private deleteSelectedItem=():void=>
	{
		var item = SessionStateEditor.getTreeNode(this.selectedObject);
		if (!item)
			return;
		var parent = Weave.getOwner(item.data as ILinkableObject);
		if (!parent)
			return;
		var hashMap = Weave.AS(parent, ILinkableHashMap);
		var dynamicObject = Weave.AS(parent, ILinkableDynamicObject);

		var oldObject = item.data as ILinkableObject;
		if (hashMap)
			hashMap.removeObject(hashMap.getName(oldObject));
		else if (dynamicObject)
			dynamicObject.removeObject();

		if (!!(hashMap || dynamicObject) && !Weave.wasDisposed(oldObject))
			this.reportError(Weave.lang("Object is locked and cannot be deleted."));
	}

	reportError(message:string)
	{
		WeaveProperties.notify(Weave.getWeave(this.props.rootObject), "error", message);
	}

	private treeDescriptor = new WeaveSessionTreeDescriptor();

	render():JSX.Element
	{
		var rootNode = SessionStateEditor.getTreeNode(this.props.rootObject);
		var initialSelectedNode = SessionStateEditor.getTreeNode(this.props.initialSelectedObject);
		var initialOpenItems = [rootNode, initialSelectedNode].filter(n => !!n);
		return (
			<HDividedBox
				style={ {flex: 1} }
				resizerStyle={ {background: "black"} }
				loadWithEqualWidthChildren={true}
			>
				<VBox>
					<DynamicComponent dependencies={[this.props.rootObject]} render={() =>
						<WeaveSessionTree
							root={rootNode}
							treeDescriptor={this.treeDescriptor}
							initialOpenItems={initialOpenItems}
							initialSelectedItems={[initialSelectedNode]}
							multipleSelection={false}
							onSelect={this.onSelect}
							onDoubleClick={this.onDoubleClick}
						/>
					}/>
				</VBox>
				<VBox>
					<JSONEditor ref={WeaveReactUtils.linkReactStateRef(this, {value: this.selectedObject})}/>
				</VBox>
			</HDividedBox>
		);
	}
}

class WeaveSessionTreeDescriptor extends BasicTreeDescriptor<WeaveTreeItem>
{
	getLabel(node:WeaveTreeItem):string
	{
		// append class name to the label.
		var label:string = Weave.className(node.data).split(".").pop();
		if (node.label)
			label += ' ' + JSON.stringify(node.label);

		// get editor label
		var editorLabel:String = WeaveAPI.EditorManager.getLabel(node.data as ILinkableObject);
		// get description
		var description:String = null;
		var iowd:IObjectWithDescription = Weave.AS(node.data, IObjectWithDescription);
		if (iowd)
			description = iowd.getDescription();
		else if (Weave.IS(node.data, IAttributeColumn))
			description = (node.data as IAttributeColumn).getMetadata(ColumnMetadata.TITLE);

		var inParens:String = editorLabel || description;
		if (editorLabel && description)
			inParens = editorLabel + ': ' + description;
		if (inParens)
			label += ` (${inParens})`;

		return label;
	}

	isEqual(node1:WeaveTreeItem, node2:WeaveTreeItem):boolean
	{
		return node1.data == node2.data;
	}
}

class WeaveSessionTree extends WeaveTree<WeaveTreeItem> { }
