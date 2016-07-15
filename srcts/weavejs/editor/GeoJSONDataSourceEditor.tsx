namespace weavejs.editor
{
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils
	import ReactUtils = weavejs.util.ReactUtils;
	import WeaveTree = weavejs.ui.WeaveTree;
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import FileSelector = weavejs.ui.FileSelector;
	import KeyTypeInput = weavejs.ui.KeyTypeInput;
	import DataSourceEditor = weavejs.editor.DataSourceEditor;
	import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
	import IDataSourceEditorState = weavejs.editor.IDataSourceEditorState;
	import ComboBox = weavejs.ui.ComboBox;
	import HelpIcon = weavejs.ui.HelpIcon;

	import GeoJSONDataSource = weavejs.data.source.GeoJSONDataSource;
	import GeoJSON = weavejs.geom.GeoJSON;
	import EntityNode = weavejs.data.hierarchy.EntityNode;
	import EntityType = weavejs.api.data.EntityType;
	import LinkableFile = weavejs.core.LinkableFile;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import WeaveAPI = weavejs.WeaveAPI;

	export class GeoJSONDataSourceEditor extends DataSourceEditor
	{
		get editorFields():[React.ReactChild, React.ReactChild][]
		{
			let dataSource = (this.props.dataSource as GeoJSONDataSource);
			let propertyIds = dataSource.getPropertyNames().map((id:string)=>({label: id.toString(), value: id}));
			let validGeoJson:boolean = true;
			let acceptExtension:string = ".json,.geojson,application/vnd.geo+json";
			
			//validate if the json is a geo json
			if (dataSource.url.result)
			{
				//var json = Weave.getDefinition("JSON");//TODO look into correct serializing of url result
				var jsonObj = dataSource.url.result;
				//var jsonObj = json.parse(jsonStr);
				validGeoJson = GeoJSON.isGeoJSONObject(jsonObj);
			}
			
			propertyIds.unshift({label:Weave.lang("Auto-generated keys"), value: null});

			let editorFields:[React.ReactChild, React.ReactChild][] = [
				this.getLabelEditor(dataSource.label),
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("GeoJSON URL")}
						<HelpIcon className={validGeoJson ? "":"fa-exclamation-triangle"} style={{color:validGeoJson? null:"#794B02"}}>
							<VBox>
								{validGeoJson ? Weave.lang("The URL of the GeoJSON file to be used"):Weave.lang("Warning: The file you have chosen has an extension that does not match the expected extension.")}
							</VBox>
						</HelpIcon>
					</HBox>,
					<FileSelector style={{width: "100%"}}
								  targetUrl={dataSource.url}
								  placeholder={Weave.lang("http://www.example.com/example.geojson")}
								  accept={acceptExtension}/>
				],
				[
					Weave.lang("Projection"),
					<StatefulTextField style={{width: "100%"}}
									   selectOnFocus={true} 
									   placeholder={Weave.lang("Example: EPSG:4326")} 
								   	   ref={WeaveReactUtils.linkReactStateRef(this, { value: dataSource.projection })}/>
				],
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("Key property")}
						<HelpIcon>{Weave.lang("A property that can uniquely identify each row in the data. If there are no such properties, choose \"Auto-generated keys\"")}</HelpIcon>
					</HBox>,
					<ComboBox style={{width: "100%"}}
							  ref={WeaveReactUtils.linkReactStateRef(this, { value: dataSource.keyProperty }) } /* searchable field */
							  options={propertyIds}
					/>
				],
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("Key namespace")}
						<HelpIcon>{Weave.lang("Key namespaces are used to link tables using matching key columns.")}</HelpIcon>
					</HBox>,
					<KeyTypeInput style={{width: "100%"}}
								  keyTypeProperty={dataSource.keyType}/>
				]
			];
			return super.editorFields.concat(editorFields)
		}
	}
}
