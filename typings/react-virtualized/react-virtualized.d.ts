// Type definitions for react-color.js 2.0
// Project: https://github.com/casesandberg/react-color/
// Definitions by: Zachary Maybury <https://github.com/zmaybury>

///<reference path="../react/react.d.ts"/>

declare module "react-virtualized" {
	import React = require("react");

	interface IFlexColumnProps {
		cellDataGetter?: (data:{ columnData: any, dataKey: string, rowData: any })=>any;
		cellRenderer?: (data: { cellData: any, columnData: any, dataKey: string, isScrolling: boolean, rowData: any, rowIndex: number }) => React.ReactChild;
		className?: string;
		columnData?: any;
		dataKey?: any;
		disableSort?: boolean;
		flexGrow?: number;
		flexShrink?: number;
		headerClassName?: string;
		headerRenderer?: Function;
		label?: string;
		maxWidth?: number;
		minWidth?: number;
		style?: React.CSSProperties;
		width: number;
	}

	class FlexColumn extends React.Component<IFlexColumnProps, any> {

	}

	interface IFlexTableProps {
		className?: string;
		disableHeader?: boolean;
		estimatedRowSize?: number;
		headerClassName?: string;
		headerHeight: number;
		headerStyle?: React.CSSProperties;
		height: number;
		noRowsRenderer?: () => JSX.Element;
		onHeaderClick?: (dataKey: string, columnData: any) => void;
		onRowClick?: (data: { index: number }) => void;
		onRowMouseOut?: (data: { index: number }) => void;
		onRowMouseOver?: (data: { index: number }) => void;
		onRowsRendered?: (data: { overscanStartIndex: number, overscanStopIndex: number, startIndex: number, stopIndex: number }) => void;
		overscanRowCount?: number;
		onScroll?: (data: { clientHeight: number, scrollHeight: number, scrollTop: number }) => void;
		rowClassName?: string | ((data:{ index: number })=>string);
		rowCount: number;
		rowHeight: number;
		rowGetter: (data: { index: number }) => any;
		rowStyle?: React.CSSProperties;
		rowWrapperClassName?: string | ((data: { index: number }) => string);
		rowWrapperStyle?: React.CSSProperties | ((data: { index: number }) => React.CSSProperties);
		scrollToAlignment?: "auto" | "start" | "end" | "center";
		scrollToIndex?: number;
		scrollTop?: number;
		sort?: (data:{ sortBy: string, sortDirection: string })=>void;
		sortDirection?: string;
		style?: React.CSSProperties;
		tabIndex?: number;
		width: number;
	}

	class FlexTable extends React.Component<IFlexTableProps,any> {

	}
}
