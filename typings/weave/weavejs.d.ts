declare var Weave:any;
declare type Weave = any;
declare type IAttributeColumn = any;
declare type IColumnStatistics = any
declare type ILinkableDynamicObject = any;
declare type ColumnDataFilter = any;
declare type WeavePath = any;

declare type Record = {id: weavejs.api.data.IQualifiedKey, [name:string]: any};

declare module weavejs
{
	module api
	{
		module core
		{
			class ILinkableObject { }
			
			class ILinkableVariable
			{
				getSessionState():Object;
				setSessionState(value:Object):void;
			}
			
			class ILinkableCompositeObject extends ILinkableObject
			{
				getSessionState(): any[];
				setSessionState(newState: any[], removeMissingDynamicObjects: boolean): void;
			}
			
			class ICallbackCollection extends ILinkableObject
			{
				addImmediateCallback(relevantContext: any, callback: Function, runCallbackNow?: boolean, alwaysCallLast?: boolean): void;
				addGroupedCallback(relevantContext: any, groupedCallback: Function, runCallbackNow?: boolean, delayWhileBusy?: boolean): void;
				addDisposeCallback(relevantContext: any, callback: Function): void;
				removeCallback(relevantContext: any, callback: Function): void;
				triggerCallbacks(): void;
				delayCallbacks(): void;
				resumeCallbacks(): void;
				
				callbacksAreDelayed: boolean;
				triggerCounter: number;
			}
			
			class ILinkableHashMap extends ILinkableCompositeObject
			{
				typeRestriction: Function;
				childListCallbacks: any;
				
				setNameOrder(newOrder: string[]);
				getNames(filter?:Function, filterIncludesPlaceholders?:boolean): string[];
				getObjects(filter?:Function, filterIncludesPlaceholders?:boolean): ILinkableObject[];
				getObject(name: string): ILinkableObject;
				getName(object: ILinkableObject): string;
				requestObject(name: string, classDef: Function, lockObject: boolean): any;
				requestObjectCopy(name: string, objectToCopy: ILinkableObject): ILinkableObject;
				renameObject(oldName: string, newName: String): ILinkableObject;
				objectIsLocked(name: string): boolean;
				removeObject(name: string): void;
				removeAllObjects(): void;
				generateUniqueName(baseName: string): string;
			}
			
			var ILinkableDynamicObject:any;
			
			class ILinkableObjectWithNewProperties
			{
				handleMissingSessionStateProperties(newState:Object):void;
			}
		}
		
		module data
		{
			class IQualifiedKey
			{
				keyType: string;
				localName: string;
				toNumber(): number;
				toString(): string;
			}
			
			class IKeyFilter
			{
				containsKey(key: weavejs.api.data.IQualifiedKey): boolean;
			}
			
			class IKeySet extends IKeyFilter
			{
				keys: weavejs.api.data.IQualifiedKey[];
			}
			
			class IAttributeColumn extends IKeySet
			{
				getMetadata(propertyName: string): string;
				getMetadataPropertyNames(): string[];
				getValueFromKey(key: weavejs.api.data.IQualifiedKey, dataType?: Function);
			}
			
			var IColumnStatistics:any;
		}
	}
	
	module core
	{
		class LinkableVariable
		{
			state:Object;
		}
		
		class LinkableBoolean extends LinkableVariable
		{
			value:boolean;
		}
		
		class LinkableNumber extends LinkableVariable
		{
			value:number;
		}
		
		class LinkableString extends LinkableVariable
		{
			value:string;
		}
		
		var WeaveArchive: any;
	}
	
	module data
	{
		module column
		{
			class DynamicColumn extends weavejs.api.data.IAttributeColumn
			{
			}
			
			class ExtendedDynamicColumn extends weavejs.api.data.IAttributeColumn
			{
				internalDynamicColumn():DynamicColumn;
			}
			
			class ColorColumn extends ExtendedDynamicColumn
			{
				ramp: weavejs.util.ColorRamp;
			}
		}
		
		module key
		{
			class KeySet extends weavejs.api.data.IKeySet
			{
				replaceKeys(keys: weavejs.api.data.IQualifiedKey[]): boolean;
				clearKeys(): boolean;
				addKeys(additionalKeys: weavejs.api.data.IQualifiedKey[]): boolean;
				removeKeys(unwantedKeys: weavejs.api.data.IQualifiedKey[]): boolean;
			}
			
			class FilteredKeySet extends weavejs.api.data.IKeySet
			{
				setColumnKeySources(columns:weavejs.api.data.IAttributeColumn[], sortDirections?:number[], keySortCopy?:Function, keyInclusionLogic?:Function):void;
				setSingleKeySource(keySet:weavejs.api.data.IKeySet):void;
			}
			
			var ColumnDataFilter:any;
		}
		
		var ColumnUtils:any;
	}
	
	module util
	{
		class ColorRamp extends weavejs.core.LinkableVariable
		{
		}
		
		class Dictionary2D<K1,K2,V>
		{
			constructor(weak1?:boolean, weak2?:boolean, defaultType?:Function);
			get(key1:K1, key2:K2):V;
			set(key1:K1, key2:K2, value:V):void;
			remove(key1:K1, key2:K2):V;
			primaryKeys():K1[];
			secondaryKeys(key1:K1):K2[];
			removeAllPrimary(key1:K1):void;
			removeAllSecondary(key2:K2):void;
		}
		
		var JS:any;
	}
	
	var WeaveAPI:{
		Scheduler:any;
		Locale:any;
		URLRequestUtils:any;
	};
}
