function int(a:any):int
{
	return Math.floor(Number(a));
}

function uint(a:any):uint
{
	return Math.abs(Math.floor(Number(a)));
}