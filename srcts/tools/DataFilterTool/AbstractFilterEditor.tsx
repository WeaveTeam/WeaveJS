/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";
import {DropdownButton, MenuItem} from "react-bootstrap";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export type FilterOption = {
	value:string|number, 
	label:string
}

export interface FilterEditorProps {

}

export interface FilterEditorState {

}

export default class AbstractFilterEditor extends React.Component<FilterEditorProps, FilterEditorState>
 													implements ILinkableObjectWithNewProperties {

	public showPlayButton:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.forceUpdate);
	public showToggle:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true), this.forceUpdate);
	public showToggleLabel:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.forceUpdate);
	
	public enabled:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
	public values:LinkableVariable;
	
	public filter:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher)
	
	protected options:FilterOption[];

	constructor(props:FilterEditorProps) {
		super(props);
		this.options = [];
	}
	
	getColumn():IAttributeColumn {
		return this.getFilter().column as IAttributeColumn;
	}

	setFilter(filter:ColumnDataFilter) {
		this.filter.target = filter;
	}

	getFilter():ColumnDataFilter {
		return this.filter.target as ColumnDataFilter;
	}
	componentDidMount() {

	}

	onChange(selectedValues:Object) {
		this.getFilter().values.state = selectedValues;
	}

	get deprecatedStateMapping():Object {
		return {
			"showPlayButton": this.showPlayButton,
			"showToggle": this.showToggle,
			"showToggleLabel": this.showToggleLabel,
			"enabled": this.enabled
		};
	}
}
