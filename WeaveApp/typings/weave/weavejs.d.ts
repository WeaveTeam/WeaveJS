/// <reference path="../../typings/classnames/classnames.d.ts" />
/// <reference path="../../typings/jszip/jszip.d.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/moment/moment-node.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/openlayers/openlayers.d.ts" />
/// <reference path="../../typings/pixi.js/pixi.js.d.ts" />
/// <reference path="../../typings/proj4/proj4.d.ts" />
/// <reference path="../../typings/react-date-picker.d.ts" />
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
/// <reference path="../../typings/weave/as-types.d.ts" />
/// <reference path="../../typings/weave/weavejs-core.d.ts" />
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
    interface ProgressBarProps extends React.HTMLProps<HTMLDivElement> {
        progressValue?: number;
        total?: number;
        className?: string;
        style?: React.CSSProperties;
        visible: boolean;
    }
    function ProgressBar(props: ProgressBarProps): JSX.Element;
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
declare namespace weavejs.ui.flexbox {
    class Label extends React.Component<React.HTMLProps<Label>, {}> {
        render(): JSX.Element;
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
    function polyfill(window: any): void;
}
declare namespace weavejs.ui.layout.DirectionTypes {
    const VERTICAL: "vertical";
    const HORIZONTAL: "horizontal";
    type Direction = typeof HORIZONTAL | typeof VERTICAL;
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
declare namespace weavejs.css {
    import CSSProperties = React.CSSProperties;
    function prefixer(style: CSSProperties): CSSProperties;
}
declare namespace weavejs.ui.layout {
    import Direction = weavejs.ui.layout.DirectionTypes.Direction;
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
declare namespace weavejs.ui.layout {
    import Direction = weavejs.ui.layout.DirectionTypes.Direction;
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
declare namespace weavejs.ui.layout {
    import Direction = weavejs.ui.layout.DirectionTypes.Direction;
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
declare namespace weavejs.ui {
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
