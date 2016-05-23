import WeaveArchive = weavejs.core.WeaveArchive;
export default class GoogleDrive{

	//private client_id:string = "377791640380-2ndttp4bqp4nos7u2lu145ntdg2iv90c.apps.googleusercontent.com"; // labs.asanjay && localhost
	private client_id:string = "208900843936-snff2d0hjejp3bm7lki60p11thu79mpl.apps.googleusercontent.com"; // localhost
	private scopes:string[] = [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile'
	];

	private boundary:string = '-------314159265358979323846';
	private delimiter:string;
	private close_delim:string;
	private activeFileID:string;
	private openedFileUrl:string;
	private checkAuthCallCount:number = 0;
	private expires_in_millisecs:number;

	constructor(callback:Function)
	{
		this.delimiter =  "\r\n--" + this.boundary + "\r\n";
		this.close_delim = "\r\n--" + this.boundary + "--";
		this.authorize(callback);
	}

	authorize=(callback:Function)=>
	{
		let immediateValue:boolean = true;
		if(this.checkAuthCallCount == 0)
			immediateValue = false;
		this.checkAuthCallCount++;
		(window as any).gapi.auth.authorize({
			'client_id':this.client_id,
			'scope':this.scopes.join(' '),
			'immediate':immediateValue //token is refreshed behind the scenes, and no UI is shown to the user if true.
		},this.handleAuthResult.bind(this,callback))
	}

	/**
	 * Step 2: Load the Google drive API
	 * Called when authorization server replies.
	 * authResult -  Authorization result.
	 */
	private handleAuthResult = (callback:Function,authResult:any)=>
	{
		if (authResult && !authResult.error)
		{
			this.expires_in_millisecs = authResult.expires_in * 1000;
			(window as any).gapi.client.load('drive', 'v3', this.handleClientLoad.bind(this,callback));
		} else {

		}

	}




	private handleClientLoad=(callback:Function)=>
	{
		// call for authorization 1 minute before token expiry time
		window.setTimeout(this.authorize, this.expires_in_millisecs - 60000);
		this.getWeaveFiles(callback);

		//this.readStateObject();
	}

	getWeaveFiles=(callback:Function)=>{
		var result:any[] = [];

		//and mimeType = 'application/x-zip'
		var request = (window as any).gapi.client.drive.files.list({
			'q': " name contains '.weave' and mimeType = 'application/x-zip' ",
			'fields': 'files,kind'
		});
		request.execute(function(resp:any) {
			result = result.concat(resp.files);
			callback(result);
		});
	}

	private readStateObject=()=>
	{
		let paramObj:any = this.getParams();
		let stateJson = paramObj['state'];
		let jsonObj = JSON.parse(stateJson);
		if (jsonObj && jsonObj.action == 'open') {
			this.activeFileID = jsonObj.ids[0];
			this.loadWeaveFile(this.activeFileID,null);
		} else {
			this.requestWeaveFile();
		}
	}

	private getParams=():any=>
	{
		let params:any = {};
		let queryString:string = window.location.search;
		if (queryString) {
			let paramStrs:string[] = queryString.slice(1).split("&");
			for (let i:number = 0; i < paramStrs.length; i++) {
				var paramStr:string[] = paramStrs[i].split("=");
				params[paramStr[0]] = (window as any).unescape(paramStr[1]);
			}
		}
		return params;
	}

	loadWeaveFile=(fileId:string,callback:Function)=>
	{
		
		// Step 3: Assemble the API request
		// gapi.client.drive.files.get this API function can be used only from server
		// and using webcontentLink the file can be downloaded , from client side we will face Cross origin issue
		//  for client side we have to manually call the url with ?alt=media query
		var urlObject = {
			"url": "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media",
			"requestHeaders": {
				"Authorization": "Bearer " + (window as any).gapi.auth.getToken().access_token
			}
		};
		callback(urlObject);


	}

	requestWeaveFile = (fileID:string = null)=>
	{
		let request = this.getClientRequest(this.generateWeaveArchive(), 'POST', this.generateWeaveFileMetadata(true),fileID);
		request.execute(this.saveFileID);
	}






	private saveFileID=(file:any)=>
	{
		this.activeFileID = file.id;
	}

	private generateWeaveFileMetadata =(isNewFile:boolean)=>
	{
		var rawBase64:string = null
			//weave.evaluateExpression(null, 'getBase64Image(Application.application)', null, ['weave.utils.BitmapUtils', 'mx.core.Application']);
		var thumbnailData = rawBase64.replace(/\+/g, '-').replace(/\//g, '_');
		var indexableTextArray:string[] = this.getIndexableText();
		var indexableText = indexableTextArray.join();
		var metadata:any;
		if (isNewFile) {
			metadata = {
				'title': "test",
				'mimeType': 'application/octet-stream',
				'thumbnail': {
					'image': thumbnailData,
					'mimeType': 'image/png'
				},
				"indexableText": {
					"text": indexableText
				}
			};
		} else {
			metadata = {
				'thumbnail': {
					'image': thumbnailData,
					'mimeType': 'image/png'
				},
				"indexableText": {
					"text": indexableText
				}
			};
		}

		return metadata;
	}

	private generateWeaveArchive=():string=>
	{
		return "";
	}

	private getClientRequest=(base64Data:string,requestMethod:string,fileMetadata:any,fileID:string = null):any=>
	{
		let path:string = '/upload/drive/v3/files';
		let params:any = {
			'uploadType': 'multipart'
		};
		if (fileID && requestMethod == 'PUT') {
			path = path + '/' + fileID;
			params = {
				'uploadType': 'multipart',
				'alt': 'json'
			};
		}

		var multipartRequestBody = this.delimiter + 'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(fileMetadata) +
			this.delimiter + 'Content-Type: ' + 'application/octet-stream' + '\r\n' +
			'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + this.close_delim;
		var request = (window as any).gapi.client.request({
			'path': path,
			'method': requestMethod,
			'params': params,
			'headers': {
				'Content-Type': 'multipart/mixed; boundary="' + this.boundary + '"'
			},
			'body': multipartRequestBody
		});
		return request;
	}

	private getIndexableText=():string[]=>
	{
		return [];
	}

}