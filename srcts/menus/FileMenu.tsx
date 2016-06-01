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
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IDataSource = weavejs.api.data.IDataSource;
import StandardLib = weavejs.util.StandardLib;

export default class FileMenu implements MenuBarItemProps
{
	constructor(weave:Weave)
	{
		this.weave = weave;
	}

	weave:Weave;
	label = "File";
	bold = false;
	fileName:string;
	archive:WeaveArchive;
	
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
			var wp = this.weave.requestObject(['WeaveProperties'], LinkableHashMap);
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

	get menu():MenuItemProps[]
	{
		return [
			{
				label: <FileInput onChange={this.openFile} accept={this.getSupportedFileTypes().join(',')}><span className="weave-menuitem-padding">{Weave.lang("Open...")}</span></FileInput>
			},
			{
				label: Weave.lang("Save As..."),
				click: this.saveFile
			},
			{},
		];
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
		var types = ['.csv', '.tsv', '.txt', '.shp', '.dbf', '.geojson', '.zip'];
		if (!dataFilesOnly)
			types.unshift('.weave');
		return types;
	}

	handleOpenedFile=(file:File, dataFilesOnly:Boolean = false)=>
	{
		let reader:FileReader = new FileReader();
		reader.onload = (event:any) => {
			this.handleOpenedFileContent(file.name, event.target.result, dataFilesOnly);
		};
		reader.readAsArrayBuffer(file);
	};

	public handleOpenedFileContent(fileName:string, fileContent:Uint8Array, dataFilesOnly:Boolean = false):void
	{
		var ext:String = String(fileName.split('.').pop()).toLowerCase();
		var dataSource:any;

		if (!dataFilesOnly && ext == 'weave')
		{
            WeaveArchive.deserialize(fileContent, this.updateProgressIndicator).then((archive) => {
	            this.archive = archive;
	            archive.setSessionFromArchive(this.weave);
            });
			return;
		}

//		if (ext == 'zip')
//		{
//			var files:Object = weave.flascc.readZip(fileContent);
//			for (var fileName:String in files)
//				handleOpenedFile(fileName, files[fileName], true);
//
//			adsp = DraggablePanel.getStaticInstance(AddDataSourcePanel);
//			if (adsp.parent)
//				adsp.sendWindowToForeground();
//
//			return;
//		}
//
//		function newDataSource(type:Class):any
//		{
//			return dataSource = WeaveAPI.globalHashMap.requestObject(fileName, type, false);
//		}
//		function getFileUrl():String
//		{
//			return WeaveAPI.URLRequestUtils.saveLocalFile(fileName, fileContent);
//		}
//
//		if (ext == 'tsv' || ext == 'txt')
//		{
//			adsp = DraggablePanel.openStaticInstance(AddDataSourcePanel);
//			adsp.dataSourceType = CSVDataSource;
//			var csvEditor:CSVDataSourceEditor = adsp.editor as CSVDataSourceEditor;
//			csvEditor.sourceName.text = fileName;
//			csvEditor.keyTypeSelector.selectedKeyType = fileName;
//			csvEditor.setText(fileContent.toString(), ext == 'tsv' ? '\t' : ',');
//		}
//		else if (ext == 'csv')
//		{
//			var csv:CSVDataSource = newDataSource(CSVDataSource);
//			csv.url.value = getFileUrl();
//			csv.keyType.value = fileName;
//		}
//		else if (ext == 'xls')
//		{
//			var xls:XLSDataSource = newDataSource(XLSDataSource);
//			xls.url.value = getFileUrl();
//			xls.keyType.value = fileName;
//		}
//		else if (ext == 'shp' || ext == 'dbf')
//		{
//			adsp = DraggablePanel.openStaticInstance(AddDataSourcePanel);
//			adsp.dataSourceType = DBFDataSource;
//			var dbfEditor:DBFDataSourceEditor = adsp.editor as DBFDataSourceEditor;
//			var fileNameWithoutExt:string = fileName.substr(0, -4);
//			dbfEditor.sourceName.text = fileNameWithoutExt;
//			dbfEditor.keyTypeSelector.selectedKeyType = fileNameWithoutExt;
//			if (ext == 'shp')
//				dbfEditor.shpURL.text = getFileUrl();
//			else
//				dbfEditor.dbfURL.text = getFileUrl();
//			if (dbfEditor.shpURL.text && dbfEditor.dbfURL.text)
//				adsp.addSource();
//		}
//		else if (ext == 'geojson')
//		{
//			var geojson:GeoJSONDataSource = newDataSource(GeoJSONDataSource);
//			geojson.url.value = getFileUrl();
//			geojson.keyType.value = fileName;
//		}
//
//		if (dataSource && !FileMenu.initTemplate(dataSource))
//		{
//			var dsm:DataSourceManager = DraggablePanel.openStaticInstance(DataSourceManager);
//			dsm.selectDataSource(dataSource);
//		}
	}

	private findDataSource<T extends (new()=>IDataSource)>(type:new(..._:any[])=>T, filter:(dataSource:T)=>boolean, create:boolean = false):T
	{
		var results = Weave.getDescendants(this.weave.root, type).filter(filter);
		var ds:T = results[0];
		if (!ds && create)
			return this.weave.root.requestObject('', type);
		return results[0];
	}

	static buildUrl=(url:String)=>
	{
		return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ":" + window.location.port : ""}` +
			`${window.location.pathname}?file=${url}`;
	}

	handleHistoryEvent=(event:PopStateEvent)=>
	{
		if (event.state)
		{
			this.loadUrl(event.state);
		}
	}

	loadUrl=(url:string, pushHistory = false)=>
	{
		this.fileName = String(url).split('/').pop();

		if (pushHistory)
		{
			history.pushState(url, "", FileMenu.buildUrl(url));
			window.onpopstate = this.handleHistoryEvent;
		}

		WeaveArchive.loadUrl(this.weave, String(url), this.updateProgressIndicator);
	};

	private _adminConsole: any;
	private get adminConsole():any
	{
		try {
			if (!this._adminConsole) {
				if (window.opener) {
					this._adminConsole = window.opener.document.getElementById("AdminConsole");
				}
			}
		}
		catch (e)
		{
			console.error(e);
		}

		return this._adminConsole;
	}

	pingAdminConsole():boolean
	{
		return !!this.adminConsole;
	}

	private _saveToServer=(newFileName:string, overwrite:boolean = true) =>
	{
		if (this.adminConsole)
		{
			var promise = WeaveArchive.serialize(this.weave, this.updateProgressIndicator);
			promise.then(
				(result: Uint8Array)=>
				{
					let archive = StandardLib.byteArrayToString(result);
					this.adminConsole.saveWeaveFile(btoa(archive), newFileName, overwrite);
				}
			);
		}
	};

	public saveToServer=()=>
	{
		this.saveDialog(this.fileName, this._saveToServer);
	};

	private _saveFile = (newFilename:string) => {
		var promise = WeaveArchive.serialize(this.weave, this.updateProgressIndicator);
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
