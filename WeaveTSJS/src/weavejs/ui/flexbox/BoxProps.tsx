namespace weavejs.ui.flexbox
{
	export interface BoxProps <T> extends React.HTMLProps<T>
	{
		padded?:boolean;
		overflow?:boolean;
	}

	export class BoxProps<T>
	{
		static renderBox<T>(props:BoxProps<T>, options:{flexDirection:string, unpaddedClassName:string, paddedClassName:string}):JSX.Element
		{
			var attributes:React.HTMLAttributes = _.omit(props, 'padded', 'overflow');
			var style:React.CSSProperties = _.merge(
				{
					display: "flex",
				},
				props.style,
				{
					flexDirection: options.flexDirection
				}
			);
			var className:string = classNames(
				props.padded ? options.paddedClassName : options.unpaddedClassName,
				{"weave-auto-overflow": !props.overflow},
				props.className
			);
			return <div {...attributes} style={style} className={className}/>;
		}
	}
}
