import * as React from "react";

export function dragAndDropHandler(fileHandler:(file:File) => void)
{
	return {
		onDragEnter: function(event:React.DragEvent)
		{
			event.stopPropagation();
			event.preventDefault();
		},
		
		onDragExit: function(event:React.DragEvent)
		{
			event.stopPropagation();
			event.preventDefault();
		},
		
		onDragOver: function(event:React.DragEvent)
		{
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		
		onDrop: function(event:React.DragEvent)
		{
			event.stopPropagation();
			event.preventDefault();
			
			var files = event.dataTransfer.files;
			var count = files.length;
			for(var i = 0; i < count; i++)
				fileHandler(files[i]);
		}
	}
}
