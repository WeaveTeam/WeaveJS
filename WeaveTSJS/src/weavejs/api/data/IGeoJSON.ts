namespace weavejs.api.data
{
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