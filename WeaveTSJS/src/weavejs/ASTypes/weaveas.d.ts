declare module __global__ {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import SessionStateLog = weavejs.core.SessionStateLog;
    import WeavePath = weavejs.path.WeavePath;
    class Weave implements IDisposableObject {
        static HISTORY_SYNC_DELAY: number;
        static FRAME_INTERVAL: number;
        static beta: boolean;
        constructor();
        dispose(): void;
        /**
         * The root object in the session state
         */
        root: ILinkableHashMap;
        /**
         * The session history
         */
        history: SessionStateLog;
        /**
         * For backwards compatibility, may be temporary solution
         */
        macro(name: string, ...params: any[]): any;
        /**
         * Creates a WeavePath object.  WeavePath objects are immutable after they are created.
         * This is a shortcut for "new WeavePath(weave, basePath)".
         * @param basePath An optional Array (or multiple parameters) specifying the path to an object in the session state.
         *                 A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return A WeavePath object.
         * @see WeavePath
         */
        path(...basePath: (string | number | (string | number)[])[]): WeavePath;
        /**
         * Gets the ILinkableObject at a specified path.
         * @param path An Array (or multiple parameters) specifying the path to an object in the session state.
         *             A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         */
        getObject(...path: (string | number | (string | number)[])[]): ILinkableObject;
        /**
         * Requests that an object be created if it doesn't already exist at the given path.
         * @param path The path
         * @param type The type
         * @return Either an instance of the requested type, or null if the object could not be created or a LinkablePlaceholder was created.
         */
        requestObject<T>(path: Array<string | number>, type: Class<T> | string): T;
        /**
         * Removes an object at the given path.
         * @param path The path
         */
        removeObject(path: Array<string | number>): void;
        /**
         * Finds the Weave instance for a given Object.
         * @param object An Object.
         * @return The Weave instance, or null if the object was not registered as an ancestor of any instance of Weave.
         */
        static getWeave(object: Object): Weave;
        /**
         * Gets a WeavePath from an ILinkableObject.
         * @param object An ILinkableObject.
         * @return A WeavePath, or null if the object is not registered with a Weave instance.
         */
        static getPath(object: ILinkableObject): WeavePath;
        /**
         * Shortcut for WeaveAPI.SessionManager.getPath()
         * @copy weave.api.core.ISessionManager#getPath()
         */
        static findPath(root: ILinkableObject, descendant: ILinkableObject): Array<string>;
        /**
         * Shortcut for WeaveAPI.SessionManager.getObject()
         * @copy weave.api.core.ISessionManager#getObject()
         */
        static followPath(root: ILinkableObject, path: Array<string | number>): ILinkableObject;
        /**
         * Shortcut for WeaveAPI.SessionManager.getCallbackCollection()
         * @copy weave.api.core.ISessionManager#getCallbackCollection()
         */
        static getCallbacks(linkableObject: ILinkableObject): ICallbackCollection;
        /**
         * This function is used to detect if callbacks of a linkable object were triggered since the last time this function
         * was called with the same parameters, likely by the observer.  Note that once this function returns true, subsequent calls will
         * return false until the callbacks are triggered again.  It's a good idea to specify a private object or function as the observer
         * so no other code can call detectChange with the same observer and linkableObject parameters.
         * @param observer The object that is observing the change.
         * @param linkableObject The object that is being observed.
         * @param moreLinkableObjects More objects that are being observed.
         * @return A value of true if the callbacks for any of the objects have triggered since the last time this function was called
         *         with the same observer for any of the specified linkable objects.
         */
        static detectChange(observer: Object, linkableObject: ILinkableObject, ...moreLinkableObjects: Array<ILinkableObject>): boolean;
        /**
         * Finds the root ILinkableHashMap for a given ILinkableObject.
         * @param object An ILinkableObject.
         * @return The root ILinkableHashMap.
         */
        static getRoot(object: ILinkableObject): ILinkableHashMap;
        /**
         * Finds the closest ancestor of a descendant given the ancestor type.
         * @param descendant An object with ancestors.
         * @param ancestorType The Class definition used to determine which ancestor to return.
         * @return The closest ancestor of the given type.
         * @see weave.api.core.ISessionManager#getLinkableOwner()
         */
        static getAncestor<T>(descendant: ILinkableObject, ancestorType: Class<T> | string): T & ILinkableObject;
        /**
         * Shortcut for WeaveAPI.SessionManager.getLinkableOwner()
         * @copy weave.api.core.ISessionManager#getLinkableOwner()
         */
        static getOwner(child: ILinkableObject): ILinkableObject;
        /**
         * Shortcut for WeaveAPI.SessionManager.getLinkableDescendants()
         * @copy weave.api.core.ISessionManager#getLinkableDescendants()
         */
        static getDescendants<T>(object: ILinkableObject, filter?: Class<T> | string): Array<T & ILinkableObject>;
        /**
         * Shortcut for WeaveAPI.SessionManager.getSessionState()
         * @copy weave.api.core.ISessionManager#getSessionState()
         */
        static getState(linkableObject: ILinkableObject): Object;
        /**
         * Shortcut for WeaveAPI.SessionManager.setSessionState()
         * @copy weave.api.core.ISessionManager#setSessionState()
         */
        static setState(linkableObject: ILinkableObject, newState: Object, removeMissingDynamicObjects?: boolean): void;
        /**
         * Shortcut for WeaveAPI.SessionManager.copySessionState()
         * @copy weave.api.core.ISessionManager#copySessionState()
         */
        static copyState(source: ILinkableObject, destination: ILinkableObject): void;
        /**
         * Shortcut for WeaveAPI.SessionManager.linkSessionState()
         * @copy weave.api.core.ISessionManager#linkSessionState()
         */
        static linkState(primary: ILinkableObject, secondary: ILinkableObject): void;
        /**
         * Shortcut for WeaveAPI.SessionManager.unlinkSessionState()
         * @copy weave.api.core.ISessionManager#unlinkSessionState()
         */
        static unlinkState(first: ILinkableObject, second: ILinkableObject): void;
        /**
         * Shortcut for WeaveAPI.SessionManager.computeDiff()
         * @copy weave.api.core.ISessionManager#computeDiff()
         */
        static computeDiff(oldState: Object, newState: Object): Object;
        /**
         * Shortcut for WeaveAPI.SessionManager.combineDiff()
         * @copy weave.api.core.ISessionManager#combineDiff()
         */
        static combineDiff(baseDiff: Object, diffToAdd: Object): Object;
        /**
         * Shortcut for WeaveAPI.SessionManager.newDisposableChild() and WeaveAPI.SessionManager.registerDisposableChild()
         * @see weave.api.core.ISessionManager#newDisposableChild()
         * @see weave.api.core.ISessionManager#registerDisposableChild()
         */
        static disposableChild<T>(disposableParent: Object, disposableChildOrType: (new () => T) | T): T;
        /**
         * Shortcut for WeaveAPI.SessionManager.newLinkableChild() and WeaveAPI.SessionManager.registerLinkableChild()
         * @see weave.api.core.ISessionManager#newLinkableChild()
         * @see weave.api.core.ISessionManager#registerLinkableChild()
         */
        static linkableChild<T extends ILinkableObject>(linkableParent: Object, linkableChildOrType: (new () => T) | T, callback?: Function, useGroupedCallback?: boolean): T;
        /**
         * Shortcut for WeaveAPI.SessionManager.newLinkableChild() and WeaveAPI.SessionManager.registerLinkableChild() except the child will not be included in the session state.
         * @see weave.api.core.ISessionManager#newLinkableChild()
         * @see weave.api.core.ISessionManager#registerLinkableChild()
         */
        static privateLinkableChild<T extends ILinkableObject>(linkableParent: Object, linkableChildOrType: (new () => T) | T, callback?: Function, useGroupedCallback?: boolean): T;
        /**
         * Shortcut for WeaveAPI.SessionManager.disposeObject()
         * @copy weave.api.core.ISessionManager#disposeObject()
         */
        static dispose(object: Object): void;
        /**
         * Shortcut for WeaveAPI.SessionManager.objectWasDisposed()
         * @copy weave.api.core.ISessionManager#objectWasDisposed()
         */
        static wasDisposed(object: Object): boolean;
        /**
         * Shortcut for WeaveAPI.SessionManager.linkableObjectIsBusy()
         * @copy weave.api.core.ISessionManager#linkableObjectIsBusy()
         */
        static isBusy(object: ILinkableObject): boolean;
        /**
         * Checks if an object or class implements ILinkableObject
         */
        static isLinkable(objectOrClass: Object): boolean;
        /**
         * @return (object is type)
         */
        static IS(object: Object, type: new (..._: any[]) => any): boolean;
        /**
         * @return (object as type)
         */
        static AS<T>(object: Object, type: Class<T>): T;
        /**
         * Registers a class that must be instantiated asynchronously.
         * Dynamic items in the session state that extend this class will be replaced with
         * LinkablePlaceholder objects that can be replaced with actual instances later.
         */
        static registerAsyncClass<T>(type: Class<T>, instanceHandler: (instance: T) => void): void;
        /**
         * Checks if a class is or extends one that was registered through registerAsyncClass().
         */
        static isAsyncClass(type: new (..._: any[]) => any): boolean;
        /**
         * Gets the function that was passed in to registerAsyncClass() for a given type.
         */
        static getAsyncInstanceHandler(type: new (..._: any[]) => any): Function;
        /**
         * Registers an ILinkableObject class for use with Weave.className() and Weave.getDefinition().
         * @param definition The class definition.
         * @param qualifiedName Either a single String or an Array of Strings which are qualified class names under which to register the class definition.
         * @param additionalInterfaces An Array of interfaces (Class objects) that the definition implements in addition to ILinkableObject.
         * @param displayName An optional display name for the class definition.
         */
        static registerClass(definition: GenericClass, qualifiedName: string | string[], additionalInterfaces?: Array<GenericClass>, displayName?: string): void;
        /**
         * Decorator-generator for registering a class.
         * @param  info An object containing the class info.
         * @return      A function which takes a definition and applies the supplied info.
         */
        static classInfo(info: {
            id: string;
            label?: string;
            interfaces?: Array<GenericClass>;
            deprecatedIds?: string[];
            linkable?: boolean;
        }): (constructor: GenericClass) => void;
        /**
         * Registers a class.
         * @param definition The class definition.
         * @param info An object containing the class info.
         * @return The same info object passed in as a parameter.
         */
        static setClassInfo(definition: GenericClass, info: {
            id: string;
            label?: string;
            interfaces?: Array<GenericClass>;
            deprecatedIds?: string[];
            linkable?: boolean;
        }): typeof info;
        /**
         * Gets the qualified class name from a class definition or an object instance.
         */
        static className(def: Object): string;
        /**
         * Looks up a static definition by name.
         */
        static getDefinition(name: string, throwIfNotFound?: boolean): any;
        /**
         * Generates a deterministic JSON-like representation of an object, meaning object keys appear in sorted order.
         * @param value The object to stringify.
         * @param replacer A function like function(key:String, value:*):*
         * @param indent Either a Number or a String to specify indentation of nested values
         * @param json_values_only If this is set to true, only JSON-compatible values will be used (NaN/Infinity/undefined -> null)
         */
        static stringify(value: any, replacer?: Function, indent?: any, json_values_only?: boolean): string;
        /**
         * This is a convenient global function for retrieving localized text.
         * Sample syntax:
         *     Weave.lang("hello world")
         *
         * You can also specify a format string with parameters which will be passed to StandardLib.substitute():
         *     Weave.lang("{0} and {1}", first, second)
         *
         * @param text The original text or format string to translate.
         * @param parameters Parameters to be passed to StandardLib.substitute() if the text is to be treated as a format string.
         */
        static lang(text: string, ...parameters: any[]): string;
        /**
         * For testing purposes.
         */
        /**
         * For testing purposes.
         */
        /**
         * For testing purposes.
         */
        /**
         * For testing purposes.
         */
        /**
         * Shortcut for DebugUtils.debugId() and DebugUtils.debugLookup()
         */
        static id(arg?: any): any;
    }
}
import Weave = __global__.Weave;
declare module __global__ {
    class WeaveJS {
        constructor();
        start(): void;
    }
}
import WeaveJS = __global__.WeaveJS;
declare module __global__ {
    class WeaveTest {
        static test(weave: Weave): void;
    }
}
import WeaveTest = __global__.WeaveTest;
declare module weavejs {
    import IClassRegistry = weavejs.api.core.IClassRegistry;
    import ILocale = weavejs.api.core.ILocale;
    import IProgressIndicator = weavejs.api.core.IProgressIndicator;
    import IScheduler = weavejs.api.core.IScheduler;
    import ISessionManager = weavejs.api.core.ISessionManager;
    import IEditorManager = weavejs.api.ui.IEditorManager;
    /**
     * Static functions for managing implementations of Weave framework classes.
     *
     * @author adufilie
     */
    class WeaveAPI {
        /**
         * Set this to true to enable stack traces for debugging.
         */
        static debugAsyncStack: boolean;
        /**
         * Set to true to clearly see where Locale is being used.
         */
        static debugLocale: boolean;
        /**
         * For use with StageUtils.startTask(); this priority is used for things that MUST be done before anything else.
         * Tasks having this priority will take over the scheduler and prevent any other asynchronous task from running until it is completed.
         */
        static TASK_PRIORITY_IMMEDIATE: number;
        /**
         * For use with StageUtils.startTask().
         */
        static TASK_PRIORITY_HIGH: number;
        /**
         * For use with StageUtils.startTask().
         */
        static TASK_PRIORITY_NORMAL: number;
        /**
         * For use with StageUtils.startTask().
         */
        static TASK_PRIORITY_LOW: number;
        /**
         * This is the singleton instance of the registered ISessionManager implementation.
         */
        static ClassRegistry: IClassRegistry;
        /**
         * This is the singleton instance of the registered ISessionManager implementation.
         */
        static SessionManager: ISessionManager;
        /**
         * This is the singleton instance of the registered IScheduler implementation.
         */
        static Scheduler: IScheduler;
        /**
         * This is the singleton instance of the registered IProgressIndicator implementation.
         */
        static ProgressIndicator: IProgressIndicator;
        /**
         * This is the singleton instance of the registered IAttributeColumnCache implementation.
         */
        static AttributeColumnCache: any;
        /**
         * This is the singleton instance of the registered IStatisticsCache implementation.
         */
        static StatisticsCache: any;
        /**
         * This is the singleton instance of the registered IQualifiedKeyManager implementation.
         */
        static QKeyManager: any;
        /**
         * This is the singleton instance of the registered ICSVParser implementation.
         */
        static CSVParser: any;
        /**
         * This is the singleton instance of the registered IURLRequestUtils implementation.
         */
        static URLRequestUtils: any;
        /**
         * This is the singleton instance of the registered ILocaleManager implementation.
         */
        static Locale: ILocale;
        /**
         * This is the singleton instance of the registered IEditorManager implementation.
         */
        static EditorManager: IEditorManager;
    }
}

declare module weavejs.api.core {
    /**
     * This is an interface for adding and removing callback functions, and triggering them.
     *
     * @author adufilie
     */
    interface ICallbackCollection extends ILinkableObject {
        /**
         * This adds the given function as a callback.  The function must not require any parameters.
         * The callback function will not be called recursively as a result of it triggering callbacks recursively.
         * @param relevantContext The 'this' argument for the callback. The callback will be removed when the relevantContext object is disposed via Weave.dispose().
         * @param callback The function to call when callbacks are triggered.
         * @param runCallbackNow If this is set to true, the callback will be run immediately after it is added.
         * @param alwaysCallLast If this is set to true, the callback will be always be called after any callbacks that were added with alwaysCallLast=false.  Use this to establish the desired child-to-parent triggering order.
         */
        addImmediateCallback(relevantContext: Object, callback: Function, runCallbackNow?: boolean, alwaysCallLast?: boolean): void;
        /**
         * Adds a callback that will only be called during a scheduled time each frame.  Grouped callbacks use a central trigger list,
         * meaning that if multiple ICallbackCollections trigger the same grouped callback before the scheduled time, it will behave as
         * if it were only triggered once.  For this reason, grouped callback functions cannot have any parameters.  Adding a grouped
         * callback to a ICallbackCollection will undo any previous effects of addImmediateCallback() or addDisposeCallback() made to the
         * same ICallbackCollection.  The callback function will not be called recursively as a result of it triggering callbacks recursively.
         * @param relevantContext The 'this' argument for the callback. The callback will be removed when the relevantContext object is disposed via Weave.dispose().
         * @param groupedCallback The callback function that will only be allowed to run during a scheduled time each frame.  It must not require any parameters.
         * @param triggerCallbackNow If this is set to true, the callback will be triggered to run during the scheduled time after it is added.
         * @param delayWhileBusy Specifies whether to delay the callback while the object is busy.
         *                       Once a given relevantContext/groupedCallback pair has been added with delayWhileBusy enabled,
         *                       it will remain enabled even if the delayWhileBusy parameter is set to false in subsequent calls
         *                       to addGroupedCallback() with the same relevantContext/groupedCallback parameters.
         */
        addGroupedCallback(relevantContext: Object, groupedCallback: Function, triggerCallbackNow?: boolean, delayWhileBusy?: boolean): void;
        /**
         * This will add a callback that will only be called once, when this callback collection is disposed.
         * @param relevantContext If this is not null, then the callback will be removed when the relevantContext object is disposed via SessionManager.dispose().  This parameter is typically a 'this' pointer.
         * @param callback The function to call when this callback collection is disposed.
         * @param allowDelay If this is set to true, this callback will be delayed while callbacksAreDelayed is true.
         */
        addDisposeCallback(relevantContext: Object, callback: Function, allowDelay?: boolean): void;
        /**
         * This function will remove a callback that was previously added.
         * @param relevantContext The relevantContext parameter that was given when the callback was added.
         * @param callback The function to remove from the list of callbacks.
         */
        removeCallback(relevantContext: Object, callback: Function): void;
        /**
         * This will increase the triggerCounter, run immediate callbacks, and trigger grouped callbacks to be called later.
         * If delayCallbacks() was called, the callbacks will not be called immediately.
         * @see #delayCallbacks()
         */
        triggerCallbacks(): void;
        /**
         * This counter gets incremented at the time that callbacks are triggered, before they are actually called.
         * It is necessary in some situations to check this counter to determine if cached data should be used.
         * @see #triggerCallbacks()
         */
        triggerCounter: number;
        /**
         * This will delay the effects of triggerCallbacks() until a matching call is made to resumeCallbacks().
         * Pairs of calls to delayCallbacks() and resumeCallbacks() can be nested.
         * @see #resumeCallbacks()
         * @see #callbacksAreDelayed
         */
        delayCallbacks(): void;
        /**
         * This should be called after delayCallbacks() to resume the callbacks.
         * If delayCallbacks() is called multiple times, resumeCallbacks() must be called the same number of times in order to resume the callbacks.
         * @see #delayCallbacks()
         * @see #callbacksAreDelayed
         */
        resumeCallbacks(): void;
        /**
         * While this is true, it means the delay count is greater than zero and the effects of
         * triggerCallbacks() are delayed until resumeCallbacks() is called to reduce the delay count.
         * @see #delayCallbacks()
         * @see #resumeCallbacks()
         */
        callbacksAreDelayed: boolean;
    }
    var ICallbackCollection: new (..._: any[]) => ICallbackCollection;
}
declare module weavejs.api.core {
    /**
     * This is an interface for adding and removing callbacks that get triggered when
     * a child object is added or removed.  The accessor functions in this interface
     * return values that are only defined while immediate callbacks are running, not
     * during grouped callbacks.
     *
     * @author adufilie
     */
    interface IChildListCallbackInterface extends ICallbackCollection {
        /**
         * This is the object that was added prior to running immediate callbacks.
         */
        lastObjectAdded: ILinkableObject;
        /**
         * This is the name of the object that was added prior to running immediate callbacks.
         */
        lastNameAdded: string;
        /**
         * This is the object that was removed prior to running immediate callbacks.
         */
        lastObjectRemoved: ILinkableObject;
        /**
         * This is the name of the object that was removed prior to running immediate callbacks.
         */
        lastNameRemoved: string;
    }
    var IChildListCallbackInterface: new (..._: any[]) => IChildListCallbackInterface;
}
declare module weavejs.api.core {
    interface IClassRegistry {
        /**
         * Registers a class under a given qualified name and adds metadata about implementing interfaces.
         * @param definition The class definition.
         * @param qualifiedName The qualified class name under which to register the class definition.
         * @param interfaces An Array of Class objects that are the interfaces the class implements.
         * @param displayName An optional display name for the class definition.
         */
        registerClass(definition: new (..._: any[]) => any, qualifiedName: string, interfaces?: Array<GenericClass>, displayName?: string): void;
        /**
         * Gets the qualified class name from a class definition or an object instance.
         */
        getClassName(definition: Object): string;
        /**
         * Looks up a static definition by name.
         */
        getDefinition(name: string): any;
        /**
         * Gets FlexJS class info.
         * @param class_or_instance Either a Class or an instance of a Class.
         * @return FlexJS class info object containing properties "variables", "accessors", and "methods",
         *         each being an Array of Objects like {type:String, declaredBy:String}
         */
        getClassInfo(class_or_instance: Object): {
            variables: {
                [name: string]: {
                    type: string;
                };
            }[];
            accessors: {
                [name: string]: {
                    type: string;
                    declaredBy: string;
                };
            }[];
            methods: {
                [name: string]: {
                    type: string;
                    declaredBy: string;
                };
            }[];
        };
        /**
         * This function returns the singleton instance for a registered interface.
         *
         * This method should not be called at static initialization time,
         * because the implementation may not have been registered yet.
         *
         * @param theInterface An interface to a singleton class.
         * @return The singleton instance that implements the specified interface.
         */
        getSingletonInstance(theInterface: GenericClass): any;
        /**
         * This will register an implementation of an interface.
         * @param theInterface The interface class.
         * @param theImplementation An implementation of the interface.
         * @param displayName An optional display name for the implementation.
         */
        registerImplementation<T>(theInterface: Class<T>, theImplementation: Class<T>, displayName?: string): void;
        /**
         * This will get an Array of class definitions that were previously registered as implementations of the specified interface.
         * @param theInterface The interface class.
         * @return An Array of class definitions that were previously registered as implementations of the specified interface.
         */
        getImplementations<T>(theInterface: Class<T>): Array<Class<T>>;
        /**
         * This will get the displayName that was specified when an implementation was registered with registerImplementation().
         * @param theImplementation An implementation that was registered with registerImplementation().
         * @return The display name for the implementation.
         */
        getDisplayName(theImplementation: new (..._: any[]) => any): string;
    }
    var IClassRegistry: new (..._: any[]) => IClassRegistry;
}
declare module weavejs.api.core {
    /**
     * This is an interface for an object that should be cleaned up when it is no longer needed.
     * It is recommended not to extend IDisposableObject in an interface.  Instead, make the
     * implementation of that interface implement IDisposableObject.
     * @see weave.api.disposeObject()
     * @author adufilie
     */
    interface IDisposableObject {
        /**
         * This function will be called automatically when the object is no longer needed, and should not be called directly.
         * Use disposeObject() instead so parent-child relationships get cleaned up automatically.
         * @see weave.api.disposeObject()
         */
        dispose(): void;
    }
    var IDisposableObject: new (..._: any[]) => IDisposableObject;
}
declare module weavejs.api.core {
    /**
     * This is an interface to a composite object with dynamic state, meaning child objects can be dynamically added or removed.
     * The session state for this type of object is defined as an Array of DynamicState objects.
     * DynamicState objects are defined as having exactly three properties: objectName, className, and sessionState.
     * @see weave.api.core.DynamicState
     *
     * @author adufilie
     */
    interface ILinkableCompositeObject extends ILinkableObject {
        /**
         * This gets the session state of this composite object.
         * @return An Array of DynamicState objects which compose the session state for this object.
         * @see weave.api.core.DynamicState
         */
        getSessionState(): any[];
        /**
         * This sets the session state of this composite object.
         * @param newState An Array of child name Strings or DynamicState objects containing the new values and types for child ILinkableObjects.
         * @param removeMissingDynamicObjects If true, this will remove any child objects that do not appear in the session state.
         *     As a special case, a null session state will result in no change regardless of the removeMissingDynamicObjects value.
         * @see weave.api.core.DynamicState
         */
        setSessionState(newState: any[], removeMissingDynamicObjects: boolean): void;
    }
    var ILinkableCompositeObject: new (..._: any[]) => ILinkableCompositeObject;
}
declare module weavejs.api.core {
    /**
     * This is an interface for a wrapper around a dynamically created ILinkableObject.
     *
     * @author adufilie
     */
    interface ILinkableDynamicObject extends ILinkableCompositeObject {
        /**
         * This is the local or global internal object.
         */
        internalObject: ILinkableObject;
        /**
         * This is the local or global internal object.
         * Setting this will unset the targetPath.
         */
        target: ILinkableObject;
        /**
         * This is the path that is currently being watched for linkable object targets.
         */
        targetPath: Array<string | number>;
        /**
         * This will set a path which should be watched for new targets.
         * Callbacks will be triggered immediately if the path points to a new target.
         * @param newPath The new path to watch.
         */
        /**
         * Checks if the target is currently a placeholder for an instance of an async class.
         * @return true if the target is a placeholder.
         * @see Weave#registerAsyncClass()
         */
        foundPlaceholder: boolean;
        /**
         * This function creates a global object using the given Class definition if it doesn't already exist.
         * If the object gets disposed later, this object will still be linked to the global name.
         * If the existing object under the specified name is locked, this function will not modify it.
         * @param name The name of the global object to link to.
         * @param objectType The Class used to initialize the object.
         * @param lockObject If this is true, this object will be locked so the internal object cannot be removed or replaced.
         * @return The global object of the requested name and type, or null if the object could not be created.
         */
        requestGlobalObject<T extends ILinkableObject>(name: string, objectType: Class<T> | string, lockObject?: boolean): T;
        /**
         * This function creates a local object using the given Class definition if it doesn't already exist.
         * If this object is locked, this function does nothing.
         * @param objectType The Class used to initialize the object.
         * @param lockObject If this is true, this object will be locked so the internal object cannot be removed or replaced.
         * @return The local object of the requested type, or null if the object could not be created.
         */
        requestLocalObject<T extends ILinkableObject>(objectType: Class<T> | string, lockObject?: boolean): T;
        /**
         * This function will copy the session state of an ILinkableObject to a new local internalObject of the same type.
         * @param objectToCopy An object to copy the session state from.
         */
        requestLocalObjectCopy(objectToCopy: ILinkableObject): void;
        /**
         * This function will lock the internal object in place so it will not be removed.
         */
        lock(): void;
        /**
         * This is set to true when lock() is called.
         * Subsequent calls to setSessionState() will have no effect.
         */
        locked: boolean;
        /**
         * If the internal object is local, this will remove the object (unless it is locked).
         * If the internal object is global, this will remove the link to it.
         */
        removeObject(): void;
    }
    var ILinkableDynamicObject: new (..._: any[]) => ILinkableDynamicObject;
}
declare module weavejs.api.core {
    /**
     * Allows dynamically creating instances of objects implementing ILinkableObject at runtime.
     * The session state is an Array of DynamicState objects.
     * @see weave.core.DynamicState
     *
     * @author adufilie
     */
    interface ILinkableHashMap extends ILinkableCompositeObject {
        /**
         * The child type restriction, or null if there is none.
         */
        typeRestriction: new (..._: any[]) => any;
        /**
         * This is an interface for adding and removing callbacks that will get triggered immediately
         * when an object is added or removed.
         * @return An interface for adding callbacks that get triggered when the list of child objects changes.
         */
        childListCallbacks: IChildListCallbackInterface;
        /**
         * This will reorder the names returned by getNames().
         * Any names appearing in newOrder that do not appear in getNames() will be ignored.
         * Callbacks will be called if the new name order differs from the old order.
         * @param newOrder The new desired ordering of names.
         */
        setNameOrder(newOrder: Array<string>): void;
        /**
         * This function returns an ordered list of names in the LinkableHashMap.
         * @param filter If specified, names of objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return A copy of the ordered list of names of objects contained in this LinkableHashMap.
         */
        getNames(filter?: GenericClass | string, filterIncludesPlaceholders?: boolean): Array<string>;
        /**
         * This function returns an ordered list of objects in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return An ordered Array of objects that correspond to the names returned by getNames(filter).
         */
        getObjects<T>(filter?: Class<T> | string, filterIncludesPlaceholders?: boolean): Array<T & ILinkableObject>;
        /**
         * This function returns an Object mapping names to objects contained in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return An Object mapping names to objects contained in the LinkableHashMap.
         */
        toObject<T>(filter?: Class<T> | string, filterIncludesPlaceholders?: boolean): {
            [name: string]: T & ILinkableObject;
        };
        /**
         * This function returns a Map containing the entries in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return A Map containing the ordered entries in the LinkableHashMap.
         */
        toMap<T>(filter?: Class<T> | string, filterIncludesPlaceholders?: boolean): Map<String, T & ILinkableObject>;
        /**
         * This function gets the name of the specified object in the LinkableHashMap.
         * @param object An object contained in this LinkableHashMap.
         * @return The name associated with the object, or null if the object was not found.
         */
        getName(object: ILinkableObject): string;
        /**
         * This function gets the object associated with the specified name.
         * @param name The name identifying an object in the LinkableHashMap.
         * @return The object associated with the given name.
         */
        getObject(name: string): ILinkableObject;
        /**
         * Sets an entry in the LinkableHashMap, replacing any existing object under the same name.
         * @param name The identifying name to associate with an object.
         * @param lockObject If this is true, the object will be locked in place under the specified name.
         * @return The object to be associated with the given name.
         */
        setObject(name: string, object: ILinkableObject, lockObject?: boolean): void;
        /**
         * This function creates an object in the LinkableHashMap if it doesn't already exist.
         * If there is an existing object associated with the specified name, it will be kept if it
         * is the specified type, or replaced with a new instance of the specified type if it is not.
         * @param name The identifying name of a new or existing object.
         * @param classDef The Class of the desired object type.
         * @param lockObject If this is true, the object will be locked in place under the specified name.
         * @return The object under the requested name of the requested type, or null if an error occurred.
         */
        requestObject<T>(name: string, classDef: Class<T> | string, lockObject?: boolean): T;
        /**
         * This function will copy the session state of an ILinkableObject to a new object under the given name in this LinkableHashMap.
         * @param newName A name for the object to be initialized in this LinkableHashMap.
         * @param objectToCopy An object to copy the session state from.
         * @return The new object of the same type, or null if an error occurred.
         */
        requestObjectCopy<T extends ILinkableObject>(name: string, objectToCopy: T): T;
        /**
         * This function will rename an object by making a copy and removing the original.
         * @param oldName The name of an object to replace.
         * @param newName The new name to use for the copied object.
         * @return The copied object associated with the new name, or the original object if newName is the same as oldName.
         */
        renameObject(oldName: string, newName: string): ILinkableObject;
        /**
         * This function will return true if the specified object was previously locked.
         * @param name The name of an object.
         */
        objectIsLocked(name: string): boolean;
        /**
         * This function removes an object from the LinkableHashMap.
         * @param name The identifying name of an object previously saved with setObject().
         */
        removeObject(name: string): void;
        /**
         * This function attempts to removes all objects from this LinkableHashMap.
         * Any objects that are locked will remain.
         */
        removeAllObjects(): void;
        /**
         * This will generate a new name for an object that is different from all the names of objects previously used in this LinkableHashMap.
         * @param baseName The name to start with.  If the name is already in use, an integer will be appended to create a unique name.
         */
        generateUniqueName(baseName: string): string;
    }
    var ILinkableHashMap: new (..._: any[]) => ILinkableHashMap;
}
declare module weavejs.api.core {
    /**
     * An object that implements this empty interface has an associated ICallbackCollection and session state,
     * accessible through the global functions in the weave.api package. In order for an ILinkableObject to
     * be created dynamically at runtime, it must not require any constructor parameters.
     */
    interface ILinkableObject {
    }
    var ILinkableObject: new (..._: any[]) => ILinkableObject;
}
declare module weavejs.api.core {
    /**
     * This is an interface for an ILinkableObject which provides a way to determine if it is busy or not,
     * for use with ISessionManager.linkableObjectIsBusy().
     *
     * @see weave.api.core.ISessionManager#linkableObjectIsBusy
     * @author adufilie
     */
    interface ILinkableObjectWithBusyStatus extends ILinkableObject {
        /**
         * This function will override the behavior of ISessionManager.linkableObjectIsBusy().
         * @return A value of true if this object is busy with asynchronous tasks.
         */
        isBusy(): boolean;
    }
    var ILinkableObjectWithBusyStatus: new (..._: any[]) => ILinkableObjectWithBusyStatus;
}
declare module weavejs.api.core {
    /**
     * Implement this interface to specify how to rewrite deprecated session state paths.
     */
    interface ILinkableObjectWithNewPaths extends ILinkableObject {
        /**
         * Receives a deprecated path and returns the new path.
         * @param relativePath The deprecated path.
         * @return The new path.
         */
        deprecatedPathRewrite(relativePath: Array<string | number>): Array<string | number>;
    }
    var ILinkableObjectWithNewPaths: new (..._: any[]) => ILinkableObjectWithNewPaths;
}
declare module weavejs.api.core {
    /**
     * Implement this interface to detect when a full session state is missing properties or a session state contains extra properties.
     */
    interface ILinkableObjectWithNewProperties extends ILinkableObject {
        /**
         * Either a single mapping or an Array of mappings to be used with SessionManager.traverseAndSetState().
         * @see weavejs.core.SessionManager#traverseAndSetState()
         */
        deprecatedStateMapping: Object;
    }
    var ILinkableObjectWithNewProperties: new (..._: any[]) => ILinkableObjectWithNewProperties;
}

declare module weavejs.api.core {
    /**
     * @author adufilie
     */
    interface ILocale {
        reverseLayout: boolean;
        /**
         * A mapping from original text to translated text.
         */
        data: Object;
        /**
         * This will look up the localized version of a piece of text.
         * @param text The original text as specified by the developer.
         * @return The text in the current locale, or the original text if no localization exists.
         */
        getText(text: string): string;
    }
    var ILocale: new (..._: any[]) => ILocale;
}
declare module weavejs.api.core {
    /**
     * This is an interface for a central location to report progress of asynchronous requests.
     * Since this interface extends ILinkableObject, getCallbackCollection() can be used on an IProgressIndicator.
     * Callbacks should be triggered after any action that would change the result of getNormalizedProgress().
     *
     * @author adufilie
     */
    interface IProgressIndicator extends ILinkableObject {
        /**
         * This is the number of active background tasks.
         */
        getTaskCount(): number;
        /**
         * This function will register a background task.
         * @param taskToken A token representing a background task.  If this is an AsyncToken, a responder will be added that will automatically call removeTask(taskToken) on success or failure.
         * @param busyObject An object that is responsible for the task. If specified, will call WeaveAPI.SessionManager.assignBusyTask().
         * @param description A description of the task.
         * @see weave.api.core.ISessionManager#assignBusyTask()
         */
        addTask(taskToken: Object, busyObject?: ILinkableObject, description?: string): void;
        /**
         * This function will check if a background task is registered as an active task.
         * @param taskToken A token representing a background task.
         * @return A value of true if the task was previously added and not yet removed.
         */
        hasTask(taskToken: Object): boolean;
        /**
         * This function will report the progress of a background task.
         * @param taskToken An object representing a task.
         * @param progress A number between 0 and 1 indicating the current progress of the task.
         */
        updateTask(taskToken: Object, progress: number): void;
        /**
         * This function will remove a previously registered pending request token and decrease the pendingRequestCount if necessary.
         * Also calls WeaveAPI.SessionManager.unassignBusyTask().
         * @param taskToken The object to remove from the progress indicator.
         * @see weave.api.core.ISessionManager#unassignBusyTask()
         */
        removeTask(taskToken: Object): void;
        /**
         * This function checks the overall progress of all pending requests.
         *
         * @return A Number between 0 and 1.
         */
        getNormalizedProgress(): number;
    }
    var IProgressIndicator: new (..._: any[]) => IProgressIndicator;
}
declare module weavejs.api.core {
    interface IScheduler {
        /**
         * These callbacks get triggered once per frame.
         */
        frameCallbacks: ICallbackCollection;
        /**
         * This calls a function later using setTimeout(method, 0).
         * @param relevantContext The 'this' argument for the function.  If the relevantContext object is disposed, the function will not be called.
         * @param method The function to call later.
         * @param parameters The parameters to pass to the function.
         */
        callLater(relevantContext: Object, method: Function, parameters?: any[]): void;
        /**
         * This will start an asynchronous task, calling iterativeTask() across multiple frames until it returns a value of 1 or the relevantContext object is disposed.
         * @param relevantContext This parameter may be null.  If the relevantContext object gets disposed, the task will no longer be iterated.
         * @param iterativeTask A function that performs a single iteration of the asynchronous task.
         *   This function must take zero or one parameter and return a number from 0.0 to 1.0 indicating the overall progress of the task.
         *   A return value below 1.0 indicates that the function should be called again to continue the task.
         *   When the task is completed, iterativeTask() should return 1.0.
         *   The optional parameter specifies the time when the function should return. If the function accepts the returnTime
         *   parameter, it will not be called repeatedly within the same frame even if it returns before the returnTime.
         *   It is recommended to accept the returnTime parameter because code that utilizes it properly will have higher performance.
         *
         * @example Example iteraveTask #1 (for loop replaced by if):
         * <listing version="3.0">
         * var array:Array = ['a','b','c','d'];
         * var index:int = 0;
         * function iterativeTask():Number // this may be called repeatedly in succession
         * {
         *     if (index &gt;= array.length) // in case the length is zero
         *         return 1;
         *
         *     trace(array[index]);
         *
         *     index++;
         *     return index / array.length;  // this will return 1.0 on the last iteration.
         * }
         * </listing>
         *
         * @example Example iteraveTask #2 (resumable for loop):
         * <listing version="3.0">
         * var array:Array = ['a','b','c','d'];
         * var index:int = 0;
         * function iterativeTaskWithTimer(returnTime:int):Number // this will be called only once in succession
         * {
         *     for (; index &lt; array.length; index++)
         *     {
         *         // return time check should be at the beginning of the loop
         *         if (getTimer() &gt; returnTime)
         *             return index / array.length; // progress so far
         *
         *         // process the current item
         *         trace(array[index]);
         *     }
         *     return 1; // loop finished
         * }
         * </listing>
         *
         * @example Example iteraveTask #3 (nested resumable for loops):
         * <listing version="3.0">
         * var outerArray:Array = [['a','b','c'], ['aa','bb','cc'], ['x','y','z'], ['xx','yy','zz']];
         * var outerIndex:int = 0;
         * var innerArray:Array = null;
         * var innerIndex:int = 0;
         * function iterativeNestedTaskWithTimer(returnTime:int):Number // this will be called only once in succession
         * {
         *     for (; outerIndex &lt; outerArray.length; outerIndex++)
         *     {
         *         // return time check can go here at the beginning of the loop, but we already have one in the inner loop
         *
         *         if (innerArray == null)
         *         {
         *             // time to initialize inner loop
         *             innerArray = outerArray[outerIndex] as Array;
         *             innerIndex = 0;
         *             // more code can go inside this if-block that would normally go right before the inner loop
         *         }
         *
         *         for (; innerIndex &lt; innerArray.length; innerIndex++)
         *         {
         *             // return time check should be at the beginning of the loop
         *             if (getTimer() &gt; returnTime)
         *                 return (outerIndex + (innerIndex / innerArray.length)) / outerArray.length; // progress so far
         *
         *             // process the current item
         *             trace('item', outerIndex, innerIndex, 'is', innerArray[innerIndex]);
         *         }
         *
         *         innerArray = null; // inner loop finished
         *         // more code can go here to be executed after the nested loop
         *     }
         *     return 1; // outer loop finished
         * }
         * </listing>
         * @param priority The task priority, which should be one of the static constants in WeaveAPI.
         * @param finalCallback A function that should be called after the task is completed.
         * @param description A description for the task.
         */
        startTask(relevantContext: Object, iterativeTask: Function, priority: number, finalCallback?: Function, description?: string): void;
    }
    var IScheduler: new (..._: any[]) => IScheduler;
}
declare module weavejs.api.core {
    /**
     * Session manager contains core functions for Weave related to session state.
     *
     * @author adufilie
     */
    interface ISessionManager {
        /**
         * This function gets the ICallbackCollection associated with an ILinkableObject.
         * If there is no ICallbackCollection defined for the object, one will be created.
         * This ICallbackCollection is used for reporting changes in the session state
         * @param linkableObject An ILinkableObject to get the associated ICallbackCollection for.
         * @return The ICallbackCollection associated with the given object.
         */
        getCallbackCollection(linkableObject: ILinkableObject): ICallbackCollection;
        /**
         * This function gets the ILinkableObject associated with an ICallbackCollection.
         */
        getLinkableObjectFromCallbackCollection(callbackCollection: ICallbackCollection): ILinkableObject;
        /**
         * This function will create a new instance of the specified child class and register it as a child of the parent.
         * If a callback function is given, the callback will be added to the child and cleaned up when the parent is disposed.
         *
         * Example usage:   public const foo:LinkableNumber = newLinkableChild(this, LinkableNumber, handleFooChange);
         *
         * @param linkableParent A parent ILinkableObject to create a new child for.
         * @param linkableChildType The class definition that implements ILinkableObject used to create the new child.
         * @param callback A callback with no parameters that will be added to the child that will run before the parent callbacks are triggered, or during the next ENTER_FRAME event if a grouped callback is used.
         * @param useGroupedCallback If this is true, addGroupedCallback() will be used instead of addImmediateCallback().
         * @return The new child object.
         * @see #registerLinkableChild()
         */
        newLinkableChild<T extends ILinkableObject>(linkableParent: Object, linkableChildType: Class<T>, callback?: Function, useGroupedCallback?: boolean): T;
        /**
         * This function tells the SessionManager that the session state of the specified child should appear in the
         * session state of the specified parent, and the child should be disposed when the parent is disposed.
         *
         * There is one other requirement for the child session state to appear in the parent session state -- the child
         * must be accessible through a public variable of the parent or through an accessor function of the parent.
         *
         * This function will add callbacks to the sessioned children that cause the parent callbacks to run.
         *
         * If a callback function is given, the callback will be added to the child and cleaned up when the parent is disposed.
         *
         * Example usage:   public const foo:LinkableNumber = registerLinkableChild(this, someLinkableNumber, handleFooChange);
         *
         * @param linkableParent A parent ILinkableObject that the child will be registered with.
         * @param linkableChild The child ILinkableObject to register as a child.
         * @param callback A callback with no parameters that will be added to the child that will run before the parent callbacks are triggered, or during the next ENTER_FRAME event if a grouped callback is used.
         * @param useGroupedCallback If this is true, addGroupedCallback() will be used instead of addImmediateCallback().
         * @return The linkableChild object that was passed to the function.
         * @see #newLinkableChild()
         */
        registerLinkableChild<T extends ILinkableObject>(linkableParent: Object, linkableChild: T, callback?: Function, useGroupedCallback?: boolean): T;
        /**
         * This function will create a new instance of the specified child class and register it as a child of the parent.
         * The child will be disposed when the parent is disposed.
         * Use this function when a child object can be disposed but you do not want to link the callbacks or either object is not an ILinkableObject.
         *
         * Example usage:   public const foo:LinkableNumber = newDisposableChild(this, LinkableNumber);
         *
         * @param disposableParent A parent ILinkableObject to create a new child for.
         * @param disposableChildType The class definition that implements ILinkableObject used to create the new child.
         * @return The new child object.
         * @see #registerDisposableChild()
         */
        newDisposableChild(disposableParent: Object, disposableChildType: new (..._: any[]) => any): any;
        /**
         * This will register a child of a parent and cause the child to be disposed when the parent is disposed.
         * Use this function when a child object can be disposed but you do not want to link the callbacks or either object is not an ILinkableObject.
         *
         * Example usage:   public const foo:LinkableNumber = registerDisposableChild(this, someLinkableNumber);
         *
         * @param disposableParent A parent disposable object that the child will be registered with.
         * @param disposableChild The disposable object to register as a child of the parent.
         * @return The linkableChild object that was passed to the function.
         * @see #newDisposableChild()
         */
        registerDisposableChild(disposableParent: Object, disposableChild: Object): any;
        /**
         * This function gets the owner of an object.  The owner of an object is defined as its first registered parent.
         * @param child An Object that was registered as a child of another Object.
         * @return The owner of the child object (the first parent that was registered with the child), or null if the child has no owner.
         */
        getOwner(child: Object): Object;
        /**
         * This function gets the owner of a linkable object.  The owner of an object is defined as its first registered parent.
         * @param child An ILinkableObject that was registered as a child of another ILinkableObject.
         * @return The owner of the child object (the first parent that was registered with the child), or null if the child has no linkable owner.
         * @see #getLinkableDescendants()
         */
        getLinkableOwner(child: ILinkableObject): ILinkableObject;
        /**
         * This function will return all the descendant objects that implement ILinkableObject.
         * If the filter parameter is specified, the results will contain only those objects that extend or implement the filter class.
         * @param root A root object to get the descendants of.
         * @param filter An optional Class definition which will be used to filter the results.
         * @return An Array containing a list of descendant objects.
         * @see #getLinkableOwner()
         */
        getLinkableDescendants<T>(root: ILinkableObject, filter?: Class<T>): Array<T & ILinkableObject>;
        /**
         * This will assign an asynchronous task to a linkable object so that <code>linkableObjectIsBusy(busyObject)</code>
         * will return true until all assigned tasks are unassigned using <code>unassignBusyTask(taskToken)</code>.
         * @param taskToken A token representing an asynchronous task.  If this is an AsyncToken, a responder will be added that will automatically call unassignBusyTask(taskToken) on success or failure.
         * @param busyObject The object that is busy waiting for the task to complete.
         * @see weave.api.core.IProgressIndicator#addTask()
         * @see #unassignBusyTask()
         * @see #linkableObjectIsBusy()
         */
        assignBusyTask(taskToken: Object, busyObject: ILinkableObject): void;
        /**
         * This will unassign an asynchronous task from all linkable objects it has been previously assigned to.
         * If the task was previously registered with WeaveAPI.ProgressManager, this will call WeaveAPI.ProgressManager.removeTask().
         * @param taskToken A token representing an asynchronous task.
         * @see weave.api.core.IProgressIndicator#removeTask()
         * @see #assignBusyTask()
         * @see #linkableObjectIsBusy()
         */
        unassignBusyTask(taskToken: Object): void;
        /**
         * This checks if any asynchronous tasks have been assigned to a linkable object or any of its registered descendants.
         * @param linkableObject The object to check.
         * @return A value of true if any asynchronous tasks have been assigned to the object.
         * @see #assignBusyTask()
         * @see #unassignBusyTask()
         */
        linkableObjectIsBusy(linkableObject: ILinkableObject): boolean;
        /**
         * Sets the session state of an ILinkableObject.
         * @param linkableObject An object containing sessioned properties (sessioned objects may be nested).
         * @param newState An object containing the new values for sessioned properties in the sessioned object.
         * @param removeMissingDynamicObjects If true, this will remove any properties from an ILinkableCompositeObject that do not appear in the session state.
         * @see #getSessionState()
         */
        setSessionState(linkableObject: ILinkableObject, newState: Object, removeMissingDynamicObjects?: boolean): void;
        /**
         * Gets the session state of an ILinkableObject.
         * @param linkableObject An object containing sessioned properties (sessioned objects may be nested).
         * @return An object containing the values from the sessioned properties.
         * @see #setSessionState()
         */
        getSessionState(linkableObject: ILinkableObject): Object;
        /**
         * This function computes the diff of two session states.
         * @param oldState The source session state.
         * @param newState The destination session state.
         * @return A patch that generates the destination session state when applied to the source session state, or undefined if the two states are equivalent.
         * @see #combineDiff()
         */
        computeDiff(oldState: Object, newState: Object): any;
        /**
         * This modifies an existing diff to include an additional diff.
         * @param baseDiff The base diff which will be modified to include an additional diff.
         * @param diffToAdd The diff to add to the base diff.  This diff will not be modified.
         * @return The modified baseDiff, or a new diff object if baseDiff is a primitive value.
         * @see #computeDiff()
         */
        combineDiff(baseDiff: Object, diffToAdd: Object): Object;
        /**
         * This function will copy the session state from one sessioned object to another.
         * If the two objects are of different types, the behavior of this function is undefined.
         * @param source A sessioned object to copy the session state from.
         * @param destination A sessioned object to copy the session state to.
         * @see #getSessionState()
         * @see #setSessionState()
         */
        copySessionState(source: ILinkableObject, destination: ILinkableObject): void;
        /**
         * This will link the session state of two ILinkableObjects.
         * The session state of 'primary' will be copied over to 'secondary' after linking them.
         * @param primary An ILinkableObject to give authority over the initial shared value.
         * @param secondary The ILinkableObject to link with 'primary' via session state.
         * @see #unlinkSessionState()
         */
        linkSessionState(primary: ILinkableObject, secondary: ILinkableObject): void;
        /**
         * This will unlink the session state of two ILinkableObjects that were previously linked with linkSessionState().
         * @param first The ILinkableObject to unlink from 'second'
         * @param second The ILinkableObject to unlink from 'first'
         * @see #linkSessionState()
         */
        unlinkSessionState(first: ILinkableObject, second: ILinkableObject): void;
        /**
         * This function should be called when an ILinkableObject or IDisposableObject is no longer needed.
         * @param object An ILinkableObject or an IDisposableObject to clean up.
         * @see #objectWasDisposed()
         */
        disposeObject(object: Object): void;
        /**
         * This function checks if an object has been disposed by the ISessionManager.
         * @param object An object to check.
         * @return A value of true if disposeObject() was called for the specified object.
         * @see #disposeObject()
         */
        objectWasDisposed(object: Object): boolean;
        /**
         * Gets the path of names in the session state tree of the root object.
         * @param root The root object used to generate a session state tree.
         * @param child The descendant object to find in the session state tree.
         * @return The path from root to descendant, or null if the descendant does not appear in the session state.
         * @see #getObject()
         */
        getPath(root: ILinkableObject, descendant: ILinkableObject): any[];
        /**
         * This function returns a pointer to an ILinkableObject appearing in the session state.
         * @param root The root object used to find a descendant object.
         * @param path A sequence of child names used to refer to an object appearing in the session state.
         *             A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return A pointer to the object referred to by objectPath.
         * @see #getPath()
         */
        getObject(root: ILinkableObject, path: any[]): ILinkableObject;
    }
    var ISessionManager: new (..._: any[]) => ISessionManager;
}
declare module weavejs.api.ui {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Manages implementations of ILinkableObjectEditor.
     */
    interface IEditorManager extends ILinkableObject {
        /**
         * Sets a human-readable label for an ILinkableObject to be used in editors.
         */
        setLabel(object: ILinkableObject, label: string): void;
        /**
         * Gets the previously-stored human-readable label for an ILinkableObject.
         */
        getLabel(object: ILinkableObject): string;
    }
    var IEditorManager: new (..._: any[]) => IEditorManager;
}
declare module weavejs.api.ui {
    interface IInitSelectableAttributes {
        /**
         * This will initialize the selectable attributes using a list of columns and/or column references.
         * Tools can override this function for different behavior.
         * @param input An Array of IAttributeColumn and/or IColumnReference objects
         */
        initSelectableAttributes(input: any[]): void;
    }
    var IInitSelectableAttributes: new (..._: any[]) => IInitSelectableAttributes;
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    /**
     * This class manages a list of callback functions.
     *
     * @author adufilie
     */
    class CallbackCollection implements ICallbackCollection, IDisposableObject {
        /**
         * @param preCallback An optional function to call before each immediate callback.
         *     If specified, the preCallback function will be called immediately before running each
         *     callback using the parameters passed to _runCallbacksImmediately(). This means if there
         *     are five callbacks added, preCallback() gets called five times whenever
         *     _runCallbacksImmediately() is called.  An example usage of this is to make sure a relevant
         *     variable is set to the appropriate value while each callback is running.  The preCallback
         *     function will not be called before grouped callbacks.
         */
        constructor(preCallback?: Function);
        /**
         * This is the function that gets called immediately before every callback.
         */
        protected _preCallback: Function;
        /**
         * This is the default value of triggerCounter.
         * The default value is 1 to avoid being equal to a newly initialized uint=0.
         */
        static DEFAULT_TRIGGER_COUNT: number;
        addImmediateCallback(relevantContext: Object, callback: Function, runCallbackNow?: boolean, alwaysCallLast?: boolean): void;
        triggerCallbacks(): void;
        /**
         * This function runs callbacks immediately, ignoring any delays.
         * The preCallback function will be called with the specified preCallbackParams arguments.
         * @param preCallbackParams The arguments to pass to the preCallback function given in the constructor.
         */
        protected _runCallbacksImmediately(...preCallbackParams: any[]): void;
        removeCallback(relevantContext: Object, callback: Function): void;
        triggerCounter: number;
        callbacksAreDelayed: boolean;
        delayCallbacks(): void;
        resumeCallbacks(): void;
        addDisposeCallback(relevantContext: Object, callback: Function, allowDelay?: boolean): void;
        dispose(): void;
        /**
         * This flag becomes true after dispose() is called.
         */
        wasDisposed: boolean;
        addGroupedCallback(relevantContext: Object, groupedCallback: Function, triggerCallbackNow?: boolean, delayWhileBusy?: boolean): void;
        static STACK_TRACE_TRIGGER: string;
    }
}
declare module weavejs.core {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    /**
     * @private
     */
    class CallbackEntry implements IDisposableObject {
        /**
         * @param context The "this" argument for the callback function. When the context is disposed, this callback entry will be disposed.
         * @param callback The callback function.
         */
        constructor(context?: Object, callback?: Function);
        /**
         * This is the context in which the callback function is relevant.
         * When the context is disposed, the callback should not be called anymore.
         *
         * Note that the context could be stored using a weak reference in an effort to make the garbage-
         * collector take care of removing the callback, but in most situations this would not work because
         * the callback function is typically a class member of the context object.  This means that as long
         * as you have a strong reference to the callback function, you effectively have a strong reference
         * to the owner of the function.  Storing the callback function as a weak reference would solve this
         * problem, but you cannot create reliable weak references to functions due to a bug in the Flash
         * Player.  Weak references to functions get garbage-collected even if the owner of the function still
         * exists.
         */
        context: Object;
        /**
         * This is the callback function.
         */
        callback: Function;
        /**
         * This is the current recursion depth.
         * If this is greater than zero, it means the function is currently running.
         * Note that it IS possible for this to go above 1 if an external JavaScript popup interrupts our code.
         */
        recursionCount: number;
        /**
         * This is 0 if the callback was added with alwaysCallLast=false, or 1 for alwaysCallLast=true
         */
        schedule: number;
        /**
         * This is a stack trace from when the callback was added.
         */
        addCallback_stackTrace: Error;
        /**
         * This is a stack trace from when the callback was removed.
         */
        removeCallback_stackTrace: Error;
        /**
         * Call this when the callback entry is no longer needed.
         */
        dispose(): void;
        static STACK_TRACE_ADD: string;
        static STACK_TRACE_REMOVE: string;
    }
}
declare module weavejs.core {
    import IChildListCallbackInterface = weavejs.api.core.IChildListCallbackInterface;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * @private
     * Implementation of IChildListCallbackInterface for use with LinkableHashMap.
     *
     * @author adufilie
     */
    class ChildListCallbackInterface extends CallbackCollection implements IChildListCallbackInterface {
        constructor();
        /**
         * This function will set the list callback variables:
         *     lastNameAdded, lastObjectAdded, lastNameRemoved, lastObjectRemoved, childListChanged
         * @param name This is the name of the object that was just added or removed from the hash map.
         * @param objectAdded This is the object that was just added to the hash map.
         * @param objectRemoved This is the object that was just removed from the hash map.
         */
        /**
         * This function will run callbacks immediately, setting the list callback variables before each one.
         * @param name
         * @param objectAdded
         * @param objectRemoved
         */
        runCallbacks(name: string, objectAdded: ILinkableObject, objectRemoved: ILinkableObject): void;
        /**
         * This is the name of the object that was added prior to running callbacks.
         */
        lastNameAdded: string;
        /**
         * This is the object that was added prior to running callbacks.
         */
        lastObjectAdded: ILinkableObject;
        /**
         * This is the name of the object that was removed prior to running callbacks.
         */
        lastNameRemoved: string;
        /**
         * This is the object that was removed prior to running callbacks.
         */
        lastObjectRemoved: ILinkableObject;
    }
}
declare module weavejs.core {
    import IClassRegistry = weavejs.api.core.IClassRegistry;
    /**
     * Manages a set of implementations of interfaces.
     */
    class ClassRegistryImpl implements IClassRegistry {
        constructor();
        /**
         * interface Class -&gt; singleton implementation instance.
         */
        map_interface_singletonInstance: Object;
        /**
         * interface Class -&gt; Array&lt;implementation Class&gt;
         */
        map_interface_implementations: Object;
        /**
         * implementation Class -&gt; String
         */
        map_class_displayName: Object;
        /**
         * qualifiedName:String -> definition:Class
         */
        map_name_class: Object;
        /**
         * definition:Class -> qualifiedName:String
         */
        map_class_name: Object;
        /**
         * An Array of default packages to check when looking up a class by name.
         */
        defaultPackages: any[];
        registerClass(definition: new (..._: any[]) => any, qualifiedName: string, interfaces?: any[], displayName?: string): void;
        getClassName(definition: Object): string;
        getDefinition(name: string): any;
        getClassInfo(class_or_instance: Object): {
            variables: {
                [name: string]: {
                    type: string;
                };
            }[];
            accessors: {
                [name: string]: {
                    type: string;
                    declaredBy: string;
                };
            }[];
            methods: {
                [name: string]: {
                    type: string;
                    declaredBy: string;
                };
            }[];
        };
        getSingletonInstance(theInterface: new (..._: any[]) => any): any;
        registerImplementation(theInterface: new (..._: any[]) => any, theImplementation: new (..._: any[]) => any, displayName?: string): void;
        getImplementations(theInterface: new (..._: any[]) => any): any[];
        getDisplayName(theImplementation: new (..._: any[]) => any): string;
        /**
         * @private
         * sort by displayName
         */
        /**
         * Verifies that a Class implements an interface.
         */
        verifyImplementation(theInterface: new (..._: any[]) => any, theImplementation: new (..._: any[]) => any): void;
        /**
         * Partitions a list of classes based on which interfaces they implement.
         * @param A list of interfaces.
         * @return An Array of filtered Arrays corresponding to the given interfaces, including a final
         *         Array containing the remaining classes that did not implement any of the given interfaces.
         */
        static partitionClassList(classes: Array<GenericClass>, ...interfaces: Array<GenericClass>): Array<typeof classes>;
    }
}
declare module weavejs.core {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IEditorManager = weavejs.api.ui.IEditorManager;
    /**
     * Manages implementations of ILinkableObjectEditor.
     */
    class EditorManager implements IEditorManager {
        setLabel(object: ILinkableObject, label: string): void;
        getLabel(object: ILinkableObject): string;
    }
}
declare module weavejs.core {
    /**
     * Manages callbacks that rely on event-related data.
     */
    class EventCallbackCollection<T> extends CallbackCollection {
        constructor();
        /**
         * This is the data that was dispatched.
         */
        data: T;
        /**
         * This function will run callbacks immediately, setting the data variable before each one.
         * @param data
         */
        dispatch(data: T): void;
    }
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    /**
     * @private
     */
    class GroupedCallbackEntry extends CallbackEntry {
        static addGroupedCallback(callbackCollection: ICallbackCollection, relevantContext: Object, groupedCallback: Function, triggerCallbackNow: boolean, delayWhileBusy: boolean): void;
        static removeGroupedCallback(callbackCollection: ICallbackCollection, relevantContext: Object, groupedCallback: Function): void;
        /**
         * Constructor
         */
        constructor(context?: Object, groupedCallback?: Function);
        /**
         * If true, the callback was handled this frame.
         */
        handled: boolean;
        /**
         * If true, the callback was triggered this frame.
         */
        triggered: boolean;
        /**
         * If true, the callback was triggered again from another grouped callback.
         */
        triggeredAgain: boolean;
        /**
         * Specifies whether to delay the callback while the contexts are busy.
         */
        delayWhileBusy: boolean;
        /**
         * An Array of ICallbackCollections to which the callback was added.
         */
        targets: any[];
        /**
         * Marks the entry to be handled later (unless already triggered this frame).
         * This also takes care of preventing recursion.
         */
        trigger(): void;
        /**
         * Checks the context and targets before calling groupedCallback
         */
        handleGroupedCallback(): void;
        dispose(): void;
    }
}
declare module weavejs.core {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    class LinkableCallbackScript implements ILinkableObject {
        constructor();
        variables: LinkableHashMap;
        script: LinkableString;
        delayWhileBusy: LinkableBoolean;
        delayWhilePlaceholders: LinkableBoolean;
        groupedCallback: LinkableBoolean;
        get(variableName: string): ILinkableObject;
    }
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This object links to an internal ILinkableObject.
     * The internal object can be either a local one or a global one identified by a global name.
     *
     * @author adufilie
     */
    class LinkableDynamicObject extends LinkableWatcher implements ILinkableDynamicObject, ICallbackCollection {
        /**
         * @param typeRestriction If specified, this will limit the type of objects that can be added to this LinkableHashMap.
         */
        constructor(typeRestriction?: new (..._: any[]) => any);
        internalObject: ILinkableObject;
        getSessionState(): any[];
        setSessionState(newState: any[], removeMissingDynamicObjects: boolean): void;
        target: ILinkableObject;
        protected internalSetTarget(newTarget: ILinkableObject): void;
        targetPath: Array<string | number>;
        requestLocalObject(objectType: new (..._: any[]) => any, lockObject?: boolean): any;
        requestGlobalObject(name: string, objectType: new (..._: any[]) => any, lockObject?: boolean): any;
        requestLocalObjectCopy(objectToCopy: ILinkableObject): void;
        /**
         * This is the name of the linked global object, or null if the internal object is local.
         */
        /**
         * This function will change the internalObject if the new globalName is different, unless this object is locked.
         * If a new global name is given, the session state of the new global object will take precedence.
         * @param newGlobalName This is the name of the global object to link to, or null to unlink from the current global object.
         */
        globalName: string;
        /**
         * Handles backwards compatibility.
         * @param newState An Array with two or more items.
         * @param removeMissingDynamicObjects true when applying an absolute session state, false if applying a diff
         * @return An Array with one item.
         */
        lock(): void;
        locked: boolean;
        removeObject(): void;
        dispose(): void;
        addImmediateCallback(relevantContext: Object, callback: Function, runCallbackNow?: boolean, alwaysCallLast?: boolean): void;
        addGroupedCallback(relevantContext: Object, groupedCallback: Function, triggerCallbackNow?: boolean, delayWhileBusy?: boolean): void;
        addDisposeCallback(relevantContext: Object, callback: Function, allowDelay?: boolean): void;
        removeCallback(relevantContext: Object, callback: Function): void;
        triggerCounter: number;
        triggerCallbacks(): void;
        callbacksAreDelayed: boolean;
        delayCallbacks(): void;
        resumeCallbacks(): void;
    }
}
declare module weavejs.core {
    /**
     * LinkableFunction allows a function to be defined by a String that can use macros defined in the static macros hash map.
     * Libraries listed in macroLibraries variable will be included when compiling the function.
     *
     * @author adufilie
     */
    class LinkableFunction extends LinkableString {
        /**
         * Debug mode.
         */
        static debug: boolean;
        /**
         * @param defaultValue The default function definition.
         * @param ignoreRuntimeErrors If this is true, errors thrown during evaluation of the function will be caught and values of undefined will be returned.
         * @param useThisScope When true, variable lookups will be evaluated as if the function were in the scope of the thisArg passed to the apply() function.
         * @param paramNames An Array of parameter names that can be used in the function definition.
         */
        constructor(defaultValue?: string, ignoreRuntimeErrors?: boolean, paramNames?: any[]);
        /**
         * This is used as a placeholder to prevent re-compiling erroneous code.
         */
        /**
         * This will attempt to compile the function.  An Error will be thrown if this fails.
         */
        validate(): void;
        /**
         * This will evaluate the function with the specified parameters.
         * @param thisArg The value of 'this' to be used when evaluating the function.
         * @param argArray An Array of arguments to be passed to the compiled function.
         * @return The result of evaluating the function.
         */
        apply(thisArg?: any, argArray?: any[]): any;
        /**
         * This will evaluate the function with the specified parameters.
         * @param thisArg The value of 'this' to be used when evaluating the function.
         * @param args Arguments to be passed to the compiled function.
         * @return The result of evaluating the function.
         */
        call(thisArg?: any, ...args: any[]): any;
    }
}
declare module weavejs.core {
    import IChildListCallbackInterface = weavejs.api.core.IChildListCallbackInterface;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Allows dynamically creating instances of objects implementing ILinkableObject at runtime.
     * The session state is an Array of DynamicState objects.
     * @see weave.core.DynamicState
     *
     * @author adufilie
     */
    class LinkableHashMap extends CallbackCollection implements ILinkableHashMap {
        /**
         * Constructor.
         * @param typeRestriction If specified, this will limit the type of objects that can be added to this LinkableHashMap.
         */
        constructor(typeRestriction?: new (..._: any[]) => any);
        typeRestriction: new (..._: any[]) => any;
        childListCallbacks: IChildListCallbackInterface;
        getNames(filter?: new (..._: any[]) => any, filterIncludesPlaceholders?: boolean): any[];
        getObjects(filter?: new (..._: any[]) => any, filterIncludesPlaceholders?: boolean): any[];
        toObject<T>(filter?: Class<T> | string, filterIncludesPlaceholders?: boolean): {
            [name: string]: T & ILinkableObject;
        };
        toMap<T>(filter?: Class<T> | string, filterIncludesPlaceholders?: boolean): Map<String, T & ILinkableObject>;
        getObject(name: string): ILinkableObject;
        setObject(name: string, object: ILinkableObject, lockObject?: boolean): void;
        getName(object: ILinkableObject): string;
        setNameOrder(newOrder: any[]): void;
        requestObject(name: string, classDef: new (..._: any[]) => any, lockObject?: boolean): any;
        requestObjectCopy(name: string, objectToCopy: ILinkableObject): ILinkableObject;
        renameObject(oldName: string, newName: string): ILinkableObject;
        /**
         * If there is an existing object associated with the specified name, it will be kept if it
         * is the specified type, or replaced with a new instance of the specified type if it is not.
         * @param name The identifying name of a new or existing object.  If this is null, a new one will be generated.
         * @param className The qualified class name of the desired object type.
         * @param lockObject If this is set to true, lockObject() will be called on the given name.
         * @return The object associated with the given name, or null if an error occurred.
         */
        /**
         * (private)
         * @param name The identifying name to associate with a new object.
         * @param classDef The Class definition used to instantiate a new object.
         */
        /**
         * This function will lock an object in place for a given identifying name.
         * If there is no object using the specified name, this function will have no effect.
         * @param name The identifying name of an object to lock in place.
         */
        objectIsLocked(name: string): boolean;
        removeObject(name: string): void;
        removeAllObjects(): void;
        /**
         * This function removes all objects from this LinkableHashMap.
         */
        dispose(): void;
        generateUniqueName(baseName: string): string;
        getSessionState(): any[];
        setSessionState(newStateArray: any[], removeMissingDynamicObjects: boolean): void;
    }
}
declare module weavejs.core {
    /**
     * This is a LinkableVariable which limits its session state to Number values.
     * @author adufilie
     * @see weave.core.LinkableVariable
     */
    class LinkableNumber extends LinkableVariable {
        constructor(defaultValue?: number, verifier?: Function, defaultValueTriggersCallbacks?: boolean);
        value: number;
        getSessionState(): Object;
        setSessionState(value: Object): void;
        protected sessionStateEquals(otherSessionState: any): boolean;
    }
}
declare module weavejs.core {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Represents an object that must be instantiated asynchronously.
     */
    class LinkablePlaceholder<T extends ILinkableObject> extends LinkableVariable {
        constructor(classDef?: Class<T>);
        getClass(): Class<T>;
        getInstance(): T & ILinkableObject;
        setInstance(instance: T): void;
        setSessionState(value: Object): void;
        /**
         * @return success flag
         */
        /**
         * A utility function for getting the class definition from LinkablePlaceholders as well as regular objects.
         * @param object An object, which may be null.
         * @return The class definition, or null if the object was null.
         */
        static getClass(object: ILinkableObject | LinkablePlaceholder<ILinkableObject>): Class<ILinkableObject>;
        /**
         * Replaces a LinkablePlaceholder with an instance of the expected type.
         * @param possiblePlaceholder A LinkablePlaceholder or the instance object if it has already been placed.
         * @param instance An instance of the type of object that the placeholder is expecting.
         */
        static setInstance(possiblePlaceholder: ILinkableObject, instance: ILinkableObject): void;
        static replaceInstanceWithPlaceholder(instance: ILinkableObject): void;
        /**
         * Calls a function after a placeholder has been replaced with an instance and the instance session state has been initialized.
         * The onReady function will be called immediately if possiblePlaceholder is not a LinkablePlaceholder.
         * @param relevantContext The relevantContext parameter passed to ICallbackCollection.addDisposeCallback().
         * @param possiblePlaceholder Either a LinkablePlaceholder or another ILinkableObject.
         * @param onReady The function to call.
         */
        static whenReady(relevantContext: ILinkableObject, possiblePlaceholder: ILinkableObject, onReady: (instance: ILinkableObject) => void): void;
    }
}
declare module weavejs.core {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Use this class to build dependency trees involving asynchronous calls.
     * When the callbacks of a LinkablePromise are triggered, a function will be invoked.
     * If the function returns an AsyncToken, LinkablePromise's callbacks will be triggered again when a ResultEvent or FaultEvent is received from the AsyncToken.
     * Dependency trees can be built using newLinkableChild() and registerLinkableChild().
     *
     * @see weave.api.core.ISessionManager#newLinkableChild()
     * @see weave.api.core.ISessionManager#registerLinkableChild()
     * @author adufilie
     */
    class LinkablePromise implements ILinkableObject, IDisposableObject {
        /**
         * Creates a LinkablePromise from an iterative task function.
         * @param initialize A function that should be called prior to starting the iterativeTask.
         * @param iterativeTask A function which is designed to be called repeatedly across multiple frames until it returns a value of 1.
         * @param priority The task priority, which should be one of the static constants in WeaveAPI.
         * @param description A description of the task as a String, or a function to call which returns a descriptive string.
         * Such a function has the signature function():String.
         * @see weave.api.core.IStageUtils#startTask()
         */
        static fromIterativeTask(initialize: Function, iterativeTask: Function, priority: number, description?: any, validateNow?: boolean): LinkablePromise;
        /**
         * @param task A function to invoke, which must take zero parameters and may return an AsyncToken.
         * @param description A description of the task as a String, or a function to call which returns a descriptive string.
         * Such a function has the signature function():String.
         */
        constructor(task?: Function, description?: any, validateNow?: boolean);
        /**
         * The result of calling the invoke function.
         * When this value is accessed, validate() will be called.
         */
        result: Object;
        /**
         * The error that occurred calling the invoke function.
         * When this value is accessed, validate() will be called.
         */
        error: Object;
        /**
         * If this LinkablePromise is set to lazy mode, this will switch it to non-lazy mode and automatically invoke the async task when necessary.
         */
        validate(): void;
        /**
         * Registers dependencies of the LinkablePromise.
         */
        depend(dependency: ILinkableObject, ...otherDependencies: any[]): LinkablePromise;
        dispose(): void;
    }
}
declare module weavejs.core {
    /**
     * This is a LinkableVariable which limits its session state to String values.
     * @author adufilie
     * @see weave.core.LinkableVariable
     */
    class LinkableString extends LinkableVariable {
        constructor(defaultValue?: string, verifier?: Function, defaultValueTriggersCallbacks?: boolean);
        value: string;
        setSessionState(value: string): void;
    }
}
declare module weavejs.core {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This is used to dynamically attach a set of callbacks to different targets.
     * The callbacks of the LinkableWatcher will be triggered automatically when the
     * target triggers callbacks, changes, becomes null or is disposed.
     * @author adufilie
     */
    class LinkableWatcher implements ILinkableObject, IDisposableObject {
        /**
         * Instead of calling this constructor directly, consider using one of the global functions
         * newLinkableChild() or newDisposableChild() to make sure the watcher will get disposed automatically.
         * @param typeRestriction Optionally restricts which type of targets this watcher accepts.
         * @param immediateCallback A function to add as an immediate callback.
         * @param groupedCallback A function to add as a grouped callback.
         * @see weave.api.core.newLinkableChild()
         * @see weave.api.core.newDisposableChild()
         */
        constructor(typeRestriction?: new (..._: any[]) => any, immediateCallback?: Function, groupedCallback?: Function);
        protected _typeRestriction: new (..._: any[]) => any;
        protected _targetPath: any[];
        /**
         * This is the root object to which targetPath is relative.
         */
        root: ILinkableObject;
        /**
         * This is the linkable object currently being watched.
         * Setting this will unset the targetPath.
         */
        target: ILinkableObject;
        /**
         * Checks if the target is currently a placeholder for an instance of an async class.
         * @return true if the target is a placeholder.
         * @see Weave#registerAsyncClass()
         */
        foundPlaceholder: boolean;
        /**
         * This sets the new target to be watched without resetting targetPath.
         * Callbacks will be triggered immediately if the new target is different from the old one.
         */
        protected internalSetTarget(newTarget: ILinkableObject): void;
        /**
         * This is the path that is currently being watched for linkable object targets.
         */
        /**
         * This will set a path which should be watched for new targets.
         * Callbacks will be triggered immediately if the path changes or points to a new target.
         */
        targetPath: Array<string | number>;
        dispose(): void;
    }
}
declare module weavejs.core {
    class LogEntry {
        /**
         * This is an entry in the session history log.  It contains both undo and redo session state diffs.
         * The triggerDelay is the time it took for the user to make a change since the last synchronization.
         * This time difference does not include the time it took to set the session state.  This way, when
         * the session state is replayed at a reasonable speed regardless of the speed of the computer.
         * @param id
         * @param forward The diff for applying redo.
         * @param backward The diff for applying undo.
         * @param triggerDelay The length of time between the last synchronization and the diff.
         */
        constructor(id?: number, forward?: Object, backward?: Object, triggerDelay?: number, diffDuration?: number);
        id: number;
        forward: Object;
        backward: Object;
        triggerDelay: number;
        diffDuration: number;
        /**
         * This will convert an Array of generic objects to an Array of LogEntry objects.
         * Generic objects are easier to create backwards compatibility for.
         */
        static convertGenericObjectsToLogEntries(array: any[], defaultTriggerDelay: number): any[];
    }
}
declare module weavejs.core {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IProgressIndicator = weavejs.api.core.IProgressIndicator;
    class ProgressIndicator implements IProgressIndicator {
        /**
         * For debugging, returns debugIds for active tasks.
         */
        debugTasks(): any[];
        getDescriptions(): Array<[any, number, string]>;
        getTaskCount(): number;
        addTask(taskToken: Object, busyObject?: ILinkableObject, description?: string): void;
        hasTask(taskToken: Object): boolean;
        updateTask(taskToken: Object, progress: number): void;
        removeTask(taskToken: Object): void;
        getNormalizedProgress(): number;
        test(): void;
    }
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import IScheduler = weavejs.api.core.IScheduler;
    /**
     * This allows you to add callbacks that will be called when an event occurs on the stage.
     *
     * WARNING: These callbacks will trigger on every mouse and keyboard event that occurs on the stage.
     *          Developers should not add any callbacks that run computationally expensive code.
     *
     * @author adufilie
     */
    class Scheduler implements IScheduler, IDisposableObject {
        static debug_fps: boolean;
        static debug_async_time: boolean;
        static debug_async_stack_elapsed: boolean;
        static debug_delayTasks: boolean;
        static debug_callLater: boolean;
        static debug_visibility: boolean;
        constructor();
        frameCallbacks: ICallbackCollection;
        dispose(): void;
        averageFrameTime: number;
        /**
         * This gets the maximum milliseconds spent per frame performing asynchronous tasks.
         */
        getMaxComputationTimePerFrame(): number;
        /**
         * This sets the maximum milliseconds spent per frame performing asynchronous tasks.
         * @param The new value.
         */
        setMaxComputationTimePerFrame(value: number): void;
        /**
         * This will get the time allocation for a specific task priority.
         * @param priority The task priority defined by one of the constants in WeaveAPI.
         * @return The time allocation for the specified task priority.
         */
        getTaskPriorityTimeAllocation(priority: number): number;
        /**
         * This will set the time allocation for a specific task priority.
         * @param priority The task priority defined by one of the constants in WeaveAPI.
         * @param milliseconds The new time allocation for the specified task priority.
         */
        setTaskPriorityTimeAllocation(priority: number, milliseconds: number): void;
        /**
         * When the current frame elapsed time reaches this threshold, callLater processing will be done in later frames.
         */
        maxComputationTimePerFrame: number;
        previousFrameElapsedTime: number;
        currentFrameElapsedTime: number;
        static debugTime(str: string): number;
        /**
         * This function gets called during ENTER_FRAME and RENDER events.
         */
        callLater(relevantContext: Object, method: Function, parameters?: any[]): void;
        /**
         * This will generate an iterative task function that is the combination of a list of tasks to be completed in order.
         * @param iterativeTasks An Array of iterative task functions.
         * @return A single iterative task function that invokes the other tasks to completion in order.
         *         The function will accept a stopTime:int parameter which when set to -1 will
         *         reset the task counter to zero so the compound task will start from the first task again.
         * @see #startTask()
         */
        static generateCompoundIterativeTask(...iterativeTasks: any[]): Function;
        startTask(relevantContext: Object, iterativeTask: Function, priority: number, finalCallback?: Function, description?: string): void;
    }
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ISessionManager = weavejs.api.core.ISessionManager;
    import WeaveTreeItem = weavejs.util.WeaveTreeItem;
    /**
     * This is a collection of core functions in the Weave session framework.
     *
     * @author adufilie
     */
    class SessionManager implements ISessionManager {
        static debugUnbusy: boolean;
        newLinkableChild(linkableParent: Object, linkableChildType: new (..._: any[]) => any, callback?: Function, useGroupedCallback?: boolean): any;
        registerLinkableChild(linkableParent: Object, linkableChild: ILinkableObject, callback?: Function, useGroupedCallback?: boolean): any;
        newDisposableChild(disposableParent: Object, disposableChildType: new (..._: any[]) => any): any;
        registerDisposableChild(disposableParent: Object, disposableChild: Object): any;
        /**
         * Use this function with care.  This will remove child objects from the session state of a parent and
         * stop the child from triggering the parent callbacks.
         * @param parent A parent that the specified child objects were previously registered with.
         * @param child The child object to unregister from the parent.
         */
        unregisterLinkableChild(parent: ILinkableObject, child: ILinkableObject): void;
        /**
         * This function will add or remove child objects from the session state of a parent.  Use this function
         * with care because the child will no longer be "sessioned."  The child objects will continue to trigger the
         * callbacks of the parent object, but they will no longer be considered a part of the parent's session state.
         * If you are not careful, this will break certain functionalities that depend on the session state of the parent.
         * @param parent A parent that the specified child objects were previously registered with.
         * @param child The child object to remove from the session state of the parent.
         */
        excludeLinkableChildFromSessionState(parent: ILinkableObject, child: ILinkableObject): void;
        /**
         * @private
         * This function will return all the child objects that have been registered with a parent.
         * @param parent A parent object to get the registered children of.
         * @return An Array containing a list of linkable objects that have been registered as children of the specified parent.
         *         This list includes all children that have been registered, even those that do not appear in the session state.
         */
        getOwner(child: Object): Object;
        getLinkableOwner(child: ILinkableObject): ILinkableObject;
        /**
         * @param root The linkable object to be placed at the root node of the tree.
         * @param objectName The label for the root node.
         * @return A tree of nodes with the properties "data", "label", "children"
         */
        getSessionStateTree(root: ILinkableObject, objectName: string): WeaveTreeItem;
        /**
         * Gets a session state tree where each node is a DynamicState object.
         */
        getTypedStateTree(root: ILinkableObject): Object;
        /**
         * Adds a grouped callback that will be triggered when the session state tree changes.
         * USE WITH CARE. The groupedCallback should not run computationally-expensive code.
         */
        addTreeCallback(relevantContext: Object, groupedCallback: Function, triggerCallbackNow?: boolean): void;
        removeTreeCallback(relevantContext: Object, groupedCallback: Function): void;
        copySessionState(source: ILinkableObject, destination: ILinkableObject): void;
        static DEPRECATED_STATE_MAPPING: string;
        static DEPRECATED_PATH_REWRITE: string;
        /**
         * Uses DynamicState.traverseState() to traverse a state and copy portions of the state to ILinkableObjects.
         * @param state A session state
         * @param mapping A structure that defines the traversal, where the leaf nodes are ILinkableObjects or Functions to call.
         *                Functions should have the following signature: function(state:Object, removeMissingDynamicObjects:Boolean = true):void
         */
        static traverseAndSetState(state: Object, mapping: Object, removeMissingDynamicObjects?: boolean): void;
        setSessionState(linkableObject: ILinkableObject, newState: Object, removeMissingDynamicObjects?: boolean): void;
        getSessionState(linkableObject: ILinkableObject): Object;
        /**
         * This function gets a list of sessioned property names so accessor functions for non-sessioned properties do not have to be called.
         * @param linkableObject An object containing sessioned properties.
         * @param filtered If set to true, filters out excluded properties.
         * @return An Array containing the names of the sessioned properties of that object class.
         */
        getLinkablePropertyNames(linkableObject: ILinkableObject, filtered?: boolean): any[];
        getLinkableDescendants(root: ILinkableObject, filter?: new (..._: any[]) => any): any[];
        assignBusyTask(taskToken: Object, busyObject: ILinkableObject): void;
        unassignBusyTask(taskToken: Object): void;
        /**
         * Called the frame after an owner's last busy task is unassigned.
         * Triggers callbacks if they have not been triggered since then.
         */
        linkableObjectIsBusy(linkableObject: ILinkableObject): boolean;
        getCallbackCollection(linkableObject: ILinkableObject): ICallbackCollection;
        getLinkableObjectFromCallbackCollection(callbackCollection: ICallbackCollection): ILinkableObject;
        objectWasDisposed(object: Object): boolean;
        disposeObject(object: Object): void;
        /**
         * @private
         * For debugging only.
         */
        _getPaths(root: ILinkableObject, descendant: ILinkableObject): any[];
        /**
         * internal use only
         */
        getPath(root: ILinkableObject, descendant: ILinkableObject): any[];
        getObject(root: ILinkableObject, path: any[]): ILinkableObject;
        linkSessionState(primary: ILinkableObject, secondary: ILinkableObject): void;
        unlinkSessionState(first: ILinkableObject, second: ILinkableObject): void;
        /*******************
         * Computing diffs
         *******************/
        static DIFF_DELETE: string;
        computeDiff(oldState: Object, newState: Object): any;
        combineDiff(baseDiff: Object, diffToAdd: Object): Object;
        testDiff(): void;
    }
}
declare module weavejs.core {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    /**
     * This class saves the session history of an ILinkableObject.
     *
     * @author adufilie
     */
    class SessionStateLog implements ILinkableVariable, IDisposableObject {
        static debug: boolean;
        static enableHistoryRewrite: boolean;
        constructor(subject?: ILinkableObject, syncDelay?: number);
        dispose(): void;
        /**
         * When this is set to true, changes in the session state of the subject will be automatically logged.
         */
        enableLogging: LinkableBoolean;
        /**
         * This will squash a sequence of undos or redos into a single undo or redo.
         * @param directionalSquashCount Number of undos (negative) or redos (positive) to squash.
         */
        squashHistory(directionalSquashCount: number): void;
        /**
         * This will clear all undo and redo history.
         * @param directional Zero will clear everything. Set this to -1 to clear all undos or 1 to clear all redos.
         */
        clearHistory(directional?: number): void;
        /**
         * This gets called as an immediate callback of the subject.
         */
        /**
         * This gets called as a grouped callback of the subject.
         */
        /**
         * This will save a diff in the history, if there is any.
         * @param immediately Set to true if it should be saved immediately, or false if it can wait.
         */
        /**
         * This function will save any pending diff in session state.
         * Use this function only when necessary (for example, when writing a collaboration service that must synchronize).
         */
        synchronizeNow(): void;
        /**
         * This will undo a number of steps from the saved history.
         * @param numberOfSteps The number of steps to undo.
         */
        undo(numberOfSteps?: number): void;
        /**
         * This will redo a number of steps that have been previously undone.
         * @param numberOfSteps The number of steps to redo.
         */
        redo(numberOfSteps?: number): void;
        /**
         * This will apply a number of undo or redo steps.
         * @param delta The number of steps to undo (negative) or redo (positive).
         */
        /**
         * @TODO create an interface for the objects in this Array
         */
        undoHistory: any[];
        /**
         * @TODO create an interface for the objects in this Array
         */
        redoHistory: any[];
        /**
         * This will generate an untyped session state object that contains the session history log.
         * @return An object containing the session history log.
         */
        getSessionState(): Object;
        /**
         * This will load a session state log from an untyped session state object.
         * @param input The ByteArray containing the output from seralize().
         */
        setSessionState(state: Object): void;
    }
}
declare module weavejs.path {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    class WeavePath {
        /**
         * A pointer to the Weave instance.
         */
        weave: Weave;
        protected _path: any[];
        protected _parent: WeavePath;
        /**
         * WeavePath constructor.  WeavePath objects are immutable after they are created.
         * @class WeavePath
         * @param basePath An optional Array specifying the path to an object in the session state.
         *                 A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return A WeavePath object.
         */
        constructor(weave?: Weave, basePath?: any[]);
        /**
         * Private function for internal use.
         *
         * Converts an arguments object to an Array.
         * @param args An arguments object.
         * @param option An integer flag for special behavior.
         *   - If set to 1, it handles arguments like (...LIST) where LIST can be either an Array or multiple arguments.
         *   - If set to 2, it handles arguments like (...LIST, REQUIRED_PARAM) where LIST can be either an Array or multiple arguments.
         * @private
         */
        protected static _A(args: any[], option?: number): any[];
        /**
         * Creates a new WeavePath relative to the current one.
         * @param relativePath An Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return A new WeavePath object which remembers the current WeavePath as its parent.
         */
        push(...relativePath: any[]): WeavePath;
        /**
         * Returns to the previous WeavePath that spawned the current one with push().
         * @return The parent WeavePath object.
         */
        pop(): WeavePath;
        /**
         * Requests that an object be created if it doesn't already exist at the current path (or relative path, if specified).
         * This function can also be used to assert that the object at the current path is of the type you expect it to be.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param objectType The name of an ActionScript class in Weave.
         * @return The current WeavePath object.
         */
        request(...relativePath_objectType: any[]): WeavePath;
        /**
         * Removes a dynamically created object.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return The current WeavePath object.
         */
        remove(...relativePath: any[]): WeavePath;
        /**
         * Reorders the children of an ILinkableHashMap at the current path.
         * @param orderedNames An Array (or multiple parameters) specifying ordered child names.
         * @return The current WeavePath object.
         */
        reorder(...orderedNames: any[]): WeavePath;
        /**
         * Sets the session state of the object at the current path or relative to the current path.
         * Any existing dynamically created objects that do not appear in the new state will be removed.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param state The session state to apply.
         * @return The current WeavePath object.
         */
        state(...relativePath_state: any[]): WeavePath;
        /**
         * Applies a session state diff to the object at the current path or relative to the current path.
         * Existing dynamically created objects that do not appear in the new state will remain unchanged.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param diff The session state diff to apply.
         * @return The current WeavePath object.
         */
        diff(...relativePath_diff: any[]): WeavePath;
        /**
         * Adds a callback to the object at the current path.
         * When the callback is called, a WeavePath object initialized at the current path will be used as the 'this' context.
         * If the same callback is added to multiple paths, only the last path will be used as the 'this' context.
         * @param relevantContext The thisArg for the function. When the context is disposed with Weave.dispose(), the callback will be disabled.
         * @param callback The callback function.
         * @param triggerCallbackNow Optional parameter, when set to true will trigger the callback now.
         * @param immediateMode Optional parameter, when set to true will use an immediate callback instead of a grouped callback.
         * @param delayWhileBusy Optional parameter, specifies whether to delay a grouped callback while the object is busy. Default is true.
         * @return The current WeavePath object.
         */
        addCallback(relevantContext: Object, callback: Function, triggerCallbackNow?: boolean, immediateMode?: boolean, delayWhileBusy?: boolean): WeavePath;
        /**
         * Removes a callback from the object at the current path or from everywhere.
         * @param relevantContext The relevantContext parameter that was given when the callback was added.
         * @param callback The callback function.
         * @return The current WeavePath object.
         */
        removeCallback(relevantContext: Object, callback: Function): WeavePath;
        /**
         * Evaluates an ActionScript expression using the current path, vars, and libs.
         * The 'this' context within the script will be the object at the current path.
         * @param script_or_function Either a String containing JavaScript code, or a Function.
         * @param callback Optional callback function to be passed the result of evaluating the script or function. The 'this' argument will be the current WeavePath object.
         * @return The current WeavePath object.
         */
        exec(script_or_function: any, callback?: Function): WeavePath;
        /**
         * Calls a function using the current WeavePath object as the 'this' value.
         * @param func The function to call.
         * @param args An optional list of arguments to pass to the function.
         * @return The current WeavePath object.
         */
        call(func: Function, ...args: any[]): WeavePath;
        /**
         * Applies a function to each item in an Array or an Object.
         * @param items Either an Array or an Object to iterate over.
         * @param visitorFunction A function to be called for each item in items. The function will be called using the current
         *                        WeavePath object as the 'this' value and will receive three parameters:  item, key, items.
         *                        If items is an Array, the key will be an integer. If items is an Object, the key will be a String.
         * @return The current WeavePath object.
         */
        forEach(items: Object, visitorFunction: Function): WeavePath;
        /**
         * Calls a function for each child of the current WeavePath or the one specified by a relativePath. The function receives child names.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param visitorFunction A function to be called for each child object. The function will be called using the current
         *                        WeavePath object as the 'this' value and will receive three parameters:  name, index, names.
         * @return The current WeavePath object.
         */
        forEachName(...relativePath_visitorFunction: any[]): WeavePath;
        /**
         * Calls a function for each child of the current WeavePath or the one specified by a relativePath. The function receives child WeavePath objects.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param visitorFunction A function to be called for each child object. The function will be called using the current
         *                        WeavePath object as the 'this' value and will receive three parameters:  child, index, children.
         * @return The current WeavePath object.
         */
        forEachChild(...relativePath_visitorFunction: any[]): WeavePath;
        /**
         * Calls weaveTrace() in Weave to print to the log window.
         * @param args A list of parameters to pass to weaveTrace().
         * @return The current WeavePath object.
         */
        trace(...args: any[]): WeavePath;
        /**
         * Returns a copy of the current path Array or the path Array of a descendant object.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names to be appended to the result.
         * @return An Array of successive child names used to identify an object in a Weave session state.
         */
        getPath(...relativePath: any[]): any[];
        /**
         * Gets an Array of child names under the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return An Array of child names.
         */
        getNames(...relativePath: any[]): any[];
        /**
         * Gets an Array of child WeavePath objects under the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return An Array of child WeavePath objects.
         */
        getChildren(...relativePath: any[]): any[];
        /**
         * Gets the type (qualified class name) of the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return The qualified class name of the object at the current or descendant path, or null if there is no object.
         */
        getType(...relativePath: any[]): string;
        /**
         * Gets the simple type (unqualified class name) of the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return The unqualified class name of the object at the current or descendant path, or null if there is no object.
         */
        getSimpleType(...relativePath: any[]): string;
        /**
         * Gets the session state of an object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return The session state of the object at the current or descendant path.
         */
        getState(...relativePath: any[]): Object;
        getTypedState(...relativePath: any[]): Object;
        getUntypedState(...relativePath: any[]): Object;
        /**
         * Gets the changes that have occurred since previousState for the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param previousState The previous state for comparison.
         * @return A session state diff.
         */
        getDiff(...relativePath_previousState: any[]): Object;
        /**
         * Gets the changes that would have to occur to get to another state for the object at the current path or relative to the current path.
         * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param otherState The other state for comparison.
         * @return A session state diff.
         */
        getReverseDiff(...relativePath_otherState: any[]): Object;
        /**
         * Returns the value of an ActionScript expression or variable using the current path as the 'this' argument.
         * @param script_or_function Either a String containing JavaScript code, or a Function.
         * @return The result of evaluating the script or function.
         */
        getValue(script_or_function: any, ...args: any[]): Object;
        getObject(...relativePath: any[]): ILinkableObject;
        /**
         * Provides a human-readable string containing the path.
         */
        toString(): string;
        protected static _assertParams(methodName: string, args: any[], minLength?: number): boolean;
        protected static _failPath(methodName: string, path: any[]): any;
        protected static _failObject(methodName: string, path: any[]): any;
        protected static _failMessage(methodName: string, message: string, path?: any[]): any;
        static migrate(source: WeavePath, destination: Weave): void;
    }
}
declare module weavejs.path {
    class WeavePathData extends WeavePath {
        IDataSource: any;
        ColumnUtils: any;
        ReferencedColumn: any;
        DynamicColumn: any;
        ExtendedDynamicColumn: any;
        IAttributeColumn: any;
        IKeySet: any;
        IKeySetCallbackInterface: any;
        IQualifiedKey: any;
        constructor(weave?: Weave, basePath?: any[]);
        probe_keyset: WeavePathData;
        selection_keyset: WeavePathData;
        subset_filter: WeavePathData;
        qkeyToString: Function;
        stringToQKey: Function;
        indexToQKey: Function;
        qkeyToIndex: Function;
        /**
         * Creates a new property based on configuration stored in a property descriptor object.
         * See initProperties for documentation of the property_descriptor object.
         * @param callback_pass If false, create object, verify type, and set default value; if true, add callback;
         * @param property_descriptor An object containing, minimally, a 'name' property defining the name of the session state element to be created.
         * @private
         * @return The current WeavePath object.
         */
        /**
         * Creates a set of properties for a tool from an array of property descriptor objects.
         * Each property descriptor can contain the follow properties:
         * 'name': Required, specifies the name for the session state item.
         * 'children': Optionally, another array of property descriptors to create as children of this property.
         * 'label': A human-readable display name for the session state item.
         * 'type': A Weave session variable type; defaults to "LinkableVariable," or "LinkableHashMap" if children is defined.
         * 'callback': A function to be called when this session state item (or a child of it) changes.
         * 'triggerNow': Specify whether to trigger the callback after it is added; defaults to 'true.'
         * 'immediate': Specify whether to execute the callback in immediate (once per change) or grouped (once per frame) mode.
         * @param {Array} property_descriptor_array An array of property descriptor objects, each minimally containing a 'name' property.
         * @param {object} manifest An object to populate with name->path relationships for convenience.
         * @return {object} The manifest.
         */
        /**
         * Constructs and returns an object containing keys corresponding to the children of the session state object referenced by this path, the values of which are new WeavePath objects.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return {object} An object containing keys corresponding to the children of the session state object.
         */
        getProperties(...relativePath: any[]): Object;
        /**
         * Returns an array of alphanumeric strings uniquely corresponding to the KeySet referenced by this path.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return {Array} An array of alphanumeric strings corresponding to the keys contained by the KeySet.
         */
        getKeys(...relativePath: any[]): any[];
        /**
         * Forces a flush of the add/remove key buffers for the KeySet specified by this path.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        flushKeys(...relativePath: any[]): WeavePath;
        /**
         * Adds the specified keys to the KeySet at this path. These will not be added immediately, but are queued with flush timeout of approx. 25 ms.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param {Array} [qkeyStringArray] An array of alphanumeric keystrings that correspond to QualifiedKeys.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        addKeys(...relativePath_qkeyStringArray: any[]): WeavePath;
        /**
         * Removes the specified keys to the KeySet at this path. These will not be removed immediately, but are queued with a flush timeout of approx. 25 ms.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param {Array} [qkeyStringArray] An array of alphanumeric keystrings that correspond to QualifiedKeys.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        removeKeys(...relativePath_qkeyStringArray: any[]): WeavePath;
        /**
         * Adds a callback to the KeySet specified by this path which will return information about which keys were added or removed to/from the set.
         * @param {Function} callback           A callback function which will receive an object containing two fields,
         *                                       'added' and 'removed' which contain a list of the keys which changed in the referenced KeySet
         * @param {boolean}  [triggerCallbackNow] Whether to trigger the callback immediately after it is added.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        addKeySetCallback(callback: Function, triggerCallbackNow?: boolean): WeavePath;
        /**
         * Replaces the contents of the KeySet at this path with the specified keys.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param {Array} qkeyStringArray An array of alphanumeric keystrings that correspond to QualifiedKeys.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        setKeys(...relativePath_qkeyStringArray: any[]): WeavePath;
        /**
         * Intersects the specified keys with the KeySet at this path.
         * @param [relativePath] An optional Array (or multiple parameters) specifying descendant names relative to the current path
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param {Array} qkeyStringArray An array of alphanumeric keystrings that correspond to QualifiedKeys.
         * @return {Array} The keys which exist in both the qkeyStringArray and in the KeySet at this path.
         */
        filterKeys(...relativePath_qkeyStringArray: any[]): any[];
        /**
         * Retrieves a list of records defined by a mapping of property names to column paths or by an array of column names.
         * @param {object} pathMapping An object containing a mapping of desired property names to column paths or an array of child names.
         * pathMapping can be one of three different forms:
         *
         * 1. An array of column names corresponding to children of the WeavePath this method is called from, e.g., path.retrieveRecords(["x", "y"]);
         * the column names will also be used as the corresponding property names in the resultant records.
         *
         * 2. An object, for which each property=>value is the target record property => source column WeavePath. This can be defined to include recursive structures, e.g.,
         * path.retrieveRecords({point: {x: x_column, y: y_column}, color: color_column}), which would result in records with the same form.
         *
         * 3. If it is null, all children of the WeavePath will be retrieved. This is equivalent to: path.retrieveRecords(path.getNames());
         *
         * The alphanumeric QualifiedKey for each record will be stored in the 'id' field, which means it is to be considered a reserved name.
         * @param {weave.WeavePath} [options] An object containing optional parameters:
         *                                    "keySet": A WeavePath object pointing to an IKeySet (columns are also IKeySets.)
         *                                    "dataType": A String specifying dataType: string/number/date/geometry
         * @return {Array} An array of record objects.
         */
        retrieveRecords(pathMapping: Object, options?: Object): any[];
        /**
         * @private
         * Walk down a property chain of a given object and set the value of the final node.
         * @param root The object to navigate through.
         * @param property_chain An array of property names defining a path.
         * @param value The value to which to set the final node.
         * @return The value that was set, or the current value if no value was given.
         */
        protected static setChain(root: Object, property_chain: any[], value?: any): any;
        /**
         * @private
         * Walk down a property chain of a given object and return the final node.
         * @param root The object to navigate through.
         * @param property_chain An array of property names defining a path.
         * @return The value of the final property in the chain.
         */
        protected static getChain(root: Object, property_chain: any[]): any;
        /**
         * @private
         * Recursively builds a mapping of property chains to WeavePath objects from a path specification as used in retrieveRecords
         * @param obj A path spec object
         * @param prefix A property chain prefix (optional)
         * @param output Output object with "chains" and "columns" properties (optional)
         * @return An object like {"chains": [], "columns": []}, where "chains" contains property name chains and "columns" contains IAttributeColumn objects
         */
        protected listChainsAndColumns(obj: Object, prefix?: any[], output?: Object): Object;
        /**
         * Sets a human-readable label for an ILinkableObject to be used in editors.
         * @param [relativePath] An optional Array (or multiple parameters) specifying child names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @param {string} label The human-readable label for an ILinkableObject.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        label(...relativePath_label: any[]): WeavePath;
        /**
         * Gets the previously-stored human-readable label for an ILinkableObject.
         * @param [relativePath] An optional Array (or multiple parameters) specifying child names relative to the current path.
         *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
         * @return {string} The human-readable label for an ILinkableObject.
         */
        getLabel(...relativePath: any[]): string;
        /**
         * Sets the metadata for a column at the current path.
         * @param {object} metadata The metadata identifying the column. The format depends on the data source.
         * @param {string} dataSourceName (Optional) The name of the data source in the session state.
         *                       If ommitted, the first data source in the session state will be used.
         * @return {weave.WeavePath} The current WeavePath object.
         */
        setColumn(metadata: Object, dataSourceName: string): WeavePath;
        /**
         * Sets the metadata for multiple columns that are children of the current path.
         * @param metadataMapping An object mapping child names (or indices) to column metadata.
         *                        An Array of column metadata objects may be given for a LinkableHashMap.
         * @param dataSourceName The name of the data source in the session state.
         *                       If ommitted, the first data source in the session state will be used.
         * @return The current WeavePath object.
         */
        setColumns(metadataMapping: Object, dataSourceName: string): WeavePathData;
    }
}
declare module weavejs.path {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    class WeavePathDataShared {
        IKeySet: any;
        IQualifiedKeyManager: any;
        IQualifiedKey: any;
        static DEFAULT_PROBE_KEY_SET: string;
        static DEFAULT_SELECTION_KEY_SET: string;
        static DEFAULT_SUBSET_KEY_FILTER: string;
        constructor();
        init(weave: Weave): void;
        weave: Weave;
        probe_keyset: WeavePathData;
        selection_keyset: WeavePathData;
        subset_filter: WeavePathData;
        /**
         * Retrieves or allocates the index for the given QualifiedKey object based on its localName and keyType properties
         * @param  {object} key A QualifiedKey object (containing keyType and localName properties) to be converted.
         * @return {number}     The existing or newly-allocated index for the qualified key.
         */
        qkeyToIndex(qkey: any): number;
        /**
         * Retrieves the corresponding qualified key object from its numeric index.
         * @private
         * @param  {number} index The numeric index, as received from qkeyToIndex
         * @return {object}       The corresponding untyped QualifiedKey object.
         */
        indexToQKey(index: number): Object;
        /**
         * Retrieves an alphanumeric string unique to a QualifiedKey
         * This is also available as an alias on the WeavePath object.
         * @param  {object} qkey The QualifiedKey object to convert.
         * @return {string}     The corresponding alphanumeric key.
         */
        qkeyToString(qkey: Object): string;
        /**
         * Retrieves the QualifiedKey object corresponding to a given alphanumeric string.
         * This is also available as an alias on the WeavePath object.
         * @param  {string} s The keystring to convert.
         * @return {object}   The corresponding untyped QualifiedKey
         */
        stringToQKey(s: string): Object;
        /**
         * Flushes the key add/remove buffers for a specific session state path.
         * @private
         * @param  {Array} pathArray The session state path to flush.
         */
        _flushKeys(keySet: ILinkableObject): void;
        /**
         * Set a timeout to flush the add/remove key buffers for a given session state path if one isn't already in progress.
         * @private
         * @param  {Array} pathArray The session state path referencing a KeySet to flush.
         */
        _flushKeysLater(keySet: ILinkableObject): void;
        /**
         * Queue keys to be added to a specified path.
         * @private
         * @param {Array} pathArray      The session state path referencing a KeySet
         * @param {Array} keyStringArray The set of keys to add.
         */
        _addKeys(keySet: ILinkableObject, qkeyStrings: any[]): void;
        /**
         * Queue keys to be removed from a specified path.
         * @private
         * @param {Array} pathArray      The session state path referencing a KeySet
         * @param {Array} keyStringArray The set of keys to remove.
         */
        _removeKeys(keySet: ILinkableObject, qkeyStrings: any[]): void;
    }
}
declare module weavejs.path {
    class WeavePathUI extends WeavePathData {
        constructor(weave?: Weave, basePath?: any[]);
        /**
         * This is a shortcut for pushing the path to a plotter from the current path, which should reference a visualization tool.
         * @param plotterName (Optional) The name of an existing or new plotter.
         *                    If omitted and the current path points to a LayerSettings object, the corresponding plotter will be used.
         *                    Otherwise if omitted the default plotter name ("plot") will be used.
         * @param plotterType (Optional) The type of plotter to request if it doesn't exist yet.
         * @return A new WeavePath object which remembers the current WeavePath as its parent.
         */
        pushPlotter(plotterName: string, plotterType?: Object): WeavePath;
    }
}
declare module weavejs.util {
    /**
     * This class contains static functions that manipulate Arrays.
     *
     * @author adufilie
     */
    class ArrayUtils {
        /**
         * Computes the union of the items in a list of Arrays. Can also be used to get a list of unique items in an Array.
         * @param arrays A list of Arrays.
         * @return The union of all the unique items in the Arrays in the order they appear.
         */
        static union<T>(...arrays: Array<T[]>): Array<T>;
        /**
         * Computes the intersection of the items in a list of two or more Arrays.
         * @return The intersection of the items appearing in all Arrays, in the order that they appear in the first Array.
         */
        static intersection<T>(firstArray: Array<T>, secondArray: Array<T>, ...moreArrays: Array<T[]>): Array<T>;
        /**
         * Removes items from an Array.
         * @param array An Array of items.
         * @param itemsToRemove An Array of items to skip when making a copy of the array.
         * @return A new Array containing the items from the original array except those that appear in itemsToRemove.
         */
        static subtract<T>(array: Array<T>, itemsToRemove: Array<T>): Array<T>;
        /**
         * This function copies the contents of the source to the destination.
         * Either parameter may be either an Array.
         * @param source An Array-like object.
         * @param destination An Array.
         * @return A pointer to the destination Array
         */
        static copy<T>(source: Array<T>, destination?: Array<T>): Array<T>;
        /**
         * Fills an Object with the keys from an Array.
         */
        static fillKeys(output: {
            [key: string]: boolean;
        }, keys: Array<string>): void;
        /**
         * If there are any properties of the Object, return false; else, return true.
         * @param hashMap The Object to test for emptiness.
         * @return A boolean which is true if the Object is empty, false if it has at least one property.
         */
        static isEmpty(object: Object): boolean;
        /**
         * Efficiently removes duplicate adjacent items in a pre-sorted Array.
         * @param sorted The sorted Array
         */
        static removeDuplicatesFromSortedArray(sorted: any[]): void;
        /**
         * randomizes the order of the elements in the Array in O(n) time by modifying the given array.
         * @param array the array to randomize
         */
        static randomSort(array: any[]): void;
        /**
         * See http://en.wikipedia.org/wiki/Quick_select#Partition-based_general_selection_algorithm
         * @param list An Array to be re-organized
         * @param firstIndex The index of the first element in the list to partition.
         * @param lastIndex The index of the last element in the list to partition.
         * @param pivotIndex The index of an element to use as a pivot when partitioning.
         * @param compareFunction A function that takes two array elements a,b and returns -1 if a&lt;b, 1 if a&gt;b, or 0 if a==b.
         * @return The index the pivot element was moved to during the execution of the function.
         */
        /**
         * See http://en.wikipedia.org/wiki/Quick_select#Partition-based_general_selection_algorithm
         * @param list An Array to be re-organized.
         * @param compareFunction A function that takes two array elements a,b and returns -1 if a&lt;b, 1 if a&gt;b, or 0 if a==b.
         * @param firstIndex The index of the first element in the list to calculate a median from.
         * @param lastIndex The index of the last element in the list to calculate a median from.
         * @return The index the median element.
         */
        static getMedianIndex(list: any[], compareFunction: Function, firstIndex?: number, lastIndex?: number): number;
        /**
         * Merges two previously-sorted arrays.
         * @param sortedInputA The first sorted array.
         * @param sortedInputB The second sorted array.
         * @param mergedOutput An array to store the merged arrays.
         * @param comparator A function that takes two parameters and returns -1 if the first parameter is less than the second, 0 if equal, or 1 if the first is greater than the second.
         */
        static mergeSorted<T>(sortedInputA: Array<T>, sortedInputB: Array<T>, mergedOutput: Array<T>, comparator: (a: T, b: T) => number): void;
        /**
         * This will flatten an Array of Arrays into a flat Array.
         * Items will be appended to the destination Array.
         * @param source A multi-dimensional Array to flatten.
         * @param destination An Array to append items to.  If none specified, a new one will be created.
         * @return The destination Array with all the nested items in the source appended to it.
         */
        static flatten<T>(source: T[] | T, destination?: Array<T>): Array<T>;
        static flattenObject(input: Object, output?: Object, prefix?: string): Object;
        /**
         * This will take an Array of Arrays of String items and produce a single list of String-joined items.
         * @param arrayOfArrays An Array of Arrays of String items.
         * @param separator The separator String used between joined items.
         * @param includeEmptyItems Set this to true to include empty-strings and undefined items in the nested Arrays.
         * @return An Array of String-joined items in the same order they appear in the nested Arrays.
         */
        static joinItems(arrayOfArrays: Array<string[]>, separator: string, includeEmptyItems: boolean): Array<string>;
        /**
         * Performs a binary search on a sorted array with no duplicate values.
         * @param sortedUniqueValues Array of Numbers or Strings
         * @param compare A compare function
         * @param exactMatchOnly If true, searches for exact match. If false, searches for insertion point.
         * @return The index of the matching value or insertion point.
         */
        static binarySearch(sortedUniqueValues: any[], item: any, exactMatchOnly: boolean, compare?: (a: any, b: any) => number): number;
        /**
         * Creates an object from arrays of keys and values.
         * @param keys Keys corresponding to the values.
         * @param values Values corresponding to the keys.
         * @return A new Object.
         */
        static zipObject<T>(keys: Array<string>, values: Array<T>): {
            [key: string]: T;
        };
        /**
         * This will get a subset of properties/items/attributes from an Object/Array/XML.
         * @param object An Object/Array containing properties/items to retrieve.
         * @param keys A list of property names, index values.
         * @param output Optionally specifies where to store the resulting items.
         * @return An Object (or Array) containing the properties/items/attributes specified by keysOrIndices.
         */
        static getItems(object: Object | any[], keys: Array<string>, output?: Object | any[]): Object | any[];
        /**
         * Compares a list of properties in two objects
         * @param object1 The first object
         * @param object2 The second object
         * @param propertyNames A list of names of properties to compare
         * @return -1, 0, or 1
         */
        static compareProperties(object1: Object, object2: Object, propertyNames: Array<string>): number;
        /**
         * Removes items from an Array.
         * @param array Array
         * @param indices Array of numerically sorted indices to remove
         */
        static removeByIndex(array: any[], indices: Array<number>): void;
        /**
         * Gets a list of values of a property from a list of objects.
         * @param array An Array of Objects.
         * @param property The property name to get from each object
         * @return A list of the values of the specified property for each object in the original list.
         */
        static pluck(array: any[], property: string): any[];
        /**
         * Transposes a two-dimensional table.
         */
        static transpose<T>(table: Array<T[]>): Array<T[]>;
        /**
         * Creates a lookup from item (or item property) to index. Does not consider duplicate items (or duplicate item property values).
         * @param array An Array or Object
         * @param propertyChain A property name or chain of property names to index on rather than the item itself.
         * @return A reverse lookup Map.
         */
        static createLookup(array: any[] | {
            [key: string]: any;
        }, ...propertyChain: Array<string>): Map<any, string>;
    }
}
declare module weavejs.util {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Asynchronous merge sort.
     *
     * @author adufilie
     */
    class AsyncSort implements ILinkableObject {
        static debug: boolean;
        /**
         * This function will sort an Array (or Vector) immediately.
         * @param array An Array (or Vector) to sort in place.
         * @param compareFunction The function used to compare items in the array.
         */
        static sortImmediately(array: any, compareFunction?: Function): void;
        /**
         * This function is a wrapper for StandardLib.stringCompare(a, b, true) (case-insensitive String compare).
         */
        static compareCaseInsensitive(a: string, b: string): number;
        /**
         * Compares two primitive values.
         * This function is faster than StandardLib.compare(), but does not do deep object compare.
         */
        static primitiveCompare(a: any, b: any): number;
        /**
         * This is the sorted Array (or Vector), or null if the sort operation has not completed yet.
         */
        result: any;
        /**
         * This will begin an asynchronous sorting operation on the specified Array (or Vector).
         * Only one sort operation can be carried out at a time.
         * Callbacks will be triggered when the sorting operation completes.
         * The given Array (or Vector) will be modified in-place.
         * @param arrayToSort The Array (or Vector) to sort.
         * @param compareFunction A function that compares two items and returns -1, 0, or 1.
         * @see mx.utils.StandardLib#compare()
         */
        beginSort(arrayToSort: any, compareFunction?: Function): void;
        /**
         * Aborts the current async sort operation.
         */
        abort(): void;
        static test(compare: Object, testType?: number): void;
        static testSortOn(compare: Object, testType?: number): void;
    }
}
declare module weavejs.util {
    class ColorNode {
        constructor(position?: number, color?: number);
        position: number;
        color: number;
    }
}
declare module weavejs.util {
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * @author adufilie
     * @author abaumann
     */
    class ColorRamp extends LinkableVariable {
        static COLOR: string;
        static POSITION: string;
        constructor(sessionState?: Object);
        reverse(): void;
        getColors(): Array<number>;
        getHexColors(): Array<string>;
        /**
         * @param normValue A value between 0 and 1.
         * @return A color.
         */
        getColorFromNorm(normValue: number): number;
        /**
         * Normalizes a value between min and max and returns an RGB hex color.
         * @param value A numeric value
         * @param min The min value used for normalization
         * @param max The max value used for normalization
         * @return A color represented as a Number between 0x000000 and 0xFFFFFF
         */
        getColor(value: number, min?: number, max?: number): number;
        /**
         * Normalizes a value between min and max and returns an RGB hex color.
         * @param value A numeric value
         * @param min The min value used for normalization
         * @param max The max value used for normalization
         * @return A 6-digit hex color String like #FFFFFF
         */
        getHexColor(value: number, min?: number, max?: number): string;
        /************************
         * begin static section *
         ************************/
        /**
         * @return An Object with "name", "tags", and "colors" properties.
         */
        static getColorRampByName(rampName: string): {
            name: string;
            tags: string;
            colors: number[];
        };
        /**
         * @return An Object with "name", "tags", and "colors" properties.
         */
        static findMatchingColorRamp(ramp: ColorRamp): {
            name: string;
            tags: string;
            colors: number[];
        };
        static allColorRamps: Array<{
            name: string;
            tags: string;
            colors: number[];
        }>;
    }
}
declare module weavejs.util {
    class DateUtils {
        static parse(date: Object, moment_fmt: string, force_utc?: boolean, force_local?: boolean): Date;
        static format(date: Object, moment_fmt: string): string;
        static formatDuration(date: Object): string;
        static detectFormats(dates: Array<string | number>, moment_formats: Array<string>): Array<string>;
    }
}
declare module weavejs.util {
    /**
     * This class acts like a stop watch that supports nested begin/end times.
     * Pairs of calls to begin() and end() may be nested.
     *
     * @author adufilie
     */
    class DebugTimer {
        /**
         * This will record the current time as a new start time for comparison when lap() or end() is called.
         * Pairs of calls to begin() and end() may be nested.
         */
        static begin(): void;
        /**
         * Cancels the last call to begin().
         */
        static cancel(): void;
        /**
         * This will report the time since the last call to begin() or lap().
         * @param debugString A string to print using trace().
         * @param debugStrings Additional strings to print using trace(), which will be separated by spaces.
         * @return The elapsed time.
         */
        static lap(debugString: string, ...debugStrings: any[]): number;
        /**
         * This will reset the timer so that higher-level functions can resume their use of DebugTimer.
         * Pairs of calls to begin() and end() may be nested.
         * @param debugString A string to print using trace().
         * @param debugStrings Additional strings to print using trace(), which will be separated by spaces.
         * @return The elapsed time.
         */
        static end(debugString: string, ...debugStrings: any[]): number;
    }
}
declare module weavejs.util {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Tools for debugging.
     *
     * @author adufilie
     */
    class DebugUtils {
        /**
         * This function calls trace() using debugId() on each parameter.
         */
        static debugTrace(...args: any[]): void;
        /**
         * This function generates or returns a previously generated identifier for an object.
         */
        static debugId(object: Object): string;
        /**
         * This function will look up the object corresponding to the specified debugId.
         * @param debugId A debugId String or integer.
         */
        static debugLookup(debugId?: any): Object;
        static getAllDebugIds(): any[];
        /**
         * This will clear all saved ids and pointers to corresponding objects.
         */
        static resetDebugIds(): void;
        static watch<T extends ILinkableObject>(target?: T, callbackReturnsString?: (target: T) => string): void;
        static watchState(target?: ILinkableObject, indent?: any): void;
        static unwatch(target: ILinkableObject): void;
        /*********************
         **  Miscellaneous  **
         *********************/
        /**
         * @param state A session state.
         * @return An Array of Arrays, each like [path, value].
         */
        static flattenSessionState(state: Object, pathPrefix?: any[], output?: any[]): any[];
        /**
         * Traverses a path in a session state using the logic used by SessionManager.
         * @param state A full session state.
         * @param path A path.
         * @return The session state at the specified path.
         */
        static traverseStatePath(state: Object, path: any[]): any;
        static replaceUnknownObjectsInState(stateToModify: Object, className?: string): Object;
        static shiftKey(reactInstance: Object): boolean;
    }
}
declare module weavejs.util {
    /**
     * This is a wrapper for a 2-dimensional Map.
     *
     * @author adufilie
     */
    class Dictionary2D<K1, K2, V> {
        constructor(weakPrimaryKeys?: boolean, weakSecondaryKeys?: boolean, defaultType?: new (..._: any[]) => any);
        /**
         * The primary Map object.
         */
        map: Map<K1, Map<K2, V>>;
        /**
         * @param key1 The first map key.
         * @param key2 The second map key.
         * @return The value.
         */
        get(key1: K1, key2: K2): V;
        /**
         * This will add or replace an entry in the map.
         * @param key1 The first map key.
         * @param key2 The second map key.
         * @param value The value.
         */
        set(key1: K1, key2: K2, value: V): void;
        primaryKeys(): Array<K1>;
        secondaryKeys(key1: K1): Array<K2>;
        /**
         * This removes all values associated with the given primary key.
         * @param key1 The first dictionary key.
         */
        removeAllPrimary(key1: K1): void;
        /**
         * This removes all values associated with the given secondary key.
         * @param key2 The second dictionary key.
         * @private
         */
        removeAllSecondary(key2: K2): void;
        /**
         * This removes a value associated with the given primary and secondary keys.
         * @param key1 The first dictionary key.
         * @param key2 The second dictionary key.
         * @return The value that was in the dictionary.
         */
        remove(key1: K1, key2: K2): V;
        /**
         * Iterates over pairs of keys and corresponding values.
         * @param key1_key2_value A function which may return true to stop iterating.
         * @param thisArg The 'this' argument for the function.
         */
        forEach(key1_key2_value: (key1: K1, key2: K2, value: V) => any, thisArg: Object): void;
    }
}
declare module weavejs.util {
    class JS {
        /**
         * AS->JS Language helper to get the global scope
         */
        static global: Object;
        /**
         * Calls console.error()
         */
        static error(...args: any[]): void;
        /**
         * Calls console.log()
         */
        static log(...args: any[]): void;
        /**
         * Compiles a script into a function with optional parameter names.
         * @param script A String containing JavaScript code.
         * @param paramNames A list of parameter names for the generated function, so that these variable names can be used in the script.
         * @param errorHandler A function that handles errors.
         */
        static compile(script: string, paramNames?: Array<string>, errorHandler?: (e: Error) => void): Function;
        /**
         * AS->JS Language helper for ArrayBuffer
         */
        static ArrayBuffer: typeof ArrayBuffer;
        /**
         * AS->JS Language helper for Uint8Array
         */
        static Uint8Array: typeof Uint8Array;
        /**
         * AS->JS Language helper for DataView
         */
        static DataView: typeof DataView;
        /**
         * AS->JS Language helper for Promise
         */
        static Promise: typeof Promise;
        /**
         * AS->JS Language helper for Map
         */
        static Map: typeof Map;
        /**
         * AS->JS Language helper for WeakMap
         */
        static WeakMap: typeof WeakMap;
        /**
         * AS->JS Language helper for getting an Array of Map keys.
         */
        static mapKeys<K, V>(map: Map<K, V>): Array<K>;
        /**
         * AS->JS Language helper for getting an Array of Map values.
         */
        static mapValues<K, V>(map: Map<K, V>): Array<V>;
        /**
         * AS->JS Language helper for getting an Array of Map entries.
         */
        static mapEntries<K, V>(map: Map<K, V>): Array<[K, V]>;
        /**
         * Tests if an object can be iterated over. If this returns true, then toArray()
         * can be called to get all the values from the iterator as an Array.
         */
        static isIterable(value: any): boolean;
        /**
         * AS->JS Language helper for converting array-like objects to Arrays
         * Extracts an Array of values from an Iterator object.
         * Converts Arguments object to an Array.
         */
        static toArray(value: any): any[];
        /**
         * AS->JS Language helper for Object.keys()
         */
        static objectKeys(object: Object): Array<string>;
        /**
         * Tests if a value is of a primitive type.
         */
        static isPrimitive(value: any): boolean;
        /**
         * Makes a deep copy of an object.
         * @param allowNonPrimitiveRefs If allowNonPrimitiveRefs is true, references to non-primitive objects will be allowed.
         *                              If allowNonPrimitiveRefs is false, an error will be thrown if a non-primitive object is found.
         */
        static copyObject<T>(object: T, allowNonPrimitiveRefs?: boolean): T;
        /**
         * AS->JS Language helper for binding class instance functions
         */
        /**
         * Implementation of "classDef is Class"
         */
        static isClass(classDef: Object): boolean;
        /**
         * Implementation of "classDef as Class"
         */
        static asClass(classDef: any): new (..._: any[]) => any;
        static setTimeout(func: Function, delay: number, ...params: any[]): number;
        static clearTimeout(id: number): void;
        static setInterval(func: Function, delay: number, ...params: any[]): number;
        static clearInterval(id: number): void;
        static requestAnimationFrame(func: Function): number;
        static cancelAnimationFrame(id: number): void;
        /**
         * Current time in milliseconds
         */
        static now(): number;
        /**
         * Similar to Object.hasOwnProperty(), except it also checks prototypes.
         */
        static hasProperty(object: Object, prop: string): boolean;
        /**
         * AS->JS Language helper for Object.getOwnPropertyNames()
         */
        static getOwnPropertyNames(object: Object): Array<string>;
        /**
         * Similar to Object.getOwnPropertyNames(), except it also checks prototypes.
         */
        static getPropertyNames(object: Object, useCache: boolean): Array<string>;
    }
}
declare module weavejs.util {
    class JSByteArray {
        ENCODING_AMF0: number;
        ENCODING_AMF3: number;
        data: Uint8Array;
        dataView: DataView;
        length: number;
        position: number;
        littleEndian: boolean;
        objectEncoding: number;
        stringTable: any[];
        objectTable: any[];
        traitTable: any[];
        /**
         * Attempt to imitate AS3's ByteArray as very high-performance javascript.
         * I aliased the functions to have shorter names, like ReadUInt32 as well as ReadUnsignedInt.
         * I used some code from http://fhtr.blogspot.com/2009/12/3d-models-and-parsing-binary-data-with.html
         * to kick-start it, but I added optimizations and support both big and little endian.
         * @param data A Uint8Array
         */
        constructor(data?: Uint8Array, littleEndian?: boolean);
        readByte(): number;
        readUnsignedByte(): number;
        readBoolean(): boolean;
        readUnsignedInt(): number;
        readInt(): number;
        readUnsignedShort(): number;
        readShort(): number;
        readFloat(): number;
        readDouble(): number;
        readUTFBytes(len: number): string;
        readUTF(): string;
        readLongUTF(): string;
        readXML(): Object;
        readObject(): Object;
    }
}
declare module weavejs.util {
    class StandardLib {
        /**
         * This must be set externally.
         */
        static lodash: Object;
        static ol: Object;
        static formatNumber(number: number, precision?: number): string;
        /**
         * This function will cast a value of any type to a Number,
         * interpreting the empty string ("") and null as NaN.
         * @param value A value to cast to a Number.
         * @return The value cast to a Number, or NaN if the casting failed.
         */
        static asNumber(value: any): number;
        /**
         * Converts a value to a non-null String
         * @param value A value to cast to a String.
         * @return The value cast to a String.
         */
        static asString(value: any): string;
        /**
         * This function attempts to derive a boolean value from different types of objects.
         * @param value An object to parse as a Boolean.
         */
        static asBoolean(value: any): boolean;
        /**
         * Tests if a value is anything other than undefined, null, or NaN.
         */
        static isDefined(value: any): boolean;
        /**
         * Tests if a value is undefined, null, or NaN.
         */
        static isUndefined(value: any, orEmptyString?: boolean): boolean;
        /**
         * Pads a string on the left.
         */
        static lpad(str: string, length: number, padString?: string): string;
        /**
         * Pads a string on the right.
         */
        static rpad(str: string, length: number, padString?: string): string;
        /**
         * This function performs find and replace operations on a String.
         * @param string A String to perform replacements on.
         * @param findStr A String to find.
         * @param replaceStr A String to replace occurrances of the 'findStr' String with.
         * @param moreFindAndReplace A list of additional find,replace parameters to use.
         * @return The String with all the specified replacements performed.
         */
        static replace(string: string, findStr: string, replaceStr: string, ...moreFindAndReplace: any[]): string;
        /**
         * Substitutes "{n}" tokens within the specified string with the respective arguments passed in.
         * Same syntax as StringUtil.substitute() without the side-effects of using String.replace() with a regex.
         * @see String#replace()
         * @see mx.utils.StringUtil#substitute()
         */
        static substitute(format: string, ...args: any[]): string;
        /**
         * Takes a script where all lines have been indented with tabs,
         * removes the common indentation from all lines and optionally
         * replaces extra leading tabs with a number of spaces.
         * @param script A script.
         * @param spacesPerTab If zero or greater, this is the number of spaces to be used in place of each tab character used as indentation.
         * @return The modified script.
         */
        static unIndent(script: string, spacesPerTab?: number): string;
        /**
         * @see mx.utils.StringUtil#trim()
         */
        static trim(str: string): string;
        /**
         * @see mx.utils.StringUtil#isWhitespace()
         */
        static isWhitespace(character: string): boolean;
        /**
         * Converts a number to a String using a specific numeric base and optionally pads with leading zeros.
         * @param number The Number to convert to a String.
         * @param base Specifies the numeric base (from 2 to 36) to use.
         * @param zeroPad This is the minimum number of digits to return.  The number will be padded with zeros if necessary.
         * @return The String representation of the number using the specified numeric base.
         */
        static numberToBase(number: number, base?: number, zeroPad?: number): string;
        /**
         * This function returns -1 if the given value is negative, and 1 otherwise.
         * @param value A value to test.
         * @return -1 if value &lt; 0, 1 otherwise
         */
        static sign(value: number): number;
        /**
         * This function constrains a number between min and max values.
         * @param value A value to constrain between a min and max.
         * @param min The minimum value.
         * @param max The maximum value.
         * @return If value &lt; min, returns min.  If value &gt; max, returns max.  Otherwise, returns value.
         */
        static constrain(value: number, min: number, max: number): number;
        /**
         * Scales a number between 0 and 1 using specified min and max values.
         * @param value The value between min and max.
         * @param min The minimum value that corresponds to a result of 0.
         * @param max The maximum value that corresponds to a result of 1.
         * @return The normalized value between 0 and 1, or NaN if value is out of range.
         */
        static normalize(value: number, min: number, max: number): number;
        /**
         * This function performs a linear scaling of a value from an input min,max range to an output min,max range.
         * @param inputValue A value to scale.
         * @param inputMin The minimum value in the input range.
         * @param inputMax The maximum value in the input range.
         * @param outputMin The minimum value in the output range.
         * @param outputMax The maximum value in the output range.
         * @return The input value rescaled such that a value equal to inputMin is scaled to outputMin and a value equal to inputMax is scaled to outputMax.
         */
        static scale(inputValue: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number): number;
        /**
         * This rounds a Number to a given number of significant digits.
         * @param value A value to round.
         * @param significantDigits The desired number of significant digits in the result.
         * @return The number, rounded to the specified number of significant digits.
         */
        static roundSignificant(value: number, significantDigits?: number): number;
        /**
         * Rounds a number to the nearest multiple of a precision value.
         * @param number A number to round.
         * @param precision A precision to use.
         * @return The number rounded to the nearest multiple of the precision value.
         */
        static roundPrecision(number: number, precision: number): number;
        /**
         * @param n The number to round.
         * @param d The total number of non-zero digits we care about for small numbers.
         */
        static suggestPrecision(n: number, d: number): number;
        /**
         * Calculates an interpolated color for a normalized value.
         * @param normValue A Number between 0 and 1.
         * @param colors An Array or list of colors to interpolate between.  Normalized values of 0 and 1 will be mapped to the first and last colors.
         * @return An interpolated color associated with the given normValue based on the list of color values.
         */
        static interpolateColor(normValue: number, ...colors: any[]): number;
        /**
         * ITU-R 601
         */
        static getColorLuma(color: number): number;
        /**
         * @param color A numeric color value
         * @return A hex color string like #FFFFFF
         */
        static getHexColor(color: number): string;
        /**
         * Code from Graphics Gems Volume 1
         */
        static getNiceNumber(x: number, round: boolean): number;
        /**
         * Code from Graphics Gems Volume 1
         * Note: This may return less than the requested number of values
         */
        static getNiceNumbersInRange(min: number, max: number, numberOfValuesInRange: number): number[];
        /**
         * Calculates the mean value from a list of Numbers.
         */
        static mean(...args: any[]): number;
        /**
         * Calculates the sum of a list of Numbers.
         */
        static sum(...args: any[]): number;
        /**
         * Sorts an Array of items in place using properties, lookup tables, or replacer functions.
         * @param array An Array to sort.
         * @param params Specifies how to get values used to sort items in the array.
         *               This can either be an Array of params or a single param, each of which can be one of the following:<br>
         *               Array: values are looked up based on index (Such an Array must be nested in a params array rather than given alone as a single param)<br>
         *               Object or Dictionary: values are looked up using items in the array as keys<br>
         *               Property name: values are taken from items in the array using a property name<br>
         *               Replacer function: array items are passed through this function to get values<br>
         * @param sortDirections Specifies sort direction(s) (1 or -1) corresponding to the params.
         * @param inPlace Set this to true to modify the original Array in place or false to return a new, sorted copy.
         * @param returnSortedIndexArray Set this to true to return a new Array of sorted indices.
         * @return Either the original Array or a new one.
         * @see Array#sortOn()
         */
        static sortOn(array: any, params: any, sortDirections?: any, inPlace?: boolean, returnSortedIndexArray?: boolean): any;
        /**
         * Guesses the appropriate Array.sort() mode based on the first non-undefined item property from an Array.
         * @return Either Array.NUMERIC or 0.
         */
        /**
         * This will return the type of item found in the Array if each item has the same type.
         * @param a An Array to check.
         * @return The type of all items in the Array, or null if the types differ.
         */
        static getArrayType(a: any[]): new (..._: any[]) => any;
        /**
         * Checks if all items in an Array are instances of a given type.
         * @param a An Array of items to test
         * @param type A type to check for
         * @return true if each item in the Array is an object of the given type.
         */
        static arrayIsType(a: any[], type: new (..._: any[]) => any): boolean;
        /**
         * This will perform a log transformation on a normalized value to produce another normalized value.
         * @param normValue A number between 0 and 1.
         * @param factor The log factor to use.
         * @return A number between 0 and 1.
         */
        static logTransform(normValue: number, factor?: number): number;
        /**
         * This will generate a date string from a Number or a Date object using the specified date format.
         * @param value The Date object or date string to format.
         * @param formatString The format of the date string to be generated.
         * @param formatAsUniversalTime If set to true, the date string will be generated using universal time.
         *        If set to false, the timezone of the user's computer will be used.
         * @return The resulting formatted date string.
         *
         * @see mx.formatters::DateFormatter#formatString
         * @see Date
         */
        static formatDate(value: Object, formatString?: string, formatAsUniversalTime?: boolean): string;
        /**
         * This compares two dynamic objects or primitive values and is much faster than ObjectUtil.compare().
         * Does not check for circular refrences.
         * @param a First dynamic object or primitive value.
         * @param b Second dynamic object or primitive value.
         * @param objectCompare An optional compare function to replace the default compare behavior for non-primitive Objects.
         *                      The function should return -1, 0, or 1 to override the comparison result, or NaN to use the default recursive comparison result.
         * @return A value of zero if the two objects are equal, nonzero if not equal.
         */
        static compare(a: Object, b: Object, objectCompare?: Function): number;
        /**
         * @see mx.utils.ObjectUtil#numericCompare()
         */
        static numericCompare(a: number, b: number): number;
        /**
         * @see mx.utils.ObjectUtil#stringCompare()
         */
        static stringCompare(a: string, b: string, caseInsensitive?: boolean): number;
        /**
         * @see mx.utils.ObjectUtil#dateCompare()
         */
        static dateCompare(a: Date, b: Date): number;
        /**
         * @see https://github.com/bestiejs/punycode.js
         */
        static guid(): string;
        /**
         * Converts a Uint8Array to a binary String
         */
        static byteArrayToString(byteArray: Uint8Array): string;
    }
}
declare module weavejs.util {
    class StringView {
        buffer: any;
        bufferView: any[];
        rawData: any[];
        constructor(vInput?: any, sEncoding?: string, nOffset?: number, nLength?: number);
        static loadUTF8CharCode(aChars: any[], nIdx: number): number;
        static putUTF8CharCode(aTarget: any[], nChar: number, nPutAt: number): number;
        static getUTF8CharLength(nChar: number): number;
        static loadUTF16CharCode(aChars: any[], nIdx: number): number;
        static putUTF16CharCode(aTarget: any[], nChar: number, nPutAt: number): number;
        static getUTF16CharLength(nChar: number): number;
        static b64ToUint6(nChr: number): number;
        static uint6ToB64(nUint6: number): number;
        static bytesToBase64(aBytes: any[]): string;
        static base64ToBytes(sBase64: string, nBlockBytes?: number): any[];
        static makeFromBase64(sB64Inpt: string, sEncoding: string, nByteOffset: number, nLength: number): StringView;
        encoding: string;
        makeIndex(nChrLength?: number, nStartFrom?: number): number;
        toBase64(bWholeBuffer: boolean): string;
        subview(nCharOffset: number, nCharLength: number): StringView;
        forEachChar(fCallback: Function, oThat: Object, nChrOffset: number, nChrLen: number): void;
        toString(): string;
    }
}
declare module weavejs.util {
    /**
     * Dynamic menu item for use with Flex Menus.
     *
     * Flex's DefaultDataDescriptor checks the following properties:
     *     label, children, enabled, toggled, type, groupName
     */
    class WeaveMenuItem extends WeaveTreeItem {
        /**
         * Initializes an Array of WeaveMenuItems using an Array of objects to pass to the constructor.
         * Any Arrays passed in will be flattened and surrounded by separators.
         * @param items An Array of item descriptors.
         */
        static createMenuItems(items: any[]): any[];
        /**
         * Makes sure a non-empty output array ends in a non-redundant separator.
         */
        static TYPE_SEPARATOR: string;
        static TYPE_CHECK: string;
        static TYPE_RADIO: string;
        /**
         * Constructs a new WeaveMenuItem.
         * @param params An Object containing property values to set on the WeaveMenuItem.
         *               If this is a String equal to "separator" (TYPE_SEPARATOR), a new separator will be created.
         */
        constructor(params?: Object);
        /**
         * This can be either a Function or an ILinkableVariable to be treated as a boolean setting.
         * The Function signature can be like function():void or function(item:WeaveMenuItem):void.
         * Instead of reading this property directly, call runClickFunction().
         * @see #runClickFunction()
         */
        click: any;
        /**
         * This property is checked by Flex's default data descriptor.
         */
        type: string;
        /**
         * This property is checked by Flex's default data descriptor.
         */
        groupName: string;
        label: any;
        /**
         * This property is checked by Flex's default data descriptor.
         */
        toggled: any;
        /**
         * This can be set to either a Boolean, a Function, or an ILinkableVariable.
         * This property is checked by Flex's default data descriptor.
         */
        enabled: any;
        /**
         * Specifies whether or not this item should be shown.
         * This can be set to either a Boolean, a Function, an ILinkableVariable, or an Array of ILinkableVariables.
         */
        shown: any;
        /**
         * Gets a filtered copy of the child menu items.
         * When this property is accessed, refresh() will be called except if refresh() is already being called.
         * This property is checked by Flex's default data descriptor.
         */
        children: any;
        /**
         * If the click property is set to a Function, it will be called like click.call(this)
         *   or click.call(this, this) if the former produces an ArgumentError.
         * If the click property is set to an ILinkableVariable, it will be toggled as a boolean.
         */
        runClickFunction(): void;
    }
}
declare module weavejs.util {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    /**
     * Use this when you need a Promise chain to depend on ILinkableObjects and resolve multiple times.
     *
     * Adds support for <code>depend(...linkableObjects)</code>
     */
    class WeavePromise<T> implements IDisposableObject {
        static _callNewHandlersSeparately: boolean;
        /**
         * @param relevantContext This parameter may be null.  If the relevantContext object is disposed, the promise will be disabled.
         * @param resolver A function like function(resolve:Function, reject:Function):void which carries out the promise.
         *                 If no resolver is given, setResult() or setError() should be called externally.
         */
        constructor(relevantContext?: Object, resolver?: (resolve: (value?: T) => void, reject: (error?: any) => void) => void);
        protected relevantContext: Object;
        /**
         * @return This WeavePromise
         */
        setResult(result: T): WeavePromise<T>;
        static asPromise<T>(obj: Object): Promise<T>;
        static isThenable(obj: Object): boolean;
        getResult(): T;
        /**
         * @return This WeavePromise
         */
        setError(error: Object): WeavePromise<T>;
        getError(): Object;
        then<U>(onFulfilled?: (value: T) => (U | Promise<U> | WeavePromise<U>), onRejected?: (error: any) => (U | Promise<U> | WeavePromise<U>)): WeavePromise<U>;
        depend(...linkableObjects: any[]): WeavePromise<T>;
        getPromise(): Promise<T>;
        dispose(): void;
    }
}
declare module weavejs.util {
    class WeavePromiseHandler<T, U> {
        onFulfilled: (value: T) => (U | Promise<U> | WeavePromise<U>);
        onRejected: (error: any) => (U | Promise<U> | WeavePromise<U>);
        next: WeavePromise<U>;
        /**
         * Used as a flag to indicate that this handler has not been called yet
         */
        isNew: boolean;
        constructor(onFulfilled?: (value: T) => (U | Promise<U> | WeavePromise<U>), onRejected?: (error: any) => (U | Promise<U> | WeavePromise<U>), next?: WeavePromise<T>);
        onResult(result: Object): void;
        onError(error: Object): void;
    }
}
declare module weavejs.util {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * Facilitates the creation of dynamic trees.
     */
    class WeaveTreeItem {
        /**
         * Initializes an Array of WeaveTreeItems using an Array of objects to pass to the constructor.
         * Any Arrays passed in will be flattened.
         * @param WeaveTreeItem_implementation The implementation of WeaveTreeItem to use.
         * @param items Item descriptors.
         */
        static createItems<T>(WeaveTreeItem_implementation: new (params?: Object) => WeaveTreeItem, items: any[]): Array<WeaveTreeItem>;
        /**
         * Used for mapping an Array of params objects to an Array of WeaveTreeItem objects.
         * @param WeaveTreeItem_implementation The implementation of WeaveTreeItem to use.
         * @param items Item descriptors.
         */
        protected static _mapItem(WeaveTreeItem_implementation: new (..._: any[]) => any, item: Object): Object;
        /**
         * Constructs a new WeaveTreeItem.
         * @param params An Object containing property values to set on the WeaveTreeItem.
         *               If params is a String, both <code>label</code> and <code>data</code> will be set to that String.
         */
        constructor(params?: Object);
        /**
         * Set this to change the constructor used for initializing child items.
         * This variable is intentionally uninitialized to avoid overwriting the value set by an extending class in its constructor.
         */
        protected childItemClass: new (..._: any[]) => any;
        protected _recursion: Object;
        protected _label: any;
        protected _children: any;
        protected _dependency: ILinkableObject;
        /**
         * Cached values that get invalidated when the source triggers callbacks.
         */
        protected _cache: Object;
        /**
         * Maps a property name to a Boolean which enables or disables caching for that property.
         */
        cacheSettings: Object;
        /**
         * Cached values of getCallbackCollection(source).triggerCounter.
         */
        protected _counter: Object;
        /**
         * Computes a Boolean value from various structures
         * @param param Either a Boolean, and Object like {not: param}, a Function, an ILinkableVariable, or an Array of those objects.
         * @param recursionName A name used to keep track of recursion.
         * @return A Boolean value derived from the param, or the param itself if called recursively.
         */
        protected getBoolean(param: any, recursionName: string): any;
        /**
         * Checks if an object has a single specified property.
         */
        protected isSimpleObject(object: any, singlePropertyName: string): boolean;
        /**
         * Gets a String value from a String or Function.
         * @param param Either a String or a Function.
         * @param recursionName A name used to keep track of recursion.
         * @return A String value derived from the param, or the param itself if called recursively.
         */
        protected getString(param: any, recursionName: string): any;
        /**
         * Evaluates a function to get an Object or just returns the non-Function Object passed in.
         * @param param Either an Object or a Function.
         * @param recursionName A name used to keep track of recursion.
         * @return An Object derived from the param, or the param itself if called recursively.
         */
        protected getObject(param: any, recursionName: string): any;
        /**
         * First tries calling a function with no parameters.
         * If an ArgumentError is thrown, the function will called again, passing this WeaveTreeItem as the first parameter.
         */
        protected evalFunction(func: Function): any;
        /**
         * Checks if cached value is valid.
         * Always returns false if the source property is not set.
         * @param id A string identifying a property.
         * @return true if the property value has been cached.
         */
        protected isCached(id: string): boolean;
        /**
         * Retrieves or updates a cached value for a property.
         * Does not cache the value if the source property is not set.
         * @param id A string identifying a property.
         * @param newValue Optional new value to cache for the property.
         * @return The new or existing value for the property.
         */
        protected cache(id: string, newValue?: any): any;
        /**
         * This can be set to either a String or a Function.
         * This property is checked by Flex's default data descriptor.
         * If this property is not set, the <code>data</code> property will be used as the label.
         */
        label: any;
        /**
         * Gets the Array of child menu items and modifies it in place if necessary to create nodes from descriptors or remove null items.
         * If this tree item specifies a dependency, the Array can be filled asynchronously.
         * This property is checked by Flex's default data descriptor.
         */
        /**
         * This can be set to either an Array or a Function that returns an Array.
         * The function can be like function():void or function(item:WeaveTreeItem):void.
         * The Array can contain either WeaveTreeItems or Objects, each of which will be passed to the WeaveTreeItem constructor.
         */
        children: any;
        /**
         * A pointer to the ILinkableObject that created this node.
         * This is used to determine when to invalidate cached values.
         */
        dependency: ILinkableObject;
        /**
         * This can be any data associated with this tree item.
         * For example, it can be used to store state information if the tree is populated asynchronously.
         */
        data: {
            [key: string]: any;
        };
    }
}
