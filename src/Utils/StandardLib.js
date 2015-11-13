import _ from "lodash";
/**
 * This provides a set of useful static functions.
 * All the functions defined in this class are pure functions, meaning they always return the same result with the same arguments, and they have no side-effects.
 *
 * @author fkamayou
 */
export default class StandardLib {

	/**
	 * Searches for the first nested object with matching properties
	 * @param root The root Object.
	 * @param match Either an Object with properties to match, or a Function that checks for a match.
	 */
	static findDeep(root, match) {
		if (typeof match !== "function") {
			match = _.matches(match);
        }

		if (match(root)) {
			return root;
        }

		if (typeof root === "object")
		{
			for (var key in root)
			{
				var found = StandardLib.findDeep(root[key], match);
				if (found) {
					return found;
                }
			}
		}
	}

    /**
     * Adds undefined values to new state for properties in
     * current state not found in new state.
     */
     static includeMissingPropertyPlaceholders(currentState, newState) {

        for(var key in currentState) {
            if(!newState.hasOwnProperty(key)) {
                newState[key] = undefined;
            }
        }
        return newState;
     }

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


    static getDataBounds(column) {

        return {
            min: _.min(column),
            max: _.max(column)
        };
    }


		static resolveRelative(path, base) {
			// Upper directory
			if (path.startsWith("../")) {
				return StandardLib.resolveRelative(path.slice(3), base.replace(/\/[^\/]*$/, ""));
			}
			// Relative to the root
			if (path.startsWith("/")) {
				var match = base.match(/(\w*:\/\/)?[^\/]*\//) || [base];
				return match[0] + path.slice(1);
			}
			//relative to the current directory
			return base.replace(/\/[^\/]*$/, "") + "/" + path;
		}

    // // this function returns equally spaced bins given a number of bins
// // the bins are returned as an array of bin. each bin contains an array of records,
// // the bin bound (min and max) as well as the bin height computed using the aggregation function.
// // the aggregation function takes in records, binnedColumnName and returns a single value
// function simpleBinning(numberOfBins, records, binnedColumnName, columnToAggregateName, aggregationFunc) {
//     var column = lodash.pluck(records, binnedColumnName);
//     var columnMin = lodash.min(column);
//     var columnMax = lodash.max(column);

//     var binWidth = (columnMax - columnMin) / numberOfBins;

//     var bins = [];
//     var currentBinMin = columnMin;
//     var currentBinMax = columnMin + binWidth;

//     for(let i = 0; i < numberOfBins; i++) {

//         let bin = {};

//         bin.min = currentBinMin;
//         bin.max = currentBinMax;

//         bin.records = [];


//         for (let j in records) {
//             let record = records[j];
//             if(record[binnedColumnName] > currentBinMin && record[binnedColumnName] < currentBinMax) {
//                 bin.records.push(record);
//             }
//         }

//         // hack, we should really use
//         // interpolate color instead?
//         bin.color = bin.records[0] ? bin.records[0].fill.color : "#C0CDD1";

//         bins.push(bin);
//         currentBinMin = currentBinMax;
//         currentBinMax = currentBinMax + binWidth;
//     }

//     // add the column min and column max to first and last bin
//     records.forEach( (record) => {
//         if(record[binnedColumnName] === columnMin) {
//             bins[0].records.push(record);
//         } else if(record[binnedColumnName] === columnMax) {
//             bins[numberOfBins - 1].records.push(record);
//         }
//     });

//     bins.forEach((bin) => {
//         bin.height = aggregationFunc(bin.records, columnToAggregateName);
//     });
//     console.log(bins);
//     return bins;

// }
}
