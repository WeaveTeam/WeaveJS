import * as d3 from "d3";

export default class FormatUtils
{
  // this function returns the default number formating.
	// for number values, we round them to at most 4 decimal places
	// unless the number is very small, in which case we just return it
  static defaultNumberFormatting(x:number):number|string
  {
    if (x < 0.0001)
    {
      return x;
    }
    else
    {
      return d3.format(",")(d3.round(x, 4));
    }
  }

  static defaultFileSizeFormatting(byteFileSize:number) {

    let i = -1;
    let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      byteFileSize = byteFileSize / 1024;
      i++;
    } while (byteFileSize > 1024);

    return Math.max(byteFileSize, 0.1).toFixed(1) + byteUnits[i];
  };


	static defaultFuzzyTimeAgoFormatting(date:Date) {

		let now:Date = new Date();
		var secondsBetween:number = Math.floor((now.getTime() - date.getTime()) / 1000);

		var ratio:number = Math.floor(secondsBetween / 31536000);

		if (ratio > 1) {
			return ratio + " " + Weave.lang("years");
		}
		ratio = Math.floor(secondsBetween / 2592000);
		if (ratio > 1) {
			return ratio + " " + Weave.lang("months");
		}
		ratio = Math.floor(secondsBetween / 86400);
		if (ratio > 1) {
			return ratio + " " + Weave.lang("days");
		}
		ratio = Math.floor(secondsBetween / 3600);
		if (ratio > 1) {
			return ratio + " " + Weave.lang("hours");
		}
		ratio = Math.floor(secondsBetween / 60);
		if (ratio > 1) {
			return ratio + " " + Weave.lang("minutes");
		}
		return Math.floor(secondsBetween) + " " + Weave.lang("seconds");
	}
}
