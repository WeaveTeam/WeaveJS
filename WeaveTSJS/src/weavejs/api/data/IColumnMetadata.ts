namespace weavejs.api.data
{
	; /* Added to work around bug in sourcemap generation */
	export interface IColumnMetadata
	{
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