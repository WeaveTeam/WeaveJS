namespace weavejs.ui
{
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import WeaveTreeNodeDescriptor = weave.ui.WeaveTreeNodeDescriptor;

	let defaultTreeDescriptor:ITreeDescriptor<any>;

	export class WeaveDataTree extends WeaveTree<IWeaveTreeNode & IColumnReference>
	{
		public static defaultProps:IWeaveTreeProps<any> = {
			get treeDescriptor() {
				return defaultTreeDescriptor || (defaultTreeDescriptor = new WeaveTreeNodeDescriptor<IWeaveTreeNode & IColumnReference>());
			}
		};

		constructor(props: IWeaveTreeProps<IWeaveTreeNode & IColumnReference>)
		{
			super(props);
		}
	}
}