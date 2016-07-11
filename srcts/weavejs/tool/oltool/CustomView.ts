import * as ol from "openlayers"

export default class CustomView extends ol.View
{
	enableResolutionConstraint: boolean = true;
	constrainResolution(resolution:number, opt_delta?:number, opt_direction?:number):number
	{
		if (this.enableResolutionConstraint || opt_delta !== undefined)
		{
			return super.constrainResolution(resolution, opt_delta, opt_direction);	
		}
		else
		{
			return resolution;
		}
	}
}