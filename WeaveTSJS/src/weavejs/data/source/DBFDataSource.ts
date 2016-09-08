/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.data.source
{
	import DbfField = org.vanrijkom.dbf.DbfField;
	import DbfHeader = org.vanrijkom.dbf.DbfHeader;
	import DbfRecord = org.vanrijkom.dbf.DbfRecord;
	import DbfTools = org.vanrijkom.dbf.DbfTools;

	import WeaveAPI= weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableString = weavejs.core.LinkableString;
	import DateColumn = weavejs.data.column.DateColumn;
	import GeometryColumn = weavejs.data.column.GeometryColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import ShpFileReader = weavejs.geom.ShpFileReader;
	import URLRequest = weavejs.net.URLRequest;
	import URLRequestUtils = weavejs.net.URLRequestUtils;
	import JSByteArray = weavejs.util.JSByteArray;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	export interface IDBFColumnMetadata extends IColumnMetadata {
		name?:string;
		the_geom?:string;
	}
	/**
	 * @author adufilie
	 */
	export class DBFDataSource extends AbstractDataSource implements IDataSource
	{
		static WEAVE_INFO = Weave.setClassInfo(DBFDataSource, {
			id: "weavejs.data.source.DBFDataSource",
			label: "SHP/DBF files",
			interfaces: [IDataSource]
		});

		static THE_GEOM_COLUMN = "the_geom";

		/**
		 * Hack until dbfUrl and shpUrl are turned into LinkableFiles;
		 */
		private hack_urlIsLocal(url:string):boolean
		{
			if(Weave.IS(url, String))
				return url.startsWith(URLRequestUtils.LOCAL_FILE_URL_SCHEME);
			return !url;
		}

		/* override */ get isLocal():boolean
		{
			return this.hack_urlIsLocal(this.dbfUrl.value) && this.hack_urlIsLocal(this.shpUrl.value);
		}

		/* override */ getLabel()
		{
			return this.label.value || (this.shpUrl.value || this.dbfUrl.value || '').split('/').pop() || super.getLabel();
		}

		/* override */ protected get initializationComplete():boolean
		{
			// make sure everything is ready before column requests get handled.
			return super.initializationComplete
				&& this.dbfData
				&& (!this.shpfile || this.shpfile.geomsReady);
		}

		/* override */ protected uninitialize():void
		{
			super.uninitialize();
			if (Weave.detectChange(this.uninitializeObserver, this.dbfUrl))
			{
				this.dbfData = null;
				this.dbfHeader = null;
			}
			if (Weave.detectChange(this.uninitializeObserver, this.shpUrl))
			{
				if (this.shpfile)
					Weave.dispose(this.shpfile);
				this.shpfile = null;
			}
		}
		private uninitializeObserver=this.uninitialize.bind(this);

		/* override */ protected initialize(forceRefresh:boolean = false):void
		{
			if (Weave.detectChange(this.initializeObserver, this.dbfUrl) && this.dbfUrl.value)
				WeaveAPI.URLRequestUtils.request(this, new URLRequest(this.dbfUrl.value))
					.then(this.handleDBFDownload.bind(this, this.dbfUrl.value), this.handleDBFDownloadError.bind(this, this.dbfUrl.value));
			if (Weave.detectChange(this.initializeObserver, this.shpUrl) && this.shpUrl.value)
				WeaveAPI.URLRequestUtils.request(this, new URLRequest(this.shpUrl.value))
					.then(this.handleShpDownload.bind(this, this.shpUrl.value), this.handleShpDownloadError.bind(this, this.shpUrl.value));

			// recalculate all columns previously requested because data may have changed.
			super.initialize(true);
		}
		private initializeObserver = this.initialize.bind(this);

		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ keyColName:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ dbfUrl:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ shpUrl:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ projection:LinkableString = Weave.linkableChild(this, LinkableString);

		private dbfData:JSByteArray = null;
		private dbfHeader:DbfHeader = null;
		private shpfile:ShpFileReader = null;

		private getGeomColumnTitle():string
		{
			return Weave.lang("{0} geometry", this.getLabel());
		}

		/**
		 * Called when the DBF file is downloaded from the URL
		 */
		private handleDBFDownload(url:string, result:Uint8Array):void
		{
			// ignore outdated results
			if (Weave.wasDisposed(this) || url != this.dbfUrl.value)
				return;

			this.dbfData = new JSByteArray(result);
			if (this.dbfData.length == 0)
			{
				this.dbfData = null;
				console.error("Zero-byte DBF: " + this.dbfUrl.value);
			}
			else
			{
				try
				{
					this.dbfData.position = 0;
					this.dbfHeader = new DbfHeader(this.dbfData);
				}
				catch (e)
				{
					this.dbfData = null;
					console.error(e);
				}
			}
			Weave.getCallbacks(this).triggerCallbacks();
		}

		/**
		 * Gets the root node of the attribute hierarchy.
		 */
		/* override */ public getHierarchyRoot()
		{
			if (!Weave.IS(this._rootNode, DBFColumnNode))
				this._rootNode = new DBFColumnNode(this);
			return this._rootNode;
		}

		/* override */ protected generateHierarchyNode(metadata:IDBFColumnMetadata):IWeaveTreeNode
		{
			if (!metadata)
				return null;

			var root = Weave.AS(this.getHierarchyRoot, DBFColumnNode);
			if (!root)
				return super.generateHierarchyNode(metadata);

			if (metadata.name)
				return new DBFColumnNode(this, metadata.name);

			return null;
		}

		/**
		 * Called when the Shp file is downloaded from the URL
		 */
		private handleShpDownload(url:string, result:Uint8Array):void
		{
			// ignore outdated results
			if (Weave.wasDisposed(this) || url != this.shpUrl.value)
				return;

			//debugTrace(this, 'shp download complete', shpUrl.value);

			if (this.shpfile)
			{
				Weave.dispose(this.shpfile);
				this.shpfile = null;
			}
			var bytes:JSByteArray = new JSByteArray(result);
			if (bytes.length == 0)
			{
				console.error("Zero-byte ShapeFile: " + this.shpUrl.value);
			}
			else
			{
				try
				{
					bytes.position = 0;
					this.shpfile = Weave.linkableChild(this, new ShpFileReader(bytes));
				}
				catch (e)
				{
					console.error(e);
				}
			}
			Weave.getCallbacks(this).triggerCallbacks();
		}

		/**
		 * Called when the DBF file fails to download from the URL
		 */
		private handleDBFDownloadError(url:string, error:Error):void
		{
			if (Weave.wasDisposed(this))
				return;

			// ignore outdated results
			if (url != this.dbfUrl.value)
				return;

			console.error(error);
			Weave.getCallbacks(this).triggerCallbacks();
		}

		/**
		 * Called when the DBF file fails to download from the URL
		 */
		private handleShpDownloadError(url:string, error:Error):void
		{
			if (Weave.wasDisposed(this))
				return;

			// ignore outdated results
			if (url != this.shpUrl.value)
				return;

			console.error(error);
			Weave.getCallbacks(this).triggerCallbacks();
		}

		/**
		 * @inheritDoc
		 */
		/* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var metadata = proxyColumn.getProxyMetadata() as IDBFColumnMetadata;
			// get column name from proxy metadata
			var columnName = metadata.name;

			// /* override */ proxy metadata
			metadata = this.getColumnMetadata(columnName);
			if (!metadata)
			{
				proxyColumn.dataUnavailable();
				return;
			}
			proxyColumn.setMetadata(metadata);

			var qkeys = WeaveAPI.QKeyManager.getQKeys(this.getKeyType(), this.getColumnValues(this.keyColName.value));
			var data = this.getColumnValues(columnName);

			var newColumn:IAttributeColumn;
			var dataType = metadata.dataType;
			if (dataType == DataType.GEOMETRY)
			{
				newColumn = new GeometryColumn(metadata);
				(newColumn as GeometryColumn).setRecords(qkeys, data);
			}
			else if (dataType == DataType.DATE)
			{
				newColumn = new DateColumn(metadata);
				(newColumn as DateColumn).setRecords(qkeys, data);
			}
			else if (dataType == DataType.NUMBER)
			{
				newColumn = new NumberColumn(metadata);
				data.forEach((str:string) => { return StandardLib.asNumber(str); });
				(newColumn as NumberColumn).setRecords(qkeys, data);
			}
			else // string
			{
				newColumn = new StringColumn(metadata);
				Weave.AS(newColumn, StringColumn).setRecords(qkeys, data);
			}

			proxyColumn.setInternalColumn(newColumn);
		}

		public getKeyType():string
		{
			return this.keyType.value || this.getLabel();
		}

		public getColumnNames():string[]
		{
			var names:string[] = [];
			if (this.shpfile)
				names.push(DBFDataSource.THE_GEOM_COLUMN);
			if (this.dbfHeader)
				for (var i:number = 0; i < this.dbfHeader.fields.length; i++)
					names.push(Weave.AS(this.dbfHeader.fields[i], DbfField).name);
			return names;
		}
		public getColumnMetadata(columnName:string):IColumnMetadata
		{
			if (!columnName)
				return null;

			var meta:IDBFColumnMetadata = {};
			meta.name = columnName;
			meta.keyType = this.getKeyType();
			meta.projection = this.projection.value;
			if (columnName == DBFDataSource.THE_GEOM_COLUMN)
			{
				meta.title = this.getGeomColumnTitle();
				meta.dataType = DataType.GEOMETRY as "geometry" // TODO;
				return meta;
			}
			else if (this.dbfHeader)
			{
				meta.title = columnName;
				for (var field of this.dbfHeader.fields)
				{
					if (field.name == columnName)
					{
						var typeChar:string = String.fromCharCode(field.type);
						var dataType = DBFDataSource.FIELD_TYPE_LOOKUP[typeChar] as any;
						if (dataType)
							meta.dataType = dataType;
						if (dataType == DataType.DATE)
							meta.dateFormat = "YYYYMMDD";
						return meta;
					}
				}
			}
			return null;
		}
		private getColumnValues(columnName:string):any[]
		{
			var values:any[] = [];
			if (columnName == DBFDataSource.THE_GEOM_COLUMN)
				return this.shpfile ? this.shpfile.geoms : [];

			if (!this.dbfHeader)
				return values;

			var record:DbfRecord = null;
			for (var i:number = 0; i < this.dbfHeader.recordCount; i++)
			{
				if (columnName)
				{
					record = DbfTools.getRecord(this.dbfData, this.dbfHeader, i);
					var value:any = (record.map_field_value as Map<string, any>).get(columnName);
					values.push(value);
				}
				else
					values.push(String(i + 1));
			}
			return values;
		}

		private static /* readonly */ FIELD_TYPE_LOOKUP:{[key:string]:string} = {
			"C": DataType.STRING, // Char - ASCII
			"D": DataType.DATE, // Date - 8 Ascii digits (0..9) in the YYYYMMDD format
			"F": DataType.NUMBER, // Numeric - Ascii digits (-.0123456789) variable position of floating point
			"N": DataType.NUMBER, // Numeric - Ascii digits (-.0123456789) fixed position/no floating point
			"2": DataType.NUMBER, // short int -- binary int
			"4": DataType.NUMBER, // long int - binary int
			"8": DataType.NUMBER, // double - binary signed double IEEE
			"L": "boolean", // Logical - Ascii chars (YyNnTtFf space ?)
			"M": null, // Memo - 10 digits representing the start block position in .dbt file, or 10 spaces if no entry in memo
			"B": null, // Binary - binary data in .dbt, structure like M
			"G": null, // General - OLE objects, structure like M
			"P": null, // Picture - binary data in .ftp, structure like M
			"I": null,
			"0": null,
			"@": null,
			"+": null
		};
	}

	class DBFColumnNode implements IWeaveTreeNode, IColumnReference
	{
		static CLASS_INFO = Weave.setClassInfo(DBFColumnNode, {
			id: "weavejs.data.source.DBFColumnNode",
			interfaces: [IWeaveTreeNode, IColumnReference]
		});

		private source:DBFDataSource;
		public columnName:string;
		private children:DBFColumnNode[];

		constructor(source:DBFDataSource = null, columnName:string = null)
		{
			this.source = source;
			this.columnName = columnName;
		}

		public equals(other:IWeaveTreeNode):boolean
		{
			var that:DBFColumnNode = Weave.AS(other, DBFColumnNode);
			return !!that
				&& this.source == that.source
				&& this.columnName == that.columnName;
		}
		public getLabel():string
		{
			if (!this.columnName)
				return this.source.getLabel();
			return this.columnName;
		}
		public isBranch():boolean { return !this.columnName; }
		public hasChildBranches():boolean { return false; }
		public getChildren()
		{
			if (this.columnName)
				return null;

			if (!this.children)
				this.children = [];
			var names = this.source.getColumnNames();
			for (var i = 0; i < names.length; i++)
			{
				if (this.children[i])
					Weave.AS(this.children[i], DBFColumnNode).columnName = names[i];
				else
					this.children[i] = new DBFColumnNode(this.source, names[i]);
			}
			this.children.length = names.length;
			return this.children;
		}

		public getDataSource():IDataSource { return this.source; }
		public getColumnMetadata():IDBFColumnMetadata { return this.source.getColumnMetadata(this.columnName); }
	}
}
