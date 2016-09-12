namespace weavejs.api.data
{
	; /* Added to work around bug in sourcemap generation */
	export interface IGeoJSON
	{
		type?: string;
		crs?: {
			type?: string;
			properties?: {}
		};
		bbox?: number[];
	}

	export interface CRS
	{
		type?: "name"|"link",
	}
}