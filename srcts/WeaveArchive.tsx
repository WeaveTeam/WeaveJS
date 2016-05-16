import * as _ from "lodash";
import JSZip from "./modules/jszip";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeaveAPI = weavejs.WeaveAPI;
import AttributeColumnCache = weavejs.data.AttributeColumnCache;
import URLRequest = weavejs.net.URLRequest;
import BackwardsCompatibility = weavejs.util.BackwardsCompatibility;
import JSByteArray = weavejs.util.JSByteArray;
import WeavePromise = weavejs.util.WeavePromise;

export type UpdateCallback = (meta: { percent: number, currentFile: string }) => void;

export default class WeaveArchive {
	private static FOLDER_AMF = "weave-amf";
	private static FOLDER_JSON = "weave-json";
	private static FOLDER_FILES = "weave-files";

	files = new Map<string, Uint8Array>();
	objects = new Map<string, Object>();

	/*private*/ constructor(weave?:Weave)
	{
		if (weave)
		{
			for (let fileName of WeaveAPI.URLRequestUtils.getLocalFileNames(weave.root))
			{
				this.files.set(fileName, WeaveAPI.URLRequestUtils.getLocalFile(weave.root, fileName));
			}

			this.objects.set(WeaveArchive.ARCHIVE_HISTORY_JSON, weave.history.getSessionState());

			let columnCache = ((WeaveAPI.AttributeColumnCache as AttributeColumnCache).map_root_saveCache as WeakMap<any, Object>).get(weave.root);
			if (columnCache)
				this.objects.set(WeaveArchive.ARCHIVE_COLUMN_CACHE_JSON, columnCache);
		}
	}

	private jsonOnFulfilled(fileName:string, result:string):void
	{
		this.objects.set(fileName, JSON.parse(result));
	}

	private amfOnFulfilled(fileName:string, result:Uint8Array):void
	{
		this.objects.set(fileName, (new JSByteArray(result)).readObject());
	}

	private fileOnFulfilled(fileName:string, result:Uint8Array):void
	{
		this.files.set(fileName, result);
	}

	static deserialize(byteArray: Uint8Array, updateCallback?: UpdateCallback)
	{
		let archive = new WeaveArchive();
		return archive.deserialize(byteArray, updateCallback);
	}

	private deserialize(byteArray: Uint8Array, updateCallback?: UpdateCallback): Promise<WeaveArchive>
	{
		let zip = (new JSZip());
		return (new JSZip()).loadAsync(byteArray, {}).then(
			(zip) => {
				let promises: Array<Promise<void>> = [];
				for (let filePath in zip.files)
				{
					let file = zip.files[filePath];

					if (file.dir) continue;

					let fileName = filePath.substr(filePath.indexOf('/') + 1);
					let promise: Promise<void>;
					let updateCallbackWrapper = updateCallback ? (meta:{percent: number, currentFile: string}) => { meta.currentFile = fileName; updateCallback(meta); } : null;

					if (filePath.indexOf(WeaveArchive.FOLDER_JSON + '/') == 0)
					{
						promise = file.async("string", updateCallbackWrapper).then((result) => this.jsonOnFulfilled(fileName, result as string));
					}
					else if (filePath.indexOf(WeaveArchive.FOLDER_AMF + '/') == 0)
					{
						promise = file.async("Uint8Array", updateCallbackWrapper).then((result) => this.amfOnFulfilled(fileName, result as Uint8Array));
					}
					else
					{
						promise = file.async("Uint8Array", updateCallbackWrapper).then((result) => this.fileOnFulfilled(fileName, result as Uint8Array));
					}
					promises.push(promise);
				}
				return Promise.all(promises).then(():WeaveArchive => this);
			}
		);
	}

	private serialize(updateCallback?: UpdateCallback): Promise<Uint8Array>
	{
		let zip = new JSZip();
		let name: string;
		let folder: JSZip;
		
		folder = zip.folder(WeaveArchive.FOLDER_FILES);
		for (let [name, content] of this.files)
		{
			folder.file(name, content);
		}

		folder = zip.folder(WeaveArchive.FOLDER_JSON);
		for (let [name, object] of this.objects)
		{
			folder.file(name, JSON.stringify(object, null, '\t'));
		}

		return zip.generateAsync({ compression: "DEFLATE", type: 'uint8array' }, updateCallback);
	}

	static serialize(weave: Weave, updateCallback?: UpdateCallback)
	{
		let promise = new WeaveArchive(weave).serialize(updateCallback);
		let weavePromise = new WeavePromise<Uint8Array>(weave.root);

		promise.then((data) => weavePromise.setResult(data), (error) => weavePromise.setError(error));

		return weavePromise;
	}

	static ARCHIVE_HISTORY_AMF = "history.amf";
	static ARCHIVE_HISTORY_JSON = "history.json";
	static ARCHIVE_COLUMN_CACHE_AMF = "column-cache.amf";
	static ARCHIVE_COLUMN_CACHE_JSON = "column-cache.json";

	private setSessionFromArchive(weave:Weave)
	{
		let historyJSON = this.objects.get(WeaveArchive.ARCHIVE_HISTORY_JSON);
		let historyAMF = this.objects.get(WeaveArchive.ARCHIVE_HISTORY_AMF);
		
		if (historyJSON)
			weave.history.setSessionState(historyJSON);
		else if (historyAMF)
			weave.history.setSessionState(BackwardsCompatibility.updateSessionState(historyAMF));
		else
			throw new Error("No session history found.");

		let columnCache: Object = this.objects.get(WeaveArchive.ARCHIVE_COLUMN_CACHE_AMF) || this.objects.get(WeaveArchive.ARCHIVE_COLUMN_CACHE_JSON);
		(WeaveAPI.AttributeColumnCache as AttributeColumnCache).restoreCache(weave.root, columnCache);

		for (let [name, content] of this.files)
		{
			WeaveAPI.URLRequestUtils.saveLocalFile(weave.root, name, content);
		}

		for (let fileName of WeaveAPI.URLRequestUtils.getLocalFileNames(weave.root))
		{
			if (!this.files.has(fileName))
			{
				WeaveAPI.URLRequestUtils.removeLocalFile(weave.root, fileName);
			}
		}
	}

	static setWeaveSessionFromContent(weave:Weave, byteArray: Uint8Array, updateCallback?: UpdateCallback)
	{
		return WeaveArchive.deserialize(byteArray, updateCallback).then((archive) => archive.setSessionFromArchive(weave));
	}

	static loadUrl(weave: Weave, url: string, updateCallback?: UpdateCallback): WeavePromise<void>
	{
		return WeaveAPI.URLRequestUtils.request(weave.root, new URLRequest(url))
			.then((result) => WeaveArchive.setWeaveSessionFromContent(weave, result, updateCallback));
	}
}
