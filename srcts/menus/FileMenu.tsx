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

import WeaveArchive = weavejs.core.WeaveArchive;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;

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
	
	get menu():MenuItemProps[]
	{
		return [
			{
				label: <FileInput onChange={this.openFile}>{Weave.lang("Open a File...")}</FileInput>
			},
			{
				label: Weave.lang("Save As..."),
				click: this.saveFile
			},
			{},
			{
				enabled: this.getColumnsToExport().length > 0,
				label: Weave.lang("Export CSV"),
				click: this.exportCSV
			}
		];
	}

    openFile=(e:any)=>
	{
        const selectedFile:File = e.target.files[0];
		this.fileName = selectedFile.name;
        new Promise((resolve:any, reject:any) => {
            let reader:FileReader = new FileReader();
            reader.onload = (event:Event) => {
                resolve([event, selectedFile]);
            };
            reader.readAsArrayBuffer(selectedFile);
        })
        .then((zippedResults:any) => {
            var e:any = zippedResults[0];
            var result:any = e.target.result;
            WeaveArchive.loadFileContent(this.weave, result);
        });
    }
	
	loadUrl(url:string)
	{
		this.fileName = String(url).split('/').pop();
		return WeaveArchive.loadUrl(this.weave, this.fileName);
	}

	private dropExtension(fileName:string)
	{
		if (!fileName)
			fileName = '';
		var i = fileName.lastIndexOf(".weave");
		return i < 0 ? fileName : fileName.substr(0, i);
	}

    saveFile=()=>
	{
		var defaultFileName:string = 'defaults.weave';
		var filenameInput:HTMLInputElement;
		if (!this.fileName)
			this.fileName = defaultFileName;

		var setShowTopMenuBar = (checked:boolean) =>
		{
			var wp = this.weave.requestObject(['WeaveProperties'], LinkableHashMap);
			var enableMenuBar = wp.requestObject('enableMenuBar', LinkableBoolean);
			enableMenuBar.value = checked;
		}
		
		var setSaveHistory = (checked:boolean) =>
		{
			console.log("Save history");
		}
		

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
		
		var allOptions:Function[] = checkboxListOptions.map(opt => opt.value);
		var selectedOptions:Function[] = allOptions;
		var onOk = () => {
			for (var option of allOptions)
			{
				option.call(this, selectedOptions.indexOf(option) >= 0);
			}
			var archive:WeaveArchive  = WeaveArchive.createArchive(this.weave)
			var uint8Array:Uint8Array = archive.serialize();
			var arrayBuffer:ArrayBuffer  = uint8Array.buffer;
			FileSaver.saveAs(new Blob([arrayBuffer]), (filenameInput.value && filenameInput.value + ".weave") || defaultFileName);
		}
		
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
							placeholder={this.dropExtension(defaultFileName)}
							defaultValue={this.dropExtension(this.fileName)}
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

	getColumnsToExport=()=>
	{
		var columnSet = new Set<weavejs.api.data.IAttributeColumn>();
		for (var rc of Weave.getDescendants(this.weave.root, weavejs.data.column.ReferencedColumn))
		{
			var col = rc.getInternalColumn();
			if (col && col.getMetadata(weavejs.api.data.ColumnMetadata.DATA_TYPE) != weavejs.api.data.DataType.GEOMETRY)
				columnSet.add(col)
		}
		return weavejs.util.JS.toArray(columnSet.values());
	}

	exportCSV=()=>
	{
		var columns = this.getColumnsToExport();
		var filter = Weave.AS(this.weave.getObject('defaultSubsetKeyFilter'), weavejs.api.data.IKeyFilter);
		var csv = weavejs.data.ColumnUtils.generateTableCSV(columns, filter);	
		FileSaver.saveAs(new Blob([csv]), "Weave-data-export.csv");
	}
}
