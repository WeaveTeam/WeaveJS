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

namespace weavejs.api.data
{
	/**
	 * This is an interface for parsing and generating CSV data.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.data.ICSVParser"})
	export class ICSVParser
	{
		/**
		 * This will parse a CSV String into a two-dimensional Array of String values.
		 * @param csvData The CSV String to parse.
		 * @return A 2-dimensional Array of Strings.
		 */
		parseCSV:(csvData:string)=>string[][];
		
		/**
		 * This will generate a CSV String from an Array of rows in a table.
		 * @param rows A two-dimensional Array, which will be accessed like rows[rowIndex][columnIndex].
		 * @return A CSV String containing the values from the rows.
		 */
		createCSV:(rows:string[][])=>string;
		
		/**
		 * This function parses a String as a CSV-encoded row.
		 * @param csvData The CSV string to parse.
		 * @return The result of parsing the CSV string.
		 */
		parseCSVRow:(csvData:string)=>string[];
		
		/**
		 * This function encodes an Array of Strings into a single CSV-encoded String.
		 * @param row An array of values for a single row.
		 * @return The row encoded as a CSV String.
		 */
		createCSVRow:(row:string[])=>string;
		
		/**
		 * This function converts an Array of Arrays to an Array of Objects compatible with DataGrid.
		 * @param rows An Array of Arrays, the first being a header line containing property names.
		 * @param headerDepth The number of header rows.  If the depth is greater than one, nested record objects will be created.
		 * @return An Array of Objects containing String properties using the names in the header line.
		 */
		convertRowsToRecords:(rows:string[][], headerDepth?:int)=>{[key:string]:any}[];
		
		/**
		 * This function returns a comprehensive list of all the field names defined by a list of record objects.
		 * @param records An Array of record objects.
		 * @param includeNullFields If this is true, fields that have null values will be included.
		 * @param headerDepth The depth of record properties.  If depth is greater than one, the records will be treated as nested objects.
		 * @return A comprehensive list of all the field names defined by the given record objects.  If headerDepth > 1, a two-dimensional array will be returned.
		 */
		getRecordFieldNames:(records:{[key:string]:any}[], includeNullFields?:boolean, headerDepth?:int)=>string[];
		
		/**
		 * This function converts an Array of Objects (compatible with DataGrid) to an Array of Arrays
		 * compatible with other functions in this class.
		 * @param records An Array of Objects containing String properties.
		 * @param columnOrder An optional list of column names to use in order.  Must be a two-dimensional Array if headerDepth > 1.
		 * @param allowBlankColumns If this is set to true, then the function will include all columns even if they are blank.
		 * @param headerDepth The depth of record properties.  If depth is greater than one, the records will be treated as nested objects.
		 * @return An Array of Arrays, the first being a header line containing all the property names.
		 */
		convertRecordsToRows:(records:{[key:string]:any}[], columnOrder?:string[], allowBlankColumns?:boolean, headerDepth?:int)=>string[][];
	}
}
