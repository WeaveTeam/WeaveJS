/// <reference path="../../typings/d3/d3.d.ts"/>

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
}
