namespace weavejs.editor
{
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import FileSelector = weavejs.ui.FileSelector;
	import DataSourceEditor = weavejs.editor.DataSourceEditor;
	import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
	import IDataSourceEditorState = weavejs.editor.IDataSourceEditorState;
	import ComboBox = weavejs.ui.ComboBox;
	import KeyTypeInput = weavejs.ui.KeyTypeInput;
	import HelpIcon = weavejs.ui.HelpIcon;

	import DBFDataSource = weavejs.data.source.DBFDataSource;
	import EntityNode = weavejs.data.hierarchy.EntityNode;
	import EntityType = weavejs.api.data.EntityType;
	import LinkableFile = weavejs.core.LinkableFile;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import WeaveAPI = weavejs.WeaveAPI;

	export class DBFDataSourceEditor extends DataSourceEditor
	{
		get editorFields():[React.ReactChild, React.ReactChild][]
		{
			let dataSource = this.props.dataSource as DBFDataSource;
			let dbfValidExtension:boolean;
			let shpValidExtension:boolean;
			let dbfAcceptExtension:string = ".dbf,application/dbf";
			let shpAcceptExtension:string = ".shp,application/octec-stream";
			if (dataSource.dbfUrl.value)
			{
				let extension = dataSource.dbfUrl.value.split('.').pop();
				dbfValidExtension = _.includes(dbfAcceptExtension.split(','),"."+extension);
			} else {
				dbfValidExtension = true;
			}
			if (dataSource.shpUrl.value)
			{
				let extension = dataSource.shpUrl.value.split('.').pop();
				shpValidExtension = _.includes(shpAcceptExtension.split(','),"."+extension);
			} else {
				shpValidExtension = true;
			}
			let editorFields:[React.ReactChild, React.ReactChild][] = [
				this.getLabelEditor(dataSource.label),
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("DBF URL")}
						<HelpIcon className={dbfValidExtension ? "":"fa-exclamation-triangle"} style={{color:dbfValidExtension? null:"#794B02"}}>
							<VBox>
								{dbfValidExtension ? Weave.lang("The URL of the dbf file to be used"):Weave.lang("Warning: The file you have chosen has an extension that does not match the expected extension.")}
							</VBox>
						</HelpIcon>
					</HBox>,
					<FileSelector style={{width: "100%"}}
								  targetUrl={dataSource.dbfUrl}
							  	  placeholder={Weave.lang("http://www.example.com/example.dbf")} 
							  	  accept={dbfAcceptExtension}
					/>
				],
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("SHP URL")}
						<HelpIcon className={shpValidExtension ? "":"fa-exclamation-triangle"} style={{color:shpValidExtension? null:"#794B02"}}>
							<VBox>
								{shpValidExtension ? Weave.lang("The URL of the shp file to be used"):Weave.lang("Warning: The file you have chosen has an extension that does not match the expected extension.")}
							</VBox>
						</HelpIcon>
					</HBox>,
					<FileSelector style={{width: "100%"}}
								  targetUrl={dataSource.shpUrl} 
							  	  placeholder={Weave.lang("http://www.example.com/example.shp")} 
							  	  accept={shpAcceptExtension}
					/>
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
						{Weave.lang("Key column")}
						<HelpIcon>{Weave.lang("A Column that can uniquely identify each row in the data. If there are no such columns, choose \"Auto-generated keys\"")}</HelpIcon>
					</HBox>,
					<ComboBox style={{width: "100%"}}
							  ref={WeaveReactUtils.linkReactStateRef(this, { value: dataSource.keyColName })} /* searchable field */
							  placeholder={Weave.lang("Auto-generated keys") }
							  options={dataSource.getColumnNames()}/>
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
