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
        this.parent = parent;

        this.toolName = toolPath.getPath().pop();
        this.element = jquery("<div></div>").appendTo(parent).attr("id", this.toolName).css("borderStyle", "solid");

        ["panelY", "panelX", "panelHeight", "panelWidth", "maximized"].forEach(
            (item) => { this.toolPath.push(item).addCallback(this._panelChanged.bind(this), true, false); }
        , this);
    }

    _panelChanged() {
        var top, left, height, width;
        var toolPath = this.toolPath;
        var parent = this.parent;

        if (toolPath.getState("maximized"))
        {
            top = 0;
            left = 0;
            height = jquery(parent).height();
            width = jquery(parent).width();
        }
        else
        {
            top = percentToNumber(toolPath.getState("panelY")) * jquery(parent).height();
            left = percentToNumber(toolPath.getState("panelX")) * jquery(parent).width();
            height = percentToNumber(toolPath.getState("panelHeight")) * jquery(parent).height();
            width = percentToNumber(toolPath.getState("panelWidth")) * jquery(parent).width();
        }

        this.element.css("position", "relative")
            .css({top, left, height, width, "max-height": height, "max-width": width});
        this._updateContents();
    }
}
