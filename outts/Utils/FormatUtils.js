import * as d3 from "d3";
export default class FormatUtils {
    static defaultNumberFormatting(x) {
        if (x < 0.0001) {
            return x;
        }
        else {
            return d3.round(x, 4);
        }
    }
}
//# sourceMappingURL=FormatUtils.js.map