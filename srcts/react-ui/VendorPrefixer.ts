import {CSSProperties} from "react";
var react_prefixes:string[] = ["Moz", "Webkit", "ms"]; // ms or Ms ?
var dom_prefixes:string[] = ["Moz", "webKit", "ms"];

var vendorSpecificProperties:string[] = [];
var vendor:string;

function getVendorSpecificProperties():string[] {
	if(vendorSpecificProperties.length)
		return vendorSpecificProperties;
	else
	{
		var style:CSSStyleDeclaration = document.createElement("div").style;
		
		for(var property of Object.keys(style))
		{
			for(var prefix of dom_prefixes) {
				if(property.toLowerCase().startsWith(prefix)) {
					vendorSpecificProperties.push(property.replace(prefix, ""))
				}
			}
		}
		return vendorSpecificProperties;
	}
}

export default function prefixer(style:CSSProperties):CSSProperties {
	
	var newStyle:CSSProperties = {};
	for(var property of Object.keys(style))
	{
		var prefixIndex = getVendorSpecificProperties().indexOf(property);
		if(prefixIndex >= 0)
		{
			for(var prefix of react_prefixes)
				newStyle[prefix+property] = style[property];
		}
		else
		{
			newStyle[property] = style[property];
		}
	}
	return newStyle;
}
