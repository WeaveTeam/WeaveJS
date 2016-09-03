namespace weavejs.api.data
{
	export interface IColumnMetadata
	{
		entityType?:string;
		title?:string;
		keyType?:string;
		dataType?:"number"|"string"|"date"|"geometry";
		projection?:string;
		aggregation?:string;
		dateFormat?:string;
		dateDisplayFormat?:string;
		overrideBins?:string;
		min?:number;
		max?:number;
		[key:string]:any;
	}
}