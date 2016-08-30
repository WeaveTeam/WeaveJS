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
        requestObject<T>(path: Array<string | number>, type: (new (..._: any[]) => T) | string): T;
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
        static getAncestor<T>(descendant: ILinkableObject, ancestorType: (new (..._: any[]) => T) | string): T & ILinkableObject;
        /**
         * Shortcut for WeaveAPI.SessionManager.getLinkableOwner()
         * @copy weave.api.core.ISessionManager#getLinkableOwner()
         */
        static getOwner(child: ILinkableObject): ILinkableObject;
        /**
         * Shortcut for WeaveAPI.SessionManager.getLinkableDescendants()
         * @copy weave.api.core.ISessionManager#getLinkableDescendants()
         */
        static getDescendants<T>(object: ILinkableObject, filter?: (new (..._: any[]) => T) | string): Array<T & ILinkableObject>;
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
        static AS<T>(object: Object, type: new (..._: any[]) => T): T;
        /**
         * Registers a class that must be instantiated asynchronously.
         * Dynamic items in the session state that extend this class will be replaced with
         * LinkablePlaceholder objects that can be replaced with actual instances later.
         */
        static registerAsyncClass<T>(type: new (..._: any[]) => T, instanceHandler: (instance: T) => void): void;
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
        static registerClass(definition: new (..._: any[]) => any, qualifiedName: string | string[], additionalInterfaces?: Array<new () => any>, displayName?: string): void;
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
declare module org.vanrijkom.dbf {
    /**
     * Instances of the DbfError class are thrown from the DBF library classes
     * on encountering errors.
     * @author Edwin van Rijkom
     *
     */
    class DbfError extends Error {
        /**
         * Defines the identifier value of an undefined error.
         */
        static ERROR_UNDEFINED: number;
        /**
         * Defines the identifier value of a 'out of bounds' error, which is thrown
         * when an invalid item index is passed.
         */
        static ERROR_OUTOFBOUNDS: number;
        constructor(msg?: string, id?: number);
    }
}
declare module org.vanrijkom.dbf {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The DbfField class parses a field definition from a DBF file loaded to a
     * ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class DbfField {
        /**
         * Field name.
         */
        name: string;
        /**
         * Field type.
         */
        type: number;
        /**
         * Field address.
         */
        address: number;
        /**
         * Field lenght.
         */
        length: number;
        /**
         * Field decimals.
         */
        decimals: number;
        /**
         * Field id.
         */
        id: number;
        /**
         * Field set flag.
         */
        setFlag: number;
        /**
         * Field index flag.
         */
        indexFlag: number;
        /**
         * Constructor.
         * @param src
         * @return
         *
         */
        constructor(src?: JSByteArray);
    }
}
declare module org.vanrijkom.dbf {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The DbfFilter class is a utility class that allows for collecting records
     * that match on one of the given values for a field.
     * @author Edwin
     *
     */
    class DbfFilter {
        /**
         * Array containing DbfRecord typed values that match on one of the given
         * values for a field.
         */
        matches: any[];
        /**
         * Constructor.
         * @param src ByteArray containing the DBF file to filter.
         * @param header DbfHeader instance previously read from the ByteArray.
         * @param field Field to filter on.
         * @param values Array of values to match field against.
         * @param append If specified, the found records will be added to the specified Array instead of to the instance's matches array.
         * @return
         * @see DbfHeader
         *
         */
        constructor(src?: JSByteArray, header?: DbfHeader, field?: string, values?: any[], append?: any[]);
    }
}
declare module org.vanrijkom.dbf {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The DbfHeader class parses a DBF file loaded to a ByteArray
     * @author Edwin van Rijkom
     *
     */
    class DbfHeader {
        /**
         * File length
         */
        fileLength: number;
        /**
         * File version
         */
        version: number;
        /**
         * Date of last update, Year.
         */
        updateYear: number;
        /**
         * Date of last update, Month.
         */
        updateMonth: number;
        /**
         * Data of last update, Day.
         */
        updateDay: number;
        /**
         * Number of records on file.
         */
        recordCount: number;
        /**
         * Header structure size.
         */
        headerSize: number;
        /**
         * Size of each record.
         */
        recordSize: number;
        /**
         * Incomplete transaction flag
         */
        incompleteTransaction: number;
        /**
         * Encrypted flag.
         */
        encrypted: number;
        /**
         * DBase IV MDX flag.
         */
        mdx: number;
        /**
         * Language driver.
         */
        language: number;
        /**
         * Array of DbfFields describing the fields found
         * in each record.
         */
        fields: any[];
        /**
         * Constructor
         * @param src
         * @return
         *
         */
        constructor(src?: JSByteArray);
    }
}
declare module org.vanrijkom.dbf {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The DbfRecord class parses a record from a DBF file loade to a ByteArray.
     * To do so it requires a DbfHeader instance previously read from the
     * ByteArray.
     * @author Edwin van Rijkom
     * @see DbfHeader
     *
     */
    class DbfRecord {
        /**
         * Record field values. Use values["fieldname"] to get a value.
         */
        map_field_value: Object;
        constructor(src?: JSByteArray, header?: DbfHeader);
    }
}
declare module org.vanrijkom.dbf {
    import JSByteArray = weavejs.util.JSByteArray;
    import DbfHeader = org.vanrijkom.dbf.DbfHeader;
    import DbfRecord = org.vanrijkom.dbf.DbfRecord;
    /**
     * The DbfTools class bundles a utility functions used by the remainder of
     * the DBF library.
     * @author Edwin van Rijkom
     *
     */
    class DbfTools {
        /**
         * Read a zero terminated ANSI string from a ByteArray.
         * @param src ByteArray instance to read from.
         * @return
         *
         */
        static readZeroTermANSIString(src: JSByteArray): string;
        /**
         * Read a fixed length ANSI string from a ByteArray.
         * @param src ByteArray instance to read from.
         * @param length Number of character to read.
         * @return
         *
         */
        static readANSIString(src: JSByteArray, length: number): string;
        /**
         * Read a DBF record from a DBF file.
         * @param src ByteArray instance to read from.
         * @param header DbfHeader instance previously read from the ByteArray.
         * @param index Index of the record to read.
         * @return
         * @see DbfHeader
         *
         */
        static getRecord(src: JSByteArray, header: DbfHeader, index: number): DbfRecord;
    }
}
declare module org.vanrijkom.shp {
    /**
     * Instances of the ShpError class are thrown from the SHP library classes
     * on encountering errors.
     * @author Edwin van Rijkom
     */
    class ShpError extends Error {
        /**
         * Defines the identifier value of an undefined error.
         */
        static ERROR_UNDEFINED: number;
        /**
         * Defines the identifier value of a 'no data' error, which is thrown
         * when a ByteArray runs out of data.
         */
        static ERROR_NODATA: number;
        /**
         * Constructor.
         * @param msg
         * @param id
         * @return
         *
         */
        constructor(msg?: string, id?: number);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    import Rectangle = weavejs.geom.Rectangle;
    import Point = weavejs.geom.Point;
    /**
     * The ShpHeader class parses an ESRI Shapefile Header from a ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class ShpHeader {
        /**
         * Size of the entire Shapefile as stored in the Shapefile, in bytes.
         */
        fileLength: number;
        /**
         * Shapefile version. Expected value is 1000.
         */
        version: number;
        /**
         * Type of the Shape records contained in the remainder of the
         * Shapefile. Should match one of the constant values defined
         * in the ShpType class.
         * @see ShpType
         */
        shapeType: number;
        /**
         * The cartesian bounding box of all Shape records contained
         * in this file.
         */
        boundsXY: Rectangle;
        /**
         * The minimum (Point.x) and maximum Z (Point.y) value expected
         * to be encountered in this file.
         */
        boundsZ: Point;
        /**
         * The minimum (Point.x) and maximum M (Point.y) value expected
         * to be encountered in this file.
         */
        boundsM: Point;
        /**
         * Constructor.
         * @param src
         * @return
         * @throws ShpError Not a valid shape file header
         * @throws ShpError Not a valid signature
         *
         */
        constructor(src?: JSByteArray);
    }
}
declare module org.vanrijkom.shp {
    /**
     * The ShpObject class is the base class of all specialized Shapefile
     * record type parsers.
     * @author Edwin van Rijkom
     * @see ShpPoint
     * @see ShpPointZ
     * @see ShpPolygon
     * @see ShpPolyline
     */
    class ShpObject {
        /**
         * Type of this Shape object. Should match one of the constant
         * values defined in the ShpType class.
         * @see ShpType
         */
        type: number;
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The ShpPoint class parses an ESRI Shapefile Point record from a ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class ShpPoint extends ShpObject {
        /**
         * Constructor
         * @throws ShpError Not a Point record
         */
        x: number;
        y: number;
        constructor(src?: JSByteArray, size?: number);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The ShpPointZ class parses an ESRI Shapefile PointZ record from a ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class ShpPointZ extends ShpPoint {
        /**
         * Z value
         */
        z: number;
        /**
         * M value (measure)
         */
        m: number;
        /**
         * Constructor
         * @param src
         * @param size
         * @return
         *
         */
        constructor(src?: JSByteArray, size?: number);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    import Rectangle = weavejs.geom.Rectangle;
    /**
     * The ShpPoint class parses an ESRI Shapefile Polygon record from a ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class ShpPolygon extends ShpObject {
        /**
         * Cartesian bounding box of all the rings found in this Polygon record.
         */
        box: Rectangle;
        /**
         * Array containing zero or more Arrays containing zero or more ShpPoint
         * typed values, constituting the rings found in this Polygon record.
         * @see ShpPoint
         */
        rings: any[];
        /**
         * Constructor.
         * @param src
         * @param size
         * @return
         * @throws ShpError Not a Polygon record
         */
        constructor(src?: JSByteArray, size?: number);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The ShpPoint class parses an ESRI Shapefile Polyline record from a ByteArray.
     * @author Edwin van Rijkom
     *
     */
    class ShpPolyline extends ShpPolygon {
        /**
         * Constructor.
         * @param src
         * @param size
         * @return
         *
         */
        constructor(src?: JSByteArray, size?: number);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The ShpPoint class parses an ESRI Shapefile Record Header from a ByteArray
     * as well as its associated Shape Object. The parsed object is stored as a
     * ShpObject that can be cast to a specialized ShpObject deriving class using
     * the found shapeType value.
     * @author Edwin van Rijkom
     *
     */
    class ShpRecord {
        /**
         * Record number
         */
        number: number;
        /**
         * Content length in 16-bit words
         */
        contentLength: number;
        /**
         * Content length in bytes
         */
        contentLengthBytes: number;
        /**
         * Type of the Shape Object associated with this Record Header.
         * Should match one of the constant values defined in the ShpType class.
         * @see ShpType
         */
        shapeType: number;
        /**
         * Parsed Shape Object. Cast to the specialized ShpObject deriving class
         * indicated by the shapeType property to obtain Shape type specific
         * data.
         */
        shape: ShpObject;
        /**
         * Constructor.
         * @param src
         * @return
         * @throws ShpError Not a valid header
         * @throws Shape type is currently unsupported by this library
         * @throws Encountered unknown shape type
         *
         */
        constructor(src?: JSByteArray);
    }
}
declare module org.vanrijkom.shp {
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The ShpTools class contains static tool methods for working with
     * ESRI Shapefiles.
     * @author Edwin van Rijkom
     *
     */
    class ShpTools {
        /**
         * Reads all available ESRI Shape records from the specified ByteArray.
         * Reading starts at the ByteArrays current offset.
         *
         * @param src ByteArray to read ESRI Shape records from.
         * @return An Array containing zoomero or more ShpRecord typed values.
         * @see ShpRecord
         */
        static readRecords(src: JSByteArray): any[];
    }
}
declare module org.vanrijkom.shp {
    /**
     * The ShpType class is a place holder for the ESRI Shapefile defined
     * shape types.
     * @author Edwin van Rijkom
     *
     */
    class ShpType {
        /**
         * Unknow Shape Type (for internal use)
         */
        static SHAPE_UNKNOWN: number;
        /**
         * ESRI Shapefile Null Shape shape type.
         */
        static SHAPE_NULL: number;
        /**
         * ESRI Shapefile Point Shape shape type.
         */
        static SHAPE_POINT: number;
        /**
         * ESRI Shapefile PolyLine Shape shape type.
         */
        static SHAPE_POLYLINE: number;
        /**
         * ESRI Shapefile Polygon Shape shape type.
         */
        static SHAPE_POLYGON: number;
        /**
         * ESRI Shapefile Multipoint Shape shape type
         * (currently unsupported).
         */
        static SHAPE_MULTIPOINT: number;
        /**
         * ESRI Shapefile PointZ Shape shape type.
         */
        static SHAPE_POINTZ: number;
        /**
         * ESRI Shapefile PolylineZ Shape shape type
         * (currently unsupported).
         */
        static SHAPE_POLYLINEZ: number;
        /**
         * ESRI Shapefile PolygonZ Shape shape type
         * (currently unsupported).
         */
        static SHAPE_POLYGONZ: number;
        /**
         * ESRI Shapefile MultipointZ Shape shape type
         * (currently unsupported).
         */
        static SHAPE_MULTIPOINTZ: number;
        /**
         * ESRI Shapefile PointM Shape shape type
         */
        static SHAPE_POINTM: number;
        /**
         * ESRI Shapefile PolyLineM Shape shape type
         * (currently unsupported).
         */
        static SHAPE_POLYLINEM: number;
        /**
         * ESRI Shapefile PolygonM Shape shape type
         * (currently unsupported).
         */
        static SHAPE_POLYGONM: number;
        /**
         * ESRI Shapefile MultiPointM Shape shape type
         * (currently unsupported).
         */
        static SHAPE_MULTIPOINTM: number;
        /**
         * ESRI Shapefile MultiPatch Shape shape type
         * (currently unsupported).
         */
        static SHAPE_MULTIPATCH: number;
    }
}
declare module weavejs {
    import IClassRegistry = weavejs.api.core.IClassRegistry;
    import ILocale = weavejs.api.core.ILocale;
    import IProgressIndicator = weavejs.api.core.IProgressIndicator;
    import IScheduler = weavejs.api.core.IScheduler;
    import ISessionManager = weavejs.api.core.ISessionManager;
    import IAttributeColumnCache = weavejs.api.data.IAttributeColumnCache;
    import ICSVParser = weavejs.api.data.ICSVParser;
    import IQualifiedKeyManager = weavejs.api.data.IQualifiedKeyManager;
    import IStatisticsCache = weavejs.api.data.IStatisticsCache;
    import IURLRequestUtils = weavejs.api.net.IURLRequestUtils;
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
        static AttributeColumnCache: IAttributeColumnCache;
        /**
         * This is the singleton instance of the registered IStatisticsCache implementation.
         */
        static StatisticsCache: IStatisticsCache;
        /**
         * This is the singleton instance of the registered IQualifiedKeyManager implementation.
         */
        static QKeyManager: IQualifiedKeyManager;
        /**
         * This is the singleton instance of the registered ICSVParser implementation.
         */
        static CSVParser: ICSVParser;
        /**
         * This is the singleton instance of the registered IURLRequestUtils implementation.
         */
        static URLRequestUtils: IURLRequestUtils;
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
     * Dynamic state objects have three properties: objectName, className, sessionState
     *
     * @author adufilie
     */
    class DynamicState {
        /**
         * Creates an Object having three properties: objectName, className, sessionState
         * @param objectName The name assigned to the object when the session state is generated.
         * @param className The qualified class name of the original object providing the session state.
         * @param sessionState The session state for an object of the type specified by className.
         */
        static create(objectName?: string, className?: string, sessionState?: Object): Object;
        /**
         * The name of the property containing the name assigned to the object when the session state is generated.
         */
        static OBJECT_NAME: string;
        /**
         * The name of the property containing the qualified class name of the original object providing the session state.
         */
        static CLASS_NAME: string;
        /**
         * The name of the property containing the session state for an object of the type specified by className.
         */
        static SESSION_STATE: string;
        /**
         * The name of the property used to make isDynamicState() return false in order to bypass special diff logic for dynamic state arrays.
         */
        static BYPASS_DIFF: string;
        /**
         * This function can be used to detect dynamic state objects within nested, untyped session state objects.
         * This function will check if the given object has the three properties of a dynamic state object.
         * @param object An object to check.
         * @param handleBypassDiff Set this to true to allow the object to contain the optional bypassDiff property.
         * @return true if the object has all three properties and no extras (except for "bypassDiff" when the handleBypassDiff parameter is set to true).
         */
        static isDynamicState(object: Object, handleBypassDiff?: boolean): boolean;
        /**
         * This function checks whether or not a session state is an Array containing at least one
         * object that looks like a DynamicState and has no other non-String items.
         * @param state A session state object.
         * @param handleBypassDiff Set this to true to allow dynamic state objects to contain the optional bypassDiff property.
         * @return A value of true if the Array looks like a dynamic session state or diff.
         */
        static isDynamicStateArray(state: any, handleBypassDiff?: boolean): boolean;
        /**
         * Alters a session state object to bypass special diff logic for dynamic state arrays.
         * It does so by adding the "bypassDiff" property to any part for which isDynamicState(part) returns true.
         */
        static alterSessionStateToBypassDiff(object: Object): void;
        /**
         * Converts DynamicState Arrays into Objects.
         * @param state The state to convert
         * @param recursive Specifies whether or not to recursively remove types.
         *                  If this is set to false, this function will only have an effect if the given state is a DynamicState Array.
         * @return The converted state
         */
        static removeTypeFromState(state: Object, recursive?: boolean): Object;
        /**
         * Sets or gets a value in a session state.
         * @param state The state to traverse
         * @param path The path in the state to traverse
         * @param newValue The new value, or undefined to retrieve the current value
         * @return The new or existing value
         */
        static traverseState(state: Object, path: any[], newValue?: any): any;
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
        registerClass(definition: new (..._: any[]) => any, qualifiedName: string, interfaces?: Array<new () => any>, displayName?: string): void;
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
         * Registers an implementation of an interface to be used as a singleton.
         * @param theInterface The interface to register.
         * @param theImplementation The implementation to register.
         * @return A value of true if the implementation was successfully registered.
         */
        registerSingletonImplementation<T>(theInterface: new () => T, theImplementation: new (..._: any[]) => T): boolean;
        /**
         * Gets the registered implementation of an interface.
         * @param theInterface An interface to a singleton class.
         * @return The registered implementation Class for the given interface Class.
         */
        getSingletonImplementation<T>(theInterface: new () => T): new (..._: any[]) => T;
        /**
         * This function returns the singleton instance for a registered interface.
         *
         * This method should not be called at static initialization time,
         * because the implementation may not have been registered yet.
         *
         * @param theInterface An interface to a singleton class.
         * @return The singleton instance that implements the specified interface.
         */
        getSingletonInstance(theInterface: new () => any): any;
        /**
         * This will register an implementation of an interface.
         * @param theInterface The interface class.
         * @param theImplementation An implementation of the interface.
         * @param displayName An optional display name for the implementation.
         */
        registerImplementation<T>(theInterface: new () => T, theImplementation: new (..._: any[]) => T, displayName?: string): void;
        /**
         * This will get an Array of class definitions that were previously registered as implementations of the specified interface.
         * @param theInterface The interface class.
         * @return An Array of class definitions that were previously registered as implementations of the specified interface.
         */
        getImplementations<T>(theInterface: new () => T): Array<new (..._: any[]) => T>;
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
        requestGlobalObject<T extends ILinkableObject>(name: string, objectType: new (..._: any[]) => T | string, lockObject?: boolean): T;
        /**
         * This function creates a local object using the given Class definition if it doesn't already exist.
         * If this object is locked, this function does nothing.
         * @param objectType The Class used to initialize the object.
         * @param lockObject If this is true, this object will be locked so the internal object cannot be removed or replaced.
         * @return The local object of the requested type, or null if the object could not be created.
         */
        requestLocalObject<T extends ILinkableObject>(objectType: new (..._: any[]) => T | string, lockObject?: boolean): T;
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
        getNames(filter?: new (..._: any[]) => any | string, filterIncludesPlaceholders?: boolean): Array<string>;
        /**
         * This function returns an ordered list of objects in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return An ordered Array of objects that correspond to the names returned by getNames(filter).
         */
        getObjects<T>(filter?: new (..._: any[]) => T | string, filterIncludesPlaceholders?: boolean): Array<T & ILinkableObject>;
        /**
         * This function returns an Object mapping names to objects contained in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return An Object mapping names to objects contained in the LinkableHashMap.
         */
        toObject<T>(filter?: new (..._: any[]) => T | string, filterIncludesPlaceholders?: boolean): {
            [name: string]: T & ILinkableObject;
        };
        /**
         * This function returns a Map containing the entries in the LinkableHashMap.
         * @param filter If specified, objects that are not of this type will be filtered out.
         * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
         * @return A Map containing the ordered entries in the LinkableHashMap.
         */
        toMap<T>(filter?: new (..._: any[]) => T | string, filterIncludesPlaceholders?: boolean): Map<String, T & ILinkableObject>;
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
        requestObject<T>(name: string, classDef: new (..._: any[]) => T | string, lockObject?: boolean): T;
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
     * This is an interface for a primitive ILinkableObject that implements its own session state definition.
     *
     * @author adufilie
     */
    interface ILinkableVariable extends ILinkableObject {
        /**
         * This gets the value of this linkable variable.
         * @return The session state of this object.
         */
        getSessionState(): Object;
        /**
         * This sets the value of this linkable variable.
         * The implementation of the object determines how to handle unexpected values.
         * @param value The new session state for this object.
         */
        setSessionState(value: Object): void;
    }
    var ILinkableVariable: new (..._: any[]) => ILinkableVariable;
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
        newLinkableChild<T extends ILinkableObject>(linkableParent: Object, linkableChildType: new () => T, callback?: Function, useGroupedCallback?: boolean): T;
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
        getLinkableDescendants<T>(root: ILinkableObject, filter?: new (..._: any[]) => T): Array<T & ILinkableObject>;
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
declare module weavejs.api.data {
    /**
     * Constants associated with different aggregation methods.
     * @see weave.api.data.ColumnMetadata
     */
    class Aggregation {
        static SAME: string;
        static FIRST: string;
        static LAST: string;
        static MEAN: string;
        static SUM: string;
        static MIN: string;
        static MAX: string;
        static COUNT: string;
        static ALL_TYPES: any[];
        /**
         * The default aggregation mode.
         */
        static DEFAULT: string;
        /**
         * The string displayed when data for a record is ambiguous.
         */
        static AMBIGUOUS_DATA: string;
        /**
         * Maps an aggregation method to a short description of its behavior.
         */
        static HELP: Object;
    }
}
declare module weavejs.api.data {
    /**
     * Constants that refer to standard metadata property names used by the IAttributeColumn.getMetadata() function.
     *
     * @author adufilie
     */
    class ColumnMetadata {
        static ENTITY_TYPE: string;
        static TITLE: string;
        static NUMBER: string;
        static STRING: string;
        static KEY_TYPE: string;
        static DATA_TYPE: string;
        static PROJECTION: string;
        static AGGREGATION: string;
        static DATE_FORMAT: string;
        static DATE_DISPLAY_FORMAT: string;
        static OVERRIDE_BINS: string;
        static MIN: string;
        static MAX: string;
        static getAllMetadata(column: IAttributeColumn): {
            [name: string]: string;
        };
        /**
         * @param propertyName The name of a metadata property.
         * @return An Array of suggested String values for the specified metadata property.
         */
        static getSuggestedPropertyValues(propertyName: string): Array<string>;
    }
}
declare module weavejs.api.data {
    /**
     * Constants associated with different data types.
     * @see weave.api.data.ColumnMetadata
     */
    class DataType {
        static NUMBER: string;
        static STRING: string;
        static DATE: string;
        static GEOMETRY: string;
        static ALL_TYPES: Array<string>;
        /**
         * Gets the Class associated with a dataType metadata value.
         * This Class indicates the type of values stored in a column with given dataType metadata value.
         * @param dataType A dataType metadata value.
         * @return The associated Class, which can be used to pass to IAttributeColumn.getValueFromKey().
         * @see weave.api.data.IAttributeColumn#getValueFromKey()
         */
        static getClass(dataType: string): new (..._: any[]) => any;
        /**
         * @param data An Array of data values.
         * @return A dataType metadata value, or null if no data was found.
         */
        static getDataTypeFromData(data: any[]): string;
    }
}
declare module weavejs.api.data {
    class DateFormat {
        static getSuggestions(): Array<string>;
        static ADDITIONAL_SUGGESTIONS: Array<string>;
        static FOR_AUTO_DETECT: Array<string>;
        static convertDateFormat_c_to_moment(format: string): string;
    }
}
declare module weavejs.api.data {
    class EntityType {
        static TABLE: string;
        static COLUMN: string;
        static HIERARCHY: string;
        static CATEGORY: string;
        static ALL_TYPES: Array<string>;
    }
}
declare module weavejs.api.data {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    /**
     * This is an interface to a mapping of keys to data values.
     *
     * @author adufilie
     */
    interface IAttributeColumn extends ICallbackCollection, IKeySet {
        /**
         * This function gets metadata associated with the column.
         * For standard metadata property names, refer to the ColumnMetadata class.
         * @param propertyName The name of the metadata property to retrieve.
         * @return The value of the specified metadata property.
         */
        getMetadata(propertyName: string): string;
        /**
         * Retrieves all metadata property names for this column.
         * @return An Array of all available metadata property names.
         */
        getMetadataPropertyNames(): Array<string>;
        /**
         * This function gets a value associated with a record key.
         * @param key A record key.
         * @param dataType The desired value type (Examples: Number, String, Date, Array, IQualifiedKey)
         * @return The value associated with the given record key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
    var IAttributeColumn: new (..._: any[]) => IAttributeColumn;
}
declare module weavejs.api.data {
    /**
     * This is a cache used to avoid making duplicate column requests.
     *
     * @author adufilie
     */
    interface IAttributeColumnCache {
        /**
         * This function will return the same IAttributeColumn for identical metadata values.
         * Use this function to avoid downloading duplicate column data.
         * @param dataSource The data source to request the column from if it is not already cached.
         * @param metadata The metadata to be passed to dataSource.generateNewAttributeColumn().
         * @return The cached column object.
         * @see weave.api.data.IDataSource#generateNewAttributeColumn()
         */
        getColumn(dataSource: IDataSource, metadata: Object): IAttributeColumn;
    }
    var IAttributeColumnCache: new (..._: any[]) => IAttributeColumnCache;
}
declare module weavejs.api.data {
    /**
     * A column which implements setRecords()
     */
    interface IBaseColumn extends IAttributeColumn {
        /**
         * Sets the data for this column.
         * @param keys An Array of IQualifiedKeys
         * @param data An Array of data values corresponding to the keys.
         */
        setRecords(keys: Array<IQualifiedKey>, data: any[]): void;
    }
    var IBaseColumn: new (..._: any[]) => IBaseColumn;
}
declare module weavejs.api.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * A class implementing IBinClassifier should contain sessioned properties
     * that define what values are contained in the bin.
     *
     * @author adufilie
     */
    interface IBinClassifier extends ILinkableObject {
        /**
         * This function tests if a data value is contained in this IBinClassifier.
         * @param value A data value to test.
         * @return true If this IBinClassifier contains the given value.
         */
        contains(value: any): boolean;
    }
    var IBinClassifier: new (..._: any[]) => IBinClassifier;
}
declare module weavejs.api.data {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * @author adufilie
     */
    interface IBinningDefinition extends ILinkableObject {
        /**
         * This will begin an asynchronous task to generate a list of IBinClassifier objects.
         * Only one task can be carried out at a time.
         * The asyncResultCallbacks will be triggered when the task completes.
         *
         * @param column A column for which to generate IBinClassifier objects.
         * @param output The hash map to be used as an output buffer for generated IBinClassifier objects.
         * @see weave.api.data.IBinClassifier
         * @see #resultCallbacks
         */
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        /**
         * These callbacks will be triggered when the current asynchronous task completes.
         * The callbacks of the IBinningDefinition will NOT be triggered as a result of these callbacks triggering,
         * so to know when the results change you must add a callback to this particular callback collection.
         * @see #generateBinClassifiersForColumn()
         * @see #getBinClassifiers()
         * @see #getBinNames()
         */
        asyncResultCallbacks: ICallbackCollection;
        /**
         * This accesses the result from the asynchronous task started by generateBinClassifiersForColumn().
         * @return An Array of IBinClassifier objects, or null if the current task has not completed yet.
         * @see #resultCallbacks
         */
        getBinClassifiers(): Array<IBinClassifier>;
        /**
         * This accesses the result from the asynchronous task started by generateBinClassifiersForColumn().
         * @return An Array of Strings, or null if the current task has not completed yet.
         * @see #resultCallbacks
         */
        getBinNames(): Array<string>;
    }
    var IBinningDefinition: new (..._: any[]) => IBinningDefinition;
}
declare module weavejs.api.data {
    /**
     * This is an interface for parsing and generating CSV data.
     *
     * @author adufilie
     */
    interface ICSVParser {
        /**
         * This will parse a CSV String into a two-dimensional Array of String values.
         * @param csvData The CSV String to parse.
         * @return A 2-dimensional Array of Strings.
         */
        parseCSV(csvData: string): Array<string[]>;
        /**
         * This will generate a CSV String from an Array of rows in a table.
         * @param rows A two-dimensional Array, which will be accessed like rows[rowIndex][columnIndex].
         * @return A CSV String containing the values from the rows.
         */
        createCSV(rows: any[]): string;
        /**
         * This function parses a String as a CSV-encoded row.
         * @param csvData The CSV string to parse.
         * @return The result of parsing the CSV string.
         */
        parseCSVRow(csvData: string): any[];
        /**
         * This function encodes an Array of Strings into a single CSV-encoded String.
         * @param row An array of values for a single row.
         * @return The row encoded as a CSV String.
         */
        createCSVRow(row: any[]): string;
        /**
         * This function converts an Array of Arrays to an Array of Objects compatible with DataGrid.
         * @param rows An Array of Arrays, the first being a header line containing property names.
         * @param headerDepth The number of header rows.  If the depth is greater than one, nested record objects will be created.
         * @return An Array of Objects containing String properties using the names in the header line.
         */
        convertRowsToRecords(rows: any[], headerDepth?: number): any[];
        /**
         * This function returns a comprehensive list of all the field names defined by a list of record objects.
         * @param records An Array of record objects.
         * @param includeNullFields If this is true, fields that have null values will be included.
         * @param headerDepth The depth of record properties.  If depth is greater than one, the records will be treated as nested objects.
         * @return A comprehensive list of all the field names defined by the given record objects.  If headerDepth > 1, a two-dimensional array will be returned.
         */
        getRecordFieldNames(records: any[], includeNullFields?: boolean, headerDepth?: number): any[];
        /**
         * This function converts an Array of Objects (compatible with DataGrid) to an Array of Arrays
         * compatible with other functions in this class.
         * @param records An Array of Objects containing String properties.
         * @param columnOrder An optional list of column names to use in order.  Must be a two-dimensional Array if headerDepth > 1.
         * @param allowBlankColumns If this is set to true, then the function will include all columns even if they are blank.
         * @param headerDepth The depth of record properties.  If depth is greater than one, the records will be treated as nested objects.
         * @return An Array of Arrays, the first being a header line containing all the property names.
         */
        convertRecordsToRows(records: any[], columnOrder?: any[], allowBlankColumns?: boolean, headerDepth?: number): any[];
    }
    var ICSVParser: new (..._: any[]) => ICSVParser;
}
declare module weavejs.api.data {
    /**
     * A column reference contains all the information required to retrieve a column of data.
     * This interface requires a function to get a hash value for the column reference that can be used to tell if two references are equal.
     *
     * @author adufilie
     */
    interface IColumnReference {
        /**
         * This function returns the IDataSource that knows how to get the column this object refers to.
         * @return The IDataSource that can be used to retrieve the column that this object refers to.
         */
        getDataSource(): IDataSource;
        /**
         * This function gets metadata associated with the column.
         * Make sure to test for a null return value.
         * For standard metadata property names, refer to the ColumnMetadata class.
         * @return An Object mapping metadata property names to values, or null if there is no column referenced.
         */
        getColumnMetadata(): {
            [name: string]: string;
        };
    }
    var IColumnReference: new (..._: any[]) => IColumnReference;
}
declare module weavejs.api.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This is an interface for getting cached numerical statistics on a column.
     *
     * @author adufilie
     */
    interface IColumnStatistics extends ILinkableObject {
        /**
         * Gets the numeric value for a given key normalized between 0 and 1.
         * @param key
         * @return A number between 0 and 1, or NaN
         */
        getNorm(key: IQualifiedKey): number;
        /**
         * Gets the minimum numeric value defined in the column.
         */
        getMin(): number;
        /**
         * Gets the maximum numeric value defined in the column.
         */
        getMax(): number;
        /**
         * Gets the count of the records having numeric values defined in the column.
         */
        getCount(): number;
        /**
         * Gets the sum of all the numeric values defined in the column.
         */
        getSum(): number;
        /**
         * Gets the sum of the squared numeric values defined in the column.
         */
        getSquareSum(): number;
        /**
         * Gets the mean value of all the numeric values defined in the column.
         */
        getMean(): number;
        /**
         * Gets the variance of the numeric values defined in the column.
         */
        getVariance(): number;
        /**
         * Gets the standard deviation of the numeric values defined in the column.
         */
        getStandardDeviation(): number;
        /**
         * Gets the median value of all the numeric values defined in the column.
         */
        getMedian(): number;
        /**
         * Gets a Dictionary mapping IQualifiedKeys to sort indices derived from sorting the numeric values in the column.
         */
        getSortIndex(): Object;
        /**
         * TEMPORARY SOLUTION - Gets a Dictionary mapping IQualifiedKey to Numeric data.
         */
        hack_getNumericData(): Object;
    }
    var IColumnStatistics: new (..._: any[]) => IColumnStatistics;
}
declare module weavejs.api.data {
    /**
     * This is an interface for a column that is a wrapper for another column.
     * The data should always be retrieved from the wrapper class because the getValueFromKey() function may modify the data before returning it.
     * The purpose of this interface is to allow you to check the type of the internal column.
     * One example usage of this is to check if the internal column is a StreamedGeometryColumn
     * so that you can request more detail from the tile service.
     *
     * @author adufilie
     */
    interface IColumnWrapper extends IAttributeColumn {
        /**
         * @return The internal column this object is a wrapper for.
         */
        getInternalColumn(): IAttributeColumn;
    }
    var IColumnWrapper: new (..._: any[]) => IColumnWrapper;
}
declare module weavejs.api.data {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This is a simple and generic interface for getting columns of data from a source.
     *
     * @author adufilie
     */
    interface IDataSource extends ILinkableObject {
        /**
         * A boolean determining whether or not a datasource depends on only session-local resources.
         * @return False if the datasource uses or depends on remote/network resources, true otherwise.
         */
        isLocal: boolean;
        /**
         * Gets the label of the root hierarchy node.
         * @return The label of the root hierarchy node.
         */
        getLabel(): string;
        /**
         * When explicitly triggered, this will force the hierarchy to be refreshed.
         * This should not be used to determine when the hierarchy is updated.
         * For that purpose, add a callback directly to the IDataSource instead.
         */
        hierarchyRefresh: ICallbackCollection;
        /**
         * Gets the root node of the attribute hierarchy, which should have descendant nodes that implement IColumnReference.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        /**
         * Finds the hierarchy node that corresponds to a set of metadata, or null if there is no such node.
         * @param metadata Metadata used to identify a node in the hierarchy, which may or may not reference a column.
         * @return The hierarchy node corresponding to the metadata or null if there is no corresponding node.
         */
        findHierarchyNode(metadata: Object): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        /**
         * Generates a new IAttributeColumn which will receive data from this IDataSource.
         * @param metadata Metadata used to identify a column in this IDataSource.
         * @return A new IAttributeColumn object that will be updated when the column data is available.
         */
        generateNewAttributeColumn(metadata: Object): IAttributeColumn;
    }
    var IDataSource: new (..._: any[]) => IDataSource;
}
declare module weavejs.api.data {
    interface IDataSourceWithAuthentication extends IDataSource {
        /**
         * Check this to determine if authenticate() may be necessary.
         * @return true if authenticate() may be necessary.
         */
        authenticationSupported: boolean;
        /**
         * Check this to determine if authenticate() must be called.
         * @return true if authenticate() should be called.
         */
        authenticationRequired: boolean;
        /**
         * The username that has been successfully authenticated.
         */
        authenticatedUser: string;
        /**
         * Authenticates with the server.
         * @param user
         * @param pass
         */
        authenticate(user: string, pass: string): void;
    }
    var IDataSourceWithAuthentication: new (..._: any[]) => IDataSourceWithAuthentication;
}
declare module weavejs.api.data {
    /**
     * Use this interface to indicate that an IDataSource represents a file.
     */
    interface IDataSource_File extends IDataSource {
    }
    var IDataSource_File: new (..._: any[]) => IDataSource_File;
}
declare module weavejs.api.data {
    /**
     * Use this interface to indicate that an IDataSource represents a service.
     */
    interface IDataSource_Service extends IDataSource {
    }
    var IDataSource_Service: new (..._: any[]) => IDataSource_Service;
}
declare module weavejs.api.data {
    /**
     * Use this interface to indicate that an IDataSource acts as a data transform.
     */
    interface IDataSource_Transform extends IDataSource {
    }
    var IDataSource_Transform: new (..._: any[]) => IDataSource_Transform;
}
declare module weavejs.api.data {
    import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
    /**
     * This is a wrapper for a dynamically created object implementing IKeyFilter.
     *
     * @author adufilie
     */
    interface IDynamicKeyFilter extends ILinkableDynamicObject {
        getInternalKeyFilter(): IKeyFilter;
    }
    var IDynamicKeyFilter: new (..._: any[]) => IDynamicKeyFilter;
}
declare module weavejs.api.data {
    import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
    /**
     * This is a wrapper for a dynamically created object implementing IKeySet.
     *
     * @author adufilie
     */
    interface IDynamicKeySet extends ILinkableDynamicObject {
        getInternalKeySet(): IKeySet;
    }
    var IDynamicKeySet: new (..._: any[]) => IDynamicKeySet;
}
declare module weavejs.api.data {
    /**
     * This is an interface for an object which references a URL.
     * It is intended to be used in conjunction with IWeaveTreeNode.
     */
    interface IExternalLink {
        /**
         * Gets the URL associated with this object.
         * @return The URL.
         */
        getURL(): string;
    }
    var IExternalLink: new (..._: any[]) => IExternalLink;
}
declare module weavejs.api.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This is an interface for a set of filtered keys.
     *
     * @author adufilie
     */
    interface IFilteredKeySet extends IKeySet, ILinkableObject {
        /**
         * @return The filter that is applied to the base key set.
         */
        keyFilter: IDynamicKeyFilter;
    }
    var IFilteredKeySet: new (..._: any[]) => IFilteredKeySet;
}
declare module weavejs.api.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    /**
     * This is an interface to an object that decides which IQualifiedKey objects are included in a set or not.
     *
     * @author adufilie
     */
    interface IKeyFilter extends ILinkableObject {
        /**
         * This function tests if a IQualifiedKey object is contained in this IKeySet.
         * @param key A IQualifiedKey object.
         * @return true if the IQualifiedKey object is contained in the IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
    }
    var IKeyFilter: new (..._: any[]) => IKeyFilter;
}
declare module weavejs.api.data {
    /**
     * This is an extension of IKeyFilter that adds a complete list of the IQualifiedKey objects contained in the key set.
     *
     * @author adufilie
     */
    interface IKeySet extends IKeyFilter {
        /**
         * This is a list of the IQualifiedKey objects that define the key set.
         */
        keys: Array<IQualifiedKey>;
    }
    var IKeySet: new (..._: any[]) => IKeySet;
}
declare module weavejs.api.data {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    /**
     * Provides an interface for getting KeySet event-related information.
     */
    interface IKeySetCallbackInterface extends ICallbackCollection {
        /**
         * This function should be called when keysAdded and keysRemoved are ready to be shared with the callbacks.
         * The keysAdded and keysRemoved Arrays will be reset to empty Arrays after the callbacks finish running.
         */
        flushKeys(): void;
        /**
         * The keys that were most recently added, causing callbacks to trigger.
         * This can be used as a buffer prior to calling flushKeys().
         * @see #flushKeys()
         */
        keysAdded: Array<IQualifiedKey>;
        /**
         * The keys that were most recently removed, causing callbacks to trigger.
         * This can be used as a buffer prior to calling flushKeys().
         * @see #flushKeys()
         */
        keysRemoved: Array<IQualifiedKey>;
    }
    var IKeySetCallbackInterface: new (..._: any[]) => IKeySetCallbackInterface;
}
declare module weavejs.api.data {
    /**
     * A primitive attribute column is one defined by primitive data and has both numeric and string
     * representations of its data values.
     */
    interface IPrimitiveColumn extends IAttributeColumn {
        /**
         * Derives a String from a Number using this column's conversion method.
         * @param number The numeric value to convert to a String.
         * @return The String representation of the given number using this column's conversion method.
         */
        deriveStringFromNumber(value: number): string;
    }
    var IPrimitiveColumn: new (..._: any[]) => IPrimitiveColumn;
}
declare module weavejs.api.data {
    import Point = weavejs.geom.Point;
    /**
     * An interface for an object that reprojects points from one specific coordinate system to another.
     *
     * @author adufilie
     */
    interface IProjector {
        /**
         * This function will reproject a point using the transformation method associated with this object.
         * @param inputAndOutput The point to reproject, which will be modified in place.
         * @return The transformed point, inputAndOutput, or null if the reprojection failed.
         */
        reproject(inputAndOutput: Point): Point;
    }
    var IProjector: new (..._: any[]) => IProjector;
}
declare module weavejs.api.data {
    /**
     * A Qualified Key contains a namespace (keyType) and a local name within that namespace.
     *
     * @author adufilie
     */
    interface IQualifiedKey {
        keyType: string;
        localName: string;
        toNumber(): number;
        toString(): string;
    }
    var IQualifiedKey: new (..._: any[]) => IQualifiedKey;
}
declare module weavejs.api.data {
    /**
     * This class manages a global list of IQualifiedKey objects.
     *
     * The getQKey() function must be used to get IQualifiedKey objects.  Each IQualifiedKey returned by
     * getQKey() with the same parameters will be the same object, so IQualifiedKeys can be compared
     * with the == operator or used as keys in a Dictionary.
     *
     * @author adufilie
     */
    interface IQualifiedKeyManager {
        /**
         * Get the IQualifiedKey object for a given key type and key.
         *
         * @return The IQualifiedKey object for this type and key.
         */
        getQKey(keyType: string, localName: string): IQualifiedKey;
        /**
         * Get a list of IQualifiedKey objects, all with the same key type.
         *
         * @param keyType The key type/namespace.
         * @param keyStrings An Array of localNames.
         * @return An array of IQualifiedKeys.
         */
        getQKeys(keyType: string, keyStrings: Array<string>): Array<IQualifiedKey>;
        /**
         * This will replace untyped Objects in an Array with their IQualifiedKey counterparts.
         * Each object in the Array should have two properties: <code>keyType</code> and <code>localName</code>
         * @param objects An Array to modify.
         * @return The same Array that was passed in, modified.
         */
        convertToQKeys(objects: Array<{
            keyType: string;
            localName: string;
        }>): Array<IQualifiedKey>;
        /**
         * Get a list of all previoused key types.
         *
         * @return An array of IQualifiedKeys.
         */
        getAllKeyTypes(): Array<string>;
        /**
         * Get a list of all referenced IQualifiedKeys for a given key type
         * @param keyType The key type.
         * @return An array of IQualifiedKeys
         */
        getAllQKeys(keyType: string): Array<IQualifiedKey>;
        /**
         * Get a QualifiedKey from its string representation.
         * @param qkeyString A string formatted like the output of IQualifiedKey.toString().
         * @return The QualifiedKey corresponding to the string representation.
         */
        stringToQKey(qkeyString: string): IQualifiedKey;
        /**
         * Get a QualifiedKey from its numeric representation.
         * @param qkeyNumber A Number.
         * @return The QualifiedKey corresponding to the numeric representation.
         */
        numberToQKey(qkeyNumber: number): IQualifiedKey;
    }
    var IQualifiedKeyManager: new (..._: any[]) => IQualifiedKeyManager;
}
declare module weavejs.api.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    interface ISelectableAttributes extends ILinkableObject {
        selectableAttributes: Map<string, (weavejs.api.data.IColumnWrapper | weavejs.api.core.ILinkableHashMap)>;
    }
    var ISelectableAttributes: new (..._: any[]) => ISelectableAttributes;
}
declare module weavejs.api.data {
    /**
     * This is an interface to a geometry object defined by an array of vertices
     * and a type.
     *
     * @author kmonico
     */
    interface ISimpleGeometry {
        /**
         * This function will return a boolean indicating if this
         * geometry is a line.
         *
         * @return <code>True</code> if this is a line.
         */
        isLine(): boolean;
        /**
         * This function will return a boolean indicating if this
         * geometry is a point.
         *
         * @return <code>True</code> if this is a point.
         */
        isPoint(): boolean;
        /**
         * This function will return a boolean indicating if this
         * geometry is a polygon.
         *
         * @return <code>True</code> if this is a polygon.
         */
        isPolygon(): boolean;
        /**
         * Get the vertices.
         */
        getVertices(): Array<{
            x: number;
            y: number;
        }>;
        /**
         * Set the vertices.
         *
         * @param An array of objects with x and y properties.
         */
        setVertices(o: Array<{
            x: number;
            y: number;
        }>): void;
    }
    var ISimpleGeometry: new (..._: any[]) => ISimpleGeometry;
}
declare module weavejs.api.data {
    /**
     * This is an interface for getting cached numerical statistics on columns.
     *
     * @author adufilie
     */
    interface IStatisticsCache {
        /**
         * This will retrieve a reusable IColumnStatistics object responsible for reporting statistics from an IAttributeColumn.
         * @param column A column to get statistics for.
         * @return An IColumnStatistics object for the specified column.
         */
        getColumnStatistics(column: IAttributeColumn): IColumnStatistics;
    }
    var IStatisticsCache: new (..._: any[]) => IStatisticsCache;
}
declare module weavejs.api.data {
    /**
     * Interface for a node for use with WeaveTreeDataDescriptor and WeaveTree.
     * Implementations should have [RemoteClass] metadata in front of the class definition
     * and should make it possible for drag+drop to make a fully-functional copy of a node by
     * copying all public properties, which should have simple types.
     * When implementing this interface as a wrapper for remote objects, make sure to avoid
     * making excess RPC calls wherever possible.
     * @author adufilie
     */
    interface IWeaveTreeNode {
        /**
         * Checks if this node is equivalent to another.
         * Note that the following should return true:  node.equals(ObjectUtil.copy(node))
         * @param other Another node to compare.
         * @return true if this node is equivalent to the other node.
         */
        equals(other: IWeaveTreeNode): boolean;
        /**
         * Gets a label for this node.
         * @return A label to display in the tree.
         */
        getLabel(): string;
        /**
         * Checks if this node is a branch.
         * @return true if this node is a branch
         */
        isBranch(): boolean;
        /**
         * Checks if this node has any children which are branches.
         * @return true if this node has any children which are branches
         */
        hasChildBranches(): boolean;
        /**
         * Gets children for this node.
         * @return A list of children implementing IWeaveTreeNode or null if this node has no children.
         */
        getChildren(): Array<IWeaveTreeNode>;
    }
    var IWeaveTreeNode: new (..._: any[]) => IWeaveTreeNode;
}
declare module weavejs.api.data {
    /**
     * Extends IWeaveTreeNode by adding addChildAt() and removeChild().
     * @author adufilie
     */
    interface IWeaveTreeNodeWithEditableChildren extends IWeaveTreeNode {
        /**
         * Adds a child node.
         * @param child The child to add.
         * @param index The new child index.
         * @return true if successful.
         */
        addChildAt(newChild: IWeaveTreeNode, index: number): boolean;
        /**
         * Removes a child node.
         * @param child The child to remove.
         * @return true if successful.
         */
        removeChild(child: IWeaveTreeNode): boolean;
    }
    var IWeaveTreeNodeWithEditableChildren: new (..._: any[]) => IWeaveTreeNodeWithEditableChildren;
}
declare module weavejs.api.data {
    /**
     * Extends IWeaveTreeNode by adding findPathToNode().
     * @author adufilie
     */
    interface IWeaveTreeNodeWithPathFinding extends IWeaveTreeNode {
        /**
         * Finds a series of IWeaveTreeNode objects which can be traversed as a path to a descendant node.
         * @param descendant The descendant IWeaveTreeNode.
         * @return An Array of IWeaveTreeNode objects which can be followed as a path from this node to the descendant, including this node and the descendant node.
         *         Returns null if the descendant is unreachable from this node.
         */
        findPathToNode(descendant: IWeaveTreeNode): Array<IWeaveTreeNode>;
    }
    var IWeaveTreeNodeWithPathFinding: new (..._: any[]) => IWeaveTreeNodeWithPathFinding;
}
declare module weavejs.api.net {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * This is an interface for an asynchronous service.
     * The invokeAsyncMethod() function invokes an asynchronous method and returns an AsyncToken which you can add IResponder objects to.
     * This is an ILinkableObject so its busy status can be checked and its URL requests will be cancelled when it is disposed.
     */
    interface IAsyncService extends ILinkableObject {
        /**
         * This function will invoke an asynchronous method using the given parameters object.
         * When the method finishes, the AsyncToken returned by this function will call its responders.
         * @param methodName A String to identify which remote procedure to call.
         * @param methodParameters Either an Array or an Object to use as a list of parameters.
         * @return An AsyncToken that you can add responders to.
         */
        invokeAsyncMethod(methodName: string, methodParameters?: Object): WeavePromise<any>;
    }
    var IAsyncService: new (..._: any[]) => IAsyncService;
}
declare module weavejs.api.net {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import URLRequest = weavejs.net.URLRequest;
    import WeavePromise = weavejs.util.WeavePromise;
    interface IURLRequestUtils {
        /**
         * Makes a URL request.
         * @param urlRequest A URLRequest object.
         * @return A WeavePromise
         */
        request(relevantContext: Object, urlRequest: URLRequest): WeavePromise<any>;
        /**
         * This will save a file in memory so that it can be accessed later via getURL().
         * @param name The file name.
         * @param byteArray The file content in a Uint8Array.
         * @return The URL at which the file can be accessed later via getURL(). This will be the string "local://" followed by the filename.
         */
        saveLocalFile(weaveRoot: ILinkableHashMap, name: string, byteArray: Uint8Array): string;
        /**
         * Retrieves file content previously saved via saveLocalFile().
         * @param The file name that was passed to saveLocalFile().
         * @return The file content in a Uint8Array.
         */
        getLocalFile(weaveRoot: ILinkableHashMap, name: string): Uint8Array;
        /**
         * Removes a local file that was previously added via saveLocalFile().
         * @param name The file name which was passed to saveLocalFile().
         */
        removeLocalFile(weaveRoot: ILinkableHashMap, name: string): void;
        /**
         * Gets a list of names of files saved via saveLocalFile().
         * @return An Array of file names.
         */
        getLocalFileNames(weaveRoot: ILinkableHashMap): any[];
    }
    var IURLRequestUtils: new (..._: any[]) => IURLRequestUtils;
}
declare module weavejs.api.net {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import Bounds2D = weavejs.geom.Bounds2D;
    /**
     * This is the interface for WMS services. We require each WMS service to provide
     * at least two public functions. Any callbacks added to this service will run when
     * a new image is downloaded.
     *
     * @author kmonico
     */
    interface IWMSService extends ILinkableObject {
        /**
         * This function will cancel all the pending requests.
         */
        cancelPendingRequests(): void;
        /**
         * This function will return the number of pending requests.
         *
         * @return The number of pending requests for this service.
         */
        getNumPendingRequests(): number;
        /**
         * This function will make the requests for new images.
         *
         * @param dataBounds The bounds of the data.
         * @param screenBounds The bounds of the screen. This is required to determine the appropriate zoom level.
         * @param preferLowerQuality A boolean indicating whether the service should request images which are one quality level lower.
         * @param layerLowerQuality If true, all lower quality tiles will be returned in order in addition to the correct quality level.
         * @return An array of downloaded images. The array is filled with lower quality images followed by
         * the requested quality. These images may overlap.
         */
        requestImages(dataBounds: Bounds2D, screenBounds: Bounds2D, preferLowerQuality?: boolean, layerLowerQuality?: boolean): any[];
        /**
         * Outputs the bounds which contains all valid tile requests. If a tile request is
         * not contained inside this bounds, the request is invalid.
         */
        getAllowedBounds(output: Bounds2D): void;
        /**
         * This function will return the SRS code of the tile requests.
         *
         * @return A string corresponding to a projection SRS code.
         * eg) EPSG:4326
         */
        getProjectionSRS(): string;
        /**
         * Get a string which contains copyright information for the
         * service.
         *
         * @return A string which contains the copyright information
         * for the provider.
         */
        getCreditInfo(): string;
        /**
         * Gets the width in pixels of an image tile.
         */
        getImageWidth(): number;
        /**
         * Gets the height in pixels of an image tile.
         */
        getImageHeight(): number;
    }
    var IWMSService: new (..._: any[]) => IWMSService;
}
declare module weavejs.api.net {
    import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * Interface for a service which provides RPC functions for retrieving and manipulating Weave Entity information.
     * @author adufilie
     */
    interface IWeaveEntityManagementService extends IWeaveEntityService {
        /**
         * Creates a new entity.
         * @param metadata Metadata for the new entity.
         * @param parentId The parent entity ID, or -1 for no parent.
         * @param insertAtIndex Specifies insertion index for sort order.
         * @return RPC token for an entity ID.
         */
        newEntity(metadata: EntityMetadata, parentId: number, insertAtIndex: number): WeavePromise<number>;
        /**
         * Updates the metadata for an existing entity.
         * @param entityId An entity ID.
         * @param diff Specifies the changes to make to the metadata.
         * @return RPC token.
         */
        updateEntity(entityId: number, diff: EntityMetadata): WeavePromise<void>;
        /**
         * Removes entities and their children recursively.
         * @param entityIds A list of entity IDs to remove.
         * @return RPC token for an Array of entity IDs that were removed.
         */
        removeEntities(entityIds: any[]): WeavePromise<number[]>;
        /**
         * Adds a parent-child relationship to the server-side entity hierarchy table.
         * @param parentId The ID of the parent entity.
         * @param childId The ID of the child entity.
         * @param insertAtIndex Specifies insertion index for sort order.
         * @return RPC token for an Array of entity IDs whose relationships have changed as a result of adding the parent-child relationship.
         */
        addChild(parentId: number, childId: number, insertAtIndex: number): WeavePromise<number[]>;
        /**
         * Removes a parent-child relationship from the server-side entity hierarchy table.
         * @param parentId The ID of the parent entity.
         * @param childId The ID of the child entity.
         * @return RPC token.
         */
        removeChild(parentId: number, childId: number): WeavePromise<void>;
    }
    var IWeaveEntityManagementService: new (..._: any[]) => IWeaveEntityManagementService;
}
declare module weavejs.api.net {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * Interface for a service which provides RPC functions for retrieving Weave Entity information.
     * @author adufilie
     */
    interface IWeaveEntityService extends ILinkableObject {
        /**
         * This will be true when the service is initialized and ready to accept RPC requests.
         */
        entityServiceInitialized: boolean;
        /**
         * Gets EntityHierarchyInfo objects containing basic information on entities matching public metadata.
         * @param publicMetadata Public metadata search criteria.
         * @return RPC token for an Array of EntityHierarchyInfo objects.
         */
        getHierarchyInfo(publicMetadata: Object): WeavePromise<weavejs.api.net.beans.EntityHierarchyInfo[]>;
        /**
         * Gets an Array of Entity objects.
         * @param ids A list of entity IDs.
         * @return RPC token for an Array of Entity objects.
         */
        getEntities(ids: any[]): WeavePromise<weavejs.api.net.beans.Entity[]>;
        /**
         * Gets an Array of entity IDs with matching metadata.
         * @param publicMetadata Public metadata to search for.
         * @param wildcardFields A list of field names in publicMetadata that should be treated
         *                       as search strings with wildcards '?' and '*' for single-character
         *                       and multi-character matching, respectively.
         * @return RPC token for an Array of IDs.
         */
        findEntityIds(publicMetadata: Object, wildcardFields: any[]): WeavePromise<number[]>;
        /**
         * Finds matching values for a public metadata field.
         * @param feildName The name of the public metadata field to search.
         * @param valueSearch A search string.
         * @return RPC token for an Array of matching values for the specified public metadata field.
         */
        findPublicFieldValues(fieldName: string, valueSearch: string): WeavePromise<string[]>;
    }
    var IWeaveEntityService: new (..._: any[]) => IWeaveEntityService;
}
declare module weavejs.api.net {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * This is an interface for requesting tiles for a streamed geometry collection.
     *
     * @author adufilie
     */
    interface IWeaveGeometryTileService extends ILinkableObject {
        /**
         * @return A WeavePromise which returns a JSByteArray
         */
        getMetadataTiles(tileIDs: any[]): WeavePromise<weavejs.util.JSByteArray>;
        /**
         * @return A WeavePromise which returns a JSByteArray
         */
        getGeometryTiles(tileIDs: any[]): WeavePromise<weavejs.util.JSByteArray>;
    }
    var IWeaveGeometryTileService: new (..._: any[]) => IWeaveGeometryTileService;
}
declare module weavejs.api.net.beans {
    /**
     * @author adufilie
     */
    class Entity extends EntityMetadata {
        constructor(info?: EntityHierarchyInfo);
        id: number;
        parentIds: any[];
        childIds: any[];
        hasChildBranches: boolean;
        /**
         * Resets this object so it does not contain any information.
         */
        reset(): void;
        /**
         * Tests if this object has been initialized.
         */
        initialized: boolean;
        getEntityType(): string;
        hasParent(parentId: number): boolean;
        hasChild(childId: number): boolean;
    }
}
declare module weavejs.api.net.beans {
    class EntityHierarchyInfo {
        id: number;
        entityType: string;
        title: string;
        numChildren: number;
    }
}
declare module weavejs.api.net.beans {
    class EntityMetadata {
        static getSuggestedPublicPropertyNames(): any[];
        static getSuggestedPrivatePropertyNames(): any[];
        privateMetadata: Object;
        publicMetadata: Object;
        toString(): string;
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
declare module weavejs.api.ui {
    /**
     * An Object with a description.
     */
    interface IObjectWithDescription {
        /**
         * Gets a human-readable description for this object.
         * @return The human-readable description.
         */
        getDescription(): string;
    }
    var IObjectWithDescription: new (..._: any[]) => IObjectWithDescription;
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
         * interface Class -&gt; implementation Class
         */
        map_interface_singletonImplementation: Object;
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
        registerSingletonImplementation(theInterface: new (..._: any[]) => any, theImplementation: new (..._: any[]) => any): boolean;
        getSingletonImplementation(theInterface: new (..._: any[]) => any): new (..._: any[]) => any;
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
        static partitionClassList(classes: Array<new (..._: any[]) => any>, ...interfaces: Array<new () => any>): Array<typeof classes>;
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
    /**
     * This is a LinkableVariable which limits its session state to Boolean values.
     * @author adufilie
     * @see weave.core.LinkableVariable
     */
    class LinkableBoolean extends LinkableVariable {
        constructor(defaultValue?: any, verifier?: Function, defaultValueTriggersCallbacks?: boolean);
        value: boolean;
        getSessionState(): Object;
        setSessionState(value: Object): void;
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
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    /**
     * A promise for file content, given a URL.
     */
    class LinkableFile implements ILinkableVariable {
        isLocal: boolean;
        constructor(defaultValue?: string, taskDescription?: any, responseType?: string);
        result: Object;
        error: Object;
        setSessionState(value: Object): void;
        getSessionState(): Object;
        value: string;
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
        toObject<T>(filter?: new (..._: any[]) => T | string, filterIncludesPlaceholders?: boolean): {
            [name: string]: T & ILinkableObject;
        };
        toMap<T>(filter?: new (..._: any[]) => T | string, filterIncludesPlaceholders?: boolean): Map<String, T & ILinkableObject>;
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
        constructor(classDef?: new (..._: any[]) => T);
        getClass(): new (..._: any[]) => T;
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
        static getClass(object: ILinkableObject | LinkablePlaceholder<ILinkableObject>): new (..._: any[]) => ILinkableObject;
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
        setSessionState(value: Object): void;
    }
}
declare module weavejs.core {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    class LinkableSynchronizer implements ILinkableObject {
        static VAR_STATE: string;
        static VAR_PRIMARY: string;
        static VAR_SECONDARY: string;
        constructor();
        primaryPath: LinkableVariable;
        secondaryPath: LinkableVariable;
        primaryTransform: LinkableFunction;
        secondaryTransform: LinkableFunction;
    }
}
declare module weavejs.core {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    /**
     * LinkableVariable allows callbacks to be added that will be called when the value changes.
     * A LinkableVariable has an optional type restriction on the values it holds.
     *
     * @author adufilie
     */
    class LinkableVariable extends CallbackCollection implements ILinkableVariable, ICallbackCollection, IDisposableObject {
        /**
         * This function is used to prevent the session state from having unwanted values.
         * Function signature should be  function(value:*):Boolean
         */
        protected _verifier: Function;
        /**
         * This is true if the session state has been set at least once.
         */
        protected _sessionStateWasSet: boolean;
        /**
         * This is true if the _sessionStateType is a primitive type.
         */
        protected _primitiveType: boolean;
        /**
         * Type restriction passed in to the constructor.
         */
        protected _sessionStateType: new (..._: any[]) => any;
        /**
         * Cannot be modified externally because it is not returned by getSessionState()
         */
        protected _sessionStateInternal: any;
        /**
         * Available externally via getSessionState()
         */
        protected _sessionStateExternal: any;
        /**
         * This is set to true when lock() is called.
         */
        protected _locked: boolean;
        /**
         * If true, session states will be altered to bypass the diff calculation on DynamicState Arrays.
         */
        protected _bypassDiff: boolean;
        /**
         * If a defaultValue is specified, callbacks will be triggered in a later frame unless they have already been triggered before then.
         * This behavior is desirable because it allows the initial value to be handled by the same callbacks that handles new values.
         * @param sessionStateType The type of values accepted for this sessioned property.
         * @param verifier A function that returns true or false to verify that a value is accepted as a session state or not.  The function signature should be  function(value:*):Boolean.
         * @param defaultValue The default value for the session state.
         * @param defaultValueTriggersCallbacks Set this to false if you do not want the callbacks to be triggered one frame later after setting the default value.
         */
        constructor(sessionStateType?: new (..._: any[]) => any, verifier?: Function, defaultValue?: any, defaultValueTriggersCallbacks?: boolean);
        /**
         * @private
         */
        /**
         * This function will verify if a given value is a valid session state for this linkable variable.
         * @param value The value to verify.
         * @return A value of true if the value is accepted by this linkable variable.
         */
        /**
         * The type restriction passed in to the constructor.
         */
        getSessionStateType(): new (..._: any[]) => any;
        getSessionState(): Object;
        setSessionState(value: Object): void;
        /**
         * This function is used in setSessionState() to determine if the value has changed or not.
         * Classes that extend this class may override this function.
         */
        protected sessionStateEquals(otherSessionState: any): boolean;
        /**
         * This function may be called to detect change to a non-primitive session state in case it has been modified externally.
         */
        detectChanges(): void;
        /**
         * Call this function when you do not want to allow any more changes to the value of this sessioned property.
         */
        lock(): void;
        /**
         * This is set to true when lock() is called.
         * Subsequent calls to setSessionState() will have no effect.
         */
        locked: boolean;
        state: Object;
        dispose(): void;
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
    import ILocale = weavejs.api.core.ILocale;
    import WeavePromise = weavejs.util.WeavePromise;
    class Locale implements ILocale {
        reverseLayout: boolean;
        loadFromUrl(jsonUrl: string): WeavePromise<void>;
        data: Object;
        getText(text: string): string;
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
declare module weavejs.data {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ICSVParser = weavejs.api.data.ICSVParser;
    /**
     * This is an all-static class containing functions to parse and generate valid CSV files.
     * Ported from AutoIt Script to Flex. Original author: adufilie
     *
     * @author skolman
     * @author adufilie
     */
    class CSVParser implements ICSVParser, ILinkableObject {
        /**
         * @param delimiter
         * @param quote
         * @param asyncMode If this is set to true, parseCSV() will work asynchronously and trigger callbacks when it finishes.
         *                  Note that if asyncMode is enabled, you can only parse one CSV string at a time.
         */
        constructor(asyncMode?: boolean, delimiter?: string, quote?: string);
        /**
         * @return  The resulting two-dimensional Array from the last call to parseCSV().
         */
        parseResult: any[];
        parseCSV(csvData: string): any[];
        createCSV(rows: any[]): string;
        parseCSVRow(csvData: string): any[];
        createCSVRow(row: any[]): string;
        parseCSVToken(token: string): string;
        createCSVToken(str: string): string;
        convertRowsToRecords(rows: any[], headerDepth?: number): any[];
        getRecordFieldNames(records: any[], includeNullFields?: boolean, headerDepth?: number): any[];
        convertRecordsToRows(records: any[], columnOrder?: any[], allowBlankColumns?: boolean, headerDepth?: number): any[];
    }
}
declare module weavejs.data {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnStatistics = weavejs.api.data.IColumnStatistics;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    class ColumnStatistics implements IColumnStatistics {
        constructor(column?: IAttributeColumn);
        getNorm(key: IQualifiedKey): number;
        getMin(): number;
        getMax(): number;
        getCount(): number;
        getSum(): number;
        getSquareSum(): number;
        getMean(): number;
        getVariance(): number;
        getStandardDeviation(): number;
        getMedian(): number;
        getSortIndex(): Object;
        hack_getNumericData(): Object;
        /**
         * Gets a Dictionary that maps a IQualifiedKey to a running total numeric value, based on the order of the keys in the column.
         */
        getRunningTotals(): Object;
        prevTriggerCounter: number;
    }
}
declare module weavejs.data {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IKeyFilter = weavejs.api.data.IKeyFilter;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import Bounds2D = weavejs.geom.Bounds2D;
    /**
     * This class contains static functions that access values from IAttributeColumn objects.
     *
     * @author adufilie
     */
    class ColumnUtils {
        static debugKeyTypes: boolean;
        /**
         * This is a shortcut for column.getMetadata(ColumnMetadata.TITLE).
         * @param column A column to get the title of.
         * @return The title of the column.
         */
        static getTitle(column: IAttributeColumn): string;
        /**
         * Generates a label to use when displaying the column in a list.
         * @param column
         * @return The column title followed by its dataType and/or keyType metadata.
         */
        static getColumnListLabel(column: IAttributeColumn): string;
        /**
         * Temporary solution
         * @param column
         * @return
         */
        static getDataSources(column: IAttributeColumn): any[];
        /**
         * This function gets the keyType of a column, either from the metadata or from the actual keys.
         * @param column A column to get the keyType of.
         * @return The keyType of the column.
         */
        static getKeyType(column: IAttributeColumn): string;
        /**
         * This function gets the dataType of a column from its metadata.
         * @param column A column to get the dataType of.
         * @return The dataType of the column.
         */
        static getDataType(column: IAttributeColumn): string;
        /**
         * This function will use an attribute column to convert a number to a string.
         * @param column A column that may have a way to convert numeric values to string values.
         * @param number A Number to convert to a String.
         * @return A String representation of the number, or null if no specific string representation exists.
         */
        static deriveStringFromNumber(column: IAttributeColumn, number: number): string;
        static hack_findNonWrapperColumn(column: IAttributeColumn): IAttributeColumn;
        static hack_findInternalDynamicColumn(columnWrapper: IColumnWrapper): DynamicColumn;
        static hack_findHierarchyNode(column: IAttributeColumn, createFakeNodeIfNotFound?: boolean): IWeaveTreeNode & IColumnReference;
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
        static getQKeysInNumericRange(column: IAttributeColumn, min: number, max: number, inclusiveRange?: boolean): any[];
        static getQKeys(genericObjects: any[]): any[];
        /**
         * Get the QKey corresponding to <code>object.keyType</code>
         * and <code>object.localName</code>.
         *
         * @param object An object with properties <code>keyType</code>
         * and <code>localName</code>.
         * @return An IQualifiedKey object.
         */
        /**
         * @param column A column to get a value from.
         * @param key A key in the given column to get the value for.
         * @return The Number corresponding to the given key.
         */
        static getNumber(column: IAttributeColumn, key: Object): number;
        /**
         * @param column A column to get a value from.
         * @param key A key in the given column to get the value for.
         * @return The String corresponding to the given key.
         */
        static getString(column: IAttributeColumn, key: Object): string;
        /**
         * @param column A column to get a value from.
         * @param key A key in the given column to get the value for.
         * @return The Boolean corresponding to the given key.
         */
        static getBoolean(column: IAttributeColumn, key: Object): boolean;
        /**
         * @param column A column to get a value from.
         * @param key A key in the given column to get the value for.
         * @return The Number corresponding to the given key, normalized to be between 0 and 1.
         */
        static getNorm(column: IAttributeColumn, key: Object): number;
        /**
         * @param geometryColumn A GeometryColumn which contains the geometry objects for the key.
         * @param key An object with <code>keyType</code> and <code>localName</code> properties.
         * @return An array of arrays of arrays of Points.
         * For example,
         * <code>result[0]</code> is type <code>Array of Array of Point</code>. <br>
         * <code>result[0][0]</code> is type <code>Array of Point</code> <br>
         * <code>result[0][0][0]</code> is a <code>Point</code>
         */
        static getGeometry(geometryColumn: IAttributeColumn, key: Object): any[];
        /**
         * @param geometryColumn A column with metadata dataType="geometry"
         * @param keys An Array of IQualifiedKeys
         * @param minImportance No points with importance less than this value will be returned.
         * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
         * @return An Array of GeoJson Geometry objects corresponding to the keys.  The Array may be sparse if there are no coordinates for some of the keys.
         */
        static getGeoJsonGeometries(geometryColumn: IAttributeColumn, keys: any[], minImportance?: number, visibleBounds?: Bounds2D): any[];
        static test_getAllValues(column: IAttributeColumn, dataType: new (..._: any[]) => any): any[];
        /**
         * This function takes the common keys from a list of columns and generates a table of data values for each key from each specified column.
         * @param columns A list of IAttributeColumns to compute a join table from.
         * @param dataType The dataType parameter to pass to IAttributeColumn.getValueFromKey().
         * @param allowMissingData If this is set to true, then all keys will be included in the join result.  Otherwise, only the keys that have associated values will be included.
         * @param keyFilter Either an IKeyFilter or an Array of IQualifiedKey objects used to filter the results.
         * @return An Array of Arrays, the first being IQualifiedKeys and the rest being Arrays data values from the given columns that correspond to the IQualifiedKeys.
         */
        static joinColumns(columns: any[], dataType?: Object, allowMissingData?: boolean, keyFilter?: Object): any[];
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
        static getRecords(format: Object, keys?: any[], dataType?: Object): any[];
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
        static getRecord(format: Object, key: IQualifiedKey, dataType: Object): Object;
        /**
         * @param attrCols An array of IAttributeColumns or ILinkableHashMaps containing IAttributeColumns.
         * @return An Array of non-wrapper columns with duplicates removed.
         */
        static getNonWrapperColumnsFromSelectableAttributes(attrCols: any[]): any[];
        /**
         * This function takes an array of attribute columns, a set of keys, and the type of the columns
         * @param attrCols An array of IAttributeColumns or ILinkableHashMaps containing IAttributeColumns.
         * @param subset An IKeyFilter or IKeySet specifying which keys to include in the CSV output, or null to indicate all keys available in the Attributes.
         * @param dataType
         * @return A string containing a CSV-formatted table containing the attributes of the requested keys.
         */
        static generateTableCSV(attrCols: any[], subset?: IKeyFilter, dataType?: new (..._: any[]) => any): string;
        /**
         * This function will compute the union of a list of IKeySets.
         * @param inputKeySets An Array of IKeySets (can be IAttributeColumns).
         * @return The list of unique keys contained in all the inputKeySets.
         */
        static getAllKeys(inputKeySets: any[]): any[];
        /**
         * This function will make sure the first IAttributeColumn in a linkable hash map is a DynamicColumn.
         */
        static forceFirstColumnDynamic(columnHashMap: ILinkableHashMap): void;
        /**
         * Retrieves a metadata value from a list of columns if they all share the same value.
         * @param columns The columns.
         * @param propertyName The metadata property name.
         * @return The metadata value if it is the same across all columns, or null if not.
         */
        static getCommonMetadata(columns: any[], propertyName: string): string;
        static getAllCommonMetadata(columns: any[]): Object;
        static sortMetadataPropertyNames(names: any[]): void;
        static map_root_firstDataSet: WeakMap<ILinkableHashMap, Array<IWeaveTreeNode & IColumnReference>>;
        /**
         * Finds a set of columns from available data sources, preferring ones that are already in use.
         */
        static findFirstDataSet(root: ILinkableHashMap): Array<IWeaveTreeNode & IColumnReference>;
        /**
         * This will initialize selectable attributes using a list of columns and/or column references.
         * @param selectableAttributes An Array of IColumnWrapper and/or ILinkableHashMaps to initialize.
         * @param input An Array of IAttributeColumn and/or IColumnReference objects. If not specified, getColumnsWithCommonKeyType() will be used.
         * @see #getColumnsWithCommonKeyType()
         */
        static initSelectableAttributes(selectableAttributes: Array<IColumnWrapper | ILinkableHashMap>, input?: Array<IAttributeColumn | IColumnReference>): void;
        /**
         * Gets a list of columns with a common keyType.
         */
        static getColumnsWithCommonKeyType(root: ILinkableHashMap, keyType?: string): any[];
        static replaceColumnsInHashMap(destination: ILinkableHashMap, columnReferences: Array<IWeaveTreeNode | IColumnReference>): void;
        /**
         * This will initialize one selectable attribute using a column or column reference.
         * @param selectableAttribute A selectable attribute (IColumnWrapper/ILinkableHashMap/ReferencedColumn)
         * @param column_or_columnReference Either an IAttributeColumn or an IColumnReference
         * @param clearHashMap If the selectableAttribute is an ILinkableHashMap, all objects will be removed from it prior to adding a column.
         */
        static initSelectableAttribute(selectableAttribute: IColumnWrapper | ILinkableHashMap, column_or_columnReference: IAttributeColumn | IColumnReference, clearHashMap?: boolean): void;
        static unlinkNestedColumns(columnWrapper: IColumnWrapper): void;
    }
}
declare module weavejs.data {
    import IDataSource = weavejs.api.data.IDataSource;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    class DataSourceUtils {
        static guessDataType(data: any[]): string;
        /**
         * Determine whether a datasource that uses columns from other datasources that are remote.
         * @param  dataSource The datasource to test.
         * @return            True if a remote column is used by the datasource; false otherwise.
         */
        static hasRemoteColumnDependencies(dataSource: IDataSource): boolean;
        /**
         * Fills a ProxyColumn with an appropriate internal column containing the given keys and data.
         * @param proxyColumn A column, pre-filled with metadata
         * @param keys An Array of either IQualifiedKeys or Strings
         * @param data An Array of data values corresponding to the keys.
         */
        static initColumn(proxyColumn: ProxyColumn, keys: any[], data: any[]): void;
    }
}
declare module weavejs.data {
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IKeySet = weavejs.api.data.IKeySet;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    /**
     * This class contains static functions that access values from IAttributeColumn objects.
     * Many of the functions in this library use the static variable 'currentRecordKey'.
     * This value should be set before calling a function that uses it.
     *
     * @author adufilie
     */
    class EquationColumnLib {
        static debug: boolean;
        /**
         * This value should be set before calling any of the functions below that get values from IAttributeColumns.
         */
        static currentRecordKey: IQualifiedKey;
        /**
         * This function calls column.getValueFromKey(currentRecordKey, IQualifiedKey)
         * @param column A column, or null if you want the currentRecordKey to be returned.
         * @return The value at the current record in the column cast as an IQualifiedKey.
         */
        static getKey(column?: IAttributeColumn): IQualifiedKey;
        /**
         * This function uses currentRecordKey when retrieving a value from a column.
         * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
         * @param dataType Either a Class object or a String containing the qualified class name of the desired value type.
         * @return The value of the object, optionally cast to the requested dataType.
         */
        static getValue(object: IAttributeColumn | ILinkableVariable, dataType?: any): any;
        /**
         * This function calls IAttributeColumn.getValueFromKey(key, dataType).
         * @param column An IAttributeColumn to get a value from.
         * @param key A key to get the value for.
         * @return The result of calling column.getValueFromKey(key, dataType).
         */
        static getValueFromKey(column: IAttributeColumn, key: IQualifiedKey, dataType?: any): any;
        /**
         * This function gets a value from a data column, using a filter column and a key column to filter the data
         * @param keyColumn An IAttributeColumn to get keys from
         * @param filter column to use to filter data (ex: year)
         * @param data An IAttributeColumn to get a value from
         * @param filterValue value in filtercolumn to use to filter data
         * @param filterDataType Class object of the desired filter value type
         * @param dataType Class object of the desired value type. If IQualifiedKey, this acts as a reverse lookup for the filter column, returning the key given a filterValue String.
         * @return the correct filtered value from the data column
         * @author kmanohar
         */
        static getValueFromFilterColumn(keyColumn: DynamicColumn, filter: IAttributeColumn, data: IAttributeColumn, filterValue: string, dataType?: any): Object;
        /**
         * This function returns a list of IQualifiedKey objects using a reverse lookup of value-key pairs
         * @param column An attribute column
         * @param keyValue The value to look up
         * @param ignoreKeyType If true, ignores the dataType of the column (the column's foreign keyType) and the keyType of the keyValue
         * @return An array of record keys with the given value under the given column
         */
        static getAssociatedKeys(column: IAttributeColumn, keyValue: IQualifiedKey, ignoreKeyType?: boolean): Array<IQualifiedKey>;
        /**
         * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
         * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
         * @param key A key to get the Number for.
         * @return The value of the object, cast to a Number.
         */
        static getNumber(object: IAttributeColumn | ILinkableVariable, key?: IQualifiedKey): number;
        /**
         * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
         * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
         * @param key A key to get the Number for.
         * @return The value of the object, cast to a String.
         */
        static getString(object: IAttributeColumn | ILinkableVariable, key?: IQualifiedKey): string;
        /**
         * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
         * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
         * @param key A key to get the Number for.
         * @return The value of the object, cast to a Boolean.
         */
        static getBoolean(object: IAttributeColumn | ILinkableVariable, key?: IQualifiedKey): boolean;
        /**
         * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
         * @param column A column to get a value from.
         * @param key A key to get the Number for.
         * @return The Number corresponding to the given key, normalized to be between 0 and 1.
         */
        static getNorm(column: IAttributeColumn, key?: IQualifiedKey): number;
        /**
         * This will check a list of IKeySets for an IQualifiedKey.
         * @param keySets A list of IKeySets (can be IAttributeColumns).
         * @param key A key to search for.
         * @return The first IKeySet that contains the key.
         */
        static findKeySet(keySets: Array<IKeySet>, key?: IQualifiedKey): IKeySet;
        static getSum(column: IAttributeColumn): number;
        static getMean(column: IAttributeColumn): number;
        static getVariance(column: IAttributeColumn): number;
        static getStandardDeviation(column: IAttributeColumn): number;
        static getMin(column: IAttributeColumn): number;
        static getMax(column: IAttributeColumn): number;
        static getCount(column: IAttributeColumn): number;
        static getRunningTotal(column: IAttributeColumn, key?: IQualifiedKey): number;
        /**
         * @param value A value to cast.
         * @param newType Either a qualifiedClassName or a Class object referring to the type to cast the value as.
         */
        static cast<T>(value: any, newType: (new (..._: any[]) => T) | string): T;
        /**
         * This is a macro for IQualifiedKey that can be used in equations.
         */
        static QKey: typeof IQualifiedKey;
    }
}
declare module weavejs.data {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnStatistics = weavejs.api.data.IColumnStatistics;
    import IStatisticsCache = weavejs.api.data.IStatisticsCache;
    /**
     * This is an all-static class containing numerical statistics on columns and functions to access the statistics.
     *
     * @author adufilie
     */
    class StatisticsCache implements IStatisticsCache {
        /**
         * @param column A column to get statistics for.
         * @return A Map that maps a IQualifiedKey to a running total numeric value, based on the order of the keys in the column.
         */
        getRunningTotals(column: IAttributeColumn): Object;
        getColumnStatistics(column: IAttributeColumn): IColumnStatistics;
    }
}
declare module weavejs.data.bin {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IBinningDefinition = weavejs.api.data.IBinningDefinition;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableString = weavejs.core.LinkableString;
    /**
     * Extend this class and implement <code>generateBinClassifiersForColumn()</code>, which should store its results in the
     * protected <code>output</code> variable and trigger <code>asyncResultCallbacks</code> when the task completes.
     *
     * @author adufilie
     */
    class AbstractBinningDefinition implements IBinningDefinition {
        constructor(allowOverrideBinNames?: boolean, allowOverrideInputRange?: boolean);
        /**
         * Implementations that extend this class should use this as an output buffer.
         */
        protected output: ILinkableHashMap;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        asyncResultCallbacks: ICallbackCollection;
        getBinNames(): any[];
        getBinClassifiers(): any[];
        overrideBinNames: LinkableString;
        overrideInputMin: LinkableNumber;
        overrideInputMax: LinkableNumber;
        protected getOverrideNames(): any[];
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * Creates a separate bin for every string value in a column.
     *
     * @author adufilie
     */
    class CategoryBinningDefinition extends AbstractBinningDefinition {
        constructor();
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableString = weavejs.core.LinkableString;
    /**
     * Divides a data range into a number of bins based on range entered by user.
     *
     * @author adufilie
     * @author abaumann
     * @author skolman
     */
    class CustomSplitBinningDefinition extends AbstractBinningDefinition {
        constructor();
        /**
         * A list of numeric values separated by commas that mark the beginning and end of bin ranges.
         */
        splitValues: LinkableString;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        binRange: string;
        dataMin: string;
        dataMax: string;
    }
}
declare module weavejs.data.bin {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IBinningDefinition = weavejs.api.data.IBinningDefinition;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    /**
     * This provides a wrapper for a dynamically created IBinningDefinition.
     * When <code>generateBinClassifiersForColumn(column)</code> is called, the column
     * will be monitored for changes and results will be computed automatically.
     */
    class DynamicBinningDefinition extends LinkableDynamicObject implements IBinningDefinition {
        /**
         * @param lockFirstColumn If set to true, the first column passed to <code>generateBinClassifiersForColumn()</code> will be the only column accepted.
         */
        constructor(lockFirstColumn?: boolean);
        /**
         * @param json Any one of the following formats:
         *     [1,2,3]<br>
         *     [[0,5],[5,10]]<br>
         *     [{"min": 0, "max": 33, "label": "low"}, {"min": 34, "max": 66, "label": "midrange"}, {"min": 67, "max": 100, "label": "high"}]
         * @return true on success
         */
        static getBinsFromJson(json: string, output: ILinkableHashMap, toStringColumn?: IAttributeColumn): boolean;
        asyncResultCallbacks: ICallbackCollection;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        getBinClassifiers(): any[];
        getBinNames(): any[];
        binsOverridden: boolean;
        protected overrideBinsOutput: ILinkableHashMap;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * EqualIntervalBinningDefinition
     *
     * @author adufilie
     * @author abaumann
     * @author sanbalagan
     */
    class EqualIntervalBinningDefinition extends AbstractBinningDefinition {
        constructor();
        dataInterval: LinkableNumber;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
    }
}
declare module weavejs.data.bin {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IBinningDefinition = weavejs.api.data.IBinningDefinition;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    /**
     * Defines bins explicitly and is not affected by what column is passed to generateBinClassifiersForColumn().
     *
     * @author adufilie
     */
    class ExplicitBinningDefinition extends LinkableHashMap implements IBinningDefinition {
        constructor();
        asyncResultCallbacks: ICallbackCollection;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        getBinClassifiers(): any[];
        getBinNames(): any[];
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * Implemented from https://gist.github.com/tmcw/4977508
     * Also, read : http://macwright.org/2013/02/18/literate-jenks.html
     * Other implementations from Doug Curl (javascript) and Daniel J Lewis (python implementation) and  Simon Georget (Geostats)
     * http://www.arcgis.com/home/item.html?id=0b633ff2f40d412995b8be377211c47b
     * http://danieljlewis.org/2010/06/07/jenks-natural-breaks-algorithm-in-python/
     * https://github.com/simogeo/geostats/blob/master/lib/geostats.js
     * http://danieljlewis.org/files/2010/06/Jenks.pdf
     */
    class NaturalJenksBinningDefinition extends AbstractBinningDefinition {
        constructor();
        numOfBins: LinkableNumber;
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
        protected fixMinMaxInclusive(): void;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IBinClassifier = weavejs.api.data.IBinClassifier;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * A classifier that uses min,max values for containment tests.
     *
     * @author adufilie
     */
    class NumberClassifier implements IBinClassifier {
        constructor(min?: any, max?: any, minInclusive?: boolean, maxInclusive?: boolean);
        /**
         * These values define the bounds of the continuous range contained in this classifier.
         */
        min: LinkableNumber;
        max: LinkableNumber;
        /**
         * This value is the result of contains(value) when value == min.
         */
        minInclusive: LinkableBoolean;
        /**
         * This value is the result of contains(value) when value == max.
         */
        maxInclusive: LinkableBoolean;
        /**
         * contains
         * @param value A value to test.
         * @return true If this IBinClassifier contains the given value.
         */
        contains(value: any): boolean;
        /**
         * @param toStringColumn The primitive column to use that provides a number-to-string conversion function.
         * @return A generated label for this NumberClassifier.
         */
        generateBinLabel(toStringColumn?: IAttributeColumn): string;
        toString(): string;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * QuantileBinningDefinition
     *
     * @author adufilie
     * @author abaumann
     * @author sanbalagan
     */
    class QuantileBinningDefinition extends AbstractBinningDefinition {
        constructor();
        refQuantile: LinkableNumber;
        /**
         * getBinClassifiersForColumn - implements IBinningDefinition Interface
         * @param column
         * @param output
         */
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * Divides a data range into a number of equally spaced bins.
     *
     * @author adufilie
     * @author abaumann
     */
    class SimpleBinningDefinition extends AbstractBinningDefinition {
        constructor();
        /**
         * The number of bins to generate when calling deriveExplicitBinningDefinition().
         */
        numberOfBins: LinkableNumber;
        /**
         * From this simple definition, derive an explicit definition.
         */
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
    }
}
declare module weavejs.data.bin {
    import IBinClassifier = weavejs.api.data.IBinClassifier;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * This classifies a single value.
     *
     * @author adufilie
     */
    class SingleValueClassifier extends LinkableVariable implements IBinClassifier {
        /**
         * @param value A value to test.
         * @return true If this IBinClassifier contains the given value.
         */
        contains(value: any): boolean;
    }
}
declare module weavejs.data.bin {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * StandardDeviationBinningDefinition
     *
     * @author adufilie
     */
    class StandardDeviationBinningDefinition extends AbstractBinningDefinition {
        constructor();
        generateBinClassifiersForColumn(column: IAttributeColumn): void;
    }
}
declare module weavejs.data.bin {
    import IBinClassifier = weavejs.api.data.IBinClassifier;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * A classifier that accepts a list of String values.
     *
     * @author adufilie
     */
    class StringClassifier extends LinkableVariable implements IBinClassifier {
        constructor();
        setSessionState(value: Object): void;
        /**
         * @param value A value to test.
         * @return true If this IBinClassifier contains the given value.
         */
        contains(value: any): boolean;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import CallbackCollection = weavejs.core.CallbackCollection;
    import Dictionary2D = weavejs.util.Dictionary2D;
    /**
     * This object contains a mapping from keys to data values.
     *
     * @author adufilie
     */
    class AbstractAttributeColumn extends CallbackCollection implements IAttributeColumn {
        constructor(metadata?: Object);
        protected _metadata: Object;
        /**
         * This function should only be called once, before setting the record data.
         * @param metadata Metadata for this column.
         */
        setMetadata(metadata: Object): void;
        /**
         * Copies key/value pairs from an Object.
         * Converts Array values to Strings using WeaveAPI.CSVParser.createCSVRow().
         */
        protected static copyValues(object: Object): Object;
        getMetadata(propertyName: string): string;
        getMetadataPropertyNames(): any[];
        /**
         * Used by default getValueFromKey() implementation. Must be explicitly initialized.
         */
        protected dataTask: ColumnDataTask;
        /**
         * Used by default getValueFromKey() implementation. Must be explicitly initialized.
         */
        protected dataCache: Dictionary2D<new (..._: any[]) => any, IQualifiedKey, any>;
        keys: any[];
        containsKey(key: IQualifiedKey): boolean;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        /**
         * Used by default getValueFromKey() implementation to cache values.
         */
        protected generateValue(key: IQualifiedKey, dataType: new (..._: any[]) => any): Object;
    }
}
declare module weavejs.data.column {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * AlwaysDefinedColumn
     *
     * @author adufilie
     */
    class AlwaysDefinedColumn extends ExtendedDynamicColumn {
        constructor(defaultValue?: any, defaultValueVerifier?: Function);
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        defaultValue: LinkableVariable;
        /**
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import DynamicBinningDefinition = weavejs.data.bin.DynamicBinningDefinition;
    /**
     * A binned column maps a record key to a bin key.
     *
     * @author adufilie
     */
    class BinnedColumn extends ExtendedDynamicColumn implements IPrimitiveColumn {
        constructor();
        /**
         * This number overrides the min,max metadata values.
         * @param propertyName The name of a metadata property.
         * @return The value of the specified metadata property.
         */
        getMetadata(propertyName: string): string;
        /**
         * This defines how to generate the bins for this BinnedColumn.
         * This is used to generate the derivedBins.
         */
        binningDefinition: DynamicBinningDefinition;
        /**
         * This is the number of bins that have been generated by
         * the binning definition using with the internal column.
         */
        numberOfBins: number;
        /**
         * This is the largest number of records in any of the bins.
         */
        largestBinSize: number;
        /**
         * This function gets a list of keys in a bin.
         * @param binIndex The index of the bin to get the keys from.
         * @return An Array of keys in the specified bin.
         */
        getKeysFromBinIndex(binIndex: number): Array<IQualifiedKey>;
        /**
         * This function gets a list of keys in a bin.
         * @param binIndex The name of the bin to get the keys from.
         * @return An Array of keys in the specified bin.
         */
        getKeysFromBinName(binName: string): Array<IQualifiedKey>;
        getBinIndexFromDataValue(value: any): number;
        /**
         * This function returns different results depending on the dataType.
         * Supported types:
         *     default -> IBinClassifier that matches the given record key
         *     Number -> bin index for the given record key
         *     String -> bin name for the given record key
         *     Array -> list of keys in the same bin as the given record key
         * @param key A record identifier.
         * @param dataType The requested return type.
         * @return If the specified dataType is supported, a value of that type.  Otherwise, the default return value for the given record key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        /**
         * From a bin index, this function returns the name of the bin.
         * @param value A bin index
         * @return The name of the bin
         */
        deriveStringFromNumber(value: number): string;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import AbstractAttributeColumn = weavejs.data.column.AbstractAttributeColumn;
    /**
     * This column is defined by two columns of CSV data: keys and values.
     *
     * @author adufilie
     */
    class CSVColumn extends AbstractAttributeColumn implements IAttributeColumn {
        constructor();
        getMetadata(propertyName: string): string;
        title: LinkableString;
        /**
         * This should contain a two-column CSV with the first column containing the keys and the second column containing the values.
         */
        data: LinkableVariable;
        /**
         * Use this function to set the keys and data of the column.
         * @param table An Array of rows where each row is an Array containing a key and a data value.
         */
        setDataTable(table: any[]): void;
        csvData: string;
        /**
         * This is the key type of the first column in the csvData.
         */
        keyType: LinkableString;
        /**
         * If this is set to true, the data will be parsed as numbers to produce the numeric data.
         */
        numericMode: LinkableBoolean;
        /**
         * This function gets called when csvData changes.
         */
        /**
         * This function generates three Vectors from the CSV data: _keys, _stringValues, _numberValues
         */
        /**
         * This function returns the list of String values from the first column in the CSV data.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * This function returns the corresponding numeric or string value depending on the dataType parameter and the numericMode setting.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import ColorRamp = weavejs.util.ColorRamp;
    /**
     * ColorColumn
     *
     * @author adufilie
     */
    class ColorColumn extends ExtendedDynamicColumn {
        constructor();
        getMetadata(propertyName: string): string;
        ramp: ColorRamp;
        rampCenterAtZero: LinkableBoolean;
        getDataMin(): number;
        getDataMax(): number;
        getColorFromDataValue(value: number): number;
        /**
         * This is a CSV containing specific colors associated with record keys.
         * The format for each row in the CSV is:  keyType,localName,color
         */
        recordColors: LinkableVariable;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    class ColumnDataTask {
        constructor(parentColumn?: IAttributeColumn, dataFilter?: Function, callback?: Function);
        /**
         * Asynchronous output.
         * recordKey:IQualifiedKey -&gt; Array&lt;Number&gt;
         */
        uniqueKeys: any[];
        /**
         * Asynchronous output.
         */
        map_key_arrayData: Object;
        /**
         * @param inputKeys An Array of IQualifiedKey objects.
         * @param inputData An Array of data values corresponding to the inputKeys.
         */
        begin(inputKeys: any, inputData: any): void;
    }
}
declare module weavejs.data.column {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import CallbackCollection = weavejs.core.CallbackCollection;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    /**
     * This provides a wrapper for a dynamic column, and allows new properties to be added.
     * The purpose of this class is to provide a base for extending DynamicColumn.
     *
     * @author adufilie
     */
    class CombinedColumn extends CallbackCollection implements IAttributeColumn {
        constructor();
        useFirstColumnMetadata: LinkableBoolean;
        columns: ILinkableHashMap;
        /************************************
         * Begin IAttributeColumn interface
         ************************************/
        getMetadata(propertyName: string): string;
        getMetadataPropertyNames(): any[];
        /**
         * @return the keys associated with this column.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * getValueFromKey
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IBaseColumn = weavejs.api.data.IBaseColumn;
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * @author adufilie
     */
    class DateColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn {
        constructor(metadata?: Object);
        getMetadata(propertyName: string): string;
        keys: any[];
        containsKey(key: IQualifiedKey): boolean;
        setRecords(qkeys: any[], dates: any[]): void;
        deriveStringFromNumber(number: number): string;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        static detectDateFormats(dates: any): any[];
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    /**
     * This provides a wrapper for a dynamically created column.
     *
     * @author adufilie
     */
    class DynamicColumn extends LinkableDynamicObject implements IColumnWrapper {
        constructor(columnTypeRestriction?: new (..._: any[]) => any);
        /**
         * This function lets you skip the step of casting internalObject as an IAttributeColumn.
         */
        getInternalColumn(): IAttributeColumn;
        /************************************
         * Begin IAttributeColumn interface
         ************************************/
        getMetadata(propertyName: string): string;
        getMetadataPropertyNames(): any[];
        /**
         * @return the keys associated with this column.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        static cache: boolean;
        /**
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * This is a column of data derived from an equation with variables.
     *
     * @author adufilie
     */
    class EquationColumn extends AbstractAttributeColumn implements IPrimitiveColumn {
        static debug: boolean;
        constructor();
        /**
         * This is the equation that will be used in getValueFromKey().
         */
        equation: LinkableString;
        /**
         * This is a list of named variables made available to the compiled equation.
         */
        variables: LinkableHashMap;
        /**
         * This holds the metadata for the column.
         */
        metadata: LinkableVariable;
        /**
         * Specify whether or not we should filter the keys by the column's keyType.
         */
        filterByKeyType: LinkableBoolean;
        /**
         * This function intercepts requests for dataType and title metadata and uses the corresponding linkable variables.
         * @param propertyName A metadata property name.
         * @return The requested metadata value.
         */
        getMetadata(propertyName: string): string;
        setMetadata(value: Object): void;
        getMetadataPropertyNames(): any[];
        /**
         * This function will store an individual metadata value in the metadata linkable variable.
         * @param propertyName
         * @param value
         */
        setMetadataProperty(propertyName: string, value: string): void;
        /**
         * This function creates an object in the variables LinkableHashMap if it doesn't already exist.
         * If there is an existing object associated with the specified name, it will be kept if it
         * is the specified type, or replaced with a new instance of the specified type if it is not.
         * @param name The identifying name of a new or existing object.
         * @param classDef The Class of the desired object type.
         * @return The object associated with the requested name of the requested type, or null if an error occurred.
         */
        requestVariable(name: string, classDef: new (..._: any[]) => any, lockObject?: boolean): any;
        /**
         * @return The keys associated with this EquationColumn.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * Compiles the equation if it has changed, and returns any compile error message that was thrown.
         */
        validateEquation(): string;
        /**
         * @return The result of the compiled equation evaluated at the given record key.
         * @see weave.api.data.IAttributeColumn
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        deriveStringFromNumber(number: number): string;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import CallbackCollection = weavejs.core.CallbackCollection;
    /**
     * This provides a wrapper for a dynamic column, and allows new properties to be added.
     * The purpose of this class is to provide a base for extending DynamicColumn.
     *
     * @author adufilie
     */
    class ExtendedDynamicColumn extends CallbackCollection implements IColumnWrapper {
        constructor();
        /**
         * This is for the IColumnWrapper interface.
         */
        getInternalColumn(): IAttributeColumn;
        /**
         * This is the internal DynamicColumn object that is being extended.
         */
        internalDynamicColumn: DynamicColumn;
        /************************************
         * Begin IAttributeColumn interface
         ************************************/
        getMetadata(propertyName: string): string;
        getMetadataPropertyNames(): any[];
        /**
         * @return the keys associated with this column.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * getValueFromKey
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * FilteredColumn
     *
     * @author adufilie
     */
    class FilteredColumn extends ExtendedDynamicColumn {
        constructor();
        /**
         * This is the dynamically created filter that filters the keys in the column.
         */
        filter: IDynamicKeyFilter;
        keys: any[];
        /**
         * The filter removes certain records from the column.  This function will return false if the key is not contained in the filter.
         */
        containsKey(key: IQualifiedKey): boolean;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IBaseColumn = weavejs.api.data.IBaseColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
    /**
     * The values in this column are Arrays of GeneralizedGeometry objects.
     *
     * @author adufilie
     */
    class GeometryColumn extends AbstractAttributeColumn implements IBaseColumn {
        constructor(metadata?: Object);
        protected _uniqueKeys: any[];
        /**
         * This is a list of unique keys this column defines values for.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        setRecords(keys: any[], geometries: GeneralizedGeometry[]): void;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableString = weavejs.core.LinkableString;
    class KeyColumn extends AbstractAttributeColumn {
        constructor(metadata?: Object);
        getMetadata(propertyName: string): string;
        getMetadataPropertyNames(): any[];
        keyType: LinkableString;
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        keys: any[];
    }
}
declare module weavejs.data.column {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * @author adufilie
     */
    class NormalizedColumn extends ExtendedDynamicColumn {
        constructor(min?: number, max?: number);
        min: LinkableNumber;
        max: LinkableNumber;
        /**
         * getValueFromKey
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IBaseColumn = weavejs.api.data.IBaseColumn;
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * @author adufilie
     */
    class NumberColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn {
        constructor(metadata?: Object);
        getMetadata(propertyName: string): string;
        setRecords(keys: any[], numericData: any[]): void;
        /**
         * Get a string value for a given number.
         */
        deriveStringFromNumber(number: number): string;
        protected generateValue(key: IQualifiedKey, dataType: new (..._: any[]) => any): Object;
        /**
         * Aggregates an Array of Numbers into a single Number.
         * @param numbers An Array of Numbers.
         * @param aggregation One of the constants in weave.api.data.Aggregation.
         * @return An aggregated Number.
         * @see weave.api.data.Aggregation
         */
        static aggregate(numbers: any[], aggregation: string): number;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * This class is a proxy (a wrapper) for another attribute column.
     *
     * @author adufilie
     */
    class ProxyColumn extends AbstractAttributeColumn implements IColumnWrapper {
        constructor(metadata?: Object);
        /**
         * @return the keys associated with this column.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * This function updates the proxy metadata.
         * @param metadata New metadata for the proxy.
         */
        setMetadata(metadata: Object): void;
        /**
         * The metadata specified by ProxyColumn will override the metadata of the internal column.
         * First, this function checks thet ProxyColumn metadata.
         * If the value is null, it checks the metadata of the internal column.
         * @param propertyName The name of a metadata property to get.
         * @return The metadata value of the ProxyColumn or the internal column, ProxyColumn metadata takes precendence.
         */
        getMetadata(propertyName: string): string;
        getProxyMetadata(): Object;
        getMetadataPropertyNames(): any[];
        /**
         * internalAttributeColumn
         * This is the IAttributeColumn object contained in this ProxyColumn.
         */
        getInternalColumn(): IAttributeColumn;
        setInternalColumn(newColumn: IAttributeColumn): void;
        /**
         * The functions below serve as wrappers for matching function calls on the internalAttributeColumn.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        dispose(): void;
        /**
         * Call this function when the ProxyColumn should indicate that the requested data is unavailable.
         * @param message The message to display in the title of the ProxyColumn.
         */
        dataUnavailable(message?: string): void;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IDataSource = weavejs.api.data.IDataSource;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import CallbackCollection = weavejs.core.CallbackCollection;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * This provides a wrapper for a referenced column.
     *
     * @author adufilie
     */
    class ReferencedColumn extends CallbackCollection implements IColumnWrapper {
        constructor();
        /**
         * This is the name of an IDataSource in the top level session state.
         */
        dataSourceName: LinkableString;
        /**
         * This holds the metadata used to identify a column.
         */
        metadata: LinkableVariable;
        getDataSource(): IDataSource;
        getHierarchyNode(): IWeaveTreeNode & IColumnReference;
        /**
         * Updates the session state to refer to a new column.
         */
        setColumnReference(dataSource: IDataSource, metadata: Object): void;
        static generateReferencedColumnStateFromColumnReference(ref: IColumnReference): Object;
        getInternalColumn(): IAttributeColumn;
        /************************************
         * Begin IAttributeColumn interface
         ************************************/
        getMetadata(attributeName: string): string;
        getMetadataPropertyNames(): any[];
        /**
         * @return the keys associated with this column.
         */
        keys: any[];
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * getValueFromKey
         * @param key A key of the type specified by keyType.
         * @return The value associated with the given key.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableString = weavejs.core.LinkableString;
    class SecondaryKeyNumColumn extends AbstractAttributeColumn implements IPrimitiveColumn {
        constructor(metadata?: Object);
        /**
         * This overrides the base title value
         */
        baseTitle: string;
        /**
         * This function overrides the min,max values.
         */
        getMetadata(propertyName: string): string;
        /**
         * This is the value used to filter the data.
         */
        static secondaryKeyFilter: LinkableString;
        static useGlobalMinMaxValues: LinkableBoolean;
        secondaryKeys: any[];
        keys: any[];
        static allKeysHack: boolean;
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * @param qkeysA Array of IQualifiedKey
         * @param keysB Array of String
         * @param data
         */
        updateRecords(qkeysA: any[], keysB: any[], data: any[]): void;
        deriveStringFromNumber(number: number): string;
        /**
         * get data from key value
         */
        getValueFromKey(qkey: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    /**
     * This is a wrapper for another column that provides sorted keys.
     *
     * @author adufilie
     */
    class SortedColumn extends ExtendedDynamicColumn implements IAttributeColumn {
        constructor();
        /**
         * This is an option to sort the column in ascending or descending order.
         */
        ascending: LinkableBoolean;
        /**
         * This function returns the unique strings of the internal column.
         * @return The keys this column defines values for.
         */
        keys: any[];
    }
}
declare module weavejs.data.column {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * This column maps a record key to the index in the list of records sorted by numeric value.
     *
     * @author adufilie
     */
    class SortedIndexColumn extends DynamicColumn implements IAttributeColumn, IPrimitiveColumn {
        constructor();
        keys: any[];
        /**
         * @param key A key existing in the internal column.
         * @param dataType A requested return type.
         * @return If dataType is not specified, returns the index of the key in the sorted list of keys.
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        /**
         * @param index The index in the sorted keys vector.
         * @return The key at the given index value.
         */
        deriveStringFromNumber(index: number): string;
    }
}
declare module weavejs.data.column {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IWeaveGeometryTileService = weavejs.api.net.IWeaveGeometryTileService;
    import Bounds2D = weavejs.geom.Bounds2D;
    import ZoomBounds = weavejs.geom.ZoomBounds;
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * StreamedGeometryColumn
     *
     * @author adufilie
     */
    class StreamedGeometryColumn extends AbstractAttributeColumn {
        static debug: boolean;
        constructor(metadataTileDescriptors?: JSByteArray, geometryTileDescriptors?: JSByteArray, tileService?: IWeaveGeometryTileService, metadata?: Object);
        boundingBoxCallbacks: ICallbackCollection;
        getMetadata(propertyName: string): string;
        /**
         * This is a list of unique keys this column defines values for.
         */
        keys: any[];
        containsKey(key: IQualifiedKey): boolean;
        /**
         * @return The Array of geometries associated with the given key (if dataType not specified).
         */
        getValueFromKey(key: IQualifiedKey, dataType?: new (..._: any[]) => any): any;
        collectiveBounds: Bounds2D;
        /**
         * This function returns true if the column is still downloading tiles.
         * @return True if there are tiles still downloading.
         */
        isStillDownloading(): boolean;
        metadataTilesPerQuery: number;
        geometryTilesPerQuery: number;
        requestAllMetadata(): void;
        requestGeometryDetail(dataBounds: Bounds2D, lowestImportance: number): void;
        requestGeometryDetailForZoomBounds(zoomBounds: ZoomBounds): void;
        static METADATA_REQUEST_MODE_ALL: string;
        static METADATA_REQUEST_MODE_XY: string;
        static METADATA_REQUEST_MODE_XYZ: string;
        static metadataRequestModeEnum: any[];
        /**
         * This mode determines which metadata tiles will be requested based on what geometry data is requested.
         * Possible request modes are:<br>
         *    all -> All metadata tiles, regardless of requested X-Y-Z range <br>
         *    xy -> Metadata tiles contained in the requested X-Y range, regardless of Z range <br>
         *    xyz -> Metadata tiles contained in the requested X-Y-Z range only <br>
         */
        static metadataRequestMode: string;
        /**
         * This is the minimum bounding box screen area in pixels required for a geometry to be considered relevant.
         * Should be >= 1.
         */
        static geometryMinimumScreenArea: number;
        static test_kdtree(weave: Weave, iterations?: number): Object;
        test_kdtree(iterations?: number): Object;
    }
}
declare module weavejs.data.column {
    import IBaseColumn = weavejs.api.data.IBaseColumn;
    import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * @author adufilie
     */
    class StringColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn {
        constructor(metadata?: Object);
        getMetadata(propertyName: string): string;
        setRecords(keys: any[], stringData: any[]): void;
        deriveStringFromNumber(number: number): string;
        protected generateValue(key: IQualifiedKey, dataType: new (..._: any[]) => any): Object;
        /**
         * Aggregates an Array of Strings into a single String.
         * @param strings An Array of Strings.
         * @param aggregation One of the constants in weave.api.data.Aggregation.
         * @return An aggregated String.
         * @see weave.api.data.Aggregation
         */
        static aggregate(strings: any[], aggregation: string): string;
        static getSupportedAggregationModes(): any[];
    }
}
declare module weavejs.data.column {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * This provides a reverse lookup of String values in an IAttributeColumn.
     *
     * @author adufilie
     */
    class StringLookup implements ILinkableObject {
        constructor(column?: IAttributeColumn);
        /**
         * This function gets called when the referenced column changes.
         */
        protected handleInternalColumnChange(): void;
        /**
         * This is a list of the unique strings of the internal column.
         */
        uniqueStrings: any[];
        /**
         * This function will initialize the string lookup table and list of unique strings.
         */
        /**
         * @param stringValue A string value existing in the internal column.
         * @return An Array of keys that map to the given string value in the internal column.
         */
        getKeysFromString(stringValue: string): any[];
        /**
         * @param stringValue A string value existing in the internal column.
         * @return The Number value associated with the String value from the internal column.
         */
        getNumberFromString(stringValue: string): number;
    }
}
declare module weavejs.data.hierarchy {
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IWeaveTreeNodeWithPathFinding = weavejs.api.data.IWeaveTreeNodeWithPathFinding;
    /**
     * A node in a tree whose leaves identify attribute columns.
     * The <code>data</code> property is used for column metadata on leaf nodes.
     * The following properties are used for equality comparison, in addition to node class definitions:<br>
     * <code>dataSource, data, idFields</code><br>
     * The following properties are used by ColumnTreeNode but not for equality comparison:<br>
     * <code>label, children, hasChildBranches</code><br>
     */
    class ColumnTreeNode extends WeaveTreeDescriptorNode implements IWeaveTreeNodeWithPathFinding, IColumnReference {
        /**
         * The <code>data</code> parameter is used for column metadata on leaf nodes.
         * The following properties are used for equality comparison, in addition to node class definitions:
         *     <code>dependency, data, dataSource, idFields</code><br>
         * The following properties are used by ColumnTreeNode but not for equality comparison:
         *     <code>label, children, hasChildBranches</code><br>
         * @param params An values for the properties of this ColumnTreeNode.
         *               The <code>dataSource</code> property is required.
         *               If no <code>dependency</code> property is given, <code>dataSource.hierarchyRefresh</code> will be used as the dependency.
         */
        constructor(params?: Object);
        /**
         * IDataSource for this node.
         */
        dataSource: IDataSource;
        /**
         * A list of data fields to use for node equality tests.
         */
        idFields: any[];
        /**
         * If there is no label, this will use data['title'] if defined.
         */
        label: any;
        /**
         * Compares constructor, dataSource, dependency, data, idFields.
         */
        equals(other: IWeaveTreeNode): boolean;
        getDataSource(): IDataSource;
        getColumnMetadata(): {
            [name: string]: string;
        };
        findPathToNode(descendant: IWeaveTreeNode): any[];
    }
}
declare module weavejs.data.hierarchy {
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IWeaveTreeNodeWithEditableChildren = weavejs.api.data.IWeaveTreeNodeWithEditableChildren;
    import IWeaveTreeNodeWithPathFinding = weavejs.api.data.IWeaveTreeNodeWithPathFinding;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityCache = weavejs.net.EntityCache;
    class EntityNode implements IWeaveTreeNodeWithEditableChildren, IWeaveTreeNodeWithPathFinding, IColumnReference {
        static debug: boolean;
        /**
         * @param entityCache The entityCache which the Entity belongs to.
         * @param rootFilterEntityType To be used by root node only.
         * @param nodeFilterFunction Used for filtering children.
         */
        constructor(entityCache?: EntityCache, rootFilterEntityType?: string, overrideLabel?: string);
        /**
         * @private
         */
        _overrideLabel: string;
        /**
         * This primitive value is used in place of a pointer to an EntityCache object
         * so that this object may be serialized & copied by the Flex framework without losing this information.
         * @private
         */
        _cacheId: number;
        /**
         * The entity ID.
         */
        id: number;
        /**
         * Sets the EntityCache associated with this node.
         */
        setEntityCache(entityCache: EntityCache): void;
        /**
         * Gets the EntityCache associated with this node.
         */
        getEntityCache(): EntityCache;
        /**
         * Gets the Entity associated with this node.
         */
        getEntity(): Entity;
        equals(other: IWeaveTreeNode): boolean;
        getDataSource(): IDataSource;
        getColumnMetadata(): {
            [name: string]: string;
        };
        getLabel(): string;
        isBranch(): boolean;
        hasChildBranches(): boolean;
        getChildren(): any[];
        addChildAt(child: IWeaveTreeNode, index: number): boolean;
        removeChild(child: IWeaveTreeNode): boolean;
        findPathToNode(descendant: IWeaveTreeNode): any[];
    }
}
declare module weavejs.data.hierarchy {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    class EntityNodeSearch implements ILinkableObject {
        /**
         * Set this to true to include all descendants of matching nodes
         * whether or not the descendants also matched the search.
         */
        includeAllDescendants: boolean;
        /**
         * The public metadata field used for searching.
         * @default "title"
         */
        searchField: string;
        /**
         * The search string, which may contain '*' and '?' wildcards.
         */
        searchString: string;
        /**
         * Use this as the nodeFilter in a WeaveTree.
         * @param node The node to test.
         * @see weave.ui.WeaveTree#nodeFilter
         */
        nodeFilter(node: IWeaveTreeNode): boolean;
        /**
         * Surrounds a string with '*' and replaces ' ' with '*'
         */
        static replaceSpacesWithWildcards(searchString: string): string;
        /**
         * Generates a RegExp that matches a search string using '?' and '*' wildcards.
         */
        static strToRegExp(searchString: string, flags?: string): RegExp;
    }
}
declare module weavejs.data.hierarchy {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    class GlobalColumnDataSource implements IDataSource {
        static getInstance(root: ILinkableHashMap): IDataSource;
        isLocal: boolean;
        constructor(root?: ILinkableHashMap);
        getLabel(): string;
        /**
         * The metadata property name used to identify a column appearing in root.
         */
        static NAME: string;
        hierarchyRefresh: ICallbackCollection;
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        findHierarchyNode(metadata: Object): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        generateNewAttributeColumn(metadata: Object): IAttributeColumn;
    }
}
declare module weavejs.data.hierarchy {
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    import IDataSource_File = weavejs.api.data.IDataSource_File;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    /**
     * An all-static class containing functions for dealing with data hierarchies.
     *
     * @author adufilie
     */
    class HierarchyUtils {
        static findParentNode<T extends IWeaveTreeNode>(root: T, dataSource: IDataSource, metadata: Object): T;
        static findSiblingNodes(dataSource: IDataSource, metadata: Object): Array<IWeaveTreeNode>;
        /**
         * Finds a series of IWeaveTreeNode objects which can be traversed as a path to a descendant node.
         * @param root The root IWeaveTreeNode.
         * @param descendant The descendant IWeaveTreeNode.
         * @return An Array of IWeaveTreeNode objects which can be followed as a path from the root to the descendant, including the root and descendant nodes.
         *         The last item in the path may be the equivalent node found in the hierarchy rather than the descendant node that was passed in.
         *         Returns null if the descendant is unreachable from this node.
         * @see weave.api.data.IWeaveTreeNode#equals()
         */
        static findPathToNode<T extends IWeaveTreeNode>(root: T, descendant: T): Array<T>;
        /**
         * Traverses an entire hierarchy and returns all nodes that
         * implement IColumnReference and have column metadata.
         */
        static getAllColumnReferenceDescendants(source: IDataSource_File): Array<IColumnReference>;
    }
}
declare module weavejs.data.hierarchy {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    class WeaveRootDataTreeNode extends WeaveTreeDescriptorNode implements ILinkableObject, IColumnReference {
        constructor(root?: ILinkableHashMap);
        getDataSource(): IDataSource;
        getColumnMetadata(): {
            [name: string]: string;
        };
    }
}
declare module weavejs.data.hierarchy {
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import WeaveTreeItem = weavejs.util.WeaveTreeItem;
    /**
     * A node in a tree whose leaves identify attribute columns.
     * The following properties are used for equality comparison, in addition to node class definitions:<br>
     * <code>dependency, data</code><br>
     * The following properties are used by WeaveTreeDescriptorNode but not for equality comparison:<br>
     * <code>label, children, hasChildBranches</code><br>
     */
    class WeaveTreeDescriptorNode extends WeaveTreeItem implements IWeaveTreeNode {
        /**
         * The following properties are used for equality comparison, in addition to node class definitions:
         *     <code>dependency, data</code><br>
         * The following properties are used by WeaveTreeDescriptorNode but not for equality comparison:
         *     <code>label, children, hasChildBranches</code><br>
         * @param params An values for the properties of this WeaveTreeDescriptorNode.
         */
        constructor(params?: Object);
        /**
         * Set this to true if this node is a branch, or false if it is not.
         * Otherwise, hasChildBranches() will check isBranch() on each child returned by getChildren().
         */
        _hasChildBranches: any;
        equals(other: IWeaveTreeNode): boolean;
        getLabel(): string;
        isBranch(): boolean;
        hasChildBranches(): boolean;
        getChildren(): any[];
    }
}
declare module weavejs.data.key {
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import IKeyFilter = weavejs.api.data.IKeyFilter;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    class ColumnDataFilter implements IKeyFilter, ILinkableObjectWithNewProperties, IObjectWithDescription {
        getDescription(): string;
        static REGEXP: string;
        enabled: LinkableBoolean;
        includeMissingKeyTypes: LinkableBoolean;
        column: DynamicColumn;
        /**
         * An Array of Numbers, Strings and/or Range objects specifying numeric ranges.
         * A Range object contains two properties: "min" and "max".
         * Alternatively, you can specify "minInclusive" or "minExclusive" in place of "min"
         * and "minInclusive" or "maxExclusive" in place of "max".
         */
        values: LinkableVariable;
        containsKey(key: IQualifiedKey): boolean;
        stringifyValues(): any[];
        deprecatedStateMapping: Object;
    }
}
declare module weavejs.data.key {
    class ColumnDataFilterRange {
        static isRange(obj: Object): boolean;
        static MIN: string;
        static MIN_INCLUSIVE: string;
        static MIN_EXCLUSIVE: string;
        static MAX: string;
        static MAX_INCLUSIVE: string;
        static MAX_EXCLUSIVE: string;
        constructor(obj?: Object);
        min: any;
        max: any;
        minInclusive: boolean;
        maxInclusive: boolean;
        getState(): Object;
    }
}
declare module weavejs.data.key {
    import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
    import IKeyFilter = weavejs.api.data.IKeyFilter;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    /**
     * This is a wrapper for a dynamically created object implementing IKeyFilter.
     *
     * @author adufilie
     */
    class DynamicKeyFilter extends LinkableDynamicObject implements IDynamicKeyFilter {
        constructor();
        getInternalKeyFilter(): IKeyFilter;
    }
}
declare module weavejs.data.key {
    import IDynamicKeySet = weavejs.api.data.IDynamicKeySet;
    import IKeySet = weavejs.api.data.IKeySet;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    /**
     * This is a wrapper for a dynamically created object implementing IKeySet.
     *
     * @author adufilie
     */
    class DynamicKeySet extends LinkableDynamicObject implements IDynamicKeySet {
        constructor();
        getInternalKeySet(): IKeySet;
    }
}
declare module weavejs.data.key {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
    import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
    import IKeySet = weavejs.api.data.IKeySet;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import CallbackCollection = weavejs.core.CallbackCollection;
    /**
     * A FilteredKeySet has a base set of keys and an optional filter.
     * The resulting set of keys becomes the intersection of the base set with the filter.
     *
     * @author adufilie
     */
    class FilteredKeySet extends CallbackCollection implements IFilteredKeySet {
        static debug: boolean;
        constructor();
        dispose(): void;
        /**
         * This sets up the FilteredKeySet to get its base set of keys from a list of columns and provide them in sorted order.
         * @param columns An Array of IAttributeColumns to use for comparing IQualifiedKeys.
         * @param sortDirections Array of sort directions corresponding to the columns and given as integers (1=ascending, -1=descending, 0=none).
         * @param keySortCopy A function that returns a sorted copy of an Array of keys. If specified, descendingFlags will be ignored and this function will be used instead.
         * @param keyInclusionLogic Passed to KeySetUnion constructor.
         * @see weave.data.KeySets.SortedKeySet#generateCompareFunction()
         */
        setColumnKeySources(columns: Array<IKeySet | IAttributeColumn>, sortDirections?: Array<number>, keySortCopy?: (keys: IQualifiedKey[]) => IQualifiedKey[], keyInclusionLogic?: (key: IQualifiedKey) => boolean): void;
        /**
         * This function sets the base IKeySet that is being filtered.
         * @param newBaseKeySet A new IKeySet to use as the base for this FilteredKeySet.
         */
        setSingleKeySource(keySet: IKeySet): void;
        /**
         * @return The interface for setting a filter that is applied to the base key set.
         */
        keyFilter: IDynamicKeyFilter;
        /**
         * @param key A key to test.
         * @return true if the key exists in this IKeySet.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * @return The keys in this IKeySet.
         */
        keys: any[];
    }
}
declare module weavejs.data.key {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IKeyFilter = weavejs.api.data.IKeyFilter;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableString = weavejs.core.LinkableString;
    /**
     * This class is used to include and exclude IQualifiedKeys from a set.
     *
     * @author adufilie
     */
    class KeyFilter implements IKeyFilter, ILinkableObject {
        constructor();
        static UNION: string;
        static INTERSECTION: string;
        includeMissingKeys: LinkableBoolean;
        includeMissingKeyTypes: LinkableBoolean;
        included: KeySet;
        excluded: KeySet;
        filters: ILinkableHashMap;
        filterSetOp: LinkableString;
        /**
         * This replaces the included and excluded keys in the filter with the parameters specified.
         */
        replaceKeys(includeMissingKeys: boolean, includeMissingKeyTypes: boolean, includeKeys?: any[], excludeKeys?: any[]): void;
        includeKeys(keys: any[]): void;
        excludeKeys(keys: any[]): void;
        /**
         * @param key A key to test.
         * @return true if this filter includes the key, false if the filter excludes it.
         */
        containsKey(key: IQualifiedKey): boolean;
        sessionedKeyType: string;
        includedKeys: string;
        excludedKeys: string;
    }
}
declare module weavejs.data.key {
    import IKeySet = weavejs.api.data.IKeySet;
    import IKeySetCallbackInterface = weavejs.api.data.IKeySetCallbackInterface;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * This class contains a set of IQualifiedKeys and functions for adding/removing keys from the set.
     *
     * @author adufilie
     */
    class KeySet extends LinkableVariable implements IKeySet {
        constructor();
        /**
         * An interface for keys added and removed
         */
        keyCallbacks: IKeySetCallbackInterface;
        /**
         * A list of keys included in this KeySet.
         */
        keys: Array<IQualifiedKey>;
        /**
         * Overwrite the current set of keys.
         * @param newKeys An Array of IQualifiedKey objects.
         * @return true if the set changes as a result of calling this function.
         */
        replaceKeys(newKeys: Array<IQualifiedKey>): boolean;
        /**
         * Clear the current set of keys.
         * @return true if the set changes as a result of calling this function.
         */
        clearKeys(): boolean;
        /**
         * @param key A IQualifiedKey object to check.
         * @return true if the given key is included in the set.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * Adds a vector of additional keys to the set.
         * @param additionalKeys A list of keys to add to this set.
         * @return true if the set changes as a result of calling this function.
         */
        addKeys(additionalKeys: Array<IQualifiedKey>): boolean;
        /**
         * Removes a vector of additional keys to the set.
         * @param unwantedKeys A list of keys to remove from this set.
         * @return true if the set changes as a result of calling this function.
         */
        removeKeys(unwantedKeys: Array<IQualifiedKey>): boolean;
        /**
         * This function sets the session state for the KeySet.
         * @param value A CSV-formatted String where each row is a keyType followed by a list of key strings of that keyType.
         */
        setSessionState(value: Object): void;
    }
}
declare module weavejs.data.key {
    import IKeySetCallbackInterface = weavejs.api.data.IKeySetCallbackInterface;
    import CallbackCollection = weavejs.core.CallbackCollection;
    /**
     * Provides an interface for getting KeySet event-related information.
     */
    class KeySetCallbackInterface extends CallbackCollection implements IKeySetCallbackInterface {
        constructor();
        flushKeys(): void;
        keysAdded: any[];
        keysRemoved: any[];
    }
}
declare module weavejs.data.key {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import IKeySet = weavejs.api.data.IKeySet;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * This key set is the union of several other key sets.  It has no session state.
     *
     * @author adufilie
     */
    class KeySetUnion implements IKeySet, IDisposableObject {
        static debug: boolean;
        /**
         * @param keyInclusionLogic A function that accepts an IQualifiedKey and returns true or false.
         */
        constructor(keyInclusionLogic?: (key: IQualifiedKey) => boolean);
        /**
         * This will add an IKeySet as a dependency and include its keys in the union.
         * @param keySet
         */
        addKeySetDependency(keySet: IKeySet): void;
        /**
         * This is a list of the IQualifiedKey objects that define the key set.
         */
        keys: any[];
        /**
         * @param key A IQualifiedKey object to check.
         * @return true if the given key is included in the set.
         */
        containsKey(key: IQualifiedKey): boolean;
        /**
         * Use this to check asynchronous task busy status.  This is kept separate because if we report busy status we need to
         * trigger callbacks when an asynchronous task completes, but we don't want to trigger KeySetUnion callbacks when nothing
         * changes as a result of completing the asynchronous task.
         */
        busyStatus: ICallbackCollection;
        dispose(): void;
    }
}
declare module weavejs.data.key {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * This class is internal to QKeyManager because instances
     * of QKey should not be instantiated outside QKeyManager.
     */
    class QKey implements IQualifiedKey {
        constructor(keyType?: string, localName?: string, toString?: string);
        /**
         * This is the namespace of the QKey.
         */
        keyType: string;
        /**
         * This is local record identifier in the namespace of the QKey.
         */
        localName: string;
        toNumber(): number;
        toString(): string;
    }
}
declare module weavejs.data.key {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IQualifiedKeyManager = weavejs.api.data.IQualifiedKeyManager;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * This class manages a global list of IQualifiedKey objects.
     *
     * The getQKey() function must be used to get IQualifiedKey objects.  Each QKey returned by
     * getQKey() with the same parameters will be the same object, so IQualifiedKeys can be compared
     * with the == operator or used as keys in a Dictionary.
     *
     * @author adufilie
     */
    class QKeyManager implements IQualifiedKeyManager {
        constructor();
        /**
         * Maps IQualifiedKey to keyType - faster than reading the keyType property of a QKey
         */
        map_qkey_keyType: WeakMap<IQualifiedKey, string>;
        /**
         * Maps IQualifiedKey to localName - faster than reading the localName property of a QKey
         */
        map_qkey_localName: WeakMap<IQualifiedKey, string>;
        stringToQKey(qkeyString: string): IQualifiedKey;
        numberToQKey(qkeyNumber: number): IQualifiedKey;
        /**
         * Get the QKey object for a given key type and key.
         *
         * @return The QKey object for this type and key.
         */
        getQKey(keyType: string, localName: string): IQualifiedKey;
        /**
         * @param output An output Array for IQualifiedKeys.
         */
        getQKeys_range(keyType: string, keyStrings: Array<string>, iStart: number, iEnd: number, output: Array<IQualifiedKey>): void;
        /**
         * Get a list of QKey objects, all with the same key type.
         *
         * @return An array of QKeys.
         */
        getQKeys(keyType: string, keyStrings: Array<string>): Array<IQualifiedKey>;
        /**
         * This will replace untyped Objects in an Array with their IQualifiedKey counterparts.
         * Each object in the Array should have two properties: <code>keyType</code> and <code>localName</code>
         * @param objects An Array to modify.
         * @return The same Array that was passed in, modified.
         */
        convertToQKeys(objects: Array<{
            keyType: string;
            localName: string;
        }>): Array<IQualifiedKey>;
        /**
         * Get a list of QKey objects, all with the same key type.
         *
         * @return An array of QKeys that will be filled in asynchronously.
         */
        getQKeysAsync(relevantContext: ILinkableObject, keyType: string, keyStrings: Array<string>, asyncCallback: (keys: IQualifiedKey[]) => void, outputKeys: Array<IQualifiedKey>): void;
        /**
         * Get a list of QKey objects, all with the same key type.
         * @param relevantContext The owner of the WeavePromise. Only one WeavePromise will be generated per owner.
         * @param keyType The keyType.
         * @param keyStrings An Array of localName values.
         * @return A WeavePromise that produces an Array of IQualifiedKeys.
         */
        getQKeysPromise(relevantContext: Object, keyType: string, keyStrings: Array<string>): WeavePromise<IQualifiedKey[]>;
        /**
         * Get a list of all previoused key types.
         *
         * @return An array of QKeys.
         */
        getAllKeyTypes(): Array<string>;
        /**
         * Get a list of all referenced QKeys for a given key type
         * @return An array of QKeys
         */
        getAllQKeys(keyType: string): Array<IQualifiedKey>;
        /**
         * This makes a sorted copy of an Array of keys.
         * @param An Array of IQualifiedKeys.
         * @return A sorted copy of the keys.
         */
        static keySortCopy(keys: Array<IQualifiedKey>): Array<IQualifiedKey>;
    }
}
declare module weavejs.data.key {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IKeySet = weavejs.api.data.IKeySet;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * This provides the keys from an existing IKeySet in a sorted order.
     * Callbacks will trigger when the sorted result changes.
     *
     * @author adufilie
     */
    class SortedKeySet implements IKeySet {
        /**
         * @param keySet An IKeySet to sort.
         * @param sortCopyFunction A function that accepts an Array of IQualifiedKeys and returns a new, sorted copy.
         * @param dependencies A list of ILinkableObjects that affect the result of the compare function.
         *                     If any IAttributeColumns are provided, the corresponding IColumnStatistics will also
         *                     be added as dependencies.
         */
        constructor(keySet?: IKeySet, sortCopyFunction?: Function, dependencies?: any[]);
        containsKey(key: IQualifiedKey): boolean;
        /**
         * This is the list of keys from the IKeySet, sorted.
         */
        keys: any[];
        /**
         * Generates a function like <code>function(keys:Array):Array</code> that returns a sorted copy of an Array of keys.
         * Note that the resulting sort function depends on WeaveAPI.StatisticsManager, so the sort function should be called
         * again when statistics change for any of the columns you provide.
         * @param columns An Array of IAttributeColumns or Functions mapping IQualifiedKeys to Numbers.
         * @param sortDirections Sort directions (-1, 0, 1)
         * @return A function that returns a sorted copy of an Array of keys.
         */
        static generateSortCopyFunction(columns: Array<IAttributeColumn | ((key: IQualifiedKey) => number)>, sortDirections?: Array<number>): (keys: IQualifiedKey[]) => IQualifiedKey[];
    }
}
declare module weavejs.data.source {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    /**
     * This is a base class to make it easier to develope a new class that implements IDataSource.
     * Classes that extend AbstractDataSource should implement the following methods:
     * getHierarchyRoot, generateHierarchyNode, requestColumnFromSource
     *
     * @author adufilie
     */
    class AbstractDataSource implements IDataSource, IDisposableObject {
        constructor();
        /**
         * Overrides root hierarchy label.
         */
        label: LinkableString;
        getLabel(): string;
        isLocal: boolean;
        /**
         * This variable is set to false when the session state changes and true when initialize() is called.
         */
        protected _initializeCalled: boolean;
        /**
         * This should be used to keep a pointer to the hierarchy root node.
         */
        protected _rootNode: IWeaveTreeNode & weavejs.api.data.IColumnReference;
        /**
         * ProxyColumn -> (true if pending, false if not pending)
         */
        protected map_proxyColumn_pending: Object;
        hierarchyRefresh: ICallbackCollection;
        /**
         * Sets _rootNode to null and triggers callbacks.
         * @inheritDoc
         */
        protected refreshHierarchy(): void;
        /**
         * This function must be implemented by classes that extend AbstractDataSource.
         * This function should set _rootNode if it is null, which may happen from calling refreshHierarchy().
         * @inheritDoc
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        /**
         * This function must be implemented by classes that extend AbstractDataSource.
         * This function should make a request to the source to fill in the proxy column.
         * @param proxyColumn Contains metadata for the column request and will be used to store column data when it is ready.
         */
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
        /**
         * This function must be implemented by classes that extend AbstractDataSource.
         * @param metadata A set of metadata that may identify a column in this IDataSource.
         * @return A node that contains the metadata.
         */
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        /**
         * Classes that extend AbstractDataSource can define their own replacement for this function.
         * All column requests will be delayed as long as this accessor function returns false.
         * The default behavior is to return false during the time between a change in the session state and when initialize() is called.
         */
        protected initializationComplete: boolean;
        /**
         * This function is called as an immediate callback and sets initialized to false.
         */
        protected uninitialize(): void;
        /**
         * This function will be called as a grouped callback the frame after the session state for the data source changes.
         * When overriding this function, super.initialize() should be called.
         */
        protected initialize(forceRefresh?: boolean): void;
        /**
         * The default implementation of this function calls generateHierarchyNode(metadata) and
         * then traverses the _rootNode to find a matching node.
         * This function should be overridden if the hierachy is not known completely, since this
         * may result in traversing the entire hierarchy, causing many remote procedure calls if
         * the hierarchy is stored remotely.
         */
        findHierarchyNode(metadata: Object): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        /**
         * This function creates a new ProxyColumn object corresponding to the metadata and queues up the request for the column.
         * @param metadata An object that contains all the information required to request the column from this IDataSource.
         * @return A ProxyColumn object that will be updated when the column data is ready.
         */
        generateNewAttributeColumn(metadata: Object): IAttributeColumn;
        /**
         * This function will call requestColumnFromSource() if initializationComplete==true.
         * Otherwise, it will delay the column request again.
         * This function may be overridden by classes that extend AbstractDataSource.
         * However, if the extending class decides it wants to call requestColumnFromSource()
         * for the pending column, it is recommended to call super.handlePendingColumnRequest() instead.
         * @param request The request that needs to be handled.
         */
        protected handlePendingColumnRequest(column: ProxyColumn, forced?: boolean): void;
        /**
         * This function will call handlePendingColumnRequest() on each pending column request.
         */
        protected handleAllPendingColumnRequests(forced?: boolean): void;
        /**
         * Calls requestColumnFromSource() on all ProxyColumn objects created previously via generateNewAttributeColumn().
         */
        protected refreshAllProxyColumns(forced?: boolean): void;
        /**
         * This function should be called when the IDataSource is no longer in use.
         * All existing pointers to objects should be set to null so they can be garbage collected.
         */
        dispose(): void;
    }
}
declare module weavejs.data.source {
    import IDataSource = weavejs.api.data.IDataSource;
    import IDataSource_Service = weavejs.api.data.IDataSource_Service;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableString = weavejs.core.LinkableString;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    class CKANDataSource extends AbstractDataSource implements IDataSource_Service {
        constructor();
        isLocal: boolean;
        url: LinkableString;
        apiVersion: LinkableNumber;
        useHttpPost: LinkableBoolean;
        showPackages: LinkableBoolean;
        showGroups: LinkableBoolean;
        showTags: LinkableBoolean;
        useDataStore: LinkableBoolean;
        /**
         * This gets called when callbacks are triggered.
         */
        protected initialize(forceRefresh?: boolean): void;
        protected refreshHierarchy(): void;
        /**
         * Gets the root node of the attribute hierarchy.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        /**
         * @inheritDoc
         */
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
        static PARAMS_CKAN_ID: string;
        static PARAMS_CKAN_URL: string;
        static PARAMS_CKAN_FORMAT: string;
        static PARAMS_CKAN_FIELD: string;
        static DATASTORE_FORMAT: string;
        getBaseURL(): string;
        getFullURL(relativeURL: string): string;
        /**
         * @private
         */
        getChildDataSource(params: Object): IDataSource;
    }
}
declare module weavejs.data.source {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IDataSource_File = weavejs.api.data.IDataSource_File;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableFile = weavejs.core.LinkableFile;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    /**
     *
     * @author adufilie
     * @author skolman
     */
    class CSVDataSource extends AbstractDataSource implements IDataSource_File, ILinkableObjectWithNewProperties {
        constructor();
        isLocal: boolean;
        getLabel(): string;
        csvData: LinkableVariable;
        keyType: LinkableString;
        keyColumn: LinkableVariable;
        metadata: LinkableVariable;
        url: LinkableFile;
        delimiter: LinkableString;
        protected handleParsedRows(rows: string[][]): void;
        keysAreUnique: boolean;
        /**
         * Convenience function for setting session state of csvData.
         * @param rows
         */
        setCSVData(rows: string[][]): void;
        getCSVData(): string[][];
        /**
         * Convenience function for setting session state of csvData.
         * @param csvDataString CSV string using comma as a delimiter.
         */
        setCSVDataString(csvDataString: string): void;
        /**
         * This will get a list of column names in the data, which are taken directly from the header row and not guaranteed to be unique.
         */
        getColumnNames(): Array<string>;
        /**
         * A unique list of identifiers for columns which may be a mix of Strings and Numbers, depending on the uniqueness of column names.
         */
        getColumnIds(): Array<number | string>;
        /**
         * Gets whatever is stored in the "metadata" session state for the specified id.
         */
        getColumnTitle(id: Object): string;
        generateMetadataForColumnId(id: Object): Object;
        generateNewAttributeColumn(metadata: Object): IAttributeColumn;
        /**
         * This function will get a column by name or index.
         * @param columnNameOrIndex The name or index of the CSV column to get.
         * @return The column.
         */
        getColumnById(columnNameOrIndex: Object): IAttributeColumn;
        /**
         * This function will create a column in an ILinkableHashMap that references a column from this CSVDataSource.
         * @param columnNameOrIndex Either a column name or zero-based column index.
         * @param destinationHashMap The hash map to put the column in.
         * @return The column that was created in the hash map.
         */
        putColumnInHashMap(columnNameOrIndex: Object, destinationHashMap: ILinkableHashMap): IAttributeColumn;
        /**
         * This will modify a column object in the session state to refer to a column in this CSVDataSource.
         * @param columnNameOrIndex Either a column name or zero-based column index.
         * @param dynamicColumn A DynamicColumn.
         * @return A value of true if successful, false if not.
         * @see weave.api.IExternalSessionStateInterface
         */
        putColumn(columnNameOrIndex: Object, dynamicColumn: DynamicColumn): boolean;
        protected initializationComplete: boolean;
        /**
         * This gets called as a grouped callback.
         */
        protected initialize(forceRefresh?: boolean): void;
        /**
         * Gets the root node of the attribute hierarchy.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        static METADATA_COLUMN_INDEX: string;
        static METADATA_COLUMN_NAME: string;
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
        deprecatedStateMapping: Object;
        getColumnByName(name: string): IAttributeColumn;
    }
}
declare module weavejs.data.source {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeavePromise = weavejs.util.WeavePromise;
    class CensusApi implements ILinkableObject {
        static BASE_URL: string;
        getDatasets(): WeavePromise<any>;
        getVariables(dataSetIdentifier: string): WeavePromise<any>;
        getGeographies(dataSetIdentifier: string): WeavePromise<any>;
        /**
         *
         * @param metadata
         * @return An object containing three fields, "keys," "values," and "metadata"
         */
        getColumn(metadata: Object): WeavePromise<{
            keys: any;
            values: any;
            metadata: any;
        }>;
    }
}
declare module weavejs.data.source {
    import IDataSource_Service = weavejs.api.data.IDataSource_Service;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
    class CensusDataSource extends AbstractDataSource implements IDataSource_Service {
        static CONCEPT_NAME: string;
        static VARIABLE_NAME: string;
        constructor();
        isLocal: boolean;
        protected initialize(forceRefresh?: boolean): void;
        keyType: LinkableString;
        apiKey: LinkableString;
        dataSet: LinkableString;
        geographicScope: LinkableString;
        geographicFilters: LinkableVariable;
        getAPI(): CensusApi;
        createDataSetNode(): ColumnTreeNode;
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
    }
}
declare module weavejs.data.source {
    import IDataSource_File = weavejs.api.data.IDataSource_File;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    /**
     * @author adufilie
     */
    class DBFDataSource extends AbstractDataSource implements IDataSource_File {
        constructor();
        /**
         * Hack until dbfUrl and shpUrl are turned into LinkableFiles;
         */
        isLocal: boolean;
        getLabel(): string;
        protected initializationComplete: boolean;
        protected uninitialize(): void;
        protected initialize(forceRefresh?: boolean): void;
        keyType: LinkableString;
        keyColName: LinkableString;
        dbfUrl: LinkableString;
        shpUrl: LinkableString;
        projection: LinkableString;
        static DBF_COLUMN_NAME: string;
        static THE_GEOM_COLUMN: string;
        /**
         * Called when the DBF file is downloaded from the URL
         */
        /**
         * Gets the root node of the attribute hierarchy.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        /**
         * Called when the Shp file is downloaded from the URL
         */
        /**
         * Called when the DBF file fails to download from the URL
         */
        /**
         * Called when the DBF file fails to download from the URL
         */
        /**
         * @inheritDoc
         */
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
        getKeyType(): string;
        getColumnNames(): any[];
        getColumnMetadata(columnName: string): Object;
    }
}
declare module weavejs.data.source {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    class ForeignDataMappingTransform extends AbstractDataSource implements ISelectableAttributes {
        static DATA_COLUMNNAME_META: string;
        keyColumn: DynamicColumn;
        dataColumns: ILinkableHashMap;
        constructor();
        isLocal: boolean;
        selectableAttributes: Map<string, (weavejs.api.data.IColumnWrapper | weavejs.api.core.ILinkableHashMap)>;
        protected initializationComplete: boolean;
        protected initialize(forceRefresh?: boolean): void;
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
    }
}
declare module weavejs.data.source {
    import IDataSource_File = weavejs.api.data.IDataSource_File;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableFile = weavejs.core.LinkableFile;
    import LinkableString = weavejs.core.LinkableString;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    class GeoJSONDataSource extends AbstractDataSource implements IDataSource_File {
        constructor();
        isLocal: boolean;
        getLabel(): string;
        url: LinkableFile;
        keyType: LinkableString;
        keyProperty: LinkableString;
        /**
         * Overrides the projection specified in the GeoJSON object.
         */
        projection: LinkableString;
        /**
         * Gets the projection metadata used in the geometry column.
         */
        getProjection(): string;
        /**
         * Gets the keyType metadata used in the columns.
         */
        getPropertyNames(): any[];
        getKeyType(): string;
        protected initializationComplete: boolean;
        /**
         * This gets called as a grouped callback.
         */
        protected initialize(forceRefresh?: boolean): void;
        /**
         * Gets the root node of the attribute hierarchy.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
    }
}
declare module weavejs.data.source {
    class GeoJSONDataSourceData {
        constructor(obj?: Object, keyType?: string, keyPropertyName?: string);
        /**
         * The projection specified in the GeoJSON object.
         */
        projection: string;
        /**
         * An Array of "id" values corresponding to the GeoJSON features.
         */
        ids: any[];
        /**
         * An Array of "geometry" objects corresponding to the GeoJSON features.
         */
        geometries: any[];
        /**
         * An Array of "properties" objects corresponding to the GeoJSON features.
         */
        properties: any[];
        /**
         * A list of property names found in the jsonProperties objects.
         */
        propertyNames: any[];
        /**
         * propertyName -> typeof
         */
        propertyTypes: Object;
        /**
         * An Array of IQualifiedKey objects corresponding to the GeoJSON features.
         * This can be reinitialized via resetQKeys().
         */
        qkeys: any[];
        /**
         * Updates the qkeys Vector using the given keyType and property values under the given property name.
         * If the property name is not found, index values will be used.
         * @param keyType The keyType of each IQualifiedKey.
         * @param propertyName The name of a property in the propertyNames Array.
         */
        resetQKeys(keyType: string, propertyName: string): void;
    }
}
declare module weavejs.data.source {
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    class GeoJSONDataSourceNode implements IWeaveTreeNode, IColumnReference {
        constructor(source?: IDataSource, metadata?: Object, children?: any[], idFields?: any[]);
        equals(other: IWeaveTreeNode): boolean;
        getLabel(): string;
        isBranch(): boolean;
        hasChildBranches(): boolean;
        getChildren(): any[];
        getDataSource(): IDataSource;
        getColumnMetadata(): {
            [name: string]: string;
        };
    }
}
declare module weavejs.data.source {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IDataSourceWithAuthentication = weavejs.api.data.IDataSourceWithAuthentication;
    import IDataSource_Service = weavejs.api.data.IDataSource_Service;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    import EntityCache = weavejs.net.EntityCache;
    /**
     * WeaveDataSource is an interface for retrieving columns from Weave data servlets.
     *
     * @author adufilie
     */
    class WeaveDataSource extends AbstractDataSource implements IDataSource_Service, IDataSourceWithAuthentication {
        static debug: boolean;
        constructor();
        isLocal: boolean;
        url: LinkableString;
        hierarchyURL: LinkableString;
        rootId: LinkableVariable;
        /**
         * Provided for backwards compatibility - setting this will override the server setting.
         */
        idFields: LinkableVariable;
        /**
         * @inheritDoc
         */
        authenticationSupported: boolean;
        /**
         * @inheritDoc
         */
        authenticationRequired: boolean;
        /**
         * @inheritDoc
         */
        authenticatedUser: string;
        /**
         * @inheritDoc
         */
        authenticate(user: string, pass: string): void;
        entityCache: EntityCache;
        protected refreshHierarchy(): void;
        /**
         * Gets the root node of the attribute hierarchy.
         */
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        /**
         * This function prevents url.value from being null.
         */
        serverVersion: string;
        /**
         * This gets called as a grouped callback when the session state changes.
         */
        protected initialize(forceRefresh?: boolean): void;
        protected initializationComplete: boolean;
        generateNewAttributeColumn(metadata: Object): IAttributeColumn;
        static ENTITY_ID: string;
        /**
         * @inheritDoc
         */
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
    }
}
declare module weavejs.data.source {
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    class WebSocketDataSource extends AbstractDataSource {
        static DATA_COLUMNNAME_META: string;
        constructor();
        keyType: LinkableString;
        keyProperty: LinkableString;
        keepLast: LinkableNumber;
        url: LinkableString;
        protected initialize(forceRefresh?: boolean): void;
        sendMessage(payload: Object): void;
        reconnect(): void;
        getPropertyNames(): Array<string>;
        /**
         * The session state maps a column name in dataColumns hash map to a value for its "aggregation" metadata.
         */
        aggregationModes: ILinkableVariable;
        getHierarchyRoot(): IWeaveTreeNode & weavejs.api.data.IColumnReference;
        protected generateHierarchyNode(metadata: Object): IWeaveTreeNode;
        protected requestColumnFromSource(proxyColumn: ProxyColumn): void;
    }
}
declare module weavejs.geom {
    /**
     * BLGNode
     * Binary Line Generalization Tree Node
     * This class defines a structure to represent a streamed polygon vertex.
     *
     * Reference: van Oosterom, P. 1990. Reactive data structures
     *  for geographic information systems. PhD thesis, Department
     *  of Computer Science, Leiden University, The Netherlands.
     *
     *
     * @author adufilie
     */
    class BLGNode {
        constructor(index?: number, importance?: number, x?: number, y?: number);
        /**
         * These properties are made public for speed concerns, though they should not be modified.
         */
        index: number;
        importance: number;
        x: number;
        y: number;
        left: BLGNode;
        right: BLGNode;
    }
}
declare module weavejs.geom {
    /**
     * Binary Line Generalization Tree
     * This class defines a structure to represent a streamed polygon.
     *
     * Reference: van Oosterom, P. 1990. Reactive data structures
     *  for geographic information systems. PhD thesis, Department
     *  of Computer Science, Leiden University, The Netherlands.
     *
     *
     * @author adufilie
     */
    class BLGTree {
        /**
         * Create an empty tree.
         */
        constructor();
        isEmpty: boolean;
        /**
         * Insert a new vertex into the BLGTree.
         */
        insert(index: number, importance: number, x: number, y: number): void;
        /**
         * This function performs an in-order traversal of nodes, skipping those
         * with importance &lt; minImportance.  The visit operation is to append the
         * current node to the traversalVector.
         * @param minImportance No points with importance less than this value will be returned.
         * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
         * @return A list of BLGNodes, ordered by point index.
         */
        getPointVector(minImportance?: number, visibleBounds?: Bounds2D): BLGNode[];
        /**
         * @param splitIndex An index to split the tree at.
         * @return A new BLGTree containing all the points whose index >= splitIndex.
         */
        splitAtIndex(splitIndex: number): BLGTree;
        /**
         * Removes all points from the BLGTree.
         */
        clear(): void;
    }
}
declare module weavejs.geom {
    /**
     * This is an all-static class for building Binary Line Generalization Trees.
     *
     * @author adufilie
     */
    class BLGTreeUtils {
        static METHOD_SORT: string;
        static METHOD_SAMPLE: string;
        static buildBLGTree(vertexChain: VertexChainLink, output: BLGTree, method?: string): void;
    }
}
declare module weavejs.geom {
    /**
     * Bounds2D provides a flexible interface to a Rectangle-like object.
     * The bounds values are stored as xMin,yMin,xMax,yMax instead of x,y,width,height
     * because information is lost when storing as width,height and it causes rounding
     * errors when using includeBounds() and includePoint(), depending on the order you
     * include multiple points.
     *
     * @author adufilie
     */
    class Bounds2D {
        /**
         * The default coordinates are all NaN so that includeCoords() will behave as expected after
         * creating an empty Bounds2D.
         * @param xMin The starting X coordinate.
         * @param yMin The starting Y coordinate.
         * @param xMax The ending X coordinate.
         * @param yMax The ending Y coordinate.
         */
        constructor(xMin?: number, yMin?: number, xMax?: number, yMax?: number);
        /**
         * These are the values defining the bounds.
         */
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
        getXMin(): number;
        getYMin(): number;
        getXMax(): number;
        getYMax(): number;
        setXMin(value: number): void;
        setYMin(value: number): void;
        setXMax(value: number): void;
        setYMax(value: number): void;
        /**
         * This function copies the bounds from another Bounds2D object.
         * @param A Bounds2D object to copy the bounds from.
         */
        copyFrom(other: Bounds2D): void;
        /**
         * This function makes a copy of the Bounds2D object.
         * @return An equivalent copy of this Bounds2D object.
         */
        cloneBounds(): Bounds2D;
        /**
         * For the x and y dimensions, this function swaps min and max values if min > max.
         */
        makeSizePositive(): void;
        /**
         * This function resets all coordinates to NaN.
         */
        reset(): void;
        /**
         * This function checks if any coordinates are undefined or infinite.
         * @return true if any coordinate is not a finite number.
         */
        isUndefined(): boolean;
        /**
         * This function checks if the Bounds2D is empty.
         * @return true if the width or height is 0, or is undefined.
         */
        isEmpty(): boolean;
        /**
         * This function compares the Bounds2D with another Bounds2D.
         * @param other Another Bounds2D to compare to
         * @return true if given Bounds2D is equivalent, even if values are undefined
         */
        equals(other: Bounds2D): boolean;
        /**
         * This function sets the four coordinates that define the bounds.
         * @param xMin The new xMin value.
         * @param yMin The new yMin value.
         * @param xMax The new xMax value.
         * @param yMax The new yMax value.
         */
        setBounds(xMin: number, yMin: number, xMax: number, yMax: number): void;
        /**
         * @param xMin_yMin_xMax_yMax An Array of four Numbers like [xMin, yMin, xMax, yMax]
         */
        setCoords(xMin_yMin_xMax_yMax: [number, number, number, number]): void;
        /**
         * @return [xMin, yMin, xMax, yMax]
         */
        getCoords(): [number, number, number, number];
        /**
         * This function sets the bounds coordinates using x, y, width and height values.
         * @param x The new xMin value.
         * @param y The new yMin value.
         * @param width The new width of the bounds.
         * @param height The new height of the bounds.
         */
        setRectangle(x: number, y: number, width: number, height: number): void;
        /**
         * This function copies the values from this Bounds2D object into a Rectangle object.
         * @param output A Rectangle to store the result in.
         * @param makeSizePositive If true, this will give the Rectangle positive width/height values.
         * @return Either the given output Rectangle, or a new Rectangle if none was specified.
         */
        getRectangle(output?: Rectangle, makeSizePositive?: boolean): Rectangle;
        /**
         * This function will expand this Bounds2D to include a point.
         * @param newPoint A point to include in this Bounds2D.
         */
        includePoint(newPoint: Point): void;
        /**
         * This function will expand this Bounds2D to include a point.
         * @param newX The X coordinate of a point to include in this Bounds2D.
         * @param newY The Y coordinate of a point to include in this Bounds2D.
         */
        includeCoords(newX: number, newY: number): void;
        /**
         * This function will expand this Bounds2D to include an X value.
         * @param newX The X coordinate to include in this Bounds2D.
         */
        includeX(newX: number): void;
        /**
         * This function will expand this Bounds2D to include a Y value.
         * @param newY The Y coordinate to include in this Bounds2D.
         */
        includeY(newY: number): void;
        /**
         * This function will expand this Bounds2D to include another Bounds2D.
         * @param otherBounds Another Bounds2D object to include within this Bounds2D.
         */
        includeBounds(otherBounds: Bounds2D): void;
        overlaps(other: Bounds2D, includeEdges?: boolean): boolean;
        /**
         * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
         * @param point A point to test.
         * @return A value of true if the point is contained within this Bounds2D.
         */
        containsPoint(point: Point): boolean;
        /**
         * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
         * @param x An X coordinate for a point.
         * @param y A Y coordinate for a point.
         * @return A value of true if the point is contained within this Bounds2D.
         */
        contains(x: number, y: number): boolean;
        /**
         * This function supports a Bounds2D object having negative width and height, unlike the Rectangle object
         * @param other Another Bounds2D object to check.
         * @return A value of true if the other Bounds2D is contained within this Bounds2D.
         */
        containsBounds(other: Bounds2D): boolean;
        /**
         * This function is used to determine which vertices of a polygon can be skipped when rendering within the bounds of this Bounds2D.
         * While iterating over vertices, test each one with this function.
         * If (firstGridTest &amp; secondGridTest &amp; thirdGridTest) is non-zero, then the second vertex can be skipped.
         * @param x The x-coordinate to test.
         * @param y The y-coordinate to test.
         * @return A value to be ANDed with other results of getGridTest().
         */
        getGridTest(x: number, y: number): number;
        /**
         * This function projects the coordinates of a Point object from this bounds to a
         * destination bounds. The specified point object will be modified to contain the result.
         * @param point The Point object containing coordinates to project.
         * @param toBounds The destination bounds.
         */
        projectPointTo(point: Point, toBounds: Bounds2D): void;
        /**
         * This function projects all four coordinates of a Bounds2D object from this bounds
         * to a destination bounds. The specified coords object will be modified to contain the result.
         * @param inputAndOutput A Bounds2D object containing coordinates to project.
         * @param toBounds The destination bounds.
         */
        projectCoordsTo(coords: Bounds2D, toBounds: Bounds2D): void;
        /**
         * This constrains a point to be within this Bounds2D. The specified point object will be modified to contain the result.
         * @param point The point to constrain.
         */
        constrainPoint(point: Point): void;
        /**
         * This constrains the center point of another Bounds2D to be overlapping the center of this Bounds2D.
         * The specified boundsToConstrain object will be modified to contain the result.
         * @param boundsToConstrain The Bounds2D objects to constrain.
         */
        constrainBoundsCenterPoint(boundsToConstrain: Bounds2D): void;
        /**
         * This function will reposition a bounds such that for the x and y dimensions of this
         * bounds and another bounds, at least one bounds will completely contain the other bounds.
         * The specified boundsToConstrain object will be modified to contain the result.
         * @param boundsToConstrain the bounds we want to constrain to be within this bounds
         * @param preserveSize if set to true, width,height of boundsToConstrain will remain the same
         */
        constrainBounds(boundsToConstrain: Bounds2D, preserveSize?: boolean): void;
        offset(xOffset: number, yOffset: number): void;
        getXRange(): [number, number];
        getYRange(): [number, number];
        setXRange(xMin: number, xMax: number): void;
        setYRange(yMin: number, yMax: number): void;
        setCenteredXRange(xCenter: number, width: number): void;
        setCenteredYRange(yCenter: number, height: number): void;
        setCenteredRectangle(xCenter: number, yCenter: number, width: number, height: number): void;
        /**
         * This function will set the width and height to the new values while keeping the
         * center point constant.  This function works with both positive and negative values.
         */
        centeredResize(width: number, height: number): void;
        getXCenter(): number;
        setXCenter(xCenter: number): void;
        getYCenter(): number;
        setYCenter(yCenter: number): void;
        /**
         * This function stores the xCenter and yCenter coordinates into a Point object.
         * @param value The Point object to store the xCenter and yCenter coordinates in.
         */
        getCenterPoint(output: Point): void;
        /**
         * This function will shift the bounds coordinates so that the xCenter and yCenter
         * become the coordinates in a specified Point object.
         * @param value The Point object containing the desired xCenter and yCenter coordinates.
         */
        setCenterPoint(value: Point): void;
        /**
         * This function will shift the bounds coordinates so that the xCenter and yCenter
         * become the specified values.
         * @param xCenter The desired value for xCenter.
         * @param yCenter The desired value for yCenter.
         */
        setCenter(xCenter: number, yCenter: number): void;
        /**
         * This function stores the xMin and yMin coordinates in a Point object.
         * @param output The Point to store the xMin and yMin coordinates in.
         */
        getMinPoint(output: Point): void;
        /**
         * This function sets the xMin and yMin values from a Point object.
         * @param value The Point containing new xMin and yMin coordinates.
         */
        setMinPoint(value: Point): void;
        /**
         * This function stores the xMax and yMax coordinates in a Point object.
         * @param output The Point to store the xMax and yMax coordinates in.
         */
        getMaxPoint(output: Point): void;
        /**
         * This function sets the xMax and yMax values from a Point object.
         * @param value The Point containing new xMax and yMax coordinates.
         */
        setMaxPoint(value: Point): void;
        /**
         * This function sets the xMin and yMin values.
         * @param x The new xMin coordinate.
         * @param y The new yMin coordinate.
         */
        setMinCoords(x: number, y: number): void;
        /**
         * This function sets the xMax and yMax values.
         * @param x The new xMax coordinate.
         * @param y The new yMax coordinate.
         */
        setMaxCoords(x: number, y: number): void;
        /**
         * This is equivalent to ObjectUtil.numericCompare(xMax, xMin)
         */
        getXDirection(): number;
        /**
         * This is equivalent to ObjectUtil.numericCompare(yMax, yMin)
         */
        getYDirection(): number;
        /**
         * The width of the bounds is defined as xMax - xMin.
         */
        getWidth(): number;
        /**
         * The height of the bounds is defined as yMax - yMin.
         */
        getHeight(): number;
        /**
         * This function will set the width by adjusting the xMin and xMax values relative to xCenter.
         * @param value The new width value.
         */
        setWidth(value: number): void;
        /**
         * This function will set the height by adjusting the yMin and yMax values relative to yCenter.
         * @param value The new height value.
         */
        setHeight(value: number): void;
        /**
         * Area is defined as the absolute value of width * height.
         * @return The area of the bounds.
         */
        getArea(): number;
        /**
         * The xCoverage is defined as the absolute value of the width.
         * @return The xCoverage of the bounds.
         */
        getXCoverage(): number;
        /**
         * The yCoverage is defined as the absolute value of the height.
         * @return The yCoverage of the bounds.
         */
        getYCoverage(): number;
        /**
         * The xNumericMin is defined as the minimum of xMin and xMax.
         * @return The numeric minimum x coordinate.
         */
        getXNumericMin(): number;
        /**
         * The yNumericMin is defined as the minimum of yMin and yMax.
         * @return The numeric minimum y coordinate.
         */
        getYNumericMin(): number;
        /**
         * The xNumericMax is defined as the maximum of xMin and xMax.
         * @return The numeric maximum x coordinate.
         */
        getXNumericMax(): number;
        /**
         * The xNumericMax is defined as the maximum of xMin and xMax.
         * @return The numeric maximum y coordinate.
         */
        getYNumericMax(): number;
        /**
         * This function returns a String suitable for debugging the Bounds2D coordinates.
         * @return A String containing the coordinates of the bounds.
         */
        toString(): string;
    }
}
declare module weavejs.geom {
    import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
    /**
     * GeneralizedGeometry
     * A generalized geometry is one that lends itself to be displayed at different quality levels.
     * The geometry coordinates may be inserted individually through the "coordinates" property,
     * or they can all be processed at once through the setCoordinates() function.
     * The bounds object is separate from the coordinates, so if coordinates are inserted individually,
     * the bounds object should be updated accordingly if you want it to be accurate.
     *
     * @author adufilie
     */
    class GeneralizedGeometry {
        /**
         * Create an empty geometry.
         * @param geomType The type of the geometry (GeometryType.LINE, GeometryType.POINT, or GeometryType.POLYGON).
         */
        constructor(geomType?: string);
        /**
         * Derives GeneralizedGeometry objects from a GeoJSON geometry object.
         * @param geoJsonGeom A GeoJSON geometry object.
         * @return An array of GeneralizedGeometry objects
         */
        static fromGeoJson(geoJsonGeom: Object): Array<GeneralizedGeometry>;
        /**
         * Generates a GeoJson Geometry object.
         * @param minImportance No points with importance less than this value will be returned.
         * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
         * @return A GeoJson Geometry object, or null if there are no coordinates.
         */
        toGeoJson(minImportance?: number, visibleBounds?: Bounds2D): Object;
        /**
         * This is a bounding box for the geometry.
         * It is useful for spatial indexing when not all the points are available yet.
         */
        bounds: Bounds2D;
        /**
         * This is the type of the geometry.  Value should be one of the static geometry types listed in this class.
         */
        geomType: string;
        /**
         * geometry types
         */
        isLine(): boolean;
        isPoint(): boolean;
        isPolygon(): boolean;
        /**
         * @return true if the geometry has no information on its individual coordinates.
         */
        isEmpty: boolean;
        /**
         * @param minImportance No points with importance less than this value will be returned.
         * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
         * @return An Array of ISimpleGeometry objects
         * @see weave.api.data.ISimpleGeometry
         */
        getSimpleGeometries(minImportance?: number, visibleBounds?: Bounds2D, output?: any[]): Array<ISimpleGeometry>;
        /**
         * @param minImportance No points with importance less than this value will be returned.
         * @param visibleBounds If not null, this bounds will be used to remove unnecessary offscreen points.
         * @return A vector of results from BLGTree.getPointVector(minImportance, visibleBounds) from each part.
         */
        getSimplifiedGeometry(minImportance?: number, visibleBounds?: Bounds2D): BLGNode[][];
        /**
         * Inserts a new point into the appropriate part of the geometry.
         */
        addPoint(vertexID: number, importance: number, x: number, y: number): void;
        /**
         * Specifies a range of vertexIDs that correspond to a single part.
         * @param beginIndex The index of the first vertex of a geometry part.
         * @param endIndex The index after the last vertex of the geometry part.
         */
        addPartMarker(beginIndex: number, endIndex: number): void;
        /**
         * If necessary, this will split a BLGTree for a particular part into two and update the partMarkers.
         */
        /**
         * This function assigns importance values to a list of coordinates and replaces the contents of the BLGTree.
         * @param xyCoordinates An array of Numbers, even index values being x coordinates and odd index values being y coordinates.
         *                      To indicate part markers, use a sequence of two NaN values.
         */
        setCoordinates(xyCoordinates: Array<number>, method?: string): void;
    }
}
declare module weavejs.geom {
    class GeoJSON {
        static P_TYPE: string;
        static P_CRS: string;
        static P_BBOX: string;
        static G_P_COORDINATES: string;
        static GC_P_GEOMETRIES: string;
        static F_P_ID: string;
        static F_P_GEOMETRY: string;
        static F_P_PROPERTIES: string;
        static CRS_P_TYPE: string;
        static CRS_P_PROPERTIES: string;
        static CRS_T_NAME: string;
        static CRS_T_LINK: string;
        static CRS_N_P_NAME: string;
        static CRS_L_P_HREF: string;
        static CRS_L_P_TYPE: string;
        static FC_P_FEATURES: string;
        static T_POINT: string;
        static T_MULTI_POINT: string;
        static T_LINE_STRING: string;
        static T_MULTI_LINE_STRING: string;
        static T_POLYGON: string;
        static T_MULTI_POLYGON: string;
        static T_GEOMETRY_COLLECTION: string;
        static T_FEATURE: string;
        static T_FEATURE_COLLECTION: string;
        static isGeoJSONObject(obj: Object, ..._: any[]): boolean;
        static isFeatureObject(obj: Object, ..._: any[]): boolean;
        static isFeatureCollectionObject(obj: Object, ..._: any[]): boolean;
        static isGeometryObject(obj: Object, ..._: any[]): boolean;
        /**
         * Wraps a GeoJSON object in a GeoJSON FeatureCollection object if it isn't one already.
         * @param obj A GeoJSON object.
         * @return A GeoJSON FeatureCollection object.
         */
        static asFeatureCollection(obj: Object, ..._: any[]): Object;
        /**
         * Combines an Array of GeoJson Geometry objects into a single "Multi" Geometry object.
         * This assumes all geometry objects are of the same type.
         * @param geoms An Array of GeoJson Geometry objects sharing a common type.
         * @return A single GeoJson Geometry object with type MultiPoint/MultiLineString/MultiPolygon
         */
        static getMultiGeomObject(geoms: any[]): Object;
        static getProjectionFromURN(ogc_crs_urn: string): string;
    }
}
declare module weavejs.geom {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Bounds2D = weavejs.geom.Bounds2D;
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * This class provides functions for parsing a binary geometry stream.
     * The callbacks for this object get called when all queued decoding completes.
     *
     * Throughout the code, an ID refers to an integer value, while a Key is a string value.
     * Binary format:
     *   tile descriptor format: [float minImportance, float maxImportance, double xMin, double yMin, double xMax, double yMax]
     *       stream tile format: [int negativeTileID, negative streamVersion or binary stream object beginning with positive int, ...]
     *   metadata stream object: [int geometryID, String geometryKey, '\0', double xMin, double yMin, double xMax, double yMax, int vertexID1, ..., int vertexID(n), int -1 if no shapeType follows or -2 if shapeType follows, int optionalShapeType]
     *   geometry stream object: [int geometryID1, int vertexID1, ..., int geometryID(n-1), int vertexID(n-1), int geometryID(n), int negativeVertexID(n), double x, double y, float importance]
     *   geometry stream marker: [int geometryID1, int vertexID1, ..., int geometryID(n), int vertexID(n), int -1]
     *   geometry stream marker: [int geometryID, int vertexID_begin, int -2, int vertexID_end]
     *
     * @author adufilie
     */
    class GeometryStreamDecoder implements ILinkableObject {
        static debug: boolean;
        totalGeomTiles: number;
        totalVertices: number;
        constructor();
        /**
         * This is an Array of GeneralizedGeometry objects that have been decoded from a stream.
         */
        geometries: any[];
        /**
         * This is the bounding box containing all tile boundaries.
         */
        collectiveBounds: Bounds2D;
        /**
         * This function sets the keyType of the keys that will be
         * added as a result of downloading the geometries.
         */
        keyType: string;
        /**
         * This is the set of geometry keys that have been decoded so far.
         */
        keys: any[];
        /**
         * These callbacks get called when the keys or bounds change.
         */
        metadataCallbacks: ICallbackCollection;
        /**
         * @param geometryKey A String identifier.
         * @return An Array of GeneralizedGeometry objects with keys matching the specified key.
         */
        getGeometriesFromKey(geometryKey: IQualifiedKey): any[];
        /**
         * These functions return an array of tiles that need to be downloaded in
         * order for shapes to be displayed at the given importance (quality) level.
         * Tiles that have already been decoded from a stream will not be returned.
         * @return A list of tiles, sorted descending by maxImportance.
         */
        getRequiredMetadataTileIDs(bounds: Bounds2D, minImportance: number, removeTilesFromList: boolean): any[];
        getRequiredGeometryTileIDs(bounds: Bounds2D, minImportance: number, removeTilesFromList: boolean): any[];
        /**
         * This function will decode a tile list stream.
         * @param stream A list of metadata tiles encoded in a ByteArray stream.
         */
        decodeMetadataTileList(stream: JSByteArray): void;
        /**
         * This function will decode a tile list stream.
         * @param stream A list of geometry tiles encoded in a ByteArray stream.
         */
        decodeGeometryTileList(stream: JSByteArray): void;
        /**
         * This extracts metadata from a ByteArray.
         * Callbacks are triggered when all active decoding tasks are completed.
         */
        decodeMetadataStream(stream: JSByteArray): void;
        /**
         * This extracts points from a ByteArray.
         * Callbacks are triggered when all active decoding tasks are completed.
         */
        decodeGeometryStream(stream: JSByteArray): void;
    }
}
declare module weavejs.geom {
    class GeometryType {
        static POINT: string;
        static LINE: string;
        static POLYGON: string;
        static fromGeoJsonType(type: string): string;
        static toGeoJsonType(type: string, multi: boolean): string;
        static fromPostGISType(postGISType: number): string;
    }
}
declare module weavejs.geom {
    /**
     * This class defines a single node for a KDTree.  It corresponds to a splitting
     * plane in a single dimension and maps a k-dimensional key to an object.
     * This class should not be used outside the KDTree class definition.
     *
     * @author adufilie
     */
    class KDNode<T> {
        /**
         * The dimension that the splitting plane is defined on
         * This property is made public for speed concerns, though it should not be modified.
         */
        splitDimension: number;
        /**
         * The location of the splitting plane, derived from splitDimension
         * This property is made public for speed concerns, though it should not be modified.
         */
        location: number;
        /**
         * This function does what the name says.  It can be used for tree balancing algorithms.
         * @param value the new split dimension
         */
        clearChildrenAndSetSplitDimension(value?: number): void;
        /**
         * The numbers in K-Dimensions used to locate the object
         */
        key: Array<number>;
        /**
         * The object that is associated with the key
         */
        object: T;
        /**
         * Child node corresponding to the left side of the splitting plane
         */
        left: KDNode<T>;
        /**
         * Child node corresponding to the right side of the splitting plane
         */
        right: KDNode<T>;
        /**
         * An Array of additional nodes having identical keys
         */
        siblings: Array<KDNode<T>>;
    }
}
declare module weavejs.geom {
    /**
     * This class defines a K-Dimensional Tree.
     *
     * @author adufilie
     */
    class KDTree<T> {
        /**
         * Constructs an empty KDTree with the given dimensionality.
         *
         * TODO: add parameter for an Array of key,object pairs and create a balanced tree from those.
         */
        constructor(dimensionality?: number);
        /**
         * The number of nodes in the tree.
         */
        nodeCount: number;
        /**
         * If this is true, the tree will automatically balance itself when queried after nodes are inserted.
         *
         * NOTE: Balancing a large tree is very slow, so this will not give any benefit if the tree changes often.
         */
        autoBalance: boolean;
        /**
         * Balance the tree so there are an (approximately) equal number of points
         * on either side of any given node. A balanced tree yields faster query
         * times compared to an unbalanced tree.
         *
         * NOTE: Balancing a large tree is very slow, so this should not be called very often.
         */
        balance(): void;
        /**
         * This function inserts a new key,object pair into the KDTree.
         * Warning: This function could cause the tree to become unbalanced and degrade performance.
         * @param key The k-dimensional key that corresponds to the object.
         * @param object The object to insert in the tree.
         * @return A KDNode object that can be used as a parameter to the remove() function.
         */
        insert(key: Array<number>, obj: T): KDNode<T>;
        /**
         * Remove a single node from the tree.
         * @param node The node to remove from the tree.
         */
        remove(node: KDNode<T>): void;
        /**
         * Remove all nodes from the tree.
         */
        clear(): void;
        /**
         * Use these values for the sortDirection parameter of queryRange().
         */
        static ASCENDING: string;
        static DESCENDING: string;
        /**
         * @param minKey The minimum key values allowed for results of this query
         * @param maxKey The maximum key values allowed for results of this query
         * @param boundaryInclusive Specify whether to include the boundary for the query
         * @param sortDimension Specify an integer >= 0 for the dimension to sort by
         * @param sortDirection Specify either ASCENDING or DESCENDING
         * @return An array of pointers to objects with K-Dimensional keys that fall between minKey and maxKey.
         */
        queryRange(minKey: Array<number>, maxKey: Array<number>, boundaryInclusive?: boolean, sortDimension?: number, sortDirection?: string): Array<T>;
    }
}
declare module weavejs.geom {
    import LinkableVariable = weavejs.core.LinkableVariable;
    /**
     * This is a linkable version of a Bounds2D object.
     *
     * @author adufilie
     */
    class LinkableBounds2D extends LinkableVariable {
        setBounds(xMin: number, yMin: number, xMax: number, yMax: number): void;
        copyFrom(sourceBounds: Bounds2D): void;
        copyTo(destinationBounds: Bounds2D): void;
    }
}
declare module weavejs.geom {
    /**
     * This class defines a 1-dimensional continuous range of values by begin and end values.
     * The difference between the begin and end values can be either positive or negative.
     *
     * @author adufilie
     */
    class NumericRange {
        constructor(begin?: number, end?: number);
        /**
         * The begin and end values define the range of values covered by this Range object.
         * The difference between begin and end can be either positive or negative.
         */
        begin: number;
        end: number;
        /**
         * @param value A number within this Range
         * @return A number in the range [0,1]
         */
        normalize(value: number): number;
        /**
         * @param A number in the range [0,1]
         * @return A number within this Range
         */
        denormalize(value: number): number;
        /**
         * This is the minimum value of the range.
         */
        min: number;
        /**
         * This is the maximum value of the range.
         */
        max: number;
        /**
         * The coverage of a Range is defined by the positive distance
         * from the min numeric value to the max numeric value.
         */
        coverage: number;
        /**
         * @param begin The new begin value.
         * @param end The new end value.
         */
        setRange(begin: number, end: number): void;
        /**
         * This will shift the begin and end values by a delta value.
         */
        offset(delta: number): void;
        /**
         * This function will constrain a value to be within this Range.
         * @return A number contained in this Range.
         */
        constrain(value: number): number;
        /**
         * @param value A number to check
         * @return true if the given value is within this Range
         */
        contains(value: number): boolean;
        /**
         * @param value A number to check
         * @return -1 if value &lt; min, 1 if value &gt; max, 0 if min &lt;= value &lt;= max, or NaN otherwise
         */
        compare(value: number): number;
        /**
         * This function will reposition another Range object
         * such that one range will completely contain the other.
         * @param rangeToConstrain The range to be repositioned.
         * @param allowShrinking If set to true, the rangeToConstrain may be resized to fit within this range.
         */
        constrainRange(rangeToConstrain: NumericRange, allowShrinking?: boolean): void;
        /**
         * This function will expand the range as necessary to include the specified value.
         * @param value The value to include in the range.
         */
        includeInRange(value: number): void;
        toString(): string;
    }
}
declare module weavejs.geom {
    class Point {
        constructor(x?: number, y?: number);
        x: number;
        y: number;
        static distance(p1: Point, p2: Point): number;
        static interpolate(p1: Point, p2: Point, percentage: number): Point;
    }
}
declare module weavejs.geom {
    /**
     * This class defines a 1-dimensional continuous range of values by begin and end values.
     * The difference between the begin and end values can be either positive or negative.
     *
     * @author adufilie
     */
    class Range {
        constructor(begin?: number, end?: number);
        /**
         * The begin and end values define the range of values covered by this Range object.
         * The difference between begin and end can be either positive or negative.
         */
        begin: number;
        end: number;
        /**
         * @param value A number within this Range
         * @return A number in the range [0,1]
         */
        normalize(value: number): number;
        /**
         * @param A number in the range [0,1]
         * @return A number within this Range
         */
        denormalize(value: number): number;
        /**
         * This is the minimum value of the range.
         */
        min: number;
        /**
         * This is the maximum value of the range.
         */
        max: number;
        /**
         * The coverage of a Range is defined by the positive distance
         * from the min numeric value to the max numeric value.
         */
        coverage: number;
        /**
         * @param begin The new begin value.
         * @param end The new end value.
         */
        setRange(begin: number, end: number): void;
        /**
         * This will shift the begin and end values by a delta value.
         */
        offset(delta: number): void;
        /**
         * This function will constrain a value to be within this Range.
         * @return A number contained in this Range.
         */
        constrain(value: number): number;
        /**
         * @param value A number to check
         * @return true if the given value is within this Range
         */
        contains(value: number): boolean;
        /**
         * @param value A number to check
         * @return -1 if value &lt; min, 1 if value &gt; max, 0 if min &lt;= value &lt;= max, or NaN otherwise
         */
        compare(value: number): number;
        /**
         * This function will reposition another Range object
         * such that one range will completely contain the other.
         * @param rangeToConstrain The range to be repositioned.
         * @param allowShrinking If set to true, the rangeToConstrain may be resized to fit within this range.
         */
        constrainRange(rangeToConstrain: Range, allowShrinking?: boolean): void;
        /**
         * This function will expand the range as necessary to include the specified value.
         * @param value The value to include in the range.
         */
        includeInRange(value: number): void;
        toString(): string;
    }
}
declare module weavejs.geom {
    class Rectangle {
        constructor(x?: number, y?: number, width?: number, height?: number);
        x: number;
        y: number;
        width: number;
        height: number;
    }
}
declare module weavejs.geom {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import JSByteArray = weavejs.util.JSByteArray;
    /**
     * The callbacks for this object get called when all queued decoding completes.
     *
     * @author adufilie
     * @author awilkins
     */
    class ShpFileReader implements ILinkableObject {
        geoms: any[];
        geomsReady: boolean;
        constructor(shpData?: JSByteArray);
    }
}
declare module weavejs.geom {
    import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
    /**
     * This class acts as a wrapper for a general polygon.
     *
     * @author kmonico
     */
    class SimpleGeometry implements ISimpleGeometry {
        /**
         * @param type One of the constants defined in GeometryType.
         * @param points An optional Array of Objects to pass to setVertices().
         * @see weave.primitives.GeometryType
         * @see #setVertices()
         */
        constructor(type?: string, points?: any[]);
        /**
         * Gets the points of the geometry.
         * @return An Array of objects, each having "x" and "y" properties.
         */
        getVertices(): any[];
        /**
         * Initializes the geometry.
         * @param points An Array of objects, each having "x" and "y" properties.
         */
        setVertices(points: any[]): void;
        isPolygon(): boolean;
        isLine(): boolean;
        isPoint(): boolean;
        bounds: Bounds2D;
        /**
         * A static helper function to convert a bounds object into an ISimpleGeometry object.
         *
         * @param bounds The bounds to transform.
         * @return A new ISimpleGeometry object.
         */
        static getNewGeometryFromBounds(bounds: Bounds2D): ISimpleGeometry;
    }
}
declare module weavejs.geom {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    class TempHack_SolidFillStyle implements ILinkableObject {
        /**
         * Used to enable or disable fill patterns.
         */
        enable: LinkableBoolean;
        /**
         * These properties are used with a basic Graphics.setFill() function call.
         */
        color: AlwaysDefinedColumn;
        alpha: AlwaysDefinedColumn;
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordFormat: Object;
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordType: Object;
        getStyle(key: IQualifiedKey): {
            color: number;
            alpha: number;
        };
    }
}
declare module weavejs.geom {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import NormalizedColumn = weavejs.data.column.NormalizedColumn;
    class TempHack_SolidLineStyle implements ILinkableObject {
        constructor();
        enable: LinkableBoolean;
        color: AlwaysDefinedColumn;
        weight: AlwaysDefinedColumn;
        alpha: AlwaysDefinedColumn;
        caps: AlwaysDefinedColumn;
        joints: AlwaysDefinedColumn;
        miterLimit: AlwaysDefinedColumn;
        normalizedWeightColumn: NormalizedColumn;
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordFormat: Object;
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordType: Object;
        getStyle(key: IQualifiedKey): {
            color: number;
            weight: number;
            alpha: number;
            caps: string;
            joints: string;
            miterLimit: number;
        };
    }
}
declare module weavejs.geom {
    class TileDescriptor {
        constructor(kdKey?: any[], tileID?: number);
        kdKey: any[];
        tileID: number;
        exclude: boolean;
    }
}
declare module weavejs.geom {
    /**
     * VertexChainLink
     * @author adufilie
     */
    class VertexChainLink {
        constructor(vertexID?: number, x?: number, y?: number);
        initialize(vertexID: number, x: number, y: number): void;
        vertexID: number;
        x: number;
        y: number;
        importance: number;
        prev: VertexChainLink;
        next: VertexChainLink;
        importanceIsValid: boolean;
        /**
         * insert
         * Adds a new vertex to the end of the chain.
         */
        insert(newVertex: VertexChainLink): void;
        /**
         * equals2D
         * Returns true if x and y are equal between two VertexChainLink objects.
         */
        equals2D(other: VertexChainLink): boolean;
        /**
         * removeFromChain
         * Updates prev and next pointers on adjacent VertexChainLinks so this link is removed.
         */
        removeFromChain(): void;
        /**
         * promoteAndInvalidateImportance
         * @param minImportance If the importance value of this vertex is less than minImportance, it will be set to minImportance.
         */
        /**
         * updateImportance
         * This function re-calculates the importance of the current point.
         * It may only increase the importance, not decrease it.
         */
        validateImportance(): void;
        static getUnusedInstance(vertexID: number, x: number, y: number): VertexChainLink;
        static saveUnusedInstance(vertex: VertexChainLink): void;
        static clearUnusedInstances(): void;
        /**
         * The importance property name.
         */
        static IMPORTANCE: string;
    }
}
declare module weavejs.geom {
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    /**
     * This object defines the data bounds of a visualization, either directly with
     * absolute coordinates or indirectly with center coordinates and area.
     * Screen coordinates are never directly specified in the session state.
     *
     * @author adufilie
     */
    class ZoomBounds implements ILinkableVariable {
        constructor();
        /**
         * The session state has two modes: absolute coordinates and centered area coordinates.
         * @return The current session state.
         */
        getSessionState(): Object;
        /**
         * The session state can be specified in two ways: absolute coordinates and centered area coordinates.
         * @param The new session state.
         */
        setSessionState(state: Object): void;
        /**
         * This function will copy the internal dataBounds to another IBounds2D.
         * @param outputScreenBounds The destination.
         */
        getDataBounds(outputDataBounds: Bounds2D): void;
        /**
         * This function will copy the internal screenBounds to another IBounds2D.
         * @param outputScreenBounds The destination.
         */
        getScreenBounds(outputScreenBounds: Bounds2D): void;
        /**
         * This will project a Point from data coordinates to screen coordinates.
         * @param inputAndOutput The Point object containing output coordinates.  Reprojected coordinates will be stored in this same Point object.
         */
        projectDataToScreen(inputAndOutput: Point): void;
        /**
         * This will project a Point from screen coordinates to data coordinates.
         * @param inputAndOutput The Point object containing output coordinates.  Reprojected coordinates will be stored in this same Point object.
         */
        projectScreenToData(inputAndOutput: Point): void;
        /**
         * This function will set all the information required to define the session state of the ZoomBounds.
         * @param dataBounds The data range of a visualization.
         * @param screenBounds The pixel range of a visualization.
         * @param useFixedAspectRatio Set this to true if you want to maintain an identical x and y data-per-pixel ratio.
         */
        setBounds(dataBounds: Bounds2D, screenBounds: Bounds2D, useFixedAspectRatio: boolean): void;
        /**
         * This function will zoom to the specified dataBounds and fix the aspect ratio if necessary.
         * @param dataBounds The bounds to zoom to.
         * @param zoomOutIfNecessary Set this to true if you are using a fixed aspect ratio and you want the resulting fixed bounds to be expanded to include the specified dataBounds.
         */
        setDataBounds(dataBounds: Bounds2D, zoomOutIfNecessary?: boolean): void;
        /**
         * This function will update the screenBounds and fix the aspect ratio of the dataBounds if necessary.
         * @param screenBounds The new screenBounds.
         * @param useFixedAspectRatio Set this to true if you want to maintain an identical x and y data-per-pixel ratio.
         */
        setScreenBounds(screenBounds: Bounds2D, useFixedAspectRatio: boolean): void;
        /**
         * A scale of N means there is an N:1 correspondance of pixels to data coordinates.
         */
        getXScale(): number;
        /**
         * A scale of N means there is an N:1 correspondance of pixels to data coordinates.
         */
        getYScale(): number;
    }
}
declare module weavejs.net {
    import WeavePromise = weavejs.util.WeavePromise;
    class AMF3Servlet extends Servlet {
        /**
         * @param servletURL The URL of the servlet (everything before the question mark in a URL request).
         * @param invokeImmediately Set this to false if you don't want the ProxyAsyncTokens created by invokeAsyncMethod() to be invoked automatically.
         */
        constructor(servletURL?: string, invokeImmediately?: boolean);
        /**
         * If <code>invokeImmediately</code> was set to false in the constructor, this will invoke a deferred request.
         */
        invokeDeferred(promise: WeavePromise<any>): void;
    }
}
declare module weavejs.net {
    import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
    class Admin {
        static instance: Admin;
        static service: WeaveAdminService;
        static entityCache: EntityCache;
        service: WeaveAdminService;
        /**
         * This is an entity id on which editors should focus, or -1 if none.
         * It will be set to the newest entity that was created by the administrator.
         * After an editor has focused on the entity, clearFocusEntityId() should be called.
         */
        getFocusEntityId(): number;
        setFocusEntityId(id: number): void;
        clearFocusEntityId(): void;
        entityCache: EntityCache;
        databaseConfigExists: boolean;
        currentUserIsSuperuser: boolean;
        userHasAuthenticated: boolean;
        connectionNames: any[];
        weaveFileNames: any[];
        privateWeaveFileNames: any[];
        keyTypes: any[];
        databaseConfigInfo: DatabaseConfigInfo;
        /**
         * An Array of WeaveFileInfo objects.
         * @see weave.services.beans.WeaveFileInfo
         */
        uploadedCSVFiles: any[];
        /**
         * An Array of WeaveFileInfo objects.
         * @see weave.services.beans.WeaveFileInfo
         */
        uploadedShapeFiles: any[];
        constructor();
        activeConnectionName: string;
        activePassword: string;
        getSuggestedPropertyValues(propertyName: string): any[];
    }
}
declare module weavejs.net {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObjectWithBusyStatus = weavejs.api.core.ILinkableObjectWithBusyStatus;
    import AMF3Servlet = weavejs.net.AMF3Servlet;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * this class contains functions that handle a queue of remote procedure calls
     *
     * @author adufilie
     */
    class AsyncInvocationQueue implements ILinkableObjectWithBusyStatus, IDisposableObject {
        static debug: boolean;
        /**
         * @param paused When set to true, no queries will be executed until begin() is called.
         */
        constructor(paused?: boolean);
        isBusy(): boolean;
        dispose(): void;
        /**
         * If the 'paused' constructor parameter was set to true, use this function to start invoking queued queries.
         */
        begin(): void;
        addToQueue(query: WeavePromise<any>, service: AMF3Servlet): void;
        protected performQuery(query: WeavePromise<any>): void;
        protected handleQueryResultOrFault(result: any, query: WeavePromise<any>): void;
    }
}
declare module weavejs.net {
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IWeaveEntityService = weavejs.api.net.IWeaveEntityService;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
    import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * Provides an interface to a set of cached Entity objects.
     */
    class EntityCache implements ILinkableObject, IDisposableObject {
        /**
         * A special flag value to represent a root node, which doesn't actually exist.
         */
        static ROOT_ID: number;
        /**
         * Creates an EntityCache.
         * @param service The entity service, which may or may not implement IWeaveEntityManagementService.
         * @param purgeMissingEntities Set this to true when entities may be deleted or created and ids previously deleted may be reused.
         */
        constructor(service?: IWeaveEntityService, purgeMissingEntities?: boolean);
        /**
         * Gets the IWeaveEntityService that was passed to the constructor.
         */
        getService(): IWeaveEntityService;
        /**
         * Checks if a specific parent-child relationship has been cached.
         * @param parentId The ID of the parent entity.
         * @param childId The ID of the child entity.
         * @return true if the relationship has been cached.
         */
        hasCachedRelationship(parentId: number, childId: number): boolean;
        /**
         * Invalidates a cached Entity object and optionally invalidates any related Entity objects.
         * @param id The entity ID.
         * @param alsoInvalidateRelatives Set this to true if any hierarchy relationships may have been altered.
         */
        invalidate(id: number, alsoInvalidateRelatives?: boolean): void;
        /**
         * Retrieves an Entity object given its ID.
         * @param id The entity ID.
         * @return The Entity object.
         */
        getEntity(id: number): Entity;
        /**
         * Checks if a particular Entity object is cached.
         * @param The entity ID.
         * @return true if the corresponding Entity object exists in the cache.
         */
        entityIsCached(id: number): boolean;
        /**
         * Calls getHierarchyInfo() in the IWeaveEntityService that was passed to the constructor and caches
         * the results when they come back.
         * @param publicMetadata Public metadata search criteria.
         * @return RPC token for an Array of EntityHierarchyInfo objects.
         * @see weavejs.api.net.IWeaveEntityService#getHierarchyInfo()
         */
        getHierarchyInfo(publicMetadata: Object): WeavePromise<EntityHierarchyInfo[]>;
        /**
         * Gets an Array of Entity objects which have previously been cached via getHierarchyInfo().
         * Entities of type 'table' and 'hierarchy' get cached automatically.
         * @param entityType Either 'table' or 'hierarchy'
         * @return An Array of Entity objects with the given type
         */
        getIdsByType(entityType: string): any[];
        /**
         * Gets an EntityHierarchyInfo object corresponding to an entity ID, to be used for displaying a hierarchy.
         * @param The entity ID.
         * @return The hierarchy info, or null if there is none.
         */
        getBranchInfo(id: number): EntityHierarchyInfo;
        /**
         * Invalidates all cached information.
         * @param purge If set to true, clears cache instead of just invalidating it.
         */
        invalidateAll(purge?: boolean): void;
        update_metadata(id: number, diff: EntityMetadata): void;
        add_category(title: string, parentId: number, index: number): void;
        delete_entity(id: number): void;
        add_child(parent_id: number, child_id: number, index: number): void;
        remove_child(parent_id: number, child_id: number): void;
        /**
         * Finds a series of Entity objects which can be traversed as a path from a root Entity to a descendant Entity.
         * @param root The root Entity.
         * @param descendant The descendant Entity.
         * @return An Array of Entity objects which can be followed as a path from the root to the descendant, including the root and the descendant.
         *         Returns null if the descendant is unreachable from the root.
         */
        getEntityPath(root: Entity, descendant: Entity): any[];
        dispose(): void;
    }
}
declare module weavejs.net {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeavePromise = weavejs.util.WeavePromise;
    class JsonCache implements ILinkableObject {
        static buildURL(base: string, params: Object): string;
        /**
         * @param requestHeaders Optionally set this to an Object mapping header names to values.
         */
        constructor(requestHeaders?: Object);
        clearCache(): void;
        /**
         * @param url The URL to get JSON data
         * @return The cached Object.
         */
        getJsonObject(url: string): Object;
        getJsonPromise(url: string): WeavePromise<any>;
    }
}
declare module weavejs.net {
    class Protocol {
        static URL_PARAMS: string;
        static COMPRESSED_AMF: string;
        static JSONRPC_2_0: string;
        static JSONRPC_2_0_AMF: string;
    }
}
declare module weavejs.net {
    class RequestMethod {
        static GET: string;
        static POST: string;
    }
}
declare module weavejs.net {
    class ResponseType {
        static UINT8ARRAY: string;
        static ARRAYBUFFER: string;
        static BLOB: string;
        static DOCUMENT: string;
        static JSON: string;
        static TEXT: string;
        static DATAURI: string;
    }
}
declare module weavejs.net {
    import IAsyncService = weavejs.api.net.IAsyncService;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * This is an IAsyncService interface for a servlet that takes its parameters from URL variables.
     *
     * @author adufilie
     */
    class Servlet implements IAsyncService {
        /**
         * WeavePromise -> [methodName, params, id]
         */
        protected map_promise_methodParamsId: Object;
        /**
         * @param servletURL The URL of the servlet (everything before the question mark in a URL request).
         * @param methodParamName This is the name of the URL parameter that specifies the method to be called on the servlet.
         * @param urlRequestDataFormat This is the format to use when sending parameters to the servlet.
         */
        constructor(servletURL?: string, methodVariableName?: string, protocol?: string);
        /**
         * This is the base URL of the servlet.
         * The base url is everything before the question mark in a url request like the following:
         *     http://www.example.com/servlet?param=123
         */
        servletURL: string;
        protected _servletURL: string;
        /**
         * This is the data format of the results from HTTP GET requests.
         */
        protected _protocol: string;
        protected _invokeLater: boolean;
        /**
         * This function makes a remote procedure call.
         * @param methodName The name of the method to call.
         * @param methodParameters The parameters to use when calling the method.
         * @return A WeavePromise generated for the call.
         */
        invokeAsyncMethod(methodName: string, methodParameters?: Object): WeavePromise<any>;
        /**
         * This function may be overrided to give different servlet URLs for different methods.
         * @param methodName The method.
         * @return The servlet url for the method.
         */
        protected getServletURLForMethod(methodName: string): string;
        /**
         * This will make a url request that was previously delayed.
         * @param promise A WeavePromise generated from a previous call to invokeAsyncMethod().
         */
        protected invokeNow(promise: WeavePromise<any>): void;
        /**
         * This function reads an object that has been AMF3-serialized into a ByteArray and compressed.
         * @param compressedSerializedObject The ByteArray that contains the compressed AMF3 serialization of an object.
         * @return The result of calling readObject() on the ByteArray, or null if the RPC returns void.
         * @throws Error if unable to read the result.
         */
        static readAmf3Object(bytes: Uint8Array): Object;
        static buildUrlWithParams(url: string, params: Object): string;
    }
}
declare module weavejs.net {
    class URLRequest {
        constructor(url?: string);
        /**
         * Either "get" or "post"
         * @default "get"
         */
        method: string;
        /**
         * The URL
         */
        url: string;
        /**
         * Specified if method is "post"
         */
        data: string;
        /**
         * Maps request header names to values
         */
        requestHeaders: Object;
        /**
         * Can be one of the constants defined in the ResponseType class.
         * @see weavejs.net.ResponseType
         */
        responseType: string;
        /**
         * Specifies the mimeType for the Data URI returned when responseType === "datauri".
         */
        mimeType: string;
    }
}
declare module weavejs.net {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IURLRequestUtils = weavejs.api.net.IURLRequestUtils;
    import WeavePromise = weavejs.util.WeavePromise;
    class URLRequestUtils implements IURLRequestUtils {
        request(relevantContext: Object, urlRequest: URLRequest): WeavePromise<any>;
        static LOCAL_FILE_URL_SCHEME: string;
        saveLocalFile(weaveRoot: ILinkableHashMap, fileName: string, byteArray: Uint8Array): string;
        getLocalFile(weaveRoot: ILinkableHashMap, fileName: string): Uint8Array;
        removeLocalFile(weaveRoot: ILinkableHashMap, fileName: string): void;
        getLocalFileNames(weaveRoot: ILinkableHashMap): any[];
    }
}
declare module weavejs.net {
    import IWeaveEntityManagementService = weavejs.api.net.IWeaveEntityManagementService;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
    import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
    import CallbackCollection = weavejs.core.CallbackCollection;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
    import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
    import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * The functions in this class correspond directly to Weave servlet functions written in Java.
     * This object uses a queue to guarantee that asynchronous servlet calls will execute in the order they are requested.
     * @author adufilie
     * @see WeaveServices/src/weave/servlets/AdminService.java
     * @see WeaveServices/src/weave/servlets/DataService.java
     */
    class WeaveAdminService implements IWeaveEntityManagementService {
        static WEAVE_AUTHENTICATION_EXCEPTION: string;
        static getInstance(url: string): WeaveAdminService;
        static messageLog: any[];
        static messageLogCallbacks: CallbackCollection;
        static messageDisplay(messageTitle: string, message: string, showPopup: boolean): void;
        static clearMessageLog(): void;
        /**
         * @param url The URL pointing to where a WeaveServices.war has been deployed.  Example: http://example.com/WeaveServices
         */
        constructor(url?: string);
        initialized: boolean;
        migrationProgress: string;
        entityServiceInitialized: boolean;
        authenticated: LinkableBoolean;
        user: string;
        pass: string;
        initializeAdminService(): WeavePromise<void>;
        /**
         * @param method A pointer to a function of this WeaveAdminService.
         * @param captureHandler Receives the parameters of the RPC call with the 'this' pointer set to the WeavePromise object.
         * @param resultHandler A ResultEvent handler:  function(event:ResultEvent, parameters:Array = null):void
         * @param faultHandler A FaultEvent handler:  function(event:FaultEvent, parameters:Array = null):void
         */
        addHook(method: Function, captureHandler: Function, resultHandler: Function, faultHandler?: Function): void;
        /**
         * Prevents the default error display if a fault occurs.
         * @param query A WeavePromise<any> that was generated by this service.
         */
        hideFaultMessage(query: WeavePromise<any>): void;
        getVersion(): WeavePromise<string>;
        checkDatabaseConfigExists(): WeavePromise<boolean>;
        getAuthenticatedUser(): WeavePromise<string>;
        authenticate(user: string, pass: string): WeavePromise<boolean>;
        keepAlive(): WeavePromise<void>;
        getWeaveFileNames(showAllFiles: boolean): WeavePromise<string[]>;
        saveWeaveFileByteArray(fileContent: Uint8Array, fileName: string, overwriteFile: boolean): WeavePromise<string>;
        removeWeaveFile(fileName: string): WeavePromise<string>;
        getWeaveFileInfo(fileName: string): WeavePromise<WeaveFileInfo>;
        getConnectionNames(): WeavePromise<string[]>;
        getConnectionInfo(userToGet: string): WeavePromise<ConnectionInfo>;
        saveConnectionInfo(info: ConnectionInfo, configOverwrite: boolean): WeavePromise<string>;
        removeConnectionInfo(connectionNameToRemove: string): WeavePromise<string>;
        getDatabaseConfigInfo(): WeavePromise<DatabaseConfigInfo>;
        setDatabaseConfigInfo(connectionName: string, password: string, schema: string, idFields: any[]): WeavePromise<string>;
        newEntity(metadata: EntityMetadata, parentId: number, insertAtIndex: number): WeavePromise<number>;
        updateEntity(entityId: number, diff: EntityMetadata): WeavePromise<void>;
        removeEntities(entityIds: any[]): WeavePromise<number[]>;
        addChild(parentId: number, childId: number, insertAtIndex: number): WeavePromise<number[]>;
        removeChild(parentId: number, childId: number): WeavePromise<void>;
        getHierarchyInfo(publicMetadata: Object): WeavePromise<EntityHierarchyInfo[]>;
        getEntities(entityIds: any[]): WeavePromise<Entity[]>;
        findEntityIds(publicMetadata: Object, wildcardFields: any[]): WeavePromise<number[]>;
        findPublicFieldValues(fieldName: string, valueSearch: string): WeavePromise<string[]>;
        getSQLSchemaNames(): WeavePromise<string[]>;
        getSQLTableNames(schemaName: string): WeavePromise<string[]>;
        getSQLColumnNames(schemaName: string, tableName: string): WeavePromise<string[]>;
        uploadFileByteArray(fileName: string, bytes: Uint8Array): WeavePromise<void>;
        getUploadedCSVFiles(): WeavePromise<WeaveFileInfo[]>;
        getUploadedSHPFiles(): WeavePromise<WeaveFileInfo[]>;
        getCSVColumnNames(csvFiles: string): WeavePromise<string[]>;
        getDBFColumnNames(dbfFileNames: any[]): WeavePromise<string[]>;
        checkKeyColumnsForSQLImport(schemaName: string, tableName: string, keyColumns: any[]): WeavePromise<void>;
        checkKeyColumnsForCSVImport(csvFileName: string, keyColumns: any[]): WeavePromise<void>;
        checkKeyColumnsForDBFImport(dbfFileNames: any[], keyColumns: any[]): WeavePromise<boolean>;
        importCSV(csvFile: string, csvKeyColumn: string, csvSecondaryKeyColumn: string, sqlSchema: string, sqlTable: string, sqlOverwrite: boolean, configDataTableName: string, configKeyType: string, nullValues: string, filterColumnNames: any[], configAppend: boolean): WeavePromise<number>;
        importSQL(schemaName: string, tableName: string, keyColumnName: string, secondaryKeyColumnName: string, configDataTableName: string, keyType: string, filterColumns: any[], configAppend: boolean): WeavePromise<number>;
        importSHP(configfileNameWithoutExtension: string, keyColumns: any[], sqlSchema: string, sqlTablePrefix: string, sqlOverwrite: boolean, configTitle: string, configKeyType: string, configProjection: string, nullValues: string, importDBFAsDataTable: boolean, configAppend: boolean): WeavePromise<number>;
        importDBF(fileNameWithoutExtension: string, sqlSchema: string, sqlTableName: string, sqlOverwrite: boolean, nullValues: string): WeavePromise<void>;
        testAllQueries(tableId: number): WeavePromise<any[]>;
        getKeyTypes(): WeavePromise<string[]>;
        ping(): string;
        getAttributeColumn(metadata: Object): WeavePromise<any>;
    }
}
declare module weavejs.net {
    import IWeaveEntityService = weavejs.api.net.IWeaveEntityService;
    import IWeaveGeometryTileService = weavejs.api.net.IWeaveGeometryTileService;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
    import AttributeColumnData = weavejs.net.beans.AttributeColumnData;
    import GeometryStreamMetadata = weavejs.net.beans.GeometryStreamMetadata;
    import TableData = weavejs.net.beans.TableData;
    import WeavePromise = weavejs.util.WeavePromise;
    /**
     * This is a wrapper class for making asynchronous calls to a Weave data servlet.
     *
     * @author adufilie
     */
    class WeaveDataServlet implements IWeaveEntityService {
        static DEFAULT_URL: string;
        static WEAVE_AUTHENTICATION_EXCEPTION: string;
        protected servlet: AMF3Servlet;
        protected _serverInfo: Object;
        constructor(url?: string);
        /**
         * This function will generate a AsyncToken representing a servlet method invocation.
         * @param method A WeaveAdminService class member function or a String.
         * @param parameters Parameters for the servlet method.
         * @param returnType_or_castFunction
         *     Either the type of object (Class) returned by the service or a Function that converts an Object to the appropriate type.
         *     If the service returns an Array of objects, each object in the Array will be cast to this type.
         *     The object(s) returned by the service will be cast to this type by copying the public properties of the objects.
         *     It is unnecessary to specify this parameter if the return type is a primitive value.
         * @return The AsyncToken object representing the servlet method invocation.
         */
        static castResult(cast: Object, originalResult: Object): Object;
        /**
         * Check this to determine if authenticate() may be necessary.
         * @return true if authenticate() may be necessary.
         */
        authenticationSupported: boolean;
        /**
         * Check this to determine if authenticate() must be called.
         * @return true if authenticate() should be called.
         */
        authenticationRequired: boolean;
        authenticatedUser: string;
        /**
         * Authenticates with the server.
         * @param user
         * @param pass
         */
        authenticate(user: string, pass: string): void;
        getServerInfo(): Object;
        entityServiceInitialized: boolean;
        getHierarchyInfo(publicMetadata: Object): WeavePromise<EntityHierarchyInfo[]>;
        getEntities(ids: any[]): WeavePromise<Entity[]>;
        findEntityIds(publicMetadata: Object, wildcardFields: any[]): WeavePromise<number[]>;
        findPublicFieldValues(fieldName: string, valueSearch: string): WeavePromise<string[]>;
        getColumn(columnId: Object, minParam: number, maxParam: number, sqlParams: any[]): WeavePromise<AttributeColumnData>;
        getTable(id: number, sqlParams: any[]): WeavePromise<TableData>;
        getGeometryStreamTileDescriptors(columnId: number): WeavePromise<GeometryStreamMetadata>;
        getGeometryStreamMetadataTiles(columnId: number, tileIDs: any[]): WeavePromise<weavejs.util.JSByteArray>;
        getGeometryStreamGeometryTiles(columnId: number, tileIDs: any[]): WeavePromise<weavejs.util.JSByteArray>;
        createTileService(columnId: number): IWeaveGeometryTileService;
        getRows(keys: any[]): WeavePromise<{
            attributeColumnMetadata: {
                [key: string]: string;
            }[];
            keyType: string;
            recordKeys: string[];
            recordData: any[][];
        }>;
        /**
         * Deprecated. Use getColumn() instead.
         */
        getColumnFromMetadata(metadata: Object): WeavePromise<AttributeColumnData>;
    }
}
declare module weavejs.net.beans {
    import JSByteArray = weavejs.util.JSByteArray;
    class AttributeColumnData {
        static NO_TABLE_ID: number;
        id: number;
        tableId: number;
        tableField: string;
        metadata: Object;
        keys: any[];
        data: any[];
        thirdColumn: any[];
        metadataTileDescriptors: JSByteArray;
        geometryTileDescriptors: JSByteArray;
    }
}
declare module weavejs.net.beans {
    class ConnectionInfo {
        name: string;
        pass: string;
        folderName: string;
        connectString: string;
        is_superuser: boolean;
        /**
         * This is a list of supported DBMS values.
         */
        static dbmsList: any[];
        static MYSQL: string;
        static POSTGRESQL: string;
        static SQLSERVER: string;
        static ORACLE: string;
        static SQLITE: string;
        static DIRECTORY_SERVICE_CONNECTION_NAME: string;
        /**
         * This function will get the default port for a DBMS.
         * @param dbms A supported DBMS.
         * @return The default port for the dbms.
         */
        static getDefaultPort(dbms: string): number;
    }
}
declare module weavejs.net.beans {
    class DatabaseConfigInfo {
        connection: string;
        schema: string;
        idFields: Array<string>;
    }
}
declare module weavejs.net.beans {
    import JSByteArray = weavejs.util.JSByteArray;
    class GeometryStreamMetadata {
        id: number;
        metadata: Object;
        metadataTileDescriptors: JSByteArray;
        geometryTileDescriptors: JSByteArray;
    }
}
declare module weavejs.net.beans {
    class TableData {
        id: number;
        keyColumns: any[];
        columns: Object;
        derived_qkeys: any[];
    }
}
declare module weavejs.net.beans {
    import JSByteArray = weavejs.util.JSByteArray;
    class WeaveFileInfo {
        lastModified: number;
        fileSize: number;
        thumb: JSByteArray;
        fileName: string;
    }
}
declare module weavejs.path {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    class ExternalTool extends LinkableHashMap {
        /**
         * The name of the global JavaScript variable which is a mapping from a popup's
         * window.name to an object containing "path" and "window" properties.
         */
        static WEAVE_EXTERNAL_TOOLS: string;
        /**
         * The popup's window.name
         */
        windowName: string;
        constructor();
        launch(): boolean;
        static generateWindowName(): string;
        static launch(owner: ILinkableObject, url: string, windowName?: string, features?: string): boolean;
        dispose(): void;
        /**
         * @inheritDoc
         */
        getSelectableAttributeNames(): any[];
        /**
         * @inheritDoc
         */
        getSelectableAttributes(): any[];
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
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    class WeavePathDataShared {
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
        qkeyToIndex(qkey: IQualifiedKey): number;
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
        static flatten<T>(source: Array<T>, destination?: Array<T>): Array<T>;
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
    class BackwardsCompatibility {
        static forceDeprecatedState(classDef: new (..._: any[]) => any): void;
        static updateSessionState(state: Object): Object;
        static classLookup: Object;
    }
}
declare module weavejs.util {
    class CallbackUtils {
        /**
         * This function generates a delayed version of a callback.
         * @param relevantContext If this is not null, then the callback will be removed when the relevantContext object is disposed via SessionManager.dispose().  This parameter is typically a 'this' pointer.
         * @param callback The callback function.
         * @param delay The number of milliseconds to delay before running the callback.
         * @param passDelayedParameters If this is set to true, the most recent parameters passed to the delayed callback will be passed to the original callback when it is called.  If this is set to false, no parameters will be passed to the original callback.
         * @return A wrapper around the callback that remembers the parameters and delays calling the original callback.
         */
        static generateDelayedCallback(relevantContext: Object, callback: Function, delay?: number, passDelayedParameters?: boolean): Function;
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
        static detectFormats(dates: Array<string>, moment_formats: Array<string>): Array<string>;
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
        data: Object;
    }
}
