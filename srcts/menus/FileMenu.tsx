import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import PopupWindow from "../react-ui/PopupWindow";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import FileInput from "../react-ui/FileInput";
import {ICheckBoxListProps} from "../react-ui/CheckBoxList";
import CheckBoxList from "../react-ui/CheckBoxList";
import * as FileSaver from "filesaver.js";
import LinkableTextField from "../ui/LinkableTextField";

import WeaveArchive = weavejs.core.WeaveArchive;

export default class FileMenu implements MenuBarItemProps
{
	label: string = "File";
	weave:Weave;
	menu: MenuItemProps[] = [
		{
			label: <FileInput onChange={this.openFile.bind(this)}>{Weave.lang("Open a file...")}</FileInput> as any
		},
		{
			label: Weave.lang("Save as..."),
			click: this.saveFile.bind(this)
		},
		{
			label: Weave.lang("Export CSV"),
			click: this.exportCSV.bind(this)
		}
	];

	bold: boolean = false;
	
	constructor(weave:Weave)
	{
		this.weave = weave;
	}

    openFile(e:any) 
	{
        const selectedfile:File = e.target.files[0];
        new Promise((resolve:any, reject:any) => {
                let reader:FileReader = new FileReader();
                reader.onload = (event:Event) => {
                    resolve([event, selectedfile]);
                };
                reader.readAsArrayBuffer(selectedfile);
            })
            .then((zippedResults:any) => {
                var e:any = zippedResults[0];
                var result:any = e.target.result;
                weavejs.core.WeaveArchive.loadFileContent(this.weave, result);
            });
    }
	    
    saveFile()
	{
		var filenameInput:HTMLInputElement;

		var setShowTopMenuBar = () =>
		{
			console.log("show top menu bar called");
		}
		
		var setSaveHistory = () =>
		{
			console.log("Save history");
		}
		

		var checkboxListOptions = [
			{
				value: setShowTopMenuBar,
				label: Weave.lang("Show top menu bar")
			},
			{
				value: setSaveHistory,
				label: Weave.lang("Save history")
			}
		];
		
		var selectedOptions:Function[] = [setShowTopMenuBar, setSaveHistory];
		var onOk = () => {
			for(var option of selectedOptions)
			{
				option.call(this);
			}
			var archive:WeaveArchive  = weavejs.core.WeaveArchive.createArchive(this.weave)
			var uint8Array:Uint8Array = archive.serialize();
			var arrayBuffer:ArrayBuffer  = uint8Array.buffer;
			FileSaver.saveAs(new Blob([arrayBuffer]), filenameInput.value || "defaults.weave");
		}
		
		PopupWindow.open({
			title: "Export session state",
			content: (
				<VBox style={{width: 400, height: 300, padding: 20}}>
					<span>{Weave.lang("Enter a file name")}</span>
					<input style={{marginTop: 5}} type="text" placeholder="defaults.weave" ref={(c:HTMLInputElement) => filenameInput = c}/>
					<span style={{marginTop: 5}}>{Weave.lang("Export options")}</span>
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
			modal: true,
			onOk: onOk
		});
  	}

	exportCSV()
	{
		PopupWindow.open({
			title: "Export CSV",
			content: <div style={{width: 300, height: 300}}>I am a save file dialog</div>,
			modal: false
		});
		// var archive:any  = weavejs.core.WeaveArchive.createArchive(weave)
		// var uint8Array:any = archive.serialize();
		// var arrayBuffer:any  = uint8Array.buffer;
		// FileSaver.saveAs(new Blob([arrayBuffer]), "test.weave");
	}
}
