namespace weavejs.ui.flexbox
{
	export class VBox extends React.Component<BoxProps<VBox>, {}>
	{
		static options = {
			flexDirection: 'column',
			unpaddedClassName: 'weave-vbox',
			paddedClassName: 'weave-padded-vbox'
		};

		render():JSX.Element
		{
			return BoxProps.renderBox(this.props, VBox.options);
		}
	}
}