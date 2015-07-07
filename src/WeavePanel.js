import jquery from "jquery";

function percentToNumber(percentString)
{
    if (percentString.endsWith("%"))
    {
        var percentValue = Number(percentString.substring(0, percentString.length - 1));
        return percentValue / 100.0;
    }
    else
    {
        return Number(percentString);
    }
}

export default class {
	constructor(parent, toolPath) {
		this.toolPath = toolPath;
        this.toolName = toolPath.getPath().pop();
		this.div = jquery(parent).append("<div>")
            .attr("id", this.toolName)
            .css("position", "relative")
            .css("top", percentToNumber(toolPath.getState("panelY")) * jquery(parent).height())
            .css("left", percentToNumber(toolPath.getState("panelX")) * jquery(parent).width())
            .css("height", percentToNumber(toolPath.getState("panelHeight")) * jquery(parent).height())
            .css("width", percentToNumber(toolPath.getState("panelWidth")) * jquery(parent).width())
            .css("borderStyle", "solid");
	}
}
