import jquery from "jquery";
import lodash from "lodash";

/**
 * Weave panel manager "singleton" module
 */

var toolRegistry = null;
var tools = {};
var weaveRootElmt = null;
var weaveRootPath = null;

function _createTool(parent, path) {
    var ToolClass = toolRegistry[path.getType()];
    var tool;

    if (ToolClass)
    {
        tool = new ToolClass(parent, path);
    }
    return tool;
}

function _toolsChanged() {
    var toolNames = lodash.keys(tools);
    var newNames = weaveRootPath.getNames();

    var removedToolNames = lodash.difference(toolNames, newNames);
    var addedToolNames = lodash.difference(newNames, toolNames);

    removedToolNames.forEach(function (name) {
        tools[name].destroy();
        delete tools[name];
    });

    addedToolNames.forEach(function (name) {
        var tool = _createTool(weaveRootElmt, weaveRootPath.push(name));
        if (tool)
        {
            tools[name] = tool;
        }
    });

    var zIndex = 0;
    for (let idx in newNames)
    {
        let tool = tools[newNames[idx]];

        if (!tool)
        {
            continue;
        }

        let modifier = 9000 * tool.toolPath.push("zOrder").getState();
        tool.element.css("z-index", zIndex + modifier);

        zIndex++;
    }
}

// publicly exposed function
export function registerToolImplementation(asClassName, jsClass) {
    if (!toolRegistry)
    {
        toolRegistry = {};
    }
    toolRegistry[asClassName] = jsClass;
}

// publicly exposed function
// initialize the weave panel manager
// by setting up the callback.
export function init(root, weave) {
    weaveRootElmt = jquery(root);
    weaveRootPath = weave.path();
    weaveRootPath.getValue("childListCallbacks.addGroupedCallback")(null, _toolsChanged, true);
}
