namespace weavejs.ui.flexbox
{
	export class Section extends React.Component<BoxProps<Section>, {}>
	{
		static options = {
			flexDirection: "column",
			unpaddedClassName: classNames('weave-section', 'weave-vbox'),
			paddedClassName: classNames('weave-section', 'weave-padded-vbox')
		};

		render():JSX.Element
		{
			return BoxProps.renderBox(this.props, Section.options);
		}
	}
}