/// <reference path="../../typings/FileSaver/FileSaver.d.ts" />
/// <reference path="../../typings/c3/c3.d.ts" />
/// <reference path="../../typings/classnames/classnames.d.ts" />
/// <reference path="../../typings/clipboard/clipboard.d.ts" />
/// <reference path="../../typings/codemirror/codemirror.d.ts" />
/// <reference path="../../typings/codemirror/react-codemirror.d.ts" />
/// <reference path="../../typings/d3/d3.d.ts" />
/// <reference path="../../typings/fixed-data-table/fixed-data-table.d.ts" />
/// <reference path="../../typings/fuse/fuse.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jszip/jszip.d.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/moment/moment-node.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/openlayers/openlayers.d.ts" />
/// <reference path="../../typings/pixi.js/pixi.js.d.ts" />
/// <reference path="../../typings/proj4/proj4.d.ts" />
/// <reference path="../../typings/rc-slider/rc-slider.d.ts" />
/// <reference path="../../typings/react-color/react-color.d.ts" />
/// <reference path="../../typings/react-date-picker.d.ts" />
/// <reference path="../../typings/react-dropzone/react-dropzone.d.ts" />
/// <reference path="../../typings/react-notification-system/react-notification-system.d.ts" />
/// <reference path="../../typings/react-sparklines/react-sparklines.d.ts" />
/// <reference path="../../typings/react-swf/react-swf.d.ts" />
/// <reference path="../../typings/react/react-addons-create-fragment.d.ts" />
/// <reference path="../../typings/react/react-addons-css-transition-group.d.ts" />
/// <reference path="../../typings/react/react-addons-linked-state-mixin.d.ts" />
/// <reference path="../../typings/react/react-addons-perf.d.ts" />
/// <reference path="../../typings/react/react-addons-pure-render-mixin.d.ts" />
/// <reference path="../../typings/react/react-addons-test-utils.d.ts" />
/// <reference path="../../typings/react/react-addons-transition-group.d.ts" />
/// <reference path="../../typings/react/react-addons-update.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
/// <reference path="../../typings/react/react-global.d.ts" />
/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/swfobject/swfobject.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/weave/as-types.d.ts" />
/// <reference path="../../typings/weave/weavejs-core.d.ts" />
declare namespace weavejs.flux {
    var Dispatcher: Weave;
}
declare namespace weavejs.flux {
    class WeaveStore {
        addChangeListener(callback: Function): void;
        removeChangeListener(callback: Function): void;
    }
}
declare namespace weavejs.geom.net_ivank_voronoi {
    import Point = weavejs.geom.Point;
    class VEdge {
        start: Point;
        end: Point;
        direction: Point;
        left: Point;
        right: Point;
        f: number;
        g: number;
        neighbour: VEdge;
        constructor(s: Point, a: Point, b: Point);
    }
}
declare namespace weavejs.geom.net_ivank_voronoi {
    import Point = weavejs.geom.Point;
    class VEvent {
        point: Point;
        pe: boolean;
        y: number;
        key: int;
        arch: VParabola;
        value: int;
        constructor(p: Point, pe: boolean);
        compare(other: VEvent): int;
    }
}
declare namespace weavejs.geom.net_ivank_voronoi {
    import Point = weavejs.geom.Point;
    class VParabola {
        site: Point;
        cEvent: VEvent;
        parent: VParabola;
        private _left;
        private _right;
        isLeaf: boolean;
        edge: VEdge;
        constructor(s?: Point);
        left: VParabola;
        right: VParabola;
    }
}
declare namespace weavejs.geom.net_ivank_voronoi {
    class VQueue {
        private q;
        private i;
        sortOnY(a: VEvent, b: VEvent): number;
        enqueue(p: VEvent): void;
        dequeue(): VEvent;
        remove(e: VEvent): void;
        isEmpty(): boolean;
        clear(b: boolean): void;
    }
}
declare namespace weavejs.geom.net_ivank_voronoi {
    import Point = weavejs.geom.Point;
    class Voronoi {
        private places;
        private edges;
        private queue;
        private i;
        private width;
        private height;
        private root;
        private ly;
        private lasty;
        private fp;
        GetEdges(p: Array<Point>, width: int, height: int): Array<VEdge>;
        private InsertParabola(p);
        private RemoveParabola(e);
        private FinishEdge(n);
        private GetXOfEdge(par, y);
        GetParabolaByX(xx: number): VParabola;
        private GetY(p, x);
        private CheckCircle(b);
        private GetEdgeIntersection(a, b);
        private GetLeft(n);
        private GetRight(n);
        private GetLeftParent(n);
        private GetRightParent(n);
        private GetLeftChild(n);
        private GetRightChild(n);
    }
}
declare namespace weavejs.geom.radviz {
    class ClassInfoObject {
        columnMapping: Map<string, number[]>;
        tStatisticArray: number[];
        pValuesArray: number[];
    }
}
declare namespace weavejs.geom.radviz {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import Dictionary2D = weavejs.util.Dictionary2D;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    /**
     * An interface for dimensional layout algorithms
     */
    interface ILayoutAlgorithm extends ICallbackCollection {
        /**
         * Runs the layout algorithm and calls performLayout()
         * @param array An array of IAttributeColumns to reorder
         * @param keyNumberHashMap hash map to speed up computation
         * @return An ordered array of IAttributeColumns
         */
        run(array: IAttributeColumn[], keyNumberHashMap: D2D_KeyColumnNumber): IAttributeColumn[];
        /**
         * Performs the calculations to reorder an array
         * @param columns an array of IAttributeColumns
         */
        performLayout(columns: IAttributeColumn[]): void;
    }
    type D2D_KeyColumnNumber = Dictionary2D<IQualifiedKey, IAttributeColumn, number>;
    class ILayoutAlgorithm {
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    class MatrixEntry {
        similarity: number;
        dimension1: IAttributeColumn;
        dimension2: IAttributeColumn;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    class RadVizUtils {
        /**
         * Reorders columns in a LinkableHashMap using the ordered layout
         * @param columns A LinkableHashMap containing IAttributeColumns
         * @param newColumnOrder An array of IAttributeColumns that are contained in columns
         */
        static reorderColumns(columns: LinkableHashMap, newColumnOrder: IAttributeColumn[]): void;
        /**
         * Checks for adjacency, assuming the columns in the array are placed in order around a circle
         * @param column1 An IAttributeColumn in the circle
         * @param column2 An IAttributeColumn in the circle
         * @param columns An array of IAttributeColumns
         * @return true if the column parameters are adjacent in the circle
         */
        static isAdjacent(column1: IAttributeColumn, column2: IAttributeColumn, columns: IAttributeColumn[]): boolean;
        /**
         * Calculates circular distance, assuming the indices in the array are placed in order around a circle
         * @param index1 An array index
         * @param index2 An array index
         * @param length the length of the array
         * @return Number of indices between two indices in an array
         */
        static getCircularDistance(index1: int, index2: int, length: int): number;
        /**
         * @param recordKeys an array of IQualifiedKeys
         * @param column1 first IAttributeColumn
         * @param column2 second IAttributeColumn
         * @param keyNumberMap key->column->value mapping to speed up computation
         * @return The euclidean distance between the two column parameters
         */
        static getEuclideanDistance(recordKeys: IQualifiedKey[], column1: IAttributeColumn, column2: IAttributeColumn, keyNumberMap: D2D_KeyColumnNumber): number;
        /**
         * @param recordKeys an array of IQualifiedKeys
         * @param column1 first IAttributeColumn
         * @param column2 second IAttributeColumn
         * @param keyNumberMap recordKey->column->value mapping to speed up computation
         * @return The cosine similarity between two parameter columns
         */
        static getCosineSimilarity(recordKeys: IQualifiedKey[], column1: IAttributeColumn, column2: IAttributeColumn, keyNumberMap: D2D_KeyColumnNumber): number;
        /**
         * Creates a dxd similarity matrix (where d is the length of the parameter array)
         * @param array An array of IAttributeColumns
         * @param keyNumberMap recordKey->column->value mapping to speed up computation
         * @return A 2D Array representing a similarity matrix
         */
        static getGlobalSimilarityMatrix(array: IAttributeColumn[], keyNumberMap: D2D_KeyColumnNumber): number[][];
        /**
         * Creates a neighborhood matrix (where d is the length of the parameter array)
         * @param array An array of IAttributeColumns
         * @return A 2D Array representing a neighborhood matrix
         */
        static getNeighborhoodMatrix(array: IAttributeColumn[]): number[][];
        /**
         * Creates a sorted similarity matrix consisting of MatrixEntry objects,
         * with the columns with the highest similarity first
         * @param array An array of IAttributeColumns
         * @param keyNumberMap recordKey->column->value mapping to speed up computation
         * @return A 1D array consisting of MatrixEntry objects
         */
        static getSortedSimilarityMatrix(array: IAttributeColumn[], keyNumberMap: D2D_KeyColumnNumber): MatrixEntry[];
        /**
         * Calculates and returns the similarity measure
         * @param similarityMatrix A 2D Array representing a similarity matrix
         * @param neighborhoodMatrix A 2D Array representing a neighborhood matrix
         * @return similarity measure for the parameter matrices
         */
        static getSimilarityMeasure(similarityMatrix: number[][], neighborhoodMatrix: number[][]): number;
        /**
         * Searches for parameter IAttributeColumn inside the array parameter
         * @param column column to search for
         * @param orderedColumns array of IAttributeColumns to search for column parameter
         * @return the column if it is found, null if not
         */
        static searchForColumn(column: IAttributeColumn, orderedColumns: IAttributeColumn[]): IAttributeColumn;
    }
}
declare namespace weavejs.mvc {
    class Model {
        subscribe(context: Object, onChange: Function): void;
        unsubscribe(context: Object, onChange: Function): void;
    }
}
declare namespace weavejs.util {
    import Graphics = PIXI.Graphics;
    import Point = weavejs.geom.Point;
    /**
     * A set of static functions for drawing to Graphics objects.
     */
    class DrawUtils {
        /**
         * Clears the line style for a Graphics object with optimal performance.
         */
        static clearLineStyle(graphics: Graphics): void;
        /**
         * Similar to lineTo() and curveTo(), this will draw an arc on a Graphics object.
         * @param graphics The Graphics where the arc will be drawn
         * @param continueLine If this is true, lineTo() will be used on the first coordinate instead of moveTo()
         * @param xCenter The x center coord of the arc
         * @param yCenter The y center coord of the arc
         * @param startAngle The angle where the arc starts
         * @param endAngle The angle where the arc ends
         * @param radius The radius of the circle that contains the arc
         * @param yRadius Optional y radius for an elliptical arc instead of a circular one
         * @param outputStartCoords A Point object used to output the starting coordinates of the arc.
         */
        static arcTo(graphics: Graphics, continueLine: boolean, xCenter: number, yCenter: number, startAngle: number, endAngle: number, radius: number, yRadius?: number, outputStartCoords?: Point): void;
        /**
         * @param horizontalEndPoints When true, the curve starts and ends horizontal. When false, vertical.
         * @param curveNormValue Values that produce nice curves range from 0 to 1, 0 being a straight line.
         * @param continuingLine If true, the graphics cursor is assumed to be already at (startX,startY) and moveTo will not be used prior to drawing the curve.
         */
        static drawDoubleCurve(graphics: Graphics, startX: number, startY: number, endX: number, endY: number, horizontalEndPoints: boolean, curveNormValue?: number, continuingLine?: boolean): void;
        static drawCurvedLine(graphics: Graphics, startX: number, startY: number, endX: number, endY: number, curvature: number): void;
        /**
         * Draws a dashed line using lineTo/moveTo with the current lineStyle of a Graphics object.
         * @param graphics The Graphics object on which to draw.
         * @param points A list of Point objects defining a polyline.
         * @param dashedLengths A list of alternating segment and gap lengths.
         */
        static drawDashedLine(graphics: Graphics, points: Point[], dashedLengths: number[]): void;
    }
}
declare namespace weavejs.ui {
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    class LinkableDynamicComponent extends React.Component<any, any> implements ILinkableVariable {
        private linkableState;
        getSessionState(): any;
        setSessionState(value: any): void;
        render(): JSX.Element;
        private refHandler;
        private renderFromState(state);
    }
}
declare namespace weavejs.ui {
    interface ProgressBarProps extends React.HTMLProps<HTMLDivElement> {
        progressValue?: number;
        total?: number;
        className?: string;
        style?: React.CSSProperties;
        visible: boolean;
    }
    function ProgressBar(props: ProgressBarProps): JSX.Element;
}
declare namespace weave.ui {
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import ITreeDescriptor = weavejs.ui.ITreeDescriptor;
    /**
     * Tells a Tree control how to work with IWeaveTreeNode objects.
     */
    class WeaveTreeNodeDescriptor<Node extends IWeaveTreeNode> implements ITreeDescriptor<Node> {
        getLabel(node: Node): string;
        isEqual(node1: Node, node2: Node): boolean;
        getChildren(node: Node): Node[];
        hasChildBranches(node: Node): boolean;
        isBranch(node: Node): boolean;
    }
}
declare namespace weavejs.ui.flexbox {
    interface BoxProps<T> extends React.HTMLProps<T> {
        padded?: boolean;
        overflow?: boolean;
    }
    class BoxProps<T> {
        static renderBox<T>(props: BoxProps<T>, options: {
            flexDirection: string;
            unpaddedClassName: string;
            paddedClassName: string;
        }): JSX.Element;
    }
}
declare namespace weavejs.util {
    function polyfill(window: any): void;
}
declare namespace weavejs.tool.oltool.layer {
    class CircleCache {
        static cache: Map<string, ol.style.Circle>;
        static circleDefToString(fillStyle: ol.style.Fill, strokeStyle: ol.style.Stroke, radius: number): string;
        static getCircle(options: {
            fill?: ol.style.Fill;
            stroke?: ol.style.Stroke;
            radius: number;
        }): ol.style.Circle;
    }
}
declare namespace weavejs.tool.oltool.layer {
    class ImageGlyphCache {
        private baseImageElements;
        private canvasMap;
        private imageMap;
        private context;
        constructor(context: any);
        requestBaseImageElement(url: any, callback: any): void;
        getCachedCanvas(url: any, color: any): {
            canvas: HTMLCanvasElement;
            freshCanvas: boolean;
        };
        requestDataUrl(url: string, color: any, callback: any): void;
        getImage(url: any, color: any): HTMLImageElement;
    }
}
declare namespace weavejs.ui {
    interface StatefulRangeSliderProps extends React.HTMLProps<StatefulRangeSlider> {
        style?: React.CSSProperties;
        valueFormat?: (value: number) => string;
    }
    interface StatefulRangeSliderState {
        value: number;
    }
    class StatefulRangeSlider extends React.Component<StatefulRangeSliderProps, StatefulRangeSliderState> {
        constructor(props: StatefulRangeSliderProps);
        state: StatefulRangeSliderState;
        handleInputChange: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.oltool {
    import WeavePromise = weavejs.util.WeavePromise;
    class Projections {
        static DEFAULT_PROJECTION: string;
        private static projectionDbPromise;
        static projectionDbReadyOrFailed: boolean;
        static getProjection(projectionName: string): ol.proj.Projection;
        static loadProjDatabase(): WeavePromise<boolean>;
        static projectionVerifier(value: string): boolean;
        static estimatedExtentMap: Map<string, [number, number, number, number]>;
        static getEstimatedExtent(proj: ol.proj.Projection): ol.Extent;
    }
}
declare namespace weavejs.tool.oltool {
    class CustomDragZoom extends ol.interaction.DragBox {
        constructor();
        private _probeInteraction;
        private probeInteraction;
        onBoxStart(event: any): void;
        onBoxEnd(event: any): void;
    }
}
declare namespace weavejs.tool.oltool {
    class PanCluster extends ol.control.Control {
        constructor(optOptions?: any);
    }
}
declare namespace weavejs.tool.oltool {
    class CustomView extends ol.View {
        enableResolutionConstraint: boolean;
        constrainResolution(resolution: number, opt_delta?: number, opt_direction?: number): number;
    }
}
declare namespace weavejs.tool.oltool {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import Bounds2D = weavejs.geom.Bounds2D;
    /**
     *
     */
    interface IOpenLayersMapTool {
        /**
         *
         */
        projectionSRS: LinkableString;
        getDefaultProjection: () => string;
        map: ol.Map;
        layers: LinkableHashMap;
        getExtent(): Bounds2D;
        interactionMode: LinkableString;
    }
    class IOpenLayersMapTool {
        static MAP_TOOL: string;
    }
}
declare namespace weavejs.tool.oltool {
    class InteractionModeCluster extends ol.control.Control {
        constructor(optOptions: any);
        private interactionMode;
        private updateInteractionMode_weaveToControl;
        setMap(map: ol.Map): void;
    }
}
declare namespace weavejs.tool.oltool {
    class CustomZoomToExtent extends ol.control.Control {
        private extent;
        constructor(opt_options?: olx.control.ZoomToExtentOptions);
        private handleClick(event);
        private handleZoomToExtent();
    }
}
declare namespace weavejs.tool.d3tool {
    interface AxisProps extends React.Props<AbstractAxis> {
        y: number;
        x: number;
        scale: Function;
        scalingMethod?: string;
        format: (num: any) => string;
        length: number;
    }
    interface AxisState {
        scale: Function;
    }
    class AbstractAxis extends React.Component<AxisProps, AxisState> {
        element: SVGElement;
        scale: Function;
        axis: any;
        orientation: "top" | "bottom" | "left" | "right";
        constructor(props: AxisProps);
    }
}
declare namespace weavejs.tool.d3tool {
    import AbstractAxis = weavejs.tool.d3tool.AbstractAxis;
    class YAxis extends AbstractAxis {
        constructor(props: AxisProps);
        componentDidUpdate(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.d3tool {
    import AbstractAxis = weavejs.tool.d3tool.AbstractAxis;
    class XAxis extends AbstractAxis {
        constructor(props: AxisProps);
        componentDidUpdate(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    import ComboBoxOption = weavejs.ui.ComboBoxOption;
    class ChartUtils {
        static getAxisLabelAngleChoices(): ComboBoxOption[];
    }
}
declare namespace weavejs.util {
    class FormatUtils {
        static d3formatter: (n: number) => string;
        static defaultNumberFormatting(x: number): number | string;
        static defaultFileSizeFormatting(byteFileSize: number): string;
        static defaultFuzzyTimeAgoFormatting(date: Date): string;
    }
}
declare namespace weavejs.util {
    class PrintUtils {
        static onBeforeUnLoad: () => void;
        static onLoad: () => void;
        static printTool(tool: Element): void;
        static printCanvasTool(tool: Element): void;
    }
}
declare namespace weavejs.ui {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    interface IToolTipProps extends React.Props<ToolTip> {
        toolTipClass?: string;
        toolTipContainerClass?: string;
        nameFormat?: Function;
        valueFormat?: Function;
        titleFormat?: Function;
    }
    interface IToolTipState {
        x?: number;
        y?: number;
        title?: string;
        columnNamesToValue?: {
            [columnName: string]: string;
        };
        columnNamesToColor?: {
            [columnName: string]: string;
        };
        showToolTip?: boolean;
    }
    class ToolTip extends React.Component<IToolTipProps, IToolTipState> {
        private nameFormat;
        private valueFormat;
        private titleFormat;
        private toolTipClass;
        private toolTipContainerClass;
        private containerStyle;
        private element;
        private toolTipOffset;
        private secondRender;
        constructor(props: IToolTipProps);
        componentDidMount(): void;
        componentDidUpdate(): void;
        getToolTipHtml(): string;
        render(): JSX.Element;
        show(context: ILinkableObject, event: MouseEvent, keys: IQualifiedKey[], additionalColumns: IAttributeColumn[]): void;
        hide(): void;
        private static getToolTipTitle(context, keys);
        private static getToolTipData(context, keys, additionalColumns?);
    }
}
declare namespace weavejs.plot {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import Graphics = PIXI.Graphics;
    class SolidFillStyle implements ILinkableObject {
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
        recordFormat: {
            'color': AlwaysDefinedColumn;
            'alpha': AlwaysDefinedColumn;
        };
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordType: {
            'color': NumberConstructor;
            'alpha': NumberConstructor;
        };
        beginFillStyle(key: IQualifiedKey, graphics: Graphics): void;
        getStyle(key: IQualifiedKey): {
            color: number;
            alpha: number;
        };
    }
}
declare namespace weavejs.plot {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import NormalizedColumn = weavejs.data.column.NormalizedColumn;
    import Graphics = PIXI.Graphics;
    class SolidLineStyle implements ILinkableObject {
        constructor();
        private _callbackCollection;
        private _triggerCounter;
        private map_column_dataType;
        private map_column_defaultValue;
        private createColumn(dataType, defaultValue);
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
        recordFormat: {
            'color': AlwaysDefinedColumn;
            'weight': AlwaysDefinedColumn;
            'alpha': AlwaysDefinedColumn;
            'caps': AlwaysDefinedColumn;
            'joints': AlwaysDefinedColumn;
            'miterLimit': AlwaysDefinedColumn;
        };
        /**
         * For use with ColumnUtils.getRecords()
         */
        recordType: {
            'color': NumberConstructor;
            'weight': NumberConstructor;
            'alpha': NumberConstructor;
            'caps': StringConstructor;
            'joints': StringConstructor;
            'miterLimit': NumberConstructor;
        };
        /**
         * IQualifiedKey -> getLineStyleParams() result
         */
        private map_key_style;
        beginLineStyle(key: IQualifiedKey, graphics: Graphics): void;
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
declare namespace weavejs.api.ui {
    import Bounds2D = weavejs.geom.Bounds2D;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Graphics = PIXI.Graphics;
    /**
     * An IPlotTask provides information for an IPlotter for rendering a plot asynchronously.
     */
    class IPlotTask {
        /**
         * This is the off-screen buffer, which may change
         */
        buffer: Graphics;
        /**
         * This specifies the range of data to be rendered
         */
        dataBounds: Bounds2D;
        /**
         * This specifies the pixel range where the graphics should be rendered
         */
        screenBounds: Bounds2D;
        /**
         * These are the IQualifiedKey objects identifying which records should be rendered
         */
        recordKeys: IQualifiedKey[];
        /**
         * This counter is incremented after each iteration.  When the task parameters change, this counter is reset to zero.
         */
        iteration: number;
        /**
         * This is the time at which the current iteration should be stopped, if possible.  This value can be compared to getTimer().
         * Ignore this value if an iteration cannot be ended prematurely.
         */
        iterationStopTime: number;
        /**
         * This object can be used to optionally store additional state variables for resuming an asynchronous task where it previously left off.
         * Setting this will not reset the iteration counter.
         */
        asyncState: any;
    }
}
declare namespace weavejs.core {
    import WeavePromise = weavejs.util.WeavePromise;
    type UpdateCallback = (meta: {
        percent: number;
        currentFile: string;
    }) => void;
    class WeaveArchive {
        private static FOLDER_AMF;
        private static FOLDER_JSON;
        private static FOLDER_FILES;
        files: Map<string, Uint8Array>;
        objects: Map<string, Object>;
        constructor(weave?: Weave);
        private jsonOnFulfilled(fileName, result);
        private amfOnFulfilled(fileName, result);
        private fileOnFulfilled(fileName, result);
        static deserialize(byteArray: Uint8Array, updateCallback?: UpdateCallback): Promise<WeaveArchive>;
        private deserialize(byteArray, updateCallback?);
        private serialize(updateCallback?);
        static serialize(weave: Weave, updateCallback?: UpdateCallback): WeavePromise<Uint8Array>;
        static ARCHIVE_HISTORY_AMF: string;
        static ARCHIVE_HISTORY_JSON: string;
        static ARCHIVE_COLUMN_CACHE_AMF: string;
        static ARCHIVE_COLUMN_CACHE_JSON: string;
        setSessionFromArchive(weave: Weave): void;
        static setSessionFromUrl(weave: Weave, url: string): WeavePromise<WeaveArchive>;
    }
}
declare namespace weavejs.ui {
    interface FileInputProps extends React.HTMLProps<FileInput> {
        onChange: React.FormEventHandler;
    }
    class FileInput extends React.Component<FileInputProps, {}> {
        input: HTMLInputElement;
        constructor(props: FileInputProps);
        onChange: (e: React.FormEvent) => void;
        handleClick: (e: __React.MouseEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.api.ui {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    class IAltTextConfig {
        text: LinkableString;
        showAsCaption: LinkableBoolean;
    }
    class IAltText {
        altText: IAltTextConfig;
        getAutomaticDescription: () => string;
    }
}
declare namespace weavejs.layout.flexiblelayout.DirectionTypes {
    const VERTICAL: "vertical";
    const HORIZONTAL: "horizontal";
    type Direction = typeof HORIZONTAL | typeof VERTICAL;
}
declare namespace weavejs.util {
    import Dictionary2D = weavejs.util.Dictionary2D;
    class DOMUtils {
        static getWindow(element: Element): Window;
        /**
         * This function returns the width of a text string, in pixels, based on its font style
         */
        static getTextWidth(text: string, font: string): number;
        static textHeightCache: Dictionary2D<string, string, number>;
        static textHeightForClassCache: Dictionary2D<string, string, number>;
        static getTextHeightForClasses(text: string, classNames: string): number;
        static getTextHeight(text: string, font: string): number;
        static eventFire(el: HTMLElement | Document, etype: string): void;
        static getOffsetRect(ancestor: HTMLElement, descendant: HTMLElement): ClientRect;
        /**
         * Detects if an element overflows with respect to its container.
         * @param element the element to check.
         * @param container an optional element container or the window by default.
         * @returns {{left: boolean, top: boolean, bottom: boolean, right: boolean}}
         */
        static detectOverflow(element: HTMLElement, container?: HTMLElement | Window): {
            left: boolean;
            right: boolean;
            top: boolean;
            bottom: boolean;
        };
    }
}
declare namespace weavejs.ui {
    interface IPanelOverlayProps extends React.Props<PanelOverlay> {
    }
    interface IPanelOverlayState {
        style: React.CSSProperties;
    }
    class PanelOverlay extends React.Component<IPanelOverlayProps, IPanelOverlayState> {
        constructor(props: IPanelOverlayProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    /**
     * Provides a way to render a div separately by setting its state.
     */
    class Div extends React.Component<React.HTMLProps<Div>, React.HTMLAttributes> {
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    class MouseUtils {
        static addPointClickListener(target: HTMLElement, listener: (event: MouseEvent) => void, pixelThreshold?: number): void;
        static removePointClickListener(target: HTMLElement, listener: any): void;
        static getOffsetPoint(relativeTo: HTMLElement, event?: MouseEvent): {
            x: number;
            y: number;
        };
        /**
         * This function can be used to check if the user clicked on an element
         * even if the 'click' event doesn't get dispatched due to DOM changes
         * @param element the Element in question
         * @returns {boolean} return true if the element received the last 'mousedown' event.
         */
        static receivedMouseDown(element: Element): boolean;
        static isMouseOver(element: HTMLElement, event?: MouseEvent, edgeInclusive?: boolean): boolean;
        private static map_window_MouseUtils;
        static forInstance(instance: React.ReactInstance): MouseUtils;
        static forComponent(component: React.Component<any, any>): MouseUtils;
        static forElement(element: Element): MouseUtils;
        static echoWindowEventsToOpener(sourceElement: Element): void;
        static mouseEventTypes: string[];
        static dragEventTypes: string[];
        private static buttonToButtonsMapping;
        constructor(window: Window);
        /**
         * A bitmask for mouse button state. left=1, right=2, middle=4
         */
        mouseButtonDown: number;
        /**
         * The last mouse event.
         */
        mouseEvent: MouseEvent;
        mouseDownEvent: MouseEvent;
        mouseDownTarget: typeof MouseEvent.prototype.target;
        private canRelyOnButtonsProp;
        private handleMouseEvent;
        private handleDragEvent;
        private debugEvent;
    }
}
declare namespace weavejs.geom.radviz {
    import CallbackCollection = weavejs.core.CallbackCollection;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * An abstract class with a callback collection which implements ILayoutAlgorithm
     */
    class AbstractLayoutAlgorithm extends CallbackCollection implements ILayoutAlgorithm {
        unorderedLayout: IAttributeColumn[];
        orderedLayout: IAttributeColumn[];
        /**
         * @param keyNumberMap recordKey->column->value mapping to speed up computation
         */
        keyNumberMap: D2D_KeyColumnNumber;
        /**
         * Runs the layout algorithm and calls performLayout()
         * @param array An array of IAttributeColumns to reorder
         * @param keyNumberHashMap recordKey->column->value mapping to speed up computation
         * @return An ordered array of IAttributeColumns
         */
        run(array: IAttributeColumn[], keyNumberHashMap: D2D_KeyColumnNumber): IAttributeColumn[];
        /**
         * Classes that extend LayoutAlgorithm must implement this function
         * @param columns An array of IAttributeColumns
         */
        performLayout(columns: IAttributeColumn[]): void;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    /**
     * An implementation of the RANDOM_LAYOUT dimensional ordering algorithm.
     * This algorithm randomly swaps dimensions for a certain number of iterations using a similarity measure.
     */
    class RandomLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        iterations: LinkableNumber;
        private similarityMatrix;
        private neighborhoodMatrix;
        performLayout(columns: IAttributeColumn[]): void;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * An implementation of the NEAREST_NEIGHBOR dimensional ordering algorithm.
     * This algorithm finds nearest neighbors of a dimension successfully until all dimensions have been added.
     */
    class NearestNeighborLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        private ssm;
        performLayout(columns: IAttributeColumn[]): void;
        private searchForAnchorMatch(matchTo, ignore, orderedColumns);
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * An implementation of the incremental dimensional ordering algorithm.
     * This algorithm successively adds dimensions to the best position in a search to define a suitable order.
     */
    class IncrementalLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        performLayout(columns: IAttributeColumn[]): void;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * An implementation of the GREEDY_LAYOUT dimensional ordering algorithm.
     * This algorithm keeps adding nearest possible pairs of dimensions until all dimensions have been added.
     */
    class GreedyLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        performLayout(columns: IAttributeColumn[]): void;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    /**
     * An implementation of the Class Discrimination Layout dimensional ordering algorithm.
     * This algorithm groups dimensions according to the Classes found in the initial Column selected for class determination
     */
    class ClassDiscriminationLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        tAndpMapping: Map<string, string[]>;
        tandpValuesMapping: Map<string, number[]>;
        ClassToColumnMap: Map<string, ClassInfoObject>;
        /** structure of ClassToColumnMap (Bins)
         for example :    type                        				Array
         ClassToColumnMap[japanese]      			   			 Object 1
                                                                 ColumnName1     values in Column1
                                                                 ColumnName2		       Column2
                                                                 ColumnName3		       Column3
         
         ClassToColumnMap[american]          					 Object 2
                                                                 ColumnName1     values in Column1
                                                                 ColumnName2		       Column2
                                                                 ColumnName3		       Column3
         */
        /** This function determines the classes and  populates the Dictionary called ClassToColumnMap which is used for the Class Discrimination Layout Algorithm
         can be used when the discriminator class is of a categorical nature  */
        fillingClassToColumnMap(selectedColumn: DynamicColumn, colObjects: IAttributeColumn[], columnNames: string[], normalizedColumns: IAttributeColumn[]): void;
        /**This function segregates the columns into classes using the statistical measure (t-statistic in this case) */
        performClassDiscrimination(columnNames: string[], ClassToColumnMap: Map<string, ClassInfoObject>, layoutMeasure: string, thresholdValue: number, columnNumPerClass: number): Map<string, string[]>;
    }
}
declare namespace weavejs.geom.radviz {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    /**
     * An implementation of the optimal layout algorithm that generates all permutations of the original anchor layout
     * and returns the best one, if one exists
     */
    class BruteForceLayoutAlgorithm extends AbstractLayoutAlgorithm implements ILayoutAlgorithm {
        private similarityMatrix;
        private neighborhoodMatrix;
        performLayout(columns: IAttributeColumn[]): void;
        private getNthPermutation<T>(symbols, n);
        private n_to_factoradic(n, p?);
        private permutation<T>(symbols, factoradic);
        private factorial(n);
    }
}
declare namespace weavejs.app {
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import KeySet = weavejs.data.key.KeySet;
    import KeyFilter = weavejs.data.key.KeyFilter;
    import ColorColumn = weavejs.data.column.ColorColumn;
    class AccessibilityProperties {
        enableAccessibilityFeatures: LinkableBoolean;
        enableCaptioning: LinkableBoolean;
    }
    class WeaveProperties implements ILinkableObject, ILinkableObjectWithNewProperties {
        static WEAVE_PROPERTIES: string;
        static DEFAULT_COLOR_COLUMN: string;
        static DEFAULT_COLOR_BIN_COLUMN: string;
        static DEFAULT_COLOR_DATA_COLUMN: string;
        static DEFAULT_SUBSET_KEYFILTER: string;
        static DEFAULT_SELECTION_KEYSET: string;
        static DEFAULT_PROBE_KEYSET: string;
        static ALWAYS_HIGHLIGHT_KEYSET: string;
        static SAVED_SELECTION_KEYSETS: string;
        static SAVED_SUBSETS_KEYFILTERS: string;
        static getProperties(context: Weave | ILinkableObject): WeaveProperties;
        static notify(weave: Weave, level: "error" | "warning" | "info" | "success", message: string): void;
        private _weave;
        notificationSystem: NotificationSystem.System;
        enableMenuBar: LinkableBoolean;
        showSessionHistorySlider: LinkableBoolean;
        enableSessionHistoryControls: LinkableBoolean;
        toolInteractions: LinkableHashMap;
        accessibility: AccessibilityProperties;
        enableGeometryProbing: LinkableBoolean;
        macros: LinkableHashMap;
        weave: Weave;
        defaultProbeKeySet: KeySet;
        defaultSelectionKeySet: KeySet;
        defaultSubsetKeyFilter: KeyFilter;
        defaultColorColumn: ColorColumn;
        defaultColorBinColumn: any;
        defaultColorDataColumn: any;
        private init();
        deprecatedStateMapping: Object;
    }
}
declare namespace weavejs.editor {
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import IColumnStatistics = weavejs.api.data.IColumnStatistics;
    type FilterOption = {
        value: string | number;
        label: string;
    };
    interface FilterEditorProps {
        filter: ColumnDataFilter;
    }
    interface FilterEditorState {
    }
    class AbstractFilterEditor extends React.Component<FilterEditorProps, FilterEditorState> implements ILinkableObjectWithNewProperties {
        showPlayButton: LinkableBoolean;
        showToggle: LinkableBoolean;
        showToggleLabel: LinkableBoolean;
        private filterWatcher;
        private statsWatcher;
        protected options: FilterOption[];
        constructor(props: FilterEditorProps);
        componentWillReceiveProps(props: FilterEditorProps): void;
        filter: ColumnDataFilter;
        column: DynamicColumn;
        stats: IColumnStatistics;
        handleFilter(): void;
        handleColumn(): void;
        componentDidMount(): void;
        onChange(selectedValues: Object): void;
        deprecatedStateMapping: Object;
    }
}
declare namespace weavejs.ui {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    interface DynamicComponentProps extends React.Props<DynamicComponent> {
        dependencies: ILinkableObject[];
        render: () => JSX.Element;
    }
    interface DynamicComponentState {
    }
    class DynamicComponent extends React.Component<DynamicComponentProps, DynamicComponentState> {
        constructor(props: DynamicComponentProps);
        componentWillReceiveProps(newProps: DynamicComponentProps): void;
        render(): JSX.Element;
        componentWillUnmount(): void;
        private static map_component_dependencies;
        static setDependencies(component: React.Component<any, any>, dependencies: ILinkableObject[]): void;
    }
}
declare namespace weavejs.ui.flexbox {
    class Section extends React.Component<BoxProps<Section>, {}> {
        static options: {
            flexDirection: string;
            unpaddedClassName: string;
            paddedClassName: string;
        };
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface ColorRampComponentProps extends React.HTMLProps<HTMLDivElement> {
        ramp: string[];
        direction?: "left" | "right" | "top" | "bottom";
    }
    interface ColorRampComponentState {
    }
    class ColorRampComponent extends React.Component<ColorRampComponentProps, ColorRampComponentState> {
        constructor(props: ColorRampComponentProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.flexbox {
    class Label extends React.Component<React.HTMLProps<Label>, {}> {
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    class KeyboardUtils {
        static KEYCODES: {
            TAB: number;
            ENTER: number;
            ESC: number;
            SPACE: number;
            LEFT_ARROW: number;
            UP_ARROW: number;
            RIGHT_ARROW: number;
            DOWN_ARROW: number;
            Z: number;
            Y: number;
        };
    }
}
declare namespace weavejs.ui {
    interface CenteredIconProps extends React.HTMLProps<CenteredIcon> {
        iconProps?: React.HTMLProps<HTMLImageElement>;
    }
    interface CenteredIconState {
    }
    class CenteredIcon extends React.Component<CenteredIconProps, CenteredIconState> {
        constructor(props: CenteredIconProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    import ReactComponent = weavejs.util.ReactComponent;
    import LinkableWatcher = weavejs.core.LinkableWatcher;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    type LinkReactStateMapping = {
        [prop: string]: LinkReactStateMapping | ILinkableObject;
    };
    type WeavePathArray = string[];
    class WeaveReactUtils {
        static unlinkReactState(component: ReactComponent): void;
        static linkReactStateRef(context: ILinkableObject, mapping: LinkReactStateMapping, delay?: number): (component: ReactComponent) => void;
        static linkReactState(context: ILinkableObject, component: ReactComponent, mapping: LinkReactStateMapping, delay?: number): void;
        /**
         * Shortcut for boilerplate code that creates a LinkableWatcher which calls forceUpdate() on a component.
         */
        static forceUpdateWatcher(component: ReactComponent, type: new (..._: any[]) => ILinkableObject, defaultPath?: (typeof LinkableWatcher.prototype.targetPath)): LinkableWatcher;
        static requestObject<T extends ReactComponent>(weave: Weave, path: string[], type: new (..._: any[]) => T, onCreate: (instance: T) => void): void;
    }
}
declare namespace weavejs.util {
    type Structure = "string" | "boolean" | "number" | StructureFunction | StructureObject | StructureArray | StructureNullable;
    type StructureFunction = ((a: any) => any);
    interface StructureObject {
        [key: string]: Structure;
    }
    interface StructureArray extends Array<Structure> {
    }
    interface StructureNullable {
        nullable: Structure;
    }
    class MiscUtils {
        /**
         * Generates an "rgba()" string for CSS.
         *
         * @param r A number between 0 and 255.
         * @param g A number between 0 and 255.
         * @param b A number between 0 and 255.
         * @param a A number between 0 and 1.
         * @return an "rgba()" string for CSS
         */
        static rgba(r: number, g: number, b: number, a: number): string;
        /**
         * Generates an "rgba()" string for CSS.
         *
         * @param rgb A number between 0x000000 and 0xFFFFFF.
         * @param a A number between 0 and 1.
         * @return an "rgba()" string for CSS
         */
        static rgb_a(rgb: number, a: number): string;
        /**
         * Generates an "rgba()" string for CSS.
         *
         * @param hex  A hexidecimal between 000000 and FFFFFF.
         * @param a   A number between 0 and 1.
         */
        static hex2rgba(hex: string, a: number): string;
        /**
         * Searches for the first nested object with matching properties
         *
         * @param root The root Object.
         * @param match Either an Object with properties to match, or a Function that checks for a match.
         *
         * @returns returns an object with the matching properties
         */
        static findDeep(root: any, match: any): any;
        /**
         * Temporary polyfill workaround for String.startsWith for projects that are
         * targetting es5
         *
         * determines whether a string begins with the characters of another string,
         * returning true or false as appropriate.
         *
         * @param str
         *            {string} the str string in which to search for in
         *            str.startsWith
         * @param searchString
         *            {string} The characters to be searched for at the start of
         *            this string.
         * @param position
         *            {number?} Optional. The position in this string at which to
         *            begin searching for searchString; defaults to 0.
         *
         * @returns true or false
         *
         */
        static startsWith(str: string, searchString: string, position?: number): boolean;
        static resolveRelative(base: string, path: string): string;
        /**
         *
         * This function return and object whose keys are url parameters and value
         */
        static makeUrlParams(queryParams: any): string;
        static getUrlParams(): any;
        static getHashParams(): any;
        private static getParams(query);
        static evalTemplateString(str: string, thisArg?: any): string;
        static _pickDefined(obj: {
            [key: string]: any;
        }, ...keys: string[]): typeof obj;
        static _pickBy(obj: {
            [key: string]: any;
        }, predicate: (value: any, key: string) => boolean): typeof obj;
        /**
         * Tests if a value is an object with a single property.
         * @param value An object to test.
         * @return The single property name, or null if the given value was not an object with a single property.
         */
        static testSinglePropertyObject(value: Object): string;
        static normalizeStructure(value: any, structure: Structure): any;
        static nullableStructure(structure: Structure): StructureNullable;
    }
}
declare namespace weavejs.dialog {
    interface GuidanceToolTipProps extends React.HTMLProps<GuidanceToolTip> {
        location: string;
        type: string;
        onClose?: Function;
    }
    interface GuidanceToolTipState {
    }
    class GuidanceToolTip extends React.Component<GuidanceToolTipProps, GuidanceToolTipState> {
        static START: string;
        static NEXT: string;
        static DONE: string;
        static BOTTOM: string;
        static BOTTOM_LEFT: string;
        static BOTTOM_RIGHT: string;
        static TOP: string;
        static TOP_LEFT: string;
        static TOP_RIGHT: string;
        static LEFT: string;
        static LEFT_TOP: string;
        static LEFT_BOTTOM: string;
        static RIGHT: string;
        static RIGHT_TOP: string;
        static RIGHT_BOTTOM: string;
        constructor(props: GuidanceToolTipProps);
        componentWillReceiveProps(nextProps: GuidanceToolTipProps): void;
        closeHandler: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    import LinkableString = weavejs.core.LinkableString;
    interface InteractiveTourProps extends React.HTMLProps<InteractiveTour> {
        enableToolTip?: boolean;
        onClose?: Function;
    }
    interface InteractiveTourState {
        visible?: boolean;
        activeStepName?: string;
        tooltipHeight?: number;
        tooltipWidth?: number;
    }
    class InteractiveTour extends React.Component<InteractiveTourProps, InteractiveTourState> {
        static stepName: LinkableString;
        static unMountedStepName: string;
        static enable: boolean;
        static steps: string[];
        static stepContents: string[];
        static stepPointers: string[];
        static stepComponentMap: any;
        static pointerComponentMap: any;
        static stepComponentRefCallbackMap: Map<string, (classInstance: any) => void>;
        static stepPointerRefCallbackMap: Map<string, (classInstance: any) => void>;
        static startTour(steps: string[], stepContents: string[], stepPointers: string[]): void;
        static callComponentRefCallback(stepName: string, classInstance: any): void;
        static getComponentRefCallback(stepName: string): (classInstance: any) => void;
        static getPointerRefCallback(stepName: string): (classInstance: any) => void;
        static isLastStep(index: number): boolean;
        static reset(): void;
        static targetComponentOnClick(stepName: string): void;
        constructor(props: InteractiveTourProps);
        private targetMountedNode;
        private pointerMountedNode;
        updateNextComponentName: () => void;
        closeHandler: () => void;
        render(): JSX.Element;
        componentDidUpdate(): void;
    }
}
declare namespace weavejs.css {
    import CSSProperties = React.CSSProperties;
    function prefixer(style: CSSProperties): CSSProperties;
}
declare namespace weavejs.layout.flexiblelayout {
    import Direction = weavejs.layout.flexiblelayout.DirectionTypes.Direction;
    interface IResizerProps extends React.Props<Resizer> {
        direction: Direction;
        spacing?: number;
    }
    interface IResizerState {
        active?: boolean;
    }
    class Resizer extends React.Component<IResizerProps, IResizerState> {
        static DEFAULT_SPACING: number;
        constructor(props: IResizerProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        onMouseDown: (event: MouseEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.api.ui {
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Bounds2D = weavejs.geom.Bounds2D;
    class IPlotter extends ILinkableObject {
        /**
         * This is an interface for adding callbacks that get called when any spatial properties of the plotter change.
         * Spatial properties are those that affect the data bounds of visual elements.  Whenever these callbacks get
         * called, data bounds values previously returned from getDataBoundsFromRecordKey() become invalid.
         */
        spatialCallbacks: ICallbackCollection;
        /**
         * This is the set of record keys relevant to this IPlotter.
         * An optional filter can be applied to filter the records before the plotter generates graphics for them.
         * @return The set of record keys that can be passed to the drawPlot() and getDataBoundsFromRecordKey() functions.
         */
        filteredKeySet: IFilteredKeySet;
        /**
         * This function provides a mapping from a record key to an Array of bounds objects, specified
         * in data coordinates, that cover the bounds associated with that record key.
         * The simplest geometric object supported is Bounds2D.  Other objects may be supported in future versions.
         * @param key The key of a data record.
         * @param output An Array which may or may not be already populated with Bounds2D objects.
         *               If there are existing Bounds2D objects in this Array, they will be used as output buffers.
         *               New Bounds2D objects will be added to the Array as needed.
         * @return An Array of geometric objects, in data coordinates, that cover the bounds associated with the record key.
         */
        getDataBoundsFromRecordKey(key: IQualifiedKey, output: Bounds2D[]): void;
        /**
         * This function will perform one iteration of an asynchronous rendering task.
         * This function will be called multiple times across several frames until its return value is 1.0.
         * This function may be defined with override by classes that extend AbstractPlotter.
         * @param task An object containing the rendering parameters.
         * @return A number between 0 and 1 indicating the progress that has been made so far in the asynchronous rendering.
         */
        drawPlotAsyncIteration(task: IPlotTask): number;
        /**
         * This function returns a Bounds2D object set to the data bounds associated with the background.
         * @return The data bounds associated with the background of the plotter.
         */
        getBackgroundDataBounds(output: Bounds2D): void;
        /**
         * This function draws the background graphics for this plotter, if there are any.
         * An example background would be the origin lines of an axis.
         * @param dataBounds The data coordinates that correspond to the given screenBounds.
         * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
         * @param destination The sprite to draw the graphics onto.
         */
        drawBackground(dataBounds: Bounds2D, screenBounds: Bounds2D, destination: PIXI.Graphics): void;
    }
}
declare namespace weavejs.plot {
    import Bounds2D = weavejs.geom.Bounds2D;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IPlotter = weavejs.api.ui.IPlotter;
    import Rectangle = weavejs.geom.Rectangle;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IKeySet = weavejs.api.data.IKeySet;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
    import IPlotTask = weavejs.api.ui.IPlotTask;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
    import Graphics = PIXI.Graphics;
    /**
     * This is a base implementation for an IPlotter.
     */
    abstract class AbstractPlotter implements IPlotter, ISelectableAttributes {
        constructor();
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        getSelectableAttributeNames(): string[];
        getSelectableAttributes(): (IColumnWrapper | ILinkableHashMap)[];
        /**
         * Registers dependencies that affect data bounds and should trigger spatial callbacks.
         */
        protected addSpatialDependencies(...dependencies: ILinkableObject[]): void;
        /**
         * This variable should not be set manually.  It cannot be made constant because we cannot guarantee that it will be initialized
         * before other properties are initialized, which means it may be null when someone wants to call registerSpatialProperty().
         */
        private _spatialCallbacks;
        /**
         * This is an interface for adding callbacks that get called when any spatial properties of the plotter change.
         * Spatial properties are those that affect the data bounds of visual elements.
         */
        spatialCallbacks: ICallbackCollection;
        /**
         * This will set up the keySet so it provides keys in sorted order based on the values in a list of columns.
         * @param columns An Array of IAttributeColumns to use for comparing IQualifiedKeys.
         * @param sortDirections Array of sort directions corresponding to the columns and given as integers (1=ascending, -1=descending, 0=none).
         * @see weave.data.KeySets.FilteredKeySet#setColumnKeySources()
         */
        protected setColumnKeySources(columns: IKeySet[], sortDirections?: number[]): void;
        /**
         * This function sets the base IKeySet that is being filtered.
         * @param keySet A new IKeySet to use as the base for this FilteredKeySet.
         */
        protected setSingleKeySource(keySet: IKeySet): void;
        /**
         * This variable is returned by get keySet().
         */
        protected _filteredKeySet: FilteredKeySet;
        /**
         * @return An IKeySet interface to the record keys that can be passed to the drawRecord() and getDataBoundsFromRecordKey() functions.
         */
        filteredKeySet: IFilteredKeySet;
        /**
         * This function must be implemented by classes that extend AbstractPlotter.
         * When you implement this function, you may use initBoundsArray() for convenience.
         *
         * This function returns a Bounds2D object set to the data bounds associated with the given record key.
         * @param recordKey The key of a data record.
         * @param output An Array of Bounds2D objects to store the result in.
         * @return An Array of Bounds2D objects that make up the bounds for the record.
         */
        getDataBoundsFromRecordKey(recordKey: IQualifiedKey, output: Bounds2D[]): void;
        /**
         * variables for template code
         */
        protected clipRectangle: Rectangle;
        /**
         * This function will perform one iteration of an asynchronous rendering task.
         * This function will be called multiple times across several frames until its return value is 1.0.
         * This function may be defined with override by classes that extend AbstractPlotter.
         * @param task An object containing the rendering parameters.
         * @return A number between 0 and 1 indicating the progress that has been made so far in the asynchronous rendering.
         */
        drawPlotAsyncIteration(task: IPlotTask): number;
        protected addRecordGraphics(recordKey: IQualifiedKey, dataBounds: Bounds2D, screenBounds: Bounds2D, buffer: Graphics): void;
        /**
         * This function draws the background graphics for this plotter, if applicable.
         * An example background would be the origin lines of an axis.
         * @param dataBounds The data coordinates that correspond to the given screenBounds.
         * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
         * @param destination The sprite to draw the graphics onto.
         */
        drawBackground(dataBounds: Bounds2D, screenBounds: Bounds2D, destination: Graphics): void;
        /**
         * This function returns a Bounds2D object set to the data bounds associated with the background.
         * @return A Bounds2D object specifying the background data bounds.
         */
        getBackgroundDataBounds(output: Bounds2D): void;
        /**
         * This is a convenience function for use inside getDataBoundsFromRecordKey().
         * @param output An output Array, which may already contain any number of Bounds2D objects.
         * @param desiredLength The desired number of output Bounds2D objects to appear in the output Array.
         * @return The first Bounds2D item in the Array, or null if desiredLength is zero.
         */
        initBoundsArray(output: Bounds2D[], desiredLength?: number): Bounds2D;
    }
}
declare namespace weavejs.plot {
    import Point = weavejs.geom.Point;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Bounds2D = weavejs.geom.Bounds2D;
    import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import IColumnStatistics = weavejs.api.data.IColumnStatistics;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import LinkableString = weavejs.core.LinkableString;
    import IKeySet = weavejs.api.data.IKeySet;
    /**
     * A glyph represents a point of data at an X and Y coordinate.
     */
    class AbstractGlyphPlotter extends AbstractPlotter implements IObjectWithDescription {
        constructor();
        getDescription(): string;
        dataX: DynamicColumn;
        dataY: DynamicColumn;
        zoomToSubset: LinkableBoolean;
        protected statsX: IColumnStatistics;
        protected statsY: IColumnStatistics;
        hack_setSingleKeySource(keySet: IKeySet): void;
        sourceProjection: LinkableString;
        destinationProjection: LinkableString;
        tempPoint: Point;
        private _projector;
        private _xCoordCache;
        private _yCoordCache;
        /**
         * This gets called whenever any of the following change: dataX, dataY, sourceProjection, destinationProjection
         */
        private updateProjector;
        getCoordsFromRecordKey(recordKey: IQualifiedKey, output: Point): void;
        /**
         * The data bounds for a glyph has width and height equal to zero.
         * This function returns a Bounds2D object set to the data bounds associated with the given record key.
         * @param recordKey The key of a data record.
         * @param output An Array of Bounds2D objects to store the result in.
         */
        getDataBoundsFromRecordKey(recordKey: IQualifiedKey, output: Bounds2D[]): void;
        /**
         * This function returns a Bounds2D object set to the data bounds associated with the background.
         * @param output A Bounds2D object to store the result in.
         */
        getBackgroundDataBounds(output: Bounds2D): void;
    }
}
declare namespace weavejs.plot {
    import IKeySet = weavejs.api.data.IKeySet;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import AbstractGlyphPlotter = weavejs.plot.AbstractGlyphPlotter;
    import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import Bounds2D = weavejs.geom.Bounds2D;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Graphics = PIXI.Graphics;
    class ScatterPlotPlotter extends AbstractGlyphPlotter implements ISelectableAttributes {
        constructor();
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        sizeBy: DynamicColumn;
        minScreenRadius: LinkableNumber;
        maxScreenRadius: LinkableNumber;
        defaultScreenRadius: LinkableNumber;
        showSquaresForMissingSize: LinkableBoolean;
        line: SolidLineStyle;
        fill: SolidFillStyle;
        colorBySize: LinkableBoolean;
        colorNegative: LinkableNumber;
        colorPositive: LinkableNumber;
        private _sizeByStats;
        private colorDataWatcher;
        private _extraKeyDependencies;
        private _keyInclusionLogic;
        hack_setKeyInclusionLogic(keyInclusionLogic: (key: IQualifiedKey) => boolean, extraColumnDependencies: IKeySet[]): void;
        private handleColor();
        private updateKeySources();
        drawBackground(dataBounds: Bounds2D, screenBounds: Bounds2D, destination: Graphics): void;
        /**
         * This may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
         */
        protected addRecordGraphics(recordKey: IQualifiedKey, dataBounds: Bounds2D, screenBounds: Bounds2D, graphics: Graphics): void;
        deprecatedStateMapping: {
            absoluteValueColorEnabled: LinkableBoolean;
            absoluteValueColorMin: LinkableNumber;
            absoluteValueColorMax: LinkableNumber;
            xColumn: DynamicColumn;
            yColumn: DynamicColumn;
            alphaColumn: data.column.AlwaysDefinedColumn;
            colorColumn: data.column.AlwaysDefinedColumn;
            radiusColumn: DynamicColumn;
        };
    }
}
declare namespace weavejs.api.ui {
    /**
     * A class implementing this interface is an IPlotter that renders text graphics.
     */
    interface ITextPlotter extends IPlotter {
    }
    class ITextPlotter {
    }
}
declare namespace weavejs.api.ui {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Bounds2D = weavejs.geom.Bounds2D;
    import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
    import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
    /**
     * This interface defines a plotter whose records are geometric objects with
     * special probing and selection. A plotter which implements this interface is
     * subject to polygon containment algorithms during probing and selection.
     */
    interface IPlotterWithGeometries extends IPlotter {
        /**
         * This function provides a mapping from a record key to an Array of ISimpleGeometry objects
         * in data coordinates.
         *
         * @param recordKey An IQualifiedKey for which to get its geometries.
         * @param minImportance The minimum importance of the geometry objects.
         * @param bounds The visible bounds.
         * @return An Array of IGeometry objects, in data coordinates.
         */
        getGeometriesFromRecordKey(recordKey: IQualifiedKey, minImportance?: Number, bounds?: Bounds2D): (ISimpleGeometry | GeneralizedGeometry)[];
        /**
         * This function will get an array ISimpleGeometry objects.
         *
         * @return An array of ISimpleGeometry objects which can be used for spatial querying.
         */
        getBackgroundGeometries(): ISimpleGeometry[];
    }
}
declare namespace weavejs.ui {
    interface InputProps extends React.HTMLProps<Input> {
        children?: React.ReactNode;
        fluid?: boolean;
        disabled?: boolean;
    }
    interface InputState {
    }
    class Input extends React.Component<InputProps, InputState> {
        inputElement: HTMLInputElement;
        static defaultProps: InputProps;
        constructor(props: InputProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface ILogComponentProps extends React.HTMLProps<LogComponent> {
        messages?: string[];
        uiClass?: string;
        clearFunc: (event: React.MouseEvent) => void;
        header: React.ReactChild;
    }
    class LogComponent extends React.Component<ILogComponentProps, Object> {
        constructor(props: ILogComponentProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    /**
     * A SmartComponent knows when it should update and when it's ok to setState().
     */
    class SmartComponent<P, S> extends React.Component<P, S> {
        constructor(props: P);
        setState(f: (prevState: S, props: P) => S, callback?: () => any): void;
        setState(newState: S, callback?: () => any): void;
        shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any): boolean;
    }
}
declare namespace weavejs.ui.slider {
    import SmartComponent = weavejs.ui.SmartComponent;
    type SliderOption = {
        value: any;
        label: string;
    };
    interface SliderProps {
        min?: number;
        max?: number;
        step?: number;
        options?: SliderOption[];
        selectedValues: any[];
        onChange: Function;
        vertical?: boolean;
        className: string;
        style: React.CSSProperties;
        type: string;
    }
    class RCSlider extends SmartComponent<SliderProps, {}> {
        static VERTICAL: string;
        static HORIZONTAL: string;
        static NUMERIC: string;
        static CATEGORICAL: string;
        static NUMERIC_DISCRETE: string;
        private options;
        private indexToValue;
        private valueToIndex;
        private indexToLabel;
        private min;
        private max;
        private element;
        private step;
        constructor(props: SliderProps);
        componentWillUpdate(): void;
        onChange(value: any): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface WeaveProgressBarProps extends React.HTMLProps<WeaveProgressBar> {
    }
    interface WeaveProgressBarState {
        visible: boolean;
    }
    class WeaveProgressBar extends SmartComponent<WeaveProgressBarProps, WeaveProgressBarState> {
        constructor(props: WeaveProgressBarProps);
        private timeBecameBusy;
        private autoVisibleDelay;
        private autoHideDelay;
        /**
         * This will automatically toggle visibility based on the target's busy status.
         */
        private toggleVisible();
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface IconButtonProps extends React.HTMLProps<IconButton> {
        clickHandler: (event: React.MouseEvent) => void;
        mouseOverStyle?: React.CSSProperties;
        iconName?: string;
        toolTip?: string;
    }
    interface IconButtonState {
        mouseOver?: boolean;
    }
    class IconButton extends SmartComponent<IconButtonProps, IconButtonState> {
        constructor(props: IconButtonProps);
        clickHandler: (event: __React.MouseEvent) => void;
        mouseOverHandler: () => void;
        mouseOutHandler: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.c3tool {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface C3ChartProps {
        config: c3.ChartConfiguration;
    }
    class C3Chart extends SmartComponent<C3ChartProps, {}> {
        constructor(props: C3ChartProps);
        private key;
        chart: c3.ChartAPI;
        render(): JSX.Element;
        componentDidMount(): void;
        componentDidUpdate(): void;
        componentWillReceiveProps(props: C3ChartProps): void;
        componentWillUnmount(): void;
        updateChart(): void;
        destroyChart(): void;
    }
}
declare namespace weavejs.editor {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface JSONEditorProps {
        style?: React.CSSProperties;
    }
    interface JSONEditorState {
        value?: any;
        error?: Error;
    }
    class JSONEditor extends SmartComponent<JSONEditorProps, JSONEditorState> {
        json: string;
        parsed: any;
        constructor(props: JSONEditorProps);
        onFocusChange: (focused: boolean) => void;
        handleJSON: (json: string) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
        colorClass?: string;
    }
    interface ButtonState {
    }
    class Button extends React.Component<ButtonProps, ButtonState> {
        constructor(props: ButtonProps);
        static defaultProps: ButtonProps;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface CheckboxProps extends React.Props<Checkbox> {
        type?: string;
        disabled?: boolean;
        label: string;
        name?: string;
        style?: React.CSSProperties;
        onChange?: (value: boolean, event: React.FormEvent) => void;
        className?: string;
        value?: boolean;
        title?: string;
    }
    interface CheckboxState {
        value?: boolean;
    }
    class Checkbox extends SmartComponent<CheckboxProps, CheckboxState> {
        element: Element;
        selector: any;
        constructor(props: CheckboxProps);
        static defaultProps: CheckboxProps;
        componentWillReceiveProps(nextProps: CheckboxProps): void;
        handleChange: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.flexbox {
    class VBox extends React.Component<BoxProps<VBox>, {}> {
        static options: {
            flexDirection: string;
            unpaddedClassName: string;
            paddedClassName: string;
        };
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.slider {
    interface HSliderProps {
        min?: number;
        max?: number;
        step?: number;
        options?: SliderOption[];
        selectedValues?: any[];
        type: string;
        reversed?: boolean;
        onChange?: (selectedValue: [string]) => void;
        style?: React.CSSProperties;
        className?: string;
    }
    class HSlider extends React.Component<HSliderProps, any> {
        constructor(props: HSliderProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.flexbox {
    class HBox extends React.Component<BoxProps<HBox>, {}> {
        static options: {
            flexDirection: string;
            unpaddedClassName: string;
            paddedClassName: string;
        };
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    type ReactComponent = React.Component<any, any> & React.ComponentLifecycle<any, any>;
    interface DynamicTableStyles {
        table?: React.CSSProperties;
        thead?: React.CSSProperties;
        tbody?: React.CSSProperties;
        th?: React.CSSProperties | React.CSSProperties[];
        tr?: React.CSSProperties;
        td?: React.CSSProperties | React.CSSProperties[];
    }
    interface DynamicTableClassNames {
        table?: string;
        thead?: string;
        tbody?: string;
        th?: string;
        tr?: string;
        td?: string | string[];
    }
    class ReactUtils {
        private static map_document_popupContainer;
        private static map_popup_element;
        static openPopout(jsx: JSX.Element, onLoad?: Function, onBeforeUnLoad?: Function, windowOptions?: any): Window;
        static openPopup(context: React.ReactInstance, jsx: JSX.Element, closeOnMouseDown?: boolean, onClose?: (popup: React.ReactInstance) => void): React.ReactInstance;
        static closePopup(popup: React.ReactInstance): void;
        static generateFlexBoxLayout: (flexValues: number[], rowsUI: (React.ReactElement<any> | string | number)[][], cellStyles?: React.CSSProperties[], cellClassNames?: string[]) => JSX.Element;
        static generateGridLayout: (gridValues: string[], gridRowsUI: JSX.Element[][]) => JSX.Element;
        static generateTable(params: {
            header?: React.ReactChild[];
            body: React.ReactChild[][];
            styles?: DynamicTableStyles;
            classes?: DynamicTableClassNames;
            props?: React.HTMLProps<HTMLTableElement>;
        }): JSX.Element;
        /**
         * Checks if a component has focus.
         */
        static hasFocus(component: ReactComponent): boolean;
        /**
         * Calls component.setState(newValues) only if they are different than the current values.
         */
        static updateState<S>(component: React.Component<any, S>, newValues: S): void;
        /**
         * Replaces the entire component state if it is different from the current state.
         */
        static replaceState<S>(component: React.Component<any, S>, newState: S): void;
        /**
         * Adds undefined values to new state for properties in current state not
         * found in new state.
         */
        private static includeMissingPropertyPlaceholders<S>(currentState, newState);
        static onUnmount<T extends ReactComponent>(component: T, callback: (component: T) => void): void;
        static onWillUpdate<T extends React.Component<P, S> & React.ComponentLifecycle<P, S>, P, S>(component: T, callback: (component: T, nextProps: P, nextState: S, nextContext: any) => void): void;
        private static map_callback_onWillUpdateRef;
        static onWillUpdateRef<T extends React.Component<P, S> & React.ComponentLifecycle<P, S>, P, S>(callback: (component: T, nextProps: P, nextState: S, nextContext: any) => void): (component: T) => void;
        static getWindow(instance: React.ReactInstance): Window;
        static getDocument(instance: React.ReactInstance): Document;
        static getElement(instance: React.ReactInstance): Element;
        private static map_element_componentSet;
        /**
         * Generates a ref function that makes it possible to use ReactUtils.findComponent() on the resulting DOM Element.
         */
        static registerComponentRef<T extends React.ReactInstance>(component: ReactComponent, then?: (instance: T) => void): (instance: T) => void;
        /**
         * Returns the first ancestor React Component of a particular type which has been registered via ReactUtils.registerComponentRef().
         */
        static findComponent<T extends React.Component<any, any>>(instance: React.ReactInstance, type?: new (..._: any[]) => T): T;
    }
}
declare namespace weavejs.ui {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import SmartComponent = weavejs.ui.SmartComponent;
    import LinkableWatcher = weavejs.core.LinkableWatcher;
    interface IWeaveComponentRendererProps extends React.HTMLProps<WeaveComponentRenderer> {
        weave: Weave;
        path: typeof LinkableWatcher.prototype.targetPath;
        defaultType?: React.ComponentClass<any>;
        requestType?: React.ComponentClass<any>;
        onCreate?: (instance: ILinkableObject) => void;
        props?: any;
    }
    interface IWeaveComponentRendererState {
        actualType?: React.ComponentClass<any>;
        target?: ILinkableObject;
    }
    class WeaveComponentRenderer extends SmartComponent<IWeaveComponentRendererProps, IWeaveComponentRendererState> {
        watcher: LinkableWatcher;
        generatedComponent: React.Component<any, any> & ILinkableObject;
        key: number;
        constructor(props: IWeaveComponentRendererProps);
        componentWillReceiveProps(props: IWeaveComponentRendererProps): void;
        handleProps(props: IWeaveComponentRendererProps): void;
        requestObject(weave: Weave, path: typeof LinkableWatcher.prototype.targetPath, type: React.ComponentClass<any>): void;
        handleWatcher(props?: IWeaveComponentRendererProps): void;
        handleGeneratedComponent: (component: React.Component<any, any>) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface SideBarProps extends React.HTMLProps<SideBar> {
        onClose?: (open: boolean) => void;
        location: string;
        open: boolean;
        enableClose?: boolean;
    }
    interface SideBarState {
        open: boolean;
    }
    class SideBar extends SmartComponent<SideBarProps, SideBarState> {
        constructor(props: SideBarProps);
        private onCloseClick;
        componentWillReceiveProps(nextProps: SideBarProps): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface ResizingDivProps extends React.HTMLProps<ResizingDiv> {
        innerStyle?: React.CSSProperties;
        onResize?: (state: ResizingDivState) => void;
    }
    interface ResizingDivState {
        width?: number;
        height?: number;
    }
    /**
     * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
     */
    class ResizingDiv extends React.Component<ResizingDivProps, ResizingDivState> {
        state: ResizingDivState;
        outerDiv: HTMLDivElement;
        componentDidMount(): void;
        handleFrame(): void;
        componentDidUpdate(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    class Popup extends React.Component<React.HTMLProps<Popup>, React.HTMLAttributes> {
        static popupSet: Set<Popup>;
        static open(context: React.ReactInstance, jsx: JSX.Element, closeOnMouseDown?: boolean, onClose?: (popup: Popup) => void): Popup;
        componentDidMount(): void;
        componentWillUnmount(): void;
        onKeyDown(event: KeyboardEvent): void;
        static close(popup: Popup): void;
        static alignPopups(): void;
        static bringToFront(popup: Popup): void;
        onContextMenu: (event: __React.MouseEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    type Size = {
        width: number;
        height: number;
    };
    interface FloatingDivProps extends React.HTMLProps<FloatingDiv> {
        useContentHeight?: boolean;
        useContentWidth?: boolean;
        innerStyle?: React.CSSProperties;
    }
    interface FloatingDivState {
        outerWidth?: number;
        outerHeight?: number;
        innerWidth?: number;
        innerHeight?: number;
    }
    /**
     * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
     */
    class FloatingDiv extends SmartComponent<FloatingDivProps, FloatingDivState> {
        constructor(props: FloatingDivProps);
        outerDiv: HTMLDivElement;
        innerDiv: HTMLDivElement;
        static getOffsetSize(element: HTMLElement): Size;
        handleFrame(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    type ComboBoxOption = {
        label: string;
        value: any;
    };
    interface ComboBoxProps extends React.HTMLProps<ComboBox> {
        options?: (string | {
            label: string;
            value: any;
        })[];
        value?: any;
        onChange?: (value: any) => void;
        onNew?: (value: any) => void;
        onRemoved?: (value: any) => void;
        onAdded?: (value: any) => void;
        onAddNewOption?: (value: any) => void;
        selectFirstOnInvalid?: boolean;
        context?: Element;
        direction?: string;
        valueEqualityFunc?: (valueA: any, valueB: any) => boolean;
        allowAdditions?: boolean;
        type?: string;
        fluid?: boolean;
        header?: string | React.ReactChild;
        optionStyle?: React.CSSProperties;
        noneOption?: ComboBoxOption;
        searchable?: boolean;
    }
    interface ComboBoxState {
        openMenu?: boolean;
        options?: ComboBoxOption[];
        value?: any | any[];
        direction?: string;
        searchQuery?: string;
    }
    class ComboBox extends React.Component<ComboBoxProps, ComboBoxState> {
        static defaultProps: ComboBoxProps;
        constructor(props: ComboBoxProps);
        componentWillReceiveProps(nextProps: ComboBoxProps): void;
        shouldComponentUpdate(nextProps: ComboBoxProps, nextState: ComboBoxState): boolean;
        getStateFromProps: (props: ComboBoxProps) => ComboBoxState;
        private getOptionFromValue(value);
        onClickListener: (event: __React.MouseEvent) => void;
        onChange: (index: number, option: {
            label: string;
            value: any;
        }, event: React.FormEvent) => void;
        resetSearchQuery: () => void;
        addNewOption: (event: __React.MouseEvent) => void;
        selectedValueRemoveListener: (index: number, option: {
            label: string;
            value: any;
        }, event: __React.MouseEvent) => void;
        onDocumentMouseDown: (event: MouseEvent) => void;
        private menuRect;
        private menuRefCallback;
        getMenuPositionStyle: () => React.CSSProperties;
        private inputElement;
        inputRefCallback: (c: HTMLElement) => void;
        inputClickListener: (event: __React.MouseEvent) => void;
        renderInput: (isHidden?: boolean) => JSX.Element;
        isNoneOption: () => boolean;
        searchQueryChangeListener: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import LinkableString = weavejs.core.LinkableString;
    import Input = weavejs.ui.Input;
    interface KeyTypeInputProps extends React.HTMLProps<Input> {
        keyTypeProperty: LinkableString;
    }
    interface KeyTypeInputState {
    }
    class KeyTypeInput extends React.Component<KeyTypeInputProps, KeyTypeInputState> {
        constructor(props: KeyTypeInputProps);
        changeListener: (content: string) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface AccordionProps extends React.HTMLProps<Accordion> {
        collapsible?: boolean;
        activeChild?: number;
        titles: string[];
    }
    interface AccordionState {
        activeChild: number;
    }
    class Accordion extends SmartComponent<AccordionProps, AccordionState> {
        constructor(props: AccordionProps);
        componentWillReceiveProps(nextProps: AccordionProps): void;
        handleClick: (childID: number, event: __React.MouseEvent) => void;
        render(): JSX.Element;
        static render(...sections: Array<[string, React.ReactChild[][] | React.ReactChild]>): JSX.Element;
    }
}
declare namespace weavejs.layout.flexiblelayout {
    import Direction = weavejs.layout.flexiblelayout.DirectionTypes.Direction;
    interface IResizerOverlayProps extends React.Props<ResizerOverlay> {
        direction: Direction;
        thickness?: number;
    }
    interface IResizerOverlayState {
        active?: boolean;
        range?: number[];
        x?: number;
        y?: number;
    }
    class ResizerOverlay extends React.Component<IResizerOverlayProps, IResizerOverlayState> {
        constructor(props: IResizerOverlayProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        stopEventPropagation: (event: Event) => void;
        thickness: number;
        onMouseMove: (event: MouseEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.layout.flexiblelayout {
    import Direction = weavejs.layout.flexiblelayout.DirectionTypes.Direction;
    interface LayoutState {
        flex?: number;
        id?: Object;
        direction?: Direction;
        children?: LayoutState[];
        maximized?: boolean;
    }
    interface LayoutProps extends React.Props<Layout> {
        state: LayoutState;
        onStateChange: Function;
        spacing?: number;
    }
    class Layout extends React.Component<LayoutProps, LayoutState> {
        children: Layout[];
        private resizers;
        private minSize;
        private dragging;
        private panelDragging;
        private overlay;
        constructor(props: LayoutProps, state: LayoutState);
        componentDidMount(): void;
        componentWillReceiveProps(nextProps: LayoutProps): void;
        componentWillUnmount(): void;
        shouldComponentUpdate(nextProps: LayoutProps, nextState: LayoutState): boolean;
        componentDidUpdate(): void;
        getElementFromId(id: Object): Element;
        getComponentFromId(id: Object): Layout;
        private onMouseDown;
        private onMouseMove;
        getResizerRange(resizerIndex: number): [number, number];
        private onMouseUp;
        private generateStyle();
        render(): JSX.Element;
        static renderLayout(props: LayoutProps): JSX.Element;
    }
}
declare namespace weavejs.layout {
    import SmartComponent = weavejs.ui.SmartComponent;
    import WeavePathArray = weavejs.util.WeavePathArray;
    type LayoutPanelProps = {
        maximized?: boolean;
    };
    type PanelRenderer = (id: WeavePathArray, panelProps?: LayoutPanelProps, panelRenderer?: PanelRenderer) => JSX.Element;
    interface LayoutProps extends React.HTMLProps<AnyAbstractLayout> {
        panelRenderer: PanelRenderer;
    }
    type LayoutDragData = {
        panelDragged: WeavePathArray;
        layout: WeavePathArray;
    };
    type AnyAbstractLayout = AbstractLayout<LayoutProps, {}>;
    abstract class AbstractLayout<P extends LayoutProps, S> extends SmartComponent<P, S> {
        title: string;
        abstract addPanel(id: WeavePathArray): void;
        abstract removePanel(id: WeavePathArray): void;
        abstract maximizePanel(id: WeavePathArray, maximize: boolean): void;
        abstract replacePanel(id: WeavePathArray, newId: WeavePathArray): void;
        abstract getPanelIds(): WeavePathArray[];
    }
    class PanelDragEvent {
        private static DRAG_DATA_TYPE;
        static hasPanelId(event: React.DragEvent): boolean;
        static setPanelId(event: React.DragEvent, panelId: WeavePathArray, instance?: React.ReactInstance): void;
        static getPanelId(event: React.DragEvent): WeavePathArray;
        static getLayout(event: React.DragEvent, weave: Weave): AnyAbstractLayout;
    }
}
declare namespace weavejs.layout {
    import WeavePathArray = weavejs.util.WeavePathArray;
    import Layout = weavejs.layout.flexiblelayout.Layout;
    import LayoutState = weavejs.layout.flexiblelayout.LayoutState;
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    enum DropZone {
        NONE = 0,
        LEFT = 1,
        TOP = 2,
        RIGHT = 3,
        BOTTOM = 4,
        CENTER = 5,
    }
    type FlexibleLayoutState = {
        title?: string;
    } & LayoutState;
    class FlexibleLayout extends AbstractLayout<LayoutProps, {}> implements ILinkableVariable {
        private linkableState;
        private nextState;
        private rootLayout;
        private layoutRect;
        private overlay;
        private draggedId;
        private dragOverId;
        private dropZone;
        private prevClientWidth;
        private prevClientHeight;
        private outerZoneThickness;
        constructor(props: LayoutProps);
        getSessionState(): FlexibleLayoutState;
        setSessionState: (state: {
            title?: string;
        } & LayoutState) => void;
        title: string;
        componentDidMount(): void;
        componentWillUnmount(): void;
        componentDidUpdate(): void;
        addPanel(id: WeavePathArray): void;
        removePanel(id: WeavePathArray): void;
        replacePanel(id: WeavePathArray, newId: WeavePathArray): void;
        maximizePanel(id: WeavePathArray, maximized: boolean): void;
        frameHandler(): void;
        onDragStart(draggedId: WeavePathArray, event: React.DragEvent): void;
        hideOverlay: () => void;
        onDragOver(dragOverId: WeavePathArray, event: React.DragEvent): void;
        getDropZone(dragOverId: WeavePathArray): [DropZone, WeavePathArray];
        simplifyState(state: FlexibleLayoutState, topLevel?: boolean): FlexibleLayoutState;
        onDrop(dragOverId: WeavePathArray, event: React.DragEvent): void;
        onDragLeave: (event: __React.DragEvent) => void;
        onDragEnd: (event: __React.DragEvent) => void;
        onMouseUp: (event: MouseEvent) => void;
        handlePanelDrop(sourceLayout: AnyAbstractLayout, srcId: WeavePathArray, destId: WeavePathArray, dropZone: DropZone): void;
        getLayoutPosition(layoutOrId: Layout | WeavePathArray): ClientRect;
        repositionPanels: (layout?: Layout) => void;
        static findStateNode(state: LayoutState, id: WeavePathArray): LayoutState;
        private static getLeafNodes(state, output?);
        getPanelIds(): WeavePathArray[];
        private static sortLeafNodes(node1, node2);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.slider {
    import SliderOption = weavejs.ui.slider.SliderOption;
    interface VSliderProps {
        min?: number;
        max?: number;
        step?: number;
        options?: SliderOption[];
        selectedValues?: any[];
        type: string;
        reversed?: boolean;
        onChange?: (selectedValue: [string]) => void;
        style?: React.CSSProperties;
        className?: string;
    }
    class VSlider extends React.Component<VSliderProps, any> {
        constructor(props: VSliderProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.menu {
    interface MenuItemProps {
        label?: React.ReactChild;
        leftIcon?: React.ReactElement<any>;
        rightIcon?: React.ReactElement<any>;
        secondaryLabel?: string;
        click?: () => void;
        enabled?: boolean;
        shown?: boolean;
        menu?: MenuItemProps[];
        itemStyleOverride?: React.CSSProperties;
    }
    interface MenuProps extends React.HTMLProps<Menu> {
        menu: MenuItemProps[];
        header?: React.ReactChild;
        /**
         * optional prop to specify who is opening the menu
         * so that in case of overflow we render the menu
         * on the other side of the opener
         */
        opener?: React.ReactInstance;
    }
    interface MenuState {
        activeIndex?: number;
        top?: number;
        left?: number;
    }
    interface IGetMenuItems {
        getMenuItems(): MenuItemProps[];
    }
    class Menu extends React.Component<MenuProps, MenuState> {
        element: HTMLElement;
        opener: HTMLElement;
        window: Window;
        menuItemList: HTMLDivElement[];
        lastOverflow: {
            left: boolean;
            top: boolean;
            right: boolean;
            bottom: boolean;
        };
        constructor(props: MenuProps);
        static registerMenuSource(component: React.Component<any, any>): void;
        static getMenuItems(element: HTMLElement): MenuItemProps[];
        handleKeyPress: (event: KeyboardEvent) => void;
        componentDidMount(): void;
        componentDidUpdate(): void;
        handleOverflow(): void;
        componentWillUnmount(): void;
        onMouseEnter: (index: number) => void;
        onMouseLeave: (index: number) => void;
        onFocus: (index: number) => void;
        onBlur: () => void;
        renderMenuItems(menu: MenuItemProps[]): JSX.Element[];
        renderMenuItem(index: number, props: MenuItemProps): JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.menu {
    import Menu = weavejs.ui.menu.Menu;
    import Popup = weavejs.ui.Popup;
    class ContextMenu extends Menu {
        static open(event: React.MouseEvent): void;
        popup: Popup;
        handleClick: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    import Popup = weavejs.ui.Popup;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    interface DropdownProps extends React.HTMLProps<Dropdown> {
        menuGetter?: () => MenuItemProps[];
        openOnMouseEnter?: boolean;
        closeOnMouseLeave?: boolean;
        onClose?: () => void;
        onOpen?: () => void;
    }
    interface DropdownState {
    }
    class Dropdown extends SmartComponent<DropdownProps, DropdownState> {
        static defaultProps: DropdownProps;
        menu: Popup;
        constructor(props: DropdownProps);
        onMouseLeave: (event: __React.MouseEvent) => void;
        onMouseEnter: (event: __React.MouseEvent) => void;
        onMenuMouseUp: (event: __React.MouseEvent) => void;
        onClick: (event: __React.MouseEvent) => void;
        onKeyUp: (event: __React.KeyboardEvent) => void;
        closeMenu: () => void;
        onDocumentMouseDown: (event: MouseEvent) => void;
        onDocumentKeyDown: (event: KeyboardEvent) => void;
        onDocumentKeyUp: (event: KeyboardEvent) => void;
        openMenu: () => void;
        toggleMenu: () => void;
        getMenuRef: (ele: any) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.menu {
    interface MenuButtonProps extends React.HTMLProps<MenuButton> {
        menu: MenuItemProps[];
        showIcon?: boolean;
        onClose?: () => void;
    }
    interface MenuButtonState {
    }
    class MenuButton extends React.Component<MenuButtonProps, MenuButtonState> {
        element: HTMLElement;
        menu: Menu;
        constructor(props: MenuButtonProps);
        static defaultProps: MenuButtonProps;
        componentDidMount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui.menu {
    import Dropdown = weavejs.ui.Dropdown;
    interface MenuBarItemProps {
        label: string;
        menu: MenuItemProps[];
        bold?: boolean;
    }
    interface MenuBarProps extends React.Props<MenuBar> {
        config?: MenuBarItemProps[];
        style?: React.CSSProperties;
    }
    interface MenuBarState {
        activeIndex?: number;
        clickedIndex?: number;
    }
    class MenuBar extends React.Component<MenuBarProps, MenuBarState> {
        element: Element;
        dropdownItems: Dropdown[];
        activeDropdown: Dropdown;
        constructor(props: MenuBarProps);
        onMouseEnter(index: number): void;
        onMouseLeave: (index: number) => void;
        onFocus(index: number): void;
        onBlur: () => void;
        openNextDropdown(index: number): void;
        openDropdown(newDropdown: Dropdown): void;
        onMouseUp: (index: number) => void;
        onKeyUp: (index: number, event: __React.KeyboardEvent) => void;
        flickerItem: (index: number) => void;
        onDropdownOpen(index: number): void;
        /**
         * when the dropdown closes by itself
         * clean up
         */
        onDropdownClose: () => void;
        handleDocumentClick: (event: MouseEvent) => void;
        handleDocumentKeyDown: (event: KeyboardEvent) => void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        renderMenuBarItem(index: number, props: MenuBarItemProps): JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface TabsProps extends React.Props<Tabs> {
        labels: React.ReactChild[];
        tabs: JSX.Element[];
        location?: "top" | "bottom";
        tabBarChildren?: React.ReactChild;
        initialActiveTabIndex?: number;
        activeTabIndex?: number;
        onViewChange?: (index: number) => void;
        style?: React.CSSProperties;
        tabHeaderClassName?: string;
        tabHeaderStyle?: React.CSSProperties;
        tabContainerClassName?: string;
        tabContentClassName?: string;
        tabContentStyle?: React.CSSProperties;
        tabLabelClassName?: string;
        tabLabelStyle?: React.CSSProperties;
        tabBarClassName?: string;
        tabBarStyle?: React.CSSProperties;
        onTabClick?: (index: number, event?: React.MouseEvent) => void;
        onTabDoubleClick?: (index: number, event?: React.MouseEvent) => void;
    }
    interface TabsState {
        activeTabIndex: number;
    }
    class Tabs extends React.Component<TabsProps, TabsState> {
        constructor(props: TabsProps);
        static defaultProps: TabsProps;
        componentWillReceiveProps(props: TabsProps): void;
        changeTabView(index: number): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface StatefulTextFieldProps extends React.HTMLProps<StatefulTextField> {
        selectOnFocus?: boolean;
        fluid?: boolean;
    }
    interface StatefulTextFieldState {
        value: string | string[];
    }
    class StatefulTextField extends React.Component<StatefulTextFieldProps, StatefulTextFieldState> {
        constructor(props: StatefulTextFieldProps);
        static defaultProps: StatefulTextFieldProps;
        input: Input;
        handleSelectOnFocus: () => void;
        handleInputChange: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    import LinkableNumber = weavejs.core.LinkableNumber;
    class ConfigUtils {
        static renderNumberEditor(linkableNumber: LinkableNumber, flex: number): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface StatefulTextAreaProps extends React.HTMLProps<StatefulTextArea> {
        selectOnFocus?: boolean;
        fluid?: boolean;
    }
    interface StatefulTextAreaState {
        value: string | string[];
    }
    class StatefulTextArea extends React.Component<StatefulTextAreaProps, StatefulTextAreaState> {
        textArea: HTMLTextAreaElement;
        constructor(props: StatefulTextAreaProps);
        static defaultProps: StatefulTextAreaProps;
        handleSelectOnFocus: () => void;
        handleTextAreaChange: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import WeaveTreeItem = weavejs.util.WeaveTreeItem;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    interface ISessionTreeProps extends React.HTMLProps<SessionStateTree> {
        root: WeaveTreeItem;
        open?: boolean;
        enableAccordion?: boolean;
        filter?: ILinkableObject;
        selectionStyle?: React.CSSProperties;
        clickHandler?: (selectedItem: WeaveTreeItem, state: boolean) => void;
    }
    interface ISessionTreeState {
        open?: boolean;
    }
    class SessionStateTree extends React.Component<ISessionTreeProps, ISessionTreeState> {
        openedItems: WeaveTreeItem[];
        filteredArray: WeaveTreeItem[];
        selectedTreeNode: any;
        selectedTreeNodeAtEachDepth: any[];
        constructor(props: ISessionTreeProps);
        state: ISessionTreeState;
        componentWillReceiveProps(nextProps: ISessionTreeProps): void;
        getChildrenTrailOfType(child: WeaveTreeItem, childCopy: WeaveTreeItem, rootParent: WeaveTreeItem, filter: any): boolean;
        private getWeaveTreeItemCopy;
        render(): JSX.Element;
    }
    interface ITreeNodeProps extends ISessionTreeProps {
        root: WeaveTreeItem;
        open?: boolean;
        filter?: ILinkableObject;
        selectionStyle?: React.CSSProperties;
        clickHandler?: (selectedItem: WeaveTreeItem, state: boolean) => void;
        manager: SessionStateTree;
        depth: number;
    }
}
declare namespace weavejs.ui {
    interface IMenuLayoutComponentProps {
        selectedItems: any;
        options: {
            label: string;
            value: any;
        }[];
        displayMode: string;
        onChange: (selectedValue: any[]) => void;
    }
    interface IMenuLayoutComponentState {
    }
    class MenuLayoutComponent extends React.Component<IMenuLayoutComponentProps, IMenuLayoutComponentState> {
        constructor(props: IMenuLayoutComponentProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    type ListOption = {
        value: any;
        label?: string | JSX.Element;
    };
    interface IListProps extends React.Props<List> {
        options: ListOption[];
        onChange?: (selectedValues: any[]) => void;
        selectedValues?: any[];
        allowClear?: boolean;
        multiple?: boolean;
        style?: React.CSSProperties;
        className?: string;
    }
    interface IListState {
        selectedValues?: any[];
    }
    class List extends React.Component<IListProps, IListState> {
        private lastSelectedIndex;
        private values;
        private labels;
        private listContainer;
        private listItems;
        constructor(props: IListProps);
        static defaultProps(): IListProps;
        numberOfOptions: number;
        componentDidMount(): void;
        componentWillReceiveProps(nextProps: IListProps): void;
        handleKeyDown: (event: __React.KeyboardEvent) => void;
        handleKeyDownOnListItem: (value: any, event: __React.KeyboardEvent) => void;
        focusNextItem(): void;
        focusPreviousItem(): void;
        focusItem(index: number): void;
        handleChange: (value: any, event: __React.MouseEvent | __React.KeyboardEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    interface ILinkableDynamicObjectComponentProps extends React.HTMLProps<LinkableDynamicObjectComponent> {
        dynamicObject: LinkableDynamicObject;
        label?: string;
    }
    interface ILinkableDynamicObjectComponentState {
        openSessionNav?: boolean;
        linkedObjectName?: string;
    }
    class LinkableDynamicObjectComponent extends SmartComponent<ILinkableDynamicObjectComponentProps, ILinkableDynamicObjectComponentState> {
        constructor(props: ILinkableDynamicObjectComponentProps);
        componentWillReceiveProps(nextProps: ILinkableDynamicObjectComponentProps): void;
        componentDidMount(): void;
        private toggleFilteredSessionNav;
        private closePopOver;
        private linkSessionObject;
        unLinkSessionObject: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface HelpIconProps extends React.HTMLProps<HelpIcon> {
    }
    interface HelpIconState {
    }
    class HelpIcon extends React.Component<HelpIconProps, HelpIconState> {
        constructor(props: HelpIconProps);
        popup: React.ReactInstance;
        removePopup(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import HBox = weavejs.ui.flexbox.HBox;
    interface IHDividedBoxState {
        activeResizerIndex?: number;
        dragging?: boolean;
        resizingLeftChildWidth?: number;
        mouseXPos?: number;
    }
    interface IHDividedBoxProps extends React.HTMLProps<HDividedBox> {
        loadWithEqualWidthChildren?: boolean;
        childMinWidth?: number;
        resizerStyle?: React.CSSProperties;
        resizerSize?: number;
    }
    class HDividedBox extends React.Component<IHDividedBoxProps, IHDividedBoxState> {
        /**
         * Creates a copy of a style object and adds { display: "flex", flexDirection: "row" }
         * @param style A style object.
         * @return A new style object.
         */
        private static style(style);
        constructor(props: React.HTMLProps<HBox>);
        private isEqualWidthChildrenRendered;
        private leftChildWidths;
        private containerWidth;
        private children;
        state: IHDividedBoxState;
        private resizerMouseDownHandler;
        private resizerMouseMoveHandler;
        private resizerMouseUpHandler;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface SideBarContainerProps extends React.Props<SideBarContainer> {
        barSize: number;
        mode?: "scale" | "resize";
        topChildren?: JSX.Element | JSX.Element[];
        bottomChildren?: JSX.Element | JSX.Element[];
        leftChildren?: JSX.Element | JSX.Element[];
        rightChildren?: JSX.Element | JSX.Element[];
    }
    interface SideBarContainerState {
    }
    /**
     * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
     */
    class SideBarContainer extends SmartComponent<SideBarContainerProps, SideBarContainerState> {
        constructor(props: SideBarContainerProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
    interface IFileInfoViewProps extends React.Props<FileInfoView> {
        fileInfo?: WeaveFileInfo;
        className?: string;
    }
    interface IFileInfoViewState {
    }
    class FileInfoView extends React.Component<IFileInfoViewProps, IFileInfoViewState> {
        element: Element;
        clipboard: Clipboard;
        defaultProps: IFileInfoViewProps;
        constructor(props: IFileInfoViewProps);
        componentDidMount(): void;
        componentDidUpdate(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface IEditableTextCellProps extends React.Props<EditableTextCell> {
        textContent?: string;
        onChange?: (newName: string) => void;
        style?: React.CSSProperties;
        emptyText?: string;
    }
    interface IEditableTextCellState {
        editMode?: Boolean;
        textContent?: string;
    }
    class EditableTextCell extends SmartComponent<IEditableTextCellProps, IEditableTextCellState> {
        constructor(props: IEditableTextCellProps);
        static defaultProps: IEditableTextCellProps;
        componentWillReceiveProps(nextProps: IEditableTextCellProps): void;
        private element;
        handleEditableContent: (event: any) => void;
        enableEditMode: () => void;
        disableEditMode: (event: MouseEvent) => void;
        setDisabledState: () => void;
        handleKeyPress: (event: any) => void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    import Div = weavejs.ui.Div;
    interface DraggableDivProps extends React.HTMLProps<DraggableDiv> {
        onReposition?: (position: DraggableDivState) => void;
        liveMoving?: boolean;
        liveResizing?: boolean;
        getExternalOverlay?: () => Div;
        resizable?: boolean;
        movable?: boolean;
        percentageMode?: boolean;
    }
    interface DraggableDivState {
        top: string | number;
        left: string | number;
        width: string | number;
        height: string | number;
    }
    class DraggableDiv extends SmartComponent<DraggableDivProps, DraggableDivState> {
        private element;
        private internalOverlay;
        private overlayStyle;
        private mouseDownBounds;
        private mouseDownOffset;
        private moving;
        private activeResizeHandle;
        constructor(props: DraggableDivProps);
        componentWillReceiveProps(props: DraggableDivProps): void;
        static defaultProps: DraggableDivProps;
        componentDidMount(): void;
        private onDragStart;
        private onResizeStart(event, handle);
        private onDrag;
        private onDragEnd;
        externalOverlay: Div;
        overlay: Div;
        updateOverlayStyle(...styles: React.CSSProperties[]): void;
        toDraggableDivState(obj: any): DraggableDivState;
        private getMouseOffset();
        private getOffsetBounds();
        private shouldLiveUpdate();
        private getNumberFromStyleValue(part, whole);
        private reposition(forceLiveUpdate?);
        componentWillUnmount(): void;
        renderResizers(): JSX.Element[];
        render(): JSX.Element;
    }
}
declare namespace weavejs.layout {
    import DraggableDivState = weavejs.ui.DraggableDivState;
    import WeavePathArray = weavejs.util.WeavePathArray;
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    interface PanelState {
        id?: WeavePathArray;
        position?: DraggableDivState;
        maximized?: boolean;
    }
    interface WindowLayoutState {
        panels: PanelState[];
        title: string;
    }
    class WindowLayout extends AbstractLayout<LayoutProps, {}> implements ILinkableVariable {
        private linkableState;
        private overlay;
        constructor(props: LayoutProps);
        setSessionState(state: WindowLayoutState): void;
        getSessionState(): WindowLayoutState;
        title: string;
        componentDidMount(): void;
        componentWillUnmount(): void;
        bringPanelForward(id: WeavePathArray): void;
        onReposition(id: WeavePathArray, position: DraggableDivState): void;
        addPanel(id: WeavePathArray): void;
        replacePanel(id: WeavePathArray, newId: WeavePathArray): void;
        static generatePosition(): DraggableDivState;
        static fudgePercent(n: number, delta: number): string;
        removePanel(id: WeavePathArray): void;
        maximizePanel(id: WeavePathArray, maximized: boolean): void;
        getPanelIds(): WeavePathArray[];
        updatePanelState(id: WeavePathArray, diff: PanelState): void;
        onDragStart(panelDragged: WeavePathArray, event: React.DragEvent): void;
        onDrag: (panelDragged: string[], event: __React.DragEvent) => void;
        onDrop: (event: __React.DragEvent) => void;
        onDragLeave: (event: __React.DragEvent) => void;
        onDragEnd: (event: __React.DragEvent) => void;
        onMouseUp: (event: MouseEvent) => void;
        onDragOver: (event: __React.DragEvent) => void;
        hideOverlay: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    type SortDirection = "ASC" | "DESC" | "NONE";
    interface ISortHeaderProps extends React.Props<SortHeaderCell> {
        onSortChange?: (columnKey: string, sortDirection: SortDirection) => void;
        sortDirection?: SortDirection;
        disableSort?: boolean;
        columnKey?: string;
    }
    const SortTypes: {
        ASC: "ASC";
        DESC: "DESC";
    };
    class SortHeaderCell extends SmartComponent<ISortHeaderProps, Object> {
        defaultProps: ISortHeaderProps;
        constructor(props: ISortHeaderProps);
        static UpArrow(props: {}): JSX.Element;
        static DownArrow(props: {}): JSX.Element;
        render(): JSX.Element;
        onSortChange: (e: __React.MouseEvent) => void;
        reverseSortDirection: (sortDirection: "ASC" | "DESC" | "NONE") => "ASC" | "DESC";
    }
    interface IDataTableProps<RowDatum> extends React.Props<DataTable<RowDatum>> {
        idProperty: string | ((row: RowDatum) => string);
        rows: RowDatum[];
        getCellValue?: (row: RowDatum, columnKey: string) => React.ReactChild;
        columnIds: string[];
        columnTitles?: {
            [columnId: string]: React.ReactChild;
        } | ((columnId: string) => React.ReactChild);
        enableHover?: boolean;
        enableSelection?: boolean;
        disableSort?: boolean;
        probedIds?: string[];
        selectedIds?: string[];
        onHover?: (id: string[]) => void;
        onSelection?: (id: string[]) => void;
        onCellDoubleClick?: (rowId: string, columnId: string) => void;
        rowHeight?: number;
        headerHeight?: number;
        initialColumnWidth?: number;
        evenlyExpandRows?: boolean;
        allowResizing?: boolean;
        width?: number;
        height?: number;
        showBottomBorder?: boolean;
        allowClear?: boolean;
        multiple?: boolean;
        sortId?: string;
        sortDirection?: SortDirection;
        /**
         *	a callback function that will be called if you want to sort the data
         *  manually. if this function is provided, the sortFunction will not be used
         **/
        onSortCallback?: (columnKey: string, sortDirection: SortDirection) => void;
        /**
         *  a sort function that will be called if you want to sort the data
         *  manually, otherwise the table will be sorted by default using plain value
         *  comparison
         **/
        sortFunction?: (rowIndexA: number, rowIndexB: number, columnKey: string) => number;
    }
    interface IDataTableState {
        columnWidths?: {
            [columnId: string]: number;
        };
        sortId?: string;
        sortDirection?: SortDirection;
        width?: number;
        height?: number;
        orderOfRows?: number[];
        probedIds?: string[];
        selectedIds?: string[];
    }
    class DataTable<RowDatum> extends SmartComponent<IDataTableProps<RowDatum>, IDataTableState> {
        private keyDown;
        private shiftDown;
        private firstIndex;
        private secondIndex;
        private lastClicked;
        private container;
        static defaultProps: IDataTableProps<any>;
        static defaultGetCellValue(row: any, columnKey: string): React.ReactChild;
        private idPropertyGetter;
        constructor(props: IDataTableProps<RowDatum>);
        componentWillReceiveProps(nextProps: IDataTableProps<RowDatum>): void;
        setIdPropertyGetter(props: IDataTableProps<RowDatum>): void;
        moveSelectedToTop(): void;
        getValue(index: number, columnKey: string): React.ReactChild;
        getId(index: number): string;
        getRowClass: (index: number) => string;
        onColumnResizeEndCallback: (newColumnWidth: number, columnKey: string) => void;
        onMouseEnter: (event: __React.MouseEvent, index: number) => void;
        onMouseLeave: (event: __React.MouseEvent, index: number) => void;
        onMouseDown: (event: __React.MouseEvent, index: number) => void;
        updateSortDirection: (columnKey: string, sortDirection: "ASC" | "DESC" | "NONE") => void;
        sortColumnIndices: (columnKey: string, sortDirection: "ASC" | "DESC" | "NONE", orderOfRows: number[]) => void;
        handleResize: (newSize: ResizingDivState) => void;
        renderCell: (props: {
            rowIndex: number;
            columnKey: string;
            height: number;
            width: number;
        }) => JSX.Element;
        getColumnTitle(columnId: string): React.ReactElement<any> | string | number;
        render(): JSX.Element;
    }
    namespace DataTable {
        interface IRow {
            [columnKey: string]: React.ReactChild;
        }
        class ObjectDataTable extends DataTable<IRow> {
        }
    }
}
declare namespace weavejs.ui {
    interface IWeaveTreeState<TreeNode> {
        selectedItems?: TreeNode[];
        openItems?: TreeNode[];
        columnWidth?: number;
    }
    interface IWeaveTreeProps<TreeNode> {
        root?: TreeNode;
        treeDescriptor?: ITreeDescriptor<TreeNode>;
        style?: any;
        hideRoot?: boolean;
        hideLeaves?: boolean;
        hideBranches?: boolean;
        filterFunc?: (node: TreeNode) => boolean;
        multipleSelection?: boolean;
        onSelect?: (selectedItems: TreeNode[]) => void;
        onExpand?: (openItems: TreeNode[]) => void;
        initialOpenItems?: TreeNode[];
        initialSelectedItems?: TreeNode[];
        onDoubleClick?: (item: TreeNode) => void;
    }
    class WeaveTree<TreeNode> extends React.Component<IWeaveTreeProps<TreeNode>, IWeaveTreeState<TreeNode>> {
        static defaultProps: IWeaveTreeProps<any>;
        constructor(props: IWeaveTreeProps<TreeNode>);
        state: IWeaveTreeState<TreeNode>;
        componentWillReceiveProps(nextProps: IWeaveTreeProps<TreeNode>): void;
        isOpen(node: TreeNode): boolean;
        private nodeArraysChanged(arrayA, arrayB);
        private areNodesEqual;
        componentDidUpdate(prevProps: IWeaveTreeProps<TreeNode>, prevState: IWeaveTreeState<TreeNode>): void;
        componentDidMount(): void;
        private internalSetOpen(node, value);
        static CLASSNAME: string;
        static BRANCH_ICON_CLASSNAME: string;
        static LEAF_ICON_CLASSNAME: string;
        static OPEN_BRANCH_ICON_CLASSNAME: string;
        static EXPANDER_CLOSED_CLASS_NAME: string;
        static EXPANDER_OPEN_CLASS_NAME: string;
        static EXPANDER_HIDDEN_CLASS_NAME: string;
        private renderItem;
        enumerateItems: (node: TreeNode, result?: [number, TreeNode][], depth?: number) => [number, TreeNode][];
        rowHeight: number;
        private lastEnumeration;
        onSelect: (indices: string[]) => void;
        computeRowWidth(rowJSX: React.ReactChild): number;
        private longestRowJSX;
        render(): JSX.Element;
    }
    interface ITreeDescriptor<Node> {
        getLabel(node: Node): string;
        isEqual(node1: Node, node2: Node): boolean;
        getChildren: (node: Node) => Node[];
        hasChildBranches: (node: Node) => boolean;
        isBranch: (node: Node) => boolean;
        addChildAt?: (parent: Node, newChild: Node, index: int) => boolean;
        removeChildAt?: (parent: Node, child: Node, index: int) => boolean;
    }
    interface IBasicTreeNode {
        label?: string;
        children?: IBasicTreeNode[];
    }
    class BasicTreeDescriptor<Node extends IBasicTreeNode> implements ITreeDescriptor<Node> {
        getLabel(node: Node): string;
        isEqual(node1: Node, node2: Node): boolean;
        getChildren(node: Node): Node[];
        isBranch(node: Node): boolean;
        hasChildBranches(node: Node): boolean;
        addChildAt(parent: Node, newChild: Node, index: int): boolean;
        removeChildAt(parent: Node, child: Node, index: int): boolean;
    }
    namespace WeaveTree {
        class BasicWeaveTree extends WeaveTree<IBasicTreeNode> {
        }
    }
}
declare namespace weavejs.ui {
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IColumnReference = weavejs.api.data.IColumnReference;
    class WeaveDataTree extends WeaveTree<IWeaveTreeNode & IColumnReference> {
        static defaultProps: IWeaveTreeProps<any>;
        constructor(props: IWeaveTreeProps<IWeaveTreeNode & IColumnReference>);
    }
}
declare namespace weavejs.ui {
    import LinkableFile = weavejs.core.LinkableFile;
    import LinkableString = weavejs.core.LinkableString;
    interface IFileSelectorProps extends React.HTMLProps<FileSelector> {
        targetUrl: LinkableFile | LinkableString;
        placeholder?: string;
        accept?: string;
        onFileChange?: () => void;
    }
    interface IFileSelectorState {
        validExtension: boolean;
    }
    class FileSelector extends React.Component<IFileSelectorProps, IFileSelectorState> {
        constructor(props: IFileSelectorProps);
        handleFileChange: (event: React.FormEvent) => void;
        componentWillReceiveProps(nextProps: IFileSelectorProps): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;
    interface BinNamesListProps {
        binningDefinition: AbstractBinningDefinition;
        showHeaderRow?: boolean;
    }
    class BinNamesList extends React.Component<BinNamesListProps, {}> {
        constructor(props: BinNamesListProps);
        componentWillReceiveProps(nextProps: BinNamesListProps): void;
        componentWillUnmount(): void;
        static defaultProps: BinNamesListProps;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import VBox = weavejs.ui.flexbox.VBox;
    interface ColorRampListProps extends React.Props<ColorRampList> {
        allColorRamps: {
            name: string;
            tags: string;
            colors: number[];
        }[];
        selectedColors?: number[];
        onChange?: (selectedRamp: number[]) => void;
    }
    interface ColorRampListState {
        selectedColors?: number[];
    }
    class ColorRampList extends React.Component<ColorRampListProps, ColorRampListState> {
        columnTitles: {
            [columnId: string]: string | JSX.Element;
        };
        tableContainer: VBox;
        tableContainerElement: HTMLElement;
        constructor(props: ColorRampListProps);
        static defaultProps: ColorRampListProps;
        private getRampNameFromRamp(selectedColors);
        componentWillReceiveProps(nextProps: ColorRampListProps): void;
        handleTableSelection: (id: string[]) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    interface ColorPickerProps extends React.Props<ColorPicker> {
        hexColor?: string;
        onChange?: (hexColor: string) => void;
        onClose?: (hexColor: string) => void;
        onClick?: (hexColor: string) => void;
        buttonMode?: boolean;
        buttonLabel?: string | React.ReactChild;
        direction?: string;
        noDefaultSize?: boolean;
        style?: React.CSSProperties;
        className?: string;
    }
    interface ColorPickerState {
        hexColor?: string;
        buttonLabel?: string | React.ReactChild;
    }
    class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
        popup: React.ReactInstance;
        element: HTMLElement;
        static BOTTOM_LEFT: string;
        static BOTTOM_RIGHT: string;
        static TOP_LEFT: string;
        static TOP_RIGHT: string;
        constructor(props: ColorPickerProps);
        componentWillReceiveProps(nextProps: ColorPickerProps): void;
        handleClick: (event: __React.MouseEvent) => void;
        handleClose: () => void;
        handleChange: (color: any) => void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    type CheckBoxOption = {
        value: any;
        label: string;
    };
    interface ICheckBoxListProps extends React.Props<CheckBoxList> {
        options: CheckBoxOption[];
        onChange?: (selectedValues: any[]) => void;
        selectedValues?: any[];
        labelPosition?: string;
    }
    interface ICheckBoxListState {
        checkboxStates: boolean[];
    }
    class CheckBoxList extends React.Component<ICheckBoxListProps, ICheckBoxListState> {
        private checkboxes;
        private values;
        private labels;
        constructor(props: ICheckBoxListProps);
        componentWillReceiveProps(nextProps: ICheckBoxListProps): void;
        handleChange(checkboxState: boolean, index: number): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface IButtonGroupProps extends React.HTMLProps<ButtonGroupBar> {
        items: string[];
        activeButton?: number | string;
        buttonStyle?: React.CSSProperties;
        activeButtonStyle?: React.CSSProperties;
        clickHandler?: Function;
    }
    interface IButtonGroupState {
        activeButton: number | string;
    }
    class ButtonGroupBar extends SmartComponent<IButtonGroupProps, IButtonGroupState> {
        constructor(props: IButtonGroupProps);
        componentWillReceiveProps(nextProps: IButtonGroupProps): void;
        private clickHandler;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import SmartComponent = weavejs.ui.SmartComponent;
    interface IHierarchyExplorerProps {
        initialSelectedItems: (IWeaveTreeNode & IColumnReference)[];
        root: IWeaveTreeNode & IColumnReference;
        onSelect: (selectedNodes: (IWeaveTreeNode & IColumnReference)[]) => void;
        onDoubleClick: (clickedNode: IWeaveTreeNode & IColumnReference) => void;
        skipSelections?: boolean;
    }
    interface IHierarchyExplorerState {
    }
    class HierarchyExplorer extends SmartComponent<IHierarchyExplorerProps, IHierarchyExplorerState> {
        constructor(props: IHierarchyExplorerProps);
        componentWillReceiveProps(nextProps: IHierarchyExplorerProps): void;
        selectedFolder: IWeaveTreeNode & IColumnReference;
        selectedItems: (IWeaveTreeNode & IColumnReference)[];
        componentDidMount(): void;
        private folderTree;
        private columnTree;
        render(): JSX.Element;
    }
}
declare namespace weavejs.layout {
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import WeavePathArray = weavejs.util.WeavePathArray;
    import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
    import ILinkableVariable = weavejs.api.core.ILinkableVariable;
    interface TabState {
        id: WeavePathArray;
        label: string;
    }
    interface TabLayoutProps extends LayoutProps {
        leadingTabs?: {
            label: React.ReactChild;
            content: JSX.Element;
        }[];
        onAdd: MenuItemProps | React.MouseEventHandler;
        onRemove: (panelId: WeavePathArray) => void;
        onTabClick: (panelId: WeavePathArray, event?: React.MouseEvent) => void;
        onTabDoubleClick: (panelId: WeavePathArray, event?: React.MouseEvent) => void;
    }
    interface TabLayoutState {
        tabs: TabState[];
        activeTabIndex: number;
        title: string;
    }
    class TabLayout extends AbstractLayout<TabLayoutProps, {}> implements ILinkableVariable {
        static DEFAULT_TAB_PREFIX: string;
        private linkableState;
        private resetTimer;
        constructor(props: TabLayoutProps);
        /**
         * This static function takes a layout session state and combines it
         * with another layout session state
         * @param into the layout to be merged into
         * @param from the layout to be merged from
         */
        static mergeLayout(into: TabLayout | LinkablePlaceholder<TabLayout>, from: TabLayout | LinkablePlaceholder<TabLayout>): void;
        getSessionState(): TabLayoutState;
        setSessionState(state: TabLayoutState): void;
        activeTabIndex: number;
        maximizePanel(): void;
        title: string;
        leadingTabsLength: number;
        activePanelId: string[];
        onDragOverTab: (panel: TabState) => void;
        onDrop: (event: __React.DragEvent) => void;
        onDragLeaveTab: () => void;
        getTabLabel(id: WeavePathArray): string;
        setTabLabel(id: WeavePathArray, newLabel: string): void;
        private switchPanelToActive;
        private getPanelIndex(id);
        getPanelIds(): WeavePathArray[];
        addPanel(id: WeavePathArray): void;
        private generateNextTabLabel();
        removePanel(id: WeavePathArray): void;
        replacePanel(id: WeavePathArray, newId: WeavePathArray): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import SessionStateLog = weavejs.core.SessionStateLog;
    interface SessionHistorySliderProps extends React.Props<SessionHistorySlider> {
        showSlider: boolean;
        stateLog: SessionStateLog;
    }
    interface SessionHistorySliderState {
        max?: number;
        position?: number;
    }
    class SessionHistorySlider extends React.Component<SessionHistorySliderProps, SessionHistorySliderState> {
        private _stateLogWatcher;
        constructor(props: SessionHistorySliderProps);
        componentWillReceiveProps(props: SessionHistorySliderProps): void;
        private _stateLog;
        private handleStateLogChange();
        handleKeyStroke: (event: KeyboardEvent) => void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        play: () => void;
        getPlayLabel: (a: number, b: string) => string;
        handleSlider(selectedValue: string[]): void;
        private _playSpeed;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    class NumericRangeDataFilterEditor extends AbstractFilterEditor {
        static OPTIONS: string[];
        forceDiscreteValues: LinkableBoolean;
        constructor(props: FilterEditorProps);
        deprecatedStateMapping: Object;
        onChange(selectedValues: number[]): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    type MetadataEntry = {
        [key: string]: any;
    };
    interface MetadataGridProps extends React.Props<MetadataGrid> {
        entries: MetadataEntry[];
        onChangeCallback: (entry: MetadataEntry) => void;
    }
    interface MetadataGridState {
        entry: MetadataEntry;
        properties?: string[];
    }
    class MetadataGrid extends React.Component<MetadataGridProps, MetadataGridState> {
        constructor(props: MetadataGridProps);
        componentWillReceiveProps(nextProps: MetadataGridProps): void;
        getEditor(entry: MetadataEntry, key: string, value: any): JSX.Element;
        getCombinedEntry(): MetadataEntry;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    const LAYOUT_LIST: string;
    const LAYOUT_COMBO: string;
    const LAYOUT_VSLIDER: string;
    const LAYOUT_HSLIDER: string;
    const LAYOUT_CHECKBOXLIST: string;
    class DiscreteValuesDataFilterEditor extends AbstractFilterEditor {
        static OPTIONS: string[];
        layoutMode: LinkableString;
        values: LinkableVariable;
        constructor(props: FilterEditorProps);
        verifyLayoutMode(value: string): boolean;
        deprecatedStateMapping: Object;
        getChoices(): FilterOption[];
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import ColorRamp = weavejs.util.ColorRamp;
    interface ColorRampEditorProps extends React.Props<ColorRampEditor> {
        colorRamp: ColorRamp;
        compact?: boolean;
        onButtonClick?: React.MouseEventHandler;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
    }
    interface ColorRampEditorState {
    }
    class ColorRampEditor extends React.Component<ColorRampEditorProps, ColorRampEditorState> {
        private colorRampWatcher;
        colorRamp: ColorRamp;
        constructor(props: ColorRampEditorProps);
        componentWillReceiveProps(nextProps: ColorRampEditorProps): void;
        private onButtonClick;
        renderColorRampSelectorForEditor: () => JSX.Element;
        renderCompactView(): JSX.Element;
        renderFullView(): JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import LinkableVariable = weavejs.core.LinkableVariable;
    interface CensusGeographyFilterProps {
        filterLinkableVariable: LinkableVariable;
        requires: string[];
        optional: string;
    }
    interface CensusGeographyFilterState {
    }
    class CensusGeographyFilter extends React.Component<CensusGeographyFilterProps, CensusGeographyFilterState> {
        constructor(props: CensusGeographyFilterProps);
        private state_fips;
        private county_fips;
        onFilterChange: (geoLevel: string, value: string) => void;
        renderFilter: (scope: string) => JSX.Element;
        render(): JSX.Element;
    }
    interface CensusGeographyFilterColumnProps {
        geoLevel: string;
        parentGeo?: string;
        required: boolean;
        options: {
            fips: string;
            name: string;
        }[];
        selection?: string;
        onChange?: (geoLevel: string, value: string) => void;
    }
    interface CensusGeographyFilterColumnState {
        selection?: string;
        enabled?: boolean;
    }
    class CensusGeographyFilterColumn extends React.Component<CensusGeographyFilterColumnProps, CensusGeographyFilterColumnState> {
        constructor(props: CensusGeographyFilterColumnProps);
        state: CensusGeographyFilterColumnState;
        componentWillReceiveProps(nextProps: CensusGeographyFilterColumnProps): void;
        componentDidUpdate(prevProps: CensusGeographyFilterColumnProps, prevState: CensusGeographyFilterColumnState): void;
        updateEnabled: (event: React.FormEvent) => void;
        updateSelection: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import CSVDataSource = weavejs.data.source.CSVDataSource;
    interface CSVMetadataEditorProps extends React.Props<CSVMetadataEditor> {
        datasource: CSVDataSource;
        onChangeCallback: (newMetadata: MetadataEntry, selectedIds: Array<number | string>) => void;
    }
    interface CSVMetadataEditorState {
        selected?: Array<number | string>;
        columnIds?: Array<number | string>;
    }
    class CSVMetadataEditor extends React.Component<CSVMetadataEditorProps, CSVMetadataEditorState> {
        constructor(props: CSVMetadataEditorProps);
        setSelectedColumnIds: (columnIds: (number | string)[]) => void;
        getSelectedColumnIds(): Array<number | string>;
        handleMetadataChange: (entry: {
            [key: string]: any;
        }) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    import SmartComponent = weavejs.ui.SmartComponent;
    interface PopupWindowProps extends React.Props<PopupWindow> {
        context: React.ReactInstance;
        title?: React.ReactChild;
        content?: React.ReactChild;
        modal?: boolean;
        resizable?: boolean;
        draggable?: boolean;
        top?: number;
        left?: number;
        width?: number | string;
        height?: number | string;
        footerContent?: JSX.Element;
        onOk?: Function;
        onCancel?: Function;
        onClose?: Function;
        suspendEnter?: boolean;
    }
    interface PopupWindowState {
        content?: JSX.Element;
    }
    class PopupWindow extends SmartComponent<PopupWindowProps, PopupWindowState> {
        private minWidth;
        private minHeight;
        private element;
        private popup;
        private mouseDownOffset;
        constructor(props: PopupWindowProps);
        static defaultProps: {
            resizable: boolean;
            draggable: boolean;
            suspendEnter: boolean;
        };
        static open(props: PopupWindowProps): PopupWindow;
        static generateOpener(propsGetter: () => PopupWindowProps): () => PopupWindow;
        bringToFront(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        onKeyDown: (event: KeyboardEvent) => void;
        private onOk();
        private onCancel();
        /**
         * Given an Element or React Component, uses ReactUtils.findComponent() to find the enclosing PopupWindow and close it.
         */
        static close(instance: React.ReactInstance): void;
        close(): void;
        renderOverlay(modal: boolean): JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import Dictionary2D = weavejs.util.Dictionary2D;
    import PopupWindow = weavejs.dialog.PopupWindow;
    import PopupWindowProps = weavejs.dialog.PopupWindowProps;
    class ControlPanel extends PopupWindow {
        static d2d_weave_class_popup: Dictionary2D<Weave, typeof React.Component, PopupWindow>;
        static openInstance<P>(weave: Weave, ComponentType: new (..._: any[]) => React.Component<P, any>, popupProps?: PopupWindowProps, componentProps?: P): ControlPanel;
    }
}
declare namespace weavejs.ui {
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    interface IColumnSelectorProps {
        attributeName: string;
        attributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
        showAsList?: boolean;
        style?: React.CSSProperties;
    }
    interface IColumnSelectorState {
    }
    class ColumnSelector extends React.Component<IColumnSelectorProps, IColumnSelectorState> {
        constructor(props: IColumnSelectorProps);
        componentWillReceiveProps(nextProps: IColumnSelectorProps): void;
        private comboBox;
        private lastActiveNode;
        private weaveRoot;
        private weaveRootTreeNode;
        static findSelectableAttributes(attribute: IColumnWrapper | ILinkableHashMap, defaultLabel?: string): [string, Map<string, IColumnWrapper | ILinkableHashMap>];
        private static getDataSourceDependencies(attribute);
        private setColumn;
        setColumnInHashmap: (selectedOptions: IWeaveTreeNode[]) => void;
        private columnsHashmap;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ControlPanel = weavejs.editor.ControlPanel;
    interface IAttributeSelectorProps {
        attributeName?: string;
        attributes: Map<string, (IColumnWrapper | ILinkableHashMap)>;
    }
    interface IAttributeSelectorState {
        selectedAttributeName?: string;
    }
    class AttributeSelector extends SmartComponent<IAttributeSelectorProps, IAttributeSelectorState> {
        private rootNode;
        constructor(props: IAttributeSelectorProps);
        private usingHashMap;
        private selectedAttribute;
        private selectedColumnRefs;
        componentDidMount(): void;
        componentWillReceiveProps(nextProps: IAttributeSelectorProps): void;
        componentWillUpdate(nextProps: IAttributeSelectorProps, nextState: IAttributeSelectorState): void;
        onButtonBarClick: (event: __React.MouseEvent, name?: string, index?: number) => void;
        private addColumns(refs);
        onAddSelected: () => void;
        onSelectAll: () => void;
        onDoubleClick: (item: IWeaveTreeNode) => void;
        onSelectColumn: (selectedItems: IWeaveTreeNode[]) => void;
        getSelectedTreeNodes(): (IWeaveTreeNode & IColumnReference)[];
        static openInstance(context: React.ReactInstance, attributeName: string, attributes: Map<string, IColumnWrapper | ILinkableHashMap>): ControlPanel;
        private selectableAttributeComponentKey;
        private hierarchyExplorer;
        render(): JSX.Element;
    }
}
declare namespace weavejs.ui {
    import ControlPanel = weavejs.editor.ControlPanel;
    interface ISelectableAttributeComponentProps extends IColumnSelectorProps {
    }
    interface ISelectableAttributeComponentState {
    }
    class SelectableAttributeComponent extends React.Component<ISelectableAttributeComponentProps, ISelectableAttributeComponentState> {
        constructor(props: ISelectableAttributeComponentProps);
        renderAttributeSelectorForEditor: (attributeName: string) => React.ReactElement<any> | string | number;
        launchAttributeSelector: (attributeName: string) => ControlPanel;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import SmartComponent = weavejs.ui.SmartComponent;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import BinnedColumn = weavejs.data.column.BinnedColumn;
    import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    interface BinningDefinitionEditorProps {
        showNoneOption?: boolean;
        binnedColumn: BinnedColumn;
        compact?: boolean;
        onButtonClick?: React.MouseEventHandler;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
        insertTableRows?: React.ReactChild[][];
    }
    interface BinningDefinitionEditorState {
    }
    class BinningDefinitionEditor extends React.Component<BinningDefinitionEditorProps, BinningDefinitionEditorState> {
        static binClassToBinLabel: Map<typeof AbstractBinningDefinition, string>;
        constructor(props: BinningDefinitionEditorProps);
        onBinButtonClick: (event: __React.MouseEvent) => void;
        renderBinningDefinitionSelectorForEditor: () => JSX.Element;
        renderCompactView(): JSX.Element;
        renderFullView(): JSX.Element;
        render(): JSX.Element;
    }
    interface BinningDefinitionSelectorProps {
        showNoneOption?: boolean;
        attributeName: string;
        attributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
        insertTableRows?: React.ReactChild[][];
    }
    interface BinningDefinitionSelectorState {
    }
    class BinningDefinitionSelector extends SmartComponent<BinningDefinitionSelectorProps, BinningDefinitionSelectorState> {
        private _simple;
        private _customSplit;
        private _quantile;
        private _equalInterval;
        private _stdDev;
        private _category;
        private _jenks;
        private _allBinDefs;
        private binLabelToBin;
        static defaultProps: BinningDefinitionSelectorProps;
        constructor(props: BinningDefinitionSelectorProps);
        column: BinnedColumn;
        getColumn(props: BinningDefinitionSelectorProps): BinnedColumn;
        componentWillReceiveProps(nextProps: BinningDefinitionSelectorProps): void;
        private handleBinnedColumnChange(binnedColumn);
        private compareTargetBinningType(localDef);
        private updateTargetBinningDef();
        private linkOverride(property);
        setBinningDefinition(localDef: AbstractBinningDefinition): void;
        private linkBinningDefinition(value);
        private hasOverrideMinAndMax();
        private getBinDefRenderProps(binDef);
        render(): JSX.Element;
    }
}
declare namespace weavejs.api.ui {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
    interface IVisToolProps {
    }
    interface IVisToolState {
    }
    interface IVisTool extends ISelectableAttributes {
        title: string;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
    }
    class IVisTool {
        static renderSelectableAttributes(selectableAttributes: Map<string, (IColumnWrapper | ILinkableHashMap)>, pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void): React.ReactChild[][];
    }
}
declare namespace weavejs.tool.oltool.layer {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import LinkableString = weavejs.core.LinkableString;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
    type EditableField = [LinkableBoolean | LinkableString | LinkableNumber, (string | {
        label: string;
        value: any;
    })[]] | LinkableVariable | IFilteredKeySet;
    import Bounds2D = weavejs.geom.Bounds2D;
    import IOpenLayersMapTool = weavejs.tool.oltool.IOpenLayersMapTool;
    class AbstractLayer implements ILinkableObject {
        opacity: LinkableNumber;
        visible: LinkableBoolean;
        selectable: LinkableBoolean;
        private projectionSRS;
        deprecatedStateMapping: Object;
        getExtent(): Bounds2D;
        static selectableLayerFilter(layer: ol.layer.Base): boolean;
        private renderEditableField(value, key);
        renderEditableFields(): React.ReactChild[][];
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        editableFields: Map<string, [LinkableBoolean | LinkableString | LinkableNumber, (string | {
            label: string;
            value: any;
        })[]] | LinkableVariable | IFilteredKeySet>;
        selectableAttributes: Map<string, IColumnWrapper>;
        constructor();
        onLayerReady(): void;
        updateProjection(): void;
        parent: IOpenLayersMapTool;
        private _source;
        source: ol.source.Source;
        private _olLayer;
        private addAndConfigureLayer();
        olLayer: ol.layer.Layer;
        outputProjection: string;
        getDescription(): string;
        dispose(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    class TileLayer extends AbstractLayer {
        oldProviderName: string;
        provider: LinkableString;
        providerOptions: LinkableVariable;
        renderEditor: () => JSX.Element;
        getExtent(): geom.Bounds2D;
        constructor();
        onLayerReady(): void;
        onProviderChange(): void;
        updateProjection(): void;
        static STAMEN_LAYERS: string[];
        static MAPQUEST_LAYERS: string[];
        deprecatedStateMapping: {};
        private static isXYZString(url);
        private getSource();
        updateTileSource(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import KeySet = weavejs.data.key.KeySet;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import ExtendedDynamicColumn = weavejs.data.column.ExtendedDynamicColumn;
    import AbstractLayer = weavejs.tool.oltool.layer.AbstractLayer;
    abstract class AbstractFeatureLayer extends AbstractLayer {
        private updateMetaStyle;
        private debounced_updateMetaStyles;
        private changedItems;
        filteredKeySet: FilteredKeySet;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
        private _cachedRequiredAttributes;
        protected getRequiredAttributes(): (DynamicColumn | ExtendedDynamicColumn)[];
        requiredAttributes: (DynamicColumn | ExtendedDynamicColumn)[];
        getExtent(): geom.Bounds2D;
        inputProjection: string;
        selectionKeySet: KeySet;
        isSelected(key: IQualifiedKey): boolean;
        probeKeySet: KeySet;
        isProbed(key: IQualifiedKey): boolean;
        editableFields: Map<string, [core.LinkableBoolean | core.LinkableString | core.LinkableNumber, (string | {
            label: string;
            value: any;
        })[]] | core.LinkableVariable | api.data.IFilteredKeySet>;
        styleResolutionDependent: boolean;
        source: ol.source.Vector;
        constructor();
        onLayerReady(): void;
        onFeatureAdd(vectorEvent: any): void;
        onFeaturePropertyChange(objectEvent: any): void;
        abstract updateStyleData(): void;
        getToolTipColumns(): Array<any>;
        static toColorArray(color: string | number, alpha: any): any;
        static toColorRGBA(colorString: any, alpha: any): string;
        updateSetFromKeySet(keyFilter: DynamicKeyFilter, previousContents: Set<IQualifiedKey>): void;
        updateMetaStyles(): void;
        updateMetaStyle_unbound(feature: any): void;
        static olFillFromWeaveFill(fill: any, fade?: any): ol.style.Fill;
        static olStrokeFromWeaveStroke(stroke: any, fade?: number): ol.style.Stroke;
        static getOlProbedStyle(baseStrokeStyle: any): Array<ol.style.Style>;
        static getOlSelectionStyle(baseStrokeStyle: any): Array<ol.style.Style>;
        static SELECT_WIDTH: number;
        static PROBE_HALO_WIDTH: number;
        static PROBE_LINE_WIDTH: number;
        static Styles: Object;
    }
    interface MetaStyleProperties {
        normalStyle: ol.style.Style | Array<ol.style.Style>;
        unselectedStyle: ol.style.Style | Array<ol.style.Style>;
        selectedStyle: ol.style.Style | Array<ol.style.Style>;
        probedStyle: ol.style.Style | Array<ol.style.Style>;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import AbstractFeatureLayer = weavejs.tool.oltool.layer.AbstractFeatureLayer;
    class GeometryLayer extends AbstractFeatureLayer {
        private geoJsonParser;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        geometryColumn: DynamicColumn;
        radius: AlwaysDefinedColumn;
        protected getRequiredAttributes(): (DynamicColumn | data.column.ExtendedDynamicColumn)[];
        selectableAttributes: Map<string, api.data.IColumnWrapper>;
        editableFields: Map<string, [LinkableBoolean | core.LinkableString | core.LinkableNumber, (string | {
            label: string;
            value: any;
        })[]] | core.LinkableVariable | api.data.IFilteredKeySet>;
        private radiusNorm;
        private radiusData;
        constructor();
        onLayerReady(): void;
        updateProjection(): void;
        deprecatedStateMapping: {};
        inputProjection: any;
        updateGeometryData(): void;
        getToolTipColumns(): IAttributeColumn[];
        updateStyleData(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import LinkableString = weavejs.core.LinkableString;
    abstract class AbstractGlyphLayer extends AbstractFeatureLayer {
        dataX: DynamicColumn;
        dataY: DynamicColumn;
        sourceProjection: LinkableString;
        editableFields: Map<string, [core.LinkableBoolean | LinkableString | core.LinkableNumber, (string | {
            label: string;
            value: any;
        })[]] | core.LinkableVariable | api.data.IFilteredKeySet>;
        selectableAttributes: Map<string, api.data.IColumnWrapper>;
        protected getRequiredAttributes(): (DynamicColumn | data.column.ExtendedDynamicColumn)[];
        constructor();
        inputProjection: any;
        onLayerReady(): void;
        _getFeatureIds(): any[];
        updateProjection(): void;
        static _projectionErrorsShown: Set<string>;
        updateLocations(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import AbstractGlyphLayer = weavejs.tool.oltool.layer.AbstractGlyphLayer;
    class ScatterPlotLayer extends AbstractGlyphLayer {
        selectableAttributes: Map<string, IColumnWrapper>;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        radius: AlwaysDefinedColumn;
        private radiusNorm;
        private radiusData;
        constructor();
        onLayerReady(): void;
        deprecatedStateMapping: {};
        getToolTipColumns(): IAttributeColumn[];
        static getSelectedStyle(record: any, strokeEnabled: boolean, fillEnabled: boolean, olSelectionStyle: Array<ol.style.Style>): Array<ol.style.Style>;
        static getProbedStyle(record: any, strokeEnabled: boolean, fillEnabled: boolean, olProbedStyle: Array<ol.style.Style>): Array<ol.style.Style>;
        static getNormalStyle(record: any, strokeEnabled: boolean, fillEnabled: boolean, olStroke: ol.style.Stroke, olFill: ol.style.Fill): Array<ol.style.Style>;
        static getUnselectedStyle(record: any, strokeEnabled: boolean, fillEnabled: boolean, olStrokeFaded: ol.style.Stroke, olFillFaded: ol.style.Fill): Array<ol.style.Style>;
        updateStyleData(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import AbstractGlyphLayer = weavejs.tool.oltool.layer.AbstractGlyphLayer;
    class LabelLayer extends AbstractGlyphLayer {
        size: AlwaysDefinedColumn;
        text: DynamicColumn;
        color: AlwaysDefinedColumn;
        sortColumn: DynamicColumn;
        hideOverlappingText: LinkableBoolean;
        selectableAttributes: Map<string, api.data.IColumnWrapper>;
        editableFields: Map<string, [LinkableBoolean | core.LinkableString | core.LinkableNumber, (string | {
            label: string;
            value: any;
        })[]] | core.LinkableVariable | api.data.IFilteredKeySet>;
        deprecatedStateMapping: {};
        protected getRequiredAttributes(): (DynamicColumn | data.column.ExtendedDynamicColumn)[];
        constructor();
        onLayerReady(): void;
        updateStyleData(): void;
    }
}
declare namespace weavejs.tool.oltool.layer {
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import AbstractGlyphLayer = weavejs.tool.oltool.layer.AbstractGlyphLayer;
    class ImageGlyphLayer extends AbstractGlyphLayer {
        private imageGlyphCache;
        imageSize: AlwaysDefinedColumn;
        imageURL: AlwaysDefinedColumn;
        dataAlpha: AlwaysDefinedColumn;
        dataColor: AlwaysDefinedColumn;
        selectableAttributes: Map<string, api.data.IColumnWrapper>;
        constructor();
        onLayerReady(): void;
        getToolTipColumns(): IAttributeColumn[];
        setIconStyle(feature: ol.Feature, img: any, iconSize: number, alpha: number): void;
        updateStyleData(): void;
        deprecatedStateMapping: {};
    }
}
declare namespace weavejs.tool.oltool {
    class ProbeInteraction extends ol.interaction.Pointer {
        private topKey;
        private topZIndex;
        private topKeySet;
        private topLayer;
        private tool;
        private toolTip;
        constructor(tool: OpenLayersMapTool);
        setMap(map: ol.Map): void;
        private onFeatureAtPixel(feature, layer);
        private pixelToKey(pixel);
        private handleMoveEvent(event);
        handleOutEvent(event: MouseEvent): void;
    }
}
declare namespace weavejs.tool.oltool {
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import AbstractLayer = weavejs.tool.oltool.layer.AbstractLayer;
    interface ILayerManagerState {
        selectedLayer?: AbstractLayer;
        openedLayer?: AbstractLayer;
    }
    interface ILayerManagerProps extends React.HTMLProps<LayerManager> {
        layers: LinkableHashMap;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
        selectedLayer?: AbstractLayer;
        onLayerSelection?: Function;
    }
    class LayerManager extends React.Component<ILayerManagerProps, ILayerManagerState> {
        constructor(props: ILayerManagerProps);
        componentWillReceiveProps(nextProps: ILayerManagerProps): void;
        onEditLayerClick: (layer: AbstractLayer) => void;
        generateItem: (layer: AbstractLayer, index: number) => JSX.Element;
        moveSelectedUp: () => void;
        moveSelectedDown: () => void;
        removeSelected: () => void;
        selectionIndex: number;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.oltool {
    class DragSelection extends ol.interaction.DragBox {
        private mode;
        private _probeInteraction;
        constructor();
        private boxEndCondition(mapBrowserEvent, startPixel, endPixel);
        private probeInteraction;
        onBoxStart(event: any): void;
        updateSelection(extent: any): void;
        onBoxDrag(event: any): void;
        onBoxEnd(event: any): void;
    }
}
declare namespace weavejs.tool.oltool {
    import AbstractLayer = weavejs.tool.oltool.layer.AbstractLayer;
    import PanCluster = weavejs.tool.oltool.PanCluster;
    import InteractionModeCluster = weavejs.tool.oltool.InteractionModeCluster;
    import CustomZoomToExtent = weavejs.tool.oltool.CustomZoomToExtent;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IAltText = weavejs.api.ui.IAltText;
    import IAltTextConfig = weavejs.api.ui.IAltTextConfig;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import ZoomBounds = weavejs.geom.ZoomBounds;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import EventCallbackCollection = weavejs.core.EventCallbackCollection;
    import Bounds2D = weavejs.geom.Bounds2D;
    import IOpenLayersMapTool = weavejs.tool.oltool.IOpenLayersMapTool;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    interface MapEventData {
        map: OpenLayersMapTool;
        mapEvent: ol.MapBrowserEvent;
        type: string;
        key: IQualifiedKey;
        layer: AbstractLayer;
    }
    class OpenLayersMapTool extends React.Component<IVisToolProps, IVisToolState> implements IOpenLayersMapTool, IAltText {
        static isGeomColumnOrRef(column: (IAttributeColumn | IColumnReference)): boolean;
        private static controlIndex;
        altText: IAltTextConfig;
        getAutomaticDescription(): string;
        setOverrideExtent: () => void;
        clearOverrideExtent: () => void;
        overrideExtentDefined: () => boolean;
        overrideSet(): boolean;
        map: ol.Map;
        centerCallbackHandle: any;
        resolutionCallbackHandle: any;
        private element;
        zoomBounds: ZoomBounds;
        extentOverride: OverrideBounds;
        projectionSRS: LinkableString;
        interactionMode: LinkableString;
        enableMouseWheel: LinkableBoolean;
        layers: LinkableHashMap;
        panelTitle: LinkableString;
        snapZoomToBaseMap: LinkableBoolean;
        maxZoomLevel: LinkableNumber;
        minZoomLevel: LinkableNumber;
        zoomExtent: CustomZoomToExtent;
        zoomButtons: ol.control.Zoom;
        zoomSlider: ol.control.ZoomSlider;
        panButtons: PanCluster;
        mouseModeButtons: InteractionModeCluster;
        showZoomButtons: LinkableBoolean;
        showZoomSlider: LinkableBoolean;
        showPanButtons: LinkableBoolean;
        showZoomExtentButton: LinkableBoolean;
        showMouseModeControls: LinkableBoolean;
        toolPadding: LinkableNumber;
        controlLocation: LinkableVariable;
        title: string;
        constructor(props: IVisToolProps);
        private initLater();
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        deprecatedStateMapping: Object;
        static matchesLayerSettings: (value: any) => boolean;
        deprecatedPathRewrite(relativePath: string[]): string[];
        updateCursor(): void;
        events: EventCallbackCollection<MapEventData>;
        private _stopEventPropagation;
        stopEventPropagation(): void;
        handleGenericEvent: (event: ol.MapBrowserEvent) => boolean;
        initializeMap(): void;
        updateViewParameters_weaveToOl(): void;
        private _lastSize;
        handleFrame(): void;
        private updateControl(lbool, control);
        private updateControls_weaveToOl();
        private updateControlPositions();
        updateCenter_olToWeave(): void;
        updateResolutionDependentStyles(event: ol.MapEvent): void;
        updateZoom_olToWeave(): void;
        updateZoomAndCenter_weaveToOl(): void;
        getDefaultProjection(): string;
        requestDetail(): void;
        updateResolutionSnapping(): void;
        updatePlotters_weaveToOl(): void;
        hasNonEmptySelection(): boolean;
        getMenuItems(): MenuItemProps[];
        defaultPanelTitle: string;
        getExtent(): Bounds2D;
        zoomToSelection(inputKeys?: Array<IQualifiedKey>, zoomMarginPercent?: number): void;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        componentDidMount(): void;
        render(): JSX.Element;
    }
    interface IOpenLayersMapToolEditorState {
        selectedLayer: AbstractLayer;
    }
    interface IOpenLayersMapToolEditorProps {
        tool: OpenLayersMapTool;
        pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
    }
}
declare namespace weavejs.tool {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    class TextTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {
        htmlText: LinkableString;
        padding: LinkableNumber;
        panelBackgroundColor: LinkableNumber;
        panelBorderColor: LinkableNumber;
        private element;
        private textToolContainerClass;
        constructor(props: IVisToolProps);
        panelTitle: LinkableString;
        altText: LinkableString;
        title: string;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        getTitlesEditor(): React.ReactChild[][];
        renderEditor: (pushCrumb?: Function) => JSX.Element;
        deprecatedStateMapping: {
            "htmlText": LinkableString;
            "padding": LinkableNumber;
            "panelBackgroundColor": LinkableNumber;
            "panelBorderColor": LinkableNumber;
        };
        componentDidUpdate(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
    import EventCallbackCollection = weavejs.core.EventCallbackCollection;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisTool = weavejs.api.ui.IVisTool;
    import DataTable = weavejs.ui.DataTable;
    interface IDataTableState extends IVisToolState {
        width?: number;
        height?: number;
    }
    interface TableEventData {
        key: IQualifiedKey;
        column: IAttributeColumn;
    }
    class AttributeColumnTable extends DataTable<IQualifiedKey> {
    }
    class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool, IInitSelectableAttributes {
        attributeColumnTable: AttributeColumnTable;
        columns: LinkableHashMap;
        sortFieldIndex: LinkableNumber;
        columnWidth: LinkableNumber;
        rowHeight: LinkableNumber;
        headerHeight: LinkableNumber;
        sortInDescendingOrder: LinkableBoolean;
        panelTitle: LinkableString;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
        filteredKeySet: FilteredKeySet;
        private selectionKeySet;
        private probeKeySet;
        altText: LinkableString;
        idProperty: string;
        constructor(props: IVisToolProps);
        deprecatedStateMapping: {
            showKeyColumn: (value: boolean) => void;
        };
        handleShowKeyColumn: (value: boolean) => void;
        keyColumnShown: boolean;
        title: string;
        componentDidMount(): void;
        componentDidUpdate(): void;
        getMenuItems(): MenuItemProps[];
        dataChanged(): void;
        handleProbe: (ids: string[]) => void;
        handleSelection: (ids: string[]) => void;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        static MAX_DEFAULT_COLUMNS: number;
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        getTitlesEditor(): React.ReactChild[][];
        onSort: (columnKey: string, sortDirection: "ASC" | "DESC" | "NONE") => void;
        events: EventCallbackCollection<TableEventData>;
        handleCellDoubleClick: (rowId: string, columnKey: string) => void;
        getCellValue: (row: IQualifiedKey, columnKey: string) => React.ReactElement<any> | string | number;
        getColumnTitle: (columnKey: string) => React.ReactElement<any> | string | number;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import ResizingDivState = weavejs.ui.ResizingDivState;
    import SmartComponent = weavejs.ui.SmartComponent;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    type Record = {
        id: IQualifiedKey;
        value: number;
        fill: {
            color: string;
        };
        line: {
            color: string;
        };
    };
    interface ISparklineProps extends IVisToolProps {
        width?: number;
        height?: number;
    }
    interface ISparklineState extends IVisToolState {
        data?: number[][];
        width?: number;
        height?: number;
    }
    class Sparkline extends SmartComponent<ISparklineProps, ISparklineState> implements IVisTool, IInitSelectableAttributes {
        columns: LinkableHashMap;
        sortColumn: DynamicColumn;
        labelColumn: DynamicColumn;
        chartType: LinkableString;
        orientationMode: LinkableString;
        referenceLineMode: LinkableString;
        showAllRecords: LinkableBoolean;
        showRowLabels: LinkableBoolean;
        showNormalBands: LinkableBoolean;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        marginTop: LinkableNumber;
        marginBottom: LinkableNumber;
        marginLeft: LinkableNumber;
        marginRight: LinkableNumber;
        panelTitle: LinkableString;
        altText: LinkableString;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
        filteredKeySet: FilteredKeySet;
        private records;
        private toolTip;
        private verifyChartMode(mode);
        private verifyOrientationMode(mode);
        private verifyReferenceLineMode(mode);
        private selectionKeySet;
        private probeKeySet;
        protected isSelected(key: IQualifiedKey): boolean;
        protected isProbed(key: IQualifiedKey): boolean;
        constructor(props: ISparklineProps);
        title: string;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        getTitleEditor(): React.ReactChild[][];
        getMarginEditor(): React.ReactChild[][];
        getAltTextEditor(): React.ReactChild[][];
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: {
            "columns": LinkableHashMap;
            "sortColumn": DynamicColumn;
        };
        componentDidUpdate(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        handleResize: (newSize: ResizingDivState) => void;
        dataChanged(): void;
        getInteractedRecords(): Record[];
        /**
         * Gets the Sparkline reference line component depending on the mode
         * @param mode - The Sparkline reference line drawing mode
         */
        getReferenceLineComponent(mode: string): JSX.Element;
        /**
         * Gets the Spark Line component depending on the mode
         * @param mode - The Sparkline drawing mode
         * @returns React.ReactChild - returns the Sparkline to be displayed
         */
        getLineComponent(mode: string, style: React.CSSProperties): React.ReactChild;
        handleClick: (record: {
            id: IQualifiedKey;
            value: number;
            fill: {
                color: string;
            };
            line: {
                color: string;
            };
        }, event: __React.MouseEvent) => void;
        handleProbe: (record: {
            id: IQualifiedKey;
            value: number;
            fill: {
                color: string;
            };
            line: {
                color: string;
            };
        }, mouseOver: boolean, event: __React.MouseEvent) => void;
        getSparklines(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    class DataMessageTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {
        constructor(props: IVisToolProps);
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        panelTitle: LinkableString;
        messageTarget: LinkableDynamicObject;
        keySetSource: DynamicKeyFilter;
        command: LinkableString;
        title: string;
        defaultPanelTitle: string;
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        sendMessage: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import LinkableString = weavejs.core.LinkableString;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties {
        filter: LinkableDynamicObject;
        filterEditor: LinkableDynamicObject;
        altText: LinkableString;
        constructor(props: IVisToolProps);
        private initLater();
        private _editorDiff;
        private handleFilterWatcher();
        private handleEditor();
        private setEditorType(editorType, editorDiff);
        deprecatedStateMapping: {
            "editor": LinkableDynamicObject;
            "filter": LinkableDynamicObject;
        };
        private getFilter();
        private getFilterEditor();
        private getFilterColumn();
        handleMissingSessionStateProperty(newState: any, property: String): void;
        title: string;
        selectableAttributes: Map<string, IColumnWrapper | LinkableHashMap>;
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        render(): JSX.Element;
    }
    interface IDataFilterEditorState {
    }
    interface IDataFilterEditorProps {
        filterEditor: LinkableDynamicObject;
        selectableAttributes: Map<string, (IColumnWrapper | LinkableHashMap)>;
        pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void;
    }
}
declare namespace weavejs.tool {
    import CSSProperties = React.CSSProperties;
    import ColorRamp = weavejs.util.ColorRamp;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicKeySet = weavejs.data.key.DynamicKeySet;
    import LinkableString = weavejs.core.LinkableString;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    class BarChartLegend extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties {
        chartColors: ColorRamp;
        columns: LinkableHashMap;
        panelTitle: LinkableString;
        shapeSize: LinkableNumber;
        filteredKeySet: FilteredKeySet;
        selectionKeySet: DynamicKeySet;
        probeKeySet: DynamicKeySet;
        altText: LinkableString;
        private spanStyle;
        constructor(props: IVisToolProps);
        title: string;
        handleClick(label: number, temp: any): void;
        handleProbe(bin: number, mouseOver: boolean): void;
        getInteractionStyle(bin: number): CSSProperties;
        render(): JSX.Element;
        selectableAttributes: Map<string, IColumnWrapper | LinkableHashMap>;
        renderEditor: () => JSX.Element;
        deprecatedStateMapping: {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": FilteredKeySet;
                                "chartColors": ColorRamp;
                                "columns": LinkableHashMap;
                                "shapeSize": LinkableNumber;
                            };
                        };
                    };
                };
            };
            "panelTitle": LinkableString;
        };
    }
}
declare namespace weavejs.tool {
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import LinkableWatcher = weavejs.core.LinkableWatcher;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisTool = weavejs.api.ui.IVisTool;
    interface IAttributeMenuToolState extends IVisToolState {
    }
    class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool {
        constructor(props: IVisToolProps);
        panelTitle: LinkableString;
        choices: LinkableHashMap;
        layoutMode: LinkableString;
        selectedAttribute: LinkableString;
        targetToolPath: LinkableVariable;
        targetAttribute: LinkableString;
        toolWatcher: LinkableWatcher;
        altText: LinkableString;
        verifyLayoutMode(value: string): boolean;
        setToolWatcher: () => void;
        title: string;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        options: {
            label: string;
            value: IAttributeColumn;
        }[];
        handleSelection: (selectedValue: any) => void;
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IGetMenuItems = weavejs.ui.menu.IGetMenuItems;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import KeySet = weavejs.data.key.KeySet;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import LinkableString = weavejs.core.LinkableString;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
    import IAltText = weavejs.api.ui.IAltText;
    import IAltTextConfig = weavejs.api.ui.IAltTextConfig;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    class Margin {
        top: LinkableNumber;
        bottom: LinkableNumber;
        left: LinkableNumber;
        right: LinkableNumber;
    }
    class OverrideBounds {
        xMin: LinkableNumber;
        yMin: LinkableNumber;
        xMax: LinkableNumber;
        yMax: LinkableNumber;
    }
    interface VisToolGroup {
        filteredKeySet: FilteredKeySet;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
    }
    class AbstractVisTool<P extends IVisToolProps, S extends IVisToolState> extends React.Component<P, S> implements IVisTool, ILinkableObjectWithNewProperties, IGetMenuItems, IInitSelectableAttributes, IAltText {
        constructor(props: P);
        componentDidMount(): void;
        panelTitle: LinkableString;
        altText: IAltTextConfig;
        xAxisName: LinkableString;
        yAxisName: LinkableString;
        margin: Margin;
        overrideBounds: OverrideBounds;
        filteredKeySet: FilteredKeySet;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
        protected selectionKeySet: KeySet;
        protected isSelected(key: IQualifiedKey): boolean;
        protected probeKeySet: KeySet;
        protected isProbed(key: IQualifiedKey): boolean;
        title: string;
        getAutomaticDescription(): string;
        defaultPanelTitle: string;
        defaultXAxisLabel: string;
        defaultYAxisLabel: string;
        selectableAttributes: Map<string, (IColumnWrapper | ILinkableHashMap)>;
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        static initSelectableAttributes(selectableAttributes: Map<string, (IColumnWrapper | ILinkableHashMap)>, input: (IAttributeColumn | IColumnReference)[]): void;
        private static createFromSetToSubset(set, filter);
        private static removeFromSetToSubset(set, filter);
        private static clearSubset(filter);
        private static localProbeKeySet;
        static getMenuItems(target: VisToolGroup): MenuItemProps[];
        getMenuItems(): MenuItemProps[];
        getSelectableAttributesEditor(pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void): React.ReactChild[][];
        renderNumberEditor(linkableNumber: LinkableNumber, flex: number): JSX.Element;
        getMarginEditor(): React.ReactChild[][];
        getTitlesEditor(): React.ReactChild[][];
        getAltTextEditor(): React.ReactChild[][];
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: Object;
        static handlePointClick(toolGroup: VisToolGroup, event: MouseEvent): void;
    }
}
declare namespace weavejs.tool.d3tool {
    import AbstractVisTool = weavejs.tool.AbstractVisTool;
    import ResizingDiv = weavejs.ui.ResizingDiv;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import IQualifiedKey = weavejs.api.data.IQualifiedKey;
    import Bounds2D = weavejs.geom.Bounds2D;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    type ScatterPlotRecord = {
        id: IQualifiedKey;
        x: number;
        y: number;
        r: number;
        color: string;
    };
    type BoxWhiskerRecord = {
        id: IQualifiedKey;
        x: number;
        y: number;
    };
    type LinePlotRecord = {
        id: IQualifiedKey;
        x: number;
        y: number;
        grouBy: number;
    };
    interface BoxWhiskerPlotProps extends IVisToolProps, React.Props<BoxWhiskerPlot> {
    }
    interface BoxWhiskerPlotState extends IVisToolState {
        width?: number;
        height?: number;
    }
    class BoxWhiskerPlot extends AbstractVisTool<BoxWhiskerPlotProps, BoxWhiskerPlotState> {
        boxwhiskerX: DynamicColumn;
        boxwhiskerY: DynamicColumn;
        scatterX: DynamicColumn;
        scatterY: DynamicColumn;
        scatterRadius: AlwaysDefinedColumn;
        scatterColor: AlwaysDefinedColumn;
        lineX: DynamicColumn;
        lineY: DynamicColumn;
        lineGrouBy: DynamicColumn;
        private boxWhiskerXStats;
        private boxWhiskerYStats;
        private scatterXStats;
        private scatterYStats;
        private lineXStats;
        private lineYStats;
        dataBounds: Bounds2D;
        screenBounds: Bounds2D;
        xScale: Function;
        yScale: Function;
        private xAxisDataType;
        private yAxisDataType;
        title: string;
        private BOXWHISKER_RECORD_FORMAT;
        private LINE_RECORD_FORMAT;
        private SCATTER_RECORD_FORMAT;
        constructor(props: BoxWhiskerPlotProps);
        updateSVGSize: (resizingDiv: ResizingDiv, props: any, state: any, context: any) => void;
        renderScatterPlot(records: ScatterPlotRecord[]): JSX.Element;
        renderLinePlot(records: LinePlotRecord[]): JSX.Element;
        getPathStr(points: {
            x: number;
            y: number;
        }[]): string;
        getQ(values: number[], q: number): number;
        getYValues(key: IQualifiedKey): number[];
        renderBoxWhiskerPlot(records: BoxWhiskerRecord[]): JSX.Element;
        xAxisFormat: (num: any) => string;
        yAxisFormat: (num: any) => string;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.c3tool {
    import ToolTip = weavejs.ui.ToolTip;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import AbstractVisTool = weavejs.tool.AbstractVisTool;
    import C3Chart = weavejs.tool.c3tool.C3Chart;
    interface IAbstractC3ToolProps extends IVisToolProps {
        font?: string;
        fontSize?: number;
    }
    class AbstractC3Tool extends AbstractVisTool<IAbstractC3ToolProps, IVisToolState> {
        constructor(props: IVisToolProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        componentDidUpdate(): void;
        getMenuItems(): MenuItemProps[];
        validateSize(): void;
        render(): JSX.Element;
        protected toolTip: ToolTip;
        protected element: HTMLElement;
        protected chartComponent: C3Chart;
        protected chart: c3.ChartAPI;
        protected c3Config: c3.ChartConfiguration;
        private xAxisClass;
        private yAxisClass;
        private y2AxisClass;
        private busy;
        private debouncedHandleC3Selection;
        private debouncedHandleChange;
        protected mergeConfig(c3Config: c3.ChartConfiguration): void;
        private handleChange();
        protected handleC3Render(): void;
        protected handleC3Selection(): void;
        protected handleC3MouseOver(d: any): void;
        protected handleC3MouseOut(d: any): void;
        /**
         * @param forced true if chart generation should be forced
         * @return true if the chart should be (re)generated
         */
        protected validate(forced?: boolean): boolean;
        internalWidth: number;
        internalHeight: number;
        protected updateConfigMargin(): void;
        protected updateConfigAxisX(): void;
        protected updateConfigAxisY(): void;
        protected handlePointClick(event: MouseEvent): void;
        private cullAxis(axisSize, axisClass);
        protected cullAxes(): void;
        customStyle(array: Array<number>, type: string, filter: string, style: any): void;
        customSelectorStyle(array: Array<number>, selector: any, style: any): void;
        private _getCullingMetrics(size, axisClass);
        getInterval(classSelector: string, requiredValues: number): number;
        getFontString(): string;
        /**
         *
         * @param label
         * @param angle
         * @returns {number}
         */
        getRotatedLabelHeight(label: string, angle: number): number;
        /**
         * Truncate a string from the middle by 'adj' characters and replace with 'replacement'
         * @param str String to truncate.
         * @param adj Number of characters to remove from the middle.
         * @param replacement String to put in place of removed content.
         * @returns {string} The string that results from removing 'adj' characters and replacing with 'replacement'
         */
        centerEllipseString(str: string, adj: number, replacement: string): string;
        formatXAxisLabel(label: string, angle: number): string;
        formatYAxisLabel(label: string, angle: number): string;
    }
}
declare namespace weavejs.tool.c3tool {
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    class C3ScatterPlot extends AbstractC3Tool {
        dataX: DynamicColumn;
        dataY: DynamicColumn;
        radius: AlwaysDefinedColumn;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        xAxisLabelAngle: LinkableNumber;
        private radiusNorm;
        private radiusData;
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private keyToIndex;
        private xAxisValueToLabel;
        private yAxisValueToLabel;
        private dataXType;
        private dataYType;
        private records;
        protected c3ConfigYAxis: c3.YAxisConfiguration;
        constructor(props: IVisToolProps);
        protected handleC3MouseOver(d: any): void;
        protected handleC3Selection(): void;
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | api.core.ILinkableHashMap>;
        defaultPanelTitle: string;
        defaultXAxisLabel: string;
        defaultYAxisLabel: string;
        getAutomaticDescription(): string;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: Object;
    }
}
declare namespace weavejs.tool.c3tool {
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    class C3PieChart extends AbstractC3Tool {
        data: DynamicColumn;
        label: DynamicColumn;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        innerRadius: LinkableNumber;
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private keyToIndex;
        private records;
        constructor(props: IVisToolProps);
        protected handleC3MouseOver(d: any): void;
        protected handleC3Selection(): void;
        private updateStyle();
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | api.core.ILinkableHashMap>;
        defaultPanelTitle: string;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        getTitlesEditor(): React.ReactChild[][];
        deprecatedStateMapping: (Object | {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": FilteredKeySet;
                                "data": DynamicColumn;
                                "fill": SolidFillStyle;
                                "innerRadius": LinkableNumber;
                                "label": DynamicColumn;
                                "line": SolidLineStyle;
                                "labelAngleRatio": number;
                            };
                        };
                    };
                };
            };
        })[];
    }
}
declare namespace weavejs.tool.c3tool {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import LinkableString = weavejs.core.LinkableString;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    class C3LineChart extends AbstractC3Tool {
        columns: LinkableHashMap;
        line: SolidLineStyle;
        curveType: LinkableString;
        xAxisLabelAngle: LinkableNumber;
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private keyToIndex;
        private yAxisValueToLabel;
        private records;
        private columnLabels;
        private chartType;
        protected c3ConfigYAxis: c3.YAxisConfiguration;
        constructor(props: IVisToolProps);
        private getQKey(datum);
        protected handleC3MouseOver(d: any): void;
        protected handleC3Selection(): void;
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: (Object | {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": FilteredKeySet;
                                "columns": LinkableHashMap;
                                "curveType": LinkableString;
                                "lineStyle": SolidLineStyle;
                                "enableGroupBy": boolean;
                                "groupKeyType": string;
                                "normalize": boolean;
                                "shapeBorderAlpha": number;
                                "shapeBorderColor": number;
                                "shapeBorderThickness": number;
                                "shapeSize": number;
                                "shapeToDraw": string;
                                "zoomToSubset": boolean;
                            };
                        };
                    };
                };
            };
        })[];
    }
}
declare namespace weavejs.tool.c3tool {
    import ColorRamp = weavejs.util.ColorRamp;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import DynamicBinningDefinition = weavejs.data.bin.DynamicBinningDefinition;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    class C3Gauge extends AbstractC3Tool {
        meterColumn: DynamicColumn;
        binningDefinition: DynamicBinningDefinition;
        colorRamp: ColorRamp;
        private colStats;
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private keyToIndex;
        private records;
        constructor(props: IVisToolProps);
        protected updateConfigMargin(): void;
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | api.core.ILinkableHashMap>;
        getMarginEditor(): React.ReactChild[][];
        getTitlesEditor(): React.ReactChild[][];
        defaultPanelTitle: string;
        deprecatedStateMapping: (Object | {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": FilteredKeySet;
                                "meterColumn": DynamicColumn;
                                "colorRamp": ColorRamp;
                                "binningDefinition": DynamicBinningDefinition;
                            };
                        };
                    };
                };
            };
        })[];
    }
}
declare namespace weavejs.tool.c3tool {
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
    import ColorRamp = weavejs.util.ColorRamp;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    class C3BarChart extends AbstractC3Tool {
        heightColumns: LinkableHashMap;
        labelColumn: DynamicColumn;
        sortColumn: DynamicColumn;
        colorColumn: AlwaysDefinedColumn;
        chartColors: ColorRamp;
        groupingMode: LinkableString;
        legendPosition: LinkableString;
        horizontalMode: LinkableBoolean;
        showValueLabels: LinkableBoolean;
        showXAxisLabel: LinkableBoolean;
        xAxisLabelAngle: LinkableNumber;
        barWidthRatio: LinkableNumber;
        private verifyGroupingMode(mode);
        private verifyLegendPosition(position);
        private verifyBarRatio(ratio);
        yLabelColumn: IAttributeColumn;
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private yLabelColumnDataType;
        private heightColumnNames;
        private heightColumnsLabels;
        protected c3ConfigYAxis: c3.YAxisConfiguration;
        private records;
        constructor(props: IVisToolProps);
        private formatGetStringFromNumber;
        protected handleC3Selection(): void;
        protected handleC3MouseOver(d: any): void;
        private dataChanged();
        updateStyle(): void;
        defaultXAxisLabel: string;
        defaultYAxisLabel: string;
        getAutomaticDescription(): string;
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        getMarginEditor(): React.ReactChild[][];
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: Object;
    }
}
declare namespace weavejs.tool {
    import LinkableHashMap = weavejs.core.LinkableHashMap;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    class SessionStateMenuTool extends AbstractVisTool<IVisToolProps, IVisToolState> {
        selectedChoice: LinkableString;
        layoutMode: LinkableString;
        autoRecord: LinkableBoolean;
        choices: LinkableHashMap;
        targets: LinkableHashMap;
        panelTitle: LinkableString;
        pendingApply: Boolean;
        verifyLayoutMode(value: string): boolean;
        title: string;
        constructor(props: IVisToolProps);
        setTargetStates(states: any): void;
        getTargetStates: () => {
            [key: string]: LinkableDynamicObject[];
        };
        handleChoiceSelection: (selectedValue: any) => void;
        handleChoices: () => void;
        handleAutoRecord: () => void;
        recordSelectedChoice: () => void;
        options: {
            label: string;
            value: LinkableVariable;
        }[];
        renderEditor: () => JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool {
    import ScatterPlotPlotter = weavejs.plot.ScatterPlotPlotter;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    interface PIXIScatterPlotProps extends IVisToolProps {
    }
    interface PIXIScatterPlotState extends IVisToolState {
    }
    class PIXIScatterPlot extends AbstractVisTool<PIXIScatterPlotProps, PIXIScatterPlotState> {
        element: HTMLDivElement;
        renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
        graphics: PIXI.Graphics;
        stage: PIXI.Container;
        plotter: ScatterPlotPlotter;
        constructor(props: PIXIScatterPlotProps);
        componentDidMount(): void;
        componentDidUpdate(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.layout {
    import CSSProperties = React.CSSProperties;
    import WeaveComponentRenderer = weavejs.ui.WeaveComponentRenderer;
    import SmartComponent = weavejs.ui.SmartComponent;
    interface IWeaveToolProps extends React.Props<WeaveTool> {
        weave: Weave;
        path: string[];
        props?: any;
        maximized?: boolean;
        style?: CSSProperties;
        onGearClick?: (tool: WeaveTool) => void;
        onPopoutClick?: (tool: WeaveTool) => void;
        onPopinClick?: (tool: WeaveTool) => void;
    }
    interface IWeaveToolState {
        title?: string;
        showCaption?: boolean;
        caption?: string;
        hovered?: boolean;
        dragging?: boolean;
        highlightTitle?: boolean;
    }
    class WeaveTool extends SmartComponent<IWeaveToolProps, IWeaveToolState> {
        private watcher;
        private closeIcon;
        private gearIcon;
        private firstIcon;
        private lastIcon;
        constructor(props: IWeaveToolProps);
        handleTool: (wcr: WeaveComponentRenderer) => void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        componentDidUpdate(): void;
        update(): void;
        handleKeyDown: (event: __React.KeyboardEvent) => void;
        updateTitle(): void;
        updateCaption(): void;
        onGearClick: (event: __React.MouseEvent) => void;
        handleGear: () => void;
        onMaximizeClick: (event: __React.MouseEvent) => void;
        handleMaximize: () => void;
        onPopoutPopinClick: (event: __React.MouseEvent) => void;
        handlePopoutPopin: () => void;
        onCloseClick: (event: __React.MouseEvent) => void;
        handleClose: () => void;
        renderTitleBar(): JSX.Element;
        renderCaption(): JSX.Element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import WeaveTreeItem = weavejs.util.WeaveTreeItem;
    import SmartComponent = weavejs.ui.SmartComponent;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IGetMenuItems = weavejs.ui.menu.IGetMenuItems;
    interface ISessionStateEditorProps extends React.Props<SessionStateEditor> {
        rootObject: ILinkableObject;
        initialSelectedObject?: ILinkableObject;
    }
    interface ISessionStateEditorState {
        selectedNode: WeaveTreeItem;
    }
    class SessionStateEditor extends SmartComponent<ISessionStateEditorProps, ISessionStateEditorState> implements IGetMenuItems {
        static getTreeNode(object: ILinkableObject): WeaveTreeItem;
        static openInstance(context: React.ReactInstance, selectedObject: ILinkableObject): ControlPanel;
        constructor(props: ISessionStateEditorProps);
        selectedObject: ILinkableObject;
        selectedTreeNode: WeaveTreeItem;
        componentDidMount(): void;
        componentWillReceiveProps(props: ISessionStateEditorProps): void;
        private onSelect;
        private onDoubleClick;
        getMenuItems(): MenuItemProps[];
        /**
         * Displays a modal dialog and requests user input with OK/Cancel buttons
         * @param title dialog window title text
         * @param message dialog content text
         * @param defaultInput default value for text input box
         * @param inputValidator checked every time user modifies input and boolean result determines if the OK button should be enabled
         * @param inputHandler Called when user clicks OK button
         */
        private showInputDialog(title, message, defaultInput?, inputValidator?, inputHandler?);
        private newObject(parent, classDef);
        private canDeleteSelectedItem;
        private deleteSelectedItem;
        reportError(message: string): void;
        private treeDescriptor;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import IVisTool = weavejs.api.ui.IVisTool;
    interface WeaveToolEditorProps extends React.HTMLProps<WeaveToolEditor> {
        tool: IVisTool;
        onCloseHandler: (editor: WeaveToolEditor) => void;
    }
    interface WeaveToolEditorState {
        activeCrumb: string;
    }
    class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState> {
        private toolWatcher;
        tool: IVisTool;
        private displayName;
        private mapping_crumb_renderFn;
        private mapping_crumb_children_state;
        private crumbOrder;
        constructor(props: WeaveToolEditorProps);
        openSessionStateEditor: () => void;
        pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject?: any) => void;
        reset: () => void;
        componentWillReceiveProps(nextProps: WeaveToolEditorProps): void;
        private handleNewTool(tool);
        private isCrumbClicked;
        crumbClick: (crumbTitle: string, index: number) => void;
        stepBackInCrumbView: () => void;
        componentWillUpdate(): void;
        componentDidUpdate(): void;
        componentWillUnmount(): void;
        closeEditor: (event: __React.MouseEvent) => void;
        private activeEditor;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    interface MouseoverControllerProps extends React.Props<MouseoverController> {
        probedHeaderColumns: ILinkableHashMap;
        probedColumns: ILinkableHashMap;
    }
    interface MouseoverControllerState {
    }
    class MouseoverController extends React.Component<MouseoverControllerProps, MouseoverControllerState> {
        attributes: Map<string, ILinkableHashMap>;
        constructor(props: MouseoverControllerProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ColorColumn = weavejs.data.column.ColorColumn;
    import BinnedColumn = weavejs.data.column.BinnedColumn;
    import FilteredColumn = weavejs.data.column.FilteredColumn;
    interface ColorControllerProps extends React.Props<ColorController> {
        colorColumn: ColorColumn;
    }
    interface ColorControllerState {
    }
    class ColorController extends React.Component<ColorControllerProps, ColorControllerState> {
        tabLabels: string[];
        attributes: Map<string, IColumnWrapper>;
        constructor(props: ColorControllerProps);
        binnedColumn: BinnedColumn;
        dataColumn: FilteredColumn;
        handleFilterCheck: (value: boolean) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.tool.c3tool {
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import BinnedColumn = weavejs.data.column.BinnedColumn;
    import ColorColumn = weavejs.data.column.ColorColumn;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import SolidFillStyle = weavejs.plot.SolidFillStyle;
    import SolidLineStyle = weavejs.plot.SolidLineStyle;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import AbstractC3Tool = weavejs.tool.c3tool.AbstractC3Tool;
    import IColumnReference = weavejs.api.data.IColumnReference;
    class C3Histogram extends AbstractC3Tool {
        binnedColumn: BinnedColumn;
        columnToAggregate: DynamicColumn;
        aggregationMethod: LinkableString;
        fill: SolidFillStyle;
        line: SolidLineStyle;
        barWidthRatio: LinkableNumber;
        horizontalMode: LinkableBoolean;
        showValueLabels: LinkableBoolean;
        xAxisLabelAngle: LinkableNumber;
        private verifyBarRatio(ratio);
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        colorColumn: ColorColumn;
        private _callbackRecursion;
        private setColorColumn();
        private setBinnedColumn();
        private RECORD_FORMAT;
        private RECORD_DATATYPE;
        private histData;
        private keys;
        private records;
        protected c3ConfigYAxis: c3.YAxisConfiguration;
        internalColorColumn: ColorColumn;
        constructor(props: IVisToolProps);
        private getLabelString(num);
        defaultXAxisLabel: string;
        defaultYAxisLabel: string;
        private getYAxisLabel();
        protected handleC3Selection(): void;
        updateStyle(): void;
        private dataChanged();
        private getAggregateValue(records, columnToAggregateName, aggregationMethod);
        protected validate(forced?: boolean): boolean;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        defaultPanelTitle: string;
        updateColor(color: string): void;
        renderEditor: (pushCrumb: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: (Object | {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": FilteredKeySet;
                                "binnedColumn": BinnedColumn;
                                "columnToAggregate": DynamicColumn;
                                "aggregationMethod": LinkableString;
                                "fillStyle": SolidFillStyle;
                                "lineStyle": SolidLineStyle;
                                "drawPartialBins": boolean;
                                "horizontalMode": boolean;
                                "showValueLabels": boolean;
                                "valueLabelColor": number;
                                "valueLabelHorizontalAlign": string;
                                "valueLabelMaxWidth": number;
                                "valueLabelVerticalAlign": string;
                            };
                        };
                    };
                };
            };
        })[];
    }
}
declare namespace weavejs.tool.c3tool {
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import C3Histogram = weavejs.tool.c3tool.C3Histogram;
    class C3ColorHistogram extends C3Histogram {
        constructor(props: IVisToolProps);
        defaultPanelTitle: string;
    }
}
declare namespace weavejs.tool {
    import CSSProperties = React.CSSProperties;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IAttributeColumn = weavejs.api.data.IAttributeColumn;
    import DynamicColumn = weavejs.data.column.DynamicColumn;
    import FilteredKeySet = weavejs.data.key.FilteredKeySet;
    import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
    import LinkableNumber = weavejs.core.LinkableNumber;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import IColumnWrapper = weavejs.api.data.IColumnWrapper;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
    import IVisToolProps = weavejs.api.ui.IVisToolProps;
    import IVisToolState = weavejs.api.ui.IVisToolState;
    import IVisTool = weavejs.api.ui.IVisTool;
    import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
    class ColorLegend extends React.Component<IVisToolProps, IVisToolState> implements ILinkableObjectWithNewProperties, IVisTool, IInitSelectableAttributes {
        panelTitle: LinkableString;
        filteredKeySet: FilteredKeySet;
        selectionFilter: DynamicKeyFilter;
        probeFilter: DynamicKeyFilter;
        dynamicColorColumn: DynamicColumn;
        maxColumns: LinkableNumber;
        shapeSize: LinkableNumber;
        shapeType: LinkableString;
        showLegendName: LinkableBoolean;
        reverseOrder: LinkableBoolean;
        altText: LinkableString;
        element: HTMLElement;
        private colorColumn;
        private binnedColumn;
        private binningDefinition;
        private selectionKeySet;
        private probeKeySet;
        private toolTip;
        constructor(props: IVisToolProps);
        title: string;
        defaultPanelTitle: string;
        numberOfBins: number;
        getSelectedBins(): number[];
        getProbedBins(): number[];
        handleClick(bin: number, event: React.MouseEvent): void;
        handleProbe(bin: number, mouseOver: boolean, event: MouseEvent): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        getMenuItems(): MenuItemProps[];
        private cellBorderWidth;
        private cellPadding;
        getInteractionStyle(bin: number): CSSProperties;
        getCell(cellIndex: number, shapeSize: number, textStyle: React.CSSProperties): JSX.Element;
        render(): JSX.Element;
        selectableAttributes: Map<string, IColumnWrapper | ILinkableHashMap>;
        initSelectableAttributes(input: (IAttributeColumn | IColumnReference)[]): void;
        renderEditor: (pushCrumb?: (title: string, renderFn: () => JSX.Element, stateObject: any) => void) => JSX.Element;
        deprecatedStateMapping: Object;
    }
}
declare namespace weavejs.menu {
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    class ChartsMenu implements MenuBarItemProps {
        constructor(owner: IWeaveMenus);
        owner: IWeaveMenus;
        label: string;
        menu: MenuItemProps[];
        getCreateObjectItems(): {
            label: string;
            click: any;
        }[];
        static isBeta(impl: Class): boolean;
    }
}
declare namespace weavejs.editor {
    import SmartComponent = weavejs.ui.SmartComponent;
    import LinkableWatcher = weavejs.core.LinkableWatcher;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
    import LinkableString = weavejs.core.LinkableString;
    const PREVIEW: "preview";
    const METADATA: "metadata";
    const BROWSE: "browse";
    type View = typeof PREVIEW | typeof METADATA | typeof BROWSE;
    interface IDataSourceEditorProps {
        dataSource: IDataSource;
    }
    interface IDataSourceEditorState {
        selectedBranch?: IWeaveTreeNode & IColumnReference;
        selectedLeaf?: IWeaveTreeNode & IColumnReference;
        showPreviewView?: boolean;
        guideToTab?: string;
    }
    class DataSourceEditor extends SmartComponent<IDataSourceEditorProps, IDataSourceEditorState> {
        dataSourceWatcher: LinkableWatcher;
        protected weaveRoot: ILinkableHashMap;
        constructor(props: IDataSourceEditorProps);
        handleProps(props: IDataSourceEditorProps): void;
        componentWillReceiveProps(props: IDataSourceEditorProps): void;
        componentWillUnmount(): void;
        getLabelEditor(labelLinkableString: LinkableString): [React.ReactChild, React.ReactChild];
        editorFields: [React.ReactChild, React.ReactChild][];
        renderFields(): JSX.Element;
        private static nodeEqualityFunc(a, b);
        private static isNotGeometryList(node);
        renderPreviewView(): JSX.Element;
        renderConfigureView(): JSX.Element;
        getColumns: () => IColumnReference[];
        renderTablePreview: (columnRefs: IColumnReference[]) => JSX.Element;
        setSelection(props: IDataSourceEditorProps, newBranch: IWeaveTreeNode & IColumnReference, newLeaf: IWeaveTreeNode & IColumnReference): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    class SpatialJoinTransformEditor extends DataSourceEditor {
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    class GroupedDataTransformEditor extends DataSourceEditor {
        private isFiltered;
        private setFiltered;
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    class GeoJSONDataSourceEditor extends DataSourceEditor {
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    class ForeignDataMappingTransformEditor extends DataSourceEditor {
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    class DBFDataSourceEditor extends DataSourceEditor {
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    interface CensusRawDataset {
        c_dataset: string[];
        c_vintage: number;
        identifier: string;
        title: string;
        c_isAvailable: boolean;
    }
    interface ICensusDataSourceEditorState extends IDataSourceEditorState {
        dataFamily?: string;
        dataVintage?: string;
        geographies?: {
            value: string;
            label: string;
        }[];
        datasets?: CensusRawDataset[];
        optional?: string;
        requires?: string[];
    }
    class CensusDataSourceEditor extends DataSourceEditor {
        constructor(props: IDataSourceEditorProps);
        updateRequiresAndOptional: () => void;
        static isUsableFamily(family: string): boolean;
        static isInFamily(family: string, dataset: CensusRawDataset): boolean;
        static isOfVintage(vintage: string, dataset: CensusRawDataset): boolean;
        private api;
        state: ICensusDataSourceEditorState;
        private getDataFamilies();
        private getDataVintages(family);
        private getDatasets(family, vintage);
        private getDataset(datasetName);
        private getGeographies(dataSet);
        dataFamilyChanged: (selectedItem: any) => void;
        dataVintageChanged: (selectedItem: any) => void;
        editorFields: [React.ReactChild, React.ReactChild][];
        renderFields(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    class CachedDataSourceEditor extends DataSourceEditor {
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
    class CKANDataSourceEditor extends DataSourceEditor {
        private _dataSourceNode;
        constructor(props: IDataSourceEditorProps);
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.menu {
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import PopupWindow = weavejs.dialog.PopupWindow;
    class ControllersMenu implements MenuBarItemProps {
        constructor(owner: IWeaveMenus);
        owner: IWeaveMenus;
        label: string;
        openColorController: () => PopupWindow;
        openMouseOverController: () => PopupWindow;
        menu: MenuItemProps[];
        getCreateObjectItems(): {
            label: string;
            click: any;
        }[];
        static isBeta(impl: Class): boolean;
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
    import PopupWindow = weavejs.dialog.PopupWindow;
    class CSVDataSourceEditor extends DataSourceEditor {
        private _dataSourceNode;
        constructor(props: IDataSourceEditorProps);
        onUrlChange(): void;
        handleMetadataUpdate: (newMeta: {
            [key: string]: any;
        }, selectedIds: (number | string)[]) => void;
        handleProps(props: IDataSourceEditorProps): void;
        openMetadataEditor: () => PopupWindow;
        editorFields: [React.ReactChild, React.ReactChild][];
        renderChildEditor(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    class LocalFileOpenComponent extends React.Component<IOpenFileProps, IOpenFileState> {
        constructor(props: IOpenFileProps);
        handleFileChange: (event: React.FormEvent) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    interface GetStartedComponentProps extends React.HTMLProps<GetStartedComponent> {
        onViewSelect: (view: LandingPageView) => void;
        showInteractiveTourList?: boolean;
    }
    interface GetStartedComponentState {
        showInteractiveTourList?: boolean;
    }
    class GetStartedComponent extends React.Component<GetStartedComponentProps, GetStartedComponentState> {
        constructor(props: GetStartedComponentProps);
        componentWillReceiveProps(nextProps: GetStartedComponentProps): void;
        enableInteractiveTourList: () => void;
        private items;
        interactiveListItemClick: (itemName: string) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    class ConfirmationDialog {
        static open(context: React.ReactInstance, message: string, onOk?: () => void, onCancel?: () => void): void;
    }
}
declare namespace weavejs.admin {
    import PopupWindow = weavejs.dialog.PopupWindow;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    class ServiceLogin {
        service: WeaveAdminService;
        context: React.ReactInstance;
        login: Login;
        onSuccess: (username: string) => void;
        onCancel: () => void;
        constructor(context: React.ReactInstance, service: WeaveAdminService);
        open: (onSuccess?: (username: string) => void, onCancel?: () => void) => PopupWindow;
        private show;
        handleLogin: (fields: {
            username: string;
            password: string;
        }, onSuccess: (username: string) => void) => void;
        conditionalOpen(onSuccess?: (username: string) => void, onCancel?: () => void): void;
    }
}
declare namespace weavejs.menu {
    import ServiceLogin = weavejs.admin.ServiceLogin;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    interface IWeaveMenus {
        context: React.ReactInstance;
        weave: Weave;
        createObject: CreateObjectFunction;
        onFileLoaded: () => void;
        openDataManager: () => void;
        enableDataManagerItem: () => boolean;
        showFileMenu: boolean;
        login: ServiceLogin;
        fileMenu: {
            getSessionItems: () => MenuItemProps[];
        };
        dataMenu: {
            getExportItems: () => MenuItemProps[];
        };
        getMenuList: () => MenuItemProps[];
    }
    class IWeaveMenus {
    }
}
declare namespace weavejs.menu {
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IWeaveMenus = weavejs.menu.IWeaveMenus;
    class SystemMenu implements MenuBarItemProps {
        constructor(owner: IWeaveMenus);
        owner: IWeaveMenus;
        label: string;
        bold: boolean;
        menu: MenuItemProps[];
    }
}
declare namespace weavejs.dialog {
    import ServiceLogin = weavejs.admin.ServiceLogin;
    import SmartComponent = weavejs.ui.SmartComponent;
    class WeaveServerFileOpenComponent extends SmartComponent<IOpenFileProps, IOpenFileState> {
        element: Element;
        dimmerSelector: any;
        login: ServiceLogin;
        constructor(props: IOpenFileProps);
        handleSuccess: (fields: any) => void;
        getWeaveFiles: () => void;
        openLogin: () => void;
        handleCancel: () => void;
        componentDidMount(): void;
        componentDidUpdate(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
    import SmartComponent = weavejs.ui.SmartComponent;
    interface FileListItem {
        label: string;
        iconClass: string;
        isNewFile?: boolean;
    }
    interface IOpenFileProps {
        openHandler: (file: string | File) => void;
        context?: React.ReactInstance;
    }
    interface IOpenFileState {
        rejected?: boolean;
        fileInfo?: WeaveFileInfo;
        fileNames?: string[];
        allFiles?: boolean;
    }
    interface IFileDialogProps extends React.Props<FileDialog> {
        openHandler: (file: string | File) => void;
        skipConfirmation?: boolean;
        context: React.ReactInstance;
    }
    interface IFileDialogState {
        selected?: FileListItem;
    }
    class FileDialog extends SmartComponent<IFileDialogProps, IFileDialogState> {
        static NEW_SESSION: FileListItem;
        static MY_COMPUTER: FileListItem;
        static WEAVE_SERVER: FileListItem;
        static listItems: FileListItem[];
        static window: PopupWindow;
        static storageRegistry: Map<FileListItem, React.ComponentClass<IOpenFileProps>>;
        constructor(props: IFileDialogProps);
        confirmOpenHandler: (file: string | File) => void;
        componentDidMount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.menu {
    import PopupWindow = weavejs.dialog.PopupWindow;
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import WeaveArchive = weavejs.core.WeaveArchive;
    import IWeaveMenus = weavejs.menu.IWeaveMenus;
    class FileMenu implements MenuBarItemProps {
        constructor(owner: IWeaveMenus);
        owner: IWeaveMenus;
        label: string;
        bold: boolean;
        fileName: string;
        archive: WeaveArchive;
        menu: MenuItemProps[];
        openFileDialog: () => PopupWindow;
        getSessionItems(): MenuItemProps[];
        saveDialog(fileName: string, onSave: (newFileName: string) => void): void;
        /**
         * This function will update the progress given a meta object file name and a percentage progress
         *
         * @param meta The meta object containing the percentage and file name
         */
        updateProgressIndicator: (meta: {
            percent: number;
            currentFile: string;
        }) => void;
        openFile: (e: any) => void;
        /**
         * TEMPORARY SOLUTION until we have a place to register file type handlers
         * Ideally this list would be dynamically generated.
         * @return An Array of FileFilter objects
         */
        getSupportedFileTypes(dataFilesOnly?: Boolean): string[];
        map_url_file: Map<string, File>;
        load: (file_or_url: File | string, pushHistory?: boolean) => void;
        pushHistory(url: string): void;
        handleHistoryEvent: (event: PopStateEvent) => void;
        newSession: () => void;
        handleOpenedFile: (file: File, dataFilesOnly?: Boolean) => void;
        loadArchive(fileContent: Uint8Array): void;
        handleOpenedFileContent(fileName: string, fileContent: Uint8Array, dataFilesOnly?: Boolean): void;
        private findDataSource<T>(type, filter, create?);
        static buildBaseUrl: () => string;
        static buildUrl: (url: String) => string;
        private _saveToServer;
        saveToServer: () => void;
        private _saveFile;
        saveFile: () => void;
    }
}
declare namespace weavejs.admin {
    import SmartComponent = weavejs.ui.SmartComponent;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    interface ISqlImportProps extends React.HTMLProps<SqlImport> {
        service: WeaveAdminService;
        selectIdFunc: (id: number) => void;
    }
    interface ISqlImportState {
        append?: boolean;
        schema?: string;
        table?: string;
        displayName?: string;
        keyColumn?: string;
        keyColumnValid?: boolean;
        keyColumnTestInProgress?: boolean;
        keyType?: string;
        filteredKeyColumns?: string[];
        schemaOptions?: string[];
        tableOptions?: string[];
        columnOptions?: string[];
        keyTypeSuggestions?: string[];
        importInProgress?: boolean;
        errors?: string[];
    }
    class SqlImport extends SmartComponent<ISqlImportProps, ISqlImportState> {
        private login;
        constructor(props: ISqlImportProps);
        updateSchemas: () => void;
        updateTables: (schema: string) => void;
        updateColumns: (schema: string, table: string) => void;
        updateKeyTypeSuggestions: () => void;
        handleError: (error: any) => void;
        testKeyColumn: () => void;
        onImportClick: () => void;
        componentDidMount(): void;
        componentDidUpdate(prevProps: ISqlImportProps, prevState: ISqlImportState): void;
        private element;
        render(): JSX.Element;
    }
}
declare namespace weavejs.admin {
    interface ILoginProps extends React.Props<Login> {
        onLogin?: (fields: any) => void;
    }
    interface ILoginState {
    }
    class Login extends React.Component<ILoginProps, ILoginState> {
        element: Element;
        username: HTMLInputElement;
        password: HTMLInputElement;
        form: HTMLDivElement;
        constructor(props: ILoginProps);
        invalid(): void;
        componentDidMount(): void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.admin {
    import SmartComponent = weavejs.ui.SmartComponent;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    interface ILinkedInputProps {
        field: string;
        outerComponent: React.Component<any, any>;
        type?: string;
    }
    class LinkedInput extends React.Component<ILinkedInputProps, Object> {
        constructor(props: ILinkedInputProps);
        render(): JSX.Element;
    }
    interface IConnectionEditorProps {
        service: WeaveAdminService;
        connectionName: string;
        handleError: (error: any) => void;
        handleMessage: (message: string) => void;
        handleSuccessfulSave: (message: string, password: string) => void;
    }
    interface IConnectionEditorState {
        is_superuser?: boolean;
        name?: string;
        pass?: string;
        folderName?: string;
        passShow?: boolean;
        connectString?: string;
        editorMode?: string;
        dbServerAddress?: string;
        dbServerPort?: string;
        dbDatabaseName?: string;
        dbUsername?: string;
        dbPassword?: string;
        dbDomain?: string;
        dbPasswordShow?: boolean;
    }
    class ConnectionEditor extends SmartComponent<IConnectionEditorProps, IConnectionEditorState> {
        constructor(props: IConnectionEditorProps);
        componentWillReceiveProps(nextProps: IConnectionEditorProps): void;
        saveConnection: (overwrite: boolean) => void;
        loadFromConnection: (connectionName: string) => void;
        renderLinkedInput: (entry: [React.ReactElement<any> | string | number, string, string, React.ReactElement<any> | string | number, string]) => [React.ReactElement<any> | string | number, JSX.Element];
        connectString: string;
        private static DBNAME_MESSAGE;
        private static ADDRESS_MESSAGE;
        private static PORT_MESSAGE;
        render(): JSX.Element;
        /**
        * @param dbms The name of a DBMS (MySQL, PostGreSQL, Microsoft SQL Server)
        * @param ip The IP address of the DBMS.
        * @param port The port the DBMS is on (optional, can be "" to use default).
        * @param database The name of a database to connect to (can be "" for MySQL)
        * @param user The username to use when connecting.
        * @param pass The password associated with the username.
        * @param domain The domain paramter for a SQLServer connection.
        * @return A connect string that can be used in the getConnection() function.
        */
        static getConnectString(dbms: string, ip: string, port: string, database: string, user: string, pass: string, domain: string): string;
    }
}
declare namespace weavejs.admin {
    import SmartComponent = weavejs.ui.SmartComponent;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    interface IConfigurationStorageEditorProps {
        service: WeaveAdminService;
    }
    interface IConfigurationStorageEditorState {
        connectionNames?: string[];
        currentConnectionName?: string;
        connectionName?: string;
        connectionPassword?: string;
        schemaName?: string;
        showAdvancedOptions?: boolean;
        metadataIdFields?: string;
        errors?: string[];
        messages?: string[];
    }
    class ConfigurationStorageEditor extends SmartComponent<IConfigurationStorageEditorProps, IConfigurationStorageEditorState> {
        constructor(props: IConfigurationStorageEditorProps);
        updateCurrentConnection(): void;
        componentDidUpdate(): void;
        componentDidMount(): void;
        handleError: (error: any) => void;
        handleMessage: (message: string) => void;
        save: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.admin {
    import PopupWindow = weavejs.dialog.PopupWindow;
    import SmartComponent = weavejs.ui.SmartComponent;
    import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    interface IConnectionManagerProps {
        service: WeaveAdminService;
    }
    interface IConnectionManagerState {
        user?: string;
        errors?: string[];
        messages?: string[];
        connections?: string[];
        dbConfigInfo?: DatabaseConfigInfo;
        selected?: string;
    }
    class ConnectionManager extends SmartComponent<IConnectionManagerProps, IConnectionManagerState> {
        private login;
        constructor(props: IConnectionManagerProps);
        private element;
        componentDidMount(): void;
        handleError: (error: any) => void;
        handleMessage: (message: any) => void;
        updateConnectionsAndUser: () => void;
        private connectionToOption;
        createNewConnection: () => void;
        openConfigurationStorageEditor: () => PopupWindow;
        private handleSuccessfulSave;
        removeSelectedConnection: () => void;
        removeConnection: (connection: string) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor {
    import DataSourceEditor = weavejs.editor.DataSourceEditor;
    import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import PopupWindow = weavejs.dialog.PopupWindow;
    import WeaveAdminService = weavejs.net.WeaveAdminService;
    import IColumnReference = weavejs.api.data.IColumnReference;
    class WeaveDataSourceEditor extends DataSourceEditor {
        componentWillReceiveProps(props: IDataSourceEditorProps): void;
        onHierarchySelected: (selectedItems: (IWeaveTreeNode & IColumnReference)[]) => void;
        setHierarchySelection(): void;
        service: WeaveAdminService;
        private static getBaseUrl(serviceUrl);
        private selectId;
        openSqlImport: () => PopupWindow;
        openCsvImport: () => void;
        openConnectionManager: () => PopupWindow;
        editorFields: [React.ReactChild, React.ReactChild][];
    }
}
declare namespace weavejs.menu {
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    import MenuItemProps = weavejs.ui.menu.MenuItemProps;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveMenus = weavejs.menu.IWeaveMenus;
    import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
    class DataMenu implements MenuBarItemProps {
        constructor(owner: IWeaveMenus);
        owner: IWeaveMenus;
        label: string;
        menu: MenuItemProps[];
        getExportItems(): MenuItemProps[];
        static editorRegistry: Map<new (..._: any[]) => IDataSource, React.ComponentClass<IDataSourceEditorProps>>;
        static getDataSourceItems(weave: Weave, onCreateItem?: (dataSource: IDataSource) => void): MenuItemProps[];
        static isBeta(impl: new () => IDataSource): boolean;
        getColumnsToExport: () => any[];
        exportCSV: () => void;
    }
}
declare namespace weavejs.menu {
    import IWeaveMenus = weavejs.menu.IWeaveMenus;
    import ServiceLogin = weavejs.admin.ServiceLogin;
    import FileMenu = weavejs.menu.FileMenu;
    import SystemMenu = weavejs.menu.SystemMenu;
    import DataMenu = weavejs.menu.DataMenu;
    import ChartsMenu = weavejs.menu.ChartsMenu;
    import ControllersMenu = weavejs.menu.ControllersMenu;
    import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
    type CreateObjectFunction = (type: Class) => void;
    class WeaveMenus implements IWeaveMenus {
        context: React.ReactInstance;
        weave: Weave;
        createObject: CreateObjectFunction;
        onFileLoaded: () => void;
        openDataManager: () => void;
        enableDataManagerItem: () => boolean;
        showFileMenu: boolean;
        login: ServiceLogin;
        systemMenu: SystemMenu;
        fileMenu: FileMenu;
        chartsMenu: ChartsMenu;
        dataMenu: DataMenu;
        controllersMenu: ControllersMenu;
        constructor(context: React.ReactInstance, weave: Weave, createObject: CreateObjectFunction, onFileLoaded: () => void, openDataManager: () => void, enableDataManagerItem: () => boolean);
        getMenuList(): MenuBarItemProps[];
    }
}
declare namespace weavejs.ui.menu {
    import WeaveMenus = weavejs.menu.WeaveMenus;
    interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar> {
        style: React.CSSProperties;
        menus: WeaveMenus;
        weave: Weave;
    }
    interface WeaveMenuBarState {
    }
    class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState> {
        constructor(props: WeaveMenuBarProps);
        render(): JSX.Element;
    }
}
declare namespace weavejs.editor.manager {
    import IDataSource = weavejs.api.data.IDataSource;
    import FileMenu = weavejs.menu.FileMenu;
    interface IDataSourceManagerProps {
        weave: Weave;
        fileMenu?: FileMenu;
    }
    interface IDataSourceManagerState {
        selected?: IDataSource;
        rejected?: boolean;
    }
    class DataSourceManager extends React.Component<IDataSourceManagerProps, IDataSourceManagerState> {
        private selectedIndex;
        constructor(props: IDataSourceManagerProps);
        componentDidMount(): void;
        componentWillUnmount(): void;
        updateDataSources(): void;
        setSelectedDataSource: (dataSource: IDataSource) => void;
        getSelectedDataSource(): IDataSource;
        refreshDataSource(dataSource: IDataSource): void;
        removeDataSource(dataSource: IDataSource): void;
        handleDataFileDrop: (file: File) => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.app {
    import WeaveTool = weavejs.layout.WeaveTool;
    import AbstractLayout = weavejs.layout.AbstractLayout;
    import WeavePathArray = weavejs.util.WeavePathArray;
    import WeaveToolEditor = weavejs.editor.WeaveToolEditor;
    import TabLayout = weavejs.layout.TabLayout;
    import WeaveMenus = weavejs.menu.WeaveMenus;
    import LinkableWatcher = weavejs.core.LinkableWatcher;
    import LinkableBoolean = weavejs.core.LinkableBoolean;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import PanelRenderer = weavejs.layout.PanelRenderer;
    interface WeaveAppProps extends React.HTMLProps<WeaveApp> {
        rootApp?: WeaveApp;
        weave: Weave;
        renderPath?: WeavePathArray;
        readUrlParams?: boolean;
        showFileDialog?: boolean;
        forceMenuBar?: boolean;
        initializeTabs?: boolean;
        enableTour?: boolean;
        onClose?: () => void;
    }
    interface WeaveAppState {
        toolPathToEdit?: WeavePathArray;
        enableTour?: boolean;
    }
    class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState> {
        enableMenuBarWatcher: LinkableWatcher;
        menus: WeaveMenus;
        _popout_windows: Set<Window>;
        popout_windows: Set<Window>;
        static defaultProps: WeaveAppProps;
        constructor(props: WeaveAppProps);
        componentWillReceiveProps(props: WeaveAppProps): void;
        getRenderPath(): WeavePathArray;
        getRootLayoutPath(): WeavePathArray;
        getDefaultLayoutPath(): WeavePathArray;
        getRenderedComponent(): React.Component<any, any>;
        urlParams: {
            file: string;
            editable: boolean;
            layout: string;
        };
        openedFromAdminConsole: boolean;
        componentDidMount(): void;
        handleSideBarClose: (editor: WeaveToolEditor) => void;
        /**
         * This function will get called when the main WeaveApp gets unloaded
         */
        handleUnload: () => void;
        /**
         * This function will get called before the window unloads
         * and will provide a dialog giving the user a chance to cancel the unloading
         * @param event beforeunload event
         * @returns {string} the confirmation message
         */
        handleBeforeUnload: (event: BeforeUnloadEvent) => string;
        handleGearClick: (tool: WeaveTool) => void;
        restoreTabs: (tabLayoutPath: string[]) => void;
        handlePopoutClick: (layoutPath: string[], oldTabLayoutPath: string[]) => void;
        renderTab: (path: string[], panelProps: {
            maximized?: boolean;
        }, panelRenderer?: (id: string[], panelProps?: {
            maximized?: boolean;
        }, panelRenderer?: PanelRenderer) => JSX.Element) => JSX.Element;
        renderTool: (path: string[], panelProps: {
            maximized?: boolean;
        }, panelRenderer?: (id: string[], panelProps?: {
            maximized?: boolean;
        }, panelRenderer?: PanelRenderer) => JSX.Element) => JSX.Element;
        private toolSet;
        handleWeaveTool: (tool: WeaveTool) => void;
        enableDataManagerItem: () => boolean;
        openDataManager: () => void;
        createObject: (type: new (..._: any[]) => any) => void;
        prioritizeNumericColumns(columnRefs: Array<IWeaveTreeNode & IColumnReference>): IColumnReference[];
        tabLayout: TabLayout;
        private getTabLayouts();
        private getNonTabLayouts();
        private onSessionLoaded;
        private initializeTabs;
        addNewTab: (type?: typeof AbstractLayout) => void;
        removeExistingTab: (id: string[]) => void;
        onTabClick: (panelPath: string[], event: __React.MouseEvent) => void;
        componentWillUpdate(nextProps: WeaveAppProps, nextState: WeaveAppState): void;
        componentWillUnmount(): void;
        enableMenuBar: LinkableBoolean;
        render(): JSX.Element;
    }
}
declare namespace weavejs.dialog {
    import WeaveApp = weavejs.app.WeaveApp;
    type LandingPageView = "splash" | "default" | "file" | "tour list" | "tour";
    interface LandingPageProps {
        initialView: LandingPageView;
        weave: Weave;
        weaveAppRef: (weaveApp: WeaveApp) => void;
    }
    interface LandingPageState {
        view: LandingPageView;
    }
    class LandingPage extends React.Component<LandingPageProps, LandingPageState> {
        urlParams: any;
        constructor(props: LandingPageProps);
        loadGetStartedComponentWithTourList: () => void;
        render(): JSX.Element;
    }
}
declare namespace weavejs.util {
    class EmbedUtils {
        static getElementAndInstance(options: {
            element: string | Element;
            weaveInstance?: Weave;
        }): {
            element: Element;
            weave: Weave;
        };
        static select(keyType: string, localNames: string[]): void;
        static highlight(keyType: string, localNames: string[]): void;
        static embed(options: {
            element: string | Element;
            sessionUrl?: string;
            path?: string[];
            mode?: "splash" | "file" | "app" | "tool";
            weaveInstance?: Weave;
        }): Weave;
    }
}
