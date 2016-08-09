namespace weavejs.ui
{
	export interface CenteredIconProps extends React.HTMLProps<CenteredIcon>
	{
		iconProps?:React.HTMLProps<HTMLImageElement>
	}

	export interface CenteredIconState
	{
	}

	export class CenteredIcon extends React.Component<CenteredIconProps, CenteredIconState>
	{
		constructor(props:CenteredIconProps)
		{
			super(props)
		}

		render() 
		{
			return (
				<button
					{...this.props as any}
					className={classNames("weave-transparent-button", this.props.className || "weave-icon")}
				>
					{
						this.props.children || (
							<i
								aria-hidden={true}
								{...this.props.iconProps}
							/>
						)
					}
				</button>
			)
		}
	}
}
