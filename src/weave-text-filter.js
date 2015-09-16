import {registerToolImplementation} from "./WeaveTool.jsx";
import jquery from "jquery";

export default class WeaveTextFilter {
	constructor (element, toolPath) {
		this.element = element;
		this._toolPath = toolPath;
		this._toolPath.push();
		this._setupProperties();
		this._title = jquery("<div></div>").addClass("vistitle").appendTo(element);
		this._textField = jquery("<input/>").attr("type", "text").appendTo(element);
		this._textField.change(this._entryChanged.bind(this));
	}

	_setupProperties() {
		this._filterPath = this._toolPath.push("filter").request("LinkableDynamicObject")
			.addCallback(this._filterChanged.bind(this), true);
	}

	_filterChanged() {
		var valuesPath = this._filterPath.push(null, "values");
		this._textField.val(valuesPath.getState()[0]);

		var columnPath = this._filterPath.push(null, "column");

		var title = columnPath.getValue("getMetadata('title')");
		this._title.text(title);
	}
	_entryChanged() {
		var valuesPath = this._filterPath.push(null, "values");
		var enabledPath = this._filterPath.push(null, "enabled");
		var value = this._textField.val();
		if (value && value.length)
		{
			valuesPath.state([value]);
			enabledPath.state(true);
		}
		else
		{
			enabledPath.state(false);
			valuesPath.state(null);
		}
	}

	_updateContents() {
		return;
	}

	destroy() {
		return;
	}


}

registerToolImplementation("weave.ui::DataFilterTool", WeaveTextFilter);

