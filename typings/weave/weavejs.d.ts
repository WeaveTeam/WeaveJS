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
}

declare class KeySet extends weavejs_fake.api.core.ICallbackCollection {
	keys: Array<IQualifiedKey>;
	replaceKeys(keys: Array<IQualifiedKey>): boolean;
	clearKeys(): boolean;
	containsKey(key: IQualifiedKey): boolean;
	addKeys(additionalKeys: Array<IQualifiedKey>): boolean;
	removeKeys(unwantedKeys: Array<IQualifiedKey>): boolean;
}