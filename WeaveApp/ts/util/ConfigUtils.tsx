namespace weavejs.util
{
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils

	import LinkableNumber = weavejs.core.LinkableNumber;

	export class ConfigUtils {

		static renderNumberEditor(linkableNumber:LinkableNumber, flex:number):JSX.Element
		{
			var style:React.CSSProperties = {textAlign: "center", flex, minWidth: 60};
			return <StatefulTextField type="number" style={style} ref={WeaveReactUtils.linkReactStateRef(this, {value: linkableNumber})}/>;
		}

	}
}
