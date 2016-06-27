import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import FileInput from "../react-ui/FileInput";
import {ICheckBoxListProps} from "../react-ui/CheckBoxList";
import CheckBoxList from "../react-ui/CheckBoxList";
import * as FileSaver from "filesaver.js";
import Input from "../semantic-ui/Input";
import WeaveArchive from "../WeaveArchive";
import FileDialog from "../ui/FileDialog";
import WeaveMenus from "./WeaveMenus";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import KeySet = weavejs.data.key.KeySet;
import ILinkableCompositeObject = weavejs.api.core.ILinkableCompositeObject;
import StandardLib = weavejs.util.StandardLib;
import URLRequest = weavejs.net.URLRequest;
import WeaveAPI = weavejs.WeaveAPI;
import CSVDataSource = weavejs.data.source.CSVDataSource;
import IDataSource = weavejs.api.data.IDataSource;
import GeoJSONDataSource = weavejs.data.source.GeoJSONDataSource;

export default class FileMenu implements MenuBarItemProps
{
	constructor(owner:WeaveMenus)
	{
		this.owner = owner;
	}

	owner:WeaveMenus;
	label = "File";
	bold = false;
	fileName:string;
	archive:WeaveArchive;

	get menu():MenuItemProps[]
	{
		return [].concat(
			this.getSessionItems(),
			{},
			this.owner.dataMenu.getExportItems()
		);

//			{
//				label: <FileInput onChange={this.openFile} accept={this.getSupportedFileTypes().join(',')}><span className="weave-menuitem-padding">{Weave.lang("Open...")}</span></FileInput>
//			},
	}

	openFileDialog = PopupWindow.generateOpener(() => ({
		context: this.owner.context,
		title: Weave.lang("Open a Weave Session"),
		content:
			<FileDialog openHandler={this.load} context={this.owner.context} skipConfirmation={true}/>,
		footerContent: <div/>,
		resizable: false,
		draggable: false,
		modal: true,
		suspendEnter: true,
		width: "95%",
		height: "95%"
	}));

	getSessionItems():MenuItemProps[]
	{
		return [
			{
				/*label: <FileInput onChange={this.openFile} accept={this.getSupportedFileTypes().join(',')}><span className="weave-menuitem-padding">{Weave.lang("Open session...")}</span></FileInput>,*/
				label: "Open Session...",
				click: this.openFileDialog
			},
			{
				label: Weave.lang("Save session as..."),
				click: this.saveFile
			},
			{
				label: Weave.lang("Save to server"),
				click: () => {
					this.owner.login.conditionalOpen(this.saveToServer);
				},
				shown: weavejs.net.Admin.service.initialized
			}
		];
	}

	/* stateless component */
	saveDialog(fileName:string, onSave:(newFileName:string)=>void)
	{
		function dropExtension(fileName:string)
		{
			if (!fileName)
				fileName = '';
			var i = fileName.lastIndexOf(".weave");
			return i < 0 ? fileName : fileName.substr(0, i);
		}

		var defaultFileName:string = 'defaults.weave';
		var filenameInput:HTMLInputElement;
		if (!this.fileName)
			this.fileName = defaultFileName;

		var setShowTopMenuBar = (checked:boolean) =>
		{
			var wp = this.owner.weave.requestObject(['WeaveProperties'], LinkableHashMap);
			var enableMenuBar = wp.requestObject('enableMenuBar', LinkableBoolean);
			enableMenuBar.value = checked;
		};

		var setSaveHistory = (checked:boolean) =>
		{
			//console.log("Save history");
		};

		var checkboxListOptions = [
			{
				value: setShowTopMenuBar,
				label: Weave.lang("Show top menu bar")
//			},
//			{
//				value: setSaveHistory,
//				label: Weave.lang("Save history")
			}
		];

		var allOptions:Array<(checked:boolean)=>void> = checkboxListOptions.map(opt => opt.value);
		var selectedOptions:Array<(checked:boolean)=>void> = allOptions;
		var onOk = () => {
			for (var option of allOptions)
			{
				option.call(this, selectedOptions.indexOf(option) >= 0);
			}
			onSave((filenameInput.value && filenameInput.value + ".weave") || defaultFileName);
		};

		PopupWindow.open({
			context: this.owner.context,
			title: Weave.lang("Export session state"),
			content: (
				<VBox style={{width: 400, height: 200, padding: 20}}>
					<span>{Weave.lang("Enter a file name:")}</span>
					<HBox style={{alignItems: "center", marginTop: 10}}>
						<Input
							type="text"
							style={{flex: 1}}
							ref={(c:Input) => {
								if(c && c.inputElement)
								{
									filenameInput = c.inputElement;
									c.inputElement.select();
									c.inputElement;
									c.inputElement.focus()
								}
							}}
							placeholder={dropExtension(defaultFileName)}
							defaultValue={dropExtension(fileName)}
						/>
						.weave
					</HBox>
					<span style={{marginTop: 5}}>{Weave.lang("Export options:")}</span>
					<VBox style={{marginLeft: 20, marginTop: 5, flex: 1}}>
						<CheckBoxList options={checkboxListOptions}
									  selectedValues={selectedOptions}
									  labelPosition="right"
									  onChange={(newValues) => selectedOptions = newValues}/>
					</VBox>
					<HBox>

					</HBox>
				</VBox>
			),
			resizable: false,
			modal: true,
			onOk: onOk
		});
	}

	/**
	 * This function will update the progress given a meta object file name and a percentage progress
	 *
	 * @param meta The meta object containing the percentage and file name
	 */
	updateProgressIndicator=(meta:{percent:number, currentFile:string})=>
	{
		if(!ProgressIndicator.hasTask(meta.currentFile) && meta.percent < 100)
			ProgressIndicator.addTask(meta.currentFile, null, "Extracting session " + meta.currentFile + ': ' + (meta.percent/100).toString());
		else if( meta.percent == 100)
			ProgressIndicator.removeTask(meta.currentFile);
		else
			ProgressIndicator.updateTask(meta.currentFile, meta.percent/100);
	};

    openFile=(e:any)=>
	{
		var files = e.target.files as FileList;
		for (let i = 0; i < files.length; i++)
			this.handleOpenedFile(files[i]);
    };

	/**
	 * TEMPORARY SOLUTION until we have a place to register file type handlers
	 * Ideally this list would be dynamically generated.
	 * @return An Array of FileFilter objects
	 */
	getSupportedFileTypes(dataFilesOnly:Boolean = false):string[]
	{
		var types = ['.csv', '.tsv', '.txt', '.shp', '.dbf', '.geojson', '.zip', '.json'];
		if (!dataFilesOnly)
			types.unshift('.weave');
		return types;
	}

	map_url_file = new Map<string, File>();
	
	load=(file_or_url:File|string, pushHistory:boolean = true):void=>
	{
		var url = typeof file_or_url === 'string' ? file_or_url as string : '';
		var file = Weave.AS(file_or_url, File) || this.map_url_file.get(url);
		if (file)
			url = 'local://' + file.name;
		
		this.fileName = String(url).split('/').pop();
		window.document.title = this.fileName ? Weave.lang("Weave: {0}", this.fileName) : Weave.lang("Weave");
		if (pushHistory)
			this.pushHistory(url);
		
		if (file)
		{
			this.map_url_file.set(url, file);
			this.handleOpenedFile(file);
		}
		else if (url)
		{
			var fileName = this.fileName;
			weavejs.WeaveAPI.URLRequestUtils
				.request(this.owner.weave.root, new URLRequest(url))
				.then((result) => {
					// this check attempts to invalidate old requests
					if (this.fileName == this.fileName)
						this.loadArchive(result);
				});
		}
		else
		{
			this.newSession();
		}
	}

	pushHistory(url:string):void
	{
		window.history.pushState(url, "", FileMenu.buildUrl(url));
		window.onpopstate = this.handleHistoryEvent;
	}
	
	handleHistoryEvent=(event:PopStateEvent)=>
	{
		this.load(event.state, false);
	}

	newSession=():void=>
	{
		var weave = this.owner.weave;
		
		weave.root.setSessionState([], true);
		
		for (var ilco of Weave.getDescendants(weave.root, ILinkableCompositeObject))
			ilco.setSessionState([], true);
		
		for (var keySet of Weave.getDescendants(weave.root, KeySet))
			keySet.clearKeys();
		
		weave.history.clearHistory();
		
		this.archive = null;
	}

	handleOpenedFile=(file:File, dataFilesOnly:Boolean = false)=>
	{
		let reader:FileReader = new FileReader();
		reader.onload = (event:any) => {
			this.handleOpenedFileContent(file.name, new Uint8Array(reader.result as ArrayBuffer), dataFilesOnly);
		};
		reader.readAsArrayBuffer(file);
	};

	loadArchive(fileContent:Uint8Array)
	{
		WeaveArchive.deserialize(fileContent, this.updateProgressIndicator).then((archive) => {
			this.archive = archive;
			archive.setSessionFromArchive(this.owner.weave);
			this.owner.onFileLoaded();
		});
	}

	public handleOpenedFileContent(fileName:string, fileContent:Uint8Array, dataFilesOnly:Boolean = false):void
	{
		var ext:String = String(fileName.split('.').pop()).toLowerCase();
		var dataSource:any;

		if (!dataFilesOnly && ext == 'weave')
		{
            this.loadArchive(fileContent);
			return;
		}

		/*if (ext == 'zip')
		{
			var files:Object = weave.flascc.readZip(fileContent);
			for (var fileName:String in files)
				handleOpenedFile(fileName, files[fileName], true);
			adsp = DraggablePanel.getStaticInstance(AddDataSourcePanel);
			if (adsp.parent)
				adsp.sendWindowToForeground();

			return;
		}*/

		var newDataSource = (type:typeof IDataSource):any =>
		{
			return dataSource = this.owner.weave.root.requestObject(fileName, type, false);
		};
		var getFileUrl = ():string =>
		{
			return WeaveAPI.URLRequestUtils.saveLocalFile(this.owner.weave.root, fileName, fileContent);
		};

		//Handling diff files with diff extensions
		if (ext == 'tsv' || ext == 'txt')
		{
			/*adsp = DraggablePanel.openStaticInstance(AddDataSourcePanel);
			adsp.dataSourceType = CSVDataSource;
			var csvEditor:CSVDataSourceEditor = adsp.editor as CSVDataSourceEditor;
			csvEditor.sourceName.text = fileName;
			csvEditor.keyTypeSelector.selectedKeyType = fileName;
			csvEditor.setText(fileContent.toString(), ext == 'tsv' ? '\t' : ',');*/
		}
		else if (ext == 'csv')
		{
			dataSource = newDataSource(CSVDataSource);
			dataSource.url.value = getFileUrl();
			dataSource.keyType.value = fileName;
		}
		else if (ext == 'xls')
		{
			/*var xls:XLSDataSource = newDataSource(XLSDataSource);
			xls.url.value = getFileUrl();
			xls.keyType.value = fileName;*/
		}
		/*else if (ext == 'shp' || ext == 'dbf')
		{
			adsp = DraggablePanel.openStaticInstance(AddDataSourcePanel);
			adsp.dataSourceType = DBFDataSource;
			var dbfEditor:DBFDataSourceEditor = adsp.editor as DBFDataSourceEditor;
			var fileNameWithoutExt:string = fileName.substr(0, -4);
			dbfEditor.sourceName.text = fileNameWithoutExt;
			dbfEditor.keyTypeSelector.selectedKeyType = fileNameWithoutExt;
			if (ext == 'shp')
				dbfEditor.shpURL.text = getFileUrl();
			else
				dbfEditor.dbfURL.text = getFileUrl();
			if (dbfEditor.shpURL.text && dbfEditor.dbfURL.text)
				adsp.addSource();
		}*/
		else if (ext == 'geojson' || ext == 'json')
		{
			dataSource = newDataSource(GeoJSONDataSource);
			dataSource.url.value = getFileUrl();//the callback here checks if it is a valid json object
			dataSource.keyType.value = fileName;
		}

		/*if (dataSource && !FileMenu.initTemplate(dataSource))
		{
			var dsm:DataSourceManager = DraggablePanel.openStaticInstance(DataSourceManager);
			dsm.selectDataSource(dataSource);
		}*/
	}

	private findDataSource<T extends (new()=>IDataSource)>(type:new(..._:any[])=>T, filter:(dataSource:T)=>boolean, create:boolean = false):T
	{
		var weave = this.owner.weave;
		var results = Weave.getDescendants(weave.root, type).filter(filter);
		var ds:T = results[0];
		if (!ds && create)
			return weave.root.requestObject('', type);
		return results[0];
	}

	static buildBaseUrl=()=>
	{
		return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ":" + window.location.port : ""}` +
			`${window.location.pathname}`;
	};

	static buildUrl=(url:String)=>
	{
		return FileMenu.buildBaseUrl() + `?file=${url}`;
	}

	private _saveToServer=(newFileName:string, overwrite:boolean = true) =>
	{
		var promise = WeaveArchive.serialize(this.owner.weave, this.updateProgressIndicator);
		promise.then(
			(result: Uint8Array)=>
			{
				weavejs.net.Admin.service.saveWeaveFile(new weavejs.util.JSByteArray(result), newFileName, overwrite);	
			},
			(error:any)=>
			{
				/* Call login window from here if auth error and retry, otherwise, display error. */
				console.error(error);
			}
		);
	};

	public saveToServer=()=>
	{
		this.saveDialog(this.fileName, this._saveToServer);
	};

	private _saveFile = (newFilename:string) => {
		var promise = WeaveArchive.serialize(this.owner.weave, this.updateProgressIndicator);
		promise.then(
			(result:Uint8Array)=>
			{
				var arrayBuffer: ArrayBuffer = result.buffer;
				FileSaver.saveAs(new Blob([arrayBuffer]), newFilename);
			}
		);
	};

    public saveFile=()=>
	{

		this.saveDialog(this.fileName, this._saveFile)
  	}
}

var ProgressIndicator = weavejs.WeaveAPI.ProgressIndicator;
