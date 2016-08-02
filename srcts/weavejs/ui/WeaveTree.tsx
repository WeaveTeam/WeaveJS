namespace weavejs.ui
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import DOMUtils = weavejs.util.DOMUtils;
	import ObjectDataTable = weavejs.ui.DataTable.ObjectDataTable;

	export interface IWeaveTreeState<TreeNode>
	{
		selectedItems?: TreeNode[];
		openItems?: TreeNode[];
		columnWidth?: number;
	}

	export interface IWeaveTreeProps<TreeNode>
	{
		root?:TreeNode;
		treeDescriptor?:ITreeDescriptor<TreeNode>;
		style?: any;
		hideRoot?: boolean;
		hideLeaves? : boolean;
		hideBranches? : boolean;
		filterFunc?: (node: TreeNode) => boolean;
		multipleSelection?: boolean;
		onSelect?: (selectedItems: TreeNode[]) => void;
		onExpand?: (openItems: TreeNode[]) => void;
		initialOpenItems?: TreeNode[];
		initialSelectedItems?: TreeNode[];
		onDoubleClick?: (item: TreeNode) => void;
	};

	let defaultTreeDescriptor:ITreeDescriptor<any>;

	export class WeaveTree<TreeNode> extends React.Component<IWeaveTreeProps<TreeNode>, IWeaveTreeState<TreeNode>>
	{
		public static defaultProps:IWeaveTreeProps<any> = {
			get treeDescriptor() {
				return defaultTreeDescriptor || (defaultTreeDescriptor = new BasicTreeDescriptor());
			}
		};

		constructor(props: IWeaveTreeProps<TreeNode>)
		{
			super(props);

			this.state = {
				selectedItems: props.initialSelectedItems || [],
				openItems: props.initialOpenItems || []
			};
		}

		state: IWeaveTreeState<TreeNode> = {
			selectedItems: [],
			openItems: [],
			columnWidth: 0
		};

		componentWillReceiveProps(nextProps: IWeaveTreeProps<TreeNode>)
		{
			let shouldResetBoth = (
				this.props.treeDescriptor != nextProps.treeDescriptor
				|| !this.props.root != !nextProps.root
				|| (
					nextProps.root
					&& !nextProps.treeDescriptor.isEqual(nextProps.root, this.props.root)
				)
			);
			if (shouldResetBoth)
				this.setState({ selectedItems: nextProps.initialSelectedItems || [], openItems: nextProps.initialOpenItems || [] });
			else if (this.nodeArraysChanged(nextProps.initialSelectedItems, this.props.initialSelectedItems))
				this.setState({ selectedItems: nextProps.initialSelectedItems || [] });
			else if (this.nodeArraysChanged(nextProps.initialOpenItems, this.props.initialOpenItems))
				this.setState({ openItems: nextProps.initialOpenItems || [] });
		}

		isOpen(node:TreeNode): boolean
		{
			if (node === this.props.root && this.props.hideRoot)
				return true;
			else
				return node && !!this.state.openItems.find((otherNode) => this.props.treeDescriptor.isEqual(otherNode, node));
		}

		private nodeArraysChanged(arrayA:TreeNode[], arrayB:TreeNode[]):boolean
		{
			return (
				arrayA && arrayB
				?	arrayA.length != arrayB.length
					|| arrayA.some((d, i, a) => !this.areNodesEqual(d, arrayB[i]))
				:	arrayA != arrayB
			);
		}

		private areNodesEqual = (a:TreeNode, b:TreeNode) =>
		{
			if (a && b)
				return this.props.treeDescriptor.isEqual(a, b);
			else
				return (a === b);
		};

		componentDidUpdate(prevProps: IWeaveTreeProps<TreeNode>, prevState: IWeaveTreeState<TreeNode>)
		{
			if (this.props.onSelect && this.nodeArraysChanged(prevState.selectedItems, this.state.selectedItems))
				this.props.onSelect(this.state.selectedItems);

			if (this.props.onExpand && this.nodeArraysChanged(prevState.openItems, this.state.openItems))
				this.props.onExpand(this.state.openItems);

			if (this.longestRowJSX)
			{
				let newColumnWidth = this.computeRowWidth(this.longestRowJSX);
				if (newColumnWidth != this.state.columnWidth)
				{
					this.setState({columnWidth: newColumnWidth});
				}
			}
		}

		componentDidMount():void
		{
			if (this.longestRowJSX)
			{
				let newColumnWidth = this.computeRowWidth(this.longestRowJSX);
				if (newColumnWidth != this.state.columnWidth)
				{
					this.setState({columnWidth: newColumnWidth});
				}
			}
		}

		private internalSetOpen(node:TreeNode, value: boolean)
		{
			if (!node)
				return;
			let isOpen = this.isOpen(node);
			if (value == isOpen)
				return;

			let openItems = this.state.openItems;
			if (!isOpen)
				openItems = openItems.concat([node]);
			else if (isOpen)
				openItems = openItems.filter((other) => !this.props.treeDescriptor.isEqual(node, other));

			this.setState({ openItems });
		}

		static CLASSNAME = "weave-tree-view";
		static BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder fa-fw";
		static LEAF_ICON_CLASSNAME = "weave-tree-view-icon fa fa-file-text-o fa-fw";
		static OPEN_BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder-open fa-fw";
		static EXPANDER_CLOSED_CLASS_NAME = "weave-tree-view-icon-expander fa fa-play fa-fw";
		static EXPANDER_OPEN_CLASS_NAME = "weave-tree-view-icon-expander fa fa-play fa-fw fa-rotate-90";
		static EXPANDER_HIDDEN_CLASS_NAME = "weave-tree-view-icon-expander fa fa-fw hidden-expander";

		private renderItem = (node:TreeNode, index:number, depth:number):JSX.Element =>
		{
			let className = WeaveTree.CLASSNAME;
			let iconClassName = WeaveTree.LEAF_ICON_CLASSNAME;
			let iconClickFunc: React.MouseEventHandler = null;
			let doubleClickFunc: React.MouseEventHandler;
			let expanderClassName: string = WeaveTree.EXPANDER_HIDDEN_CLASS_NAME;

			let isOpen = this.isOpen(node);

			/* If we are a branch, we still might not be expandable due to hiding leaves and not having any children who are also branches. */
			let isBranch = this.props.treeDescriptor.isBranch(node);
			let isExpandable = isBranch && (!this.props.hideLeaves || this.props.treeDescriptor.hasChildBranches(node));

			if (isBranch)
			{
				iconClassName = isOpen ? WeaveTree.OPEN_BRANCH_ICON_CLASSNAME : WeaveTree.BRANCH_ICON_CLASSNAME;
			}

			if (isExpandable)
			{
				iconClickFunc = (e: React.MouseEvent): void => {
					this.internalSetOpen(node, !this.isOpen(node));
					e.stopPropagation();
				};

				expanderClassName = isOpen ? WeaveTree.EXPANDER_OPEN_CLASS_NAME : WeaveTree.EXPANDER_CLOSED_CLASS_NAME;
			}
			else if (!this.props.treeDescriptor.isBranch(node) && this.props.onDoubleClick)
			{
				doubleClickFunc = (e: React.MouseEvent): void => {
					this.props.onDoubleClick && this.props.onDoubleClick(node);
				}
			}

			return (
				<HBox
					key={index}
					className={className}
					onDoubleClick={ iconClickFunc || doubleClickFunc }
					style={{ alignItems: "center", width: "100%", paddingLeft: (depth || 0) * 16 + 5, whiteSpace: "nowrap" }}
				>
					<span style={{ alignSelf: "stretch", display: "flex" }}>
						<i
							onMouseDown={ iconClickFunc }
							onDoubleClick={(e) => e.stopPropagation() }
							className={ expanderClassName }
							style={{ alignSelf: "center" }}
						/>
					</span>
					<span style={{ alignSelf: "stretch", display: "flex" }}>
						<i
							style={{ alignSelf: "center" }}
							className={iconClassName}
						/>
					</span>
					{ " " + this.props.treeDescriptor.getLabel(node) }
				</HBox>
			);
		};

		enumerateItems=(node:TreeNode, result: Array<[number, TreeNode]> = [], depth: number = 0): Array<[number, TreeNode]> =>
		{
			if (!node)
				return result;

			if (this.props.filterFunc && !this.props.filterFunc(node))
			{
				return result;
			}

			if (node !== this.props.root || !this.props.hideRoot)
			{
				if (this.props.treeDescriptor.isBranch(node) || node == this.props.root || !this.props.hideLeaves)
				{
					result.push([depth, node]);
					depth++;
				}
			}

			if (this.props.treeDescriptor.isBranch(node) && this.isOpen(node))
			{
				for (let child of this.props.treeDescriptor.getChildren(node))
				{
					this.enumerateItems(child, result, depth);
				}
			}

			return result;
		};

		rowHeight: number;
		private lastEnumeration: [number, TreeNode][];

		onSelect=(indices:string[])=>
		{
			let nodes = indices.map((index) => this.lastEnumeration[Number(index)][1]);
			this.setState({ selectedItems: nodes });
			for (let node of nodes)
				this.internalSetOpen(node, true);
		}

		computeRowWidth(rowJSX:React.ReactChild):number
		{
			var body = document.getElementsByTagName("body")[0];
			let div = document.createElement("span");
			body.appendChild(div);
			let renderedRow = ReactDOM.render(rowJSX as any, div); // TODO fix type of rowJSX
			let node = ReactDOM.findDOMNode(renderedRow) as HTMLDivElement;
			node.style.display = "inline-block";
			node.style.width = null;
			let width = node.offsetWidth;
			ReactDOM.unmountComponentAtNode(div);
			body.removeChild(div);

			return width * 1.5;
		}

		private longestRowJSX:React.ReactChild;

		render(): JSX.Element
		{
			if (Weave.isLinkable(this.props.root))
			{
				Weave.getCallbacks(this.props.root).addGroupedCallback(this, this.forceUpdate);
			}
			this.rowHeight = Math.max(DOMUtils.getTextHeightForClasses("M", WeaveTree.CLASSNAME), 22) + 5;
			let rootChildren:TreeNode[] = this.props.treeDescriptor.getChildren(this.props.root) || [];

			this.lastEnumeration = this.props.hideBranches ?
				rootChildren.filter((n) => !this.props.treeDescriptor.isBranch(n)).map((n):[number, TreeNode] => [0, n]) :
				this.enumerateItems(this.props.root);

			let selectedIndices:string[] = [];
			let maxRowIndex = -1;
			let maxRowLength = -Infinity;

			let rows = this.lastEnumeration.map(
				(row, index): { [columnId: string]: React.ReactChild } => {
					let [depth, item] = row;
					if (this.state.selectedItems.filter(_.identity).some(node => this.props.treeDescriptor.isEqual(node, item)))
						selectedIndices.push(index.toString());
					/* keep a running maximum node length */
					let label = this.props.treeDescriptor.getLabel(item);
					let rowLengthHeuristic = label.length + depth;
					if (rowLengthHeuristic > maxRowLength)
					{
						maxRowLength = rowLengthHeuristic;
						maxRowIndex = index;
					}

					return ({ id: index.toString(), tree: this.renderItem(item, index, depth) });
				});

			if (rows[maxRowIndex])
				this.longestRowJSX = rows[maxRowIndex]["tree"];

			return <ObjectDataTable
				idProperty={"id"}
				headerHeight={0}
				rowHeight={this.rowHeight}
				columnIds={["tree"]}
				initialColumnWidth={this.state.columnWidth}
				rows={rows}
				selectedIds={selectedIndices}
				onSelection={this.onSelect}
				showBottomBorder={false}
				allowClear={false}
			/>;
		}
	}

	export interface ITreeDescriptor<Node>
	{
		getLabel(node:Node):string;
		isEqual(node1:Node, node2:Node):boolean;
		getChildren:(node:Node)=>Node[];
		hasChildBranches:(node:Node)=>boolean;
		isBranch:(node:Node)=>boolean;
		addChildAt?:(parent:Node, newChild:Node, index:int)=>boolean;
		removeChildAt?:(parent:Node, child:Node, index:int)=>boolean;
	}

	export interface IBasicTreeNode
	{
		label?:string;
		children?:IBasicTreeNode[];
	}

	export class BasicTreeDescriptor<Node extends IBasicTreeNode> implements ITreeDescriptor<Node>
	{
		getLabel(node:Node):string
		{
			return node ? node.label : '';
		}

		isEqual(node1:Node, node2:Node):boolean
		{
			return node1 == node2;
		}

		getChildren(node:Node):Node[]
		{
			return node ? node.children as Node[] : null;
		}

		isBranch(node:Node):boolean
		{
			return !!(node && node.children);
		}

		hasChildBranches(node:Node):boolean
		{
			if (node && node.children)
				for (let child of node.children)
					if (child.children)
						return true;
			return false;
		}

		addChildAt(parent:Node, newChild:Node, index:int):boolean
		{
			var index = parent.children ? parent.children.indexOf(newChild) : -1;
			if (index >= 0)
			{
				var newChildren = parent.children ? parent.children.concat() : [];
				newChildren.push(newChild);
				parent.children = newChildren;
				return true;
			}
			return false;
		}

		removeChildAt(parent:Node, child:Node, index:int):boolean
		{
			var index = parent.children ? parent.children.indexOf(child) : -1;
			if (index >= 0)
			{
				var newChildren = parent.children ? parent.children.concat() : [];
				newChildren.splice(index, 1);
				parent.children = newChildren;
				return true;
			}
			return false;
		}
	}

	export namespace WeaveTree
	{
		export class BasicWeaveTree extends WeaveTree<IBasicTreeNode> { }
	}
}
