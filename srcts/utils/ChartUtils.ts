import * as _ from "lodash";
import {ComboBoxOption} from "../semantic-ui/ComboBox";

export default class ChartUtils {
	public static getAxisLabelAngleChoices():ComboBoxOption[] {
		return _.range(-180, 180, 15).map((value:number, index:number) => {
			return {label: String(value), value}
		});
	}
}