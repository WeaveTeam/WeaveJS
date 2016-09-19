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
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableFile = weavejs.core.LinkableFile;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import CSVParser = weavejs.data.CSVParser;
	import DateColumn = weavejs.data.column.DateColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import ReferencedColumn = weavejs.data.column.ReferencedColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
	import QKeyManager = weavejs.data.key.QKeyManager;
	import ResponseType = weavejs.net.ResponseType;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IColumnReference = weavejs.api.data.IColumnReference;

	declare type ICSVMetadata = {[columnId:string]:ICSVColumnMetadata}|ICSVColumnMetadata[];

	export interface ICSVColumnMetadata extends IColumnMetadata
	{
		csvColumnIndex?:number;
		csvColumn?:string;
	}

	/**
	 * 
	 * @author adufilie
	 * @author skolman
	 */
	@Weave.classInfo({id: "weavejs.data.source.CSVDataSource", label: "CSV file", interfaces: [IDataSource, ILinkableObjectWithNewProperties]})
	export class CSVDataSource extends AbstractDataSource implements IDataSource, ILinkableObjectWithNewProperties
	{
		constructor()
		{
			super();
			Weave.linkableChild(this.hierarchyRefresh, this.metadata);
		}

		/* override */ public get isLocal():boolean
		{
			return !!this.csvData.state || this.url.isLocal;
		}
		
		/* override */ public getLabel():string
		{
			return this.label.value || (this.url.value || '').split('/').pop() || super.getLabel();
		}

		public /* readonly */ csvData:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array, this.verifyRows), this.handleCSVDataChange);

		private verifyRows(rows:string[][]):boolean
		{
			return StandardLib.arrayIsType(rows, Array);
		}
		
		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString, this.updateKeys);
		public /* readonly */ keyColumn:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, this.verifyKeyColumnId), this.updateKeys);

		private verifyKeyColumnId(value:Object):boolean
		{
			return Weave.IS(value, Number) || Weave.IS(value, String) || value == null;
		}
		
		public /* readonly */ metadata:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, this.verifyMetadata));

		private verifyMetadata(value:Object):boolean
		{
			return typeof value == 'object';
		}
		
		public /* readonly */ url:LinkableFile = Weave.linkableChild(this, new LinkableFile(null, null, ResponseType.TEXT), this.parseRawData);
		
		public /* readonly */ delimiter:LinkableString = Weave.linkableChild(this, new LinkableString(',', this.verifyDelimiter), this.parseRawData);

		private verifyDelimiter(value:string):boolean { return value && value.length == 1 && value != '"'; }

		private parseRawData():void
		{
			if (!this.url.value)
			{
				this.handleCSVDataChange();
				return;
			}
			
			if (this.url.error)
				console.error(this.url.error);
			
			if (Weave.detectChange(this.parseRawDataObserver, this.delimiter))
			{
				if (this.csvParser)
					Weave.dispose(this.csvParser);
				this.csvParser = Weave.linkableChild(this, new CSVParser(true, this.delimiter.value), this.handleCSVParser);
			}
			
			/*if (linkableObjectIsBusy(rawDataPromise))
				return;*/
			
			this.csvParser.parseCSV(String(this.url.result || ''));
		}
		private parseRawDataObserver={};
		
		private csvParser:CSVParser;
		
		/**
		 * Called when csv parser finishes its task
		 */
		private handleCSVParser():void
		{
			// when csv parser finishes, handle the result
			if (this.url.value)
			{
				// when using url, we don't want to set session state of csvData
				this.handleParsedRows(this.csvParser.parseResult);
			}
			else
			{
				this.csvData.setSessionState(this.csvParser.parseResult);
			}
		}
		
		/**
		 * Called when csvData session state changes
		 */
		private handleCSVDataChange():void
		{
			// save parsedRows only if csvData has non-null session state
			var rows:string[][] = this.csvData.getSessionState() as string[][];
			// clear url value when we specify csvData session state
			if (this.url.value && rows != null && rows.length)
				this.url.value = null;
			if (!this.url.value)
				this.handleParsedRows(rows);
		}
		
		/**
		 * Contains the csv data that should be used elsewhere in the code
		 */		
		private parsedRows:string[][];
		private cachedDataTypes:{[key:string]:"number" | "string" | "date" | "geometry"} = {}; // TODO repace by DataType
		private columnIds:(string|number)[] = [];
		private keysArray:IQualifiedKey[];
		private keysCallbacks:ICallbackCollection = Weave.linkableChild(this, CallbackCollection);
		
		protected handleParsedRows(rows:string[][]):void
		{
			if (!rows)
				rows = [];
			this.cachedDataTypes = {};
			this.parsedRows = rows;
			this.columnIds = Weave.IS(rows[0], Array) ? Weave.AS(rows[0], Array).concat() : [];
			// make sure column names are unique - if not, use index values for columns with duplicate names
			var nameLookup:{[name:string]:boolean} = {};
			for (var i:number = 0; i < this.columnIds.length; i++)
			{
				if (!this.columnIds[i] || nameLookup.hasOwnProperty(this.columnIds[i]))
					this.columnIds[i] = i;
				else
					nameLookup[this.columnIds[i]] = true;
			}
			this.updateKeys(true);
			this.hierarchyRefresh.triggerCallbacks();
		}
		
		private updateKeys(forced:boolean = false):void
		{
			var changed:boolean = Weave.detectChange(this.updateKeysObserver, this.keyType, this.keyColumn);
			if (this.parsedRows && (forced || changed))
			{
				var colNames:string[] = this.parsedRows[0] || [];
				// getColumnValues supports columnIndex -1
				var keyColIndex:number = -1;
				if (Weave.IS(this.keyColumn.state, String) && this.keyColumn.state != '')
				{
					keyColIndex = colNames.indexOf(Weave.AS(this.keyColumn.state, String) as string);
					// treat invalid key column name as an error
					if (keyColIndex < 0)
						keyColIndex = -2;
				}
				if (Weave.IS(this.keyColumn.state, Number))
				{
					keyColIndex = Weave.AS(this.keyColumn.state, Number) as number;
				}
				var keyStrings = this.getColumnValues(this.parsedRows, keyColIndex, []);
				var keyTypeString:string = this.keyType.value;
				
				this.keysArray = [];
				(WeaveAPI.QKeyManager as QKeyManager).getQKeysAsync(this.keysCallbacks, this.keyType.value, keyStrings, () => this.handleUpdatedKeys(), this.keysArray);
			}
		}
		private updateKeysObserver={};
		
		private handleUpdatedKeys():void
		{
			this._keysAreUnique = ArrayUtils.union(this.keysArray).length == this.keysArray.length;
		}
		
		private _keysAreUnique:boolean = true;
		
		public get keysAreUnique():boolean
		{
			return this._keysAreUnique;
		}
		
		/**
		 * Convenience function for setting session state of csvData.
		 * @param rows
		 */
		public setCSVData(rows:string[][]):void
		{
			if (!this.verifyRows(rows))
				throw new Error("Invalid data format. Expecting nested Arrays.");
			this.csvData.setSessionState(rows);
		}
		
		public getCSVData():string[][]
		{
			return this.csvData.getSessionState() as string[][];
		}
		/**
		 * Convenience function for setting session state of csvData.
		 * @param csvDataString CSV string using comma as a delimiter.
		 */
		public setCSVDataString(csvDataString:string):void
		{
			this.csvData.setSessionState(WeaveAPI.CSVParser.parseCSV(csvDataString));
		}
		
		/**
		 * This will get a list of column names in the data, which are taken directly from the header row and not guaranteed to be unique.
		 */		
		public getColumnNames():string[]
		{
			return this.getColumnIds().map((value) => this.asString(value));
		}
		
		private asString(value:string|number):string
		{
			return Weave.AS(value, String) as string;
		}

		/**
		 * A unique list of identifiers for columns which may be a mix of Strings and Numbers, depending on the uniqueness of column names.
		 */
		public getColumnIds():(number|string)[]
		{
			return this.columnIds.concat();
		}
		
		/**
		 * Gets whatever is stored in the "metadata" session state for the specified id.
		 */
		private getColumnMetadata(id:string|number):ICSVColumnMetadata
		{
			try
			{
				if (Weave.IS(id, Number))
					id = this.columnIds[id as number];
				var meta = this.metadata.getSessionState() as ICSVMetadata;
				if (Weave.IS(meta, Array))
				{
					var array = Weave.AS(meta, Array) as ICSVColumnMetadata[];
					for (var i:number = 0; i < array.length; i++)
					{
						var item = array[i];
						var itemId = item.csvColumn || item.csvColumnIndex;
						if (itemId === undefined)
							itemId = this.columnIds[i];
						if (itemId === id)
							return item;
					}
					return null;
				}
				else if (meta)
					return (meta as {[key:string]:ICSVColumnMetadata})[id];
			}
			catch (e)
			{
				console.error(e);
			}
			return null;
		}
		
		public getColumnTitle(id:string|number):string
		{
			var meta:ICSVColumnMetadata = this.getColumnMetadata(id);
			var title:string = meta ? meta.title : null;
			if (!title && typeof id == 'number' && this.parsedRows && this.parsedRows.length)
				title = this.parsedRows[0][id as number];
			if (!title)
			{
				if (typeof id == 'number')
					title = Weave.lang("Column {0}", id);
				else
					title = String(id);
			}
			return title;
		}
		
		public generateMetadataForColumnId(id:string|number):ICSVColumnMetadata
		{
			var metadata:ICSVColumnMetadata = {};
			metadata.title = this.getColumnTitle(id);
			metadata.keyType = this.keyType.value || DataTypes.STRING;
			if (this.cachedDataTypes[id])
				metadata.dataType = this.cachedDataTypes[id];
			
			// get column metadata from session state
			var meta:IColumnMetadata = this.getColumnMetadata(id);
			for (var key in meta)
				metadata[key] = meta[key];
			
			// overwrite identifying property
			if (typeof id == 'number')
				metadata.csvColumnIndex = String(id) as any; // TODO check this
			else
				metadata.csvColumn = String(id);
			
			return metadata;
		}
		
		/* override */ public generateNewAttributeColumn(metadata:ICSVColumnMetadata|string|number):IAttributeColumn
		{
			if (typeof metadata != 'object')
				metadata = this.generateMetadataForColumnId(metadata as string|number);
			return super.generateNewAttributeColumn(metadata as ICSVColumnMetadata);
		}
		
		/**
		 * This function will get a column by name or index.
		 * @param columnNameOrIndex The name or index of the CSV column to get.
		 * @return The column.
		 */		
		public getColumnById(columnNameOrIndex:string|number):IAttributeColumn
		{
			return WeaveAPI.AttributeColumnCache.getColumn(this, columnNameOrIndex);
		}
		
		/**
		 * This function will create a column in an ILinkableHashMap that references a column from this CSVDataSource.
		 * @param columnNameOrIndex Either a column name or zero-based column index.
		 * @param destinationHashMap The hash map to put the column in.
		 * @return The column that was created in the hash map.
		 */		
		public putColumnInHashMap(columnNameOrIndex:string|number, destinationHashMap:ILinkableHashMap):IAttributeColumn
		{
			var sourceOwner:ILinkableHashMap = Weave.AS(Weave.getOwner(this), ILinkableHashMap);
			if (!sourceOwner)
				return null;
			
			Weave.getCallbacks(destinationHashMap).delayCallbacks();
			var refCol:ReferencedColumn = destinationHashMap.requestObject(null, ReferencedColumn, false);
			refCol.setColumnReference(this, this.generateMetadataForColumnId(columnNameOrIndex));
			Weave.getCallbacks(destinationHashMap).resumeCallbacks();
			return refCol;
		}
		
		/**
		 * This will modify a column object in the session state to refer to a column in this CSVDataSource.
		 * @param columnNameOrIndex Either a column name or zero-based column index.
		 * @param dynamicColumn A DynamicColumn.
		 * @return A value of true if successful, false if not.
		 * @see weave.api.IExternalSessionStateInterface
		 */
		public putColumn(columnNameOrIndex:string|number, dynamicColumn:DynamicColumn):boolean
		{
			var sourceOwner:ILinkableHashMap = Weave.AS(Weave.getOwner(this), ILinkableHashMap);
			if (!sourceOwner || !dynamicColumn)
				return false;
			
			dynamicColumn.delayCallbacks();
			var refCol:ReferencedColumn = dynamicColumn.requestLocalObject(ReferencedColumn, false);
			refCol.setColumnReference(this, this.generateMetadataForColumnId(columnNameOrIndex));
			dynamicColumn.resumeCallbacks();
			
			return true;
		}
		
		
		/* override */ protected get initializationComplete():boolean
		{
			// make sure csv data is set before column requests are handled.
			return super.initializationComplete && this.parsedRows && this.keysArray && !Weave.isBusy(this.keysCallbacks);
		}
		
		/**
		 * This gets called as a grouped callback.
		 */		
		/* override */ protected initialize(forceRefresh:boolean = false):void
		{
			// if url is specified, do not use csvDataString
			if (this.url.value)
				this.csvData.setSessionState(null);
			
			// recalculate all columns previously requested because CSV data may have changed.
			super.initialize(true);
		}
		
		/**
		 * Gets the root node of the attribute hierarchy.
		 */
		/* override */ public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			if (!this._rootNode)
				this._rootNode = new ColumnTreeNode({
					cacheSettings: {"label": false},
					dataSource: this,
					label: () => this.getLabel(),
					children: (root:ColumnTreeNode) => {
						var items = Weave.AS(this.metadata.getSessionState(), Array) as ICSVColumnMetadata[];
						if (!items)
							items = this.getColumnIds() as any; //TODO fix this type
						var children:IWeaveTreeNode[] = [];
						for (var i:number = 0; i < items.length; i++)
						{
							var item:Object = items[i];
							children[i] = this.generateHierarchyNode(item) || this.generateHierarchyNode(i);
						}
						return children;
					}
				});
			return this._rootNode;
		}
		
		/* override */ protected generateHierarchyNode(metadata:ICSVColumnMetadata|string|number):IWeaveTreeNode&IColumnReference
		{
			if (typeof metadata != 'object')
				metadata = this.generateMetadataForColumnId(metadata as string|number);
			
			if (!metadata)
				return null;
			
			if (metadata.hasOwnProperty(CSVDataSource.METADATA_COLUMN_INDEX) || metadata.hasOwnProperty(CSVDataSource.METADATA_COLUMN_NAME))
			{
				return new ColumnTreeNode({
					dataSource: this,
					label: (node:ColumnTreeNode) => this.getColumnNodeLabel(node),
					idFields: [CSVDataSource.METADATA_COLUMN_INDEX, CSVDataSource.METADATA_COLUMN_NAME],
					data: metadata
				});
			}
			
			return null;
		}
		private getColumnNodeLabel(node:ColumnTreeNode):string
		{
			var title:string = node.data[ColumnMetadata.TITLE] || node.data[CSVDataSource.METADATA_COLUMN_NAME];
			if (!title && node.data['name'])
			{
				title = node.data['name'];
				if (node.data['year'])
					title = StandardLib.substitute("{0} ({1})", title, node.data['year']);
			}
			return title;
		}

		public static /* readonly */ METADATA_COLUMN_INDEX:string = 'csvColumnIndex';
		public static /* readonly */ METADATA_COLUMN_NAME:string = 'csvColumn';

		/* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var metadata:ICSVColumnMetadata = proxyColumn.getProxyMetadata();

			// get column id from metadata
			var columnId:string|number = metadata.csvColumnIndex;
			if (columnId != null)
			{
				columnId = Number(columnId);
			}
			else
			{
				columnId = metadata.csvColumn;
				if (!columnId)
				{
					// support for time slider
					for (var i:number = 0; i < this.columnIds.length; i++)
					{
						var meta = this.getColumnMetadata(this.columnIds[i]);
						if (!meta)
							continue;
						var found:number = 0;
						for (var key in metadata)
						{
							if (meta[key] != metadata[key])
							{
								found = 0;
								break;
							}
							found++;
						}
						if (found)
						{
							columnId = i;
							break;
						}
					}
					
					// backwards compatibility
					if (!columnId)
						columnId = metadata["name"];
				}
			}
			
			// get column name and index from id
			var colNames:string[] = this.parsedRows[0] || [];
			var colIndex:number, colName:string;
			if (typeof columnId == 'number')
			{
				colIndex = Number(columnId);
				colName = colNames[columnId as number];
			}
			else
			{
				colIndex = colNames.indexOf(columnId as string);
				colName = String(columnId);
			}
			if (colIndex < 0)
			{
				proxyColumn.dataUnavailable(Weave.lang("No such column: {0}", columnId));
				return;
			}
			
			metadata = this.generateMetadataForColumnId(columnId);
			proxyColumn.setMetadata(metadata);
			
			var strings:string[] = this.getColumnValues(this.parsedRows, colIndex, []);
			var numbers:number[] = null;
			var dateFormats:string[] = null;
			
			if (!this.keysArray || strings.length != this.keysArray.length)
			{
				proxyColumn.setInternalColumn(null);
				return;
			}
			
			var dataType:string = metadata.dataType;

			if (dataType == null || dataType == DataTypes.NUMBER)
			{
				numbers = this.stringsToNumbers(strings, dataType == DataTypes.NUMBER);
			}

			if ((!numbers && dataType == null) || dataType == DataTypes.DATE)
			{
				dateFormats = DateColumn.detectDateFormats(strings);
			}

			var newColumn:IAttributeColumn;
			if (numbers)
			{
				newColumn = new NumberColumn(metadata);
				Weave.AS(newColumn, NumberColumn).setRecords(this.keysArray, numbers);
			}
			else
			{
				if (dataType == DataTypes.DATE || (dateFormats && dateFormats.length > 0))
				{
					newColumn = new DateColumn(metadata);
					(newColumn as DateColumn).setRecords(this.keysArray, strings);
				}
				else
				{
					newColumn = new StringColumn(metadata);
					(newColumn as StringColumn).setRecords(this.keysArray, strings);
				}
			}
			this.cachedDataTypes[columnId] = newColumn.getMetadata(ColumnMetadata.DATA_TYPE) as "number" | "string" | "date" | "geometry";
			proxyColumn.setInternalColumn(newColumn);
		}
		
		/**
		 * @param rows The rows to get values from.
		 * @param columnIndex If this is -1, record index values will be returned.  Otherwise, this specifies which column to get values from.
		 * @param outputArray Output Array to store the values from the specified column, excluding the first row, which is the header.
		 * @return outputArray
		 */
		private getColumnValues(rows:string[][], columnIndex:number, outputArray:string[]):string[]
		{
			outputArray.length = Math.max(0, rows.length - 1);
			var i:number;
			if (columnIndex == -1)
			{
				// generate keys 0,1,2,3,...
				for (i = 1; i < rows.length; i++)
					outputArray[i-1] = String(i);
			}
			else
			{
				// get column value from each row
				for (i = 1; i < rows.length; i++)
					outputArray[i-1] = rows[i][columnIndex];
			}
			return outputArray;
		}

		/**
		 * Attempts to convert a list of Strings to Numbers. If successful, returns the Numbers.
		 * @param strings The String values.
		 * @param forced Always return an Array of Numbers, whether or not the Strings look like Numbers.
		 * @return Either an Array of Numbers or null
		 */
		private stringsToNumbers(strings:string[], forced:boolean):number[]
		{
			var nonNumber:string = null;
			var foundNumber:boolean = forced;
			var numbers:number[] = new Array(strings.length);
			var i:number = strings.length;
			outerLoop: while (i--)
			{
				var string:string = StandardLib.trim(String(strings[i]));
				for (var nullValue of this.nullValues)
				{
					var a:string = nullValue && nullValue.toLocaleLowerCase();
					var b:string  = string && string.toLocaleLowerCase();
					if (a == b)
					{
						numbers[i] = NaN;
						continue outerLoop;
					}
				}

				// if a string is 2 characters or more and begins with a '0', treat it as a string.
				if (!forced && string.length > 1 && string.charAt(0) == '0' && string.charAt(1) != '.')
					return null;

				if (string.indexOf(',') >= 0)
					string = string.split(',').join('');
				
				var number:number = Number(string);
				if (forced || isFinite(number))
				{
					foundNumber = true;
				}
				else
				{
					// only allow one non-number
					if (nonNumber && nonNumber != string)
						return null;
					else
						nonNumber = string;
				}
				
				numbers[i] = number;
			}
			return foundNumber ? numbers : null;
		}
		
		private nullValues = [null, "", "null", "\\N", "NaN"];
		
		public get deprecatedStateMapping():Object
		{
			return {
				keyColName: this.keyColumn,
				csvDataString: this.setCSVDataString
			};
		}
		
		// backwards compatibility
		/**
		 * @deprecated("replacement getColumnById")
		 */
		public getColumnByName(name:string):IAttributeColumn { return this.getColumnById(name); }
	}
}
