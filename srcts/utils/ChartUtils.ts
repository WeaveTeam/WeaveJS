import MiscUtils from "./MiscUtils";
import {ComboBoxOption} from "../semantic-ui/ComboBox";

export default class ChartUtils {
	public static getAxisLabelAngleChoices():ComboBoxOption[] {
		return MiscUtils.incrementalRange(-180, 15, 25).map((value:number, index:number) => {
			return {label: String(value), value}
		});
	}
}