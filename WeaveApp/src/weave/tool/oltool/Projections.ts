import * as weavejs from "weavejs";
import * as ol from "openlayers";
import JSZip from "weave/modules/jszip";
import proj4 from "weave/modules/proj4";
import WeavePromise = weavejs.util.WeavePromise;
import URLRequest = weavejs.net.URLRequest;
import Bounds2D = weavejs.geom.Bounds2D;
import {WeaveAPI} from "weavejs";

export default class Projections
{
	static DEFAULT_PROJECTION:string = "EPSG:4326";

	private static projectionDbPromise = Projections.loadProjDatabase();

	static get projectionDbReadyOrFailed():boolean
	{
		return !!Projections.projectionDbPromise.getResult() || !!Projections.projectionDbPromise.getError();
	}

	static getProjection(projectionName:string):ol.proj.Projection
	{
		let proj = ol.proj.get(projectionName);
		if (!proj)
		{
			let error = Projections.projectionDbPromise.getError();
			let result = Projections.projectionDbPromise.getResult();

			if (!error && !result)
				console.error("ProjDatabase.zip not ready by the time it was needed.");

			if (error)
				console.error("Failed to retrieve ProjDatabase.zip, and using a non-default projection:", error);

			if (result && projectionName)
				console.error("Invalid projection selected:", projectionName);
		}

		return proj;
	}

	static loadProjDatabase():WeavePromise<boolean>
	{
		return WeaveAPI.URLRequestUtils.request(null, new URLRequest("ProjDatabase.zip")).then(
			(result: Uint8Array) => JSZip().loadAsync(result)
		).then(
			(zip: JSZip) => zip.file("ProjDatabase.json").async("string")
		).then(
			JSON.parse
		).then(
			(db: { [name: string]: string }) =>
			{
				for (let newProjName of Object.keys(db)) {
					let projDef = db[newProjName];
					if (projDef)
						proj4.defs(newProjName, projDef);
				}
				return true;
			}
		);
	}

	static projectionVerifier(value:string):boolean
	{
		return !!Projections.getProjection(value);
	}

	// TODO: Figure out why setting extent on the projections themselves breaks subsequent renders.
	static estimatedExtentMap = new Map<string,ol.Extent>();
	static getEstimatedExtent(proj:ol.proj.Projection):ol.Extent
	{
		let extentBounds:Bounds2D = new Bounds2D();
		let IOTA = Number("1e-10");
		if (!proj.getExtent())
		{
			let code = proj.getCode();
			if (Projections.estimatedExtentMap.get(code))
				return Projections.estimatedExtentMap.get(code);
			for (let lat = -180; lat < 180; lat++)
			{
				for (let long = -90; long < 180; long++)
				{
					let coord:ol.Coordinate = [long, lat];
					if (coord[0] == -180)
						coord[0] += IOTA;
					if (coord[0] == 180)
						coord[0] -= IOTA;
					if (coord[1] == -90)
						coord[1] += IOTA;
					if (coord[1] == 90)
						coord[1] -= IOTA;

					let projectedPoint = ol.proj.fromLonLat(coord, proj);
					extentBounds.includeCoords(projectedPoint[0], projectedPoint[1]);
				}
			}
			return Projections.estimatedExtentMap.set(code, extentBounds.getCoords()).get(code);
		}
		return proj.getExtent();
	}
}
