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

	export interface ISparklinesLineProps {
		color?: string;

		style?: React.CSSProperties;
	}

	export class Sparklines extends React.Component<ISparklinesProps, {}>{ }

	export class SparklinesLine extends React.Component<ISparklinesLineProps, {}>{ }

	export class SparklinesReferenceLine extends React.Component<{ type: string }, {}>{ }

	export class SparklinesNormalBand extends React.Component<{}, {}>{ }

	export class SparklinesSpots extends React.Component<{}, {}>{ }

	export class SparklinesBars extends React.Component<ISparklinesLineProps, {}>{ }

	export class SparklinesCurve extends React.Component<ISparklinesLineProps, {}>{ }
}

declare module "react-sparklines" {
	export = sparkline;
}