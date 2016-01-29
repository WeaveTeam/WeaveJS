declare var weavejs:any;

declare class IQualifiedKey {
	keyType: string;
	localName: string;
	toNumber(): number;
	toString(): string;
}

declare module weavejs_fake.api.core {
	class ILinkableObject {

	}

	class ILinkableCompositeObject extends ILinkableObject {
		getSessionState(): Array<any>;
		setSessionState(newState: Array<any>, removeMissingDynamicObjects: boolean): void;
	}

	class ICallbackCollection extends ILinkableObject {
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

	class ILinkableHashMap extends ILinkableCompositeObject {
		typeRestriction: Function;
		childListCallbacks: any;

		setNameOrder(newOrder: Array<string>);
		getNames(classFilter: Function): Array<string>;
		getObjects(classFilter: Function): Array<ILinkableObject>;
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
}

declare module weavejs_fake.api.data
{
	class IKeyFilter {
		containsKey(key: IQualifiedKey): boolean;
	}

	class IKeySet {
		keys: Array<IQualifiedKey>;
	}

	class IAttributeColumn extends IKeySet {
		getMetadata(propertyName: string): string;
		getMetadataPropertyNames(): Array<string>;
		getValueFromKey(key: IQualifiedKey, dataType?: Function);
	}
}

declare class KeySet extends weavejs_fake.api.core.ICallbackCollection implements weavejs_fake.api.data.IKeySet {
	keys: Array<IQualifiedKey>;
	replaceKeys(keys: Array<IQualifiedKey>): boolean;
	clearKeys(): boolean;
	containsKey(key: IQualifiedKey): boolean;
	addKeys(additionalKeys: Array<IQualifiedKey>): boolean;
	removeKeys(unwantedKeys: Array<IQualifiedKey>): boolean;
}
