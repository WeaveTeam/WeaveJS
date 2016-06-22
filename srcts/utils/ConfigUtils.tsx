import * as React from "react";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "./WeaveReactUtils";

import LinkableNumber = weavejs.core.LinkableNumber;

export default class ConfigUtils {

	static renderNumberEditor(linkableNumber:LinkableNumber, flex:number):JSX.Element
	{
		var style:React.CSSProperties = {textAlign: "center", flex, minWidth: 60};
		return <StatefulTextField type="number" style={style} ref={linkReactStateRef(this, {value: linkableNumber})}/>;
	}

}