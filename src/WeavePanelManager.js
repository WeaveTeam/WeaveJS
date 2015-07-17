import jquery from "jquery";
import lodash from "lodash";
import WeavePanel from "./WeavePanel.js";

export default class WeavePanelManager {
	constructor(root, weave)
	{
		this.root = jquery(root);
		this.tools = {};
		this.weave = weave;
		var path = this.path = weave.path();

		var toolsChanged = this._toolsChanged.bind(this);
		path.getValue("childListCallbacks.addGroupedCallback")(null, toolsChanged, true);
	}

	_toolsChanged()
	{
		var toolNames = lodash.keys(this.tools);
		var newNames = this.path.getNames();

		var removedToolNames = lodash.difference(toolNames, newNames);
		var addedToolNames = lodash.difference(newNames, toolNames);

		removedToolNames.forEach(function (name) {
			this.tools[name].destroy();
			delete this.tools[name];
		}, this);

		addedToolNames.forEach(function (name) {
			var tool = WeavePanel.createTool(this.root, this.path.push(name));
			if (tool)
			{
				this.tools[name] = tool;
			}
		}, this);

		var zIndex = 0;
		for (let idx in newNames)
		{
			let tool = this.tools[newNames[idx]];

			if (!tool)
			{
				continue;
			}

			let modifier = 9000 * tool.toolPath.push("zOrder").getState();
			tool.element.css("z-index", zIndex + modifier);

			zIndex++;
		}
	}
}
