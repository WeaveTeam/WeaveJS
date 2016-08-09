namespace weavejs.ui.flexbox
{
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
			var className:string = classNames('weave-label', this.props.className);
			return <label {...this.props as React.HTMLAttributes} style={style} className={className}/>
		}
	}
}
