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

namespace weavejs.data
{
	import WeaveAPI = weavejs.WeaveAPI;
	import DynamicState = weavejs.api.core.DynamicState;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IDataSource = weavejs.api.data.IDataSource;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IKeySet = weavejs.api.data.IKeySet;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ExtendedDynamicColumn = weavejs.data.column.ExtendedDynamicColumn;
	import ReferencedColumn = weavejs.data.column.ReferencedColumn;
	import SecondaryKeyNumColumn = weavejs.data.column.SecondaryKeyNumColumn;
	import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
	import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
	import BLGNode = weavejs.geom.BLGNode;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeoJSON = weavejs.geom.GeoJSON;
	import Point = weavejs.geom.Point;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	export declare type QKeyLike = {keyType: string, localName: string};

	/**
	 * This class contains static functions that access values from IAttributeColumn objects.
	 * 
	 * @author adufilie
	 */
	export class ColumnUtils
	{
		public static debugKeyTypes:boolean = false;
		
		/**
		 * This is a shortcut for column.getMetadata(ColumnMetadata.TITLE).
		 * @param column A column to get the title of.
		 * @return The title of the column.
		 */		
		public static getTitle(column:IAttributeColumn):string
		{
			var title:string = column.getMetadata(ColumnMetadata.TITLE) || Weave.lang("(Data unavailable)");
			
			if (ColumnUtils.debugKeyTypes)
			{
				var keyType:String = column.getMetadata(ColumnMetadata.KEY_TYPE);
				if (keyType)
					title += " (Key type: " + keyType + ")";
				else
					title += " (No key type)";
			}

			return title;
		}
		
		/**
		 * Generates a label to use when displaying the column in a list.
		 * @param column
		 * @return The column title followed by its dataType and/or keyType metadata.
		 */
		public static getColumnListLabel(column:IAttributeColumn):string
		{
			var title:string = ColumnUtils.getTitle(column);
			var keyType:string = ColumnUtils.getKeyType(column);
			var dataType:string = ColumnUtils.getDataType(column);
			var projection:string = column.getMetadata(ColumnMetadata.PROJECTION);
			var dateFormat:string = column.getMetadata(ColumnMetadata.DATE_FORMAT);
			
			if (dataType == DataType.DATE && dateFormat)
				dataType = dataType + '; ' + dateFormat;
			if (dataType == DataType.GEOMETRY && projection)
				dataType = dataType + '; ' + projection;
			
			if (dataType && keyType)
				return StandardLib.substitute("{0} ({1} -> {2})", title, keyType, dataType);
			if (keyType)
				return StandardLib.substitute("{0} (Key Type: {1})", title, keyType);
			if (dataType)
				return StandardLib.substitute("{0} (Data Type: {1})", title, dataType);
			
			return title;
		}
		
		/**
		 * Temporary solution
		 * @param column
		 * @return 
		 */
		public static getDataSources(column:IAttributeColumn):IDataSource[]
		{
			var sources:IDataSource[] = [];
			var name:string;
			var nameMap:Object = {};
			var cols:ReferencedColumn[];
			if (Weave.IS(column, ReferencedColumn))
				cols = [column as ReferencedColumn];
			else
				cols = Weave.getDescendants(column, ReferencedColumn);
			for (var i:int = 0; i < cols.length; i++)
				sources.push(Weave.AS(cols[i], ReferencedColumn).getDataSource());
			return ArrayUtils.union(sources);
		}

		/**
		 * This function gets the keyType of a column, either from the metadata or from the actual keys.
		 * @param column A column to get the keyType of.
		 * @return The keyType of the column.
		 */
		public static getKeyType(column:IAttributeColumn):string
		{
			// first try getting the keyType from the metadata.
			var keyType:string = column.getMetadata(ColumnMetadata.KEY_TYPE);
			if (keyType == null)
			{
				// if metadata does not specify keyType, get it from the first key in the list of keys.
				var keys:IQualifiedKey[] = column.keys;
				if (keys.length > 0)
					keyType = Weave.AS(keys[0], IQualifiedKey).keyType;
			}
			return keyType;
		}
		
		/**
		 * This function gets the dataType of a column from its metadata.
		 * @param column A column to get the dataType of.
		 * @return The dataType of the column.
		 */
		public static getDataType(column:IAttributeColumn):string
		{
			return column.getMetadata(ColumnMetadata.DATA_TYPE);
		}
		
		/**
		 * This function will use an attribute column to convert a number to a string.
		 * @param column A column that may have a way to convert numeric values to string values.
		 * @param number A Number to convert to a String.
		 * @return A String representation of the number, or null if no specific string representation exists.
		 */
		public static deriveStringFromNumber(column:IAttributeColumn, number:number):string
		{
			var pc:IPrimitiveColumn = Weave.AS(ColumnUtils.hack_findNonWrapperColumn(column), IPrimitiveColumn);
			if (pc)
				return pc.deriveStringFromNumber(number);
			return null; // no specific string representation
		}
		
		public static hack_findNonWrapperColumn(column:IAttributeColumn):IAttributeColumn
		{
			// try to find an internal IPrimitiveColumn
			while (Weave.IS(column, IColumnWrapper))
				column = Weave.AS(column, IColumnWrapper).getInternalColumn();
			return column;
		}
		
		public static hack_findInternalDynamicColumn(columnWrapper:IColumnWrapper):DynamicColumn
		{
			columnWrapper = Weave.AS(columnWrapper, IColumnWrapper);
			if (columnWrapper)
			{
				// temporary solution - find internal dynamic column
				while (true)
				{
					if (Weave.IS(columnWrapper.getInternalColumn(), DynamicColumn))
						columnWrapper = Weave.AS(columnWrapper.getInternalColumn(), IColumnWrapper);
					else if (Weave.IS(columnWrapper.getInternalColumn(), ExtendedDynamicColumn))
						columnWrapper = Weave.AS(columnWrapper.getInternalColumn(), ExtendedDynamicColumn).internalDynamicColumn;
					else
						break;
				}
				if (Weave.IS(columnWrapper, ExtendedDynamicColumn))
					columnWrapper = Weave.AS(columnWrapper, ExtendedDynamicColumn).internalDynamicColumn;
			}
			return Weave.AS(columnWrapper, DynamicColumn);
		}
		
		public static hack_findHierarchyNode(column:IAttributeColumn, createFakeNodeIfNotFound:boolean = false):IWeaveTreeNode & IColumnReference
		{
			var rc:ReferencedColumn = Weave.AS(column, ReferencedColumn);
			var dc:DynamicColumn = null;
			if (!rc)
			{
				dc = ColumnUtils.hack_findInternalDynamicColumn(Weave.AS(column, IColumnWrapper));
				rc = dc ? Weave.AS(dc.target, ReferencedColumn) : null;
			}
			
			var node:IWeaveTreeNode&IColumnReference = rc ? rc.getHierarchyNode() : null;
			if (!node && createFakeNodeIfNotFound)
			{
				if (rc)
					node = new ColumnTreeNode({
						dataSource: rc.getDataSource(),
						data: rc.metadata.state
					});
				else if (column && (!dc || dc.getInternalColumn()))
					node = new ColumnTreeNode({
						dataSource: null,
						data: ColumnMetadata.getAllMetadata(column)
					});
			}
			
			return node;
		}

		/**
		 * Gets an array of QKey objects from <code>column</code> which meet the criteria
		 * <code>min &lt;= getNumber(column, key) &lt;= max</code>, where key is a <code>QKey</code> 
		 * in <code>column</code>.
		 * @param min The minimum value for the keys
		 * @param max The maximum value for the keys
		 * @param inclusiveRange A boolean specifying whether the range includes the min and max values.
		 * Default value is <code>true</code>.
		 * @return An array QKey objects. 
		 */		
		public static getQKeysInNumericRange(column:IAttributeColumn, min:number, max:number, inclusiveRange:boolean = true):IQualifiedKey[]
		{
			var result:IQualifiedKey[] = [];
			var keys:IQualifiedKey[] = column.keys;
			for (var qkey of keys || [])
			{
				var number:number = column.getValueFromKey(qkey, Number) as number;
				var isInRange:boolean = false;
				if (inclusiveRange)
					isInRange = min <= number && number <= max;
				else
					isInRange = min < number && number < max;
				
				if (isInRange)
					result.push(qkey);
			}
			
			return result;
		}

		/**
		 * @deprecated replacement=WeaveAPI.QKeyManager.convertToQKeys()
		 */
		public static getQKeys(genericObjects:QKeyLike[]):IQualifiedKey[]
		{
			return WeaveAPI.QKeyManager.convertToQKeys(genericObjects);
		}
			
		/**
		 * Get the QKey corresponding to <code>object.keyType</code>
		 * and <code>object.localName</code>.
		 * 
		 * @param object An object with properties <code>keyType</code>
		 * and <code>localName</code>.
		 * @return An IQualifiedKey object. 
		 */		
		private static getQKey(object:QKeyLike):IQualifiedKey
		{
			if (Weave.IS(object, IQualifiedKey))
				return Weave.AS(object, IQualifiedKey);
			return WeaveAPI.QKeyManager.getQKey(object.keyType, object.localName);
		}
		
		/**
		 * @param column A column to get a value from.
		 * @param key A key in the given column to get the value for.
		 * @return The Number corresponding to the given key.
		 */
		public static getNumber(column:IAttributeColumn, key:QKeyLike):number
		{
			var qkey:IQualifiedKey = ColumnUtils.getQKey(key);
			if (column != null)
				return column.getValueFromKey(qkey, Number);
			return NaN;
		}
		/**
		 * @param column A column to get a value from.
		 * @param key A key in the given column to get the value for.
		 * @return The String corresponding to the given key.
		 */
		public static getString(column:IAttributeColumn, key:QKeyLike):string
		{
			var qkey:IQualifiedKey = ColumnUtils.getQKey(key);
			if (column != null)
				return column.getValueFromKey(qkey, String) as string;
			return '';
		}
		/**
		 * @param column A column to get a value from.
		 * @param key A key in the given column to get the value for.
		 * @return The Boolean corresponding to the given key.
		 */
		public static getBoolean(column:IAttributeColumn, key:QKeyLike):boolean
		{
			var qkey:IQualifiedKey = ColumnUtils.getQKey(key);
			if (column != null)
				return StandardLib.asBoolean( column.getValueFromKey(qkey, Number) );
			return false;
		}
		/**
		 * @param column A column to get a value from.
		 * @param key A key in the given column to get the value for.
		 * @return The Number corresponding to the given key, normalized to be between 0 and 1.
		 *
		 * @deprecated replacement="WeaveAPI.StatisticsCache.getColumnStatistics(column).getNorm(key)")
		 */
		public static getNorm(column:IAttributeColumn, key:QKeyLike):number
		{
			var qkey:IQualifiedKey = ColumnUtils.getQKey(key);
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getNorm(qkey);
		}
		
		/**
		 * @param geometryColumn A GeometryColumn which contains the geometry objects for the key.
		 * @param key An object with <code>keyType</code> and <code>localName</code> properties.
		 * @return An array of arrays of arrays of Points.
		 * For example, 
		 * <code>result[0]</code> is type <code>Array of Array of Point</code>. <br>
		 * <code>result[0][0]</code> is type <code>Array of Point</code> <br>
		 * <code>result[0][0][0]</code> is a <code>Point</code>
		 */		
		public static getGeometry(geometryColumn:IAttributeColumn, key:QKeyLike):Array<Point[][]>
		{
			var qkey:IQualifiedKey = ColumnUtils.getQKey(key);
			var genGeoms:GeneralizedGeometry[] = Weave.AS(geometryColumn.getValueFromKey(qkey, Array), Array) as GeneralizedGeometry[];
			
			if (genGeoms == null)
				return null;
			
			var result:Array<Point[][]> = [];
			
			for (var iGenGeom:int; iGenGeom < genGeoms.length; ++iGenGeom)
			{
				var genGeom:GeneralizedGeometry = genGeoms[iGenGeom];
				var simplifiedGeom:BLGNode[][] = genGeom.getSimplifiedGeometry();
				var newSimplifiedGeom:Point[][] = [];
				for (var iSimplifiedGeom:int; iSimplifiedGeom < simplifiedGeom.length; ++iSimplifiedGeom)
				{
					var nodeVector:BLGNode[] = simplifiedGeom[iSimplifiedGeom];
					var newNodeVector:Point[] = [];
					for (var iNode:int = 0; iNode < nodeVector.length; ++iNode)
					{
						var node:BLGNode = nodeVector[iNode];
						var point:Point = new Point(node.x, node.y);
						newNodeVector.push(point);
					}
					newSimplifiedGeom.push(newNodeVector);
				}
				result.push(newSimplifiedGeom);
			}
			
			return result;			
		}
		
		/**
		 * @param geometryColumn A column with metadata dataType="geometry"
		 * @param keys An Array of IQualifiedKeys
		 * @param minImportance No points with importance less than this value will be returned.
		 * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
		 * @return An Array of GeoJson Geometry objects corresponding to the keys.  The Array may be sparse if there are no coordinates for some of the keys.
		 */
		public static getGeoJsonGeometries(geometryColumn:IAttributeColumn, keys:IQualifiedKey[], minImportance:number = 0, visibleBounds:Bounds2D = null):any[]/*IGeoJSON[]*/
		{
			var map_inputGeomArray_outputMultiGeom = new WeakMap<GeneralizedGeometry[], any /*IGeoJSON*/>();
			var output:any[]/*IGeoJSON[]*/ = new Array(keys.length);
			var multiGeom:any/*IGeoJSON*/;
			for (var i:int = 0; i < keys.length; i++)
			{
				var key:IQualifiedKey = keys[i];
				var inputGeomArray:GeneralizedGeometry[] = Weave.AS(geometryColumn.getValueFromKey(key, Array), Array) as GeneralizedGeometry[];
				if (inputGeomArray)
				{
					if (map_inputGeomArray_outputMultiGeom.has(inputGeomArray))
					{
						multiGeom = map_inputGeomArray_outputMultiGeom.get(inputGeomArray);
					}
					else
					{
						var outputGeomArray:any[]/*GeoJSON[] */ = [];
						for (var inputGeom of inputGeomArray || [])
						{
							var outputGeom:Object = inputGeom.toGeoJson(minImportance, visibleBounds);
							if (outputGeom)
								outputGeomArray.push(outputGeom);
						}
						multiGeom = outputGeomArray.length ? GeoJSON.getMultiGeomObject(outputGeomArray) : null;
						map_inputGeomArray_outputMultiGeom.set(inputGeomArray, multiGeom);
					}
					if (multiGeom)
						output[i] = multiGeom;
				}
			}
			return output;
		}
		
		public static test_getAllValues<T>(column:IAttributeColumn, dataType:Class<T>):T[]
		{
			var t:int = Date.now();
			var keys:IQualifiedKey[] = column.keys;
			var values:T[] = new Array(keys.length);
			for (var i in keys)
				values[i] = column.getValueFromKey(keys[i], dataType);
			console.log(Date.now()-t);
			return values;
		}

		/**
		 * This function takes the common keys from a list of columns and generates a table of data values for each key from each specified column.
		 * @param columns A list of IAttributeColumns to compute a join table from.
		 * @param dataType The dataType parameter to pass to IAttributeColumn.getValueFromKey().
		 * @param allowMissingData If this is set to true, then all keys will be included in the join result.  Otherwise, only the keys that have associated values will be included.
		 * @param keyFilter Either an IKeyFilter or an Array of IQualifiedKey objects used to filter the results.
		 * @return An Array of Arrays, the first being IQualifiedKeys and the rest being Arrays data values from the given columns that correspond to the IQualifiedKeys. 
		 */
		public static joinColumns<T>(columns:IAttributeColumn[], dataType:Class<T> = null, allowMissingData:boolean = false, keyFilter:IKeyFilter|IQualifiedKey[] = null):(T[]|IQualifiedKey[])[]
		{
			var keys:IQualifiedKey[];
			var key:IQualifiedKey;
			var column:IAttributeColumn;
			// if no keys are specified, get the keys from the columns
			if (Weave.IS(keyFilter, Array))
			{
				keys = Weave.AS(keyFilter, Array).concat() as IQualifiedKey[]; // make a copy so we don't modify the original
			}
			else if (Weave.IS(keyFilter, IKeySet))
			{
				keys = Weave.AS(keyFilter, IKeySet).keys.concat(); // make a copy so we don't modify the original
			}
			else
			{
				// count the number of appearances of each key in each column
				var map_key_count = new Map<IQualifiedKey, number>();
				for (column of columns || [])
				{
					var columnKeys:IQualifiedKey[] = column ? column.keys : null;
					for (key of columnKeys || [])
						map_key_count.set(key, (map_key_count.get(key)|0) + 1);
				}
				// get a list of keys
				keys = [];
				var filter:IKeyFilter = Weave.AS(keyFilter, IKeyFilter);
				for (var [qkey, count] of map_key_count)
					if (allowMissingData || count == columns.length)
						if (!filter || filter.containsKey(qkey))
							keys.push(qkey);
			}
			
			if (Weave.IS(dataType, String))
				dataType = DataType.getClass(Weave.AS(dataType, String) as string);
			
			// put the keys in the result
			var result:(T[]|IQualifiedKey[])[] = [keys];
			// get all the data values in the same order as the common keys
			for (var cIndex:int = 0; cIndex < columns.length; cIndex++)
			{
				column = columns[cIndex];
				
				var dt:Class<T> = JS.asClass(dataType);
				if (!dt && column)
					dt = DataType.getClass(column.getMetadata(ColumnMetadata.DATA_TYPE));
				
				var values:T[] = [];
				for (var kIndex:int = 0; kIndex < keys.length; kIndex++)
				{
					var value:T = column ? column.getValueFromKey(keys[kIndex], dt) : undefined;
					var isUndef:boolean = StandardLib.isUndefined(value);
					if (!allowMissingData && isUndef)
					{
						// value is undefined, so remove this key and all associated data from the list
						for (var array of result)
							(array as any[]).splice(kIndex, 1);
						kIndex--; // avoid skipping the next key
					}
					else if (isUndef)
						values.push(undefined);
					else
						values.push(value);
				}
				result.push(values);
			}
			return result;
		}
		
		/**
		 * Generates records using a custom format.
		 * @param format An object mapping names to IAttributeColumn objects or constant values to be included in every record.
		 *               You can nest Objects or Arrays.
		 *               If you want each record to include its corresponding key, include a property with a value equal to weavejs.api.data.IQualifiedKey.
		 * @param keys An Array of IQualifiedKeys
		 * @param dataType A Class specifying the dataType to retrieve from columns: String/Number/Date/Array (default is Array)
		 *                 You can also specify different data types in a structure matching that of the format object.
		 * @param keyProperty The property name which should be used to store the IQualifiedKey for a record.
		 * @return An array of record objects matching the structure of the format object.
		 */
		public static getRecords(format:{[key:string]:any}, keys:IQualifiedKey[] = null, dataType:{[key:string]:any} = null):any[]
		{
			if (!keys)
				keys = ColumnUtils.getAllKeys(ColumnUtils.getColumnsFromFormat(format, []));
			var records:any[] = new Array(keys.length);
			for (var i in keys)
				records[i] = ColumnUtils.getRecord(format, keys[i], dataType);
			return records;
		}
		
		private static getColumnsFromFormat(format:{[key:string]:any}, output:any[]):any[]
		{
			if (Weave.IS(format, IAttributeColumn))
				output.push(format);
			else if (!JS.isPrimitive(format))
				for (var key in format)
					ColumnUtils.getColumnsFromFormat(format[key], output);
			return output;
		}
		
		/**
		 * Generates a record using a custom format.
		 * @param format An object mapping names to IAttributeColumn objects or constant values to be included in every record.
		 *               You can nest Objects or Arrays.
		 *               If you want the record to include its corresponding key, include include a property with a value equal to weavejs.api.data.IQualifiedKey.
		 * @param key An IQualifiedKey
		 * @param dataType A Class specifying the dataType to retrieve from columns: String/Number/Date/Array (default is Array)
		 *                 You can also specify different data types in a structure matching that of the format object.
		 * @return A record object matching the structure of the format object.
		 */
		public static getRecord(format:{[key:string]:any}, key:IQualifiedKey, dataType:{[key:string]:any}):{[key:string]:any}
		{
			if (format === IQualifiedKey)
				return key;
			
			// check for primitive values
			if (format === null || typeof format !== 'object')
				return format;
			
			var dataTypeClass:GenericClass = JS.asClass(dataType || Array);
			var column:IAttributeColumn = Weave.AS(format, IAttributeColumn);
			if (column)
			{
				var value = column.getValueFromKey(key, dataTypeClass);
				if (value === undefined)
					value = null;
				return value;
			}
			
			var record:{[key:string]:any} = Weave.IS(format, Array) ? [] : {};
			for (var prop in format)
				record[prop] = ColumnUtils.getRecord(format[prop], key, dataTypeClass || dataType[prop]);
			return record;
		}
		
		/**
		 * @param attrCols An array of IAttributeColumns or ILinkableHashMaps containing IAttributeColumns.
		 * @return An Array of non-wrapper columns with duplicates removed.
		 */
		public static getNonWrapperColumnsFromSelectableAttributes(attrCols:IAttributeColumn[]|ILinkableHashMap[]):IAttributeColumn[]
		{
			var map_column = new WeakMap<IAttributeColumn, boolean>();
			attrCols = (attrCols as any[]).map(
				function(item:IAttributeColumn|ILinkableHashMap) {
					return Weave.IS(item, ILinkableHashMap)
					? (item as ILinkableHashMap).getObjects(IAttributeColumn)
					: Weave.AS(item, IAttributeColumn);
				}
			) as any;
			attrCols = ArrayUtils.flatten(attrCols as any);
			attrCols = (attrCols as any).map(
				function(column:IAttributeColumn):IAttributeColumn {
					return ColumnUtils.hack_findNonWrapperColumn(column);
				}
			).filter(
				function(column:IAttributeColumn):boolean {
					if (!column || map_column.get(column))
						return false;
					map_column.set(column, true);
					return true;
				}
			);
			return attrCols as IAttributeColumn[];
		}
		/**
		 * This function takes an array of attribute columns, a set of keys, and the type of the columns
		 * @param attrCols An array of IAttributeColumns or ILinkableHashMaps containing IAttributeColumns.
		 * @param subset An IKeyFilter or IKeySet specifying which keys to include in the CSV output, or null to indicate all keys available in the Attributes.
		 * @param dataType
		 * @return A string containing a CSV-formatted table containing the attributes of the requested keys.
		 */
		public static generateTableCSV(attrCols:IAttributeColumn[], subset:IKeyFilter = null, dataType:GenericClass = null):string
		{
			SecondaryKeyNumColumn.allKeysHack = true; // dimension slider hack
			
			var records:any[] = [];
			attrCols = ColumnUtils.getNonWrapperColumnsFromSelectableAttributes(attrCols);
			var columnTitles:string[] = attrCols.map(
				function(column:IAttributeColumn):string {
					return ColumnUtils.getTitle(column);
				}
			);
			var keys:IQualifiedKey[];
			if (!subset)
				keys = ColumnUtils.getAllKeys(attrCols);
			else
				keys = ColumnUtils.getAllKeys(attrCols).filter(function(key:IQualifiedKey):boolean { return subset.containsKey(key);});
			
			var keyTypeMap:{[key:string]: boolean} = {};
			// create the data for each column in each selected row
			for (var key of keys || [])
			{
				var record:{[key:string]:any} = {};
				// each record has a property named after the keyType equal to the key value				
				record[key.keyType] = key.localName;
				keyTypeMap[key.keyType] = true;
				
				for (var i:int = 0; i < attrCols.length; i++)
				{
					var col:IAttributeColumn = attrCols[i] as IAttributeColumn;
					var dt:GenericClass = dataType || DataType.getClass(col.getMetadata(ColumnMetadata.DATA_TYPE));
					var value:any = col.getValueFromKey(key, dt);
					if (StandardLib.isDefined(value))
						record[columnTitles[i]] = value;
				}
				records.push(record);
			}
			
			// update the list of headers before generating the table
			for (var keyType in keyTypeMap)
				columnTitles.unshift(keyType);
			
			SecondaryKeyNumColumn.allKeysHack = false; // dimension slider hack
			
			var rows:string[][] = WeaveAPI.CSVParser.convertRecordsToRows(records, columnTitles);
			return WeaveAPI.CSVParser.createCSV(rows);
		}

		/**
		 * This function will compute the union of a list of IKeySets.
		 * @param inputKeySets An Array of IKeySets (can be IAttributeColumns).
		 * @return The list of unique keys contained in all the inputKeySets.
		 */
		public static getAllKeys(inputKeySets:IKeySet[]):IQualifiedKey[]
		{
			var map_key = new WeakMap<IQualifiedKey, boolean>();
			var result:IQualifiedKey[] = [];
			for (var i:int = 0; i < inputKeySets.length; i++)
			{
				var keys = Weave.AS(inputKeySets[i], IKeySet).keys;
				for (var j:int = 0; j < keys.length; j++)
				{
					var key:IQualifiedKey = keys[j] as IQualifiedKey;
					if (!map_key.has(key))
					{
						map_key.set(key, true);
						result.push(key);
					}
				}
			}
			return result;
		}
		
		/**
		 * This function will make sure the first IAttributeColumn in a linkable hash map is a DynamicColumn.
		 */		
		public static forceFirstColumnDynamic(columnHashMap:ILinkableHashMap):void
		{
			var cols:IAttributeColumn[] = columnHashMap.getObjects(IAttributeColumn);
			if (cols.length == 0)
			{
				// just create a new dynamic column
				columnHashMap.requestObject(null, DynamicColumn, false);
			}
			else if (!Weave.IS(cols[0], DynamicColumn))
			{
				// don't run callbacks while we edit session state
				Weave.getCallbacks(columnHashMap).delayCallbacks();
				// remember the name order
				var names:string[] = columnHashMap.getNames();
				// remember the session state of the first column
				var state = columnHashMap.getSessionState();
				state.length = 1; // only keep first column
				// overwrite existing column, reusing the same name
				var newCol:DynamicColumn = columnHashMap.requestObject(names[0], DynamicColumn, false);
				// copy the old col inside the new col
				newCol.setSessionState(state, true);
				// restore name order
				columnHashMap.setNameOrder(names);
				// done editing session state
				Weave.getCallbacks(columnHashMap).resumeCallbacks();
			}
		}
		
		/**
		 * Retrieves a metadata value from a list of columns if they all share the same value.
		 * @param columns The columns.
		 * @param propertyName The metadata property name.
		 * @return The metadata value if it is the same across all columns, or null if not. 
		 */		
		public static getCommonMetadata(columns:IAttributeColumn[], propertyName:string):string
		{
			var value:string;
			for (var i:int = 0; i < columns.length; i++)
			{
				var column:IAttributeColumn = Weave.AS(columns[i], IAttributeColumn);
				if (i == 0)
					value = column.getMetadata(propertyName);
				else if (value != column.getMetadata(propertyName))
					return null;
			}
			return value;
		}
		
		public static getAllCommonMetadata(columns:IAttributeColumn[]):IColumnMetadata
		{
			var output:IColumnMetadata = {};
			if (!columns.length)
				return output;
			// We only need to get property names from the first column
			// because we only care about metadata common to all columns.
			for (var key of columns[0].getMetadataPropertyNames())
			{
				var value:string = ColumnUtils.getCommonMetadata(columns, key);
				if (value)
					output[key] = value;
			}
			return output;
		}
		
		private static /* readonly */ _preferredMetadataPropertyOrder:string[] = 'title,keyType,dataType,number,string,min,max,year'.split(',');
		public static sortMetadataPropertyNames(names:string[]):void
		{
			StandardLib.sortOn(names, [ColumnUtils._preferredMetadataPropertyOrder.indexOf, names]);
		}
		
		public static map_root_firstDataSet = new WeakMap<ILinkableHashMap, Array<IWeaveTreeNode&IColumnReference>>();
		
		/**
		 * Finds a set of columns from available data sources, preferring ones that are already in use. 
		 */
		public static findFirstDataSet(root:ILinkableHashMap):Array<IWeaveTreeNode&IColumnReference>
		{
			var firstDataSet:Array<IWeaveTreeNode&IColumnReference> = ColumnUtils.map_root_firstDataSet.get(root);
			if (firstDataSet && firstDataSet.length)
				return firstDataSet;
			
			var ref:IColumnReference;
			for (var column of Weave.getDescendants(root, ReferencedColumn) || [])
			{
				ref = Weave.AS(column.getHierarchyNode(), IColumnReference);
				if (ref)
					break;
			}
			if (!ref)
			{
				for (var source of Weave.getDescendants(root, IDataSource) || [])
				{
					ref = ColumnUtils.findFirstColumnReference(source.getHierarchyRoot());
					if (ref)
						break;
				}
			}
			
			return ref ? HierarchyUtils.findSiblingNodes(ref.getDataSource(), ref.getColumnMetadata()) : [];
		}
		
		private static findFirstColumnReference(node:IWeaveTreeNode):IColumnReference
		{
			if (!node)
				return null;
				
			var ref:IColumnReference = Weave.AS(node, IColumnReference);
			if (ref && ref.getColumnMetadata())
				return ref;
			
			if (!node.isBranch())
				return null;
			
			for (var child of node.getChildren() || [])
			{
				ref = ColumnUtils.findFirstColumnReference(child);
				if (ref)
					return ref;
			}
			return null;
		}
		
		/**
		 * This will initialize selectable attributes using a list of columns and/or column references.
		 * @param selectableAttributes An Array of IColumnWrapper and/or ILinkableHashMaps to initialize.
		 * @param input An Array of IAttributeColumn and/or IColumnReference objects. If not specified, getColumnsWithCommonKeyType() will be used.
		 * @see #getColumnsWithCommonKeyType()
		 */
		public static initSelectableAttributes(selectableAttributes:Array<IColumnWrapper | ILinkableHashMap>, input:Array<IAttributeColumn | IColumnReference> = null):void
		{
			if (!input)
				input = ColumnUtils.getColumnsWithCommonKeyType(Weave.getRoot(selectableAttributes[0]));
			
			for (var i:int = 0; i < selectableAttributes.length; i++)
				ColumnUtils.initSelectableAttribute(selectableAttributes[i], input[i % input.length]);
		}
		
		/**
		 * Gets a list of columns with a common keyType.
		 */
		public static getColumnsWithCommonKeyType(root:ILinkableHashMap, keyType:string = null):ReferencedColumn[]
		{
			var columns:ReferencedColumn[] = Weave.getDescendants(root, ReferencedColumn);
			
			// if keyType not specified, find the most common keyType
			if (!keyType)
			{
				var keyTypeCounts:{[keyType:string]:int} = {};
				for (var column of columns || [])
					keyTypeCounts[ColumnUtils.getKeyType(column)] = int(keyTypeCounts[ColumnUtils.getKeyType(column)]) + 1;
				var count:int = 0;
				for (var kt in keyTypeCounts)
					if (keyTypeCounts[kt] > count)
						count = keyTypeCounts[keyType = kt];
			}
			
			// remove columns not of the selected key type
			var n:int = 0;
			for (var i:int = 0; i < columns.length; i++)
				if (ColumnUtils.getKeyType(columns[i]) == keyType)
					columns[n++] = columns[i];
			columns.length = n;
			
			return columns;
		}
		
		public static replaceColumnsInHashMap(destination:ILinkableHashMap, columnReferences:Array<IWeaveTreeNode|IColumnReference>):void
		{
			var className:string = WeaveAPI.ClassRegistry.getClassName(ReferencedColumn);
			var baseName:string = className.split('.').pop();
			var names:string[] = destination.getNames();
			var newState:any[] = [];
			for (var iRef:int = 0; iRef < columnReferences.length; iRef++)
			{
				var ref:IColumnReference = Weave.AS(columnReferences[iRef], IColumnReference);
				if (ref)
				{
					var objectName:string = names[newState.length] || destination.generateUniqueName(baseName);
					var sessionState:any = ReferencedColumn.generateReferencedColumnStateFromColumnReference(ref);
					newState.push(DynamicState.create(objectName, className, sessionState));
				}
			}
			destination.setSessionState(newState, true);
		}
		
		/**
		 * This will initialize one selectable attribute using a column or column reference. 
		 * @param selectableAttribute A selectable attribute (IColumnWrapper/ILinkableHashMap/ReferencedColumn)
		 * @param column_or_columnReference Either an IAttributeColumn or an IColumnReference
		 * @param clearHashMap If the selectableAttribute is an ILinkableHashMap, all objects will be removed from it prior to adding a column.
		 */
		public static initSelectableAttribute(selectableAttribute:IColumnWrapper|ILinkableHashMap, column_or_columnReference:IAttributeColumn|IColumnReference, clearHashMap:boolean = true):void
		{
			var inputCol:IAttributeColumn = Weave.AS(column_or_columnReference, IAttributeColumn);
			var inputRef:IColumnReference = Weave.AS(column_or_columnReference, IColumnReference);
			
			var outputRC:ReferencedColumn = Weave.AS(selectableAttribute, ReferencedColumn);
			if (outputRC)
			{
				var inputRC:ReferencedColumn;
				if (inputCol)
					inputRC = Weave.AS(inputCol, ReferencedColumn)
						|| Weave.AS(Weave.getDescendants(inputCol, ReferencedColumn)[0], ReferencedColumn);
				
				if (inputRC)
					Weave.copyState(inputRC, outputRC);
				else if (inputRef)
					outputRC.setColumnReference(inputRef.getDataSource(), inputRef.getColumnMetadata());
				else
					outputRC.setColumnReference(null, null);
			}
			
			var foundGlobalColumn:boolean = false;
			if (Weave.IS(selectableAttribute, DynamicColumn))
				foundGlobalColumn = Weave.AS(selectableAttribute, DynamicColumn).targetPath != null;
			if (Weave.IS(selectableAttribute, ExtendedDynamicColumn))
				foundGlobalColumn = Weave.AS(selectableAttribute, ExtendedDynamicColumn).internalDynamicColumn.targetPath != null;
			var outputDC:DynamicColumn = ColumnUtils.hack_findInternalDynamicColumn(Weave.AS(selectableAttribute, IColumnWrapper));
			if (outputDC && (outputDC.getInternalColumn() == null || !foundGlobalColumn))
			{
				if (inputCol)
				{
					if (Weave.IS(inputCol, DynamicColumn))
						Weave.copyState(inputCol, outputDC);
					else
						outputDC.requestLocalObjectCopy(inputCol);
				}
				else if (inputRef)
					(
						outputDC.requestLocalObject(ReferencedColumn, false) as ReferencedColumn
					).setColumnReference(
						inputRef.getDataSource(),
						inputRef.getColumnMetadata()
					);
				else
					outputDC.removeObject();
			}
			
			var outputHash:ILinkableHashMap = Weave.AS(selectableAttribute, ILinkableHashMap);
			if (outputHash)
			{
				if (clearHashMap)
					outputHash.removeAllObjects()
				if (inputCol)
					outputHash.requestObjectCopy(null, inputCol);
				else if (inputRef)
					(
						outputHash.requestObject(null, ReferencedColumn, false) as ReferencedColumn
					).setColumnReference(
						inputRef.getDataSource(),
						inputRef.getColumnMetadata()
					);
			}
		}
		
		//todo: (cached) get sorted index from a key and a column
		
		//todo: (cached) get bins from a column with a filter applied
		
		public static unlinkNestedColumns(columnWrapper:IColumnWrapper):void
		{
			var col:IColumnWrapper = columnWrapper;
			while (col)
			{
				var dc:DynamicColumn = Weave.AS(col, DynamicColumn);
				var edc:ExtendedDynamicColumn = Weave.AS(col, ExtendedDynamicColumn);
				if (dc && dc.globalName) // if linked
				{
					// unlink
					dc.globalName = null;
					// prevent infinite loop
					if (dc.globalName)
						break;
					// restart from selected
					col = columnWrapper;
				}
				else if (edc && edc.internalDynamicColumn.globalName) // if linked
				{
					// unlink
					edc.internalDynamicColumn.globalName = null;
					// prevent infinite loop
					if (edc.internalDynamicColumn.globalName)
						break;
					// restart from selected
					col = columnWrapper;
				}
				else
				{
					// get nested column
					col = col.getInternalColumn() as IColumnWrapper;
				}
			}
		}
	}
}
