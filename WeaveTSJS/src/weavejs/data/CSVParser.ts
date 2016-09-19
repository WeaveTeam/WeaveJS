/*
	Weave (Web-based Analysis and Visualization Environment)
	Copyright (C) 2008-2011 University of Massachusetts Lowell
	
	This file is a part of Weave.
	
	Weave is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License, Version 3,
	as published by the Free Software Foundation.
	
	Weave is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with Weave.  If not, see <http://www.gnu.org/licenses/>.
*/

namespace weavejs.data
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ICSVParser = weavejs.api.data.ICSVParser;
	import AsyncSort = weavejs.util.AsyncSort;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This is an all-static class containing functions to parse and generate valid CSV files.
	 * Ported from AutoIt Script to Flex. Original author: adufilie
	 * 
	 * @author skolman
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.CSVParser", interfaces: [ICSVParser]})
	export class CSVParser implements ICSVParser, ILinkableObject
	{
		private static /* readonly */ CR:string = '\r';
		private static /* readonly */ LF:string = '\n';
		private static /* readonly */ CRLF:string = '\r\n';
		
		/**
		 * @param delimiter
		 * @param quote
		 * @param asyncMode If this is set to true, parseCSV() will work asynchronously and trigger callbacks when it finishes.
		 *                  Note that if asyncMode is enabled, you can only parse one CSV string at a time. 
		 */		
		constructor(asyncMode:boolean = false, delimiter:string = ',', quote:string = '"')
		{
			this.asyncMode = asyncMode;
			if (delimiter && delimiter.length == 1)
				this.delimiter = delimiter;
			if (quote && quote.length == 1)
				this.quote = quote;
		}
		
		// modes set in constructor
		private asyncMode:boolean;
		private delimiter:string = ',';
		private quote:string = '"';
		private parseTokens:boolean = true;
		
		// async state
		private csvData:string;
		private csvDataArray:string[][];
		private i:int;
		private row:int;
		private col:int;
		private escaped:boolean;
		
		/**
		 * @return  The resulting two-dimensional Array from the last call to parseCSV().
		 */
		public get parseResult():string[][]
		{
			return this.csvDataArray;
		}
		
		public parseCSV(csvData:string):string[][]
		{
			// initialization
			this.csvData = csvData;
			this.csvDataArray = [];
			this.i = 0;
			this.row = 0;
			this.col = 0;
			this.escaped = false;
			
			if (this.asyncMode)
			{
				// high priority because preparing data is often the first thing we need to do
				WeaveAPI.Scheduler.startTask(this, this.parseIterate, WeaveAPI.TASK_PRIORITY_HIGH, this.parseDone);
			}
			else
			{
				this.parseIterate(Number.MAX_VALUE);
				this.parseDone();
			}
			
			return this.csvDataArray;
		}
		
		private parseIterate(stopTime:int):number
		{
			// run initialization code on first iteration
			if (this.i == 0)
			{
				if (!this.csvData) // null or empty string?
					return 1; // done
				
				// start off first row with an empty string token
				this.csvDataArray[this.row] = [''];
			}
			
			while (Date.now() < stopTime)
			{
				if (this.i >= this.csvData.length)
					return 1; // done
				
				var currentChar:string = this.csvData.charAt(this.i);
				var twoChar:string = currentChar + this.csvData.charAt(this.i+1);
				if (this.escaped)
				{
					if (twoChar == this.quote+this.quote) //escaped quote
					{
						this.csvDataArray[this.row][this.col] += (this.parseTokens?currentChar:twoChar);//append quote(s) to current token
						this.i += 1; //skip second quote mark
					}
					else if (currentChar == this.quote)	//end of escaped text
					{
						this.escaped = false;
						if (!this.parseTokens)
						{
							this.csvDataArray[this.row][this.col] += currentChar;//append quote to current token
						}
					}
					else
					{
						this.csvDataArray[this.row][this.col] += currentChar;//append quotes to current token
					}
				}
				else
				{
					
					if (twoChar == this.delimiter+this.quote)
					{
						this.escaped = true;
						this.col += 1;
						this.csvDataArray[this.row][this.col] = (this.parseTokens?'':this.quote);
						this.i += 1; //skip quote mark
					}
					else if (currentChar == this.quote && this.csvDataArray[this.row][this.col] == '')		//start new token
					{
						this.escaped = true;
						if (!this.parseTokens)
							this.csvDataArray[this.row][this.col] += currentChar;
					}
					else if (currentChar == this.delimiter)		//start new token
					{
						this.col += 1;
						this.csvDataArray[this.row][this.col] = '';
					}
					else if (twoChar == CSVParser.CRLF)	//then start new row
					{
						this.i += 1; //skip line feed
						this.row += 1;
						this.col = 0;
						this.csvDataArray[this.row] = [''];
					}
					else if (currentChar == CSVParser.CR)	//then start new row
					{
						this.row += 1;
						this.col = 0;
						this.csvDataArray[this.row] = [''];
					}
					else if (currentChar == CSVParser.LF)	//then start new row
					{ 
						this.row += 1;
						this.col = 0;
						this.csvDataArray[this.row] = [''];
					}
					else //append single character to current token
						this.csvDataArray[this.row][this.col] += currentChar;
				}
				this.i++;
			}
			
			return this.i / this.csvData.length;
		}
		
		private parseDone=():void=>
		{
			// if there is more than one row and last row is empty,
			// remove last row assuming it is there because of a newline at the end of the file.
			for (var iRow:int = this.csvDataArray.length; iRow--;)
			{
				var dataLine:string[] = this.csvDataArray[iRow];
				
				if (dataLine.length == 1 && dataLine[0] == '')
					this.csvDataArray.splice(iRow, 1);
			}
			
			if (this.asyncMode)
				Weave.getCallbacks(this).triggerCallbacks();
		}
		
		public createCSV(rows:string[][]):string
		{
			var lines:string[] = new Array(rows.length);
			for (var i:int = rows.length; i--;)
			{
				var tokens:string[] = new Array(rows[i].length);
				for (var j:int = tokens.length; j--;)
					tokens[j] = this.createCSVToken(rows[i][j]);
				
				lines[i] = tokens.join(this.delimiter);
			}
			var csvData:string = lines.join(CSVParser.LF);
			return csvData;
		}
		
		public parseCSVRow(csvData:string):string[]
		{
			if (csvData == null)
				return null;
			
			var rows:string[][] = this.parseCSV(csvData);
			if (rows.length == 0)
				return rows as any;
			if (rows.length == 1)
				return rows[0];
			// flatten
			return Array.prototype.concat.apply([], rows);
		}
		
		public createCSVRow(row:string[]):string
		{
			return this.createCSV([row]);
		}
		
		public parseCSVToken(token:string):string
		{
			token = String(token);
			var parsedToken:string = '';
			
			var tokenLength:int = token.length;
			
			if (token.charAt(0) == this.quote)
			{
				var escaped:boolean = true;
				for (var i:int = 1; i <= tokenLength; i++)
				{
					var currentChar:string = token.charAt(i);
					var twoChar:string = currentChar + token.charAt(i+1);
					
					if (twoChar == this.quote+this.quote) //append escaped quote
					{
						i += 1;
						parsedToken += this.quote;
					}
					else if (currentChar == this.quote && escaped)
					{
						escaped = false;
					}
					else
					{
						parsedToken += currentChar;
					}
				}
			}
			else
			{
				parsedToken = token;
			}
			return parsedToken;
		}
		
		public createCSVToken(str:string):string
		{
			str = String(str);
			if (str == null)
				str = '';
			
			// determine if quotes are necessary
			if ( str.length > 0
				&& str.indexOf(this.quote) < 0
				&& str.indexOf(this.delimiter) < 0
				&& str.indexOf(CSVParser.LF) < 0
				&& str.indexOf(CSVParser.CR) < 0
				&& str == StandardLib.trim(str) )
			{
				return str;
			}
			
			var token:string = this.quote;
			for (var i:int = 0; i <= str.length; i++)
			{
				var currentChar:string = str.charAt(i);
				if (currentChar == this.quote)
					token += this.quote + this.quote;
				else
					token += currentChar; 
			}
			return token + this.quote;
		}
		
		public convertRowsToRecords(rows:string[][], headerDepth:int = 1):Array<{[key: string]:any}>
		{
			if (rows.length < headerDepth)
				throw new Error("headerDepth is greater than the number of rows");
			CSVParser.assertHeaderDepth(headerDepth);
			
			var records:Array<{[key: string]:any}> = new Array(rows.length - headerDepth);
			for (var r:int = headerDepth; r < rows.length; r++)
			{
				var record:{[key: string]:any} = {};
				var row:string[] = rows[r];
				for (var c:int = 0; c < row.length; c++)
				{
					var output:{[key: string]:any} = record;
					var cell:string = row[c];
					for (var h:int = 0; h < headerDepth; h++)
					{
						var colName:string = rows[h][c];
						if (h < headerDepth - 1)
						{
							if (!output[colName])
								output[colName] = {};
							output = output[colName];
						}
						else
							output[colName] = cell;
					}
				}
				records[r - headerDepth] = record;
			}
			return records;
		}
		
		public getRecordFieldNames(records:Array<{[key: string]:any}>, includeNullFields:boolean = false, headerDepth:int = 1):string[]
		{
			CSVParser.assertHeaderDepth(headerDepth);
			
			var nestedFieldNames:{[key: string]:any} = {};
			for (var record of records || [])
			this._outputNestedFieldNames(record, includeNullFields, nestedFieldNames, headerDepth);
			
			var fields:string[] = [];
			this._collapseNestedFieldNames(nestedFieldNames, fields);
			return fields;
		}
		private _outputNestedFieldNames(record:{[key: string]:any}, includeNullFields:boolean, output:{[key: string]:any}, depth:int):void
		{
			for (var field in record)
			{
				if (includeNullFields || record[field] != null)
				{
					if (depth == 1)
					{
						output[field] = false;
					}
					else
					{
						if (!output[field])
							output[field] = {};
						this._outputNestedFieldNames(record[field], includeNullFields, output[field], depth - 1);
					}
				}
			}
		}
		private _collapseNestedFieldNames(nestedFieldNames:{[key: string]:any}, output:string[], prefix:string|string[] = null):void
		{
			for (var field in nestedFieldNames)
			{
				if (nestedFieldNames[field]) // either an Object or false
				{
					this._collapseNestedFieldNames(nestedFieldNames[field], output, prefix ? prefix.concat(field) : [field]);
				}
				else // false means reached full nesting depth
				{
					if (prefix) // is depth > 1?
						output.push((prefix as string).concat(field)); // output the list of nested field names
					else
						output.push(field); // no array when max depth is 1
				}
			}
		}
		
		public convertRecordsToRows(records:Array<{[key: string]:any}>, columnOrder:string[] = null, allowBlankColumns:boolean = false, headerDepth:int = 1):string[][]
		{
			CSVParser.assertHeaderDepth(headerDepth);
			
			var fields:string[] = columnOrder;
			if (fields == null)
			{
				fields = this.getRecordFieldNames(records, allowBlankColumns, headerDepth);
				AsyncSort.sortImmediately(fields);
			}
			
			var r:int;
			var c:int;
			var cell:any;
			var row:string[];
			var rows:string[][] = new Array(records.length + headerDepth);
			
			// construct multiple header rows from field name chains
			for (r = 0; r < headerDepth; r++)
			{
				row = new Array(fields.length);
				for (c = 0; c < fields.length; c++)
				{
					if (headerDepth > 1)
						row[c] = fields[c][r] || ''; // fields are Arrays
					else
						row[c] = fields[c] || ''; // fields are Strings
				}
				rows[r] = row;
			}
			
			for (r = 0; r < records.length; r++)
			{
				var record:{[key: string]:any} = records[r];
				row = new Array(fields.length);
				for (c = 0; c < fields.length; c++)
				{
					if (headerDepth == 1)
					{
						// fields is an Array of Strings
						cell = record[fields[c]];
					}
					else
					{
						// fields is an Array of Arrays
						cell = record;
						for (var field of fields[c] || [])
						if (cell)
							cell = cell[field];
					}
					row[c] = cell != null ? String(cell) : '';
				}
				rows[headerDepth + r] = row;
			}
			return rows;
		}
		
		private static assertHeaderDepth(headerDepth:int):void
		{
			if (headerDepth < 1)
				throw new Error("headerDepth must be > 0");
		}
		
		//test();
		private static _tested:boolean = false;
		private static test():void
		{
			if (CSVParser._tested)
				return;
			CSVParser._tested = true;
			
			var _:any = {};
			_.parser = WeaveAPI.CSVParser;
			_.csv=[
				'internal,internal,public,public,public,private,private,test',
				'id,type,title,keyType,dataType,connection,sqlQuery,empty',
				'2,1,state name,fips,string,resd,'+'"'+'select fips,name from myschema.state_data'+'"'+',',
				'3,1,population,fips,number,resd,'+'"'+'select fips,pop from myschema.state_data'+'"'+',',
				'1,0,state data table'
			].join('\n');
			_.table = _.parser.parseCSV(_.csv);
			_.records = _.parser.convertRowsToRecords(_.table, 2);
			_.rows = _.parser.convertRecordsToRows(_.records, null, false, 2);
			_.fields = _.parser.getRecordFieldNames(_.records, false, 2);
			_.fieldOrder = _.parser.parseCSV('internal,id\ninternal,type\npublic,title\npublic,keyType\npublic,dataType\nprivate,connection\nprivate,sqlQuery');
			_.rows2 = _.parser.convertRecordsToRows(_.records, _.fieldOrder, false, 2);
			console.log(_);
		}
	}
}
