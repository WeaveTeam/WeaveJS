namespace weavejs.tool
{
	import SelectableAttributeComponent = weavejs.ui.SelectableAttributeComponent;
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import ReactUtils = weavejs.util.ReactUtils;
	import ComboBox = weavejs.ui.ComboBox;
	import Checkbox = weavejs.ui.Checkbox;
	import MiscUtils = weavejs.util.MiscUtils;
	import Button = weavejs.ui.Button;

	import IVisToolProps = weavejs.api.ui.IVisToolProps;
	import IVisToolState = weavejs.api.ui.IVisToolState;
	import IVisTool = weavejs.api.ui.IVisTool;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;

	import LinkableString = weavejs.core.LinkableString;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import WebSocketDataSource = weavejs.data.source.WebSocketDataSource;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import KeySet = weavejs.data.key.KeySet;

	export class DataMessageTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool
	{
		static WEAVE_INFO = Weave.classInfo(DataMessageTool, {
			id: "weavejs.tool.DataMessageTool",
			label: "Data Message Tool",
			interfaces: [IVisTool]
		});

		constructor(props:IVisToolProps)
		{
			super(props);
			this.keySetSource.targetPath = [WeaveProperties.DEFAULT_SELECTION_KEYSET];
		}

		get selectableAttributes()
		{
			return new Map<string, IColumnWrapper | ILinkableHashMap>();
		}

		panelTitle = Weave.linkableChild(this, LinkableString);
		messageTarget = Weave.linkableChild(this, LinkableDynamicObject);
		keySetSource = Weave.linkableChild(this, DynamicKeyFilter);
		command = Weave.linkableChild(this, LinkableString);

		get title():string
		{
			return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
		}

		get defaultPanelTitle():string
		{
			return Weave.lang("Data Message Tool");
		}

		renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void = null):JSX.Element =>
		{
			return <div></div>;
		}

		sendMessage=():void=>
		{
			let ds = Weave.AS(this.messageTarget.target, WebSocketDataSource);
			let ks = Weave.AS(this.keySetSource.target, KeySet);
			let keyObjects:{localName:string, keyType:string}[] = [];

			if (ks)
			{
				keyObjects = ks.keys.map(
					(key:IQualifiedKey) =>
					{
						return {
							keyType: key.keyType,
							localName: key.localName
						};
					}
				);
			}
			let payload:any = {
				command: this.command.value,
				keys: keyObjects
			};
			ds.sendMessage(payload);
		}

		render():JSX.Element {
			return <Button onClick={this.sendMessage}>{Weave.lang("Send Message")}</Button>;
		}
	}
}