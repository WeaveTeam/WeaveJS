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

	export interface ISessionStateEditorProps extends React.HTMLProps<SessionStateEditor>
	{
		weaveRoot:ILinkableHashMap;
		name:string;
	}

	export interface ISessionStateEditorState
	{
		activeItem:WeaveTreeItem;
	}

	export class SessionStateEditor extends SmartComponent<ISessionStateEditorProps, ISessionStateEditorState>
	{
		static openInstance(context:React.ReactInstance, name:string, weaveRoot:ILinkableHashMap):ControlPanel{
			var weave = Weave.getWeave(weaveRoot);
			return ControlPanel.openInstance<ISessionStateEditorProps>(weave, SessionStateEditor, {context, title: Weave.lang('Session State Editor for ' + name)}, { name, weaveRoot});
		}

		constructor(props:ISessionStateEditorProps)
		{
			super(props);

			this.rootWeaveTreeItem = (WeaveAPI.SessionManager as SessionManager).getSessionStateTree(this.props.weaveRoot,"Weave") as WeaveTreeItem;

			if (this.props.name)
			{
				let filteredItem:WeaveTreeItem[] = this.rootWeaveTreeItem.children.filter(function(weaveTreeItem:WeaveTreeItem,index:number){
					return weaveTreeItem.label == this.props.name
				},this);

				this.rootWeaveTreeItem = filteredItem[0];
			}

			this.state = {
				activeItem:this.rootWeaveTreeItem
			}
		}

		componentWillReceiveProps(nextProps:ISessionStateEditorProps)
		{
			if (nextProps.weaveRoot != this.props.weaveRoot)
			{
				this.rootWeaveTreeItem = (WeaveAPI.SessionManager as SessionManager).getSessionStateTree(nextProps.weaveRoot,"Weave") as WeaveTreeItem;
			}
			if (nextProps.name != this.props.name)
			{
				let filteredItem:WeaveTreeItem[] = this.rootWeaveTreeItem.children.filter(function(weaveTreeItem:WeaveTreeItem,index:number){
					return weaveTreeItem.label == nextProps.name
				},this);

				this.rootWeaveTreeItem = filteredItem[0];
			}
		}

		private rootWeaveTreeItem:WeaveTreeItem = null;

		private nodeClickHandler = (item:WeaveTreeItem,isOpen:boolean):void=>
		{
			this.setState({
			  activeItem:item
			});

		}

		render():JSX.Element
		{
			return (<HDividedBox style={ {flex:1,border:"1px solid lightgrey"} } resizerStyle={ {background:"black"} }>
						<div style={ {padding:"4px",fontSize:"14px"} }>
							<SessionStateTree root={ this.rootWeaveTreeItem } clickHandler={ this.nodeClickHandler } open={true} enableAccordion={true}/>
						</div>
						<WeaveTreeItemEditor item={ this.state.activeItem } style={ {padding:"8px",fontSize:"14px"} }/>
					</HDividedBox>
				);
		}
	}

	interface IWeaveTreeItemEditorProps  extends React.HTMLProps<WeaveTreeItemEditor>
	{
		item:WeaveTreeItem
	}

	interface IWeaveTreeItemEditorState
	{
		sessionValue:string
	}

	class WeaveTreeItemEditor extends SmartComponent<IWeaveTreeItemEditorProps, IWeaveTreeItemEditorState>
	{

		constructor(props:IWeaveTreeItemEditorProps)
		{
			super(props);
			this.state = {
				sessionValue: this.getStateAsStringFromItem()
			}
		}

		componentWillReceiveProps(nextProps:IWeaveTreeItemEditorProps):void
		{
			if (this.props.item != nextProps.item)
			{
				this.setState({
					sessionValue:this.getStateAsStringFromItem(nextProps.item)
				})
			}

		}

		get isDynamicLinkableObject():boolean
		{
			return (this.props.item.dependency instanceof LinkableDynamicObject);
		}


		private getStateAsStringFromItem =(item:WeaveTreeItem = null):string=>
		{
			if (!this.props.item)
				return "";

			var activeItem:WeaveTreeItem = item ? item : this.props.item;
			var state:any = Weave.getState(activeItem.data);
			var str:string;
			/*if (activeItem.data instanceof LinkableString)
				str = state as string;
			else*/
			//to display null, we have to use stringify even for LinkableString
			str = Weave.stringify(state, null, '\t', true);

			return str;
		}

		private saveSessionValue = ():void =>
		{
			var value:string = this.state.sessionValue;
			if (this.props.item.data instanceof LinkableString)
				(this.props.item.data as LinkableString).value = value;
			else
				Weave.setState(this.props.item.data, JSON.parse(value));
		}

		changeSessionStateValue=(newValue:string):void=>
		{
			this.setState({ sessionValue: newValue });
		}

		render():JSX.Element
		{
			var linkableDynamicObjectUI:JSX.Element = null;
			var title:string = "";
			if (this.props.item)
			{
				if (this.isDynamicLinkableObject)
				{
					linkableDynamicObjectUI = <LinkableDynamicObjectComponent  dynamicObject={this.props.item.dependency as LinkableDynamicObject}/>
				}
				title = this.props.item.label;
			}

			let headerStyle:React.CSSProperties = {
				alignItems:"center",
				fontSize:"inherit",
				paddingBottom:"10px",
				borderBottom:"1px solid lightgrey"
			}

			return (
				<VBox padded style={ this.props.style }>
					<HBox padded className="weave-window-header" style={ headerStyle }>
						{title}
						<span style={ {flex:"1"} }/>
						{linkableDynamicObjectUI}
						<IconButton
							clickHandler={ this.saveSessionValue }
							toolTip={"click to save Session State of " + title}
							style={ {borderColor:"grey",fontSize:"inherit"} }
						>
							Apply
						</IconButton>
					</HBox>
					<ReactCodeMirror
						options={{
							mode: "javascript",
							lineNumbers: false,
							lineWrapping: true,
							smartIndent: false,
							//matchBrackets: true,
							theme: "eclipse",
							readOnly: false
						}}
						value={this.state.sessionValue}
						onChange={this.changeSessionStateValue}
					/>
				</VBox>
			);
		}
	}
}
