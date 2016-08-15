declare module sparkline {
	import React = __React;

	export interface ISparklinesProps {
		data: number[];

		limit?: number;

		width?: number;

		height?: number;

		margin?: number;

		min?: number;

		max?: number;
	}


	export interface ISparklinesNormalBandProps {
		style?: React.CSSProperties;
	}

	export interface ISparklinesSeriesProps extends ISparklinesNormalBandProps{
		color?: string;
	}

	export interface ISparklinesReferenceLineProps extends ISparklinesNormalBandProps{
		type?: string;
		value?: number;
	}

	export class Sparklines extends React.Component<ISparklinesProps, {}>{ }

	export class SparklinesLine extends React.Component<ISparklinesSeriesProps, {}>{ }

	export class SparklinesReferenceLine extends React.Component<ISparklinesReferenceLineProps, {}>{ }

	export class SparklinesNormalBand extends React.Component<ISparklinesNormalBandProps, {}>{ }

	export class SparklinesSpots extends React.Component<{}, {}>{ }

	export class SparklinesBars extends React.Component<ISparklinesSeriesProps, {}>{ }

	export class SparklinesCurve extends React.Component<ISparklinesSeriesProps, {}>{ }
}

declare module "react-sparklines" {
	export = sparkline;
}