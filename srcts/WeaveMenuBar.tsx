import * as React from "react";
import MenuBar from "./react-ui/MenuBar/MenuBar";
import MenuBarItem from "./react-ui/MenuBar/MenuBarItem";

export interface WeaveMenuBarProps extends React.Props<WeaveMenuBar> {
	weave:Weave
}

export interface WeaveMenuBarState {
	
}

function weaveMenu(weave:Weave)
{
    return {
		label: "Weave",
		bold: true,
		menu: [
			{
				label: "Preferences...",
				click: () => {}
			},
			{
				label: "Edit Session State",
				click: () => {},
				menu: [
					{
						label: "Nested",
						click: () => { console.log("I'm a child") }
					}
				]
			},
			{
			},
			{
				label: "Report a problem",
				click: () => {}
			},
			{
				label: "Visit iWeave.com",
				click: () => {}
			},
			{
				label: "Visit Weave Wiki",
				click: () => {}
			},
			{
			},
			{
				label: "Version: 2.0",
				click: () => {}
			}, 
			{
			},
			{
				label: "Restart",
				click: () => {}
			}
		]
	};
}

function fileMenu(weave:Weave)
{

    function openFile(e:any) {
        // const selectedfile:File = e.target.files[0];
        // new Promise(function (resolve:any, reject:any) {
        //         let reader:FileReader = new FileReader();
        //         reader.onload = function (event:Event) {
        //             resolve([event, selectedfile]);
        //         };
        //         reader.readAsArrayBuffer(selectedfile);
        //     })
        //     .then(function (zippedResults:any) {
        //         var e:any = zippedResults[0];
        //         var result:any = e.target.result;
        //         weavejs.core.WeaveArchive.loadFileContent(weave,result);
        //     });
    }
    
    function saveFile()
	{
        // var archive:any  = weavejs.core.WeaveArchive.createArchive(weave)
        // var uint8Array:any = archive.serialize();
        // var arrayBuffer:any  = uint8Array.buffer;
        // window.saveAs(new Blob([arrayBuffer]), "test.weave");
  	}

    return {
		label: "File",
		menu: [
			{
				label: <input type="file" onChange={openFile}/>,
                click: () => {}
			},
			{
				label: Weave.lang("Save as..."),
				click: () => {}
			},
			{
				label: "Export CSV",
				click: () => { console.log("clicked on Export CSV") }
			}
		]
	};
}

function dataMenu(weave:Weave) 
{
	return {
		label: "Data",
		menu: [
			{
				label: "Manage or browse data",
				click: () => { console.log("Manage or browse data") }
			},
			{
			},
			{
				label: "Add CSV DataSource",
				click: () => { console.log("Add CSV DataSource") }
			}
		]
	};
}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
	}
    
    
	
	render():JSX.Element
	{
        var weave = this.props.weave;
		return (
			<MenuBar className="weave-menubar" style={{width: "100%"}} config={[
				weaveMenu(weave),
				fileMenu(weave),
				dataMenu(weave)
			]}>
			</MenuBar>
		)
	}
	
}
