import * as _ from "lodash";
export default class StandardLib {
    static findDeep(root, match) {
        if (typeof match !== "function") {
            match = _.matches(match);
        }
        if (match(root)) {
            return root;
        }
        if (typeof root == "object") {
            var key;
            for (key in root) {
                var found = this.findDeep(root[key], match);
                if (found)
                    return found;
            }
        }
    }
    static includeMissingPropertyPlaceholders(currentState, newState) {
        var key;
        for (key in currentState) {
            if (!newState.hasOwnProperty(key)) {
                newState[key] = undefined;
            }
        }
        return newState;
    }
    static interpolateColor(normValue, ...colors) {
        if (colors.length === 1 && Array.isArray(colors[0])) {
            colors = colors[0];
        }
        if (normValue < 0 || normValue > 1 || colors.length === 0) {
            return NaN;
        }
        var maxIndex = Math.floor(colors.length - 1);
        var leftIndex = Math.floor(maxIndex * normValue);
        var rightIndex = Math.floor(leftIndex + 1);
        if (rightIndex === colors.length) {
            return parseInt(colors[leftIndex], 16);
        }
        var minColor = colors[leftIndex];
        var maxColor = colors[rightIndex];
        normValue = normValue * maxIndex - leftIndex;
        var percentLeft = 1 - normValue;
        var percentRight = normValue;
        const R = 0xFF0000;
        const G = 0x00FF00;
        const B = 0x0000FF;
        return (((percentLeft * (minColor & R) + percentRight * (maxColor & R)) & R) |
            ((percentLeft * (minColor & G) + percentRight * (maxColor & G)) & G) |
            ((percentLeft * (minColor & B) + percentRight * (maxColor & B)) & B));
    }
    static decimalToHex(dec) {
        return _.padLeft(dec.toString(16), 6, "0");
    }
    static normalize(value, min, max) {
        if (!min) {
            min = 0;
        }
        if (!max) {
            max = 1;
        }
        return (value - min) / (max - min);
    }
    static merge(into, obj) {
        var attr;
        for (attr in obj) {
            into[attr] = obj[attr];
        }
    }
    static resolveRelative(path, base) {
        if (path.startsWith("../")) {
            return StandardLib.resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ""));
        }
        if (path.startsWith("/")) {
            var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
            return match[0] + path.slice(1);
        }
        return base.replace(/\/[^\/]*$/, "") + "/" + path;
    }
    static getDataBounds(column) {
        return {
            min: _.min(column),
            max: _.max(column)
        };
    }
}
//# sourceMappingURL=StandardLib.js.map