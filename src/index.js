import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import WeaveApp from "../lib/WeaveApp";
import {MiscUtils} from "../lib/WeaveUI.js";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

var CLIENT_ID = "104550352073-c5f8vms25vmbpgma7sjpdcn88rbrj0tb.apps.googleusercontent.com";
var urlParams = MiscUtils.getUrlParams();
var hashParams = MiscUtils.getHashParams();
var layoutName = urlParams.layout || 'Layout';
var weave = window.weave;
if (weave)
{
	render();
}
else
{
	window.weave = weave = new Weave();
	var weaveExternalTools = window.opener && window.opener.WeaveExternalTools;
	if (urlParams.file)
	{
		// read from url
		weavejs.core.WeaveArchive.loadUrl(weave, urlParams.file).then(render);
	}
	else if (weaveExternalTools && weaveExternalTools[window.name])
	{
		// read content from flash
		var ownerPath = weaveExternalTools[window.name].path;
		var content = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())'));
		weavejs.core.WeaveArchive.loadFileContent(weave, content);
		render();
	}
	else if (urlParams.driveFileId)
	{
		var nonceBytes = new Uint8Array(8);
		window.crypto.getRandomValues(nonceBytes);
		var nonce = Array.from(nonceBytes).map((n)=> new Number(n).toString(16)).join("");
		window.sessionStorage.setItem('weave#nonce', nonce);
		var params = MiscUtils.makeUrlParams({
			response_type: "token",
			client_id: CLIENT_ID,
			state: urlParams.driveFileId,
			redirect_uri: window.location.protocol+"//"+window.location.hostname+window.location.pathname,
			scope: "https://www.googleapis.com/auth/drive.readonly"
		});

		window.location.replace("https://accounts.google.com/o/oauth2/v2/auth?" + params);
	}
	else if (hashParams.access_token /* && hashParams.nonce == window.sessionStorage.getItem('weave#nonce') */)
	{
		window.location.hash = "";
		var req = new XMLHttpRequest();
		req.open("GET", "https://www.googleapis.com/drive/v3/files/" + hashParams.state + "?alt=media");
		req.responseType = "arraybuffer";
		req.setRequestHeader("Authorization", hashParams.token_type + " " + hashParams.access_token);

		req.onreadystatechange = function() {
			if (req.readyState == XMLHttpRequest.DONE)
			{
				weavejs.core.WeaveArchive.loadFileContent(weave, new Uint8Array(req.response));
				render();
			}
		}

		req.send();
	}
	else
	{
		render();
	}
}

function render()
{
	$(() => {
		var layout = weave.root.requestObject(layoutName, Weave.getDefinition("FlexibleLayout"));
		ReactDOM.render(<WeaveApp layout={layout} style={{width: "100%", height: "100%"}}/>, document.getElementById("weaveElt"));
	});
}
