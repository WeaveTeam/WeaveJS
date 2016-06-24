import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import classNames from "../modules/classnames";

export interface BoxProps<T> extends React.HTMLProps<T>
{
	padded?:boolean;
	overflow?:boolean;
}

function renderBox<T>(props:BoxProps<T>, options:{flexDirection:string, unpaddedClassName:string, paddedClassName:string}):JSX.Element
{
	var attributes:React.HTMLAttributes = _.omit(props, 'padded', 'overflow');
	var style:React.CSSProperties = _.merge(
		{
			display: "flex",
			overflow: props.overflow ? "visible" : "auto"
		},
		props.style,
		{
			flexDirection: options.flexDirection
		}
	);
	var className:string = classNames(
		props.padded ? options.paddedClassName : options.unpaddedClassName,
		props.className
	);
	return <div {...attributes} style={style} className={className}/>;
}

export class HBox extends React.Component<BoxProps<HBox>, {}>
{
	static options = {
		flexDirection: 'row',
		unpaddedClassName: 'weave-hbox',
		paddedClassName: 'weave-padded-hbox'
	};
	
	render():JSX.Element
	{
		return renderBox(this.props, HBox.options);
	}
}

export class VBox extends React.Component<BoxProps<VBox>, {}>
{
	static options = {
		flexDirection: 'column',
		unpaddedClassName: 'weave-vbox',
		paddedClassName: 'weave-padded-vbox'
	};
	
	render():JSX.Element
	{
		return renderBox(this.props, VBox.options);
	}
}

export class Section extends React.Component<BoxProps<Section>, {}>
{
	static options = {
		flexDirection: "column",
		unpaddedClassName: classNames('weave-section', 'weave-vbox'),
		paddedClassName: classNames('weave-section', 'weave-padded-vbox')
	};
	
	render():JSX.Element
	{
		return renderBox(this.props, Section.options);
	}
}

export class Label extends React.Component<React.HTMLProps<Label>, {}>
{
	render():JSX.Element
	{
		var style = _.merge(
			{
				overflow: "hidden",
				textOverflow: "ellipsis"
			},
			this.props.style
		);
		return <label {...this.props as React.HTMLAttributes} style={style}/>
	}
}