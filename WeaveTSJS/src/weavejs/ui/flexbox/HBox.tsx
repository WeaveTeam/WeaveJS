namespace weavejs.ui.flexbox
{
	export class HBox extends React.Component<BoxProps<HBox>, {}>
	{
		static options = {
			flexDirection: 'row',
			unpaddedClassName: 'weave-hbox',
			paddedClassName: 'weave-padded-hbox'
		};

		render():JSX.Element
		{
			return BoxProps.renderBox(this.props, HBox.options);
		}
	}
}
