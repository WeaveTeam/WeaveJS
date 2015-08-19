import jquery from "jquery";
import lodash from "lodash";

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

        this.plotManagerPath = toolPath.push("children", "visualization", "plotManager");
        this.toolName = toolPath.getPath().pop();
        this.element = jquery("<div></div>").appendTo(parent).attr("id", this.toolName)
            .css("borderStyle", "solid")
            .css("borderColor", "4D5258")
            .css("borderWidth", "2px")
            .css("background", "rgba(255, 255, 255, 1.0)")
            .css("position", "absolute");

        var boundFunc = lodash.debounce(this._panelChanged.bind(this), 100);

        jquery(window).resize(boundFunc);

        ["panelY", "panelX", "panelHeight", "panelWidth", "maximized", "zOrder", "panelBorderColor"].forEach(
            (item) => { this.toolPath.push(item).addCallback(boundFunc, true, false); }
        , this);

    }

    _panelChanged() {
        var top, left, height, width, zOrder;
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

        this.element.css("borderColor", toolPath.getState("panelBorderColor"));

        this.element.css("position", "absolute")
            .css({top, left, height, width, "max-height": height, "max-width": width})
            .css({"-webkit-transform": "translateZ(0)"}); /* In Webkit, forces the div to be a compositing layer. */
        this._updateContents();
    }

    destroy() {
        this.element.remove();
    }
}
