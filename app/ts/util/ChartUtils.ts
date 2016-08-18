namespace weavejs.util
{
	import ComboBoxOption = weavejs.ui.ComboBoxOption;
	export class ChartUtils {
		public static getAxisLabelAngleChoices():ComboBoxOption[] {
			return _.range(-180, 180, 15).map((value:number, index:number) => {
				return {label: String(value), value}
			});
		}
	}
}
