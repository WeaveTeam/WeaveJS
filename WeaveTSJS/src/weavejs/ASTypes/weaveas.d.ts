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
