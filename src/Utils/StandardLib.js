import _ from "lodash";
/**
 * This provides a set of useful static functions.
 * All the functions defined in this class are pure functions, meaning they always return the same result with the same arguments, and they have no side-effects.
 *
 * @author fkamayou
 */
export default class StandardLib {

    /**
     * Calculates an interpolated color for a normalized value.
     * @param normValue A Number between 0 and 1.
     * @param colors An Array or list of colors to interpolate between.  Normalized values of 0 and 1 will be mapped to the first and last colors.
     * @return An interpolated color associated with the given normValue based on the list of color values.
     */
     static interpolateColor(normValue, colors) {
        // handle an array of colors as the second parameter
        if (colors.length === 1 && Array.isArray(colors[0])) {
            colors = colors[0];
        }

        // handle invalid parameters
        if (normValue < 0 || normValue > 1 || colors.length === 0) {
            return NaN;
        }

        // find the min and max colors we want to interpolate between

        var maxIndex = Math.floor(colors.length - 1);
        var leftIndex = Math.floor(maxIndex * normValue);
        var rightIndex = Math.floor(leftIndex + 1);

        // handle boundary condition
        if (rightIndex === colors.length) {
            return parseInt(colors[leftIndex], 16);
        }

        var minColor = colors[leftIndex];
        var maxColor = colors[rightIndex];

        // normalize the norm value between the two norm values associated with the surrounding colors
        normValue = normValue * maxIndex - leftIndex;

        var percentLeft = 1 - normValue; // relevance of minColor
        var percentRight = normValue; // relevance of maxColor
        const R = 0xFF0000;
        const G = 0x00FF00;
        const B = 0x0000FF;
        return (
            ((percentLeft * (minColor & R) + percentRight * (maxColor & R)) & R) |
            ((percentLeft * (minColor & G) + percentRight * (maxColor & G)) & G) |
            ((percentLeft * (minColor & B) + percentRight * (maxColor & B)) & B)
        );
    }

    /**
     * This function converts a decimal number to a 6 digit hexadecimal string
     * @param dec A decimal number
     * @return the hexadecimal value of the decimal number
     */
    static decimalToHex(dec) {
        return _.padLeft(dec.toString(16), 6, "0");
    }

    /**
     * This function return the normalized value between a range
     * if no range is provided, the default range will be 0 and 1
     *
     * @param value The value to be normalized
     * @param min the range min value
     * @param max the range max value
     */
    static normalize(value, min, max) {

        if(!min) {
            min = 0;
        }
        if(!max) {
            max = 1;
        }
        return (value - min) / (max - min);
    }
}
